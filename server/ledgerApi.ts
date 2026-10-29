import {
  decodeCloudDocument,
  MAX_CLOUD_BYTES,
} from "../src/ledgerCloudData.ts";
import type { IncomingMessage, ServerResponse } from "node:http";

type ApiRequest = IncomingMessage & { body?: unknown };
type ApiResponse = Pick<ServerResponse, "setHeader" | "statusCode" | "end">;
type Session = {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
};
type ApiOptions = {
  env?: Record<string, string | undefined>;
  fetchImpl?: typeof fetch;
};

const ACCESS = "mytax_access",
  REFRESH = "mytax_refresh";
class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
export function createLedgerHandler({
  env = process.env,
  fetchImpl = fetch,
}: ApiOptions = {}) {
  const configured = () =>
    /^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(env.SUPABASE_URL || "") &&
    !!env.SUPABASE_ANON_KEY &&
    env.MYTAX_CLOUD_ENABLED === "true";
  return async (req: ApiRequest, res: ApiResponse) => {
    res.setHeader("Cache-Control", "private, no-store, max-age=0");
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("X-Content-Type-Options", "nosniff");
    const reply = (status: number, body: unknown) => {
      res.statusCode = status;
      res.end(JSON.stringify(body));
    };
    const protocol =
      req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
    const origin = env.MYTAX_APP_ORIGIN || `${protocol}://${req.headers.host}`;
    const secure = origin.startsWith("https:");
    const cookies = (session: Session | null) => {
      const cookie = (name: string, value: string, age: number) =>
        `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${age}${secure ? "; Secure" : ""}`;
      res.setHeader(
        "Set-Cookie",
        session
          ? [
              cookie(ACCESS, session.access_token, session.expires_in || 3600),
              cookie(REFRESH, session.refresh_token, 60 * 60 * 24 * 30),
            ]
          : [cookie(ACCESS, "", 0), cookie(REFRESH, "", 0)],
      );
    };
    const upstream = async (
      path: string,
      options: {
        method?: string;
        body?: string;
        headers?: Record<string, string>;
      } = {},
      token?: string,
    ) => {
      const result = await fetchImpl(`${env.SUPABASE_URL}${path}`, {
        ...options,
        signal: AbortSignal.timeout(12000),
        headers: {
          apikey: env.SUPABASE_ANON_KEY!,
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options.headers,
        },
      });
      const text = await result.text();
      let data;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        throw new ApiError(502, "บริการออนไลน์ตอบกลับไม่สมบูรณ์ โปรดลองใหม่");
      }
      return { ok: result.ok, status: result.status, data };
    };
    try {
      if (req.method === "GET") {
        reply(200, { configured: configured() });
        return;
      }
      if (req.method !== "POST") {
        res.setHeader("Allow", "GET, POST");
        throw new ApiError(405, "วิธีเรียกใช้ไม่รองรับ");
      }
      if (
        req.headers.origin !== origin ||
        req.headers["sec-fetch-site"] === "cross-site"
      )
        throw new ApiError(403, "กรุณาเปิดรายการนี้จาก MyTax โดยตรง");
      if (!String(req.headers["content-type"]).startsWith("application/json"))
        throw new ApiError(415, "รูปแบบคำขอไม่รองรับ");
      const actionBody = await readBody(req);
      if (actionBody.action === "logout" && !configured()) {
        cookies(null);
        reply(200, { ok: true });
        return;
      }
      if (!configured())
        throw new ApiError(
          503,
          "ยังไม่เปิดบริการสมุดเงินออนไลน์ ใช้ในเครื่องนี้ได้ก่อน",
        );
      const action = actionBody.action;
      if (["send-code", "verify-code"].includes(action)) {
        const email = actionBody.email;
        if (
          typeof email !== "string" ||
          email.length > 254 ||
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        )
          throw new ApiError(400, "กรอกอีเมลให้ครบ");
        if (action === "send-code") {
          if (actionBody.consent !== true)
            throw new ApiError(400, "อ่านและยืนยันการใช้สมุดเงินออนไลน์ก่อน");
          const result = await upstream("/auth/v1/otp", {
            method: "POST",
            body: JSON.stringify({ email, create_user: true }),
          });
          if (!result.ok)
            throw new ApiError(
              result.status === 429 ? 429 : 502,
              "ยังส่งรหัสไม่ได้ โปรดรอสักครู่แล้วลองใหม่",
            );
          reply(200, { ok: true });
          return;
        }
        if (!/^\d{6,8}$/.test(actionBody.code || ""))
          throw new ApiError(400, "กรอกรหัสจากอีเมลให้ครบ");
        const result = await upstream("/auth/v1/verify", {
          method: "POST",
          body: JSON.stringify({
            email,
            token: actionBody.code,
            type: "email",
          }),
        });
        if (
          !result.ok ||
          !result.data?.access_token ||
          !result.data?.refresh_token ||
          !result.data?.user?.id
        )
          throw new ApiError(401, "รหัสไม่ถูกต้องหรือหมดอายุ ขอรหัสใหม่ได้");
        cookies(result.data);
        reply(200, {
          user: { id: result.data.user.id, email: result.data.user.email },
        });
        return;
      }
      const incoming = Object.fromEntries(
        String(req.headers.cookie || "")
          .split(";")
          .map((part) => {
            const i = part.indexOf("=");
            return i < 0
              ? ["", ""]
              : [
                  part.slice(0, i).trim(),
                  decodeURIComponent(part.slice(i + 1)),
                ];
          }),
      );
      let token = incoming[ACCESS];
      let auth = token
        ? await upstream("/auth/v1/user", {}, token)
        : { ok: false, status: 401, data: null };
      if (!auth.ok && auth.status === 401 && incoming[REFRESH]) {
        const renewed = await upstream(
          "/auth/v1/token?grant_type=refresh_token",
          {
            method: "POST",
            body: JSON.stringify({ refresh_token: incoming[REFRESH] }),
          },
        );
        if (renewed.ok && renewed.data?.access_token) {
          token = renewed.data.access_token;
          cookies(renewed.data);
          auth = await upstream("/auth/v1/user", {}, token);
        } else if (renewed.status >= 500 || renewed.status === 429)
          throw new ApiError(503, "เชื่อมต่อบัญชีไม่ได้ชั่วคราว โปรดลองใหม่");
      }
      if (!auth.ok) {
        if (auth.status !== 401 && auth.status !== 403)
          throw new ApiError(503, "เชื่อมต่อบัญชีไม่ได้ชั่วคราว โปรดลองใหม่");
        cookies(null);
        if (action === "session" || action === "logout") {
          reply(200, action === "logout" ? { ok: true } : { user: null });
          return;
        }
        throw new ApiError(
          401,
          "เซสชันหมดอายุ โปรดเข้าสู่ระบบอีกครั้ง ข้อมูลในหน้านี้ยังอยู่",
        );
      }
      const user = { id: auth.data.id, email: auth.data.email };
      if (!/^[0-9a-f-]{36}$/i.test(user.id))
        throw new ApiError(502, "ข้อมูลบัญชีไม่สมบูรณ์");
      if (action === "session") {
        reply(200, { user });
        return;
      }
      if (action === "logout") {
        const result = await upstream(
          "/auth/v1/logout?scope=local",
          { method: "POST" },
          token,
        );
        if (!result.ok && ![401, 403].includes(result.status))
          throw new ApiError(503, "ยังออกจากระบบไม่ได้ โปรดลองอีกครั้ง");
        cookies(null);
        reply(200, { ok: true });
        return;
      }
      // Identity comes from verified Auth, never from a client-provided user ID.
      const table = `/rest/v1/ledger_documents?user_id=eq.${user.id}`;
      if (action === "load") {
        const result = await upstream(
          `${table}&select=document,revision`,
          {},
          token,
        );
        if (!result.ok || !Array.isArray(result.data))
          throw new ApiError(503, "อ่านสมุดเงินออนไลน์ไม่ได้ โปรดลองใหม่");
        reply(200, { record: result.data[0] || null, userId: user.id });
        return;
      }
      if (action === "save") {
        if (actionBody.userId !== user.id)
          throw new ApiError(
            409,
            "บัญชีเปลี่ยนแล้ว พักการบันทึกและเข้าสู่บัญชีเดิมก่อน",
          );
        const revision = actionBody.revision;
        if (!Number.isSafeInteger(revision) || revision < 0)
          throw new ApiError(400, "รุ่นข้อมูลไม่ถูกต้อง");
        let document;
        try {
          document = decodeCloudDocument(actionBody.document);
        } catch (error) {
          throw new ApiError(
            400,
            error instanceof Error ? error.message : "รูปแบบสมุดเงินไม่ถูกต้อง",
          );
        }
        const result = await upstream(
          revision === 0
            ? "/rest/v1/ledger_documents?select=revision"
            : `${table}&revision=eq.${revision}&select=revision`,
          {
            method: revision === 0 ? "POST" : "PATCH",
            headers: { Prefer: "return=representation" },
            body: JSON.stringify(
              revision === 0 ? { user_id: user.id, document } : { document },
            ),
          },
          token,
        );
        if (result.status === 409 || (result.ok && result.data?.length === 0))
          throw new ApiError(
            409,
            "ข้อมูลเปลี่ยนจากอีกเครื่องแล้ว สำรองหน้านี้ก่อนโหลดข้อมูลล่าสุด",
          );
        if (!result.ok || !Number.isSafeInteger(result.data?.[0]?.revision))
          throw new ApiError(
            503,
            "บันทึกออนไลน์ไม่สำเร็จ ข้อมูลยังอยู่ในหน้านี้",
          );
        reply(200, { revision: result.data[0].revision, userId: user.id });
        return;
      }
      throw new ApiError(400, "คำขอไม่รองรับ");
    } catch (error) {
      reply(error instanceof ApiError ? error.status : 503, {
        error:
          error instanceof ApiError
            ? error.message
            : "เชื่อมต่อออนไลน์ไม่ได้ ข้อมูลในหน้านี้ยังอยู่ โปรดลองใหม่",
      });
    }
  };
}
async function readBody(req: ApiRequest) {
  if (req.body !== undefined) {
    const raw =
      typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    if (Buffer.byteLength(raw) > MAX_CLOUD_BYTES + 4096)
      throw new ApiError(413, "ข้อมูลใหญ่เกิน 3 MB");
    try {
      const body = JSON.parse(raw);
      if (!body || typeof body !== "object" || Array.isArray(body))
        throw new Error();
      return body;
    } catch {
      throw new ApiError(400, "คำขอไม่สมบูรณ์");
    }
  }
  let raw = "",
    size = 0;
  for await (const chunk of req) {
    size += Buffer.byteLength(chunk);
    if (size > MAX_CLOUD_BYTES + 4096)
      throw new ApiError(413, "ข้อมูลใหญ่เกิน 3 MB");
    raw += chunk.toString();
  }
  try {
    const body = JSON.parse(raw);
    if (!body || typeof body !== "object" || Array.isArray(body))
      throw new Error();
    return body;
  } catch {
    throw new ApiError(400, "คำขอไม่สมบูรณ์");
  }
}
export default createLedgerHandler();

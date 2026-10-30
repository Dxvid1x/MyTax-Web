import { useRef, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Check,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { today, type Transaction } from "./ledger.ts";
import { followupNumbers } from "./moneyFollowup.ts";
import {
  FOLLOWUP_KEY,
  loadFollowup,
  parseFollowup,
  type FollowupDraft,
} from "./followupStorage.ts";
import { PlusOffer } from "./PlusOffer.tsx";
import "./plusOffer.css";
import "./moneyFollowup.css";
const money = (satang: number) =>
  new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 }).format(
    satang / 100,
  );
type Review = { date: string; available: number; note: string };
export function MoneyFollowup({
  transactions,
  onLedger,
}: {
  transactions: Transaction[];
  onLedger: () => void;
}) {
  const [initialRaw] = useState(() => {
    try {
      return localStorage.getItem(FOLLOWUP_KEY);
    } catch {
      return null;
    }
  });
  const expectedSaved = useRef(initialRaw);
  const [restored] = useState(() => parseFollowup(initialRaw));
  const [planMonth, setPlanMonth] = useState(
    restored?.month ?? today().slice(0, 7),
  );
  const [savedAt, setSavedAt] = useState(restored?.savedAt ?? "");
  const [demo, setDemo] = useState(!restored);
  const [workspaceOpen, setWorkspaceOpen] = useState(!!restored);
  const [week, setWeek] = useState(0);
  const [opening, setOpening] = useState(restored?.values[0] ?? "12000");
  const [bills, setBills] = useState(restored?.values[1] ?? "4000");
  const [reserve, setReserve] = useState(restored?.values[2] ?? "3000");
  const [payday, setPayday] = useState(restored?.values[6] ?? "28");
  const [emergency, setEmergency] = useState(restored?.values[3] ?? "30000");
  const [essential, setEssential] = useState(restored?.values[4] ?? "18000");
  const [monthly, setMonthly] = useState(restored?.values[5] ?? "3000");
  const [adjustment, setAdjustment] = useState(0);
  const [applied, setApplied] = useState(false);
  const [reviews, setReviews] = useState<Review[]>(restored?.reviews ?? []);
  const [notice, setNotice] = useState("");
  const asOf = demo
    ? `2026-10-${String(7 + week * 7).padStart(2, "0")}`
    : today();
  const monthRows = transactions.filter(
    (t) => t.date.slice(0, 7) === asOf.slice(0, 7) && t.date <= asOf,
  );
  const net = demo
    ? -week * 180000
    : monthRows.reduce(
        (sum, t) => sum + (t.type === "income" ? t.amount : -t.amount),
        0,
      );
  const amounts = [opening, bills, reserve, emergency, essential, monthly].map(
    (v) =>
      v.trim() && /^\d{1,9}(\.\d{1,2})?$/.test(v)
        ? Math.round(Number(v) * 100)
        : NaN,
  );
  const valid =
    amounts.every(Number.isSafeInteger) &&
    /^\d{1,2}$/.test(payday) &&
    Number(payday) >= 1 &&
    Number(payday) <= 31;
  const [start, pending, protectedMoney, saved, needs, contribution] = amounts;
  const cash = valid ? start + net : 0;
  const monthCurrent = demo || planMonth === today().slice(0, 7);
  const result =
    valid && monthCurrent
      ? followupNumbers(
          cash,
          pending,
          Math.max(0, protectedMoney - adjustment),
          Number(payday),
          asOf,
        )
      : null;
  const target = valid ? needs * 6 : 0;
  const gap = Math.max(0, target - (saved || 0));
  const months = contribution > 0 ? Math.ceil(gap / contribution) : null;
  const progress =
    target > 0 ? Math.min(100, Math.floor((saved / target) * 100)) : 0;
  const savePlan = () => {
    if (demo || !valid || !monthCurrent) return;
    const stamp = new Date().toISOString();
    const draft: FollowupDraft = {
      version: 1,
      month: planMonth,
      values: [
        opening,
        bills,
        String(Math.max(0, protectedMoney - adjustment) / 100),
        emergency,
        essential,
        monthly,
        payday,
      ],
      reviews,
      savedAt: stamp,
    };
    try {
      if (localStorage.getItem(FOLLOWUP_KEY) !== expectedSaved.current) {
        setNotice(
          "แผนในเครื่องเปลี่ยนจากอีกแท็บแล้ว ยังไม่เขียนทับ กรุณาโหลดหน้านี้ใหม่",
        );
        return;
      }
      if (expectedSaved.current && !parseFollowup(expectedSaved.current)) {
        setNotice(
          "ข้อมูลแผนเดิมอ่านไม่ได้ จึงไม่เขียนทับ ใช้จัดการข้อมูลเพื่อตรวจสำเนาเดิมก่อน",
        );
        return;
      }
      const encoded = JSON.stringify(draft);
      localStorage.setItem(FOLLOWUP_KEY, encoded);
      expectedSaved.current = encoded;
      setSavedAt(stamp);
      setNotice(
        "บันทึกแผนและจุดทบทวนในเบราว์เซอร์นี้แล้ว กดบันทึกอีกครั้งหลังเปลี่ยนแผน",
      );
    } catch {
      setNotice(
        "บันทึกไม่สำเร็จ เบราว์เซอร์อาจปิดกั้นพื้นที่จัดเก็บ แผนยังอยู่เฉพาะหน้านี้",
      );
    }
  };
  const changeMode = (next: boolean) => {
    if (next === demo) return;
    if (!next) {
      const savedDraft = loadFollowup();
      if (savedDraft) {
        try {
          expectedSaved.current = localStorage.getItem(FOLLOWUP_KEY);
        } catch {
          expectedSaved.current = null;
        }
        setDemo(false);
        setPlanMonth(savedDraft.month);
        setOpening(savedDraft.values[0]);
        setBills(savedDraft.values[1]);
        setReserve(savedDraft.values[2]);
        setEmergency(savedDraft.values[3]);
        setEssential(savedDraft.values[4]);
        setMonthly(savedDraft.values[5]);
        setPayday(savedDraft.values[6]);
        setReviews(savedDraft.reviews);
        setSavedAt(savedDraft.savedAt);
        setAdjustment(0);
        setApplied(false);
        setNotice("เปิดแผนที่บันทึกไว้แล้ว");
        return;
      }
    }
    setPlanMonth(today().slice(0, 7));
    setDemo(next);
    setWeek(0);
    setAdjustment(0);
    setApplied(false);
    setReviews([]);
    setNotice("");
    setOpening(next ? "12000" : "0");
    setBills(next ? "4000" : "0");
    setReserve(next ? "3000" : "0");
    setEmergency(next ? "30000" : "0");
    setEssential(next ? "18000" : "0");
    setMonthly(next ? "3000" : "0");
  };
  return (
    <section className="workspace money-followup">
      <PlusOffer
        onTry={(personal) => {
          setWorkspaceOpen(true);
          changeMode(!personal);
          requestAnimationFrame(() => {
            const el = document.getElementById("followup-workspace");
            el?.scrollIntoView({
              behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
                ? "auto"
                : "smooth",
              block: "start",
            });
            el?.focus({ preventScroll: true });
          });
        }}
      />
      <div hidden={!workspaceOpen} className="followup-workspace-body">
        <div className="followup-heading">
          <div>
            <span className="section-kicker">MYTAX PLUS · ต้นแบบ</span>
            <h2 id="followup-workspace" tabIndex={-1}>
              เงินเปลี่ยน แผนก็ต้องตามทัน
            </h2>
            <p>เช็กก่อนใช้ เห็นสิ่งที่เปลี่ยน แล้วเลือกปรับได้ด้วยตัวเอง</p>
          </div>
          <button className="secondary" onClick={onLedger}>
            เปิดสมุดเงิน <ArrowRight size={16} />
          </button>
        </div>
        <div className="followup-mode" role="group" aria-label="แหล่งข้อมูล">
          <button aria-pressed={demo} onClick={() => changeMode(true)}>
            ลองข้อมูลตัวอย่าง
          </button>
          <button aria-pressed={!demo} onClick={() => changeMode(false)}>
            ใช้รายการของฉัน
          </button>
          <span>
            {demo
              ? "ข้อมูลสมมติ · ไม่เปลี่ยนสมุดเงินจริง"
              : `ใช้ ${monthRows.length} รายการในเดือนนี้ · ต้องยืนยันยอดต้นเดือนเอง`}
          </span>
        </div>
        <p className="followup-disclosure">
          รุ่นทดลอง ไม่มีการเรียกเก็บเงิน ไม่เชื่อมบัญชีธนาคาร
          ข้อมูลการเงินเก็บในเครื่องเมื่อคุณกดบันทึกเท่านั้น ไม่เข้ารหัส
          และไม่ซิงก์ข้ามเครื่อง
        </p>
        {!demo && (
          <div className="followup-savebar">
            <div>
              <strong>
                {savedAt ? "มีสำเนาแผนในเครื่องนี้" : "แผนยังไม่บันทึก"}
              </strong>
              <small>
                {savedAt
                  ? "สำเนาล่าสุด: " + new Date(savedAt).toLocaleString("th-TH")
                  : "บันทึกแล้วกลับมาทบทวนต่อได้ ไม่กระทบการบันทึกสมุดเงิน"}
              </small>
            </div>
            <button
              className="primary"
              disabled={!valid || !monthCurrent}
              onClick={savePlan}
            >
              บันทึกแผน Plus ในเครื่อง
            </button>
          </div>
        )}
        {!monthCurrent && (
          <div className="followup-month-review" role="alert">
            <h2>ถึงเวลาตรวจแผนเดือนใหม่</h2>
            <p>
              แผนนี้เป็นของ {planMonth}{" "}
              จึงยังไม่ใช้ยอดต้นเดือนเก่าคำนวณเดือนปัจจุบัน
            </p>
            <button
              className="secondary"
              onClick={() => {
                setPlanMonth(today().slice(0, 7));
                setOpening("0");
                setBills("0");
                setReserve("0");
                setAdjustment(0);
                setApplied(false);
                setNotice(
                  "เริ่มรอบเดือนใหม่แล้ว ยืนยันยอดต้นเดือนและบิลก่อนบันทึก เป้าหมายและประวัติยังอยู่",
                );
              }}
            >
              เริ่มรอบเดือนนี้และยืนยันยอดใหม่
            </button>
          </div>
        )}
        <div className="followup-toolbar">
          <span>
            <CalendarDays size={16} /> ณ {asOf}
          </span>
          {demo && (
            <button
              className="secondary"
              onClick={() => {
                setWeek((w) => (w + 1) % 4);
                setNotice(
                  "เปลี่ยนเวลาและรายจ่ายสมมติแล้ว ยอดกันเงินและประวัติทบทวนเดิมยังคงอยู่",
                );
              }}
            >
              ทดลองสัปดาห์ถัดไป
            </button>
          )}
        </div>
        <details className="followup-setup" open={!demo}>
          <summary>ยืนยันตัวเลขตั้งต้นและเป้าหมาย</summary>
          <p>
            ยอดต้นเดือนคือเงินที่มีอยู่ก่อนรายการเดือนนี้
            บิลที่ยังไม่จ่ายต้องไม่รวมรายการที่จ่ายแล้วในสมุดเงิน
            เงินกันเป้าหมายเป็นเพียงแผน ไม่ใช่เงินที่ออมสำเร็จ
          </p>
          <div className="followup-fields">
            {[
              ["เงินใช้ได้ต้นเดือน", opening, setOpening],
              ["บิลที่ยังไม่จ่ายก่อนวันเงินเข้า", bills, setBills],
              ["เงินที่กันไว้ให้เป้าหมายรอบนี้", reserve, setReserve],
              ["เงินฉุกเฉินที่มีแล้ว", emergency, setEmergency],
              ["รายจ่ายจำเป็นและหนี้ขั้นต่ำต่อเดือน", essential, setEssential],
              ["ตั้งใจเติมเงินฉุกเฉินต่อเดือน", monthly, setMonthly],
              ["วันเงินเข้าของเดือน (1–31)", payday, setPayday],
            ].map(([label, value, setter]) => (
              <label key={String(label)}>
                {String(label)}
                <input
                  inputMode="decimal"
                  value={String(value)}
                  onChange={(e) => {
                    (setter as (v: string) => void)(e.target.value);
                    setAdjustment(0);
                    setApplied(false);
                  }}
                />
              </label>
            ))}
          </div>
        </details>
        {!valid && (
          <p className="error-text" role="alert">
            ใส่จำนวนเงินตั้งแต่ 0 ทศนิยมไม่เกิน 2 ตำแหน่ง และวันเงินเข้า 1–31
          </p>
        )}
        {result && (
          <>
            <div className="followup-dashboard">
              <section className="followup-runway">
                <span>
                  <Wallet size={17} /> ยังจัดสรรใช้ได้ก่อนเงินเข้า
                </span>
                <strong className={result.shortfall ? "value-negative" : ""}>
                  {money(result.available)} <small>บาท</small>
                </strong>
                <p>
                  {result.shortfall
                    ? `แผนยังขาด ${money(result.shortfall)} บาท ต้องปรับก่อนใช้เพิ่ม`
                    : `ประมาณ ${money(result.daily)} บาท/วัน ใน ${result.days} วันที่เหลือ`}
                </p>
                <div className="followup-breakdown">
                  <span>
                    เงินตามข้อมูลรอบนี้ <b>{money(cash)}</b>
                  </span>
                  <span>
                    หักบิลที่ยังไม่จ่าย <b>−{money(pending)}</b>
                  </span>
                  <span>
                    หักเงินกันเป้าหมาย{" "}
                    <b>−{money(Math.max(0, protectedMoney - adjustment))}</b>
                  </span>
                </div>
                <small>
                  วันเงินเข้าถัดไป {result.payday} ·
                  เป็นประมาณการจากข้อมูลที่กรอก
                  ไม่ใช่ยอดธนาคารหรือคำรับรองว่าใช้ได้อย่างปลอดภัย
                </small>
              </section>
              <section className="followup-next">
                <span className="section-kicker">สิ่งที่ควรดูรอบนี้</span>
                <h2>
                  {result.shortfall
                    ? "เงินรอบนี้ไม่พอตามแผน"
                    : week > 0 && demo
                      ? "รายจ่ายเพิ่ม งบต่อวันเปลี่ยนแล้ว"
                      : "ตรวจเงินที่กันไว้ ก่อนใช้เพิ่ม"}
                </h2>
                <p>
                  {demo
                    ? `ผ่านไป ${week + 1} สัปดาห์ มีรายจ่ายจำลองสะสม ${money(-net)} บาท ลองเลื่อนเวลาแล้วดูงบที่เปลี่ยน`
                    : "รายการอาจยังไม่ครบทุกบัญชี ตรวจยอดต้นเดือน บิลที่ค้าง และเงินที่กันไว้ก่อนเชื่อยอดนี้"}
                </p>
                <div className="followup-scenario">
                  <h3>ลองผ่อนเป้าหมายรอบนี้</h3>
                  <p>
                    ลดเงินที่กันไว้ 500 บาท เงินใช้ได้จะเพิ่ม 500 บาท
                    แต่เงินสำหรับเป้าหมายรอบนี้จะลดลงเท่ากัน
                    ไม่ได้ทำให้คุณมีรายได้เพิ่ม
                  </p>
                  <button
                    className="secondary"
                    disabled={applied || protectedMoney < 50000}
                    onClick={() => {
                      setAdjustment(50000);
                      setApplied(true);
                      setNotice(
                        "ปรับเฉพาะแผนกันเงิน 500 บาท ไม่เปลี่ยนยอดออมจริงหรือสมุดเงิน",
                      );
                    }}
                  >
                    ใช้ทางเลือกนี้
                  </button>
                  {applied && (
                    <button
                      className="text-button"
                      onClick={() => {
                        setAdjustment(0);
                        setApplied(false);
                        setNotice("คืนแผนเดิมแล้ว");
                      }}
                    >
                      คืนแผนเดิม
                    </button>
                  )}
                </div>
              </section>
            </div>
            <section className="followup-pulse">
              <div>
                <span className="section-kicker">สัญญาณจากรายการ</span>
                <h2>
                  {demo
                    ? "อาหารและเดินทางเป็นตัวอย่างรายจ่ายรอบนี้"
                    : monthRows.some((t) => t.type === "expense")
                      ? "หมวดที่ควรกลับไปดู"
                      : "ยังไม่มีรายจ่ายให้วิเคราะห์ในเดือนนี้"}
                </h2>
                <p>
                  {demo
                    ? "รายจ่ายจำลองเพิ่มสัปดาห์ละ 1,800 บาท ลองดูผลต่อเงินก่อนวันเงินเข้า"
                    : (() => {
                        const totals = new Map<string, number>();
                        for (const t of monthRows)
                          if (t.type === "expense")
                            totals.set(
                              t.category,
                              (totals.get(t.category) ?? 0) + t.amount,
                            );
                        const top = [...totals].sort((a, b) => b[1] - a[1])[0];
                        return top
                          ? top[0] +
                              " รวม " +
                              money(top[1]) +
                              " บาท จากรายการที่มี ไม่ได้หมายความว่าเป็นรายจ่ายไม่จำเป็น"
                          : "เพิ่มรายการหรือนำเข้า Statement แล้วกลับมาเช็กได้ ยอดศูนย์ไม่ได้แปลว่าไม่มีรายจ่ายจริง";
                      })()}
                </p>
                <button className="text-button" onClick={onLedger}>
                  ตรวจรายการในสมุดเงิน →
                </button>
              </div>
              <div>
                <span className="section-kicker">เทียบจุดทบทวนล่าสุด</span>
                <h2>
                  {reviews.length
                    ? (result.available >= reviews[0].available ? "+" : "") +
                      money(result.available - reviews[0].available) +
                      " บาท"
                    : "เริ่มเก็บจุดทบทวนแรก"}
                </h2>
                <p>
                  {reviews.length
                    ? "เงินยังจัดสรรได้ เปลี่ยนจาก " +
                      reviews[0].date +
                      " อาจมาจากรายการ บิล หรือการปรับแผน ไม่ใช่กำไรจากการลงทุน"
                    : "เมื่อกลับมาอีกครั้ง จะเห็นว่าเงินที่ยังจัดสรรได้เพิ่มหรือลดจากจุดที่คุณเคยทบทวน"}
                </p>
              </div>
            </section>
            <section className="followup-goal">
              <div>
                <span className="section-kicker">เป้าหมายที่ติดตาม</span>
                <h2>เงินฉุกเฉิน 6 เดือน</h2>
                <p>
                  เป้า {money(target)} บาท
                  จากค่าใช้จ่ายจำเป็นและหนี้ขั้นต่ำที่คุณกรอก
                </p>
              </div>
              <div className="followup-goal-progress">
                <strong>{progress}%</strong>
                <progress
                  value={Math.min(saved, target)}
                  max={target || 1}
                  aria-label="ความคืบหน้าเงินฉุกเฉิน"
                />
                <span>
                  มีแล้ว {money(saved)} · ขาดอีก {money(gap)} บาท
                </span>
                <small>
                  {gap === 0
                    ? "ถึงยอดเป้าหมายที่ตั้งไว้แล้ว"
                    : months === null
                      ? "ยังคำนวณวันครบไม่ได้ เพราะยังไม่กำหนดยอดเติม"
                      : `ประมาณ ${months} เดือน ถ้าเติมเดือนละ ${money(contribution)} บาท โดยไม่ถอนและไม่คิดผลตอบแทน`}
                </small>
              </div>
            </section>
            <section className="followup-review">
              <div>
                <h2>กลับมาแล้วรู้ว่าเปลี่ยนอะไร</h2>
                <p>เก็บจุดทบทวนแล้วกดบันทึกแผน เพื่อกลับมาเทียบครั้งถัดไป</p>
              </div>
              <button
                className="primary"
                onClick={() => {
                  setReviews((old) =>
                    [
                      {
                        date: asOf,
                        available: result.available,
                        note: adjustment
                          ? "ผ่อนเงินกันเป้าหมาย 500 บาท"
                          : "คงเงินกันเป้าหมายเดิม",
                      },
                      ...old,
                    ].slice(0, 12),
                  );
                  setNotice(
                    demo
                      ? "บันทึกจุดทบทวนตัวอย่างแล้ว ไม่เก็บลงแผนจริง"
                      : "เพิ่มจุดทบทวนแล้ว กดบันทึกแผน Plus เพื่อเก็บไว้ในเครื่อง",
                  );
                }}
              >
                <Check size={16} /> ทบทวนรอบนี้แล้ว
              </button>
              {reviews.length ? (
                <ol>
                  {reviews.map((r, i) => (
                    <li key={i}>
                      <span>
                        {r.date} · {r.note}
                      </span>
                      <strong>{money(r.available)} บาท</strong>
                      {i < reviews.length - 1 && (
                        <small>
                          ต่างจากครั้งก่อน{" "}
                          {money(r.available - reviews[i + 1].available)} บาท
                        </small>
                      )}
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="followup-empty">
                  ยังไม่มีจุดทบทวน ลองบันทึกแล้วเปลี่ยนสัปดาห์เพื่อเทียบผล
                </p>
              )}
            </section>
          </>
        )}
        <p role="status" className="followup-status">
          {notice}
        </p>
        <aside className="followup-product">
          <TrendingUp size={20} />
          <div>
            <strong>สิ่งที่สมาชิกควรได้รับต่อเนื่อง</strong>
            <p>
              ติดตามแผนกับยอดจริง ตรวจบิลและเป้าหมาย
              แจ้งสิ่งที่เปลี่ยนพร้อมทางเลือกแก้ บันทึกแผนในเครื่องได้แล้ว
              แต่ยังไม่มีซิงก์ การแจ้งเตือนเบื้องหลัง หรือผู้เชี่ยวชาญติดตามจริง
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}

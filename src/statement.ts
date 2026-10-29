import { money } from "./tax.ts";
import {
  createTransaction,
  today,
  validDate,
  type Transaction,
} from "./ledger.ts";

export const STATEMENT_MAX_BYTES = 5 * 1024 * 1024;
export const STATEMENT_MAX_ROWS = 10000;
export type StatementSheet = { name: string; rows: string[][] };
export type StatementMapping = {
  header: number;
  date: number;
  note: number;
  credit: number;
  debit: number;
  amount: number;
  type: number;
  mode: "separate" | "signed" | "type";
  dateFormat: "iso" | "dmy" | "mdy";
};
export type StatementRow = {
  row: number;
  date: string;
  note: string;
  type: "income" | "expense";
  amount: number;
  error: string;
  duplicate: boolean;
};
export function checkStatementRows(rows: string[][]) {
  if (!rows.length || rows.length > STATEMENT_MAX_ROWS + 20)
    throw new Error("ไฟล์ว่างหรือเกิน 10,000 รายการ กรุณาแบ่งไฟล์ก่อน");
  if (
    rows.some(
      (row) => row.length > 100 || row.some((cell) => cell.length > 10000),
    )
  )
    throw new Error("ไฟล์มีคอลัมน์หรือข้อความยาวเกินที่รองรับ");
  return rows;
}
export function decodeStatementText(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  if (bytes[0] === 255 && bytes[1] === 254)
    return new TextDecoder("utf-16le").decode(buffer);
  if (bytes[0] === 254 && bytes[1] === 255)
    return new TextDecoder("utf-16be").decode(buffer);
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(buffer);
  } catch {
    return new TextDecoder("windows-874", { fatal: true }).decode(buffer);
  }
}
export function parseStatementCsv(text: string, delimiter = ",") {
  text = text.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let row: string[] = [],
    cell = "",
    quoted = false,
    closed = false;
  const pushCell = () => {
    row.push(cell);
    cell = "";
    closed = false;
  };
  const pushRow = () => {
    pushCell();
    rows.push(row);
    row = [];
    if (rows.length > STATEMENT_MAX_ROWS + 20)
      throw new Error("ไฟล์เกิน 10,000 รายการ กรุณาแบ่งไฟล์ก่อน");
  };
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          quoted = false;
          closed = true;
        }
      } else cell += c;
    } else if (c === delimiter) pushCell();
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      pushRow();
    } else if (c === '"') {
      if (cell || closed)
        throw new Error("รูปแบบเครื่องหมายคำพูดใน CSV ไม่ถูกต้อง");
      quoted = true;
    } else if (closed && c.trim())
      throw new Error("รูปแบบ CSV ไม่ถูกต้องหลังปิดเครื่องหมายคำพูด");
    else if (!closed) cell += c;
    if (cell.length > 10000 || row.length > 100)
      throw new Error("ไฟล์มีข้อความหรือคอลัมน์มากเกินที่รองรับ");
  }
  if (quoted) throw new Error("CSV มีเครื่องหมายคำพูดที่ยังไม่ปิด");
  if (cell || row.length || closed) pushRow();
  return checkStatementRows(rows);
}
export function csvStatementSheet(text: string): StatementSheet {
  // Pick a separator using actual parsed cells, including quoted delimiters.
  const candidates = [",", ";", "\t"]
    .map((separator) => {
      try {
        const rows = parseStatementCsv(text, separator);
        return {
          rows,
          score: Math.max(...rows.slice(0, 20).map((row) => row.length)),
        };
      } catch {
        return { rows: null, score: 0 };
      }
    })
    .sort((a, b) => b.score - a.score);
  if (!candidates[0].rows)
    return { name: "CSV", rows: parseStatementCsv(text) };
  return { name: "CSV", rows: candidates[0].rows };
}
const normalized = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[\s_\-().]/g, "");
const labels = {
  date: [
    "วันที่",
    "วันทำรายการ",
    "วันที่ทำรายการ",
    "date",
    "transactiondate",
    "วันที่คศYYYYMMDD",
  ],
  note: ["รายละเอียด", "รายการ", "หมายเหตุ", "description", "note", "details"],
  credit: ["เงินเข้า", "ฝาก", "ยอดฝาก", "credit", "deposit", "depositamount"],
  debit: [
    "เงินออก",
    "ถอน",
    "ยอดถอน",
    "debit",
    "withdrawal",
    "withdrawalamount",
  ],
  amount: ["จำนวนเงิน", "จำนวนบาท", "amount", "จำนวน"],
  type: ["ประเภท", "type", "transactiontype"],
};
export function guessStatementMapping(rows: string[][]): StatementMapping {
  const locate = (row: string[], key: keyof typeof labels) =>
    row.findIndex((cell) =>
      labels[key].some((label) => normalized(label) === normalized(cell)),
    );
  let header = rows
    .slice(0, 20)
    .findIndex(
      (row) =>
        locate(row, "date") >= 0 &&
        ["credit", "debit", "amount"].some(
          (key) => locate(row, key as keyof typeof labels) >= 0,
        ),
    );
  if (header < 0) header = 0;
  const row = rows[header];
  const found = Object.fromEntries(
    Object.keys(labels).map((key) => [
      key,
      locate(row, key as keyof typeof labels),
    ]),
  ) as Record<keyof typeof labels, number>;
  const sample =
    rows.slice(header + 1).find((r) => r[found.date]?.trim())?.[found.date] ||
    "";
  return {
    ...found,
    header,
    mode:
      found.credit >= 0 || found.debit >= 0
        ? "separate"
        : found.type >= 0
          ? "type"
          : "signed",
    dateFormat: /^\d{4}-\d{2}-\d{2}/.test(sample) ? "iso" : "dmy",
  };
}
export function statementDate(
  text: string,
  format: StatementMapping["dateFormat"],
) {
  const value = text.trim();
  let year: number, month: number, day: number;
  if (format === "iso") {
    const match =
      /^(\d{4})-(\d{2})-(\d{2})(?:[T ]\d{2}:\d{2}(?::\d{2})?)?$/.exec(value);
    if (!match) throw new Error("วันที่ไม่ตรงกับรูปแบบปี-เดือน-วัน");
    [, year, month, day] = match.map(Number);
  } else {
    const match =
      /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})(?: \d{2}:\d{2}(?::\d{2})?)?$/.exec(
        value,
      );
    if (!match) throw new Error("ใช้วันที่พร้อมปี 4 หลัก เช่น 31/01/2569");
    const a = Number(match[1]),
      b = Number(match[2]);
    year = Number(match[3]);
    day = format === "dmy" ? a : b;
    month = format === "dmy" ? b : a;
  }
  if (year >= 2400) year -= 543;
  const date = `${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
  if (!validDate(date) || date < "1900-01-01" || date > today())
    throw new Error("วันที่ไม่ถูกต้องหรือเป็นวันในอนาคต");
  return date;
}
function statementMoney(value: string) {
  const text = value.trim();
  if (!text || text === "-") return 0;
  if (!/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/.test(text))
    throw new Error("จำนวนเงินต้องเป็นบาทและทศนิยมไม่เกิน 2 ตำแหน่ง");
  return money(text.replaceAll(",", ""));
}
const fingerprint = (
  row: Pick<StatementRow, "date" | "type" | "amount" | "note">,
) =>
  JSON.stringify([
    row.date,
    row.type,
    row.amount,
    row.note.trim().toLocaleLowerCase("th"),
  ]);
export function previewStatement(
  rows: string[][],
  mapping: StatementMapping,
  existing: Transaction[],
): StatementRow[] {
  const used =
    mapping.mode === "separate"
      ? [mapping.date, mapping.note, mapping.credit, mapping.debit]
      : [
          mapping.date,
          mapping.note,
          mapping.amount,
          ...(mapping.mode === "type" ? [mapping.type] : []),
        ];
  const columns = used.filter((i) => i >= 0);
  if (new Set(columns).size !== columns.length)
    throw new Error(
      "เลือกแต่ละคอลัมน์ให้ต่างกัน ไม่ใช้คอลัมน์ยอดคงเหลือเป็นเงินเข้า/ออก",
    );
  if (
    mapping.date < 0 ||
    (mapping.mode === "separate"
      ? mapping.credit < 0 && mapping.debit < 0
      : mapping.amount < 0 || (mapping.mode === "type" && mapping.type < 0))
  )
    throw new Error("เลือกคอลัมน์วันที่และจำนวนเงินให้ครบ");
  const seen = new Set(existing.map(fingerprint));
  const results: StatementRow[] = [];
  rows.slice(mapping.header + 1).forEach((source, index) => {
    if (source.every((cell) => !cell.trim())) return;
    const row: StatementRow = {
      row: mapping.header + index + 2,
      date: "",
      note: mapping.note >= 0 ? (source[mapping.note] || "").trim() : "",
      type: "income",
      amount: 0,
      error: "",
      duplicate: false,
    };
    try {
      if (source.length > rows[mapping.header].length)
        throw new Error("คอลัมน์มากกว่าหัวตาราง ตรวจตัวคั่น CSV");
      row.date = statementDate(source[mapping.date] || "", mapping.dateFormat);
      if (row.note.length > 250)
        throw new Error("รายละเอียดเกิน 250 ตัวอักษร กรุณาย่อก่อนนำเข้า");
      if (mapping.mode === "separate") {
        const credit =
          mapping.credit >= 0
            ? statementMoney(source[mapping.credit] || "")
            : 0;
        const debit =
          mapping.debit >= 0 ? statementMoney(source[mapping.debit] || "") : 0;
        if (credit > 0 && debit > 0)
          throw new Error("มีเงินเข้าและออกพร้อมกันในแถวเดียว กรุณาตรวจไฟล์");
        row.type = credit > 0 ? "income" : "expense";
        row.amount = credit || debit;
      } else if (mapping.mode === "signed") {
        const text = (source[mapping.amount] || "").trim();
        row.type = text.startsWith("-") ? "expense" : "income";
        row.amount = statementMoney(text.replace(/^[+-]/, ""));
      } else {
        const type = normalized(source[mapping.type] || "");
        if (
          ["เงินเข้า", "รายรับ", "income", "credit", "deposit"].includes(type)
        )
          row.type = "income";
        else if (
          ["เงินออก", "รายจ่าย", "expense", "debit", "withdrawal"].includes(
            type,
          )
        )
          row.type = "expense";
        else
          throw new Error("ประเภทต้องระบุเงินเข้า/เงินออก หรือรายรับ/รายจ่าย");
        row.amount = statementMoney(source[mapping.amount] || "");
      }
      if (row.amount <= 0) throw new Error("ไม่ใช่ยอดเงินเข้า/ออกที่มากกว่า 0");
      const key = fingerprint(row);
      row.duplicate = seen.has(key);
      seen.add(key);
    } catch (error) {
      row.error = error instanceof Error ? error.message : "อ่านรายการไม่ได้";
    }
    results.push(row);
  });
  if (results.length > STATEMENT_MAX_ROWS)
    throw new Error("นำเข้าได้ไม่เกิน 10,000 รายการต่อไฟล์");
  return results;
}
export function importStatementRows(
  rows: StatementRow[],
  existing: Transaction[],
) {
  if (!rows.length || existing.length + rows.length > STATEMENT_MAX_ROWS)
    throw new Error(
      "สมุดเงินต้องมีไม่เกิน 10,000 รายการ กรุณาสำรองและแบ่งข้อมูลก่อน",
    );
  if (
    new Set(rows.map((row) => row.row)).size !== rows.length ||
    rows.some((row) => row.error)
  )
    throw new Error("ยังมีรายการที่ตรวจไม่ผ่าน");
  return rows.map((row) =>
    createTransaction(
      row.type,
      (row.amount / 100).toFixed(2),
      row.date,
      "อื่น ๆ",
      row.note,
    ),
  );
}
// Reject oversized/encrypted ZIP containers before the Excel reader inflates XML.
export function checkStatementXlsx(buffer: ArrayBuffer) {
  const bytes = new DataView(buffer);
  if (bytes.byteLength < 22 || bytes.getUint32(0, true) !== 0x04034b50)
    throw new Error("ไฟล์ Excel ไม่ถูกต้อง ใช้ .xlsx ที่ไม่ใส่รหัสผ่าน");
  let end = bytes.byteLength - 22;
  while (
    end >= Math.max(0, bytes.byteLength - 65557) &&
    bytes.getUint32(end, true) !== 0x06054b50
  )
    end--;
  if (end < 0 || bytes.getUint32(end, true) !== 0x06054b50)
    throw new Error("โครงสร้างไฟล์ Excel ไม่ถูกต้อง");
  const count = bytes.getUint16(end + 10, true);
  let cursor = bytes.getUint32(end + 16, true),
    total = 0;
  if (count > 200 || count === 0)
    throw new Error("Excel มีส่วนประกอบมากเกินที่รองรับ");
  for (let i = 0; i < count; i++) {
    if (cursor + 46 > end || bytes.getUint32(cursor, true) !== 0x02014b50)
      throw new Error("โครงสร้างไฟล์ Excel ไม่ถูกต้อง");
    if (bytes.getUint16(cursor + 8, true) & 1)
      throw new Error("ยังไม่รองรับ Excel ที่ใส่รหัสผ่าน");
    total += bytes.getUint32(cursor + 24, true);
    if (total > 15 * 1024 * 1024)
      throw new Error("Excel มีข้อมูลภายในใหญ่เกิน 15 MB กรุณาแบ่งไฟล์");
    cursor +=
      46 +
      bytes.getUint16(cursor + 28, true) +
      bytes.getUint16(cursor + 30, true) +
      bytes.getUint16(cursor + 32, true);
  }
  if (cursor > end) throw new Error("โครงสร้างไฟล์ Excel ไม่ถูกต้อง");
}

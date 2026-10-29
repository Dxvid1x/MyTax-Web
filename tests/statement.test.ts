import { test } from "node:test";
import assert from "node:assert/strict";
import readExcelFile from "read-excel-file/universal";
import { csv, createTransaction } from "../src/ledger.ts";
import {
  csvStatementSheet,
  decodeStatementText,
  guessStatementMapping,
  previewStatement,
  importStatementRows,
  statementDate,
  checkStatementXlsx,
} from "../src/statement.ts";
import { statementWorkbook } from "./statementFixture.ts";

const text =
  'วันที่,รายละเอียด,เงินเข้า,เงินออก\r\n2026-01-10,"เงินเข้า, รายละเอียด",1000.50,\r\n2026-01-10,อาหาร,,80.25';
test("statement CSV preserves quotes, commas, Thai and exact satang; no mutation before confirmation", () => {
  const { rows } = csvStatementSheet("\ufeff" + text);
  const before = JSON.stringify(rows);
  const preview = previewStatement(rows, guessStatementMapping(rows), []);
  assert.deepEqual(
    preview.map((row) => [row.type, row.amount, row.error]),
    [
      ["income", 100050, ""],
      ["expense", 8025, ""],
    ],
  );
  assert.equal(preview[0].note, "เงินเข้า, รายละเอียด");
  assert.equal(JSON.stringify(rows), before);
  const imported = importStatementRows(preview, []);
  assert.equal(imported[0].category, "อื่น ๆ");
  assert.notEqual(imported[0].id, imported[1].id);
});
test("statement accepts tab/semicolon separators, preamble headers, quoted newlines and UTF16/Thai legacy encoding", () => {
  const { rows } = csvStatementSheet(
    'ธนาคารตัวอย่าง\nวันที่;รายละเอียด;เงินเข้า;เงินออก\n10/01/2569;"คำอธิบาย\nบรรทัดสอง";20.00;',
  );
  const mapping = guessStatementMapping(rows);
  assert.equal(mapping.header, 1);
  const result = previewStatement(rows, mapping, []);
  assert.equal(result[0].date, "2026-01-10");
  assert.match(result[0].note, /\n/);
  assert.equal(
    csvStatementSheet("วันที่\tเงินเข้า\n2026-01-10\t12.50").rows[0].length,
    2,
  );
  assert.equal(
    decodeStatementText(Uint8Array.from([255, 254, 65, 0]).buffer),
    "A",
  );
  assert.equal(decodeStatementText(Uint8Array.from([0xa1]).buffer), "ก");
});
test("statement rejects malformed quotes, decimal rounding, dual amounts, missing/future dates and long notes without partial acceptance", () => {
  assert.throws(
    () =>
      csvStatementSheet('วันที่,รายละเอียด,เงินเข้า\n2026-01-10,"ไม่ปิด,20'),
    /คำพูด/,
  );
  const source = [
    ["วันที่", "เงินเข้า", "เงินออก", "รายละเอียด"],
    ["2026-01-10", "1.234", "", ""],
    ["2026-01-10", "20", "10", ""],
    ["2999-01-01", "20", "", ""],
    ["2026-01-10", "20", "", "x".repeat(251)],
    ["2026-01-10", "0", "0", ""],
  ];
  const preview = previewStatement(source, guessStatementMapping(source), []);
  assert.ok(preview.every((row) => row.error));
  assert.throws(() => importStatementRows(preview, []), /ไม่ผ่าน/);
});
test("statement date formats are explicit, Buddhist years convert once, impossible dates and two-digit years fail", () => {
  assert.equal(statementDate("10/01/2569", "dmy"), "2026-01-10");
  assert.equal(statementDate("01/10/2026", "mdy"), "2026-01-10");
  assert.equal(statementDate("2026-01-10 12:30", "iso"), "2026-01-10");
  assert.throws(() => statementDate("31/02/2569", "dmy"));
  assert.throws(() => statementDate("10/01/69", "dmy"));
});
test("statement signed/type layouts retain direction and never infer spending from account balance", () => {
  const signed = [
    ["วันที่", "จำนวนเงิน"],
    ["2026-01-10", "-1,000.25"],
    ["2026-01-10", "+80.10"],
  ];
  assert.deepEqual(
    previewStatement(signed, guessStatementMapping(signed), []).map((row) => [
      row.type,
      row.amount,
    ]),
    [
      ["expense", 100025],
      ["income", 8010],
    ],
  );
  const typed = [
    ["วันที่", "ประเภท", "จำนวนบาท"],
    ["2026-01-10", "รายรับ", "80.50"],
    ["2026-01-10", "ไม่ทราบ", "90"],
  ];
  assert.equal(
    previewStatement(typed, guessStatementMapping(typed), [])[0].error,
    "",
  );
  assert.ok(previewStatement(typed, guessStatementMapping(typed), [])[1].error);
  const noAmount = [
    ["วันที่", "ยอดคงเหลือ"],
    ["2026-01-10", "9000"],
  ];
  assert.throws(
    () => previewStatement(noAmount, guessStatementMapping(noAmount), []),
    /เลือกคอลัมน์/,
  );
  const mapping = guessStatementMapping(signed);
  assert.throws(
    () => previewStatement(signed, { ...mapping, amount: mapping.date }, []),
    /ต่างกัน/,
  );
});
test("statement flags existing and within-file matches, preserving legitimate repeats for explicit review", () => {
  const { rows } = csvStatementSheet(text);
  rows.push([...rows[1]]);
  const existing = [
    createTransaction("expense", "80.25", "2026-01-10", "อาหาร", "อาหาร"),
  ];
  const preview = previewStatement(rows, guessStatementMapping(rows), existing);
  assert.deepEqual(
    preview.map((row) => row.duplicate),
    [false, true, true],
  );
  assert.equal(existing.length, 1);
  assert.equal(importStatementRows([preview[0]], existing).length, 1);
  assert.throws(
    () => importStatementRows([preview[0], preview[0]], []),
    /ไม่ผ่าน/,
  );
  assert.throws(
    () => importStatementRows([preview[0]], Array(10000).fill(existing[0])),
    /10,000/,
  );
});
test("statement notes remain plain text and export continues to guard formula injection", () => {
  const rows = [
    ["วันที่", "รายละเอียด", "เงินเข้า"],
    ["2026-01-10", "=1+1", "80"],
  ];
  const imported = importStatementRows(
    previewStatement(rows, guessStatementMapping(rows), []),
    [],
  );
  assert.equal(imported[0].note, "=1+1");
  assert.match(csv(imported), /'=1\+1/);
});
test("statement Excel reads date cells and monetary strings without floating-point conversion; rejects invalid/oversized ZIPs", async () => {
  const data = statementWorkbook();
  const buffer = data.buffer.slice(
    data.byteOffset,
    data.byteOffset + data.byteLength,
  ) as ArrayBuffer;
  checkStatementXlsx(buffer);
  const sheets = await readExcelFile(buffer, { parseNumber: (value) => value });
  const rows = sheets[0].data.map((row) =>
    row.map((value) =>
      value instanceof Date
        ? value.toISOString().slice(0, 10)
        : value == null
          ? ""
          : String(value),
    ),
  );
  const preview = previewStatement(rows, guessStatementMapping(rows), []);
  assert.deepEqual(
    preview.map((row) => [row.date, row.amount, row.error]),
    [
      ["2026-01-10", 87550, ""],
      ["2026-01-10", 1025, ""],
    ],
  );
  assert.throws(() => checkStatementXlsx(new ArrayBuffer(3)));
  const inflated = buffer.slice(0),
    view = new DataView(inflated);
  for (let cursor = 0; cursor < view.byteLength - 46; cursor++)
    if (view.getUint32(cursor, true) === 0x02014b50) {
      view.setUint32(cursor + 24, 16 * 1024 * 1024, true);
      break;
    }
  assert.throws(() => checkStatementXlsx(inflated), /15 MB/);
});

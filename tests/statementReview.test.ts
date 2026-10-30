import { test } from "node:test";
import assert from "node:assert/strict";
import { tableFromTextPages } from "../src/statementPdf.ts";
import {
  reviewStatement,
  statementDocument,
  selectionAfterReview,
} from "../src/statementReview.ts";
import { initialStatementEdit } from "../src/statementEdit.ts";
import { guessStatementMapping } from "../src/statement.ts";
import {
  emptyStatementImports,
  applyStatementImport,
} from "../src/statementIdentity.ts";
import { detectStatementProfile } from "../src/statementProfiles.ts";
test("opening a valid income row with zero or dash debit never reverses its direction", () => {
  for (const debit of ["0", "0.00", "-"]) {
    const doc = statementDocument("a".repeat(64), "csv", [
      {
        name: "CSV",
        rows: [
          ["date", "credit", "debit"],
          ["2026-01-10", "100.50", debit],
        ],
      },
    ]);
    const mapping = guessStatementMapping(doc.tables[0].rows);
    const row = reviewStatement(
      doc,
      0,
      mapping,
      {},
      [],
      emptyStatementImports(),
    )[0];
    assert.equal(row.type, "income");
    const edit = initialStatementEdit(row, doc.tables[0].rows[1], mapping);
    assert.equal(edit.type, "income");
    assert.equal(edit.amount, "100.50");
  }
});
test("PDF right-aligned amounts stay in their explicit column and ambiguous spans fail closed", () => {
  const make = (width: number) => [
    {
      page: 1,
      items: [
        ...["Date", "Description", "Credit", "Debit", "Balance"].map(
          (text, itemIndex) => ({
            text,
            itemIndex,
            x: [20, 140, 300, 400, 500][itemIndex],
            y: 700,
            width: 40,
            height: 10,
          }),
        ),
        {
          text: "2026-01-10",
          itemIndex: 10,
          x: 20,
          y: 680,
          width: 70,
          height: 10,
        },
        {
          text: "deposit",
          itemIndex: 11,
          x: 140,
          y: 680,
          width: 45,
          height: 10,
        },
        { text: "100.00", itemIndex: 12, x: 360, y: 680, width, height: 10 },
      ],
    },
  ];
  const table = tableFromTextPages(make(30));
  const doc = statementDocument("b".repeat(64), "pdf", [table]);
  const rows = reviewStatement(
    doc,
    0,
    guessStatementMapping(table.rows),
    {},
    [],
    emptyStatementImports(),
  );
  assert.equal(rows[0].type, "income");
  assert.equal(rows[0].amount, 10000);
  assert.throws(() => tableFromTextPages(make(50)), /คอลัมน์/);
});
test("bank names do not establish a verified layout", () => {
  assert.equal(
    detectStatementProfile({
      format: "csv",
      rows: [["KBank SCB Krungthai Krungsri TTB GSB Bangkok Bank"]],
    }),
    null,
  );
});
test("an ambiguous debit and credit row still requires an explicit amount correction", () => {
  const doc = statementDocument("a".repeat(64), "csv", [
    {
      name: "CSV",
      rows: [
        ["date", "credit", "debit"],
        ["2026-01-10", "100", "50"],
      ],
    },
  ]);
  const mapping = guessStatementMapping(doc.tables[0].rows);
  const row = reviewStatement(
    doc,
    0,
    mapping,
    {},
    [],
    emptyStatementImports(),
  )[0];
  assert.ok(row.error);
  assert.equal(
    initialStatementEdit(row, doc.tables[0].rows[1], mapping).amount,
    "",
  );
});
test("correcting one row never reselects a different row the user excluded", () => {
  const doc = statementDocument("a".repeat(64), "csv", [
    {
      name: "CSV",
      rows: [
        ["date", "debit"],
        ["2026-01-10", "bad"],
        ["2026-01-10", "80"],
      ],
    },
  ]);
  const mapping = guessStatementMapping(doc.tables[0].rows);
  const before = reviewStatement(
    doc,
    0,
    mapping,
    {},
    [],
    emptyStatementImports(),
  );
  const after = reviewStatement(
    doc,
    0,
    mapping,
    {
      [before[0].origin.locator]: {
        date: "2026-01-10",
        note: "",
        amount: "25",
        type: "expense",
      },
    },
    [],
    emptyStatementImports(),
  );
  assert.deepEqual([...selectionAfterReview(after, before, new Set())], [2]);
});
test("editable preview revalidates amounts/dates and keeps original source identity", () => {
  const doc = statementDocument("a".repeat(64), "csv", [
    {
      name: "CSV",
      rows: [
        ["วันที่", "รายละเอียด", "เงินเข้า", "เงินออก"],
        ["31/02/2569", "bad", "", "1.234"],
        ["10/01/2569", "valid", "", "80.25"],
      ],
    },
  ]);
  const mapping = guessStatementMapping(doc.tables[0].rows);
  const before = reviewStatement(
    doc,
    0,
    mapping,
    {},
    [],
    emptyStatementImports(),
  );
  assert.ok(before[0].error);
  const edits = {
    [before[0].origin.locator]: {
      date: "10/01/2569",
      note: "fixed",
      amount: "25.50",
      type: "expense" as const,
    },
  };
  const after = reviewStatement(
    doc,
    0,
    mapping,
    edits,
    [],
    emptyStatementImports(),
  );
  assert.equal(after[0].amount, 2550);
  assert.equal(after[0].date, "2026-01-10");
  assert.equal(after[0].error, "");
  assert.equal(after[0].origin.locator, before[0].origin.locator);
  const applied = applyStatementImport(
    { document: doc, selected: [after[0]] },
    [],
    emptyStatementImports(),
  );
  const repeat = reviewStatement(
    doc,
    0,
    mapping,
    edits,
    applied.transactions,
    applied.statementImports,
  );
  assert.equal(repeat[0].alreadyImported, true);
  assert.equal(repeat[1].alreadyImported, false);
});
test("PDF table reconstruction preserves pages, repeated headers and wrapped notes without using balances", () => {
  const line = (page: number, y: number, parts: string[]) =>
    parts.map((text, itemIndex) => ({
      text,
      x: [20, 140, 300, 400, 500][itemIndex],
      y,
      width: 50,
      height: 10,
      itemIndex: page * 100 + y + itemIndex,
    }));
  const result = tableFromTextPages([
    {
      page: 1,
      items: [
        ...line(1, 700, ["Date", "Description", "Credit", "Debit", "Balance"]),
        ...line(1, 680, ["2026-01-10", "pay", "100.50", "", "5000"]),
        ...line(1, 666, ["", "wrapped note"]),
      ],
    },
    {
      page: 2,
      items: [
        ...line(2, 700, ["Date", "Description", "Credit", "Debit", "Balance"]),
        ...line(2, 680, ["2026-01-10", "food", "", "80.25", "9999"]),
      ],
    },
  ]);
  assert.equal(result.rows.length, 3);
  assert.match(result.rows[1][1], /wrapped note/);
  assert.equal(result.origins[2].page, 2);
  const doc = statementDocument("b".repeat(64), "pdf", [result]);
  const rows = reviewStatement(
    doc,
    0,
    guessStatementMapping(result.rows),
    {},
    [],
    emptyStatementImports(),
  );
  assert.deepEqual(
    rows.map((r) => [r.type, r.amount]),
    [
      ["income", 10050],
      ["expense", 8025],
    ],
  );
  assert.throws(() => tableFromTextPages([{ page: 1, items: [] }]), /ข้อความ/);
});

import { useEffect, useRef, useState } from "react";
import { FileSpreadsheet, ShieldCheck } from "lucide-react";
import { Modal } from "./Modal.tsx";
import { fmt, dateLabel } from "./taxDisplay.tsx";
import { today, type Transaction } from "./ledger.ts";
import {
  guessStatementMapping,
  previewStatement,
  STATEMENT_MAX_BYTES,
  type StatementMapping,
  type StatementSheet,
} from "./statement.ts";
import { emptyStatementImports } from "./statementIdentity.ts";
import { initialStatementEdit } from "./statementEdit.ts";
import { selectionAfterReview } from "./statementReview.ts";
import type {
  StatementDocument,
  StatementEdit,
  StatementImportIntent,
  StatementImportState,
  StatementReviewRow,
} from "./statementTypes.ts";
import "./statement.css";

export function StatementImport({
  transactions,
  blocked,
  onClose,
  onImport,
  statementImports = emptyStatementImports(),
}: {
  transactions: Transaction[];
  blocked: boolean;
  onClose: () => void;
  onImport: (
    intent: StatementImportIntent,
    options?: { signal?: AbortSignal },
  ) => Promise<void>;
  statementImports?: StatementImportState;
}) {
  const [sheets, setSheets] = useState<StatementSheet[]>([]);
  const [sheetIndex, setSheetIndex] = useState(0);
  const [mapping, setMapping] = useState<StatementMapping | null>(null);
  const [filename, setFilename] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [confirmed, setConfirmed] = useState(false);
  const [duplicatesConfirmed, setDuplicatesConfirmed] = useState(false);
  const [visible, setVisible] = useState(100);
  const [mappingOpen, setMappingOpen] = useState(false);
  const [document, setDocument] = useState<StatementDocument | null>(null);
  const [edits, setEdits] = useState<Record<string, StatementEdit>>({});
  const [editing, setEditing] = useState<string | null>(null);
  const [committing, setCommitting] = useState(false);
  const commitAbort = useRef<AbortController | null>(null);
  const [preview, setPreview] = useState<{
    rows: StatementReviewRow[];
    error: string;
  }>({ rows: [], error: "" });
  const [reviewing, setReviewing] = useState(false);
  const previousReview = useRef<StatementReviewRow[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);
  const worker = useRef<Worker | null>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const request = useRef(0);
  useEffect(
    () => () => {
      request.current++;
      commitAbort.current?.abort();
      worker.current?.terminate();
      clearTimeout(timeout.current);
    },
    [],
  );
  const sheet = sheets[sheetIndex];
  useEffect(() => {
    if (!document || !mapping) {
      setPreview({ rows: [], error: "" });
      return;
    }
    setReviewing(true);
    setConfirmed(false);
    setDuplicatesConfirmed(false);
    const reader = new Worker(
      new URL("./statementWorker.ts", import.meta.url),
      { type: "module" },
    );
    const timer = setTimeout(() => {
      reader.terminate();
      setPreview({ rows: [], error: "ตรวจรายการนานเกินไป กรุณาแบ่งไฟล์" });
      setReviewing(false);
    }, 12000);
    reader.onmessage = (
      event: MessageEvent<{ rows?: StatementReviewRow[]; error?: string }>,
    ) => {
      clearTimeout(timer);
      setPreview({
        rows: event.data.rows || [],
        error: event.data.error || "",
      });
      setReviewing(false);
      reader.terminate();
    };
    reader.onerror = () => {
      clearTimeout(timer);
      setPreview({ rows: [], error: "ตรวจรายการไม่ได้ กรุณาตรวจไฟล์" });
      setReviewing(false);
      reader.terminate();
    };
    reader.postMessage({
      kind: "review",
      document,
      sheetIndex,
      mapping,
      edits,
      existing: transactions,
      imports: statementImports,
    });
    return () => {
      clearTimeout(timer);
      reader.terminate();
    };
  }, [document, mapping, sheetIndex, edits, transactions, statementImports]);
  useEffect(() => {
    const previous = previousReview.current;
    setSelected((current) =>
      selectionAfterReview(preview.rows, previous, current),
    );
    previousReview.current = preview.rows;
    setConfirmed(false);
    setDuplicatesConfirmed(false);
    setVisible(100);
  }, [preview]);
  const chosen = preview.rows.filter(
    (row) => selected.has(row.row) && !row.error && !row.alreadyImported,
  );
  const duplicates = chosen.some((row) => row.duplicate);
  const income = chosen
    .filter((row) => row.type === "income")
    .reduce((sum, row) => sum + row.amount, 0);
  const expense = chosen
    .filter((row) => row.type === "expense")
    .reduce((sum, row) => sum + row.amount, 0);
  const loadFile = async (file: File) => {
    const generation = ++request.current;
    worker.current?.terminate();
    clearTimeout(timeout.current);
    setSheets([]);
    previousReview.current = [];
    setMapping(null);
    setError("");
    setBusy(false);
    setFilename("");
    setDocument(null);
    setEdits({});
    setEditing(null);
    try {
      if (!/\.(csv|xlsx|pdf)$/i.test(file.name))
        throw new Error(
          "เลือกไฟล์ CSV, Excel (.xlsx) หรือ PDF ที่เลือกข้อความได้ · ยังไม่รองรับ .xls",
        );
      if (file.size > STATEMENT_MAX_BYTES)
        throw new Error("ไฟล์ต้องไม่เกิน 5 MB");
      setBusy(true);
      const buffer = await file.arrayBuffer();
      if (request.current !== generation) return;
      const reader = /\.pdf$/i.test(file.name)
        ? new Worker(new URL("./statementPdfWorker.ts", import.meta.url), {
            type: "module",
          })
        : new Worker(new URL("./statementWorker.ts", import.meta.url), {
            type: "module",
          });
      worker.current = reader;
      const fail = (message: string) => {
        if (request.current !== generation) return;
        reader.terminate();
        clearTimeout(timeout.current);
        setBusy(false);
        setError(message);
      };
      timeout.current = setTimeout(
        () => fail("อ่านไฟล์นานเกินไป กรุณาแบ่งไฟล์ให้เล็กลง"),
        /\.pdf$/i.test(file.name) ? 20000 : 12000,
      );
      reader.onerror = () =>
        fail("อ่านไฟล์ไม่ได้ กรุณาตรวจว่าไฟล์ไม่เสียหายและไม่ใส่รหัสผ่าน");
      reader.onmessage = (
        event: MessageEvent<{
          sheets?: StatementSheet[];
          document?: StatementDocument;
          error?: string;
        }>,
      ) => {
        if (request.current !== generation) return;
        if (event.data.error || !event.data.sheets?.length) {
          fail(event.data.error || "ไฟล์ไม่มีรายการ");
          return;
        }
        clearTimeout(timeout.current);
        reader.terminate();
        setBusy(false);
        setFilename(file.name);
        setSheets(event.data.sheets);
        setDocument(event.data.document || null);
        setSheetIndex(0);
        const guessed = guessStatementMapping(event.data.sheets[0].rows);
        setMapping(guessed);
        try {
          setMappingOpen(
            !previewStatement(
              event.data.sheets[0].rows,
              guessed,
              transactions,
            ).some((row) => !row.error),
          );
        } catch {
          setMappingOpen(true);
        }
      };
      reader.postMessage({ buffer, excel: /\.xlsx$/i.test(file.name) }, [
        buffer,
      ]);
    } catch (err) {
      if (request.current !== generation) return;
      setBusy(false);
      setError(err instanceof Error ? err.message : "อ่านไฟล์ไม่ได้");
    }
  };
  const column = (
    label: string,
    key: "date" | "note" | "credit" | "debit" | "amount" | "type",
  ) => (
    <label className="field">
      <span>{label}</span>
      <select
        value={mapping![key]}
        onChange={(e) =>
          setMapping({ ...mapping!, [key]: Number(e.target.value) })
        }
      >
        <option value={-1}>
          {key === "note" ? "ไม่ใช้รายละเอียด" : "เลือกคอลัมน์"}
        </option>
        {sheet.rows[mapping!.header].map((cell, index) => (
          <option key={index} value={index}>
            {index + 1}. {cell || "คอลัมน์ไม่มีชื่อ"}
          </option>
        ))}
      </select>
    </label>
  );
  const sample = () => {
    const data = `\uFEFFวันที่,รายละเอียด,เงินเข้า,เงินออก\r\n${today()},รายรับตัวอย่าง,1000.00,\r\n${today()},ค่าอาหารตัวอย่าง,,80.00\r\n`;
    const url = URL.createObjectURL(
      new Blob([data], { type: "text/csv;charset=utf-8" }),
    );
    const a = globalThis.document.createElement("a");
    a.href = url;
    a.download = "MyTax-statement-example.csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <div className="statement-import">
      <Modal title="นำเข้า Statement" onClose={onClose}>
        <p className="statement-privacy">
          <ShieldCheck size={18} aria-hidden="true" /> อ่านไฟล์ในเครื่อง ·
          ไม่เชื่อมบัญชีธนาคาร · ไม่อัปโหลดไฟล์
        </p>
        <div className="statement-file">
          <FileSpreadsheet size={30} aria-hidden="true" />
          <button
            className="secondary"
            onClick={() => fileInput.current?.click()}
          >
            เลือกไฟล์ CSV, Excel (.xlsx) หรือ PDF
          </button>
          <input
            ref={fileInput}
            hidden
            aria-label="ไฟล์ Statement"
            type="file"
            accept=".csv,.xlsx,.pdf,text/csv,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) void loadFile(file);
            }}
          />
          <small>
            ไม่เกิน 5 MB · สูงสุด 10,000 รายการ · PDF
            ต้องเลือกข้อความได้และไม่ติดรหัส สูงสุด 50 หน้า · ยังไม่รองรับ .xls
            หรือภาพสแกน
          </small>
          <button className="text-button" onClick={sample}>
            ดาวน์โหลดไฟล์ตัวอย่าง
          </button>
        </div>
        {busy && <p role="status">กำลังอ่านไฟล์ในเครื่อง…</p>}
        {error && (
          <p className="inline-error" role="alert">
            {error}
          </p>
        )}
        {sheet && mapping && (
          <>
            <p className="statement-filename">{filename}</p>
            <p className="statement-hint">
              ตรวจคอลัมน์อัตโนมัติ · ยังไม่รับรองรูปแบบรายธนาคาร
            </p>
            {document?.warnings.map((warning, index) => (
              <p className="statement-hint" key={index}>
                {warning}
              </p>
            ))}
            <details
              className="statement-column-panel"
              open={mappingOpen}
              onToggle={(e) => setMappingOpen(e.currentTarget.open)}
            >
              <summary>ตรวจคอลัมน์และรูปแบบวันที่</summary>
              <div className="statement-mapping">
                {sheets.length > 1 && (
                  <label className="field">
                    <span>แผ่นงาน</span>
                    <select
                      value={sheetIndex}
                      onChange={(e) => {
                        const index = Number(e.target.value);
                        setSheetIndex(index);
                        setMapping(guessStatementMapping(sheets[index].rows));
                      }}
                    >
                      {sheets.map((s, i) => (
                        <option key={i} value={i}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                <label className="field">
                  <span>แถวหัวตาราง</span>
                  <select
                    value={mapping.header}
                    onChange={(e) =>
                      setMapping({ ...mapping, header: Number(e.target.value) })
                    }
                  >
                    {sheet.rows.slice(0, 20).map((row, i) => (
                      <option key={i} value={i}>
                        แถว {i + 1}: {row.join(" · ").slice(0, 70)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>รูปแบบจำนวนเงิน</span>
                  <select
                    value={mapping.mode}
                    onChange={(e) =>
                      setMapping({
                        ...mapping,
                        mode: e.target.value as StatementMapping["mode"],
                      })
                    }
                  >
                    <option value="separate">เงินเข้าและออกคนละคอลัมน์</option>
                    <option value="signed">
                      คอลัมน์เดียว: บวกเข้า / ลบออก
                    </option>
                    <option value="type">จำนวนเงิน + คอลัมน์ประเภท</option>
                  </select>
                </label>
                {column("วันที่", "date")}
                <label className="field">
                  <span>รูปแบบวันที่</span>
                  <select
                    value={mapping.dateFormat}
                    onChange={(e) =>
                      setMapping({
                        ...mapping,
                        dateFormat: e.target
                          .value as StatementMapping["dateFormat"],
                      })
                    }
                  >
                    <option value="iso">ปี-เดือน-วัน (2026-01-31)</option>
                    <option value="dmy">วัน/เดือน/ปี (31/01/2569)</option>
                    <option value="mdy">เดือน/วัน/ปี (01/31/2026)</option>
                  </select>
                </label>
                {mapping.mode === "separate" ? (
                  <>
                    {column("เงินเข้า / ฝาก", "credit")}
                    {column("เงินออก / ถอน", "debit")}
                  </>
                ) : (
                  <>
                    {column("จำนวนเงิน", "amount")}
                    {mapping.mode === "type" &&
                      column("ประเภทเงินเข้า/ออก", "type")}
                  </>
                )}
                {column("รายละเอียด (ไม่บังคับ)", "note")}
              </div>
            </details>
            <p className="statement-hint">
              อย่าเลือกยอดคงเหลือแทนเงินเข้า/ออก ·
              ไม่เลือกยอดยกมาหรือโอนระหว่างบัญชีตนเอง ·
              ตรวจวันที่และยอดกับไฟล์ต้นฉบับ โดยเฉพาะค่าที่บันทึกไว้ใน Excel
            </p>
            {preview.error && (
              <p className="inline-error" role="alert">
                {preview.error}
              </p>
            )}
            {!!preview.rows.length && (
              <>
                <h3>เลือกรายการที่จะเพิ่ม</h3>
                <p>
                  ตรวจไม่ได้ {preview.rows.filter((row) => row.error).length}{" "}
                  รายการ · อาจซ้ำ{" "}
                  {preview.rows.filter((row) => row.duplicate).length} รายการ
                  (ไม่เลือกให้อัตโนมัติ)
                </p>
                <button
                  className="text-button"
                  onClick={() =>
                    setSelected(
                      new Set(
                        preview.rows
                          .filter(
                            (row) =>
                              !row.error &&
                              !row.duplicate &&
                              !row.alreadyImported,
                          )
                          .map((row) => row.row),
                      ),
                    )
                  }
                >
                  เลือกเฉพาะรายการที่ผ่านและไม่ซ้ำ
                </button>
                <div className="statement-rows">
                  {preview.rows.slice(0, visible).map((row) => (
                    <div
                      key={row.row}
                      className={`statement-row ${row.error ? "statement-invalid" : row.type}`}
                    >
                      <label className="statement-select">
                        <input
                          type="checkbox"
                          aria-label={`นำเข้าแถว ${row.row}`}
                          disabled={
                            !!row.error ||
                            row.alreadyImported ||
                            reviewing ||
                            committing
                          }
                          checked={selected.has(row.row)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setSelected((current) => {
                              const next = new Set(current);
                              if (checked) next.add(row.row);
                              else next.delete(row.row);
                              return next;
                            });
                            setConfirmed(false);
                            setDuplicatesConfirmed(false);
                          }}
                        />
                      </label>
                      <span>
                        <strong>{row.note || `รายการแถว ${row.row}`}</strong>
                        <small>
                          {row.date ? dateLabel(row.date) : `แถว ${row.row}`}{" "}
                          {row.duplicate ? "· อาจซ้ำ โปรดตรวจ" : ""}
                          {row.alreadyImported ? " · นำเข้าแล้ว" : ""}
                          {row.origin.page ? ` · หน้า ${row.origin.page}` : ""}
                        </small>
                        {row.error && (
                          <small className="error-text">{row.error}</small>
                        )}
                      </span>
                      {!row.error && (
                        <strong className="statement-amount">
                          {row.type === "income" ? "+" : "−"}
                          {fmt(row.amount)}
                          <small>บาท</small>
                        </strong>
                      )}
                      {!row.alreadyImported && (
                        <button
                          className="text-button statement-edit-button"
                          disabled={committing || reviewing}
                          aria-label={`แก้รายการแถว ${row.row}`}
                          onClick={() => {
                            const source = sheet.rows[row.row - 1];
                            setEdits((current) => ({
                              ...current,
                              [row.origin.locator]:
                                current[row.origin.locator] ||
                                initialStatementEdit(row, source, mapping),
                            }));
                            setEditing(row.origin.locator);
                          }}
                        >
                          แก้รายการ
                        </button>
                      )}
                      {editing === row.origin.locator && edits[editing] && (
                        <fieldset className="statement-edit">
                          <legend>แก้รายการแถว {row.row}</legend>
                          {(
                            [
                              ["date", "วันที่"],
                              ["amount", "จำนวนเงิน (บาท)"],
                              ["note", "รายละเอียด"],
                            ] as const
                          ).map(([key, label]) => (
                            <label className="field" key={key}>
                              <span>{label}</span>
                              <input
                                aria-label={`${label}แถว ${row.row}`}
                                value={edits[editing][key]}
                                onChange={(e) =>
                                  setEdits((current) => ({
                                    ...current,
                                    [editing]: {
                                      ...current[editing],
                                      [key]: e.target.value,
                                    },
                                  }))
                                }
                              />
                            </label>
                          ))}
                          <label className="field">
                            <span>ประเภท</span>
                            <select
                              aria-label={`ประเภทแถว ${row.row}`}
                              value={edits[editing].type}
                              onChange={(e) =>
                                setEdits((current) => ({
                                  ...current,
                                  [editing]: {
                                    ...current[editing],
                                    type: e.target.value as
                                      "income" | "expense",
                                  },
                                }))
                              }
                            >
                              <option value="income">เงินเข้า</option>
                              <option value="expense">เงินออก</option>
                            </select>
                          </label>
                          <button
                            className="secondary"
                            onClick={() => setEditing(null)}
                          >
                            เสร็จสิ้นการแก้รายการ
                          </button>
                        </fieldset>
                      )}
                    </div>
                  ))}
                </div>
                {preview.rows.length > visible && (
                  <button
                    className="secondary"
                    onClick={() => setVisible((value) => value + 100)}
                  >
                    แสดงเพิ่ม (เห็น {visible} จาก {preview.rows.length} รายการ)
                  </button>
                )}
                <div className="statement-totals" aria-live="polite">
                  <span>เลือก {chosen.length} รายการ</span>
                  <span className="statement-income">
                    เงินเข้า {fmt(income)} บาท
                  </span>
                  <span className="statement-expense">
                    เงินออก {fmt(expense)} บาท
                  </span>
                </div>
                {duplicates && (
                  <label className="check">
                    <input
                      type="checkbox"
                      checked={duplicatesConfirmed}
                      onChange={(e) => setDuplicatesConfirmed(e.target.checked)}
                    />{" "}
                    ตรวจแล้วว่ารายการที่อาจซ้ำต้องนำเข้าเพิ่มจริง
                  </label>
                )}
                <label className="check">
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                  />{" "}
                  ตรวจวันที่ เงินเข้า และเงินออกกับไฟล์ต้นฉบับแล้ว
                </label>
                <p className="statement-hint">
                  เพิ่มเข้ารายการเดิม · จัดหมวดเป็น “อื่น ๆ” ให้แก้ภายหลัง ·
                  ไม่เปลี่ยนแผนภาษีหรือยอดเงินเดือน
                </p>
                {blocked && (
                  <p className="inline-error" role="alert">
                    ข้อมูลเปลี่ยนจากอีกแท็บ กรุณาจัดการข้อมูลก่อนนำเข้า
                  </p>
                )}
                <button
                  className="primary full"
                  disabled={
                    busy ||
                    reviewing ||
                    committing ||
                    !document ||
                    blocked ||
                    !chosen.length ||
                    !confirmed ||
                    (duplicates && !duplicatesConfirmed)
                  }
                  onClick={async () => {
                    try {
                      if (!document) return;
                      commitAbort.current = new AbortController();
                      setCommitting(true);
                      await onImport(
                        { document, selected: chosen },
                        { signal: commitAbort.current.signal },
                      );
                    } catch (err) {
                      setError(
                        err instanceof Error ? err.message : "นำเข้าไม่ได้",
                      );
                    } finally {
                      setCommitting(false);
                    }
                  }}
                >
                  ยืนยันนำเข้า {chosen.length} รายการ
                </button>
              </>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}

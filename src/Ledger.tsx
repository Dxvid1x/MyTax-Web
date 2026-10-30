import { useState } from "react";

import {
  categories,
  today,
  periodRange,
  shiftPeriod,
  summarize,
  csv,
  type Transaction,
} from "./ledger.ts";
import {
  BookOpen,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  ChevronLeft,
  ChevronRight,
  Download,
  Trash2,
  Pencil,
  LockKeyhole,
  Utensils,
  Bus,
  ShoppingBag,
  FileUp,
} from "lucide-react";
import {
  categoryList,
  nextOccurrence,
  dueEntries,
  type LedgerSettings,
  type Recurring,
} from "./ledgerExtras.ts";
import { TransactionForm } from "./TransactionForm.tsx";
import { Modal } from "./Modal.tsx";
import { fmt, dateLabel } from "./taxDisplay.tsx";
import { StatementImport } from "./StatementImport.tsx";
export function Ledger({
  transactions,
  setTransactions,
  showToast,
  settings,
  setSettings,
  importBlocked = false,
}: {
  settings: LedgerSettings;
  setSettings: (s: LedgerSettings) => void;
  transactions: Transaction[];
  setTransactions: (v: Transaction[]) => void;
  showToast: (s: string) => void;
  importBlocked?: boolean;
}) {
  const [period, setPeriod] = useState<"week" | "month" | "year">("month");
  const [anchor, setAnchor] = useState(today());
  const [newType, setNewType] = useState<"income" | "expense">("expense");
  const [newCategory, setNewCategory] = useState(categories.expense[0]);
  const openEntry = (
    type: "income" | "expense",
    category = categories[type][0],
  ) => {
    setNewType(type);
    setNewCategory(category);
    setEditing(null);
    setFormOpen(true);
  };
  const [formOpen, setFormOpen] = useState(false);
  const [statementOpen, setStatementOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState<Transaction | null>(null);
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [deleted, setDeleted] = useState<Transaction | null>(null);
  const [repeatPreview, setRepeatPreview] = useState<ReturnType<
    typeof dueEntries
  > | null>(null);
  const [stopping, setStopping] = useState<Recurring | null>(null);
  const filtered = transactions.filter(
    (t) =>
      (filterType === "all" || t.type === filterType) &&
      (filterCategory === "all" || t.category === filterCategory) &&
      (!query.trim() ||
        `${t.category} ${t.note} ${t.date} ${(t.amount / 100).toFixed(2)}`
          .toLocaleLowerCase("th")
          .includes(query.trim().toLocaleLowerCase("th"))),
  );
  const range = periodRange(anchor, period),
    data = summarize(filtered, {
      ...range,
      end: range.end > today() ? today() : range.end,
    });
  const monthLabel = new Intl.DateTimeFormat("th-TH", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(anchor + "T12:00:00Z"));
  const exportCsv = () => {
    const url = URL.createObjectURL(
      new Blob([csv(data.rows)], { type: "text/csv;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `mytax-${range.start}-${range.end}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast("ดาวน์โหลดตาราง (CSV) เฉพาะช่วงที่เลือกแล้ว");
  };
  const save = (transaction: Transaction, frequency?: "week" | "month") => {
    if (!editing && transactions.length >= 10000)
      throw new Error("สมุดเงินเกิน 10,000 รายการ สำรองและแยกปีข้อมูลก่อน");
    if (!editing && frequency && settings.recurring.length >= 100)
      throw new Error("รายการประจำสูงสุด 100 รายการ");
    setTransactions(
      editing
        ? transactions.map((t) =>
            t.id === editing.id
              ? { ...transaction, id: t.id, createdAt: t.createdAt }
              : t,
          )
        : [transaction, ...transactions],
    );
    if (!editing && frequency) {
      const rule: Recurring = {
        id: crypto.randomUUID(),
        type: transaction.type,
        amount: transaction.amount,
        category: transaction.category,
        note: transaction.note,
        startDate: transaction.date,
        nextDate: nextOccurrence(transaction.date, transaction.date, frequency),
        frequency,
      };
      setSettings({ ...settings, recurring: [...settings.recurring, rule] });
    }
    setFormOpen(false);
    setEditing(null);
    showToast(editing ? "แก้รายการแล้ว" : "เพิ่มรายการแล้ว");
  };
  return (
    <section className="workspace ledger">
      <div className="page-head">
        <div>
          <span className="section-kicker">
            <BookOpen size={16} /> สมุดเงิน
          </span>
          <h1>เงินเข้า–ออกของฉัน</h1>
          <p>จดนิดเดียว ก็เห็นว่าเงินไปไหน</p>
        </div>
        <span className="year-tag">
          <LockKeyhole size={14} /> เก็บเฉพาะเครื่องนี้
        </span>
      </div>

      <div className="ledger-commandbar">
        <div className="statement-entry">
          <button
            className="primary statement-import-trigger"
            disabled={importBlocked}
            onClick={() => setStatementOpen(true)}
          >
            <FileUp size={22} aria-hidden="true" /> นำเข้า Statement
          </button>
          <span>
            <strong>เพิ่มหลายรายการจากไฟล์ธนาคาร</strong>
            <span>เลือกไฟล์ · ตรวจรายการ · เพิ่มลงสมุดเงิน</span>
          </span>
        </div>
        {statementOpen && (
          <StatementImport
            transactions={transactions}
            blocked={importBlocked}
            onClose={() => setStatementOpen(false)}
            onImport={(rows) => {
              setTransactions([...transactions, ...rows]);
              setAnchor(
                rows.reduce(
                  (latest, row) => (row.date > latest ? row.date : latest),
                  rows[0].date,
                ),
              );
              setPeriod("month");
              setQuery("");
              setFilterType("all");
              setFilterCategory("all");
              setStatementOpen(false);
              showToast(
                `นำเข้า ${rows.length} รายการแล้ว ตรวจสถานะบันทึกก่อนปิดเว็บ`,
              );
            }}
          />
        )}
        <div className="ledger-entry-actions">
          <button
            className="entry-action income-entry"
            onClick={() => openEntry("income")}
          >
            <span>
              <ArrowDownLeft size={28} />
            </span>
            <div>
              <strong>จดเงินเข้า</strong>
              <small>เงินเดือน · งานเสริม</small>
            </div>
            <Plus size={20} />
          </button>
          <button
            className="entry-action expense-entry"
            onClick={() => openEntry("expense")}
          >
            <span>
              <ArrowUpRight size={28} />
            </span>
            <div>
              <strong>จดเงินออก</strong>
              <small>อาหาร · เดินทาง · ช้อปปิ้ง</small>
            </div>
            <Plus size={20} />
          </button>
        </div>
      </div>
      {!transactions.length && (
        <p className="ledger-welcome">
          เริ่มจากค่าข้าวมื้อล่าสุด — จดเงินออก แล้วใส่จำนวนเงิน
        </p>
      )}
      <div className="period-toolbar">
        <div className="segment" role="group" aria-label="ช่วงเวลาสรุป">
          <button
            className={period === "week" ? "selected" : ""}
            aria-pressed={period === "week"}
            onClick={() => setPeriod("week")}
          >
            สัปดาห์
          </button>
          <button
            className={period === "month" ? "selected" : ""}
            aria-pressed={period === "month"}
            onClick={() => setPeriod("month")}
          >
            เดือน
          </button>
          <button
            className={period === "year" ? "selected" : ""}
            aria-pressed={period === "year"}
            onClick={() => setPeriod("year")}
          >
            ปี
          </button>
        </div>
        <div className="period-control">
          <button
            className="icon-button"
            onClick={() => setAnchor(shiftPeriod(anchor, period, -1))}
            aria-label="ช่วงก่อนหน้า"
          >
            <ChevronLeft size={19} />
          </button>
          <div>
            <strong>
              {period === "month"
                ? monthLabel
                : period === "year"
                  ? `ปี ${Number(anchor.slice(0, 4)) + 543}`
                  : "สรุปสัปดาห์"}
            </strong>
            <small>
              {dateLabel(range.start)}–{dateLabel(range.end)}
            </small>
          </div>
          <button
            className="icon-button"
            disabled={shiftPeriod(anchor, period, 1) > today()}
            onClick={() => setAnchor(shiftPeriod(anchor, period, 1))}
            aria-label="ช่วงถัดไป"
          >
            <ChevronRight size={19} />
          </button>
        </div>
        <button className="text-button" onClick={() => setAnchor(today())}>
          ช่วงปัจจุบัน
        </button>
      </div>
      <section className="ledger-balance" aria-label="สรุปเงินในช่วงที่เลือก">
        <div className="balance-stat balance-net">
          <span>ผลต่างช่วงนี้</span>
          <strong className={data.net < 0 ? "value-negative" : "value-neutral"}>
            {data.net < 0 ? "−" : ""}
            {fmt(Math.abs(data.net))} <small>บาท</small>
          </strong>
        </div>
        <div className="balance-stat">
          <span>เงินเข้า</span>
          <strong className="value-positive">
            {fmt(data.income)} <small>บาท</small>
          </strong>
        </div>
        <div className="balance-stat">
          <span>เงินออก</span>
          <strong className="value-negative">
            {fmt(data.expense)} <small>บาท</small>
          </strong>
        </div>
        <p>ผลต่างเฉพาะช่วงนี้ ไม่ใช่ยอดเงินในธนาคาร</p>
      </section>
      <details className="ledger-filter-panel">
        <summary>
          ค้นหาและกรอง
          {query || filterType !== "all" || filterCategory !== "all"
            ? " · กำลังใช้ตัวกรอง"
            : ""}
        </summary>
        <div className="ledger-tools">
          <label className="field" htmlFor="ledger-search">
            <span>ค้นหารายการ</span>
            <input
              id="ledger-search"
              type="search"
              placeholder="หมวด หมายเหตุ หรือจำนวนเงิน"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <label className="field" htmlFor="ledger-type">
            <span>ประเภท</span>
            <select
              id="ledger-type"
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setFilterCategory("all");
              }}
            >
              <option value="all">ทั้งหมด</option>
              <option value="income">เงินเข้า</option>
              <option value="expense">เงินออก</option>
            </select>
          </label>
          <label className="field" htmlFor="ledger-category">
            <span>หมวด</span>
            <select
              id="ledger-category"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">ทุกหมวด</option>
              {[
                ...new Set([
                  ...(filterType !== "expense"
                    ? categoryList(settings, "income")
                    : []),
                  ...(filterType !== "income"
                    ? categoryList(settings, "expense")
                    : []),
                ]),
              ].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>
      </details>
      {(query || filterType !== "all" || filterCategory !== "all") && (
        <div className="filter-note" role="status">
          ภาพรวมและตารางที่ดาวน์โหลด แสดงเฉพาะรายการที่ตรงกับตัวกรอง{" "}
          <button
            className="text-button"
            onClick={() => {
              setQuery("");
              setFilterType("all");
              setFilterCategory("all");
            }}
          >
            ล้างตัวกรอง
          </button>
        </div>
      )}
      {deleted && (
        <div className="undo-banner" role="status">
          <span>
            ลบ {deleted.category} {fmt(deleted.amount)} บาทแล้ว
          </span>
          <button
            className="secondary"
            onClick={() => {
              if (!transactions.some((t) => t.id === deleted.id))
                setTransactions([deleted, ...transactions]);
              setDeleted(null);
              showToast("คืนรายการแล้ว");
            }}
          >
            คืนรายการที่ลบ
          </button>
        </div>
      )}
      {settings.recurring.length > 0 && (
        <details className="panel recurring-panel">
          <summary>รายการประจำ · {settings.recurring.length} รายการ</summary>
          <p>สร้างรายการตามรอบในสมุดเงินเมื่อคุณยืนยัน ไม่เชื่อมบัญชีธนาคาร</p>
          {settings.recurring.map((rule) => (
            <div className="recurring-row" key={rule.id}>
              <div>
                <strong>
                  {rule.category} · {fmt(rule.amount)} บาท /{" "}
                  {rule.frequency === "week" ? "สัปดาห์" : "เดือน"}
                </strong>
                <small>รอบถัดไป {dateLabel(rule.nextDate)}</small>
              </div>
              <button
                className="text-button"
                onClick={() => setStopping(rule)}
                aria-label={`หยุดรายการประจำ ${rule.category}`}
              >
                หยุด
              </button>
            </div>
          ))}
          <button
            className="secondary"
            onClick={() => {
              try {
                const due = dueEntries(settings, transactions);
                if (!due.rows.length) {
                  showToast("ยังไม่มีรายการประจำที่ถึงกำหนด");
                  return;
                }
                setRepeatPreview(due);
              } catch (e) {
                showToast((e as Error).message);
              }
            }}
          >
            ตรวจรายการที่ถึงกำหนด
          </button>
        </details>
      )}
      <div className="quick-entry">
        <span>จดด่วน</span>
        {[
          ["อาหาร", Utensils],
          ["เดินทาง", Bus],
          ["ช้อปปิ้ง", ShoppingBag],
        ].map(([label, Icon]) => {
          const CategoryIcon = Icon as typeof Utensils;
          return (
            <button
              key={String(label)}
              onClick={() => openEntry("expense", String(label))}
            >
              <CategoryIcon size={19} />
              {String(label)}
              <Plus size={13} />
            </button>
          );
        })}
      </div>
      <div
        className={"ledger-layout " + (!data.expense ? "no-expense-chart" : "")}
      >
        <section className="panel transaction-list">
          <div className="panel-title">
            <h2>
              รายการในช่วงนี้ <small>{data.rows.length} รายการ</small>
            </h2>
            <button
              className="secondary small-button"
              onClick={exportCsv}
              disabled={!data.rows.length}
            >
              <Download size={16} /> ดาวน์โหลดตาราง (CSV)
            </button>
          </div>
          {data.rows.length ? (
            <div className="transaction-register">
              <div className="register-head" aria-hidden="true">
                <span>วันที่</span>
                <span>รายการ / หมวดหมู่</span>
                <span>จำนวนเงิน (บาท)</span>
                <span>จัดการ</span>
              </div>
              {data.rows.map((t) => (
                <article className="transaction" key={t.id}>
                  <span
                    className={
                      "transaction-icon " +
                      (t.type === "income" ? "green" : "accent-bg")
                    }
                  >
                    {t.type === "income" ? (
                      <ArrowDownLeft size={19} />
                    ) : (
                      <ArrowUpRight size={19} />
                    )}
                  </span>
                  <time className="transaction-date" dateTime={t.date}>
                    {dateLabel(t.date)}
                  </time>
                  <div className="transaction-info">
                    <strong>{t.category}</strong>
                    <small>
                      {t.note || (t.type === "income" ? "เงินเข้า" : "เงินออก")}
                    </small>
                  </div>
                  <strong
                    className={
                      "transaction-amount " +
                      (t.type === "income" ? "income-text" : "expense-text")
                    }
                  >
                    {t.type === "income" ? "+" : "−"}
                    {new Intl.NumberFormat("th-TH", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(t.amount / 100)}
                  </strong>
                  <div className="transaction-actions">
                    <button
                      className="icon-button"
                      aria-label={
                        "แก้รายการ " + t.category + " " + dateLabel(t.date)
                      }
                      onClick={() => {
                        setEditing(t);
                        setFormOpen(true);
                      }}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      className="icon-button"
                      aria-label={
                        "ลบรายการ " + t.category + " " + dateLabel(t.date)
                      }
                      onClick={() => setDeleting(t)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span>
                <BookOpen size={30} />
              </span>
              <h3>ยังไม่มีรายการในช่วงนี้</h3>
              <p>เลือกเงินเข้าหรือเงินออกด้านบน แล้วใส่จำนวนเงิน</p>
            </div>
          )}
        </section>
        {data.expense > 0 && (
          <aside className="panel category-summary">
            <h2>รายจ่ายแยกหมวด</h2>
            <p>อะไรเป็นส่วนใหญ่ของช่วงนี้?</p>
            {data.expense ? (
              categoryList(settings, "expense").map((category) => {
                const amount = data.rows
                  .filter(
                    (t) => t.type === "expense" && t.category === category,
                  )
                  .reduce((s, t) => s + t.amount, 0);
                return amount > 0 ? (
                  <div className="category-row" key={category}>
                    <div>
                      <span>{category}</span>
                      <b>{fmt(amount)} บาท</b>
                    </div>
                    <div className="bar-track">
                      <span
                        style={{ width: (amount / data.expense) * 100 + "%" }}
                      />
                    </div>
                    <small>
                      {Math.round((amount / data.expense) * 100)}% ของรายจ่าย
                    </small>
                  </div>
                ) : null;
              })
            ) : (
              <div className="empty-chart">
                <span className="empty-bar" />
                <span className="empty-bar" />
                <span className="empty-bar" />
                <p>
                  สรุปหมวดจะปรากฏ
                  <br />
                  เมื่อมีรายการรายจ่าย
                </p>
              </div>
            )}
            <details className="eligibility ledger-note-short">
              <summary>จดอะไรบ้าง?</summary>
              <p>
                เงินเข้า–ออกจริง ไม่รวมโอนระหว่างบัญชีตัวเอง
                สมุดเงินไม่เชื่อมคำนวณภาษีอัตโนมัติ
              </p>
            </details>
          </aside>
        )}
      </div>
      {formOpen && (
        <TransactionForm
          settings={settings}
          setSettings={setSettings}
          editing={editing}
          initialType={newType}
          initialCategory={newCategory}
          onClose={() => {
            setFormOpen(false);
            setEditing(null);
          }}
          onSave={save}
        />
      )}
      {stopping && (
        <Modal title="หยุดรายการประจำ?" onClose={() => setStopping(null)}>
          <p>หยุดสร้างรอบถัดไปของ {stopping.category} รายการที่จดไว้ยังอยู่</p>
          <button
            className="danger full"
            onClick={() => {
              setSettings({
                ...settings,
                recurring: settings.recurring.filter(
                  (r) => r.id !== stopping.id,
                ),
              });
              setStopping(null);
            }}
          >
            ยืนยันหยุดรายการประจำ
          </button>
        </Modal>
      )}
      {repeatPreview && (
        <Modal
          title="ยืนยันรายการประจำที่ถึงกำหนด"
          onClose={() => setRepeatPreview(null)}
        >
          <p>{repeatPreview.rows.length} รายการ · ตรวจวันที่และยอดก่อนเพิ่ม</p>
          <div className="repeat-preview">
            {repeatPreview.rows.map((row) => (
              <p key={row.id}>
                {dateLabel(row.date)} · {row.category} · {fmt(row.amount)} บาท
              </p>
            ))}
          </div>
          <button
            className="primary full"
            onClick={() => {
              setTransactions([...repeatPreview.rows, ...transactions]);
              setSettings(repeatPreview.settings);
              setRepeatPreview(null);
              showToast("เพิ่มรายการประจำที่ถึงกำหนดแล้ว");
            }}
          >
            ยืนยันเพิ่มรายการประจำ
          </button>
        </Modal>
      )}
      {deleting && (
        <Modal title="ลบรายการนี้?" onClose={() => setDeleting(null)}>
          <p>
            {deleting.category} · {fmt(deleting.amount)} บาท ·{" "}
            {dateLabel(deleting.date)}
          </p>
          <button
            className="danger full"
            onClick={() => {
              setDeleted(deleting);
              setTransactions(transactions.filter((t) => t.id !== deleting.id));
              setDeleting(null);
              showToast("ลบรายการแล้ว");
            }}
          >
            ยืนยันลบรายการ
          </button>
        </Modal>
      )}
    </section>
  );
}

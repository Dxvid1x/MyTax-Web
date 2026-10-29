import React, { useState, useRef } from "react";
import {
  categories,
  today,
  createTransaction,
  type Transaction,
} from "./ledger.ts";
import { categoryList, type LedgerSettings } from "./ledgerExtras.ts";
import { ArrowUpRight, ArrowDownLeft, Check } from "lucide-react";
import { MoneyField } from "./MoneyField.tsx";
import { Modal } from "./Modal.tsx";
export function TransactionForm({
  editing,
  initialType,
  initialCategory,
  onClose,
  onSave,
  settings,
  setSettings,
}: {
  editing: Transaction | null;
  initialType: "income" | "expense";
  initialCategory: string;
  onClose: () => void;
  onSave: (t: Transaction, frequency?: "week" | "month") => void;
  settings: LedgerSettings;
  setSettings: (s: LedgerSettings) => void;
}) {
  const [type, setType] = useState<"income" | "expense">(
    editing?.type || initialType,
  );
  const [amount, setAmount] = useState(
    editing ? (editing.amount / 100).toFixed(2) : "",
  );
  const [date, setDate] = useState(editing?.date || today());
  const [category, setCategory] = useState(
    editing?.category || initialCategory,
  );
  const [note, setNote] = useState(editing?.note || "");
  const [error, setError] = useState("");
  const [customName, setCustomName] = useState("");
  const [repeat, setRepeat] = useState(false);
  const [frequency, setFrequency] = useState<"week" | "month">("month");
  const submitting = useRef(false);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting.current) return;
    try {
      const transaction = createTransaction(
        type,
        amount,
        date,
        category,
        note.trim(),
        settings.customCategories[type],
      );
      submitting.current = true;
      onSave(transaction, !editing && repeat ? frequency : undefined);
    } catch (e) {
      setError((e as Error).message);
    }
  };
  return (
    <Modal
      title={
        editing ? "แก้ไขรายการ" : type === "income" ? "จดเงินเข้า" : "จดเงินออก"
      }
      onClose={onClose}
    >
      <form className={"entry-" + type} onSubmit={submit}>
        <div
          className="segment type-segment"
          role="group"
          aria-label="ประเภทรายการเงิน"
        >
          <button
            type="button"
            className={
              "expense-choice " + (type === "expense" ? "selected" : "")
            }
            aria-pressed={type === "expense"}
            onClick={() => {
              setType("expense");
              setCategory(categories.expense[0]);
            }}
          >
            <ArrowUpRight size={16} /> เงินออก
          </button>
          <button
            type="button"
            className={"income-choice " + (type === "income" ? "selected" : "")}
            aria-pressed={type === "income"}
            onClick={() => {
              setType("income");
              setCategory(categories.income[0]);
            }}
          >
            <ArrowDownLeft size={16} /> เงินเข้า
          </button>
        </div>
        <MoneyField
          id="transaction-amount"
          label="จำนวนเงิน"
          value={amount}
          onChange={setAmount}
          required
        />
        <div className="two-fields">
          <label className="field" htmlFor="transaction-date">
            <span>วันที่</span>
            <input
              id="transaction-date"
              type="date"
              min="1900-01-01"
              max={today()}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </label>
          <label className="field" htmlFor="transaction-category">
            <span>หมวด</span>
            <select
              id="transaction-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categoryList(settings, type).map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>
        <details className="custom-category">
          <summary>เพิ่มหมวดของฉัน</summary>
          <label className="field" htmlFor="custom-category">
            <span>ชื่อหมวดใหม่</span>
            <input
              id="custom-category"
              value={customName}
              maxLength={40}
              onChange={(e) => setCustomName(e.target.value)}
            />
          </label>
          <button
            type="button"
            className="secondary"
            onClick={() => {
              const name = customName.trim();
              if (
                !name ||
                name.length > 40 ||
                categoryList(settings, type).includes(name) ||
                settings.customCategories[type].length >= 32
              ) {
                setError(
                  "ใช้ชื่อหมวดใหม่ที่ไม่ซ้ำ ไม่เกิน 40 ตัวอักษร (สูงสุด 32 หมวดต่อประเภท)",
                );
                return;
              }
              setSettings({
                ...settings,
                customCategories: {
                  ...settings.customCategories,
                  [type]: [...settings.customCategories[type], name],
                },
              });
              setCategory(name);
              setCustomName("");
              setError("");
            }}
          >
            เพิ่มหมวดนี้
          </button>
        </details>
        {!editing && (
          <div className="repeat-fields">
            <label className="check-row">
              <input
                type="checkbox"
                checked={repeat}
                onChange={(e) => setRepeat(e.target.checked)}
              />
              เป็นรายการประจำ
            </label>
            {repeat && (
              <label className="field" htmlFor="repeat-frequency">
                <span>รอบรายการ</span>
                <select
                  id="repeat-frequency"
                  value={frequency}
                  onChange={(e) =>
                    setFrequency(e.target.value as "week" | "month")
                  }
                >
                  <option value="month">ทุกเดือน</option>
                  <option value="week">ทุกสัปดาห์</option>
                </select>
                <small>รอบนี้จดทันที รอบถัดไปจะรอให้คุณยืนยันก่อนเพิ่ม</small>
              </label>
            )}
          </div>
        )}
        <label className="field" htmlFor="transaction-note">
          <span>
            หมายเหตุ <small>ไม่บังคับ</small>
          </span>
          <input
            id="transaction-note"
            value={note}
            maxLength={250}
            placeholder="เช่น อาหารกลางวัน"
            onChange={(e) => setNote(e.target.value)}
          />
        </label>
        {error && (
          <p className="inline-error" role="alert">
            {error}
          </p>
        )}
        <button className="primary full" type="submit">
          <Check size={17} /> {editing ? "บันทึกการแก้ไข" : "เพิ่มรายการ"}
        </button>
      </form>
    </Modal>
  );
}

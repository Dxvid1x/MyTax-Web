import { useEffect, useRef, useState } from "react";
import { canonicalMoneyInput, inputMoney, moneyDisplay } from "./moneyInput.ts";

export function MoneyField({
  label,
  value,
  onChange,
  hint,
  id,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  id: string;
  required?: boolean;
}) {
  const display = (v: string) =>
    !required && v === "0" ? "" : moneyDisplay(v);
  const [draft, setDraft] = useState(() => display(value));
  const focused = useRef(false);
  useEffect(() => {
    if (!focused.current)
      setDraft(!required && value === "0" ? "" : moneyDisplay(value));
  }, [value, required]);
  let invalid = "";
  if (draft) {
    try {
      inputMoney(draft);
    } catch {
      invalid = "ใช้ตัวเลข 0–1,000,000,000 และทศนิยมไม่เกิน 2 ตำแหน่ง";
    }
  }
  const commit = (text: string) => {
    try {
      onChange(text ? canonicalMoneyInput(text) : required ? "" : "0");
    } catch {
      onChange(text);
    }
  };
  return (
    <div className="field">
      <label htmlFor={id}>
        {label}
        {required && <span className="required"> *</span>}
      </label>
      <div className={"input-wrap " + (invalid ? "invalid" : "")}>
        <input
          id={id}
          inputMode="decimal"
          value={draft}
          placeholder="กรอกจำนวนเงิน"
          aria-required={required}
          aria-invalid={!!invalid}
          aria-describedby={id + "-hint"}
          autoComplete="off"
          onFocus={() => {
            focused.current = true;
          }}
          onChange={(e) => {
            setDraft(e.target.value);
            commit(e.target.value);
          }}
          onBlur={() => {
            focused.current = false;
            setDraft(moneyDisplay(draft));
          }}
        />
        <span>บาท</span>
      </div>
      <small
        id={id + "-hint"}
        className={invalid ? "error-text" : ""}
        aria-live="polite"
      >
        {invalid || hint}
      </small>
    </div>
  );
}

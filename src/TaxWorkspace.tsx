import { SalarySlip } from "./SalarySlip.tsx";
import { ScopeCheck } from "./ScopeCheck.tsx";
import { ExtendedDeductions } from "./ExtendedDeductions.tsx";
import { useState, useEffect, useRef } from "react";
import { rulesFor, type TaxPlan, type TaxYear } from "./tax.ts";

import {
  Wallet,
  Calculator,
  ShieldPlus,
  Handshake,
  ArrowUpRight,
  Plus,
  X,
  Check,
  ChevronRight,
  Sparkles,
  CircleHelp,
  Coins,
  ReceiptText,
  Heart,
  ArrowRight,
  Building2,
  CalendarDays,
  History,
} from "lucide-react";
import { MoneyField } from "./MoneyField.tsx";
import { fmt, safeMoney, SourceDetails } from "./taxDisplay.tsx";
import { Result } from "./Result.tsx";
import { annualFromMonthly } from "./moneyInput.ts";
import { validateTaxStep } from "./validation.ts";
import { liveEstimate, switchTaxYear } from "./taxUx.ts";
import "./wizardProgress.css";
export function TaxWorkspace({
  plan,
  setPlan,
  onLedger,
  onSalaryImport,
  saveStatus,
  onSave,
  onReduce,
  onStepChange,
  initialStep = 1,
}: {
  onSalaryImport: () => void;
  saveStatus: string;
  onSave: () => void;
  initialStep?: number;
  onStepChange: (step: number) => void;
  onReduce: () => void;
  plan: TaxPlan;
  setPlan: (p: TaxPlan) => void;
  onLedger: () => void;
}) {
  const step = initialStep;
  const rules = rulesFor(plan);
  const stepHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    requestAnimationFrame(() => {
      if (step === 4) document.getElementById("tax-result-heading")?.focus();
      else stepHeading.current?.focus();
    });
  }, [step]);
  const [error, setError] = useState("");
  const [monthly, setMonthly] = useState("");
  const [months, setMonths] = useState("12");
  const [incomeMode, setIncomeMode] = useState<"annual" | "monthly">(
    plan.salary ? "annual" : "monthly",
  );
  const [paidChoice, setPaidChoice] = useState<"yes" | "no" | "unknown">(
    plan.withholding.trim() === ""
      ? "unknown"
      : safeMoney(plan.withholding) > 0
        ? "yes"
        : "no",
  );
  const update = (key: keyof TaxPlan, value: string | boolean) => {
    setPlan({ ...plan, [key]: value });
    setError("");
  };
  const go = (value: number) => {
    onStepChange(value);
    setError("");
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  const next = () => {
    const issue = validateTaxStep(plan, step, paidChoice);
    if (issue) {
      setError(issue.message);
      requestAnimationFrame(() => {
        const id =
          issue.id === "salary" && incomeMode === "monthly"
            ? "monthly"
            : issue.id;
        const field = document.getElementById(id);
        let parent = field?.parentElement;
        while (parent) {
          if (parent instanceof HTMLDetailsElement) parent.open = true;
          parent = parent.parentElement;
        }
        field?.focus();
        field?.scrollIntoView({ block: "center", behavior: "smooth" });
      });
      return;
    }
    go(step + 1);
  };
  const monthlyIncome = (value: string, count: string) => {
    setMonthly(value);
    setMonths(count);
    try {
      update("salary", annualFromMonthly(value, Number(count)));
    } catch {
      update("salary", value);
    }
  };
  const gross = safeMoney(plan.salary) + safeMoney(plan.bonus);
  const preview = liveEstimate(plan);
  const labels = ["รายได้", "ลดหย่อน", "จ่ายไว้แล้ว", "ผลภาษี"];
  const selectYear = (taxYear: TaxYear) => {
    if (taxYear === (plan.taxYear ?? "2568")) return;
    setPlan(switchTaxYear(plan, taxYear));
    setError("");
  };
  return (
    <section className="workspace tax-beginner">
      {step < 4 && (
        <div className="page-head">
          <div>
            <span className="section-kicker">
              <Calculator size={16} /> คำนวณภาษี
            </span>
            <h1 ref={stepHeading} tabIndex={-1}>
              {
                [
                  "เริ่มจากเงินเดือนของคุณ",
                  "มีอะไรช่วยลดภาษีบ้าง?",
                  "บริษัทหักภาษีให้แล้วไหม?",
                  "ภาษีของฉัน",
                ][step - 1]
              }
            </h1>
            <p>
              {
                [
                  "กรอกเงินเดือนก่อนหักภาษี",
                  "เลือกเฉพาะรายการที่มี ที่เหลือข้ามได้",
                  "เช็กเงินที่จ่ายภาษีล่วงหน้า ก่อนดูผล",
                  "ประมาณการจากข้อมูลของคุณ",
                ][step - 1]
              }
            </p>
          </div>
          {step > 1 && (
            <span className="year-tag">
              ปี {rules.year} / {rules.year - 543}
            </span>
          )}
        </div>
      )}
      {step === 1 && (
        <div className="year-choice">
          <span id="tax-year-label">ใช้รายได้ปีไหน?</span>
          <div
            className="year-options"
            role="group"
            aria-labelledby="tax-year-label"
          >
            {(
              [
                { year: "2569", label: "วางแผนปีนี้", Icon: CalendarDays },
                { year: "2568", label: "ตรวจย้อนหลัง", Icon: History },
              ] as const
            ).map(({ year, label, Icon }) => (
              <button
                type="button"
                key={year}
                aria-pressed={(plan.taxYear ?? "2568") === year}
                onClick={() => selectYear(year)}
              >
                <Icon size={20} aria-hidden="true" />
                <span>
                  <b>
                    {year} / {Number(year) - 543}
                  </b>
                  <span>{label}</span>
                </span>
              </button>
            ))}
          </div>
          <small>
            {rules.year === 2569
              ? "กรอกยอดทั้งปีที่คาดไว้เพื่อวางแผน ผลอาจเปลี่ยนเมื่อรายได้หรือกฎเปลี่ยน"
              : "ใช้รายได้และรายการจ่ายในปี 2025 การซื้อวันนี้ไม่ลดภาษีย้อนหลัง"}
          </small>
        </div>
      )}
      <div className="wizard-progress">
        <div
          className="wizard-tube"
          role="progressbar"
          aria-label="ความคืบหน้าการคำนวณภาษี"
          aria-valuemin={1}
          aria-valuemax={4}
          aria-valuenow={step}
          aria-valuetext={`ขั้น ${step} จาก 4: ${labels[step - 1]}`}
        >
          <span
            className="wizard-tube-fill"
            style={{ width: `${((step - 1) / 3) * 100}%` }}
          />
        </div>
        <ol className="steps beginner-steps">
          {labels.map((label, i) => (
            <li
              aria-current={step === i + 1 ? "step" : undefined}
              className={
                step === i + 1 ? "current" : step > i + 1 ? "complete" : ""
              }
              key={label}
            >
              <button
                type="button"
                aria-current={step === i + 1 ? "step" : undefined}
                aria-label={`ขั้น ${i + 1} ${label}${step > i + 1 ? " ทำแล้ว กลับไปแก้ไข" : step < i + 1 ? " ยังไม่ถึง" : " ขั้นปัจจุบัน"}`}
                disabled={
                  i + 1 > step || (i + 1 < step && !!validateTaxStep(plan, 1))
                }
                onClick={() => go(i + 1)}
              >
                <span>{step > i + 1 ? <Check size={17} /> : i + 1}</span>
                {label}
              </button>
            </li>
          ))}
        </ol>
      </div>
      {step < 4 ? (
        <div className="tax-layout">
          <section className="panel form-panel question-panel" key={step}>
            <div className="panel-title">
              <h2>
                {
                  [
                    "เงินเดือน + โบนัส",
                    "ค่าลดหย่อนของคุณ",
                    "ภาษีที่บริษัทหักจากเงินเดือน",
                  ][step - 1]
                }
              </h2>
              <span>{step} / 4</span>
            </div>
            {step === 1 ? (
              <>
                <div
                  className="segment income-mode"
                  role="group"
                  aria-label="วิธีกรอกเงินเดือน"
                >
                  <button
                    aria-pressed={incomeMode === "monthly"}
                    className={incomeMode === "monthly" ? "selected" : ""}
                    onClick={() => {
                      setIncomeMode("monthly");
                      if (plan.salary) {
                        setMonthly(
                          (
                            safeMoney(plan.salary) /
                            100 /
                            Number(months)
                          ).toFixed(2),
                        );
                      }
                    }}
                  >
                    รู้เงินเดือนต่อเดือน
                  </button>
                  <button
                    aria-pressed={incomeMode === "annual"}
                    className={incomeMode === "annual" ? "selected" : ""}
                    onClick={() => setIncomeMode("annual")}
                  >
                    รู้ยอดทั้งปี
                  </button>
                </div>
                {incomeMode === "monthly" ? (
                  <div className="two-fields salary-questions">
                    <MoneyField
                      id="monthly"
                      label="เงินเดือนต่อเดือน"
                      value={monthly}
                      onChange={(v) => monthlyIncome(v, months)}
                      required
                      hint="ดูยอดก่อนหักจากสลิปเงินเดือน ไม่ใช่เงินที่เข้าบัญชี"
                    />
                    <label className="field">
                      <span>ได้รับกี่เดือน?</span>
                      <select
                        value={months}
                        onChange={(e) => monthlyIncome(monthly, e.target.value)}
                      >
                        {Array.from({ length: 12 }, (_, i) => (
                          <option key={i} value={i + 1}>
                            {i + 1} เดือน
                          </option>
                        ))}
                      </select>
                      <small>ทำงานทั้งปี เลือก 12 เดือน</small>
                    </label>
                  </div>
                ) : (
                  <MoneyField
                    id="salary"
                    label="เงินเดือนรวมทั้งปี"
                    value={plan.salary}
                    onChange={(v) => update("salary", v)}
                    required
                    hint="ดูหนังสือรับรอง 50 ทวิ ใช้ยอดก่อนหักและไม่รวมโบนัส"
                  />
                )}
                <SalarySlip annual={incomeMode === "annual"} />
                <MoneyField
                  id="bonus"
                  label="โบนัสรวมทั้งปี"
                  value={plan.bonus}
                  onChange={(v) => update("bonus", v)}
                  hint="ไม่มี เว้นว่างได้ (ใช้ยอด 0 บาท) · ถ้ารวมในเงินเดือนแล้วไม่ใส่ซ้ำ"
                />
                <div className="income-equation">
                  <span>
                    <Wallet size={18} /> เงินเดือนทั้งปี
                    <b>{fmt(safeMoney(plan.salary))}</b>
                  </span>
                  <i>+</i>
                  <span>
                    <Sparkles size={18} /> โบนัส
                    <b>{fmt(safeMoney(plan.bonus))}</b>
                  </span>
                  <i>=</i>
                  <span className="equation-total">
                    รายได้รวม
                    <b>
                      {fmt(gross)} <small>บาท</small>
                    </b>
                  </span>
                </div>
                <button
                  type="button"
                  className="secondary salary-import"
                  onClick={onSalaryImport}
                >
                  นำเงินเดือนจากสมุดเงินมาใส่
                </button>
              </>
            ) : step === 2 ? (
              <>
                <details className="scope-helper">
                  <summary>ไม่แน่ใจว่ามีสิทธิ์อะไร? ช่วยฉันเลือก</summary>
                  <ScopeCheck
                    stage="deductions"
                    plan={plan}
                    setPlan={setPlan}
                  />
                </details>
                <div className="automatic">
                  <div>
                    <Check size={18} />
                    <span>ค่าลดหย่อนส่วนตัว</span>
                  </div>
                  <strong>60,000 บาท</strong>
                  <small>ระบบนำมาคำนวณให้แล้ว</small>
                </div>
                <p className="picker-instruction">
                  แตะรายการที่มี แล้วใส่ยอดทั้งปี
                </p>
                <div className="deduction-tiles">
                  <details className="deduction-tile" name="mytax-deductions">
                    <summary>
                      <Handshake size={25} aria-hidden="true" />
                      <span>
                        ประกันสังคม
                        <small>
                          {safeMoney(plan.social) > 0
                            ? fmt(safeMoney(plan.social)) + " บาท"
                            : "ม.33"}
                        </small>
                      </span>
                      <Plus size={17} className="tile-plus" />
                    </summary>
                    <div>
                      <MoneyField
                        id="social"
                        label="ประกันสังคมที่จ่ายทั้งปี"
                        value={plan.social}
                        onChange={(v) => update("social", v)}
                        hint={`ใช้ยอดของคุณที่จ่ายจริง · สูงสุด ${rules.socialCap.toLocaleString("th-TH")} บาท/ปี สำหรับ ม.33 อัตราปกติ ทำงานไม่ครบปีหรือมีลดอัตราให้ใช้ยอดจริง`}
                      />
                    </div>
                  </details>
                  <details className="deduction-tile" name="mytax-deductions">
                    <summary>
                      <ShieldPlus size={25} aria-hidden="true" />
                      <span>
                        ประกันชีวิต
                        <small>
                          {safeMoney(plan.life) > 0
                            ? fmt(safeMoney(plan.life)) + " บาท"
                            : "ของตัวเอง"}
                        </small>
                      </span>
                      <Plus size={17} className="tile-plus" />
                    </summary>
                    <div>
                      <MoneyField
                        id="life"
                        label="เบี้ยประกันชีวิตที่ใช้สิทธิ์ได้"
                        value={plan.life}
                        onChange={(v) => update("life", v)}
                        hint="สูงสุด 100,000 บาท"
                      />
                      <details className="eligibility">
                        <summary>เงื่อนไขประกันชีวิต</summary>
                        <p>
                          ตรวจหนังสือรับรองว่าเป็นเบี้ยที่ใช้สิทธิ์ได้
                          กรมธรรม์อย่างน้อย 10 ปี บริษัทในไทย
                          เข้าเงื่อนไขเงินคืน ไม่รวมเบี้ยความคุ้มครองเพิ่มเติม
                        </p>
                      </details>
                      {safeMoney(plan.life) > 0 && (
                        <label className="check-row">
                          <input
                            type="checkbox"
                            id="lifeEligible"
                            checked={plan.lifeEligible}
                            onChange={(e) =>
                              update("lifeEligible", e.target.checked)
                            }
                          />
                          <span>
                            ตรวจหนังสือรับรองและเงื่อนไขประกันชีวิตแล้ว
                          </span>
                        </label>
                      )}
                    </div>
                  </details>
                  <details className="deduction-tile" name="mytax-deductions">
                    <summary>
                      <Heart size={25} />
                      <span>
                        ประกันสุขภาพ
                        <small>
                          {safeMoney(plan.health) > 0
                            ? fmt(safeMoney(plan.health)) + " บาท"
                            : "ของตัวเอง"}
                        </small>
                      </span>
                      <Plus size={17} className="tile-plus" />
                    </summary>
                    <div>
                      <MoneyField
                        id="health"
                        label="เบี้ยประกันสุขภาพทั้งปี"
                        value={plan.health}
                        onChange={(v) => update("health", v)}
                        hint="สูงสุด 25,000 บาท; รวมชีวิตสูงสุด 100,000 บาท"
                      />
                      {safeMoney(plan.health) > 0 && (
                        <label className="check-row">
                          <input
                            type="checkbox"
                            id="healthEligible"
                            checked={plan.healthEligible}
                            onChange={(e) =>
                              update("healthEligible", e.target.checked)
                            }
                          />
                          <span>
                            เป็นประกันของฉัน มีหลักฐาน
                            และแจ้งใช้สิทธิ์กับบริษัทประกันในไทยแล้ว
                          </span>
                        </label>
                      )}
                    </div>
                  </details>
                  <details className="deduction-tile" name="mytax-deductions">
                    <summary>
                      <Coins size={25} />
                      <span>
                        กองทุน RMF
                        <small>
                          {safeMoney(plan.rmf) > 0
                            ? fmt(safeMoney(plan.rmf)) + " บาท"
                            : "ออมเพื่อเกษียณ"}
                        </small>
                      </span>
                      <Plus size={17} className="tile-plus" />
                    </summary>
                    <div>
                      <MoneyField
                        id="rmf"
                        label="ค่าซื้อ RMF ทั้งปี"
                        value={plan.rmf}
                        onChange={(v) => update("rmf", v)}
                        hint="สูงสุด 30% ของรายได้ และไม่เกิน 500,000 บาท"
                      />
                      <details className="eligibility">
                        <summary>เงื่อนไข RMF</summary>
                        <p>
                          ซื้อที่มีสิทธิ์ปี {rules.year} ไม่ใช่โอนจาก PVD
                          แจ้งใช้สิทธิ์ ซื้ออย่างต่อเนื่องตามเกณฑ์ ถืออย่างน้อย
                          5 ปีนับจากครั้งแรกจนถึงอายุ 55 ปี (ข้อยกเว้นดูคู่มือ)
                          รองรับ PVD/กบข. ที่กรอกไว้
                          กองทุนเกษียณอื่นยังต้องตรวจเพิ่มเติม
                        </p>
                      </details>
                      {safeMoney(plan.rmf) > 0 && (
                        <label className="check-row">
                          <input
                            type="checkbox"
                            id="rmfEligible"
                            checked={plan.rmfEligible}
                            onChange={(e) =>
                              update("rmfEligible", e.target.checked)
                            }
                          />
                          <span>
                            ตรวจเงื่อนไข RMF และยอด PVD/กบข. ในแผนแล้ว
                          </span>
                        </label>
                      )}
                    </div>
                  </details>
                </div>
                <p className="form-note">
                  ไม่มีรายการไหน ข้ามได้ · ยอดที่กรอกยังถูกคำนวณแม้ปิดกล่อง
                </p>
                <ExtendedDeductions plan={plan} setPlan={setPlan} />
              </>
            ) : (
              <>
                <div className="payroll-story">
                  <div className="payroll-from">
                    <Building2 size={30} />
                    <strong>บริษัท</strong>
                  </div>
                  <div className="payroll-path" aria-hidden="true">
                    <ArrowRight size={24} />
                  </div>
                  <div className="payroll-destinations">
                    <div>
                      <Wallet size={23} />
                      <span>เงินเดือนเข้าบัญชีคุณ</span>
                    </div>
                    <div>
                      <ReceiptText size={23} />
                      <span>
                        ส่วนหนึ่งส่งกรมสรรพากร<b>นี่คือภาษีที่จ่ายไว้แล้ว</b>
                      </span>
                    </div>
                  </div>
                </div>
                <p className="prepaid-copy">
                  บริษัทอาจหักเงินเดือนบางส่วนไปจ่ายภาษีแทนคุณทุกเดือน
                  เราจะนำยอดนั้นมาหักจากภาษีทั้งปีอีกที
                </p>
                <div
                  className="paid-choices"
                  role="group"
                  aria-label="บริษัทหักภาษีแล้วหรือยัง"
                >
                  {(
                    [
                      ["yes", "มี หักไว้แล้ว", ReceiptText],
                      ["no", "ไม่มี", X],
                      ["unknown", "ยังไม่รู้ยอด", CircleHelp],
                    ] as const
                  ).map(([choice, label, Icon]) => (
                    <button
                      key={choice}
                      className={paidChoice === choice ? "selected" : ""}
                      aria-pressed={paidChoice === choice}
                      onClick={() => {
                        setPaidChoice(choice);
                        update(
                          "withholding",
                          choice === "no"
                            ? "0"
                            : choice === "unknown"
                              ? ""
                              : safeMoney(plan.withholding) > 0
                                ? plan.withholding
                                : "",
                        );
                      }}
                    >
                      <Icon size={22} />
                      {label}
                    </button>
                  ))}
                </div>
                {paidChoice === "yes" ? (
                  <>
                    <MoneyField
                      id="withholding"
                      label="บริษัทหักภาษีไว้รวมทั้งปีเท่าไร?"
                      value={plan.withholding}
                      onChange={(v) => update("withholding", v)}
                      required
                      hint="ใช้ยอดภาษีที่หักไว้ทั้งปี ไม่ใช่เงินเดือนหรือประกันสังคม"
                    />
                    <details className="where-to-find">
                      <summary>
                        <CircleHelp size={16} /> หาตัวเลขนี้จากไหน?
                      </summary>
                      <div className="certificate-example">
                        <span>หนังสือรับรองการหักภาษี ณ ที่จ่าย (50 ทวิ)</span>
                        <div>
                          <span>เงินได้ที่จ่าย</span>
                          <span>ภาษีที่หักและนำส่งไว้</span>
                        </div>
                        <div>
                          <span>ยอดรายได้ทั้งปี</span>
                          <strong>ใช้ยอดรวมช่องนี้ ↑</strong>
                        </div>
                      </div>
                      <p>
                        ขอเอกสารจากฝ่ายบุคคล ถ้ามีหลายบริษัท
                        ให้รวมยอดภาษีจากทุกใบของปี {rules.year}
                      </p>
                    </details>
                  </>
                ) : (
                  <div className="paid-note">
                    <CircleHelp size={19} />
                    <span>
                      {paidChoice === "unknown"
                        ? "ข้ามได้ ดูภาษีทั้งปีก่อน แล้วกลับมาใส่ยอดเพื่อเช็กจ่ายเพิ่ม / ขอคืน"
                        : "ใช้ยอดที่จ่ายล่วงหน้า 0 บาท เพื่อเทียบกับภาษีทั้งปี"}
                    </span>
                  </div>
                )}
                <ScopeCheck stage="review" plan={plan} setPlan={setPlan} />
                <div className="prepaid-example">
                  <span>ตัวอย่างวิธีเทียบ</span>
                  <div>
                    <span>
                      ภาษีทั้งปี<b>10,000</b>
                    </span>
                    <i>−</i>
                    <span>
                      บริษัทจ่ายไว้<b>8,000</b>
                    </span>
                    <i>=</i>
                    <span>
                      จ่ายเพิ่ม
                      <b>
                        2,000 <small>บาท</small>
                      </b>
                    </span>
                  </div>
                </div>
              </>
            )}
            {error && (
              <p className="inline-error" role="alert">
                {error}
              </p>
            )}
            <div className="form-actions">
              {step > 1 ? (
                <button className="secondary" onClick={() => go(step - 1)}>
                  ย้อนกลับ
                </button>
              ) : (
                <button className="text-button" onClick={onSave}>
                  {saveStatus}
                </button>
              )}
              <button className="primary" onClick={next}>
                {step === 3 ? "ดูผลของฉัน" : "ต่อไป"} <ChevronRight size={17} />
              </button>
            </div>
          </section>
          <aside className="tax-side">
            <div className="live-tax panel" aria-label="ผลประมาณการระหว่างกรอก">
              <h2>ภาษีทั้งปีโดยประมาณ</h2>
              {preview.result ? (
                <p className="live-tax-amount">
                  <strong>{fmt(preview.result.tax)}</strong> บาท
                </p>
              ) : (
                <p className="live-tax-pending">ยังคำนวณไม่ได้</p>
              )}
              <p>{preview.reason}</p>
              <small>
                ผลอาจเปลี่ยนเมื่อกรอกข้อมูลครบ ตรวจหลักฐานก่อนยื่นจริง
              </small>
            </div>
            <SourceDetails plan={plan} />
          </aside>
        </div>
      ) : (
        <Result
          onReduce={onReduce}
          plan={plan}
          onWithholding={() => go(3)}
          onEdit={() => go(1)}
        />
      )}
      {step === 4 && (
        <div className="next-ledger">
          <span>ดูเงินเข้า–ออกต่อในสมุดเงิน</span>
          <button onClick={onLedger}>
            เปิดสมุดเงิน <ArrowUpRight size={16} />
          </button>
        </div>
      )}
    </section>
  );
}

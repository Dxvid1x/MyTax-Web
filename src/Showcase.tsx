import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  RotateCcw,
  ShieldCheck,
  ArrowDownRight,
} from "lucide-react";
import { demoPlan, rulesFor } from "./tax.ts";
import { deductionScenario } from "./deductionScenario.ts";
import "./showcase.css";

const copy = {
  en: {
    eyebrow: "MYTAX / INTERACTIVE DEMO",
    title: "Understand the decision. Not just the tax.",
    intro:
      "A private space to understand salary tax in Thailand. Explore a fictional case, then see what a different decision changes.",
    sample:
      "Fictional data · Thai tax year 2025 · No changes to your personal plan",
    steps: ["Meet the example", "Understand", "Compare"],
    profile: "A year of work. One clear picture.",
    salary: "Monthly salary",
    bonus: "Annual bonus",
    rmf: "Existing annual RMF contribution",
    baseline: "Estimated annual tax",
    after: "Tax with the scenario",
    saving: "Estimated tax reduction",
    income: "Annual salary + bonus",
    taxable: "Taxable income after deductions",
    compare: "Compare a scenario",
    see: "See the calculation",
    back: "Back",
    restart: "Restart demo",
    scenario: "What if you contribute more?",
    scenarioIntro:
      "Keep income and other deductions unchanged. Try an additional RMF contribution and compare the trade-off.",
    extra: "Additional RMF contribution",
    contribution: "Extra money contributed",
    outlay: "Extra contribution minus tax reduction",
    explain:
      "The contribution remains invested, subject to RMF conditions. The figure above is a cash-flow comparison, not an investment loss. Tax reduction is not an immediate cash refund or an investment return.",
    qualification:
      "This example assumes RMF eligibility. It uses 2025 rules to explain the calculation; contributions made today cannot reduce past-year tax. No investment recommendation or return filing is provided.",
    assumptions: "Assumptions & calculation sources",
    deductions:
      "Existing deductions: personal allowance ฿60,000; social security ฿9,000; life insurance ฿20,000; health insurance ฿15,000; RMF ฿30,000. Salary expense deduction: ฿100,000. All eligibility conditions are assumed satisfied.",
    checked: "Rule review date recorded in this release",
    privacy:
      "Runs in your browser. This demo does not save or apply its figures to your personal plan.",
    cta: "Ready to explore your own numbers?",
    start: "Open the Thai calculator",
    scope:
      "The main calculator is currently in Thai. English is available for this presentation demo only.",
  },
  th: {
    eyebrow: "MYTAX / เดโมทดลองใช้งาน",
    title: "เข้าใจการตัดสินใจ มากกว่าตัวเลขภาษี",
    intro:
      "พื้นที่ส่วนตัวเพื่อเข้าใจภาษีเงินเดือนในไทย เริ่มจากเรื่องราวสมมติ แล้วลองดูว่าทางเลือกใหม่ทำให้ตัวเลขเปลี่ยนอย่างไร",
    sample: "ข้อมูลสมมติ · ปีภาษี 2568 / 2025 · ไม่เปลี่ยนแผนส่วนตัวของคุณ",
    steps: ["รู้จักตัวอย่าง", "เข้าใจผล", "เปรียบเทียบ"],
    profile: "ทำงานทั้งปี เห็นภาพในหน้าเดียว",
    salary: "เงินเดือนต่อเดือน",
    bonus: "โบนัสทั้งปี",
    rmf: "ยอด RMF เดิมทั้งปี",
    baseline: "ภาษีทั้งปีโดยประมาณ",
    after: "ภาษีเมื่อปรับตามตัวอย่าง",
    saving: "ภาษีที่ลดลงโดยประมาณ",
    income: "เงินเดือน + โบนัสทั้งปี",
    taxable: "เงินได้สุทธิหลังหักค่าใช้จ่ายและลดหย่อน",
    compare: "ลองเปรียบเทียบทางเลือก",
    see: "ดูผลคำนวณ",
    back: "ย้อนกลับ",
    restart: "เริ่มเดโมใหม่",
    scenario: "ถ้าเพิ่มยอดลงทุน จะเปลี่ยนอะไร?",
    scenarioIntro:
      "รายได้และค่าลดหย่อนอื่นคงเดิม ลองเพิ่มยอด RMF แล้วเปรียบเทียบภาษีที่ลดลงกับเงินที่ต้องใช้",
    extra: "ยอด RMF ที่เพิ่มจากเดิม",
    contribution: "เงินที่ต้องลงทุนเพิ่ม",
    outlay: "เงินลงทุนเพิ่ม หักภาษีที่ลดลง",
    explain:
      "เงินลงทุนยังอยู่ในกองทุนและมีเงื่อนไข RMF ตัวเลขนี้ใช้เปรียบเทียบกระแสเงินสด ไม่ใช่ผลขาดทุน ภาษีที่ลดลงไม่ใช่เงินคืนทันทีหรือผลตอบแทนจากการลงทุน",
    qualification:
      "สมมติว่าผ่านเงื่อนไข RMF แล้ว ใช้กฎปี 2568 เพื่ออธิบายตัวอย่าง การซื้อวันนี้ไม่ลดภาษีย้อนหลัง ไม่ใช่คำแนะนำลงทุนหรือบริการยื่นภาษี",
    assumptions: "สมมติฐานและแหล่งข้อมูล",
    deductions:
      "ลดหย่อนเดิม: ส่วนตัว 60,000 บาท ประกันสังคม 9,000 บาท ประกันชีวิต 20,000 บาท ประกันสุขภาพ 15,000 บาท RMF 30,000 บาท หักค่าใช้จ่ายเงินเดือน 100,000 บาท สมมติว่าผ่านเงื่อนไขสิทธิ์ทุกรายการแล้ว",
    checked: "วันที่ตรวจทานกฎที่บันทึกไว้ในรุ่นนี้",
    privacy:
      "คำนวณในเบราว์เซอร์ เดโมนี้ไม่บันทึกหรือใช้ตัวเลขแทนแผนส่วนตัวของคุณ",
    cta: "พร้อมลองกับตัวเลขของคุณแล้ว?",
    start: "เปิดเครื่องคำนวณภาษาไทย",
    scope:
      "เครื่องคำนวณหลักยังเป็นภาษาไทย ส่วนเดโมนำเสนอนี้สลับไทยและอังกฤษได้",
  },
};

export default function Showcase({ onStart }: { onStart: () => void }) {
  const [language, setLanguage] = useState<"en" | "th">("en");
  const [step, setStep] = useState(0);
  const [additional, setAdditional] = useState(30000);
  const heading = useRef<HTMLHeadingElement>(null);
  const previousStep = useRef(step);
  useEffect(() => {
    if (previousStep.current !== step) heading.current?.focus();
    previousStep.current = step;
  }, [step]);
  const t = copy[language];
  const plan = demoPlan();
  const rules = rulesFor(plan);
  const comparison = deductionScenario(
    plan,
    "rmf",
    String(30000 + additional),
    true,
  );
  const fmt = (satang: number) =>
    `฿${new Intl.NumberFormat(language === "en" ? "en-GB" : "th-TH", { maximumFractionDigits: 0 }).format(satang / 100)}`;
  const restart = () => {
    setAdditional(30000);
    setStep(0);
  };
  return (
    <section
      className="showcase workspace"
      lang={language}
      aria-labelledby="showcase-title"
    >
      <div className="showcase-topline">
        <span className="showcase-eyebrow">{t.eyebrow}</span>
        <div
          className="showcase-language"
          role="group"
          aria-label={language === "en" ? "Demo language" : "ภาษาเดโม"}
        >
          <button
            aria-pressed={language === "en"}
            onClick={() => setLanguage("en")}
          >
            English
          </button>
          <button
            aria-pressed={language === "th"}
            onClick={() => setLanguage("th")}
          >
            ไทย
          </button>
        </div>
      </div>
      <header className="showcase-heading">
        <h1 id="showcase-title">{t.title}</h1>
        <p>{t.intro}</p>
      </header>
      <p className="showcase-sample">{t.sample}</p>
      <nav
        className="showcase-steps"
        aria-label={language === "en" ? "Demo steps" : "ขั้นตอนเดโม"}
      >
        {t.steps.map((label, index) => (
          <button
            key={index}
            aria-current={index === step ? "step" : undefined}
            onClick={() => setStep(index)}
          >
            <span aria-hidden="true">0{index + 1}</span>
            {label}
          </button>
        ))}
      </nav>
      <div className="showcase-stage">
        <div className="showcase-story">
          <span className="showcase-eyebrow">{t.steps[step]}</span>
          <h2 ref={heading} tabIndex={-1}>
            {step === 0 ? t.profile : step === 1 ? t.baseline : t.scenario}
          </h2>
          {step === 0 ? (
            <dl className="showcase-profile">
              <div>
                <dt>{t.salary}</dt>
                <dd>
                  {fmt(5000000)}
                  <small> × 12</small>
                </dd>
              </div>
              <div>
                <dt>{t.bonus}</dt>
                <dd>{fmt(6000000)}</dd>
              </div>
              <div>
                <dt>{t.rmf}</dt>
                <dd>{fmt(3000000)}</dd>
              </div>
            </dl>
          ) : step === 1 ? (
            <dl className="showcase-profile">
              <div>
                <dt>{t.income}</dt>
                <dd>{fmt(66000000)}</dd>
              </div>
              <div>
                <dt>{t.taxable}</dt>
                <dd>{fmt(comparison.before.taxable)}</dd>
              </div>
            </dl>
          ) : (
            <>
              <p>{t.scenarioIntro}</p>
              <label className="showcase-slider-label" htmlFor="showcase-rmf">
                {t.extra}
                <strong>{fmt(additional * 100)}</strong>
              </label>
              <input
                id="showcase-rmf"
                type="range"
                min="0"
                max="90000"
                step="5000"
                value={additional}
                aria-valuetext={fmt(additional * 100)}
                onChange={(event) => setAdditional(Number(event.target.value))}
              />
              <div className="showcase-range-ends" aria-hidden="true">
                <span>{fmt(0)}</span>
                <span>{fmt(9000000)}</span>
              </div>
            </>
          )}
          <div className="showcase-actions">
            {step > 0 && (
              <button className="secondary" onClick={() => setStep(step - 1)}>
                {t.back}
              </button>
            )}
            {step < 2 && (
              <button className="primary" onClick={() => setStep(step + 1)}>
                {step === 0 ? t.see : t.compare}
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            )}
            {step === 2 && (
              <button className="secondary" onClick={restart}>
                <RotateCcw size={16} aria-hidden="true" />
                {t.restart}
              </button>
            )}
          </div>
        </div>
        <div className="showcase-receipt" aria-live="polite" aria-atomic="true">
          <div className="showcase-receipt-head">
            <span>MyTax.</span>
            <span>2025 / THB</span>
          </div>
          <p>{t.baseline}</p>
          <strong
            className={step === 2 ? "showcase-before" : "showcase-total"}
            data-testid="baseline-tax"
          >
            {fmt(comparison.before.tax)}
          </strong>
          {step === 2 && (
            <>
              <ArrowDownRight
                className="showcase-arrow"
                size={28}
                aria-hidden="true"
              />
              <p>{t.after}</p>
              <strong className="showcase-total" data-testid="scenario-tax">
                {fmt(comparison.after.tax)}
              </strong>
              <dl className="showcase-breakdown">
                <div className="showcase-saving">
                  <dt>{t.saving}</dt>
                  <dd data-testid="scenario-saving">
                    {fmt(comparison.saving)}
                  </dd>
                </div>
                <div>
                  <dt>{t.contribution}</dt>
                  <dd>{fmt(comparison.paidDifference)}</dd>
                </div>
                <div>
                  <dt>{t.outlay}</dt>
                  <dd data-testid="scenario-outlay">
                    {fmt(comparison.paidDifference - comparison.saving)}
                  </dd>
                </div>
              </dl>
            </>
          )}
          <span className="showcase-receipt-foot">
            {language === "en"
              ? "ILLUSTRATIVE ESTIMATE / NOT A TAX RETURN"
              : "ตัวอย่างประมาณการ / ไม่ใช่แบบยื่นภาษี"}
          </span>
        </div>
      </div>
      {step === 2 && <p className="showcase-explanation">{t.explain}</p>}
      <p className="showcase-qualification">{t.qualification}</p>
      <details className="showcase-sources">
        <summary>{t.assumptions}</summary>
        <p>{t.deductions}</p>
        <p>
          {t.checked}: <time dateTime={rules.checked}>{rules.checked}</time> ·{" "}
          {rules.version}
        </p>
        <ul>
          {rules.sources.map((source, index) => (
            <li key={source.url}>
              <a href={source.url} target="_blank" rel="noreferrer">
                {language === "en"
                  ? `Thai Revenue Department · Source ${index + 1} (Thai)`
                  : source.title}
              </a>
            </li>
          ))}
        </ul>
      </details>
      <p className="showcase-privacy">
        <ShieldCheck size={20} aria-hidden="true" />
        {t.privacy}
      </p>
      <footer className="showcase-next">
        <div>
          <h2>{t.cta}</h2>
          <p>{t.scope}</p>
        </div>
        <button className="primary" onClick={onStart}>
          {t.start}
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      </footer>
    </section>
  );
}

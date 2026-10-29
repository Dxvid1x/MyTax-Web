import { calculate, rulesFor, type TaxPlan } from "./tax.ts";
import { SCOPE } from "./scope.ts";
import { rateSummary } from "./taxUx.ts";
import { extendedLabels } from "./extendedTax.ts";
import { fmt, SourceDetails } from "./taxDisplay.tsx";
import { TaxPicture } from "./visuals.tsx";
import { useLayoutEffect, useRef } from "react";
import "./result.css";
import {
  Check,
  ChevronRight,
  Printer,
  Pencil,
  Sparkles,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
export function Result({
  plan,
  onEdit,
  onWithholding,
  onReduce,
  demo = false,
}: {
  onReduce: () => void;
  plan: TaxPlan;
  onEdit: () => void;
  onWithholding?: () => void;
  demo?: boolean;
}) {
  const root = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    let opened: HTMLDetailsElement[] = [];
    const restore = () => {
      opened.forEach((item) => {
        item.open = false;
      });
      opened = [];
    };
    const expand = () => {
      if (opened.length) return;
      opened = [...(root.current?.querySelectorAll("details") ?? [])].filter(
        (item) => !item.open,
      );
      opened.forEach((item) => {
        item.open = true;
      });
    };
    window.addEventListener("beforeprint", expand);
    window.addEventListener("afterprint", restore);
    return () => {
      restore();
      window.removeEventListener("beforeprint", expand);
      window.removeEventListener("afterprint", restore);
    };
  }, []);
  let result: ReturnType<typeof calculate>;
  try {
    result = calculate(plan);
  } catch (e) {
    return (
      <div className="panel">
        <p role="alert">{(e as Error).message}</p>
        <button className="primary" onClick={onEdit}>
          กลับไปตรวจข้อมูล
        </button>
      </div>
    );
  }
  const deductionLabels: Record<string, string> = {
    ...extendedLabels,
    personal: "ส่วนตัว",
    social: "ประกันสังคม ม.33",
    life: "ประกันชีวิต",
    health: "ประกันสุขภาพ",
    rmf: "RMF",
  };
  const kind =
    result.balance === null
      ? "unknown"
      : result.balance < 0
        ? "refund"
        : result.balance > 0
          ? "payable"
          : "settled";
  const amount = fmt(
    kind === "unknown" ? result.tax : Math.abs(result.balance ?? 0),
  );
  const rates = rateSummary(result);
  const headline = {
    unknown: "ภาษีทั้งปีโดยประมาณ",
    refund: "คุณอาจขอคืนภาษีได้ประมาณ",
    payable: "คุณต้องจ่ายภาษีเพิ่มโดยประมาณ",
    settled: "ไม่มีภาษีต้องจ่ายเพิ่ม",
  }[kind];
  return (
    <div className="results result-simple" ref={root}>
      <div className="result-title">
        <div>
          <span className="section-kicker">
            <Check size={16} /> ผลคำนวณ {demo ? "ตัวอย่าง" : ""}
          </span>
          <h1 id="tax-result-heading" tabIndex={-1}>
            สรุปภาษีของฉัน
          </h1>
          <p className="result-year">
            ประมาณการ · ปี {rulesFor(plan).year}
            {rulesFor(plan).year === 2569 ? " · แผนทั้งปี" : ""}
          </p>
        </div>
        <div className="result-buttons">
          <button
            className="text-button result-print"
            onClick={() => window.print()}
          >
            <Printer size={16} /> พิมพ์ / PDF
          </button>
        </div>
      </div>
      {["otherIncome", "otherRetirement", "special"].some(
        (id) => plan.scopeAnswers?.[id] !== false,
      ) && (
        <div className="alert scope-warning" role="status">
          ผลนี้เป็นเฉพาะส่วนที่รองรับ คุณมีหรือยังไม่ได้ยืนยันรายการนอกขอบเขต
          ต้องตรวจรายได้ สิทธิ์ และเพดานร่วมในแบบกรมสรรพากรอีกครั้ง
        </div>
      )}
      <section
        className="result-summary"
        data-kind={kind}
        aria-labelledby="result-answer"
      >
        <div
          className="result-spotlight"
          data-mood={
            kind === "unknown"
              ? "unknown"
              : kind === "payable"
                ? "collect"
                : "celebrate"
          }
        >
          <div className="result-value">
            <h2 id="result-answer">{headline}</h2>
            <p className="result-amount" data-long={amount.length > 12}>
              <strong>{amount}</strong>
              <span>บาท</span>
            </p>
          </div>
          {kind !== "unknown" && (
            <div
              className="result-mascot"
              data-mood={kind === "payable" ? "collect" : "celebrate"}
            >
              <div className="result-mascot-bubble">
                <strong>
                  {kind === "payable" ? "บิดตามถึงบ้านนะ" : "รอดไปนะ"}
                </strong>
                <span>
                  {kind === "payable"
                    ? "ยอดจ่ายเพิ่มยังเป็นประมาณการ"
                    : "ไม่มีภาษีต้องจ่ายเพิ่มตามข้อมูลนี้"}
                </span>
              </div>
              <img
                src={
                  kind === "payable"
                    ? "/images/mytax-mascot-collect.webp"
                    : "/images/mytax-mascot-celebrate.webp"
                }
                width={480}
                height={576}
                alt={
                  kind === "payable"
                    ? "หนูยื่นมือขอเงินพร้อมใบชำระสีแดง"
                    : "หนูยกมือแสดงความยินดี"
                }
                decoding="async"
              />
            </div>
          )}
        </div>
        <dl className="result-context">
          <div>
            <dt>รายได้ทั้งปี</dt>
            <dd>
              <b>{fmt(result.gross)}</b> <span>บาท</span>
            </dd>
          </div>
          <div>
            <dt>ค่าลดหย่อนที่ใช้ได้</dt>
            <dd>
              <b>{fmt(result.totalDeductions)}</b> <span>บาท</span>
            </dd>
          </div>
        </dl>
        {kind !== "unknown" && (
          <p className="result-equation">
            <span>
              ภาษีทั้งปี <b>{fmt(result.tax)}</b>
            </span>
            <span>−</span>
            <span>
              บริษัทจ่ายไว้แล้ว <b>{fmt(result.withholding)}</b> บาท
            </span>
          </p>
        )}
        <dl className="result-rates">
          <div>
            <dt>อัตราของเงินได้สุทธิบาทถัดไป</dt>
            <dd data-testid="marginal-rate">{rates.marginal}%</dd>
            <dd className="rate-note">
              <small>ใช้กับส่วนที่เพิ่ม ไม่ใช่รายได้ทั้งหมด</small>
            </dd>
          </div>
          <div>
            <dt>อัตราภาษีเฉลี่ย</dt>
            <dd data-testid="average-rate">
              {rates.average.toLocaleString("th-TH", {
                maximumFractionDigits: 2,
              })}
              %
            </dd>
            <dd className="rate-note">
              <small>ภาษีทั้งปี ÷ รายได้รวม</small>
            </dd>
          </div>
        </dl>
        <p className="rate-explanation">
          ลดหย่อนเพิ่ม 1,000 บาท อาจลดภาษีประมาณ{" "}
          {rates.perThousand.toLocaleString("th-TH")} บาท
          หากใช้สิทธิ์ได้ครบและยังอยู่ขั้นเดิม
          การข้ามขั้นต้องเทียบผลจริงอีกครั้ง
        </p>
        {kind === "unknown" ? (
          <p className="result-next" role="status">
            <b className="unknown-balance">รอเช็กยอด</b>
            ดูภาษีทั้งปีได้แล้ว เหลือเช็กยอดที่บริษัทจ่ายไว้
            <br />
            จึงจะเทียบยอดที่เหลือหรือยอดขอคืนได้
          </p>
        ) : (
          !demo && <p className="result-next">ตรวจหลักฐานก่อนยื่นภาษีจริง</p>
        )}
        <div className="result-actions">
          <button className="primary" onClick={onReduce}>
            <Sparkles size={18} /> วางแผนภาษี <ArrowRight size={17} />
          </button>
          {kind === "unknown" && (
            <button className="secondary" onClick={onWithholding || onEdit}>
              ใส่ยอดที่จ่ายไว้ <ChevronRight size={17} />
            </button>
          )}
          <button className="secondary" onClick={onEdit}>
            <Pencil size={16} /> แก้ข้อมูล
          </button>
        </div>
      </section>
      <p className="result-disclaimer">{SCOPE.limitation}</p>
      <details className="result-details">
        <summary>
          ดูรายละเอียดการคำนวณ <ChevronDown size={18} aria-hidden="true" />
        </summary>
        <section className="panel breakdown">
          <TaxPicture
            gross={result.gross}
            expense={result.expense}
            deductions={result.totalDeductions}
            taxable={result.taxable}
            tax={result.tax}
          />
          <details>
            <summary>ดูวิธีคำนวณ</summary>
            <div className="marginal-card">
              <strong>{result.marginalRate}%</strong>
              <div>
                <b>ขั้นภาษีของเงินได้สุทธิบาทถัดไป</b>
                <p>
                  ใช้กับส่วนที่เพิ่ม ไม่ใช่รายได้ทั้งก้อน
                  ลดหย่อนเพิ่มอาจข้ามขั้น จึงควรเทียบภาษีก่อน–หลัง
                </p>
              </div>
            </div>

            <div className="calc-row">
              <span>รายได้รวม</span>
              <b>{fmt(result.gross)}</b>
            </div>
            {result.exemptions > 0 && (
              <div className="calc-row">
                <span>เงินยกเว้น PVD/กบข. ก่อนคิดค่าใช้จ่าย</span>
                <b>− {fmt(result.exemptions)}</b>
              </div>
            )}
            <div className="calc-row">
              <span>หักค่าใช้จ่าย 50% สูงสุด 100,000</span>
              <b>− {fmt(result.expense)}</b>
            </div>
            <div className="calc-row">
              <span>ค่าลดหย่อนหลังหักค่าใช้จ่าย</span>
              <b>− {fmt(result.totalDeductions - result.exemptions)}</b>
            </div>
            <div className="calc-row emphasis">
              <span>เงินได้สุทธิ</span>
              <b>{fmt(result.taxable)}</b>
            </div>
          </details>
          <details>
            <summary>ค่าลดหย่อนแต่ละรายการ</summary>
            <p className="small-muted">
              บริจาคโรงพยาบาลรัฐแสดงยอดจ่ายจริง ระบบคิดสิทธิ์ 2
              เท่าก่อนจำกัดเพดาน ครอบครัวแสดงยอดสิทธิ์จากจำนวนคนที่ยืนยัน
            </p>
            <table>
              <thead>
                <tr>
                  <th>รายการ</th>
                  <th>ยอดกรอก</th>
                  <th>ใช้ได้จริง</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(result.deductions).map(([key, val]) => (
                  <tr key={key}>
                    <td>
                      {deductionLabels[key as keyof typeof deductionLabels]}
                    </td>
                    <td>
                      {key === "personal"
                        ? "อัตโนมัติ"
                        : fmt(
                            key === "hospitalDonation"
                              ? result.values[key] / 2
                              : result.values[key],
                          )}
                    </td>
                    <td>
                      {fmt(val)}
                      {key !== "personal" && result.values[key] > val && (
                        <small className="cap-note">จำกัดตามเพดาน</small>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
          <details>
            <summary>ภาษีในแต่ละขั้น</summary>
            <table>
              <thead>
                <tr>
                  <th>ช่วงเงินได้สุทธิ (บาท)</th>
                  <th>อัตรา</th>
                  <th>ภาษี</th>
                </tr>
              </thead>
              <tbody>
                {result.bands
                  .filter((b) => b.portion > 0)
                  .map((b) => (
                    <tr key={b.from}>
                      <td>
                        {fmt(b.from * 100)}–
                        {Number.isFinite(b.to) ? fmt(b.to * 100) : "ขึ้นไป"}
                      </td>
                      <td>{b.rate}%</td>
                      <td>{fmt(b.tax)}</td>
                    </tr>
                  ))}
                <tr>
                  <td colSpan={2}>รวม (ปัดสตางค์ที่ยอดรวม)</td>
                  <td>{fmt(result.tax)}</td>
                </tr>
              </tbody>
            </table>
          </details>
          <SourceDetails plan={plan} />
        </section>
      </details>
    </div>
  );
}

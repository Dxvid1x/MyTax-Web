import {
  Users,
  Home,
  Landmark,
  CircleHelp,
  BriefcaseBusiness,
  ShieldCheck,
  Check,
} from "lucide-react";
import type { TaxPlan, ScopeAnswer } from "./tax.ts";
import { SCOPE } from "./scope.ts";
import "./scopeCheck.css";
const questions = [
  [
    "family",
    "มีคู่สมรส บุตร หรือดูแลพ่อแม่?",
    Users,
    "เพิ่มสิทธิ์ครอบครัวในขั้นลดหย่อน",
  ],
  [
    "home",
    "ผ่อนบ้านและจ่ายดอกเบี้ย?",
    Home,
    "ใช้ดอกเบี้ยส่วนของคุณตามหนังสือรับรอง",
  ],
  [
    "workFund",
    "มีกองทุนที่บริษัทช่วยออม หรือ กบข.?",
    Landmark,
    "กรอกเฉพาะเงินสะสมของคุณ ไม่รวมเงินนายจ้าง",
  ],
  [
    "donations",
    "มีเงินบริจาคที่เก็บหลักฐานไว้?",
    CircleHelp,
    "แยกบริจาคทั่วไปและโรงพยาบาลรัฐในขั้นลดหย่อน",
  ],
  [
    "otherIncome",
    "มีรายได้อื่นหรือรายได้ต่างประเทศ?",
    BriefcaseBusiness,
    "ผลนี้ไม่รวมรายได้อื่น จึงยังไม่ใช่ภาษีทั้งหมดของคุณ",
  ],
  [
    "otherRetirement",
    "มีประกันบำนาญหรือกองทุนเกษียณอื่น?",
    ShieldCheck,
    "ผลอาจสูงกว่าจริง และเพดาน RMF อาจเหลือน้อยกว่าที่แสดง กรุณาตรวจยอดกลุ่มเกษียณรวม",
  ],
  [
    "special",
    "มี Thai ESGX สิทธิ์ผู้สูงอายุ/พิการ หรือมาตรการพิเศษ?",
    CircleHelp,
    "ผลอาจสูงกว่าจริง เพราะสิทธิ์เหล่านี้ยังไม่รวมในผล",
  ],
] as const;
export function ScopeCheck({
  plan,
  setPlan,
  stage,
}: {
  plan: TaxPlan;
  setPlan: (p: TaxPlan) => void;
  stage: "deductions" | "review";
}) {
  const answers = plan.scopeAnswers ?? {};
  const review = stage === "review";
  return (
    <div className="scope-check">
      <h3>
        {review ? "ก่อนดูผล มีรายการอื่นอีกไหม?" : "ช่วยเลือกสิทธิ์ที่ควรเช็ก"}
      </h3>
      <p>
        {review
          ? "ถ้ามีหรือยังไม่แน่ใจ ผลอาจยังไม่ครบ ต้องตรวจเพิ่มเติม"
          : "ยังไม่รู้ว่ามีสิทธิ์อะไร แตะตอบทีละข้อได้ ไม่จำเป็นต้องมีทุกรายการ"}
      </p>
      {questions
        .filter((_, i) => (review ? i >= 4 : i < 4))
        .map(([id, label, Icon, note]) => (
          <div className="scope-question" key={id}>
            <Icon size={22} />
            <div>
              <strong>{label}</strong>
              {answers[id] === true && (
                <small
                  className={
                    ["otherIncome", "otherRetirement", "special"].includes(id)
                      ? "scope-warning"
                      : ""
                  }
                >
                  {note}
                </small>
              )}
              {answers[id] === "unknown" && (
                <small className={review ? "scope-warning" : ""}>
                  ยังไม่แน่ใจ —
                  ตรวจเอกสารหรือสอบถามผู้เชี่ยวชาญก่อนใช้ผลยื่นภาษี
                </small>
              )}
            </div>
            <div className="segment" role="group" aria-label={label}>
              {(
                [
                  [true, "มี"],
                  [false, "ไม่มี"],
                  ["unknown", "ยังไม่แน่ใจ"],
                ] as const
              ).map(([value, text]) => (
                <button
                  type="button"
                  key={String(value)}
                  data-answer={
                    value === true ? "yes" : value === false ? "no" : "unknown"
                  }
                  aria-pressed={answers[id] === value}
                  onClick={() =>
                    setPlan({
                      ...plan,
                      scope: false,
                      scopeAnswers: { ...answers, [id]: value as ScopeAnswer },
                    })
                  }
                >
                  {answers[id] === value && <Check size={12} />} {text}
                </button>
              ))}
            </div>
          </div>
        ))}
      {review && (
        <>
          <p className="scope-warning">
            คำถามที่ยังไม่ได้ตอบ ถือว่ายังตรวจไม่ครบ
            ผลคำนวณครอบคลุมเฉพาะรายการที่กรอกและเว็บรองรับ
          </p>
          <details className="scope-detail">
            <summary>รายการที่คำนวณได้ / ยังไม่รวม</summary>
            <p>{SCOPE.supported}</p>
            <p>ยังไม่รวม: {SCOPE.excluded}</p>
          </details>
          <label className="check-row">
            <input
              id="scope"
              type="checkbox"
              checked={plan.scope}
              onChange={(e) => setPlan({ ...plan, scope: e.target.checked })}
            />
            <span>ฉันเข้าใจขอบเขตที่แสดง และจะตรวจสิทธิ์ที่เลือก</span>
          </label>
        </>
      )}
    </div>
  );
}

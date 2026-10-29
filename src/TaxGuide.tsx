import { useEffect, useRef, useState } from "react";
import { CURRENT_YEAR } from "./tax.ts";
import { daysToYearEnd, switchTaxYear, yearIsOpen } from "./taxUx.ts";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  Coins,
  ShieldCheck,
  ShieldPlus,
  Handshake,
  ShieldAlert,
  Heart,
  Leaf,
  Home,
  Users,
  HandHeart,
  Wallet,
  ReceiptText,
  Clock,
  CalendarDays,
  BookOpen,
  TrendingUp,
  Landmark,
  Layers,
  Sparkles,
  CircleHelp,
} from "lucide-react";
import { calculate, demoPlan, rulesFor, type TaxPlan } from "./tax.ts";
import {
  deductionScenario,
  deductionValue,
  deductionEligible,
  type SupportedDeduction,
} from "./deductionScenario.ts";
import { SCOPE } from "./scope.ts";
import "./guide.css";
import "./planning.css";
import { MoneyField } from "./MoneyField.tsx";
import "./planningLanding.css";

const fmt = (n: number) =>
  new Intl.NumberFormat("th-TH", { maximumFractionDigits: 2 }).format(n / 100);
const RD = "https://www.rd.go.th/fileadmin/tax_pdf/pit/2568/Ins91_241268.pdf";
const SEC = "https://www.sec.or.th/TH/Pages/News_Detail.aspx?SECID=11027";
type Option = {
  id: string;
  group: "funds" | "cover" | "existing";
  name: string;
  short: string;
  icon: typeof Coins;
  art: "fund" | "cover" | "home" | "family" | "give" | "social";
  purpose: string;
  cap: string;
  term: string;
  rules: string[];
  source: string;
  page?: number;
  key?: SupportedDeduction;
};
const options: Option[] = [
  {
    id: "ssf",
    group: "funds",
    name: "SSF",
    short: "เช็กหน่วยลงทุนเดิม",
    icon: Clock,
    art: "fund",
    purpose: "กองทุนเพื่อการออมที่เคยให้สิทธิ์ซื้อใหม่",
    cap: "ซื้อใหม่ใช้สิทธิ์เฉพาะปี 2563–2567",
    term: "หน่วยเดิมถือ 10 ปีแบบวันชนวัน",
    source: "https://www.rd.go.th/2502.html",
    rules: [
      "ยอดซื้อใหม่ปี 2568/2569 ไม่เพิ่มค่าลดหย่อน",
      "หน่วยเดิมยังต้องรักษาเงื่อนไขการถือและการใช้สิทธิ์",
      "ไม่ใส่ยอด SSF เดิมซ้ำในปีนี้",
    ],
  },
  {
    id: "workFund",
    group: "existing",
    name: "กองทุนที่ทำงานช่วยออม (PVD / กบข.)",
    short: "เงินเกษียณจากที่ทำงาน",
    icon: Landmark,
    art: "social",
    purpose: "เงินสะสมของคุณตามหนังสือรับรอง ไม่รวมเงินนายจ้างหรือเงินสมทบรัฐ",
    cap: "ร่วมกับ RMF ไม่เกิน 500,000 บาท",
    term: "PVD มีส่วนยกเว้นก่อนหักค่าใช้จ่าย",
    source: "https://www.rd.go.th/2502.html",
    rules: [
      "กรอกยอด PVD และฐานค่าจ้าง หรือยอด กบข. ที่มีสิทธิ์ในขั้นลดหย่อน",
      "PVD แยก 10,000 บาทแรกออกจากส่วนยกเว้น ส่วนที่ใช้ได้อยู่ในเพดานตามกฎหมาย",
      "ระบบปรับฐานค่าใช้จ่ายและวงเงิน RMF ให้ ห้ามกรอกเงินนายจ้างรวม",
    ],
  },
  {
    id: "rmf",
    group: "funds",
    name: "RMF",
    short: "ออมไว้ใช้หลังเกษียณ",
    icon: Coins,
    art: "fund",
    purpose: "กองทุนเพื่อเกษียณ เลือกนโยบายลงทุนได้หลายแบบ",
    cap: "30% ของรายได้ · สูงสุด 500,000 บาท",
    term: "อายุ 55 ปี + ถืออย่างน้อย 5 ปี",
    key: "rmf",
    source: RD,
    page: 7,
    rules: [
      "ซื้อหน่วยที่มีสิทธิ์ในปี 2568 แจ้งใช้สิทธิ์กับ บลจ. และซื้ออย่างต่อเนื่องตามเกณฑ์",
      "ถืออย่างน้อย 5 ปีนับจากซื้อครั้งแรก และขายเมื่ออายุครบ 55 ปี เว้นแต่เข้าเงื่อนไขยกเว้น",
      "วงเงิน 500,000 บาทแชร์กับ PVD/กบข. ที่กรอกไว้ในแผน ถ้ามีประกันบำนาญหรือกองทุนเกษียณอื่นต้องตรวจเพดานเพิ่มเติม",
      "ผิดเงื่อนไขอาจต้องคืนสิทธิ์ภาษีและเงินเพิ่ม ดูคู่มือก่อนขาย",
    ],
  },
  {
    id: "thaiesg",
    group: "funds",
    name: "Thai ESG",
    short: "ลงทุนเพื่อความยั่งยืนในไทย",
    icon: Leaf,
    art: "fund",
    purpose: "กองทุนที่ลงทุนในทรัพย์สินไทยตามเกณฑ์ความยั่งยืน",
    cap: "30% ของรายได้ · สูงสุด 300,000 บาท",
    term: "ถืออย่างน้อย 5 ปีแบบวันชนวัน",
    source: "https://www.rd.go.th/2502.html",
    key: "thaiEsg",
    rules: [
      "เกณฑ์นี้ใช้กับหน่วยที่ซื้อระหว่าง 1 ม.ค. 2567–31 ธ.ค. 2569",
      "ถ้าใช้ลดหย่อนปี 2568 ต้องเป็นหน่วยที่ซื้อในปี 2025 และแจ้งใช้สิทธิ์",
      "วงเงินแยกจากกลุ่มออมเพื่อเกษียณ เลือกนโยบายและตรวจหนังสือชี้ชวนแต่ละกอง",
      "ผิดเงื่อนไขอาจต้องคืนสิทธิ์ภาษีและเงินเพิ่ม; กรอกยอดที่เข้าเกณฑ์ใน MyTax ได้",
    ],
  },
  {
    id: "life",
    group: "cover",
    name: "ประกันชีวิต",
    short: "คุ้มครองชีวิตและใช้สิทธิ์",
    icon: ShieldPlus,
    art: "cover",
    purpose: "เบี้ยประกันชีวิตของตัวเองที่เข้าเงื่อนไขภาษี",
    cap: "สูงสุด 100,000 บาท",
    term: "กรมธรรม์อย่างน้อย 10 ปี",
    key: "life",
    source: RD,
    page: 6,
    rules: [
      "ประกันกับบริษัทในไทย กรมธรรม์ตั้งแต่ 10 ปี และผลประโยชน์เข้าเกณฑ์",
      "แจ้งใช้สิทธิ์และตรวจยอดที่บริษัทรับรอง",
      "รวมกับประกันสุขภาพตัวเองได้ไม่เกิน 100,000 บาท",
      "ส่วนที่ไม่ใช่เบี้ยชีวิตหรือที่ไม่เข้าเกณฑ์ใช้สิทธิ์ไม่ได้",
    ],
  },
  {
    id: "health",
    group: "cover",
    name: "ประกันสุขภาพ",
    short: "ค่าคุ้มครองสุขภาพของฉัน",
    icon: Heart,
    art: "cover",
    purpose: "เบี้ยประกันสุขภาพของตัวเองที่เข้าเกณฑ์",
    cap: "สูงสุด 25,000 บาท",
    term: "รวมกับชีวิต ไม่เกิน 100,000 บาท",
    key: "health",
    source: RD,
    page: 6,
    rules: [
      "ใช้ยอดเบี้ยที่มีสิทธิ์ ไม่ใช่ค่ารักษาที่จ่ายเองทั่วไป",
      "แจ้งความประสงค์ใช้สิทธิ์และตรวจหนังสือรับรอง",
      "หากใช้ประกันชีวิตเต็ม 100,000 บาทแล้ว จะไม่เหลือวงเงินร่วมสำหรับสุขภาพ",
      "กรณีสุขภาพพ่อแม่เป็นอีกสิทธิ์ ต้องตรวจเงื่อนไขแยกต่างหาก",
    ],
  },
  {
    id: "social",
    group: "existing",
    name: "ประกันสังคม",
    short: "เช็กเงินที่หักจากเงินเดือน",
    icon: Handshake,
    art: "social",
    purpose: "เงินสมทบประกันสังคม ม.33 ที่จ่ายจริงในปี 2568",
    cap: "คิดตามจริง · สูงสุด 9,000 บาท",
    term: "ตรวจยอดรวมทั้งปีจากหลักฐาน",
    key: "social",
    source: RD,
    page: 9,
    rules: [
      "ใช้เงินสมทบของตัวเอง ไม่รวมส่วนของนายจ้าง",
      "จ่ายไม่ครบปี ให้ใช้ยอดจริง ไม่ใส่เต็มเพดาน",
      "เพดานนี้สำหรับ ม.33 ปี 2568 เท่านั้น ไม่ใช้แทนเกณฑ์ปีอื่น",
    ],
  },
  {
    id: "home",
    group: "existing",
    name: "ดอกเบี้ยบ้าน",
    short: "เช็กสิทธิ์จากสินเชื่อที่มี",
    icon: Home,
    art: "home",
    purpose: "ดอกเบี้ยกู้ซื้อ เช่าซื้อ หรือสร้างที่อยู่อาศัยตามเกณฑ์",
    cap: "ตามจริง · สูงสุด 100,000 บาท",
    term: "ดอกเบี้ย ไม่รวมเงินต้น",
    key: "mortgage",
    source: RD,
    page: 8,
    rules: [
      "ตรวจหลักฐานดอกเบี้ยจากผู้ให้กู้และเงื่อนไขหลักประกัน",
      "ถ้ากู้ร่วม ต้องตรวจการแบ่งสิทธิ์ ไม่ใช้ยอดทั้งก้อนซ้ำ",
      "กรอกยอดที่เข้าเกณฑ์ใน MyTax ได้",
    ],
  },
  {
    id: "family",
    group: "existing",
    name: "ครอบครัว",
    short: "คู่สมรส · บุตร · พ่อแม่",
    icon: Users,
    art: "family",
    purpose: "สิทธิ์จากการดูแลครอบครัว เมื่อเข้าเงื่อนไขแต่ละรายการ",
    cap: "ยอดสิทธิ์ต่างกันตามกรณี",
    term: "เช็กอายุ รายได้ และผู้ใช้สิทธิ์",
    source: RD,
    page: 4,
    rules: [
      "คู่สมรส บุตร พ่อแม่ และผู้พิการใช้เงื่อนไขต่างกัน",
      "สิทธิ์พ่อแม่ต้องตรวจอายุ รายได้ และการใช้สิทธิ์ซ้ำระหว่างพี่น้อง",
      "กรอกคู่สมรสไม่มีเงินได้ บุตร และพ่อแม่ในขั้นลดหย่อน; สิทธิ์ผู้พิการยังไม่รวม",
    ],
  },
  {
    id: "donation",
    group: "existing",
    name: "เงินบริจาค",
    short: "เช็กหลักฐานที่บริจาคไว้",
    icon: HandHeart,
    art: "give",
    purpose: "เงินบริจาคให้หน่วยงานที่มีสิทธิ์ และมีหลักฐานตามเกณฑ์",
    cap: "วงเงินขึ้นกับประเภทและฐานหลังหักสิทธิ์",
    term: "ทั่วไป 1 เท่า · โรงพยาบาลรัฐโดยตรง 2 เท่า",
    key: "donation",
    source: RD,
    page: 2,
    rules: [
      "ตรวจผู้รับบริจาคและหลักฐานที่กฎหมายกำหนด เช่น e-Donation ในกรณีที่บังคับใช้",
      "ประเภทบริจาคมีเพดานและลำดับหักต่างกัน ไม่ใช้ยอด 2 เท่ากับทุกรายการ",
      "ทดลองบริจาคทั่วไป 1 เท่าได้; โรงพยาบาลรัฐโดยตรง 2 เท่ากรอกในขั้นลดหย่อน",
    ],
  },
];

function OptionArt({ option }: { option: Option }) {
  const Icon = option.icon;
  return (
    <div className={"option-art art-" + option.art} aria-hidden="true">
      <div className="option-orbit">
        <i />
        <i />
        <i />
      </div>
      <div className="option-main-icon">
        <Icon size={55} strokeWidth={1.6} />
      </div>
      <div className="option-evidence">
        <ReceiptText size={23} />
        <Check size={17} />
      </div>
      {option.art === "fund" ? (
        <div className="option-growth">
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
      ) : (
        <span className="option-small-icon">
          <Wallet size={29} />
        </span>
      )}
    </div>
  );
}

function FundPolicy() {
  const [kind, setKind] = useState<"bond" | "mixed" | "stock">("bond");
  const policy = {
    bond: {
      title: "ตราสารหนี้",
      path: "M0 66 L25 59 L50 65 L75 47 L100 53 L125 36 L150 40 L175 24 L200 30",
      copy: "เน้นตราสารหนี้ มีความเสี่ยงดอกเบี้ยและผู้ออกตราสาร",
    },
    mixed: {
      title: "ผสม",
      path: "M0 67 L25 40 L50 55 L75 30 L100 61 L125 27 L150 43 L175 15 L200 30",
      copy: "กระจายระหว่างหุ้นกับสินทรัพย์อื่นตามนโยบาย",
    },
    stock: {
      title: "หุ้น",
      path: "M0 68 L25 20 L50 78 L75 30 L100 90 L125 14 L150 62 L175 6 L200 40",
      copy: "เน้นหุ้น ราคามีโอกาสแกว่งมาก ต้องรับความเสี่ยงได้",
    },
  }[kind];
  return (
    <div className="fund-policy">
      <h3>RMF มีหลายแบบให้รู้จัก</h3>
      <div className="policy-choices">
        {(
          [
            ["bond", "ตราสารหนี้", Landmark],
            ["mixed", "ผสม", Layers],
            ["stock", "หุ้น", TrendingUp],
          ] as const
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            aria-pressed={kind === id}
            onClick={() => setKind(id)}
            className={kind === id ? "selected" : ""}
          >
            <Icon size={19} />
            {label}
          </button>
        ))}
      </div>
      <div className="policy-picture">
        <svg
          viewBox="0 0 200 100"
          role="img"
          aria-label={"ภาพสมมติแสดงความผันผวนของ " + policy.title}
        >
          <path
            key={kind}
            d={policy.path}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
        </svg>
        <p>
          {policy.copy}
          <small>ภาพสมมติ ไม่ใช่ผลตอบแทนจริงหรือการรับประกัน</small>
        </p>
      </div>
      <div className="fund-checks">
        <span>
          <BookOpen size={15} /> นโยบาย
        </span>
        <span>
          <TrendingUp size={15} /> ความเสี่ยง
        </span>
        <span>
          <ReceiptText size={15} /> ค่าธรรมเนียม
        </span>
      </div>
    </div>
  );
}

function Trial({
  option,
  plan,
  setPlan,
  onResult,
  onTax,
  showToast,
}: {
  option: Option;
  plan: TaxPlan;
  setPlan: (p: TaxPlan) => void;
  onResult: () => void;
  onTax: () => void;
  showToast: (s: string) => void;
}) {
  let base = plan,
    isSample = false;
  try {
    calculate(plan);
  } catch {
    base = { ...demoPlan(), taxYear: plan.taxYear ?? "2568" };
    isSample = true;
  }
  const key = option.key!;
  const [amount, setAmount] = useState(deductionValue(base, key));
  const [eligible, setEligible] = useState(deductionEligible(base, key));
  let preview: ReturnType<typeof deductionScenario> | null = null,
    error = "";
  try {
    preview = deductionScenario(base, key, amount, eligible);
  } catch (e) {
    error = (e as Error).message;
  }
  const apply = () => {
    try {
      const next = deductionScenario(plan, key, amount, eligible);
      setPlan(next.candidate);
      showToast("นำยอด " + option.name + " ไปคำนวณแล้ว");
      onResult();
    } catch (e) {
      showToast((e as Error).message);
    }
  };
  const extra = preview?.paidDifference || 0;
  return (
    <section className="guide-trial">
      <div className="guide-trial-title">
        <h3>ลองยอด {option.name} แล้วดูผล</h3>
        <span>{isSample ? "ข้อมูลตัวอย่าง" : "จากข้อมูลของคุณ"}</span>
      </div>
      <MoneyField
        id={"guide-" + key}
        label={`ยอด ${option.name} รวมปี ${rulesFor(base).year}`}
        value={amount}
        onChange={setAmount}
        hint="ยอดนี้แทนที่ยอดเดิม ไม่บวกซ้ำ"
      />
      <label className="guide-slider">
        <span className="visually-hidden">เลื่อนยอด {option.name}</span>
        <input
          aria-label={"เลื่อนยอด " + option.name}
          type="range"
          min="0"
          max={
            key === "rmf"
              ? Math.max(
                  1000,
                  Math.floor(
                    Math.min((calculate(base).gross / 100) * 0.3, 500000) /
                      1000,
                  ) * 1000,
                )
              : key === "life"
                ? 100000
                : key === "health"
                  ? 25000
                  : key === "thaiEsg"
                    ? 300000
                    : key === "mortgage"
                      ? 100000
                      : key === "donation"
                        ? Math.max(
                            1000,
                            Math.ceil(
                              calculate(base).taxable / 100 / 10 / 1000,
                            ) * 1000,
                          )
                        : rulesFor(base).socialCap
          }
          step={key === "social" ? 250 : 1000}
          value={Math.min(
            Number(amount) || 0,
            key === "rmf"
              ? 500000
              : key === "life"
                ? 100000
                : key === "health"
                  ? 25000
                  : key === "thaiEsg"
                    ? 300000
                    : key === "mortgage"
                      ? 100000
                      : key === "donation"
                        ? Math.max(
                            1000,
                            Math.ceil(
                              calculate(base).taxable / 100 / 10 / 1000,
                            ) * 1000,
                          )
                        : rulesFor(base).socialCap,
          )}
          onChange={(e) => setAmount(e.target.value)}
        />
      </label>
      {key !== "social" && (
        <label className="check-row">
          <input
            type="checkbox"
            checked={eligible}
            onChange={(e) => setEligible(e.target.checked)}
          />
          <span>
            {isSample ? "สมมติว่า " : ""}
            {key === "rmf"
              ? "ตรวจเงื่อนไข RMF และยอด PVD/กบข. ในแผนแล้ว"
              : "ตรวจเงื่อนไข หลักฐาน และยอดที่ใช้สิทธิ์ได้แล้ว"}
          </span>
        </label>
      )}
      {preview ? (
        <>
          <div className="trial-comparison">
            <div>
              <span>ภาษีเดิม</span>
              <strong>{fmt(preview.before.tax)}</strong>
            </div>
            <ArrowRight size={23} />
            <div>
              <span>ภาษีหลังปรับ</span>
              <strong>{fmt(preview.after.tax)}</strong>
            </div>
          </div>
          <div className="trial-tax-bars" aria-hidden="true">
            <i
              style={{
                width:
                  (preview.before.tax /
                    Math.max(1, preview.before.tax, preview.after.tax)) *
                    100 +
                  "%",
              }}
            />
            <i
              style={{
                width:
                  (preview.after.tax /
                    Math.max(1, preview.before.tax, preview.after.tax)) *
                    100 +
                  "%",
              }}
            />
          </div>
          <div className="trial-difference">
            <span>
              {preview.saving >= 0 ? "ภาษีลดลง" : "ภาษีเพิ่มขึ้น"}
              <strong
                className={
                  preview.saving > 0
                    ? "value-positive"
                    : preview.saving < 0
                      ? "value-negative"
                      : "value-neutral"
                }
              >
                {fmt(Math.abs(preview.saving))} บาท
              </strong>
            </span>
            <span>
              {extra >= 0 ? "ยอดจ่ายเพิ่มจากเดิม" : "ยอดจ่ายลดลงจากเดิม"}
              <strong
                className={
                  extra > 0
                    ? "value-negative"
                    : extra < 0
                      ? "value-positive"
                      : "value-neutral"
                }
              >
                {fmt(Math.abs(extra))} บาท
              </strong>
            </span>
          </div>
          <p className="trial-cap">
            ยอดที่ใช้สิทธิ์ได้จริง {fmt(preview.after.deductions[key] ?? 0)} บาท
            · ผลประมาณการ
          </p>
        </>
      ) : (
        <p className="inline-error" role="status">
          {error}
        </p>
      )}
      {isSample ? (
        <button className="primary full" onClick={onTax}>
          ใช้ข้อมูลของฉันคำนวณ <ArrowRight size={17} />
        </button>
      ) : (
        <button className="primary full" disabled={!preview} onClick={apply}>
          ใช้ยอดนี้ แล้วดูผลภาษี <ArrowRight size={17} />
        </button>
      )}
    </section>
  );
}

export function TaxGuide({
  plan,
  setPlan,
  onTax,
  onDeductions,
  onResult,
  onLaw,
  showToast,
}: {
  plan: TaxPlan;
  setPlan: (p: TaxPlan) => void;
  onTax: () => void;
  onDeductions: () => void;
  onResult: () => void;
  onLaw: () => void;
  showToast: (s: string) => void;
}) {
  const [started, setStarted] = useState(false);
  const [intent, setIntent] = useState<"existing" | "extra" | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const focusRef = useRef<HTMLHeadingElement>(null);
  const hasNavigated = useRef(false);
  useEffect(() => {
    if (!hasNavigated.current) return;
    focusRef.current?.focus({ preventScroll: true });
    focusRef.current?.scrollIntoView({
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
      block: "start",
    });
  }, [intent, selected, started]);
  const rules = rulesFor(plan);
  const openYear = yearIsOpen(plan.taxYear ?? "2568");
  const yearOptions = options.map((o) => ({
    ...o,
    purpose: o.purpose.replaceAll("2568", String(rules.year)),
    cap:
      o.id === "social"
        ? `คิดตามจริง · สูงสุด ${rules.socialCap.toLocaleString("th-TH")} บาท`
        : o.cap,
    source:
      rules.year === 2569 && o.key
        ? o.key === "social"
          ? "https://www.rd.go.th/60061.html"
          : o.key === "donation"
            ? "https://www.rd.go.th/5937.html"
            : "https://www.rd.go.th/2502.html"
        : o.source,
    page: rules.year === 2569 && o.key ? undefined : o.page,
    rules:
      o.id === "ssf"
        ? o.rules
        : o.rules.map((r) =>
            r
              .replaceAll("2568", String(rules.year))
              .replaceAll("2025", String(rules.year - 543)),
          ),
  }));
  const detail = yearOptions.find((o) => o.id === selected);
  const choose = (option: Option) => {
    hasNavigated.current = true;
    setSelected(option.id);
  };
  const changeIntent = (next: typeof intent) => {
    if (next === "extra" && !openYear) return;
    hasNavigated.current = true;
    setIntent(next);
    setSelected(null);
  };
  let hasResult = true;
  try {
    calculate(plan);
  } catch {
    hasResult = false;
  }
  const DetailIcon = detail?.icon ?? BookOpen;
  if (!started)
    return (
      <section
        className="workspace tax-guide planning-landing"
        aria-labelledby="planning-heading"
      >
        <div className="planning-intro">
          <span className="section-kicker">
            <Sparkles size={17} /> วางแผนภาษี
          </span>
          <h1 id="planning-heading" ref={focusRef} tabIndex={-1}>
            อยากจ่ายภาษี<span>น้อยลงมั้ย</span>
          </h1>
          <p>เลือกดูการใช้สิทธิ์ หรือทำความเข้าใจผลของการหนีภาษี</p>
        </div>
        <div className="planning-mascot-stage">
          <span className="planning-orbit planning-orbit-green" />
          <span className="planning-orbit planning-orbit-red" />
          <img
            src="/images/mytax-mascot-two-money.webp"
            width={800}
            height={959}
            alt="หนูถือเงินสีเขียวทางซ้ายและสีแดงทางขวา"
            decoding="async"
          />
        </div>
        <div
          className="planning-goals planning-choices"
          role="group"
          aria-label="เลือกสิ่งที่อยากทำ"
        >
          <button
            className="planning-choice-green"
            onClick={() => {
              hasNavigated.current = true;
              setStarted(true);
            }}
          >
            <ShieldCheck size={30} />
            <span>
              <strong>ลดหย่อนภาษี</strong>
              <span>ใช้สิทธิ์ตามกฎหมาย เริ่มจากสิ่งที่มี</span>
            </span>
            <ArrowRight size={23} />
          </button>
          <button className="planning-choice-red" onClick={onLaw}>
            <ShieldAlert size={30} />
            <span>
              <strong>เลี่ยงภาษี</strong>
              <span>ดูผลของการหนีภาษีโดยผิดกฎหมาย</span>
            </span>
            <ArrowRight size={23} />
          </button>
        </div>
        <p className="planning-landing-note">
          ฝั่งแดงเป็นภาพจำลองเพื่อเรียนรู้ผลทางกฎหมาย
        </p>
      </section>
    );
  return (
    <section className="workspace tax-guide guide-simple">
      <button className="guide-back" onClick={hasResult ? onResult : onTax}>
        <ArrowLeft size={17} />
        {hasResult ? "กลับไปผลภาษี" : "คำนวณภาษีของฉัน"}
      </button>
      <button
        className="text-button planning-return"
        onClick={() => {
          hasNavigated.current = true;
          setStarted(false);
          setIntent(null);
          setSelected(null);
        }}
      >
        <ArrowLeft size={17} /> กลับไปเลือกทาง
      </button>
      <div className="planning-welcome">
        <div className="page-head">
          <div>
            <span className="section-kicker">
              <Sparkles size={17} /> วางแผนภาษี
            </span>
            <h1 ref={intent === null ? focusRef : undefined} tabIndex={-1}>
              ลดหย่อนภาษี เริ่มจากสิทธิ์ที่มี
            </h1>
            <p>ขั้นตอนนี้เป็นทางเลือก ข้ามได้ ไม่จำเป็นต้องซื้ออะไรเพิ่ม</p>
          </div>
          <span className="year-tag">
            ปีภาษี {rules.year} / {rules.year - 543}
          </span>
        </div>
      </div>
      {intent === null && (
        <div className="deduction-explainer">
          <div>
            <Wallet size={27} />
            <strong>รายได้ทั้งปี</strong>
            <span>รวมเงินเดือนและโบนัส</span>
          </div>
          <ArrowRight size={20} aria-hidden="true" />
          <div>
            <ShieldCheck size={27} />
            <strong>หักค่าใช้จ่ายและสิทธิ์</strong>
            <span>เฉพาะที่เข้าเงื่อนไข</span>
          </div>
          <ArrowRight size={20} aria-hidden="true" />
          <div>
            <ReceiptText size={27} />
            <strong>เหลือคิดภาษี</strong>
            <span>คำนวณตามขั้นภาษี</span>
          </div>
          <p>
            ค่าลดหย่อนช่วยลดเงินที่นำมาคิดภาษี ไม่ใช่ได้เงินคืนเท่ายอดที่จ่าย
          </p>
        </div>
      )}
      <div className="guide-year-note">
        <CalendarDays size={18} />
        <span>
          {rules.year === 2569
            ? "วางแผนจากรายได้และยอดจ่ายทั้งปี 2026"
            : "หน้านี้ใช้ตรวจยอดที่จ่ายในปี 2025"}
          <b>
            {rules.year === 2569
              ? "ใช้เฉพาะสิทธิ์ที่เข้าเงื่อนไขในปีที่เลือก"
              : "ซื้อหรือจ่ายวันนี้ ใช้ลดภาษีปี 2568 ย้อนหลังไม่ได้"}
          </b>
        </span>
      </div>
      {openYear ? (
        <p className="tax-countdown">
          เหลืออีก {daysToYearEnd(CURRENT_YEAR)} วันก่อนสิ้นปี {CURRENT_YEAR}
        </p>
      ) : (
        <div className="closed-year panel">
          <p>ปี {rules.year} ปิดแล้ว ตรวจได้เฉพาะยอดที่จ่ายในปีนั้น</p>
          <button
            className="primary"
            onClick={() => {
              setPlan(switchTaxYear(plan, CURRENT_YEAR));
              setIntent(null);
              setSelected(null);
              showToast(
                "เก็บจำนวนเงินเดิมไว้ กรุณาทบทวนยอดและยืนยันสิทธิ์สำหรับปีใหม่",
              );
            }}
          >
            สลับไปวางแผนปี {CURRENT_YEAR}
          </button>
        </div>
      )}
      {intent === null ? (
        <div
          className="planning-goals"
          role="group"
          aria-label="เลือกสิ่งที่อยากทำ"
        >
          <button onClick={() => changeIntent("existing")}>
            <span className="planning-goal-art" aria-hidden="true">
              <Wallet size={44} />
              <Check size={22} />
            </span>
            <strong>เช็กสิทธิ์จากสิ่งที่มีอยู่แล้ว</strong>
            <span>ครอบครัว บ้าน ประกัน หรือยอดที่จ่ายไปแล้ว</span>
            <span className="planning-goal-link">
              เช็กสิทธิ์ของฉัน <ArrowRight size={18} />
            </span>
          </button>
          {openYear && (
            <button onClick={() => changeIntent("extra")}>
              <span className="planning-goal-art" aria-hidden="true">
                <Coins size={44} />
                <TrendingUp size={22} />
              </span>
              <strong>ลองวางแผนเพิ่ม</strong>
              <span>เทียบเงินที่ต้องใช้เพิ่ม กับภาษีที่เปลี่ยนไป</span>
              <span className="planning-goal-link">
                ลองเทียบทางเลือก <ArrowRight size={18} />
              </span>
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="planning-path">
            <span>
              {intent === "existing"
                ? "เช็กสิทธิ์จากสิ่งที่มีอยู่แล้ว"
                : "ลองวางแผนเพิ่ม"}
            </span>
            <button className="text-button" onClick={() => changeIntent(null)}>
              <ArrowLeft size={16} /> เปลี่ยนทางเลือก
            </button>
          </div>
          {!detail && (
            <>
              <h2 className="planning-topic-title" ref={focusRef} tabIndex={-1}>
                {intent === "existing"
                  ? "คุณมีสิทธิ์หรือจ่ายเรื่องไหนไว้แล้ว?"
                  : "อยากลองปรับเรื่องไหน?"}
              </h2>
              <p className="planning-topic-hint">
                {intent === "existing"
                  ? "เลือกทีละเรื่อง แล้วตรวจเงื่อนไขกับหลักฐานของคุณ"
                  : "เป็นการทดลอง ยังไม่เปลี่ยนข้อมูลจนกดใช้ยอดนี้"}
              </p>
              {intent === "extra" && (
                <p className="planning-caution">
                  {rules.year === 2568
                    ? "ปี 2568 ปิดปีแล้ว: ทดลองเปรียบเทียบได้ แต่ซื้อหรือจ่ายวันนี้ใช้สิทธิ์ย้อนหลังไม่ได้"
                    : "ภาษีที่ลดลงไม่ใช่เงินคืนเท่ายอดที่จ่าย ต้องดูเงินที่พร้อมใช้และเงื่อนไขด้วย"}
                </p>
              )}
              <div
                className="planning-topics"
                role="group"
                aria-label="เลือกสิทธิ์"
              >
                {yearOptions
                  .filter((o) =>
                    intent === "existing"
                      ? o.id !== "ssf"
                      : [
                          "rmf",
                          "thaiesg",
                          "life",
                          "health",
                          "donation",
                        ].includes(o.id),
                  )
                  .sort((a, b) => {
                    const order =
                      intent === "existing"
                        ? [
                            "family",
                            "social",
                            "home",
                            "workFund",
                            "life",
                            "health",
                            "rmf",
                            "thaiesg",
                            "donation",
                          ]
                        : ["rmf", "thaiesg", "life", "health", "donation"];
                    return order.indexOf(a.id) - order.indexOf(b.id);
                  })
                  .map((option) => {
                    const Icon = option.icon;
                    return (
                      <button key={option.id} onClick={() => choose(option)}>
                        <Icon size={26} />
                        <span>
                          <strong>{option.name}</strong>
                          <small>
                            {intent === "existing" && option.group === "funds"
                              ? "เช็กยอดที่ซื้อไว้แล้ว"
                              : option.short}
                          </small>
                        </span>
                        <ChevronRight size={17} />
                      </button>
                    );
                  })}
              </div>
              {intent === "existing" && (
                <details className="planning-legacy">
                  <summary>มีกองทุน SSF ที่ซื้อไว้เดิม?</summary>
                  <p>
                    ซื้อใหม่ในปี 2568/2569 ไม่เพิ่มค่าลดหย่อน
                    แต่หน่วยเดิมยังมีเงื่อนไขการถือ
                  </p>
                  <button
                    className="secondary"
                    onClick={() =>
                      choose(yearOptions.find((o) => o.id === "ssf")!)
                    }
                  >
                    ดูเงื่อนไข SSF เดิม
                  </button>
                </details>
              )}
            </>
          )}
          {detail && (
            <div className="planning-detail">
              <button
                className="guide-back"
                onClick={() => {
                  hasNavigated.current = true;
                  setSelected(null);
                }}
              >
                <ArrowLeft size={17} /> เปลี่ยนหัวข้อ
              </button>
              <div
                className="guide-option-detail"
                key={`${intent}-${detail.id}`}
              >
                {intent === "extra" && rules.year === 2568 && (
                  <p className="planning-caution">
                    ทดลองเทียบปี 2568 ได้
                    แต่ซื้อหรือจ่ายวันนี้ใช้สิทธิ์ย้อนหลังไม่ได้
                  </p>
                )}
                <div className="option-intro">
                  <div>
                    <span className="option-label">
                      {intent === "extra"
                        ? "ทดลองเปรียบเทียบ"
                        : "ตรวจสิทธิ์และหลักฐาน"}
                    </span>
                    <h2 ref={focusRef} tabIndex={-1}>
                      <DetailIcon size={25} />
                      {detail.name}
                    </h2>
                    <p>{detail.purpose}</p>
                  </div>
                  <OptionArt option={detail} />
                </div>
                <div className="option-rule-strip">
                  <span>
                    <ShieldCheck size={19} />
                    <span>
                      วงเงินสิทธิ์<b>{detail.cap}</b>
                    </span>
                  </span>
                  <span>
                    <Clock size={19} />
                    <span>
                      สิ่งที่ต้องเช็ก<b>{detail.term}</b>
                    </span>
                  </span>
                </div>
                {detail.id === "rmf" && (
                  <details className="planning-fund-learn">
                    <summary>รู้จักประเภทกองทุน RMF</summary>
                    <FundPolicy />
                  </details>
                )}
                {detail.id === "thaiesg" && (
                  <details className="planning-fund-learn">
                    <summary>รู้จักนโยบายลงทุน Thai ESG</summary>
                    <div className="esg-picture">
                      <span>
                        <Leaf size={32} /> ธุรกิจไทยตามเกณฑ์
                      </span>
                      <ArrowRight size={24} />
                      <span>
                        <Layers size={32} /> นโยบายแต่ละกองต่างกัน
                      </span>
                      <p>
                        ตรวจว่าลงทุนในหุ้น ตราสารหนี้ หรือผสม
                        และรับความเสี่ยงได้แค่ไหน
                      </p>
                    </div>
                  </details>
                )}
                <details className="guide-conditions">
                  <summary>
                    <CircleHelp size={17} /> เช็กเงื่อนไขก่อนใช้สิทธิ์
                  </summary>
                  <ul>
                    {detail.rules.map((rule) => (
                      <li key={rule}>{rule}</li>
                    ))}
                  </ul>
                </details>
                {intent === "extra" && openYear && detail.key ? (
                  <Trial
                    key={detail.id}
                    option={detail}
                    plan={plan}
                    setPlan={setPlan}
                    onResult={onResult}
                    onTax={onTax}
                    showToast={showToast}
                  />
                ) : (
                  <div className="guide-info-only">
                    <BookOpen size={24} />
                    <div>
                      <strong>
                        {detail.id === "ssf"
                          ? "SSF ซื้อใหม่ใช้ลดหย่อนปีนี้ไม่ได้"
                          : "กรอกสิทธิ์นี้ในขั้นลดหย่อน"}
                      </strong>
                      <p>
                        {detail.id === "ssf"
                          ? "สิทธิ์ซื้อใหม่อยู่ในช่วงปี 2563–2567 หน่วยเดิมยังต้องถือครบตามเกณฑ์"
                          : `ใช้ยอด ${detail.name} ที่มีสิทธิ์ตามหลักฐานในขั้นลดหย่อน`}
                      </p>
                      {detail.id !== "ssf" && (
                        <button
                          className="primary"
                          onClick={hasResult ? onDeductions : onTax}
                        >
                          ไปกรอกข้อมูลของฉัน <ArrowRight size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                )}
                <a
                  className="guide-source"
                  href={
                    detail.source + (detail.page ? "#page=" + detail.page : "")
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  {detail.source === SEC
                    ? "ดูเกณฑ์ Thai ESG จาก ก.ล.ต."
                    : "ดูเงื่อนไขจากคู่มือกรมสรรพากร"}
                  <ArrowUpRight size={16} />
                </a>
              </div>
            </div>
          )}
        </>
      )}
      <div className="guide-footnote">
        <ShieldCheck size={19} />
        <span>
          {SCOPE.limitation} การลงทุนและประกันมีค่าใช้จ่ายกับเงื่อนไข
          เลือกให้ตรงเป้าหมายและเงินที่พร้อมใช้ ผลในหน้านี้เป็นการทดลอง
          ไม่ใช่การรับรองสิทธิ์หรือแนะนำกองทุนรายตัว
        </span>
      </div>
    </section>
  );
}

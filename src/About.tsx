import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowUpRight,
  BookOpen,
  Calculator,
  HardDrive,
  ChevronDown,
  CircleHelp,
  Users,
  ScanText,
  Banknote,
  Coins,
} from "lucide-react";
import { SCOPE, EXTENDED_SOURCES } from "./scope.ts";
import {
  RULES_BY_YEAR,
  calculate,
  demoPlan,
  type TaxPlan,
  type TaxYear,
} from "./tax.ts";
import { fmt, dateLabel } from "./taxDisplay.tsx";
import { SITE } from "./siteContent.ts";
import "./trust.css";

function TrustSection({
  id,
  title,
  icon,
  open,
  onToggle,
  children,
}: {
  id: string;
  title: string;
  icon: ReactNode;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <section className="trust-section" data-open={open}>
      <h2 className="trust-section-heading">
        <button
          id={`trust-toggle-${id}`}
          className="trust-section-toggle"
          type="button"
          aria-expanded={open}
          aria-controls={`trust-panel-${id}`}
          onClick={onToggle}
        >
          <span className="trust-section-icon" aria-hidden="true">
            {icon}
          </span>
          <span>{title}</span>
          <ChevronDown className="trust-chevron" size={18} aria-hidden="true" />
        </button>
      </h2>
      <div
        id={`trust-panel-${id}`}
        className="trust-section-panel"
        role="region"
        aria-labelledby={`trust-toggle-${id}`}
        aria-hidden={!open}
        inert={!open}
      >
        <div className="trust-section-clip">
          <div className="trust-section-body">{children}</div>
        </div>
      </div>
    </section>
  );
}

const faqs = [
  [
    "ทำไมผลไม่ตรงกับยอดที่ยื่นจริง?",
    "รายได้ หลักฐาน สิทธิ์ เพดานร่วม และมาตรการที่แอปไม่รองรับ อาจทำให้ผลต่างกัน ตรวจแบบกรมสรรพากรหรือผู้เชี่ยวชาญก่อนยื่น",
  ],
  [
    "ใช้กับฟรีแลนซ์ได้ไหม?",
    "แอปประมาณเฉพาะเงินเดือนและโบนัส รายได้ฟรีแลนซ์หรือรายได้อื่นยังอยู่นอกขอบเขต",
  ],
  [
    "ล้างเบราว์เซอร์แล้วข้อมูลหายไหม?",
    "ข้อมูลในเครื่องอาจหายเมื่อเคลียร์ข้อมูลเว็บไซต์ ควรสำรองข้อมูลเป็นไฟล์ก่อนล้างหรือเปลี่ยนเครื่อง",
  ],
  [
    "ต้องเปิดบันทึกหรือไม่?",
    "เลือกใช้โดยไม่บันทึกได้ รายการใหม่อาจหายเมื่อปิดหรือรีโหลด เปิดบันทึกเพื่อเก็บในเบราว์เซอร์นี้",
  ],
  [
    "ข้อมูลย้ายไปมือถืออีกเครื่องเองไหม?",
    "ไม่ย้ายเอง ใช้ตั้งค่า → บันทึก → สำรองข้อมูล แล้วนำเข้าไฟล์สำรองบนเครื่องปลายทาง",
  ],
  [
    "ยังไม่รู้ภาษีที่บริษัทหักไว้ ทำอย่างไร?",
    "เลือกยังไม่รู้ยอดเพื่อดูภาษีทั้งปีโดยประมาณ ผลจะรอเช็กยอดก่อนบอกจ่ายเพิ่มหรือขอคืน",
  ],
  [
    "ใช้ลดหย่อนปีที่ผ่านมาโดยซื้อวันนี้ได้ไหม?",
    "ไม่ได้ ใช้ปีที่ผ่านมาเพื่อตรวจรายการที่จ่ายในปีนั้น สลับไปปีปัจจุบันก่อนวางแผนซื้อหรือจ่ายเพิ่ม",
  ],
];

export function About({
  plan,
  onManage,
}: {
  plan: TaxPlan;
  onManage: () => void;
}) {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [greeting, setGreeting] = useState(0);
  const [excited, setExcited] = useState(false);
  const [happyReady, setHappyReady] = useState(false);
  const [moneyReady, setMoneyReady] = useState(false);
  const mascotImage = useRef<HTMLSpanElement>(null);
  const mascotAnimation = useRef<Animation | null>(null);
  const reactionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      mascotAnimation.current?.cancel();
      if (reactionTimer.current !== null) clearTimeout(reactionTimer.current);
    },
    [],
  );
  const greetMascot = () => {
    setGreeting((value) => value + 1);
    setExcited(true);
    if (reactionTimer.current !== null) clearTimeout(reactionTimer.current);
    reactionTimer.current = setTimeout(() => setExcited(false), 1800);
    mascotAnimation.current?.cancel();
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    mascotAnimation.current =
      mascotImage.current?.animate(
        [
          { transform: "translateY(0) rotate(0deg) scale(1)" },
          {
            transform: "translateY(5px) rotate(-3deg) scale(1.055,.94)",
            offset: 0.14,
          },
          {
            transform: "translateY(-22px) rotate(-6deg) scale(.98,1.04)",
            offset: 0.34,
          },
          {
            transform: "translateY(2px) rotate(4deg) scale(1.035,.97)",
            offset: 0.54,
          },
          {
            transform: "translateY(-9px) rotate(-2deg) scale(1)",
            offset: 0.73,
          },
          { transform: "translateY(0) rotate(0deg) scale(1)" },
        ],
        { duration: 900, easing: "cubic-bezier(.22,.7,.3,1)" },
      ) ?? null;
  };
  const [sourceYear, setSourceYear] = useState<TaxYear>(plan.taxYear ?? "2568");
  const rules = RULES_BY_YEAR[sourceYear];
  const example = calculate(demoPlan());
  const unique = [...rules.sources, ...EXTENDED_SOURCES].filter(
    (item, index, all) =>
      all.findIndex((source) => source.url === item.url) === index,
  );
  const sectionProps = (id: string) => ({
    id,
    open: openSection === id,
    onToggle: () => setOpenSection((current) => (current === id ? null : id)),
  });
  const explore = () => {
    setOpenSection("scope");
    requestAnimationFrame(() => {
      const first = document.getElementById("trust-toggle-scope");
      first?.focus({ preventScroll: true });
      first?.scrollIntoView({
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
        block: "start",
      });
    });
  };
  return (
    <section className="workspace about-page trust-page">
      <header className="trust-hero">
        <div className="trust-money-backdrop" aria-hidden="true">
          <Banknote
            className="trust-backdrop-note trust-backdrop-note-one"
            strokeWidth={1}
          />
          <Banknote
            className="trust-backdrop-note trust-backdrop-note-two"
            strokeWidth={1}
          />
          <Coins className="trust-backdrop-coins" strokeWidth={1} />
        </div>
        <div className="trust-hero-copy">
          <h1>เกี่ยวกับ MyTax</h1>
          <h2>
            เรื่องภาษี
            <br />
            <span>เข้าใจได้ทีละขั้น</span>
          </h2>
          <p>
            เราอยากให้เรื่องเงินที่ดูยุ่งยาก
            <br className="trust-hero-break" /> เป็นเรื่องที่คุณค่อย ๆ
            เข้าใจได้ด้วยตัวเอง
          </p>
          <button className="trust-explore" type="button" onClick={explore}>
            รู้จัก MyTax <ArrowUpRight size={18} aria-hidden="true" />
          </button>
          <span className="trust-hero-footnote">
            ไม่ต้องสมัคร · คำนวณในเบราว์เซอร์
          </span>
        </div>
        <div className="trust-hero-art" data-reacting={greeting > 0}>
          <span className="trust-art-orbit" aria-hidden="true" />
          <span
            className="trust-art-star trust-art-star-one"
            aria-hidden="true"
          >
            ✦
          </span>
          <span
            className="trust-art-star trust-art-star-two"
            aria-hidden="true"
          >
            ✦
          </span>
          <span className="trust-mascot-note" role="status">
            {greeting > 0 && greeting % 2 === 0
              ? "อิอิ… ได้กลิ่นเงินออมแล้ว!"
              : greeting === 0
                ? "ค่อย ๆ เข้าใจไปด้วยกัน"
                : [
                    "เย้! มาเรียนรู้ด้วยกันนะ",
                    "เก่งมาก ค่อย ๆ ไปทีละขั้นนะ",
                    "แปะมือหน่อย! พร้อมช่วยเสมอ",
                  ][(greeting - 1) % 3]}
          </span>
          {greeting > 0 && (
            <span
              className="trust-mascot-sparkles"
              key={greeting}
              aria-hidden="true"
            >
              <span>♥</span>
              <span>✦</span>
              <span>♥</span>
            </span>
          )}
          <button
            className="trust-mascot-play"
            type="button"
            aria-label="ทักทายหนู MyTax"
            title="แตะเพื่อทักทาย"
            onClick={greetMascot}
          >
            <span
              className="trust-mascot-sprite"
              ref={mascotImage}
              data-happy={excited && happyReady && greeting % 2 === 1}
              data-money={excited && moneyReady && greeting % 2 === 0}
            >
              <img
                className="trust-mascot-base"
                src="/images/mytax-about-guide-v1.png"
                width={1145}
                height={1374}
                alt="มาสคอตหนู MyTax ถือสมุดและทักทาย"
                fetchPriority="high"
                decoding="async"
              />
              <img
                className="trust-mascot-happy"
                src="/images/mytax-about-happy-v1.png"
                width={1145}
                height={1374}
                alt=""
                aria-hidden="true"
                decoding="async"
                onLoad={() => setHappyReady(true)}
              />
              <img
                className="trust-mascot-money"
                src="/images/mytax-about-money-v1.png"
                width={1145}
                height={1374}
                alt=""
                aria-hidden="true"
                decoding="async"
                onLoad={() => setMoneyReady(true)}
              />
            </span>
          </button>
        </div>
      </header>
      <p className="trust-brief">
        ประมาณภาษีเงินเดือนและโบนัสในไทย · ผลคำนวณไม่ใช่การยื่นแบบ
        <br />
        <strong>ไม่ใช่เว็บไซต์ของกรมสรรพากร</strong>
      </p>
      <div className="trust-topics-heading">
        <h2>อยากรู้เรื่องไหน?</h2>
        <span>เลือกเปิดอ่านได้ทีละเรื่อง</span>
      </div>
      <div className="trust-topics" id="trust-topics">
        <TrustSection
          {...sectionProps("scope")}
          title="ขอบเขตการคำนวณ"
          icon={<ScanText size={20} />}
        >
          <h3>รายการที่รองรับ</h3>
          <p>{SCOPE.supported}</p>
          <h3>กรณีที่ยังไม่รองรับ</h3>
          <p>{SCOPE.excluded}</p>
          <p>{SCOPE.limitation}</p>
          <a
            className="trust-official-link"
            href="https://www.rd.go.th/"
            target="_blank"
            rel="noopener noreferrer"
          >
            เปิดเว็บไซต์กรมสรรพากร <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        </TrustSection>
        <TrustSection
          {...sectionProps("example")}
          title="วิธีคำนวณและตัวอย่าง"
          icon={<Calculator size={20} />}
        >
          <p>
            รวมรายได้ทั้งปี หักค่าใช้จ่ายและค่าลดหย่อน แล้วคำนวณภาษีตามขั้นอัตรา
          </p>
          <div className="trust-calculation">
            <div className="trust-sheet-top">
              <strong>ตัวอย่างปี 2568 / 2025</strong>
              <span>หน่วย: บาท</span>
            </div>
            <p>เงินเดือน 50,000 × 12 เดือน + โบนัส 60,000 บาท</p>
            <dl>
              <div>
                <dt>รายได้ทั้งปี</dt>
                <dd>{fmt(example.gross)}</dd>
              </div>
              <div>
                <dt>หักค่าใช้จ่าย</dt>
                <dd>−{fmt(example.expense)}</dd>
              </div>
              <div>
                <dt>หักค่าลดหย่อน</dt>
                <dd>−{fmt(example.totalDeductions)}</dd>
              </div>
              <div className="trust-sheet-subtotal">
                <dt>เงินได้สุทธิ</dt>
                <dd>{fmt(example.taxable)}</dd>
              </div>
              <div className="trust-sheet-total">
                <dt>ภาษีทั้งปีโดยประมาณ</dt>
                <dd>{fmt(example.tax)}</dd>
              </div>
            </dl>
            <p className="trust-example-note">
              ข้อมูลสมมติ ไม่ใช่ผลของคุณ · ลดหย่อนส่วนตัว 60,000 ประกันสังคม
              9,000 ประกันชีวิต 20,000 ประกันสุขภาพ 15,000 และ RMF 30,000 บาท
              สมมติว่าผ่านเงื่อนไขสิทธิ์แล้ว
            </p>
          </div>
        </TrustSection>
        <TrustSection
          {...sectionProps("sources")}
          title="กฎและแหล่งอ้างอิง"
          icon={<BookOpen size={20} />}
        >
          <div className="trust-sources">
            <div
              className="trust-source-years"
              role="group"
              aria-label="เลือกปีเพื่อดูแหล่งข้อมูล"
            >
              {(["2568", "2569"] as const).map((year) => (
                <button
                  key={year}
                  className="secondary"
                  aria-pressed={sourceYear === year}
                  onClick={() => setSourceYear(year)}
                >
                  {year} / {Number(year) - 543}
                </button>
              ))}
            </div>
            <p>ข้อมูลกฎที่บันทึกตรวจไว้ ณ {dateLabel(rules.checked)}</p>
            <p className="trust-rule-version" data-testid="trust-rule-version">
              รุ่นกฎ {rules.version}
            </p>
            <p>
              เลือกดูแหล่งข้อมูลเท่านั้น ไม่เปลี่ยนแผนของคุณ
              {sourceYear === "2569"
                ? " · ปี 2569 ใช้สำหรับวางแผน ผลอาจเปลี่ยนเมื่อข้อมูลหรือกฎเปลี่ยน"
                : " · การซื้อวันนี้ใช้ลดภาษีย้อนหลังไม่ได้"}
            </p>
            <ul>
              {unique.map((source) => (
                <li key={source.url}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {source.title} <ArrowUpRight size={14} aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
            <h3>สถานะการตรวจสอบ</h3>
            <p>ยังไม่มีการเผยแพร่ผลตรวจโดยผู้เชี่ยวชาญอิสระ</p>
            <p>
              ตรวจรายได้ หลักฐาน
              และสิทธิ์กับกรมสรรพากรหรือผู้เชี่ยวชาญก่อนยื่นจริง
            </p>
          </div>
        </TrustSection>
        <TrustSection
          {...sectionProps("data")}
          title="ข้อมูลอยู่ที่ไหน?"
          icon={<HardDrive size={20} />}
        >
          <p>
            คำนวณภาษีและอ่านไฟล์ Statement ในเบราว์เซอร์
            ไม่อัปโหลดไฟล์และไม่เชื่อมบัญชีธนาคาร
          </p>
          <p>
            เปิดบันทึกเพื่อเก็บแผนภาษีและสมุดเงินในเบราว์เซอร์นี้
            การเปลี่ยนเครื่องไม่ย้ายข้อมูลให้อัตโนมัติ ใช้ไฟล์สำรองเพื่อย้ายเอง
          </p>
          <p>
            ข้อมูลในเบราว์เซอร์และไฟล์สำรองไม่ได้เข้ารหัส
            เก็บไฟล์ไว้ในที่ส่วนตัว และพิจารณาก่อนบันทึกบนเครื่องที่ใช้ร่วมกัน
          </p>
          <p>
            การล้างข้อมูลเว็บไซต์ไม่ลบไฟล์ที่ดาวน์โหลด
            และการล้างข้อมูลเบราว์เซอร์อาจทำให้สำเนาในเครื่องหาย
          </p>
          <button className="secondary" onClick={onManage}>
            จัดการข้อมูล
          </button>
        </TrustSection>
        <TrustSection
          {...sectionProps("faq")}
          title="คำถามที่พบบ่อย"
          icon={<CircleHelp size={20} />}
        >
          {faqs.map(([question, answer]) => (
            <details key={question}>
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
        </TrustSection>
        <TrustSection
          {...sectionProps("contact")}
          title="ผู้จัดทำและการติดต่อ"
          icon={<Users size={20} />}
        >
          <p className="trust-creator">
            {SITE.creator || "ข้อมูลผู้จัดทำยังไม่เผยแพร่ในรุ่นทดลองนี้"}
          </p>
          {SITE.feedback ? (
            <a className="trust-official-link" href={SITE.feedback}>
              แจ้งปัญหาหรือข้อเสนอแนะ{" "}
              <ArrowUpRight size={15} aria-hidden="true" />
            </a>
          ) : (
            <p>ช่องทางติดต่อสาธารณะอยู่ระหว่างจัดเตรียม</p>
          )}
          <p>
            แจ้งขั้นตอนที่พบปัญหาและปีภาษี โดยไม่แนบรายได้ เอกสาร เลขประจำตัว
            หรือไฟล์สำรองข้อมูลการเงิน
          </p>
        </TrustSection>
      </div>
    </section>
  );
}

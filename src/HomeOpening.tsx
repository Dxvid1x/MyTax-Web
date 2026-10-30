import { useRef, useState, useEffect } from "react";
import { ArrowDown } from "lucide-react";
import "./opening.css";

export function HomeOpening({
  onTax,
  onTrust,
}: {
  onTax: () => void;
  onTrust: () => void;
}) {
  const root = useRef<HTMLElement>(null);
  const [reduced, setReduced] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const reset = () => {
    root.current?.style.setProperty("--opening-x", "0px");
    root.current?.style.setProperty("--opening-y", "0px");
  };
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => {
      setReduced(media.matches);
      reset();
    };
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);
  const begin = () =>
    document
      .getElementById("story-heading")
      ?.closest("section")
      ?.scrollIntoView({ behavior: reduced ? "instant" : "smooth" });
  return (
    <section
      className="home-opening"
      ref={root}
      aria-labelledby="opening-heading"
      onPointerMove={(event) => {
        if (reduced || event.pointerType !== "mouse") return;
        const box = event.currentTarget.getBoundingClientRect();
        root.current?.style.setProperty(
          "--opening-x",
          `${((event.clientX - box.left) / box.width - 0.5) * 12}px`,
        );
        root.current?.style.setProperty(
          "--opening-y",
          `${((event.clientY - box.top) / box.height - 0.5) * 10}px`,
        );
      }}
      onPointerLeave={reset}
    >
      <div className="opening-artwork" aria-hidden="true">
        <div className="opening-camera">
          <svg
            className="opening-lines"
            viewBox="0 0 1160 660"
            fill="none"
            preserveAspectRatio="xMidYMid slice"
          >
            <path d="M-40 395 C150 150 325 140 580 260 S1000 510 1200 205" />
            <path d="M-30 510 C190 280 360 460 565 530 S1010 630 1210 375" />
            <circle cx="170" cy="300" r="128" />
            <circle cx="996" cy="302" r="143" />
            <circle cx="340" cy="120" r="5" className="opening-point" />
            <circle cx="860" cy="533" r="5" className="opening-point" />
          </svg>
          <div className="opening-money-layer">
            <svg className="opening-money" viewBox="0 0 240 275" fill="none">
              <path d="m27 90 158-29 30 23-158 29z" fill="var(--positive)" />
              <path d="m27 90 30 23v103l-30-23z" fill="var(--positive)" />
              <path
                d="m57 113 158-29v103L57 216z"
                fill="var(--surface)"
                stroke="var(--positive)"
                strokeWidth="2"
              />
              <path
                d="m67 123 138-25v79L67 202z"
                stroke="var(--positive-line)"
                strokeWidth="2"
              />
              <path
                d="m27 117 23 18M27 137l23 18M27 158l23 18"
                stroke="var(--on-action)"
                strokeOpacity=".45"
                strokeWidth="2"
              />
              <ellipse
                cx="137"
                cy="151"
                rx="26"
                ry="30"
                transform="rotate(13 137 151)"
                fill="var(--positive-soft)"
                stroke="var(--positive-line)"
              />
              <text
                x="123"
                y="166"
                fill="var(--positive)"
                fontSize="40"
                fontFamily="MyTaxDisplay, sans-serif"
                fontWeight="700"
              >
                ฿
              </text>
              <circle
                cx="65"
                cy="59"
                r="28"
                fill="var(--surface)"
                stroke="var(--positive)"
                strokeWidth="2"
              />
              <path
                d="M54 59h22M65 48v22"
                stroke="var(--positive)"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="opening-ledger-layer">
            <OpeningLedger />
          </div>
          <div className="opening-mascot-layer">
            <div className="opening-mascot-bubble">
              <span>เข้าใจเงิน</span>
              <strong>วางแผนได้</strong>
            </div>
            <img
              className="opening-mascot"
              src="/images/mytax-mascot-money.webp"
              width={800}
              height={959}
              alt=""
              decoding="async"
              fetchPriority="high"
              draggable={false}
            />
          </div>
          <span className="opening-spark opening-spark-one">+</span>
          <span className="opening-spark opening-spark-two">+</span>
          <span className="opening-coin opening-coin-one">
            <OpeningCoin />
          </span>
          <span className="opening-coin opening-coin-two">
            <OpeningCoin />
          </span>
        </div>
        <span className="opening-impact-ring" />
      </div>
      <div className="opening-copy">
        <h1 id="opening-heading">
          <span className="opening-title-line">ภาษี เรื่องเงิน</span>
          <span className="opening-title-line">เข้าใจง่ายขึ้น</span>
        </h1>
        <p>
          สำหรับคนมีเงินเดือนในไทย
          <br className="opening-mobile-break" /> รู้ภาษี เห็นทางเลือก
          เข้าใจเงินที่ต้องใช้
        </p>
        <div className="opening-actions">
          <button
            className="primary opening-calculate"
            type="button"
            onClick={onTax}
          >
            คำนวณภาษีของฉัน
          </button>
        </div>
        <button className="opening-story-link" type="button" onClick={begin}>
          ลองรู้จัก MyTax <ArrowDown size={16} />
        </button>
        <ul className="opening-trust">
          <li>ประมาณภาษีเงินเดือน</li>
          <li>ใช้ได้โดยไม่สมัคร</li>
          <li>เลือกเปิดบันทึกในเครื่อง</li>
        </ul>
        <div className="opening-transparency">
          <span>เว็บอิสระ · ผลคำนวณเป็นประมาณการ</span>
          <button type="button" onClick={onTrust}>
            ดูวิธีคำนวณและขอบเขต <ArrowDown size={14} aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="opening-bottom" aria-hidden="true">
        <span>กรอกรายได้</span>
        <i />
        <span>เข้าใจภาษี</span>
        <i />
        <span>ง่ายแค่นี้เอง</span>
      </div>
    </section>
  );
}

function OpeningCoin() {
  return (
    <svg viewBox="0 0 80 80" fill="none">
      <circle
        cx="40"
        cy="40"
        r="36"
        fill="var(--surface)"
        stroke="var(--positive-line)"
        strokeWidth="2"
      />
      <circle
        cx="40"
        cy="40"
        r="29"
        fill="var(--positive-soft)"
        stroke="var(--positive-line)"
      />
      <path
        d="M36 22v36M29 26h14c12 0 12 14 0 14H29m0 0h15c13 0 13 14 0 14H29"
        stroke="var(--positive)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function OpeningLedger() {
  return (
    <svg className="opening-ledger" viewBox="0 0 240 290" fill="none">
      <rect
        x="58"
        y="44"
        width="142"
        height="206"
        rx="12"
        fill="var(--surface-raised)"
        stroke="var(--line)"
        transform="rotate(8 58 44)"
      />
      <rect
        x="31"
        y="38"
        width="149"
        height="207"
        rx="12"
        fill="var(--surface)"
        stroke="var(--line)"
        strokeWidth="2"
      />
      <path d="M50 75h110" stroke="var(--line)" />
      <text
        x="50"
        y="63"
        fill="var(--ink)"
        fontSize="17"
        fontFamily="MyTaxBody, sans-serif"
        fontWeight="600"
      >
        สมุดเงิน
      </text>
      <circle
        cx="57"
        cy="105"
        r="13"
        fill="var(--positive-soft)"
        stroke="var(--positive-line)"
      />
      <path
        d="m62 100-10 10m0-8v8h8M81 101h72M81 111h45"
        stroke="var(--positive)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle
        cx="57"
        cy="148"
        r="13"
        fill="var(--negative-soft)"
        stroke="var(--negative-line)"
      />
      <path
        d="m52 153 10-10m-8 0h8v8M81 144h55M81 154h35"
        stroke="var(--negative)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M50 183h110M50 204h60M50 217h87"
        stroke="var(--line)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="178" cy="224" r="27" fill="var(--positive)" />
      <path
        d="m166 223 9 9 16-18"
        stroke="var(--on-action)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

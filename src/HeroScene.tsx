import { useEffect, useRef, useState } from "react";
import {
  ArrowDownLeft,
  ShieldCheck,
  ReceiptText,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";
import { calculate, demoPlan, rulesFor } from "./tax.ts";
import { fmt } from "./taxDisplay.tsx";
import "./hero.css";

const examplePlan = demoPlan();
const example = calculate(examplePlan);
const year = rulesFor(examplePlan).year;

export function HeroScene() {
  const root = useRef<HTMLElement>(null);
  const [reduced, setReduced] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(!document.hidden);
  const [paused, setPaused] = useState(false);
  const [finished, setFinished] = useState(false);
  const [take, setTake] = useState(0);
  const resetDepth = () => {
    root.current?.style.setProperty("--hero-x", "0px");
    root.current?.style.setProperty("--hero-y", "0px");
  };
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const motion = () => {
      setReduced(media.matches);
      resetDepth();
    };
    const visibility = () => {
      setPageVisible(!document.hidden);
      resetDepth();
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting && entry.intersectionRatio >= 0.18);
      },
      { threshold: 0.18 },
    );
    if (root.current) observer.observe(root.current);
    media.addEventListener("change", motion);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", motion);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  const moving = !reduced && !paused && visible && pageVisible;
  const state = reduced
    ? "still"
    : finished
      ? "complete"
      : moving
        ? "playing"
        : "paused";
  return (
    <figure className="hero-scene" ref={root} data-motion={state}>
      <div
        className="hero-stage"
        key={take}
        aria-hidden="true"
        onPointerMove={(event) => {
          if (!moving || event.pointerType !== "mouse") return;
          const box = event.currentTarget.getBoundingClientRect();
          root.current?.style.setProperty(
            "--hero-x",
            `${((event.clientX - box.left) / box.width - 0.5) * 12}px`,
          );
          root.current?.style.setProperty(
            "--hero-y",
            `${((event.clientY - box.top) / box.height - 0.5) * 10}px`,
          );
        }}
        onPointerLeave={resetDepth}
        onAnimationEnd={(event) => {
          if (event.animationName === "hero-coin-land") setFinished(true);
        }}
      >
        <span className="hero-back-word">MyTax.</span>
        <svg className="hero-flow" viewBox="0 0 560 470" fill="none">
          <path d="M100 108 C100 240 388 40 427 148 S500 300 355 368" />
          <path d="m345 357 10 11 14-8" />
        </svg>
        <div className="hero-depth hero-depth-wallet">
          <svg
            className="hero-wallet hero-move"
            viewBox="0 0 340 300"
            fill="none"
          >
            <path d="m49 71 211-34 30 19-211 38z" fill="var(--positive)" />
            <path d="m49 71 211-34v176L49 247z" fill="var(--positive)" />
            <path d="m49 71 30 23v173l-30-20z" fill="var(--positive)" />
            <path d="m79 94 211-38v177L79 267z" fill="var(--positive)" />
            <path
              d="m49 71 30 23 211-38M79 94v173"
              stroke="var(--on-action)"
              strokeOpacity=".35"
              strokeWidth="2"
            />
            <path
              d="m242 115 67-12v54l-67 12c-18 3-22-49 0-54z"
              fill="var(--surface)"
              stroke="var(--positive)"
              strokeWidth="3"
            />
            <circle cx="259" cy="140" r="7" fill="var(--positive)" />
            <path
              d="m98 115 128-23M98 242l170-31"
              stroke="var(--on-action)"
              strokeOpacity=".35"
              strokeDasharray="4 5"
            />
            <text
              x="90"
              y="154"
              transform="rotate(-10 90 154)"
              fill="var(--on-action)"
              fontSize="22"
              fontWeight="700"
              fontFamily="MyTaxDisplay, sans-serif"
            >
              MyTax.
            </text>
          </svg>
        </div>
        <div className="hero-depth hero-depth-income">
          <div className="hero-income-card hero-move">
            <div className="hero-card-label">
              <ArrowDownLeft size={19} />
              <span>รายได้ทั้งปี</span>
            </div>
            <strong>
              {fmt(example.gross)} <small>บาท</small>
            </strong>
            <span className="hero-income-source">เงินเดือน + โบนัส</span>
            <span className="hero-income-line" />
          </div>
        </div>
        <div className="hero-depth hero-depth-deduct">
          <div className="hero-deduct-card hero-move">
            <ShieldCheck size={24} />
            <div>
              <span>สิทธิ์ลดหย่อน</span>
              <strong>
                {fmt(example.totalDeductions)} <small>บาท</small>
              </strong>
            </div>
          </div>
        </div>
        <div className="hero-depth hero-depth-result">
          <div className="hero-result-card hero-move">
            <div className="hero-receipt-top">
              <ReceiptText size={20} />
              <span>สรุปภาษีของฉัน</span>
              <span>{year}</span>
            </div>
            <span className="hero-tax-label">ภาษีทั้งปีโดยประมาณ</span>
            <strong className="hero-tax-number">
              {fmt(example.tax)} <small>บาท</small>
            </strong>
            <div className="hero-net-label">
              <span>เหลือคิดภาษี</span>
              <b>{fmt(example.taxable)}</b>
            </div>
            <div className="hero-net-track">
              <span
                style={{ width: `${(example.taxable / example.gross) * 100}%` }}
              />
            </div>
            <span className="hero-receipt-note">
              หลังหักค่าใช้จ่ายและสิทธิ์ลดหย่อน
            </span>
          </div>
        </div>
        <div className="hero-depth hero-depth-coin">
          <span className="hero-coin hero-move">฿</span>
        </div>
      </div>
      <figcaption className="hero-scene-caption">
        <span>ข้อมูลตัวอย่าง · ปี {year}</span>
        <span className="visually-hidden">
          รายได้ทั้งปี {fmt(example.gross)} บาท หักค่าใช้จ่าย{" "}
          {fmt(example.expense)} บาท และสิทธิ์ลดหย่อน{" "}
          {fmt(example.totalDeductions)} บาท เหลือคิดภาษี {fmt(example.taxable)}{" "}
          บาท ภาษีทั้งปีโดยประมาณ {fmt(example.tax)} บาท ไม่ใช่ข้อมูลของคุณ
        </span>
        {!reduced && (
          <button
            type="button"
            className="hero-motion-control"
            onClick={() => {
              resetDepth();
              if (finished) {
                setTake((value) => value + 1);
                setFinished(false);
                setPaused(false);
              } else setPaused((value) => !value);
            }}
          >
            {finished ? (
              <RotateCcw size={15} />
            ) : paused ? (
              <Play size={15} />
            ) : (
              <Pause size={15} />
            )}
            {finished
              ? "เล่นภาพอีกครั้ง"
              : paused
                ? "เล่นภาพต่อ"
                : "หยุดภาพชั่วคราว"}
          </button>
        )}
      </figcaption>
    </figure>
  );
}

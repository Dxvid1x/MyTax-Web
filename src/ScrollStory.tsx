import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  ArrowDown,
  Wallet,
  Gift,
  Check,
  ShieldCheck,
  ReceiptText,
  SlidersHorizontal,
  ArrowRight,
  MousePointer2,
} from "lucide-react";
import { calculate, demoPlan, money, rulesFor } from "./tax.ts";
import { fmt } from "./taxDisplay.tsx";
import { Mascot } from "./Mascot.tsx";
import "./story.css";

const sample = demoPlan();
const before = calculate(sample);
const after = calculate({ ...sample, rmf: "60000" });
const year = rulesFor(sample).year;
const clamp = (n: number) => Math.max(0, Math.min(1, n));
const ease = (n: number) => {
  const v = clamp(n);
  return v * v * (3 - 2 * v);
};
const chapters = ["กรอกรายได้", "เข้าใจภาษี", "ง่ายแค่นี้เอง"];
const needsStatic = (offset: number) =>
  matchMedia("(prefers-reduced-motion: reduce)").matches ||
  innerHeight - offset <= (innerWidth <= 650 ? 650 : 560);
// Remember completed scenes for this page load, including a trip to another tool.
const scenePlayback = [0, 0, 0];
const sceneDurations = [1400, 1400, 1600];

export function ScrollStory({ navOffset }: { navOffset: number }) {
  const root = useRef<HTMLElement>(null);
  const [reduced, setReduced] = useState(() => needsStatic(navOffset));
  const [progress, setProgress] = useState(0);
  const [inView, setInView] = useState(false);
  const [animation, setAnimation] = useState(() => [...scenePlayback]);
  const phase = progress < 0.31 ? 0 : progress < 0.65 ? 1 : 2;
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const preference = () => setReduced(needsStatic(navOffset));
    media.addEventListener("change", preference);
    window.addEventListener("resize", preference);
    preference();
    return () => {
      media.removeEventListener("change", preference);
      window.removeEventListener("resize", preference);
    };
  }, [navOffset]);
  useEffect(() => {
    if (reduced || !root.current) return;
    let visible = false;
    let frame = 0;
    const measure = () => {
      frame = 0;
      if (!visible || document.hidden || !root.current) return;
      const box = root.current.getBoundingClientRect();
      const range =
        box.height - document.documentElement.clientHeight + navOffset;
      setProgress(
        Math.round(clamp((navOffset - box.top) / Math.max(1, range)) * 1000) /
          1000,
      );
    };
    const schedule = () => {
      if (visible && !document.hidden && !frame)
        frame = requestAnimationFrame(measure);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting && entry.intersectionRatio >= 0.35;
        setInView(visible);
        if (visible) schedule();
        else {
          cancelAnimationFrame(frame);
          frame = 0;
        }
      },
      { threshold: [0, 0.35], rootMargin: `-${navOffset}px 0px 0px 0px` },
    );
    observer.observe(root.current.querySelector(".story-pin")!);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    document.addEventListener("visibilitychange", schedule);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("visibilitychange", schedule);
    };
  }, [reduced, navOffset]);
  useEffect(() => {
    if (reduced || !inView) return;
    setAnimation([...scenePlayback]);
    if (scenePlayback[phase] >= 1) return;
    let frame = 0;
    let previous = 0;
    let started = false;
    const tick = (now: number) => {
      frame = 0;
      if (document.hidden) return;
      started = true;
      if (previous)
        scenePlayback[phase] = clamp(
          scenePlayback[phase] + (now - previous) / sceneDurations[phase],
        );
      previous = now;
      setAnimation([...scenePlayback]);
      if (scenePlayback[phase] < 1) frame = requestAnimationFrame(tick);
    };
    const visibility = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      previous = 0;
      if (!document.hidden && scenePlayback[phase] < 1)
        frame = requestAnimationFrame(tick);
    };
    visibility();
    document.addEventListener("visibilitychange", visibility);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", visibility);
      // A fast scroll may leave mid-animation; returning shows its final value.
      if (started) scenePlayback[phase] = 1;
    };
  }, [phase, reduced, inView]);
  const inputOut = ease((progress - 0.24) / 0.12);
  const resultIn = ease((progress - 0.25) / 0.12);
  const resultOut = ease((progress - 0.59) / 0.12);
  const trialIn = ease((progress - 0.6) / 0.12);
  const typed = reduced ? 1 : ease(animation[0]);
  const revealed = reduced ? 1 : ease(animation[1]);
  const adjusted = reduced ? 1 : ease(animation[2]);
  const rmf = Math.round((30000 + adjusted * 30000) / 100) * 100;
  const trial = calculate({ ...sample, rmf: String(rmf) });
  const style = {
    "--story-input-out": inputOut,
    "--story-result-in": resultIn,
    "--story-result-out": resultOut,
    "--story-trial-in": trialIn,
    "--story-typed": typed,
    "--story-reveal": revealed,
    "--story-adjust": adjusted,
  } as CSSProperties;
  const jump = (chapter: number) => {
    if (!root.current) return;
    if (reduced) {
      root.current
        .querySelector(`#story-scene-${chapter}`)
        ?.scrollIntoView({ behavior: "instant", block: "start" });
      return;
    }
    const box = root.current.getBoundingClientRect();
    const position = [0.18, 0.5, 0.95][chapter];
    window.scrollTo({
      top:
        scrollY +
        box.top +
        (box.height - document.documentElement.clientHeight + navOffset) *
          position -
        navOffset,
      behavior: "smooth",
    });
  };
  return (
    <>
      <section
        className="scroll-story"
        ref={root}
        style={style}
        data-reduced={reduced}
        data-chapter={phase}
        aria-labelledby="story-heading"
      >
        <h2 id="story-heading" className="visually-hidden">
          กรอกรายได้ เข้าใจภาษี ง่ายแค่นี้เองกับ MyTax
        </h2>
        <ol className="visually-hidden">
          <li>
            กรอกรายได้: ใส่เงินเดือนและโบนัสของปีนี้ MyTax รวมยอดทั้งปีให้
            ไม่ต้องนั่งบวกเอง ตัวอย่าง {fmt(before.gross)} บาท
          </li>
          <li>
            เข้าใจภาษี: ดูว่าเงินส่วนไหนถูกนำมาคิดภาษี
            หลังหักค่าใช้จ่ายและค่าลดหย่อน ตัวอย่างภาษีทั้งปีโดยประมาณ{" "}
            {fmt(before.tax)} บาท
          </li>
          <li>
            ง่ายแค่นี้เอง: ลองปรับยอดลดหย่อน เทียบก่อน–หลัง
            และดูเงินที่ต้องจ่ายเพิ่ม ก่อนตัดสินใจจริง ตัวอย่างเพิ่ม RMF
            ทั้งปีจาก 30,000 เป็น 60,000 บาท ภาษีเปลี่ยนเป็น {fmt(after.tax)}{" "}
            บาท ต้องใช้เงินเพิ่ม 30,000 บาท และเข้าเงื่อนไขสิทธิ์
          </li>
        </ol>
        <div className="story-pin">
          <div className="story-topline">
            <span className="story-sample">
              <ShieldCheck size={15} /> ข้อมูลตัวอย่าง · ปี {year}
            </span>
            <span className="story-scroll-hint">
              <ArrowDown size={15} /> เลื่อนดูขั้นต่อไป · ภาพเล่นเอง
            </span>
          </div>
          <div className="story-scenes" aria-hidden="true">
            <div id="story-scene-0" className="story-scene story-input">
              <div className="story-copy">
                <div className="story-title-with-guide">
                  <h3>
                    กรอกรายได้<span className="story-dot">.</span>
                  </h3>
                  <Mascot pointing className="story-guide" />
                </div>
                <p className="story-description">
                  ใส่เงินเดือนและโบนัสของปีนี้ MyTax รวมยอดทั้งปีให้
                  ไม่ต้องนั่งบวกเอง
                </p>
              </div>
              <div className="story-art">
                <div className="story-pay-slip story-visual-paper">
                  <div className="story-paper-header">
                    <Wallet size={23} />
                    <b>รายได้ของฉัน</b>
                    <span>{year}</span>
                  </div>
                  <span className="story-field-label">เงินเดือนต่อเดือน</span>
                  <div className="story-number-field">
                    <strong>
                      {typed > 0.05
                        ? fmt(
                            Math.round(
                              ((money(sample.salary) / 12) * typed) / 100,
                            ) * 100,
                          )
                        : ""}
                      <i />
                    </strong>
                    <span>บาท</span>
                  </div>
                  <div className="story-months">
                    12 เดือน <span>×</span>
                  </div>
                  <div className="story-bonus">
                    <Gift size={21} />
                    <span>โบนัสทั้งปี</span>
                    <b>{fmt(money(sample.bonus))}</b>
                  </div>
                  <div className="story-income-total">
                    <span>รายได้ทั้งปี</span>
                    <strong>
                      {fmt(
                        Math.round(
                          (money(sample.salary) * typed + money(sample.bonus)) /
                            100,
                        ) * 100,
                      )}{" "}
                      <small>บาท</small>
                    </strong>
                  </div>
                </div>
                <span className="story-cursor">
                  <MousePointer2 size={29} fill="currentColor" />
                  <small>MyTax</small>
                </span>
                <div className="story-income-token">
                  <Wallet size={26} />
                  <span>เงินเดือน</span>
                  <b>+ โบนัส</b>
                </div>
              </div>
            </div>
            <div id="story-scene-1" className="story-scene story-result">
              <div className="story-copy">
                <div className="story-title-with-guide">
                  <h3>
                    เข้าใจภาษี<span className="story-dot">.</span>
                  </h3>
                  <Mascot pointing className="story-guide" />
                </div>
                <p className="story-description">
                  ดูว่าเงินส่วนไหนถูกนำมาคิดภาษี หลังหักค่าใช้จ่ายและค่าลดหย่อน
                </p>
              </div>
              <div className="story-art">
                <div className="story-receipt story-visual-paper">
                  <div className="story-paper-header">
                    <ReceiptText size={23} />
                    <b>สรุปภาษีของฉัน</b>
                    <span>{year}</span>
                  </div>
                  <span className="story-field-label">ภาษีทั้งปีโดยประมาณ</span>
                  <strong className="story-tax-amount">
                    {fmt(Math.round((before.tax * revealed) / 100) * 100)}{" "}
                    <small>บาท</small>
                  </strong>
                  <div className="story-money-row">
                    <span>รายได้ทั้งปี</span>
                    <b>{fmt(before.gross)}</b>
                  </div>
                  <div className="story-bar">
                    <span />
                  </div>
                  <div className="story-money-row">
                    <span>เหลือคิดภาษี</span>
                    <b>{fmt(before.taxable)}</b>
                  </div>
                  <div className="story-bar story-net-bar">
                    <span />
                  </div>
                  <div className="story-deduction-note">
                    <Check size={17} /> หักค่าใช้จ่ายและสิทธิ์ลดหย่อนแล้ว
                  </div>
                </div>
                <span className="story-confirm">
                  <Check size={38} strokeWidth={3} />
                </span>
              </div>
            </div>
            <div id="story-scene-2" className="story-scene story-trial">
              <div className="story-copy">
                <div className="story-title-with-guide">
                  <h3>
                    ง่ายแค่นี้เอง<span className="story-dot">.</span>
                  </h3>
                  <Mascot pointing className="story-guide" />
                </div>
                <p className="story-description">
                  ลองปรับยอดลดหย่อน เทียบก่อน–หลัง และดูเงินที่ต้องจ่ายเพิ่ม
                  ก่อนตัดสินใจจริง
                </p>
              </div>
              <div className="story-art">
                <div className="story-compare story-visual-paper">
                  <div className="story-paper-header">
                    <SlidersHorizontal size={23} />
                    <b>ลองก่อนตัดสินใจ</b>
                  </div>
                  <div className="story-comparison-amounts">
                    <div>
                      <span>ก่อนปรับ</span>
                      <strong>{fmt(before.tax)}</strong>
                    </div>
                    <ArrowRight size={23} />
                    <div>
                      <span>หลังปรับ</span>
                      <strong>{fmt(trial.tax)}</strong>
                    </div>
                  </div>
                  <div className="story-rmf-row">
                    <span>RMF ทั้งปี</span>
                    <b>{fmt(rmf * 100)} บาท</b>
                  </div>
                  <div className="story-slider-track">
                    <span />
                    <i />
                  </div>
                  <div className="story-slider-labels">
                    <span>30,000</span>
                    <span>60,000</span>
                  </div>
                  <div className="story-trial-saving">
                    <ShieldCheck size={22} />
                    <span>
                      ภาษีลดลง
                      <strong>
                        {fmt(before.tax - trial.tax)} <small>บาท</small>
                      </strong>
                    </span>
                  </div>
                  <div className="story-extra-cost">
                    ใช้เงินเพิ่ม <b>{fmt((rmf - 30000) * 100)} บาท</b>
                  </div>
                  <small className="story-condition">
                    ตัวอย่างเมื่อเข้าเงื่อนไขสิทธิ์ RMF
                  </small>
                </div>
                <span className="story-adjust-token">
                  <SlidersHorizontal size={25} />
                </span>
              </div>
            </div>
          </div>
          <nav className="story-chapters" aria-label="เลือกจังหวะเรื่องราว">
            {chapters.map((label, index) => (
              <button
                type="button"
                key={label}
                aria-pressed={!reduced && phase === index}
                onClick={() => jump(index)}
              >
                <span>{index + 1}</span>
                {label}
              </button>
            ))}
          </nav>
        </div>
      </section>
    </>
  );
}

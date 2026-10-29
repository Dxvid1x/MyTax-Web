import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowDownRight,
  Check,
  CircleHelp,
  Wallet,
  ShieldCheck,
  MousePointer2,
  ChevronRight,
  Sparkles,
  ReceiptText,
  Coins,
  Heart,
} from "lucide-react";
import { calculate, demoPlan, money } from "./tax.ts";
import "./studio.css";

const fmt = (value: number) =>
  new Intl.NumberFormat("th-TH", { maximumFractionDigits: 2 }).format(
    value / 100,
  );
const chapters = [
  ["ใส่เงินเดือน", "ใช้ยอดก่อนหัก แล้วรวมตามจำนวนเดือนที่ทำงาน"],
  ["เติมโบนัส", "ใส่ยอดทั้งปี แยกจากเงินเดือนเพื่อไม่บวกซ้ำ"],
  ["เช็กค่าลดหย่อน", "รวมสิทธิ์ที่มี เช่น ประกันสังคม ประกัน และ RMF"],
  [
    "ใส่ภาษีที่จ่ายไว้แล้ว",
    "เงินที่บริษัทหักส่งสรรพากร ช่วยเช็กจ่ายเพิ่มหรือขอคืน",
  ],
  ["กดดูผลคำนวณ", "ระบบหักค่าใช้จ่ายกับสิทธิ์ ก่อนคิดภาษีเป็นขั้น"],
  ["อ่านผลภาษี", "ดูภาษีทั้งปี และยอดที่จ่ายไว้แล้วแยกกัน"],
  ["เปิด “วางแผนภาษี”", "กดจากผลภาษี เพื่อสำรวจสิทธิ์ในหน้าใหม่"],
  ["สำรวจทางเลือก", "กองทุน ประกัน และสิทธิ์จากสิ่งที่จ่ายไปแล้ว"],
  ["ลองปรับยอด RMF", "ตัวอย่างเพิ่มยอดทั้งปีจาก 30,000 เป็น 60,000"],
  ["เทียบภาษีกับเงินที่ใช้", "ดูภาษีที่ลดลง พร้อมยอดจ่ายเพิ่มจากเดิม"],
  ["เลือกวิธีที่เข้าใจ", "ตรวจเงื่อนไข แล้วใช้ข้อมูลจริงคำนวณของคุณ"],
];

function AnimatedMoney({
  value,
  reduced,
  active,
  initial = 0,
}: {
  value: number;
  reduced: boolean;
  active: boolean;
  initial?: number;
}) {
  const [display, setDisplay] = useState(initial);
  const last = useRef(initial);
  useEffect(() => {
    if (reduced) {
      last.current = value;
      setDisplay(value);
      return;
    }
    if (!active) return;
    const from = last.current;
    let start = 0,
      id = 0;
    const tick = (time: number) => {
      if (!start) start = time;
      const progress = Math.min(1, (time - start) / 420);
      const next = Math.round(
        from + (value - from) * (1 - Math.pow(1 - progress, 3)),
      );
      setDisplay(next);
      last.current = next;
      if (progress < 1) id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [value, reduced, active]);
  return (
    <>
      <span aria-hidden="true">{fmt(display)}</span>
      <span className="visually-hidden">{fmt(value)}</span>
    </>
  );
}

export function DemoStudio({
  onStart,
  onReduce,
}: {
  onStart: () => void;
  onReduce: () => void;
}) {
  const [fullDemo, setFullDemo] = useState(false);
  const sequence = fullDemo ? chapters.map((_, i) => i) : [0, 2, 5, 6, 7];
  const root = useRef<HTMLElement>(null);
  const [reduced, setReduced] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [frame, setFrame] = useState(reduced ? 5 : 0),
    [playing, setPlaying] = useState(!reduced);
  const [monthly, setMonthly] = useState("50000"),
    [rmf, setRmf] = useState("30000");
  const [inView, setInView] = useState(false),
    [pageVisible, setPageVisible] = useState(!document.hidden),
    [custom, setCustom] = useState(false);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => {
      setReduced(media.matches);
      if (media.matches) {
        setPlaying(false);
        setFrame(5);
        setRmf("30000");
      }
    };
    const visibility = () => setPageVisible(!document.hidden);
    media.addEventListener("change", change);
    document.addEventListener("visibilitychange", visibility);
    const observer = new IntersectionObserver(
      ([entry]) =>
        setInView(entry.isIntersecting && entry.intersectionRatio >= 0.15),
      { threshold: 0.15 },
    );
    if (root.current)
      observer.observe(
        root.current.querySelector(".demo-output-panel") || root.current,
      );
    return () => {
      media.removeEventListener("change", change);
      document.removeEventListener("visibilitychange", visibility);
      observer.disconnect();
    };
  }, []);
  useEffect(() => {
    if (!playing || !inView || !pageVisible || reduced) return;
    const timer = setTimeout(
      () => {
        const next = sequence[(sequence.indexOf(frame) + 1) % sequence.length];
        setFrame(next);
        if (next === 0) setRmf("30000");
        if (next === 8) setRmf("60000");
      },
      frame === 10
        ? 3700
        : frame === 5 || frame === 7 || frame === 9
          ? 3000
          : 2300,
    );
    return () => clearTimeout(timer);
  }, [playing, frame, inView, pageVisible, reduced, fullDemo]);
  const jump = (next: number) => {
    setPlaying(false);
    setCustom(false);
    setMonthly("50000");
    setRmf(next >= 8 ? "60000" : "30000");
    setFrame(next);
  };
  const resume = () => {
    setCustom(false);
    setMonthly("50000");
    setRmf("30000");
    setFrame(0);
    setPlaying(!reduced);
  };
  const edit = (kind: "salary" | "rmf", value: string) => {
    setPlaying(false);
    setCustom(true);
    setFrame(kind === "rmf" ? 9 : 5);
    if (kind === "salary") setMonthly(value);
    else setRmf(value);
  };
  let result: ReturnType<typeof calculate> | null = null,
    baseline: ReturnType<typeof calculate> | null = null,
    error = "";
  try {
    const salary = money(monthly) * 12;
    const plan = { ...demoPlan(), salary: (salary / 100).toFixed(2), rmf };
    result = calculate(plan);
    baseline = calculate({ ...plan, rmf: "30000" });
  } catch {
    error = "ใส่ตัวเลขไม่ติดลบ และทศนิยมไม่เกิน 2 ตำแหน่ง";
  }
  const savings = result && baseline ? baseline.tax - result.tax : 0,
    extra = result && baseline ? result.values.rmf - baseline.values.rmf : 0;
  const showResult = frame >= 5,
    showGuide = frame >= 7,
    phase = frame < 2 ? 0 : frame < 5 ? 1 : frame < 7 ? 2 : 3;
  const active = inView && pageVisible;
  return (
    <section
      ref={root}
      data-demo-frame={frame}
      data-play-state={
        playing ? (active && !reduced ? "running" : "waiting") : "paused"
      }
      className={
        "demo-studio expanded-demo " +
        (playing ? "is-playing" : "") +
        (reduced ? " motion-reduced" : "")
      }
      aria-labelledby="studio-heading"
    >
      <div className="demo-boundary">
        <strong>ลองเล่นข้อมูลตัวอย่าง — ไม่ใช่ข้อมูลของคุณ</strong>
        <span>ตัวเลขเดโมไม่ถูกนำไปใส่ในแผนภาษีหรือบันทึกของคุณ</span>
      </div>
      <div className="demo-length-choice" role="group" aria-label="ความยาวเดโม">
        <button
          aria-pressed={!fullDemo}
          onClick={() => {
            setFullDemo(false);
            resume();
          }}
        >
          ดูภาพรวมสั้น ๆ
        </button>
        <button
          aria-pressed={fullDemo}
          onClick={() => {
            setFullDemo(true);
            resume();
          }}
        >
          ดูครบ 11 ขั้น
        </button>
      </div>
      <div className="studio-heading">
        <div>
          <span className="demo-pill">เดโม MyTax</span>
          <h2 id="studio-heading">
            ลองปรับตัวเลข <ArrowRight size={22} /> ดูผลประมาณการ
          </h2>
        </div>
        <span className="demo-only">
          <ShieldCheck size={15} /> ข้อมูลตัวอย่าง ปี 2568
        </span>
      </div>
      <div className={"studio-stage phase-" + phase + " frame-" + frame}>
        <div className="demo-input-panel">
          <div className="demo-windowbar">
            <span className="window-dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span>mytax / ข้อมูลตัวอย่าง</span>
            <span className="window-tag">ตัวอย่าง</span>
          </div>
          <div className="demo-form">
            <div className="demo-form-title">
              <Wallet size={21} />
              <strong>รายได้ในตัวอย่าง</strong>
              <span>2568</span>
            </div>
            <label
              className={"demo-field " + (frame === 0 ? "demo-focus" : "")}
              htmlFor="demo-monthly"
            >
              <span>เงินเดือนต่อเดือน × 12</span>
              <div>
                <input
                  id="demo-monthly"
                  inputMode="decimal"
                  value={monthly}
                  onChange={(e) => edit("salary", e.target.value)}
                  autoComplete="off"
                  aria-describedby={error ? "demo-error" : undefined}
                />
                <span>บาท</span>
              </div>
            </label>
            <div className={"demo-bonus " + (frame === 1 ? "demo-focus" : "")}>
              <span>โบนัสทั้งปี</span>
              <b>
                60,000 <small>บาท</small>
              </b>
            </div>
            <div
              className={
                "demo-deduction-overview " + (frame === 2 ? "demo-focus" : "")
              }
            >
              <span>
                <ShieldCheck size={15} /> สิทธิ์อื่นในตัวอย่าง
              </span>
              <div>
                <span>ส่วนตัว 60,000</span>
                <span>ประกันสังคม 9,000</span>
                <span>ชีวิต 20,000</span>
                <span>สุขภาพ 15,000</span>
              </div>
            </div>
            <label
              className={
                "demo-field rmf-demo-field " +
                (frame === 2 || frame === 8 ? "demo-focus" : "")
              }
              htmlFor="demo-rmf"
            >
              <span>RMF ทั้งปี</span>
              <div>
                <input
                  id="demo-rmf"
                  inputMode="decimal"
                  value={rmf}
                  onChange={(e) => edit("rmf", e.target.value)}
                  autoComplete="off"
                  aria-describedby={error ? "demo-error" : undefined}
                />
                <span>บาท</span>
              </div>
              <input
                className="demo-range"
                aria-label="เลื่อน RMF ในเดโม"
                type="range"
                min="0"
                max="120000"
                step="1000"
                value={Math.min(120000, Number(rmf) || 0)}
                onChange={(e) => edit("rmf", e.target.value)}
              />
            </label>
            <div
              className={"demo-prepaid " + (frame === 3 ? "demo-focus" : "")}
            >
              <ReceiptText size={17} />
              <span>บริษัทจ่ายภาษีไว้แล้ว</span>
              <b>
                32,000 <small>บาท</small>
              </b>
            </div>
            <details className="demo-assumptions">
              <summary>
                <CircleHelp size={13} /> ใช้ข้อมูลอะไรบ้าง?
              </summary>
              <p>
                เงินเดือน × 12 เดือน โบนัส 60,000 ส่วนตัว 60,000 ประกันสังคม
                ม.33 9,000 ประกันชีวิต 20,000 สุขภาพ 15,000 และ RMF ตามที่ปรับ
                ทุกสิทธิ์สมมติว่าเข้าเงื่อนไข กฎปี 2568
              </p>
              <small>
                หักภาษีไว้ 32,000 บาท · ไม่มีกองทุนเกษียณอื่นร่วม ·
                ไม่บันทึกในแผนของคุณ
              </small>
            </details>
            <button
              className={"demo-calculate " + (frame === 4 ? "demo-focus" : "")}
              onClick={() => {
                setPlaying(false);
                setFrame(5);
              }}
            >
              ดูผลคำนวณ <ChevronRight size={17} />
            </button>
            {error && (
              <p id="demo-error" className="demo-error" role="alert">
                {error}
              </p>
            )}
          </div>
        </div>
        <div className="demo-link" aria-hidden="true">
          <ArrowRight size={20} />
        </div>
        <div className="demo-output-panel">
          <div className="demo-screenbar">
            <span>
              <i className={playing ? "running" : ""} />
              {showGuide ? "สำรวจสิทธิ์" : playing ? "กำลังสาธิต" : "พรีวิว"}
            </span>
            <span>
              MyTax<span className="screen-period">.</span>
            </span>
            <span>2568</span>
          </div>
          {result ? (
            showGuide ? (
              <div className="demo-guide-screen">
                <div className="demo-guide-title">
                  <Sparkles size={22} />
                  <div>
                    <small>ตัวอย่างหน้าใหม่</small>
                    <h3>วางแผนภาษี</h3>
                  </div>
                </div>
                <div className="demo-guide-choices">
                  <div className={frame >= 8 ? "chosen" : ""}>
                    <Coins size={24} />
                    <span>
                      RMF<small>ออมเพื่อเกษียณ</small>
                    </span>
                    {frame >= 8 && <Check size={16} />}
                  </div>
                  <div>
                    <Heart size={24} />
                    <span>
                      ประกัน<small>ชีวิต · สุขภาพ</small>
                    </span>
                  </div>
                  <div>
                    <Wallet size={24} />
                    <span>
                      สิทธิ์อื่น<small>เช็กสิ่งที่จ่ายไว้</small>
                    </span>
                  </div>
                </div>
                {frame >= 8 ? (
                  <>
                    <div className="demo-guide-compare">
                      <div>
                        <span>ภาษีเดิม</span>
                        <b>{fmt(baseline?.tax || 0)}</b>
                      </div>
                      <ArrowRight size={20} />
                      <div>
                        <span>เมื่อปรับ RMF</span>
                        <b>
                          <AnimatedMoney
                            initial={baseline?.tax || 0}
                            value={result.tax}
                            reduced={reduced}
                            active={active}
                          />
                        </b>
                      </div>
                    </div>
                    <div className="demo-guide-saving">
                      <ArrowDownRight size={21} />
                      <span>
                        {savings >= 0 ? "ภาษีลดลง" : "ภาษีเพิ่มขึ้น"}
                        <b
                          className={
                            savings > 0
                              ? "value-positive"
                              : savings < 0
                                ? "value-negative"
                                : "value-neutral"
                          }
                        >
                          <AnimatedMoney
                            value={Math.abs(savings)}
                            reduced={reduced}
                            active={active}
                          />{" "}
                          บาท
                        </b>
                      </span>
                      <span>
                        {extra >= 0 ? "ยอดซื้อเพิ่ม" : "ยอดซื้อลดลง"}
                        <b
                          className={
                            extra > 0
                              ? "value-negative"
                              : extra < 0
                                ? "value-positive"
                                : "value-neutral"
                          }
                        >
                          {fmt(Math.abs(extra))} บาท
                        </b>
                      </span>
                    </div>
                    <p className="demo-guide-tip">
                      ตรวจเงื่อนไขถือครองและเงินที่พร้อมใช้ก่อนตัดสินใจ
                    </p>
                  </>
                ) : (
                  <div className="demo-guide-intro-note">
                    <ShieldCheck size={20} />
                    <p>
                      เริ่มจากสิทธิ์ที่มี
                      <br />
                      แล้วทดลองยอดก่อนใช้ข้อมูลจริง
                    </p>
                  </div>
                )}
                <button
                  className={
                    "demo-reduce-link " + (frame === 10 ? "demo-focus" : "")
                  }
                  onClick={onReduce}
                >
                  เปิดหน้าวางแผนภาษี <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <div
                className={"demo-screen " + (showResult ? "has-result" : "")}
              >
                <div className="demo-output-title">
                  <span>ภาษีทั้งปีโดยประมาณ</span>
                  <span className="screen-badge">
                    <Check size={12} /> คำนวณในเครื่อง
                  </span>
                </div>
                <div className="demo-tax-number">
                  {showResult ? (
                    <AnimatedMoney
                      value={result.tax}
                      reduced={reduced}
                      active={active}
                    />
                  ) : (
                    <span className="screen-wait">—</span>
                  )}
                  <small>บาท</small>
                </div>
                <div
                  className="demo-chart"
                  aria-label="ภาพรายได้และเงินได้สุทธิ"
                >
                  <div>
                    <span>รายได้ทั้งปี</span>
                    <b>{fmt(result.gross)}</b>
                  </div>
                  <span className="demo-chart-track">
                    <i style={{ width: "100%" }} />
                  </span>
                  <div>
                    <span>เหลือคิดภาษี</span>
                    <b>{showResult ? fmt(result.taxable) : "—"}</b>
                  </div>
                  <span className="demo-chart-track">
                    <i
                      style={{
                        width:
                          (showResult && result.gross
                            ? Math.min(
                                100,
                                (result.taxable / result.gross) * 100,
                              )
                            : 0) + "%",
                      }}
                    />
                  </span>
                </div>
                <div className="demo-balance">
                  <ReceiptText size={20} />
                  <span>
                    {showResult
                      ? result.balance !== null && result.balance < 0
                        ? "ขอคืนโดยประมาณ"
                        : "จ่ายเพิ่มโดยประมาณ"
                      : "หลังหักภาษีที่บริษัทจ่ายไว้"}
                    <b
                      className={
                        showResult &&
                        result.balance !== null &&
                        result.balance < 0
                          ? "value-positive"
                          : showResult &&
                              result.balance !== null &&
                              result.balance > 0
                            ? "value-negative"
                            : undefined
                      }
                    >
                      {showResult
                        ? fmt(Math.abs(result.balance || 0)) + " บาท"
                        : "32,000 บาท จ่ายไว้แล้ว"}
                    </b>
                  </span>
                </div>
                <p className="demo-step-hint">
                  {showResult
                    ? "สำรวจสิทธิ์ต่อได้จากปุ่มข้างล่าง"
                    : "กรอกให้ครบ แล้วกดดูผลคำนวณ"}
                </p>
                <button
                  className={
                    "demo-reduce-link " +
                    (frame === 6 ? "demo-focus simulated-click" : "")
                  }
                  onClick={onReduce}
                >
                  <Sparkles size={20} /> วางแผนภาษี <ChevronRight size={17} />
                </button>
              </div>
            )
          ) : (
            <div className="demo-screen-error">
              <CircleHelp size={30} />
              <p>
                ตรวจตัวเลขฝั่งซ้าย
                <br />
                แล้วผลจะปรากฏตรงนี้
              </p>
            </div>
          )}
        </div>
        {!custom && (
          <div className={"demo-cursor cursor-" + frame} aria-hidden="true">
            <MousePointer2 size={25} fill="#10281c" />
            <span>MyTax</span>
          </div>
        )}
      </div>
      <div className="demo-player">
        <div className="demo-chapters" aria-label="เลือกขั้นตอนเดโม">
          {(fullDemo
            ? chapters.map(([label], target) => [label, target] as const)
            : [
                ["รายได้", 0],
                ["สิทธิ์และภาษีที่จ่ายไว้", 2],
                ["ผลภาษี", 5],
                ["วางแผนภาษี", 7],
              ]
          ).map(([label, target]) => (
            <button
              key={label}
              aria-pressed={frame === Number(target)}
              className={frame === Number(target) ? "current" : ""}
              onClick={() => jump(Number(target))}
            >
              {label}
            </button>
          ))}
        </div>
        <div
          className="demo-narration"
          role="status"
          aria-live={playing ? "off" : "polite"}
        >
          <strong>{custom ? "คุณกำลังลองเอง" : chapters[frame][0]}</strong>
          <span>
            {custom
              ? "ตัวเลขนี้เป็นเดโม ไม่แก้ข้อมูลในแผนของคุณ"
              : chapters[frame][1]}
          </span>
        </div>
        <details className="demo-motion-settings">
          <summary>การแสดงภาพ</summary>
          <label>
            <input
              type="checkbox"
              checked={!playing || reduced}
              disabled={reduced}
              onChange={(e) =>
                e.target.checked
                  ? setPlaying(false)
                  : custom
                    ? resume()
                    : setPlaying(true)
              }
            />{" "}
            พักภาพเคลื่อนไหว
          </label>
          <button onClick={resume}>วนต่อจากต้น</button>
          {reduced && <small>แตะชื่อขั้นตอนเพื่อดูภาพนิ่ง</small>}
        </details>
        <progress
          max={sequence.length - 1}
          value={Math.max(0, sequence.indexOf(frame))}
          aria-label="ความคืบหน้าเดโม"
        />
      </div>
      <button className="studio-start" onClick={onStart}>
        พร้อมแล้ว คำนวณของฉัน <ArrowRight size={16} />
      </button>
    </section>
  );
}

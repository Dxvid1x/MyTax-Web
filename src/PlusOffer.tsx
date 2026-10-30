import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  Wallet,
  ChartNoAxesCombined,
  Target,
  Play,
  Pause,
  ShieldCheck,
} from "lucide-react";
export function PlusOffer({ onTry }: { onTry: (personal: boolean) => void }) {
  const [stage, setStage] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const stop = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    setPlaying(false);
  };
  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current);
    },
    [],
  );
  const frames = [
    {
      label: "ตั้งแผน",
      amount: "5,000",
      goal: 3000,
      spent: 0,
      available: 5000,
      note: "กันบิลกับเป้าหมายก่อน เหลือแบ่งใช้ 5,000 บาท",
    },
    {
      label: "ติดตาม",
      amount: "3,200",
      goal: 3000,
      spent: 1800,
      available: 3200,
      note: "ใช้เพิ่ม 1,800 บาท เหลือแบ่งใช้ 3,200 บาท",
    },
    {
      label: "ลองปรับ",
      amount: "3,700",
      goal: 2500,
      spent: 1800,
      available: 3700,
      note: "ผ่อนเป้าหมาย 500 บาท เงินเป้าหมายลดลงเท่ากัน",
    },
  ];
  const frame = frames[stage];
  const play = () => {
    if (playing) {
      stop();
      return;
    }
    setStage(0);
    setPlaying(true);
    let n = 0;
    timer.current = setInterval(() => {
      n++;
      setStage(n);
      if (n === 2) {
        if (timer.current) clearInterval(timer.current);
        timer.current = null;
        setPlaying(false);
      }
    }, 1500);
  };
  return (
    <div className="plus-offer">
      <section className="plus-offer-hero" aria-labelledby="plus-offer-heading">
        <div className="plus-offer-copy">
          <span className="plus-wordmark">
            MyTax <b>Plus</b>
          </span>
          <h1 id="plus-offer-heading">
            รู้ก่อนใช้
            <br />
            <em>ปรับทันก่อนเงินตึง</em>
          </h1>
          <p>
            เห็นเงินที่เหลือจริงในแผน
            <br />
            แล้วเลือกก้าวต่อไปได้ง่ายขึ้น
          </p>
          <div className="plus-offer-actions">
            <button className="primary" onClick={() => onTry(true)}>
              ลองกับเงินของฉัน <ArrowRight size={17} />
            </button>
            <button className="text-button" onClick={() => onTry(false)}>
              ดูตัวอย่างติดตาม 4 สัปดาห์
            </button>
          </div>
          <span className="plus-offer-trial">
            ต้นแบบให้ลองฟรี · ไม่ใส่บัตร · ยังไม่เปิดสมาชิกชำระเงิน
          </span>
        </div>
        <div className="plus-preview">
          <div className="plus-preview-caption">
            <span>
              <Wallet size={16} /> เงินของคุณ มีที่ไปชัดเจน
            </span>
            <small>ตัวเลขสมมติ</small>
          </div>
          <div
            className="plus-preview-tabs"
            role="group"
            aria-label="ตัวอย่างวงจร Plus"
          >
            {frames.map((f, i) => (
              <button
                key={f.label}
                aria-pressed={stage === i}
                onClick={() => {
                  stop();
                  setStage(i);
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="plus-visual-scene">
            <div className="plus-orbit" aria-hidden="true">
              <svg viewBox="0 0 160 160">
                <circle className="orbit-track" cx="80" cy="80" r="64" />
                <circle
                  className="orbit-bills"
                  cx="80"
                  cy="80"
                  r="64"
                  strokeDasharray="134 402"
                />
                <circle
                  className="orbit-goal"
                  cx="80"
                  cy="80"
                  r="64"
                  strokeDasharray={`${(frame.goal / 12000) * 402} 402`}
                  strokeDashoffset="-134"
                />
                <circle
                  className="orbit-free"
                  cx="80"
                  cy="80"
                  r="64"
                  strokeDasharray={`${(frame.available / 12000) * 402} 402`}
                  strokeDashoffset={-(134 + (frame.goal / 12000) * 402)}
                />
              </svg>
              <span>
                <Wallet size={28} />
                <small>12,000</small>
              </span>
            </div>
            <div className="plus-preview-money" aria-live="polite">
              <span>ยังจัดสรรใช้ได้</span>
              <strong key={stage}>
                {frame.amount}
                <small> บาท</small>
              </strong>
              <span>ก่อนวันเงินเข้า</span>
            </div>
          </div>
          <div className="plus-pocket-list" aria-hidden="true">
            {[
              ["บิลจำเป็น", 4000, "bills"],
              ["กันเป้าหมาย", frame.goal, "goal"],
              ["ใช้ไปแล้ว", frame.spent, "spent"],
            ].map(([label, value, kind]) => (
              <div key={String(kind)} className={`pocket-${kind}`}>
                <span>{label}</span>
                <div>
                  <i style={{ width: (Number(value) / 12000) * 100 + "%" }} />
                </div>
                <b>{Number(value).toLocaleString("th-TH")}</b>
              </div>
            ))}
          </div>
          <div className="plus-preview-outcome">
            <Check size={18} />
            <span>{frame.note}</span>
          </div>
          <button className="plus-play" onClick={play}>
            {playing ? <Pause size={16} /> : <Play size={16} />}{" "}
            {playing ? "หยุดตัวอย่าง" : "เล่นตัวอย่าง"}
          </button>
        </div>
      </section>
      <section className="plus-outcomes" aria-label="สิ่งที่ได้จาก Plus">
        {[
          [
            Wallet,
            "ก่อนจ่าย",
            "รู้เงินที่ยังแบ่งใช้ได้",
            "กันบิลและเงินเป้าหมายออกก่อน จากข้อมูลที่คุณยืนยัน",
          ],
          [
            ChartNoAxesCombined,
            "กลับมา",
            "เห็นว่าเงินเปลี่ยนตรงไหน",
            "เทียบจุดทบทวนก่อนหน้า พร้อมดูหมวดรายจ่ายหลัก",
          ],
          [
            Target,
            "ก่อนปรับ",
            "เห็นผลก่อนเลือก",
            "ลองขยับเงินกันเป้าหมาย แล้วดูสิ่งที่ได้และต้องแลก",
          ],
        ].map(([Icon, kicker, title, detail]) => {
          const I = Icon as typeof Wallet;
          return (
            <article key={String(title)}>
              <span className="outcome-icon">
                <I size={23} />
              </span>
              <small>{String(kicker)}</small>
              <h2>{String(title)}</h2>
              <details>
                <summary>ดูว่าได้อะไร</summary>
                <p>{String(detail)}</p>
              </details>
            </article>
          );
        })}
      </section>
      <div className="plus-bottomline">
        <ShieldCheck size={19} />
        <span>บันทึกแผนในเครื่อง แล้วกลับมาติดตามต่อได้</span>
        <button className="text-button" onClick={() => onTry(true)}>
          เริ่มใช้ Plus <ArrowRight size={15} />
        </button>
      </div>
      <section className="plus-questions" aria-label="ก่อนเริ่มใช้ Plus">
        <details>
          <summary>สิ่งที่ได้ใน Plus และสิ่งที่ยังไม่เปิด</summary>
          <div className="plus-included">
            <span>
              <Check size={15} /> เงินใช้ได้ก่อนวันเงินเข้า
            </span>
            <span>
              <Check size={15} /> เป้าหมายเงินฉุกเฉิน
            </span>
            <span>
              <Check size={15} /> เทียบจุดทบทวน
            </span>
            <span>
              <Check size={15} /> ทดลองปรับและย้อนกลับ
            </span>
          </div>
          <p>
            ต้นแบบใช้สมุดเงินเดิมและบันทึกแผนในเครื่องได้ ยังไม่มีซิงก์
            เชื่อมธนาคาร แจ้งเตือนนอกเว็บ หรือผู้เชี่ยวชาญดูแลจริง
            ยอดเป็นประมาณการตามข้อมูล ไม่ใช่ยอดธนาคาร
          </p>
        </details>
        <details>
          <summary>ราคาและข้อมูลของฉัน</summary>
          <p>
            ยังไม่เปิดรับสมัครสมาชิกชำระเงินหรือกำหนดราคา ลองได้โดยไม่ใส่บัตร
            แผนเก็บเมื่อกดบันทึกในเบราว์เซอร์นี้ ไม่เข้ารหัสและไม่ซิงก์
            สำรองสมุดเงินเดิมยังไม่รวมแผน Plus
            เมื่อเปิดขายจริงต้องแจ้งรอบบิลและการยกเลิกก่อนชำระ
          </p>
        </details>
      </section>
    </div>
  );
}

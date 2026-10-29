import {
  ArrowLeft,
  ArrowRight,
  ShieldAlert,
  Siren,
  Scale,
  LockKeyhole,
  ReceiptText,
  Clock,
  ExternalLink,
} from "lucide-react";
import { TAX_LAW } from "./taxLawContent.ts";
import "./taxLaw.css";

export function TaxLaw({ onReduce }: { onReduce: () => void }) {
  return (
    <section className="workspace tax-law" aria-labelledby="tax-law-heading">
      <button className="guide-back" onClick={onReduce}>
        <ArrowLeft size={17} /> กลับไปวางแผนภาษี
      </button>
      <div className="law-hero">
        <div className="law-copy">
          <span className="law-kicker">
            <ShieldAlert size={18} /> รู้ผลของการหนีภาษี
          </span>
          <h1 id="tax-law-heading">
            หนีภาษี
            <br />
            เสี่ยงมากกว่าที่คิด
          </h1>
          <p>
            อาจต้องจ่ายภาษีที่ค้าง พร้อมเบี้ยปรับ เงินเพิ่ม
            และรับโทษทางอาญาตามกรณี
          </p>
          <button className="primary" onClick={onReduce}>
            กลับไปใช้สิทธิ์ให้ถูกต้อง <ArrowRight size={18} />
          </button>
        </div>
        <div className="law-scene" aria-hidden="true">
          <div className="law-siren">
            <Siren size={62} />
            <span />
          </div>
          <div className="law-cell">
            <img
              src="/images/mytax-mascot-crying-bars.webp"
              width={800}
              height={959}
              alt=""
              decoding="async"
            />
            <div className="law-cell-lock">
              <LockKeyhole size={27} />
            </div>
          </div>
          <span className="law-scene-caption">ภาพจำลองเพื่อเรียนรู้</span>
        </div>
      </div>
      <div className="law-meaning">
        <Scale size={22} />
        <p>
          “เลี่ยงภาษี” ในหน้านี้หมายถึงการหนีภาษีโดยผิดกฎหมาย เช่น
          เจตนาปกปิดรายได้หรือใช้หลักฐานเท็จ
          การใช้สิทธิ์ลดหย่อนที่เข้าเงื่อนไขเป็นการวางแผนตามกฎหมาย
        </p>
      </div>
      <h2>แต่ละกรณี มีผลต่างกัน</h2>
      <div className="law-cases">
        {TAX_LAW.cases.map((item) => (
          <article className="law-case" key={item.id} data-law-case={item.id}>
            <span className="law-article">{item.article}</span>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <strong>{item.penalty}</strong>
            <span>{item.detail}</span>
            <a href={TAX_LAW.criminalSource} target="_blank" rel="noreferrer">
              อ่านตัวบท {item.article} <ExternalLink size={14} />
            </a>
          </article>
        ))}
      </div>
      <h2>เงินที่ต้องจ่าย อาจเพิ่มขึ้นด้วย</h2>
      <div className="law-money-cases">
        <article className="law-case">
          <Clock size={27} />
          <h3>เงินเพิ่มเมื่อชำระช้า</h3>
          <strong>โดยทั่วไป 1.5% ต่อเดือน</strong>
          <p>
            คิดจากภาษีที่ค้าง ไม่รวมเบี้ยปรับ เศษเดือนนับเป็นหนึ่งเดือน
            และเงินเพิ่มรวมไม่เกินภาษีที่ต้องชำระ
          </p>
          <p>
            กรณีได้รับอนุมัติขยายเวลาและชำระภายในเวลาที่ขยาย อัตราตามมาตรา 27
            ลดเหลือ 0.75% ต่อเดือนหรือเศษเดือน
          </p>
          <a href={TAX_LAW.assessmentSource} target="_blank" rel="noreferrer">
            อ่านมาตรา 27 <ExternalLink size={14} />
          </a>
        </article>
        <article className="law-case">
          <ReceiptText size={27} />
          <h3>เบี้ยปรับจากการประเมิน</h3>
          <strong>1 เท่า หรือ 2 เท่า</strong>
          <p>
            มาตรา 22: ประเมินตามมาตรา 20/21 เรียกเบี้ยปรับ 1
            เท่าของภาษีที่ต้องชำระ
          </p>
          <p>
            มาตรา 26: ประเมินกรณีไม่ยื่นตามมาตรา 24/25 เรียกเบี้ยปรับ 2 เท่า
            เว้นแต่กฎหมายกำหนดต่างไป อาจงดหรือลดได้ตามระเบียบ
          </p>
          <a href={TAX_LAW.assessmentSource} target="_blank" rel="noreferrer">
            อ่านมาตรา 22, 26, 27 ทวิ <ExternalLink size={14} />
          </a>
        </article>
      </div>
      <div className="law-next">
        <ShieldAlert size={28} />
        <div>
          <h2>ลดภาษี เริ่มจากสิทธิ์ที่มี</h2>
          <p>ตรวจหลักฐาน กรอกยอดจริง และเลือกเฉพาะรายการที่เข้าเงื่อนไข</p>
        </div>
        <button className="primary" onClick={onReduce}>
          ดูวิธีลดหย่อน <ArrowRight size={17} />
        </button>
      </div>
      <p className="law-footnote">
        ตรวจตัวบทจากกรมสรรพากรเมื่อ {TAX_LAW.reviewed} โทษจริงขึ้นกับข้อเท็จจริง
        องค์ประกอบความผิด และกระบวนการตามกฎหมาย หน้านี้ให้ความรู้ทั่วไป
        กรุณาตรวจสอบกับผู้เชี่ยวชาญก่อนตัดสินใจ
      </p>
    </section>
  );
}

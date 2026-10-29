import { SCOPE, EXTENDED_SOURCES } from "./scope.ts";
import { RULES_BY_YEAR, type TaxPlan } from "./tax.ts";
import { SITE } from "./siteContent.ts";

export function About({
  plan,
  onManage,
}: {
  plan: TaxPlan;
  onManage: () => void;
}) {
  const sources = [
    ...RULES_BY_YEAR[plan.taxYear ?? "2568"].sources,
    ...EXTENDED_SOURCES,
  ];
  const unique = sources.filter(
    (item, index) => sources.findIndex((s) => s.url === item.url) === index,
  );
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
  return (
    <section className="workspace about-page">
      <div className="page-head">
        <div>
          <h1>เกี่ยวกับ MyTax</h1>
          <p>ดูขอบเขต ข้อมูลที่เก็บ และแหล่งอ้างอิงก่อนใช้งาน</p>
        </div>
      </div>
      <section className="panel">
        <h2>แอปทำอะไรได้บ้าง?</h2>
        <p>{SCOPE.supported}</p>
        <h3>กรณีที่ยังไม่รองรับ</h3>
        <p>{SCOPE.excluded}</p>
        <p>{SCOPE.limitation}</p>
      </section>
      <section className="panel">
        <h2>ข้อมูลอยู่ที่ไหน?</h2>
        <p>
          คำนวณภาษีในเบราว์เซอร์ เมื่อเปิดบันทึกในเครื่อง
          แผนภาษีและสมุดเงินอยู่ในเบราว์เซอร์นี้ การนำเข้า Statement
          อ่านไฟล์ในเครื่อง ไม่อัปโหลดไฟล์และไม่เชื่อมบัญชีธนาคาร
        </p>
        <p>
          เปิด “จัดการข้อมูล” เพื่อสำรอง นำเข้า หยุดบันทึก หรือล้างข้อมูล
          การดาวน์โหลดสำรองส่งออกเป็นไฟล์เฉพาะเมื่อกดเอง เปิดได้จากตั้งค่า →
          บันทึก สำเนาในเครื่องและไฟล์ที่ดาวน์โหลดต้องลบแยกต่างหาก
        </p>
        <button className="secondary" onClick={onManage}>
          จัดการข้อมูล
        </button>
      </section>
      <section className="panel">
        <h2>กฎและแหล่งอ้างอิง</h2>
        <p>
          ตรวจกฎล่าสุด {RULES_BY_YEAR[plan.taxYear ?? "2568"].checked} · ปีภาษี{" "}
          {plan.taxYear ?? "2568"}
        </p>
        <ul>
          {unique.map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noopener noreferrer">
                {s.title}
              </a>
            </li>
          ))}
        </ul>
      </section>
      <section className="panel">
        <h2>คำถามที่พบบ่อย</h2>
        {faqs.map(([q, a]) => (
          <details key={q}>
            <summary>{q}</summary>
            <p>{a}</p>
          </details>
        ))}
      </section>
      <section className="panel">
        <h2>ผู้จัดทำและฟีดแบ็ก</h2>
        <p>{SITE.creator || "TODO: รอชื่อผู้จัดทำจากเจ้าของเว็บไซต์"}</p>
        {SITE.feedback ? (
          <a className="secondary" href={SITE.feedback}>
            แจ้งปัญหาหรือข้อเสนอแนะ
          </a>
        ) : (
          <p className="feedback-todo">
            TODO: รอช่องทางรับฟีดแบ็กจากเจ้าของเว็บไซต์
          </p>
        )}
        <p>
          แจ้งขั้นตอนที่พบปัญหาและปีภาษี โดยไม่แนบรายได้ เอกสาร เลขประจำตัว
          หรือไฟล์สำรองข้อมูลการเงิน
        </p>
      </section>
    </section>
  );
}

import { Users, Home, Landmark, Leaf, HandHeart } from "lucide-react";
import { extendedDefaults, type ExtendedTax } from "./extendedTax.ts";
import type { TaxPlan } from "./tax.ts";
import { MoneyField } from "./MoneyField.tsx";
export function ExtendedDeductions({
  plan,
  setPlan,
}: {
  plan: TaxPlan;
  setPlan: (p: TaxPlan) => void;
}) {
  const x = { ...extendedDefaults, ...plan.extra };
  const update = (key: keyof ExtendedTax, value: string | boolean) =>
    setPlan({ ...plan, extra: { ...x, [key]: value } });
  const confirm = (key: keyof ExtendedTax, label: string) => (
    <label className="check-row">
      <input
        id={key}
        type="checkbox"
        checked={!!x[key]}
        onChange={(e) => update(key, e.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
  const number = (key: keyof ExtendedTax, label: string, max = 10) => (
    <label className="field" htmlFor={key}>
      <span>{label}</span>
      <select
        id={key}
        value={x[key] as string}
        onChange={(e) => update(key, e.target.value)}
      >
        {Array.from({ length: max + 1 }, (_, i) => (
          <option key={i} value={i}>
            {i} คน
          </option>
        ))}
      </select>
    </label>
  );
  const amount = (key: keyof ExtendedTax, label: string, hint: string) => (
    <MoneyField
      id={key}
      label={label}
      hint={hint}
      value={x[key] as string}
      onChange={(v) => update(key, v)}
    />
  );
  return (
    <div className="extended-deductions">
      <h3>สิทธิ์อื่นที่คุณอาจมี</h3>
      <p>มีรายการไหน ค่อยเปิดรายการนั้น</p>
      <details className="deduction-tile" name="mytax-deductions">
        <summary>
          <Users size={25} />
          <span>
            ครอบครัว<small>คู่สมรส · บุตร · พ่อแม่</small>
          </span>
        </summary>
        <div>
          {confirm(
            "spouseNoIncome",
            "จดทะเบียนสมรส และคู่สมรสไม่มีเงินได้ทั้งปี (60,000 บาท)",
          )}
          <div className="two-fields">
            {number("biologicalLiving", "บุตรชอบด้วยกฎหมายที่มีชีวิตทั้งหมด")}
            {number("children", "บุตรชอบด้วยกฎหมายที่ใช้สิทธิ์ได้")}
          </div>
          {number(
            "childBonus",
            "ในจำนวนที่ใช้สิทธิ์ได้: คนที่ 2 เป็นต้นไป เกิดตั้งแต่ 2561",
          )}
          {number("adoptedChildren", "บุตรบุญธรรมที่เข้าเกณฑ์", 3)}
          <small className="field-hint">
            บุตรชอบด้วยกฎหมาย 30,000 บาท/คน คนที่ 2 เป็นต้นไปที่เกิดตั้งแต่ 2561
            เพิ่มอีก 30,000 บาท นับลำดับรวมบุตรที่เสียชีวิตด้วย
            บุตรบุญธรรมใช้ได้ตามช่องว่างจากบุตรชอบด้วยกฎหมายที่มีชีวิต
            รวมไม่เกิน 3 คน
          </small>
          <div className="two-fields">
            {number("parentOwn", "พ่อแม่ของคุณที่ใช้สิทธิ์ได้", 2)}
            {number("parentSpouse", "พ่อแม่คู่สมรสที่ไม่มีเงินได้", 2)}
          </div>
          {confirm(
            "familyEligible",
            "ตรวจสิทธิ์แล้ว: บุตรเป็นผู้เยาว์ หรืออายุไม่เกิน 25 ปีและเรียนอุดมศึกษา หรือศาลสั่งไร้/เสมือนไร้ความสามารถ มีเงินได้ที่ไม่ยกเว้นต่ำกว่า 30,000 บาท; พ่อแม่อายุ 60 ปีขึ้นไป เงินได้ไม่เกิน 30,000 บาท อยู่ในอุปการะและไม่ซ้ำกับพี่น้อง มี ล.ย.03",
          )}
        </div>
      </details>
      <details className="deduction-tile" name="mytax-deductions">
        <summary>
          <Home size={25} />
          <span>
            ดอกเบี้ยบ้าน<small>ใช้ยอดส่วนของคุณ</small>
          </span>
        </summary>
        <div>
          {amount(
            "mortgage",
            "ดอกเบี้ยบ้านที่ใช้สิทธิ์ได้",
            "สูงสุด 100,000 บาท ใช้ส่วนของคุณหลังแบ่งสิทธิ์กู้ร่วมแล้ว ไม่ใช้ค่างวดหรือเงินต้น",
          )}
          {confirm(
            "mortgageEligible",
            "มีหนังสือรับรองดอกเบี้ยจากผู้ให้กู้ที่เข้าเกณฑ์ กู้ซื้อ/สร้างที่อยู่อาศัย มีหลักประกันและแบ่งสิทธิ์กู้ร่วมถูกต้องแล้ว",
          )}
        </div>
      </details>
      <details className="deduction-tile" name="mytax-deductions">
        <summary>
          <Landmark size={25} />
          <span>
            กองทุนที่ทำงานช่วยออม (PVD / กบข.)<small>เงินสะสมที่ทำงาน</small>
          </span>
        </summary>
        <div>
          {amount(
            "pvd",
            "เงินสะสม PVD ของคุณทั้งปี",
            "ไม่รวมเงินนายจ้าง สูงสุด 15% ของฐานค่าจ้างและเพดานกลุ่มเกษียณ 500,000 บาท",
          )}
          {amount(
            "pvdWage",
            "ฐานค่าจ้างทั้งปีสำหรับ PVD",
            "ใช้ฐานค่าจ้างตามข้อบังคับ/หนังสือรับรอง ไม่เดาจากรายได้รวม",
          )}
          {confirm(
            "pvdEligible",
            "ตรวจเงินสะสม PVD และฐานค่าจ้างแล้ว ไม่ใช่เงินถอนหรือเงินโอนไป RMF",
          )}
          {amount(
            "gpf",
            "เงินสะสม กบข. ของคุณทั้งปี",
            "ใช้ยอดที่มีสิทธิ์ตามหนังสือรับรอง ไม่รวมเงินสมทบหรือชดเชยของรัฐ",
          )}
          {confirm("gpfEligible", "ตรวจหนังสือรับรองเงินสะสม กบข. แล้ว")}
          <div className="retirement-note">
            PVD/กบข. และ RMF แชร์เพดาน 500,000 บาท ระบบกันสิทธิ์ PVD/กบข. ก่อน
            แล้วคำนวณ RMF จากวงเงินที่เหลือ
          </div>
        </div>
      </details>
      <details className="deduction-tile" name="mytax-deductions">
        <summary>
          <Leaf size={25} />
          <span>
            Thai ESG<small>ซื้อใหม่ในปีที่เลือก</small>
          </span>
        </summary>
        <div>
          {amount(
            "thaiEsg",
            "ยอดซื้อ Thai ESG ที่ใช้สิทธิ์ได้",
            "30% ของเงินได้ที่ต้องเสียภาษี ไม่เกิน 300,000 บาท แยกจากเพดานเกษียณ",
          )}
          {confirm(
            "thaiEsgEligible",
            `ซื้อหน่วยที่เข้าเกณฑ์ในปี ${plan.taxYear ?? "2568"} แจ้งใช้สิทธิ์กับ บลจ. และเข้าใจว่าต้องถือ 5 ปีแบบวันชนวัน ไม่ใช่ Thai ESGX/หน่วยโอน LTF`,
          )}
          <p className="field-hint">
            SSF: หน่วยซื้อใหม่ใช้สิทธิ์ได้เฉพาะปี 2563–2567 จึงไม่เพิ่มลดหย่อนปี
            2568/2569 หน่วยเดิมยังต้องรักษาเงื่อนไขการถือ
          </p>
        </div>
      </details>
      <details className="deduction-tile" name="mytax-deductions">
        <summary>
          <HandHeart size={25} />
          <span>
            เงินบริจาค<small>แยกประเภท ไม่ใส่ซ้ำ</small>
          </span>
        </summary>
        <div>
          {amount(
            "hospitalDonation",
            "บริจาคโดยตรงให้โรงพยาบาลของทางราชการ",
            "ระบบคิด 2 เท่า แต่ไม่เกิน 10% ของเงินคงเหลือก่อนบริจาค ไม่รวมมูลนิธิโรงพยาบาล",
          )}
          {confirm(
            "hospitalDonationEligible",
            "ตรวจผู้รับว่าเป็นสถานพยาบาลของทางราชการและมีหลักฐานสิทธิ์ 2 เท่าแล้ว ไม่ใส่ยอดซ้ำในช่องทั่วไป",
          )}
          {amount(
            "donation",
            "บริจาคทั่วไปที่ใช้สิทธิ์ได้",
            "คิดตามจ่ายจริง ไม่เกิน 10% ของเงินคงเหลือหลังบริจาค 2 เท่า ไม่รวมพรรคการเมืองหรือสิทธิ์ 2 เท่าอื่น",
          )}
          {confirm(
            "donationEligible",
            `ผู้รับอยู่ในรายชื่อที่ใช้สิทธิ์ได้ มีหลักฐาน${plan.taxYear === "2569" ? " และบริจาคผ่าน e-Donation สำหรับวัด/องค์การหรือสถานสาธารณกุศลตามเกณฑ์ปี 2569" : ""}`,
          )}
        </div>
      </details>
    </div>
  );
}

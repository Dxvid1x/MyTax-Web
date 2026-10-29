export const extendedDefaults = {
  spouseNoIncome: false,
  children: "0",
  childBonus: "0",
  biologicalLiving: "0",
  adoptedChildren: "0",
  parentOwn: "0",
  parentSpouse: "0",
  mortgage: "0",
  pvd: "0",
  pvdWage: "0",
  gpf: "0",
  thaiEsg: "0",
  donation: "0",
  hospitalDonation: "0",
  familyEligible: false,
  mortgageEligible: false,
  pvdEligible: false,
  gpfEligible: false,
  thaiEsgEligible: false,
  donationEligible: false,
  hospitalDonationEligible: false,
};
export type ExtendedTax = typeof extendedDefaults;
export const extendedMoneyKeys = [
  "mortgage",
  "pvd",
  "pvdWage",
  "gpf",
  "thaiEsg",
  "donation",
  "hospitalDonation",
] as const;
export const extendedConfirmations = [
  ["mortgage", "mortgageEligible", "ดอกเบี้ยบ้าน"],
  ["pvd", "pvdEligible", "PVD"],
  ["gpf", "gpfEligible", "กบข."],
  ["thaiEsg", "thaiEsgEligible", "Thai ESG"],
  ["donation", "donationEligible", "เงินบริจาคทั่วไป"],
  ["hospitalDonation", "hospitalDonationEligible", "บริจาคโรงพยาบาลรัฐ"],
] as const;
export const extendedLabels: Record<string, string> = {
  spouse: "คู่สมรสไม่มีเงินได้",
  children: "บุตร",
  parents: "บิดามารดา",
  mortgage: "ดอกเบี้ยบ้าน (ส่วนที่ใช้สิทธิ์ได้)",
  pvd: "กองทุนที่บริษัทช่วยออม (PVD)",
  gpf: "เงินสะสม กบข.",
  thaiEsg: "Thai ESG ซื้อใหม่",
  donation: "บริจาคทั่วไป",
  hospitalDonation: "บริจาคโรงพยาบาลรัฐ × 2",
};
export function count(value: string, max = 50) {
  if (!/^(0|[1-9]\d*)$/.test(value) || Number(value) > max)
    throw new Error("ตรวจจำนวนคนให้เป็นจำนวนเต็มในช่วงที่แสดง");
  return Number(value);
}
export function extensionIssue(
  input: Partial<ExtendedTax> | undefined,
  money: (s: string) => number,
): { id: string; message: string } | null {
  const x = { ...extendedDefaults, ...input };
  try {
    for (const k of [
      "children",
      "childBonus",
      "biologicalLiving",
      "adoptedChildren",
      "parentOwn",
      "parentSpouse",
    ] as const)
      count(
        x[k],
        k.startsWith("parent") ? 2 : k === "adoptedChildren" ? 3 : 50,
      );
    if (count(x.children) > count(x.biologicalLiving))
      return {
        id: "biologicalLiving",
        message:
          "จำนวนบุตรชอบด้วยกฎหมายที่มีชีวิตต้องไม่น้อยกว่าจำนวนที่ใช้สิทธิ์",
      };
    if (count(x.childBonus) > count(x.children))
      return {
        id: "childBonus",
        message: "จำนวนบุตรที่รับสิทธิ์เพิ่มต้องไม่เกินจำนวนบุตรที่ใช้สิทธิ์",
      };
    if (count(x.parentSpouse) > 0 && !x.spouseNoIncome)
      return {
        id: "spouseNoIncome",
        message:
          "สิทธิ์บิดามารดาคู่สมรสนี้รองรับเมื่อคู่สมรสไม่มีเงินได้เท่านั้น",
      };
  } catch (e) {
    return { id: "children", message: (e as Error).message };
  }
  for (const k of extendedMoneyKeys) {
    try {
      money(x[k]);
    } catch {
      return { id: k, message: "ตรวจยอดเงิน ทศนิยมไม่เกิน 2 ตำแหน่ง" };
    }
  }
  if (
    (x.spouseNoIncome ||
      ["children", "adoptedChildren", "parentOwn", "parentSpouse"].some(
        (k) => Number(x[k as keyof ExtendedTax]) > 0,
      )) &&
    !x.familyEligible
  )
    return { id: "familyEligible", message: "ตรวจและยืนยันสิทธิ์ครอบครัวก่อน" };
  for (const [key, confirmation, label] of extendedConfirmations)
    if (money(x[key]) > 0 && !x[confirmation])
      return { id: confirmation, message: `ตรวจและยืนยันสิทธิ์${label}ก่อน` };
  if (money(x.pvd) > 0 && money(x.pvdWage) === 0)
    return {
      id: "pvdWage",
      message: "ใส่ฐานค่าจ้างทั้งปีสำหรับ PVD ตามหนังสือรับรอง",
    };
  return null;
}

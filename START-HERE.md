# MyTax — เริ่มใช้งาน

เว็บหลักอยู่ใน Hamster Project เปิดออนไลน์ได้ที่ https://mytax-indol.vercel.app

เปิด terminal ในโฟลเดอร์นี้:

```powershell
npm.cmd ci
npm.cmd run dev
```

เปิด URL ที่ terminal แสดง เช่น http://127.0.0.1:5173/
ทดสอบด้วย `npm.cmd test` และ `npm.cmd run build`
E2E: `npx.cmd playwright install chromium` แล้ว `npm.cmd run test:e2e`

## ทำงานต่อใน Antigravity

อ่าน docs/PROGRESS.md, docs/TAX-RULES.md และโค้ดจริง แล้วปรับเฉพาะงานที่ระบุ
ใช้ skill thai-tax-investment-rules เมื่อเปลี่ยนข้อมูลภาษี ตรวจแหล่งทางการ ทดสอบส่วนที่กระทบและอัปเดตเอกสารหลังจบ
ไฟล์แผนใน docs เป็นเอกสาร ส่วน Skill ภาษีอยู่ที่ C:/Users/User/.gemini/config/skills/thai-tax-investment-rules/

รองรับเงินเดือน/โบนัสและค่าลดหย่อนพื้นฐาน ปี 2568 กับวางแผนปี 2569
เพิ่มครอบครัว ดอกเบี้ยบ้าน PVD/กบข. Thai ESG และบริจาคที่รองรับแล้ว รายได้อื่นและมาตรการพิเศษยังไม่รวม ไม่มีบัญชีหรือซิงก์ออนไลน์
เลือกธีม/ติดตั้งแอปได้ หลังเปิดออนไลน์ครบ ใช้ออฟไลน์ในเบราว์เซอร์ที่รองรับ
สำรอง JSON ก่อนเปลี่ยนเบราว์เซอร์/เครื่อง หรือปรับข้อมูลสำคัญ
ปุ่มจัดการข้อมูลไม่ลบข้อมูล การล้างข้อมูลต้องยืนยันแยก

โควตา AI ใน IDE ไม่เกี่ยวกับการเปิดเว็บไซต์

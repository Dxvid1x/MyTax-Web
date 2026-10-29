# MyTax — เริ่มใช้งาน

เว็บสร้างแล้วใน Hamster Project ไม่ต้องแตก ZIP หรือย้ายไฟล์เพิ่ม

เปิด terminal ของโฟลเดอร์นี้แล้วรัน:

```powershell
npm.cmd run dev
```

เปิด URL ที่ terminal แสดง เช่น http://127.0.0.1:5173/

ทดสอบและ build:

```powershell
npm.cmd test
npm.cmd run build
```

## คำสั่งสำหรับทำงานต่อใน Antigravity

อ่าน docs/PROGRESS.md และ docs/finance-tax-webapp-mvp-plan.md ตรวจ source code จริง แล้วปรับเฉพาะงานที่ฉันระบุ ใช้ skill thai-tax-investment-rules เมื่อเปลี่ยนข้อมูลภาษี ทดสอบส่วนที่กระทบและอัปเดต PROGRESS.md หลังจบ ไม่เริ่มสร้างโปรเจกต์ใหม่ทับงานเดิม

ไฟล์แผนเป็นเอกสารใน docs ไม่ใช่ Skill ส่วน Skill ภาษีติดตั้ง global แล้วที่ C:/Users/User/.gemini/config/skills/thai-tax-investment-rules/

ข้อจำกัดปัจจุบัน: ปี 2568 เงินเดือน/โบนัส และค่าลดหย่อนที่แสดงเท่านั้น ปี 2569 กับ PVD/รายได้หลายแบบยังไม่เปิด ไม่มีบัญชีและซิงก์ออนไลน์

โควตา AI ของ Antigravity แยกจากงานที่ Codex ทำ การเปิดเว็บไม่ต้องใช้โควตา AI

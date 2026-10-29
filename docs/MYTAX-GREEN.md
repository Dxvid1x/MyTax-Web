# MyTax green theme and product demo

- สีหลักเขียวใบไม้ #237a4f, พื้นขาว; เดโมผลลัพธ์ใช้เขียวเข้ม
- Chakra Petch 600/700 สำหรับหัวเรื่องและจำนวนเงิน; Bai Jamjuree 400/500/600 สำหรับข้อความและฟอร์ม โหลดจากไฟล์ใน public/fonts พร้อม OFL
- เดโมสองหน้าจอในหน้าแรก: 11 ขั้น ตั้งแต่กรอกรายได้จนเปิดหน้าลดภาษี ทดลอง RMF และเทียบภาษี/เงินที่ใช้
- เดโมใช้ tax engine เดียวกับแอป แต่ไม่แก้แผนภาษีหรือข้อมูลที่บันทึกของผู้ใช้
- นำปุ่มวงกลมเล่น/หยุด/เริ่มใหม่ออก; เลือกขั้นตอนและกรอก/เลื่อนยอดเองได้ พักภาพจากรายละเอียด “การแสดงภาพ”; วนอัตโนมัติต่อเนื่องเมื่อเห็นเดโมบนจอ
- หยุดเวลาหน้าเบราว์เซอร์ถูกซ่อนหรือเดโมพ้นจอ; โหมดลดการเคลื่อนไหวให้กดดูทีละขั้น ไม่มี autoplay
- รองรับปี 2568 กรณีเงินเดือน/โบนัสตามขอบเขตเดิม

Reference fonts: https://github.com/google/fonts/tree/main/ofl/chakrapetch and https://github.com/google/fonts/tree/main/ofl/baijamjuree

Latest beginner flow and loop behaviour: MYTAX-BEGINNER.md.

Separate deduction guide and extended demo: MYTAX-DEDUCTION-GUIDE.md.

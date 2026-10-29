# วางแผนภาษี: สองทางเลือก

ปรับเฉพาะหน้าวางแผนภาษี และเพิ่มหน้าความรู้เรื่องการหนีภาษี หน้าแรกและสูตรคำนวณภาษีเดิมคงไว้

## การใช้งาน

- `/reduce`: หนูถือเงินเขียวทางซ้ายและแดงทางขวา ถาม “อยากจ่ายภาษีน้อยลงมั้ย”
- ฝั่งเขียว: อธิบายรายได้ → หักค่าใช้จ่ายและสิทธิ์ → เหลือคิดภาษี จากนั้นเลือกเช็กสิทธิ์ที่มี หรือทดลองวางแผนเพิ่ม และเปิดรายละเอียดทีละหัวข้อ
- ปีที่ปิดแล้วตรวจได้เฉพาะยอดจ่ายเดิม ไม่มีเส้นทางทดลองซื้อใหม่ย้อนหลัง สลับปีแล้วยังคงจำนวนเงินและขอให้ทบทวนสิทธิ์
- ฝั่งแดง: `/tax-law` ใช้ภาพจำลองลูกกรงกับไฟตำรวจ อธิบายผลทางกฎหมายตามกรณี และมีทางกลับไปใช้สิทธิ์ตามกฎหมาย
- ไม่มีเสียงหรือไฟกระพริบเร็ว เคารพ `prefers-reduced-motion` และไม่เปลี่ยนธีมที่ผู้ใช้บันทึกไว้

## แหล่งกฎหมาย

ตรวจ 4 ตุลาคม 2569 จากกรมสรรพากร ไม่เพิ่มหรือเปลี่ยนตัวเลขในสูตรภาษี

- มาตรา 35, 37, 37 ทวิ: https://www.rd.go.th/5942.html
- มาตรา 22, 26, 27, 27 ทวิ: https://www.rd.go.th/5943.html
- คำอธิบายบุคคลธรรมดา: https://www.rd.go.th/562.html

แยกความผิดใช้ข้อมูลเท็จหรือฉ้อโกง เจตนาไม่ยื่นเพื่อหนีภาษี และไม่ยื่นตามกำหนด ระบุเหตุสุดวิสัยในมาตรา 35 และองค์ประกอบเจตนาของความผิดอาญา คงคำเตือนว่าข้อเท็จจริงและกระบวนการตามกฎหมายเป็นตัวกำหนดผลจริง

เงินเพิ่มทั่วไป 1.5% ต่อเดือนหรือเศษเดือน คิดจากภาษีที่ค้าง ไม่รวมเบี้ยปรับ รวมไม่เกินภาษีที่ต้องชำระ ระบุกรณีอนุมัติขยายเวลา 0.75% พร้อมเงื่อนไข แยกเบี้ยปรับ 1 หรือ 2 เท่าตามมาตราการประเมิน ไม่แสดงว่าโทษทั้งหมดเกิดขึ้นอัตโนมัติพร้อมกัน

## ภาพตัวละคร

ใช้เครื่องมือ imagegen ในโหมด built-in edit, `transparent_background: true`

- ภาพอ้างอิง: `docs/assets/mytax-mascot-money-source.png`
- ต้นฉบับใหม่: `docs/assets/mytax-mascot-two-money-source.png` — RGBA 1145×1373, alpha 0–255
- ภาพเว็บ: `public/images/mytax-mascot-two-money.webp` — 800×959, คง alpha, quality 88
- ไม่เขียนทับภาพหน้าแรกหรือภาพอ้างอิงเดิม

### Prompt ที่ใช้

Use case: precise-object-edit. Edit target: the attached existing MyTax gray mouse mascot. Keep exactly the same friendly gray mouse identity, large pink ears, cream belly, fur tuft, soft polished illustrated shading, green collar and tie. New pose: facing forward with a warm inviting smile, mouth slightly open as if asking a question, BOTH arms extended out at shoulder height. On the viewer's LEFT, its paw clearly grips a large fan of mint-green generic banknotes. On the viewer's RIGHT, its other paw clearly grips a large fan of coral-red generic banknotes. Money colors must correspond exactly to viewer left green and viewer right red. Keep both fans identical in size, use simple currency symbols, not real banknote designs. Full body with feet, pink tail, both ears, both hands and money fully visible. Symmetrical balanced silhouette with a little space around it. Single mascot on genuine transparent background. No speech bubble, no text, no other objects or characters. Preserve the same character/style as the input; only change pose and give it two colored money fans.

## การตรวจ

ถ่ายภาพธีมสว่าง/มืดที่ 390, 768, 1280 px สำหรับหน้าเลือก ฝั่งเขียว และฝั่งแดง ตรวจขนาดรูป ปุ่ม ขอบจอ และวรรณยุกต์ เพิ่ม e2e สำหรับตำแหน่งซ้าย/ขวา การใช้งานด้วยคีย์บอร์ด โทษแต่ละกรณี การโหลดลิงก์ตรง การกลับสู่ธีมเดิม และการรักษาข้อมูล

ปรับการทดสอบเดิมให้เลือกฝั่งเขียวก่อนเข้าเนื้อหาลดหย่อน ยังคงตรวจ Thai ESG, SSF, ปีปิด, คอนทราสต์ และเพิ่มหน้ากฎหมายในชุดภาพหน้าจอกับการใช้งานออฟไลน์

ผลตรวจชุดสุดท้าย: unit 54/54, browser 40/40 (2.5 นาที), lint, format:check และ production build ผ่าน ภาพใหม่ 114,836 bytes รวมอยู่ใน precache เดิม พร้อม lazy bundle หน้ากฎหมาย ไม่มีการเรียกแหล่งภายนอกอัตโนมัติ

เผยแพร่ `dpl_98Qqq6R9iw1bdZLF9HQSvYx5kA74` สถานะ READY ที่ https://mytax-indol.vercel.app/reduce และ https://mytax-indol.vercel.app/tax-law ต้นฉบับ deployment: https://mytax-putri8dyl-aaaa1-03d3.vercel.app

ตรวจสาธารณะ HTTP 200 ทั้งสองหน้าและภาพ WebP, ตรวจการเปิดลิงก์ตรง/รีโหลด กดฝั่งเขียวจนถึงสิทธิ์ประกันสุขภาพ กดฝั่งแดง อ่านครบสามกรณี และกลับหน้าเลือก ไม่มี page error ตรวจมือถือ 390px ไม่มีเลื่อนแนวนอน หลักฐาน: `output/playwright/planning-live-http.json`, `planning-live-entry.png`, `planning-live-law.png`, `planning-live-mobile.png`

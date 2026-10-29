# MyTax — พื้นหลัง ปุ่ม ขั้นตอน และตัวละครผลลัพธ์

## งานที่ปรับ

1. ทุกหน้าใช้พื้นหลังเส้นโค้ง/วงโคจรชุดเดียวกับหน้าแรก โดยไม่คัดลอกภาพหนู เงิน เหรียญ หรือสมุดเงินลงพื้นหลัง สีปรับตามธีม รวมถึงสีแดงใน `/tax-law` และพื้นหลังไม่รับการคลิก
2. ไอคอนประกันสังคมเปลี่ยนเป็นจับมือ ประกันชีวิตเป็นโล่พร้อมเครื่องหมายบวก ทั้งในช่องลดหย่อนและหน้าวางแผนภาษี
3. ปุ่มและหัวข้อที่กดเปิดได้มีเอฟเฟกต์ชี้ กด และโฟกัสร่วมกัน ใช้การเลื่อนเบา ๆ กับขอบเรือง สีแดงคงไว้สำหรับทางเลือกสีแดง/เงินออก/การลบ ปุ่มปิดใช้งานไม่เคลื่อน รองรับคีย์บอร์ดและ `prefers-reduced-motion`
4. ขั้นตอนคำนวณใช้หลอดที่เติมตามขั้น 1–4 มีข้อความทุกขั้นและ ARIA progressbar ปุ่มย้อนขั้นยังใช้การตรวจข้อมูลเดิม ขั้นที่ยังไม่ถึงกดไม่ได้
5. จำนวนภาษีในหน้าสรุปเป็นสีแดง เงินคืนยังเป็นสีเขียว หนูแสดงความยินดีพร้อม “รอดไปนะ” เมื่อยอดจ่ายเพิ่มเป็นศูนย์หรือขอคืนได้ หนูยื่นมือขอเงินพร้อม “บิดตามถึงบ้านนะ” เมื่อยอดจ่ายเพิ่มมากกว่าศูนย์ ทุกยอดยังเป็นประมาณการ

หากยังไม่ทราบยอดหักไว้ ไม่มีข้อความแสดงความยินดีหรือทวงเงิน คง “รอเช็กยอด” ไม่สรุปจากภาษีทั้งปีอย่างเดียว กรณีจ่ายไว้ครบแม้ภาษีทั้งปีมากกว่าศูนย์ ก็ไม่ต้องจ่ายเพิ่ม ไม่เปลี่ยนสูตรหรือเกณฑ์ภาษี

## ภาพและ Prompt

ใช้ imagegen แบบ built-in edit พร้อมพื้นหลังโปร่งใส ตรวจ alpha 0–255 ก่อนแปลงเป็น WebP ไม่มีการสร้างภาพด้วยสคริปต์ ภาพเดิมเก็บไว้

- Reference: `docs/assets/mytax-mascot-money-source.png`
- ภาพยินดี: `docs/assets/mytax-mascot-celebrate-source.png` → `public/images/mytax-mascot-celebrate.webp`, 480×576, 46,228 bytes
- ภาพขอเงิน: `docs/assets/mytax-mascot-collect-source.png` → `public/images/mytax-mascot-collect.webp`, 480×576, 46,524 bytes

### ยินดี

Use case: precise-object-edit. Edit target is the existing MyTax gray mouse in the reference. Keep exactly the same character identity: huge pink ears, cream belly, gray fur and tuft, pink tail, green collar and green tie, warm polished soft illustrated shading, full body visible including feet, no cropping. Single character on a genuine transparent alpha background, no scenery, no words, no lettering, no speech bubble. Replace the pose with a delighted celebration: both arms raised joyfully, eyes gently squinting with happiness, broad friendly smile, one paw making a thumbs-up, subtle two or three mint confetti shapes near hands only. Remove the banknotes. The mouse is congratulating someone who has no extra tax to pay. Compact readable full-body silhouette.

### ขอเงิน

Use case: precise-object-edit. Edit target is the existing MyTax gray mouse in the reference. Keep exactly the same character identity: huge pink ears, cream belly, gray fur and tuft, pink tail, green collar and green tie, warm polished soft illustrated shading, full body visible including feet, no cropping. Single character on a genuine transparent alpha background, no scenery, no words, no lettering, no speech bubble. Replace the pose with playful asking for payment: left paw holds a simple coral-red payment slip with a generic currency symbol and no readable text; right paw stretches forward palm-up asking for money. Slightly mischievous eyebrow and confident friendly smile, cute rather than frightening. Remove the fan of green banknotes and cupped shouting hand. The mouse is a friendly humorous tax collector, no threats, weapons or aggressive expression. Compact readable full-body silhouette.

## การตรวจภาพ

ตรวจมือถือ/แท็บเล็ต/เดสก์ท็อปที่ 390/768/1280 ในธีมสว่างและมืด หน้าผลลัพธ์ตรวจทั้งจ่ายเพิ่ม จ่ายครบ ขอคืน และไม่ทราบยอดหักไว้ ภาพหลักฐานอยู่ที่ `output/playwright/polish-*.png` ไม่พบเลื่อนแนวนอน ตรวจความต่อเนื่องของหลอดและสระ/วรรณยุกต์

ตรวจ SHA256 ของ `tax.ts`, `extendedTax.ts`, `storage.ts` เทียบก่อนแก้ ตรงกันทั้งหมด ไม่มีการเพิ่มสคริปต์ภายนอกหรือเปลี่ยน CSP

## ผลทดสอบรอบสุดท้าย

- npm test: 54/54; lint และ format:check ผ่าน
- Full Chromium E2E: 41/41 ผ่าน (2.7 นาที) รวม axe, keyboard, reduced motion, 390/768/1280 ทั้งสองธีม, ผลลัพธ์ครบ 4 สถานะ, privacy และ offline
- Production build/PWA ผ่านในชุด E2E มี 30 static precache assets
- เพิ่มการตรวจ disabled/hover/focus/reduced-motion และ ARIA progressbar โดยไม่ลบเทสต์เดิม แก้ specificity ของ reduced motion และย่อแถบขั้นตอนบนมือถือเพื่อไม่บังช่องเงินเดือนด้วยปุ่มล่าง
- ตรวจ SHA256 อีกครั้ง: tax.ts, extendedTax.ts, storage.ts ตรงกับก่อนแก้

## เผยแพร่

- Vercel READY: dpl_6psUYMTkP4ZaDtpsqEYcUteUwcvR
- Immutable: https://mytax-6svsed9xu-aaaa1-03d3.vercel.app
- Public: https://mytax-indol.vercel.app
- Anonymous HTTP 200 ครบ 13 routes/assets และ CSP ตรงกับ vercel.json: output/playwright/polish-live-http.json
- Live browser ตรวจพื้นหลังทุกหน้าหลัก, หลอดขั้นตอน, รูปหนู 480px, ช่องกรอกไม่ถูกปุ่มมือถือบัง, print ซ่อนหนู/ใช้ตัวเลขสีดำ และไม่พบ page error
- ภาพเว็บจริงตรวจแล้ว: output/playwright/polish-live-demo.png, polish-live-mobile.png

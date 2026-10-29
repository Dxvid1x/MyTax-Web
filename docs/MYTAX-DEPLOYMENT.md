# MyTax — Vercel production

ตรวจล่าสุด 2026-10-04

- เว็บไซต์: [MyTax](https://mytax-indol.vercel.app)
- หน้าวางแผนภาษี: [เช็กสิทธิ์และลองวางแผน](https://mytax-indol.vercel.app/reduce)
- Dashboard: https://vercel.com/aaaa1-03d3/mytax
- Deployment: dpl_HDaU4k2Pv55xjA6VMr8fnSqyHi6p — READY / production
- Immutable URL: https://mytax-hpiy9nafc-aaaa1-03d3.vercel.app
- รอบภาษา: กรอกรายได้ → เข้าใจภาษี → ง่ายแค่นี้เอง พร้อมคำอธิบายใหม่และหัวข้อที่อ่านง่ายขึ้น ดู LANGUAGE-UX.md
- รอบตัวละคร: คืนรูปเงินเดิมในภาพเปิดหน้าแรก หนูท่าชี้อยู่ข้างหัวข้อ Scrollytelling ทั้งสามขั้น ส่วนหน้าวางแผนยังมีหนูต้อนรับตามเดิม ดู MASCOT.md
- Vite; Node 24.x; npm ci → npm run build → dist (รวม production worker)
- HTTP แบบไม่ล็อกอิน 200; JS/CSS/manifest/worker/icons/fonts โหลดได้และ security/cache headers ครบ
- รอบ UX: หน้ารายได้ไม่มีคำถามเช็กสิทธิ์; คำถามอยู่ขั้นลดหย่อนและก่อนดูผล เดโมสั้น/ครบ 11 ขั้น หมวดสิทธิ์เริ่มจากสิ่งที่มี สมุดเงินให้จดก่อนค้นหา สถานะบันทึกชัดเจน; ดู UX-REVIEW-STATUS.md และ VALIDATION.md
- รอบสี: เขียวสำหรับเงินเข้า/ผลบวก แดงสำหรับเงินออก/ผลลบ โหมดมืดพื้นดำ #000000 กับพื้นผิวเทาเข้ม ดู COLOUR-THEME.md
- รอบ URL: ไม่มี # ในเส้นทางของแอป เปิดตรง/รีเฟรชได้ครบทุกหน้า ลิงก์เก่าเปลี่ยนเป็น URL ใหม่ และ / ท้ายเส้นทางถูก redirect; ดู URL-ROUTING.md ตรวจ live ทุกเส้นทาง HTTP 200 และ /tax/2/ redirect 308 ไป /tax/2
- รอบ Entrance Animation: จางเข้าและเลื่อนขึ้น 8px จบภายใน 500ms เล่นครั้งเดียวเมื่อเปิดหน้า รองรับ reduced motion; ดู ENTRANCE-MOTION.md
- รอบ Layered Hero: กระเป๋าเงินและการ์ดการเงินเคลื่อนเข้ามาทีละชั้น จบประมาณ 2.65 วินาที มีเล่นซ้ำ/หยุดภาพและมิติเล็กน้อยตามเมาส์ รองรับ reduced motion; ดู LAYERED-HERO.md
- รอบตั้งค่า: ชี้เมาส์แล้วแถบเลือกธีมเลื่อนออกทางซ้าย คลิกค้างเมนูได้ มือถือเปิดใต้ปุ่ม ไม่มี dropdown ของระบบ; ดู SETTINGS-DRAWER.md
- รอบหน้าหลัก: เปิดด้วยภาพเงิน/สมุดเงินสองฝั่งและเส้นพื้นหลังบาง ๆ ต่อด้วย “ใส่ปุ๊บ → รู้ปั๊บ → ลองปรับ” ที่มีคำอธิบายเพิ่ม ย้าย Hero เดิมและปุ่มคำนวณ/สมุดเงินไปท้ายหน้า; ดู HOMEPAGE-OPENING.md และ SCROLL-STORY.md
- รอบนำทาง: ชี้เมนูมีขอบเขียว เปลี่ยนหน้าจางต่อกันประมาณ 260ms แถบติดตามเฉพาะหน้าหลักและ Scrollytelling รองรับ reduced motion; ดู NAVIGATION-MOTION.md
- รอบเปิดหน้าหลัก: ภาพเงิน/สมุดเงินเริ่มใกล้ที่ขอบจอแล้วซูมถอยเข้าที่ พร้อมเผยหัวเรื่องและเส้นพื้นหลัง รวม 2.6 วินาที เล่นครั้งเดียว ปุ่มใช้งานได้ทันที; ดู HOMEPAGE-OPENING.md
- ไม่ต้องเปิด dev server ในเครื่องเพื่อใช้ลิงก์นี้

## อัปเดตครั้งต่อไป

เปิด PowerShell ในโฟลเดอร์ MyTax นี้:

```powershell
npm.cmd run lint
npm.cmd test
npm.cmd run format:check
npm.cmd run test:e2e
npm.cmd run build
npx.cmd --yes vercel@62.2.0 deploy --prod --yes --scope aaaa1-03d3
```

ต้องมีสิทธิ์ใน aaaa1-03d3/mytax อย่าแนบ `.env*` / `.vercel` ในสำเนาที่แชร์
ข้อมูลอยู่ในแต่ละเบราว์เซอร์ ไม่มีบัญชี/ซิงก์ ย้าย origin หรือเครื่องด้วยสำรอง JSON
Offline ใช้ได้หลังเปิดออนไลน์ครบ อัปเดต PWA ต้องกดยืนยันรีโหลดเอง ไม่เปลี่ยน localStorage ของผู้ใช้
ผลทดสอบและ screenshot อยู่ใน docs/VALIDATION.md ข้อจำกัดอยู่ใน docs/PROGRESS.md

Latest opening update: viewport-wide scene, complete unmasked headline and 2.6s pullback with a small landing overshoot. See HOMEPAGE-OPENING.md and VALIDATION.md.

Scrollytelling update 2026-10-04: original long pinned page remains. Scroll selects each scene; amounts animate once on entry for 1.4–1.6s, hold final values and do not replay on returning. Refresh resets completion. No playback/restart controls. See SCROLL-STORY.md.

Tax-year UI update: two explicit rounded buttons using Settings colors/green selection, readable on320px screens, native keyboard activation and no OS dropdown. Six relevant browser cases passed; see SETTINGS-DRAWER.md and VALIDATION.md.

Result UI update: one large labelled amount for payable/refund/settled/unknown, secondary annual-minus-prepaid line, and calculation details behind a disclosure. Print opens all details and restores their state. Five relevant browser checks passed; anonymous live routes/assets and light/dark result/PDF verified. See RESULT-SUMMARY.md and VALIDATION.md.

Planning UI update: menu named “วางแผนภาษี”; two optional entry choices before subjects, one detail at a time, no trial on existing-rights lane. Extra trials remain explicit and do not save merely when edited. Lesson/fund charts are collapsed. /reduce links are preserved. Six relevant browser checks and anonymous live checks passed; see TAX-PLANNING.md.

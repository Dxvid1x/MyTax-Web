# MyTax — สีคำตอบและข้อความขอบเขต

2026-10-04

- ScopeCheck ทั้งขั้นเลือกสิทธิ์และก่อนดูผล: มี = เขียว, ไม่มี = แดง, ยังไม่แน่ใจ = เหลือง ใช้ทั้ง hover, keyboard focus และ selected โดยคง aria-pressed และเครื่องหมายเลือก ไม่ใช้สีอย่างเดียว
- สีเหลือง light: #805800 บน #fff7d7; dark: #f4cd62 บน #282112 เพื่ออ่านชัด สีเขียว/แดงใช้ tokens เดิม ไม่เปลี่ยนความหมายตัวเลือกหรือการคำนวณ
- ข้อความ “รายการที่คำนวณได้ / ยังไม่รวม” เพิ่ม padding14px18px มี line-height1.7 และ wrap เงื่อนไขที่เปิดอ่านมีระยะ18px ทั้งสองด้าน
- ย่อแถวคำตอบบนมือถือให้หัก marginซ้าย30pxออกจากความกว้าง ป้องกันคำตอบสุดท้ายหลุดขอบหรือถูกตัด
- เพิ่ม regression test: ตรวจสีจริง hover/selected ทั้งสองธีม, ตำแหน่งข้อความและขอบปุ่มที่390/1280, และ axe หลังเปิดเนื้อหา ไม่ลบ/ผ่อนเทสต์เดิม
- ภาพ CLI: output/playwright/scope-{theme}-{width}.png

## ผลตรวจรอบสุดท้าย

- npm test54/54; lint, format:check ผ่าน
- Full browser E2E42/42ผ่าน2.8นาที รวม contrastทั้งสองธีม, keyboard, privacy, offline, screenshot390/768/1280 และการตรวจคำตอบไม่หลุดขอบ
- Production build/PWAผ่านในชุดE2E
- tax.ts, extendedTax.ts, storage.ts SHA256ตรงกับก่อนปรับ ไม่มีการแก้สูตรหรือกฎภาษี ไม่มีการเพิ่ม network หรือแก้ CSP

## เผยแพร่

- READY dpl_JAT7AMFbhcMfXbs4HPW3kuNfU1uT
- Public https://mytax-indol.vercel.app
- Immutable https://mytax-o72u6ti5b-aaaa1-03d3.vercel.app
- Anonymous HTTP200และ CSPตรงเดิม4routes/assets: output/playwright/scope-live-http.json
- Live browserตรวจ390/1280ทั้งสว่างและมืด สีเขียว/แดง/เหลืองต่างกันจริง ข้อความขอบเขตเริ่มห่างขอบ19px และไม่มีล้นแนวนอน ภาพ: output/playwright/scope-live-*.png

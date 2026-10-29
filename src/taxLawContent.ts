export const TAX_LAW = {
  reviewed: "4 ตุลาคม 2569",
  criminalSource: "https://www.rd.go.th/5942.html",
  assessmentSource: "https://www.rd.go.th/5943.html",
  overviewSource: "https://www.rd.go.th/562.html",
  cases: [
    {
      id: "false-information",
      article: "มาตรา 37",
      title: "เจตนาใช้ข้อมูลเท็จหรือฉ้อโกง",
      description:
        "แจ้งข้อมูลหรือใช้หลักฐานเท็จเพื่อหลีกเลี่ยงภาษีหรือขอคืนภาษี รวมถึงการฉ้อโกงหรืออุบายตามกฎหมาย",
      penalty: "จำคุก 3 เดือน–7 ปี",
      detail: "และปรับ 2,000–200,000 บาท",
    },
    {
      id: "intentional-non-filing",
      article: "มาตรา 37 ทวิ",
      title: "เจตนาไม่ยื่นแบบเพื่อหนีภาษี",
      description: "มีหน้าที่ยื่นแบบ แต่เจตนาไม่ยื่นเพื่อหลีกเลี่ยงการเสียภาษี",
      penalty: "จำคุกไม่เกิน 1 ปี",
      detail: "หรือปรับไม่เกิน 200,000 บาท หรือทั้งจำทั้งปรับ",
    },
    {
      id: "late-filing",
      article: "มาตรา 35",
      title: "ไม่ยื่นแบบตามกำหนด",
      description:
        "มีหน้าที่ยื่นแบบแต่ไม่ยื่นตามกำหนด เว้นแต่แสดงเหตุสุดวิสัยตามกฎหมายได้",
      penalty: "ปรับไม่เกิน 2,000 บาท",
      detail: "การยื่นช้าและการเจตนาหนีภาษีมีองค์ประกอบความผิดต่างกัน",
    },
  ],
} as const;

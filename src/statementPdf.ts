import { guessStatementMapping } from "./statement.ts";
import type { PdfTextPage, StatementTable } from "./statementTypes.ts";
export const PDF_LIMITS = {
  pages: 50,
  chars: 2000000,
  items: 200000,
  deadline: 20000,
};
export function tableFromTextPages(pages: PdfTextPage[]): StatementTable {
  if (!pages.length || pages.length > PDF_LIMITS.pages)
    throw new Error("PDF ต้องมีข้อความและไม่เกิน 50 หน้า");
  const rows: string[][] = [],
    origins: StatementTable["origins"] = [];
  let count = 0,
    chars = 0;
  let headerX: number[] = [];
  let header: string[] = [];
  for (const page of pages) {
    count += page.items.length;
    chars += page.items.reduce((n, item) => n + item.text.length, 0);
    if (count > PDF_LIMITS.items || chars > PDF_LIMITS.chars)
      throw new Error("ข้อความใน PDF มากเกินที่รองรับ กรุณาแบ่งไฟล์");
    if (!page.items.some((item) => item.text.trim()))
      throw new Error(
        `หน้า ${page.page} ไม่มีข้อความที่อ่านได้ ยังไม่รองรับ PDF สแกน`,
      );
    const lines: { y: number; items: PdfTextPage["items"] }[] = [];
    for (const item of [...page.items]
      .filter((item) => item.text.trim())
      .sort((a, b) => b.y - a.y || a.x - b.x)) {
      const line = lines.find(
        (line) => Math.abs(line.y - item.y) < Math.max(2, item.height * 0.3),
      );
      if (line) line.items.push(item);
      else lines.push({ y: item.y, items: [item] });
    }
    let foundHeader = false;
    for (const line of lines) {
      const items = line.items.sort((a, b) => a.x - b.x);
      const cells = items.map((item) => item.text.trim());
      const mapping = guessStatementMapping([cells]);
      const isHeader =
        mapping.date >= 0 &&
        (mapping.credit >= 0 || mapping.debit >= 0 || mapping.amount >= 0);
      if (isHeader) {
        if (header.length && JSON.stringify(cells) !== JSON.stringify(header))
          throw new Error(
            "หัวตาราง PDF เปลี่ยนระหว่างหน้า กรุณาตรวจรูปแบบไฟล์",
          );
        header = cells;
        headerX = items.map((item) => item.x);
        foundHeader = true;
        if (!rows.length) {
          rows.push(cells);
          origins.push({ locator: `p${page.page}:header`, page: page.page });
        }
        continue;
      }
      if (!foundHeader) continue;
      const aligned = header.map(() => "");
      const headerMapping = guessStatementMapping([header]);
      for (const item of items) {
        let col = headerX.length - 1;
        // Headers define left boundaries, not nearest-centre bins. A right-aligned
        // credit must never cross the midpoint and become a debit.
        for (let i = 0; i < headerX.length; i++) {
          if (item.x + 2 >= headerX[i]) col = i;
          else break;
        }
        const moneyColumn = [
          headerMapping.credit,
          headerMapping.debit,
          headerMapping.amount,
        ].includes(col);
        if (
          moneyColumn &&
          /^[-+\d,.]+$/.test(item.text.trim()) &&
          (item.x < headerX[col] - 2 ||
            (col < headerX.length - 1 &&
              item.x + item.width > headerX[col + 1] + 2))
        )
          throw new Error(
            `หน้า ${page.page} แยกคอลัมน์จำนวนเงินไม่ชัด กรุณาใช้ CSV หรือ Excel`,
          );
        aligned[col] += (aligned[col] ? " " : "") + item.text.trim();
      }
      const m = guessStatementMapping([header]);
      if (!aligned[m.date]?.trim()) {
        const moneyColumns = [m.credit, m.debit, m.amount].filter(
          (i) => i >= 0,
        );
        if (moneyColumns.some((i) => aligned[i]?.trim()))
          throw new Error(
            `หน้า ${page.page} มีจำนวนเงินที่จับคู่วันที่ไม่ได้ กรุณาตรวจไฟล์ต้นฉบับ`,
          );
        if (
          m.note >= 0 &&
          aligned[m.note] &&
          rows.length > 1 &&
          origins.at(-1)?.page === page.page
        ) {
          rows.at(-1)![m.note] += " " + aligned[m.note];
        }
        continue;
      }
      const indexes = items.map((item) => item.itemIndex);
      rows.push(aligned);
      origins.push({
        locator: `p${page.page}:i${Math.min(...indexes)}-${Math.max(...indexes)}`,
        page: page.page,
      });
      if (rows.length > 10001) throw new Error("PDF มีมากกว่า 10,000 รายการ");
    }
    if (!foundHeader)
      throw new Error(
        `หน้า ${page.page} ไม่พบตารางวันที่และเงินเข้า/ออกที่รองรับ กรุณาใช้ CSV หรือ Excel`,
      );
  }
  if (rows.length < 2) throw new Error("ไม่พบรายการในตาราง PDF ที่อ่านได้");
  return { name: "PDF", rows, origins };
}

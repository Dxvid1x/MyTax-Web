import { zipSync, strToU8 } from "fflate";

export function statementWorkbook() {
  const ns = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";
  const cell = (ref: string, text: string) =>
    `<c r="${ref}" t="inlineStr"><is><t>${text}</t></is></c>`;
  const serial = (Date.UTC(2026, 0, 10) - Date.UTC(1899, 11, 30)) / 86400000;
  const files: Record<string, string> = {
    "[Content_Types].xml":
      '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>',
    "_rels/.rels":
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
    "xl/workbook.xml": `<workbook xmlns="${ns}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="รายการทดสอบ" sheetId="1" r:id="rId1"/></sheets></workbook>`,
    "xl/_rels/workbook.xml.rels":
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>',
    "xl/styles.xml": `<styleSheet xmlns="${ns}"><cellXfs count="2"><xf numFmtId="0"/><xf numFmtId="14"/></cellXfs></styleSheet>`,
    "xl/worksheets/sheet1.xml": `<worksheet xmlns="${ns}"><sheetData><row r="1">${cell("A1", "วันที่")}${cell("B1", "รายละเอียด")}${cell("C1", "เงินเข้า")}${cell("D1", "เงินออก")}</row><row r="2"><c r="A2" s="1"><v>${serial}</v></c>${cell("B2", "รับเงินจาก Excel")}<c r="C2"><v>875.50</v></c></row><row r="3">${cell("A3", "2026-01-10")}${cell("B3", "จ่ายเงินจาก Excel")}<c r="D3"><v>10.25</v></c></row></sheetData></worksheet>`,
  };
  return zipSync(
    Object.fromEntries(
      Object.entries(files).map(([name, xml]) => [name, strToU8(xml)]),
    ),
    { level: 0 },
  );
}

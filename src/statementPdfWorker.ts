import { getDocument, PDFWorker } from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { tableFromTextPages, PDF_LIMITS } from "./statementPdf.ts";
import { hashStatementFile } from "./statementIdentity.ts";
import { statementDocument } from "./statementReview.ts";
import { STATEMENT_MAX_BYTES } from "./statement.ts";
import type { PdfTextPage } from "./statementTypes.ts";
self.onmessage = async (event: MessageEvent<{ buffer: ArrayBuffer }>) => {
  let task: ReturnType<typeof getDocument> | undefined;
  let engine: Worker | undefined;
  let pdfWorker: PDFWorker | undefined;
  try {
    const bytes = event.data.buffer;
    if (
      bytes.byteLength > STATEMENT_MAX_BYTES ||
      new TextDecoder().decode(bytes.slice(0, 5)) !== "%PDF-"
    )
      throw new Error("ไฟล์ PDF ไม่ถูกต้องหรือเกิน 5 MB");
    const digest = await hashStatementFile(bytes);
    // Explicit worker port avoids PDF.js's window-based auto-worker/fake fallback.
    engine = new Worker(pdfWorkerUrl, { type: "module" });
    // PDF.js 6's generated declaration narrows port to null; its runtime
    // initializeFromPort supports a real Worker. Keep this type bridge local.
    pdfWorker = new PDFWorker({
      port: engine,
    } as unknown as ConstructorParameters<typeof PDFWorker>[0]);
    task = getDocument({
      worker: pdfWorker,
      data: new Uint8Array(bytes),
      useWasm: false,
      disableFontFace: true,
      useSystemFonts: false,
      stopAtErrors: true,
    });
    // Do not request/document passwords or execute any PDF actions.
    task.onPassword = () => {
      void task?.destroy();
      self.postMessage({
        error:
          "ยังไม่รองรับ PDF ที่ใส่รหัสผ่าน กรุณาใช้ CSV หรือไฟล์ที่เปิดอ่านได้",
      });
    };
    const pdf = await task.promise;
    if (pdf.numPages > PDF_LIMITS.pages)
      throw new Error("PDF ต้องไม่เกิน 50 หน้า กรุณาแบ่งไฟล์");
    const pages: PdfTextPage[] = [];
    let chars = 0,
      itemsCount = 0;
    for (let page = 1; page <= pdf.numPages; page++) {
      const current = await pdf.getPage(page);
      const text = await current.getTextContent();
      const items = text.items.flatMap((item, itemIndex) => {
        if (!("str" in item)) return [];
        return [
          {
            text: item.str,
            x: item.transform[4],
            y: item.transform[5],
            width: item.width,
            height: item.height,
            itemIndex,
          },
        ];
      });
      chars += items.reduce((n, item) => n + item.text.length, 0);
      itemsCount += items.length;
      if (chars > PDF_LIMITS.chars || itemsCount > PDF_LIMITS.items)
        throw new Error("ข้อความใน PDF มากเกินที่รองรับ กรุณาแบ่งไฟล์");
      pages.push({ page, items });
      current.cleanup();
    }
    const table = tableFromTextPages(pages);
    const document = statementDocument(digest, "pdf", [table]);
    document.warnings.push(
      "อ่านตารางกลาง ยังไม่รับรองรูปแบบรายธนาคาร กรุณาเทียบทุกยอดกับต้นฉบับ",
    );
    self.postMessage({ document, sheets: document.tables });
  } catch (error) {
    self.postMessage({
      error: error instanceof Error ? error.message : "อ่าน PDF ไม่ได้",
    });
  } finally {
    await task?.destroy();
    pdfWorker?.destroy();
    engine?.terminate();
  }
};

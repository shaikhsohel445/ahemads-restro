import ExcelJS from 'exceljs';
import fontkit from '@pdf-lib/fontkit';
import { PDFDocument, rgb, type PDFFont } from 'pdf-lib';
import { PDF_FONTS } from './pdf-fonts';
import { toCsv, type CsvValue } from './csv';
import type { ReportResult } from './reports.service';

export type ExportFormat = 'csv' | 'xlsx' | 'pdf';

export const EXPORT_TYPES: Record<ExportFormat, { mime: string; ext: string }> =
  {
    csv: { mime: 'text/csv; charset=utf-8', ext: 'csv' },
    xlsx: {
      mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ext: 'xlsx',
    },
    pdf: { mime: 'application/pdf', ext: 'pdf' },
  };

export function isExportFormat(v: string): v is ExportFormat {
  return v === 'csv' || v === 'xlsx' || v === 'pdf';
}

const FORMULA_START = /^[=+\-@\t\r]/;

function cell(v: CsvValue): string | number | boolean | Date | null {
  if (v == null) return null;
  // Same spreadsheet-injection guard as the CSV writer.
  if (typeof v === 'string' && FORMULA_START.test(v)) return `'${v}`;
  return v;
}

export async function buildXlsx(
  r: ReportResult,
  subtitle: string,
): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'NodeDR OrderRestro';
  const ws = wb.addWorksheet(r.title.slice(0, 31));
  ws.addRow([r.title]).font = { bold: true, size: 14 };
  ws.addRow([subtitle]).font = { color: { argb: 'FF666666' } };
  ws.addRow([]);
  const head = ws.addRow(r.columns);
  head.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  head.eachCell((c) => {
    c.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0B5D4A' },
    };
  });
  for (const row of r.rows) ws.addRow(row.map(cell));
  r.columns.forEach((name, i) => {
    const widest = Math.max(
      name.length,
      ...r.rows.slice(0, 200).map((row) => String(row[i] ?? '').length),
    );
    ws.getColumn(i + 1).width = Math.min(48, Math.max(10, widest + 2));
  });
  ws.views = [{ state: 'frozen', ySplit: 4 }];
  return Buffer.from(await wb.xlsx.writeBuffer());
}

const A4: [number, number] = [595.28, 841.89];
const MARGIN = 36;
const ARABIC = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

// Greedy word wrap against the real glyph widths of the embedded font.
function wrap(text: string, font: PDFFont, size: number, width: number) {
  const lines: string[] = [];
  for (const para of text.split(/\r?\n/)) {
    let line = '';
    for (const word of para.split(/\s+/)) {
      const next = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(next, size) <= width || !line) {
        line = next;
      } else {
        lines.push(line);
        line = word;
      }
    }
    lines.push(line);
  }
  return lines;
}

// pdf-lib (pure JS, runs on Workers) replaces pdfkit, which reads its AFM
// font files from disk. Layout is the same: title, subtitle, a bold header
// row repeated on every page, hairline row separators. Arabic cells are
// shaped by fontkit and right-aligned within their column.
export async function buildPdf(
  r: ReportResult,
  subtitle: string,
): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  pdf.setCreator('NodeDR OrderRestro');
  pdf.setTitle(r.title);
  const regular = await pdf.embedFont(PDF_FONTS.regular, { subset: true });
  const bold = await pdf.embedFont(PDF_FONTS.bold, { subset: true });

  const landscape = r.columns.length > 6;
  const [pw, ph] = landscape ? [A4[1], A4[0]] : A4;
  const pageW = pw - MARGIN * 2;
  const colW = pageW / Math.max(1, r.columns.length);
  const fmt = (v: CsvValue) =>
    v == null
      ? ''
      : v instanceof Date
        ? v.toISOString().slice(0, 10)
        : typeof v === 'number'
          ? String(Math.round(v * 100) / 100)
          : String(v);

  const brand = rgb(0x0b / 255, 0x5d / 255, 0x4a / 255);
  let page = pdf.addPage([pw, ph]);
  let y = ph - MARGIN;

  const text = (
    value: string,
    x: number,
    top: number,
    font: PDFFont,
    size: number,
    color = rgb(0, 0, 0),
    width?: number,
  ) => {
    const dx =
      width && ARABIC.test(value)
        ? Math.max(0, width - font.widthOfTextAtSize(value, size))
        : 0;
    page.drawText(value, { x: x + dx, y: top - size, size, font, color });
  };

  text(r.title, MARGIN, y, bold, 16);
  y -= 22;
  text(subtitle, MARGIN, y, regular, 9, rgb(0.4, 0.4, 0.4));
  y -= 20;

  const size = 8.5;
  const lineH = size * 1.35;
  const drawRow = (vals: string[], isHeader: boolean) => {
    const font = isHeader ? bold : regular;
    const cells = vals.map((v) => wrap(v, font, size, colW - 6));
    const h = Math.max(1, ...cells.map((c) => c.length)) * lineH;
    if (y - h < 60) {
      page = pdf.addPage([pw, ph]);
      y = ph - MARGIN;
      drawRow(r.columns, true);
    }
    cells.forEach((lines, i) => {
      lines.forEach((line, li) =>
        text(line, MARGIN + i * colW, y - li * lineH, font, size, rgb(0, 0, 0), colW - 6),
      );
    });
    y -= h + 4;
    page.drawLine({
      start: { x: MARGIN, y: y + 2 },
      end: { x: MARGIN + pageW, y: y + 2 },
      thickness: isHeader ? 1 : 0.5,
      color: isHeader ? brand : rgb(0.87, 0.87, 0.87),
    });
  };

  drawRow(r.columns, true);
  for (const row of r.rows) drawRow(row.map(fmt), false);
  if (!r.rows.length) {
    y -= 10;
    text('No data for this period.', MARGIN, y, regular, 10, rgb(0.4, 0.4, 0.4));
  }
  return Buffer.from(await pdf.save());
}

export async function renderReport(
  r: ReportResult,
  format: ExportFormat,
  subtitle: string,
): Promise<Buffer> {
  if (format === 'csv') return Buffer.from(toCsv(r.columns, r.rows), 'utf8');
  if (format === 'xlsx') return buildXlsx(r, subtitle);
  return buildPdf(r, subtitle);
}

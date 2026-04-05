/**
 * Document Generator - Creates DOCX, PDF, and Markdown output files
 * from rendered compliance templates and bid documents
 */

import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { BRAND_COLORS, COMPANY_CONFIG } from "../config/index.js";

export interface GeneratedDocument {
  filename: string;
  format: "docx" | "pdf" | "markdown";
  content: Buffer | string;
  mimeType: string;
}

/**
 * Generate a DOCX document from markdown-style content
 */
export async function generateDocx(
  title: string,
  content: string,
  options?: { footer?: string }
): Promise<Buffer> {
  const lines = content.split("\n");
  const children: Paragraph[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("# ")) {
      children.push(
        new Paragraph({
          text: trimmed.slice(2),
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        })
      );
    } else if (trimmed.startsWith("## ")) {
      children.push(
        new Paragraph({
          text: trimmed.slice(3),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 150 },
        })
      );
    } else if (trimmed.startsWith("### ")) {
      children.push(
        new Paragraph({
          text: trimmed.slice(4),
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200, after: 100 },
        })
      );
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: trimmed.slice(2), size: 22 })],
          bullet: { level: 0 },
          spacing: { before: 40, after: 40 },
        })
      );
    } else if (/^\d+\.\s/.test(trimmed)) {
      const text = trimmed.replace(/^\d+\.\s/, "");
      children.push(
        new Paragraph({
          children: [new TextRun({ text, size: 22 })],
          numbering: { reference: "default-numbering", level: 0 },
          spacing: { before: 40, after: 40 },
        })
      );
    } else if (trimmed === "") {
      children.push(new Paragraph({ text: "", spacing: { before: 100 } }));
    } else {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: trimmed, size: 22 })],
          spacing: { before: 40, after: 40 },
        })
      );
    }
  }

  // Add footer
  if (options?.footer) {
    children.push(
      new Paragraph({ text: "", spacing: { before: 400 } }),
      new Paragraph({
        children: [
          new TextRun({
            text: options.footer,
            size: 18,
            color: "666666",
          }),
        ],
      })
    );
  }

  const doc = new Document({
    sections: [{ children }],
    numbering: {
      config: [
        {
          reference: "default-numbering",
          levels: [
            {
              level: 0,
              format: "decimal" as any,
              text: "%1.",
              alignment: "start" as any,
            },
          ],
        },
      ],
    },
  });

  return Buffer.from(await Packer.toBuffer(doc));
}

/**
 * Generate a PDF document from markdown-style content
 */
export async function generatePdf(
  title: string,
  content: string,
  options?: { footer?: string }
): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 612; // Letter size
  const pageHeight = 792;
  const margin = 72;
  const lineHeight = 14;
  const maxWidth = pageWidth - margin * 2;

  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  const lines = content.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();

    // Check if we need a new page
    if (y < margin + 40) {
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    }

    if (trimmed.startsWith("# ")) {
      y -= 10;
      page.drawText(trimmed.slice(2), {
        x: margin,
        y,
        size: 18,
        font: boldFont,
        color: rgb(0.1, 0.23, 0.36), // Navy
      });
      y -= 24;
    } else if (trimmed.startsWith("## ")) {
      y -= 8;
      page.drawText(trimmed.slice(3), {
        x: margin,
        y,
        size: 14,
        font: boldFont,
        color: rgb(0.24, 0.56, 0.73), // Teal
      });
      y -= 20;
    } else if (trimmed.startsWith("### ")) {
      y -= 6;
      page.drawText(trimmed.slice(4), {
        x: margin,
        y,
        size: 12,
        font: boldFont,
      });
      y -= 18;
    } else if (trimmed === "") {
      y -= lineHeight;
    } else {
      // Word wrap for long lines
      const words = trimmed.split(" ");
      let currentLine = "";

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = font.widthOfTextAtSize(testLine, 10);

        if (testWidth > maxWidth && currentLine) {
          if (y < margin + 20) {
            page = pdfDoc.addPage([pageWidth, pageHeight]);
            y = pageHeight - margin;
          }
          page.drawText(currentLine, { x: margin, y, size: 10, font });
          y -= lineHeight;
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }

      if (currentLine) {
        if (y < margin + 20) {
          page = pdfDoc.addPage([pageWidth, pageHeight]);
          y = pageHeight - margin;
        }
        page.drawText(currentLine, { x: margin, y, size: 10, font });
        y -= lineHeight;
      }
    }
  }

  // Add footer to last page
  if (options?.footer) {
    page.drawText(options.footer, {
      x: margin,
      y: margin - 20,
      size: 8,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

/**
 * Generate all three output formats from rendered content
 */
export async function generateDocumentOutputs(
  title: string,
  slug: string,
  content: string,
  formats: ("docx" | "pdf" | "markdown")[] = ["docx", "pdf", "markdown"]
): Promise<GeneratedDocument[]> {
  const footer = `${COMPANY_CONFIG.owner} | ${COMPANY_CONFIG.phone} | ${COMPANY_CONFIG.email}`;
  const outputs: GeneratedDocument[] = [];

  const promises = formats.map(async (format) => {
    switch (format) {
      case "docx": {
        const buffer = await generateDocx(title, content, { footer });
        outputs.push({
          filename: `${slug}.docx`,
          format: "docx",
          content: buffer,
          mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });
        break;
      }
      case "pdf": {
        const buffer = await generatePdf(title, content, { footer });
        outputs.push({
          filename: `${slug}.pdf`,
          format: "pdf",
          content: buffer,
          mimeType: "application/pdf",
        });
        break;
      }
      case "markdown": {
        const mdContent = `${content}\n\n---\n${footer}`;
        outputs.push({
          filename: `${slug}.md`,
          format: "markdown",
          content: mdContent,
          mimeType: "text/markdown",
        });
        break;
      }
    }
  });

  await Promise.all(promises);
  return outputs;
}

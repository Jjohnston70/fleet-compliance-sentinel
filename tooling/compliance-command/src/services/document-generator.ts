import { Document, Packer, Paragraph } from "docx";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export type GeneratedArtifact = {
  mimeType: string;
  base64: string;
  dataUrl: string;
};

export type GeneratedOutputs = {
  pdf: GeneratedArtifact;
  docx: GeneratedArtifact;
};

function toArtifact(buffer: Uint8Array, mimeType: string): GeneratedArtifact {
  const base64 = Buffer.from(buffer).toString("base64");
  return {
    mimeType,
    base64,
    dataUrl: `data:${mimeType};base64,${base64}`,
  };
}

export async function generatePdf(content: string): Promise<GeneratedArtifact> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  let page = pdfDoc.addPage([612, 792]);
  const { height } = page.getSize();

  const lines = content.split(/\r?\n/);
  let y = height - 48;
  for (const line of lines) {
    page.drawText(line || " ", {
      x: 36,
      y,
      size: 11,
      font,
      color: rgb(0.08, 0.08, 0.08),
    });
    y -= 14;
    if (y < 36) {
      page = pdfDoc.addPage([612, 792]);
      y = height - 48;
    }
  }

  const bytes = await pdfDoc.save();
  return toArtifact(bytes, "application/pdf");
}

export async function generateDocx(content: string): Promise<GeneratedArtifact> {
  const paragraphs = content.split(/\r?\n/).map((line) => new Paragraph(line || " "));
  const doc = new Document({ sections: [{ children: paragraphs }] });
  const buffer = await Packer.toBuffer(doc);
  return toArtifact(buffer, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
}

export async function generateDocumentOutputs(content: string): Promise<GeneratedOutputs> {
  const [pdf, docx] = await Promise.all([generatePdf(content), generateDocx(content)]);
  return { pdf, docx };
}

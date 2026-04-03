/**
 * PDF Generator - Generate DOCX proposals using docx library
 */

import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  HeadingLevel,
  AlignmentType,
  WidthType,
  ISectionOptions,
} from 'docx';
import { Proposal, LineItem, ProposalTemplate } from '../data/firestore-schema';
import { CONFIG } from '../config';

type DocChild = Paragraph | Table;

export class PDFGenerator {
  /**
   * Generate DOCX document from proposal data
   */
  static async generateDocx(
    proposal: Proposal,
    template: ProposalTemplate,
    clientName: string,
    clientCompany: string,
    lineItems: LineItem[],
    subtotal: number,
    tax: number,
    discount: number,
    total: number
  ): Promise<Buffer> {
    const children: DocChild[] = [
      // Cover Page
      ...this.createCoverPage(proposal, clientName, clientCompany),

      // Template Sections
      ...this.createTemplateContent(template, proposal),

      // Page Break
      new Paragraph({ children: [], pageBreakBefore: true }),

      // Pricing Section
      ...this.createPricingSection(lineItems, subtotal, tax, discount, total),

      // Page Break
      new Paragraph({ children: [], pageBreakBefore: true }),

      // Terms Section
      ...this.createTermsSection(template, proposal),
    ];

    const sectionOptions: ISectionOptions = {
      properties: {
        page: {
          margin: {
            top: 1000,
            right: 1000,
            bottom: 1000,
            left: 1000,
          },
        },
      },
      children,
    };

    const doc = new Document({
      sections: [sectionOptions],
    });

    const buffer = await Packer.toBuffer(doc);
    return buffer;
  }

  /**
   * Create cover page
   */
  private static createCoverPage(
    proposal: Proposal,
    clientName: string,
    clientCompany: string
  ): Paragraph[] {
    const primaryColor = CONFIG.BRANDING.PRIMARY_COLOR.replace('#', '');
    const secondaryColor = CONFIG.BRANDING.SECONDARY_COLOR.replace('#', '');

    return [
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400, before: 400 },
        children: [
          new TextRun({ text: 'PROPOSAL', bold: true, size: 56, color: primaryColor }),
        ],
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        alignment: AlignmentType.CENTER,
        spacing: { after: 600 },
        children: [
          new TextRun({ text: proposal.title, size: 32, color: secondaryColor }),
        ],
      }),

      new Paragraph({ spacing: { after: 200 }, children: [] }),

      new Paragraph({
        spacing: { after: 100 },
        children: [new TextRun({ text: 'Prepared for:', bold: true })],
      }),

      new Paragraph({
        spacing: { after: 50 },
        children: [new TextRun(clientName)],
      }),

      new Paragraph({
        spacing: { after: 400 },
        children: [new TextRun(clientCompany)],
      }),

      new Paragraph({
        spacing: { after: 100 },
        children: [new TextRun({ text: 'Prepared by:', bold: true })],
      }),

      new Paragraph({
        spacing: { after: 50 },
        children: [new TextRun(CONFIG.BRANDING.NAME)],
      }),

      new Paragraph({
        spacing: { after: 50 },
        children: [new TextRun(CONFIG.BRANDING.PHONE)],
      }),

      new Paragraph({
        spacing: { after: 400 },
        children: [new TextRun({ text: CONFIG.BRANDING.WEBSITE, color: primaryColor })],
      }),

      new Paragraph({
        spacing: { after: 50 },
        children: [new TextRun(`Date: ${this.formatDate(proposal.createdAt)}`)],
      }),

      new Paragraph({
        spacing: { after: 50 },
        children: [new TextRun(`Proposal ID: ${proposal.proposalNumber}`)],
      }),

      new Paragraph({
        spacing: { after: 400 },
        children: [new TextRun(`Valid Until: ${this.formatDate(proposal.validUntil)}`)],
      }),
    ];
  }

  /**
   * Create template content sections
   */
  private static createTemplateContent(
    template: ProposalTemplate,
    proposal: Proposal
  ): Paragraph[] {
    const primaryColor = CONFIG.BRANDING.PRIMARY_COLOR.replace('#', '');

    return template.sections
      .map(section => {
        const title = new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 200 },
          children: [
            new TextRun({ text: section.title, bold: true, color: primaryColor }),
          ],
        });

        const content = new Paragraph({
          spacing: { after: 300, line: 360 },
          children: [
            new TextRun(
              section.contentTemplate
                .replace(/{{CLIENT_COMPANY}}/g, proposal.clientId)
                .replace(/{{PROJECT_TITLE}}/g, proposal.title)
                .replace(/{{SERVICE_TYPE}}/g, proposal.serviceType)
            ),
          ],
        });

        return [title, content];
      })
      .flat();
  }

  /**
   * Create pricing table section
   */
  private static createPricingSection(
    lineItems: LineItem[],
    subtotal: number,
    tax: number,
    discount: number,
    total: number
  ): DocChild[] {
    const primaryColor = CONFIG.BRANDING.PRIMARY_COLOR.replace('#', '');
    const secondaryColor = CONFIG.BRANDING.SECONDARY_COLOR.replace('#', '');

    const headerRow = new TableRow({
      children: ['Description', 'Qty', 'Unit Price', 'Total'].map(
        label =>
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: label, bold: true })],
              }),
            ],
            shading: { fill: primaryColor },
          })
      ),
    });

    const itemRows = lineItems.map(
      item =>
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun(item.description)] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun(item.quantity.toString())] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun(`$${item.unitPrice.toFixed(2)}`)] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun(`$${item.total.toFixed(2)}`)] })] }),
          ],
        })
    );

    const subtotalRow = new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: 'SUBTOTAL', bold: true })] })],
          columnSpan: 3,
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: `$${subtotal.toFixed(2)}`, bold: true })] })],
        }),
      ],
    });

    const summaryRows: TableRow[] = [];

    if (tax > 0) {
      summaryRows.push(
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun('Tax')] })], columnSpan: 3 }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun(`$${tax.toFixed(2)}`)] })] }),
          ],
        })
      );
    }

    if (discount > 0) {
      summaryRows.push(
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun('Discount')] })], columnSpan: 3 }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun(`-$${discount.toFixed(2)}`)] })] }),
          ],
        })
      );
    }

    const totalRow = new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: 'TOTAL', bold: true, size: 24 })] })],
          columnSpan: 3,
          shading: { fill: secondaryColor },
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: `$${total.toFixed(2)}`, bold: true, size: 24 })] })],
          shading: { fill: secondaryColor },
        }),
      ],
    });

    const table = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [headerRow, ...itemRows, subtotalRow, ...summaryRows, totalRow],
    });

    return [
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
        children: [new TextRun({ text: 'Investment & Pricing', bold: true, color: primaryColor })],
      }),

      table,

      new Paragraph({ spacing: { after: 300 }, children: [] }),

      new Paragraph({
        children: [new TextRun({ text: 'Payment Terms:', bold: true })],
      }),

      new Paragraph({ children: [new TextRun('50% upon project initiation')] }),
      new Paragraph({ children: [new TextRun('25% at midpoint milestone')] }),
      new Paragraph({
        spacing: { after: 300 },
        children: [new TextRun('25% upon project completion')],
      }),
    ];
  }

  /**
   * Create terms section
   */
  private static createTermsSection(
    template: ProposalTemplate,
    _proposal: Proposal
  ): Paragraph[] {
    const primaryColor = CONFIG.BRANDING.PRIMARY_COLOR.replace('#', '');

    return [
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
        children: [new TextRun({ text: 'Terms & Conditions', bold: true, color: primaryColor })],
      }),

      new Paragraph({
        spacing: { after: 300, line: 360 },
        children: [new TextRun(template.defaultTerms)],
      }),

      new Paragraph({
        spacing: { before: 400, after: 100 },
        children: [new TextRun('___________________________')],
      }),

      new Paragraph({
        spacing: { after: 400 },
        children: [new TextRun('Client Signature / Date')],
      }),

      new Paragraph({
        spacing: { after: 100 },
        children: [new TextRun('___________________________')],
      }),

      new Paragraph({
        spacing: { after: 400 },
        children: [new TextRun(`${CONFIG.BRANDING.NAME} Representative / Date`)],
      }),
    ];
  }

  /**
   * Format date as MM/DD/YYYY
   */
  private static formatDate(date: Date): string {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    return `${month}/${day}/${year}`;
  }
}

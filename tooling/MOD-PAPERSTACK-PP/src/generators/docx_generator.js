/**
 * Pipeline Flyer Generator - WORD DOC VERSION
 * TRUE NORTH DATA STRATEGIES
 * =============================================
 * 
 * HOW TO RUN:
 * 1. Install Node.js if you don't have it (https://nodejs.org)
 * 2. Open PowerShell, navigate to this file's folder
 * 3. Run: npm install docx          (one-time setup, installs the library)
 * 4. Run: node Pipeline_Flyer_Generator_DOCX.js
 * 5. Open Pipeline_Flyer.docx in Word
 * 
 * HOW DOCX-JS WORKS:
 * - A .docx file is actually a ZIP of XML files
 * - The "docx" library builds that XML for you using JavaScript objects
 * - Everything is nested: Document > Sections > Children (Paragraphs, Tables)
 * - Tables are used for LAYOUT (backgrounds, columns) not just data grids
 * - You build the whole document as a tree of objects, then "pack" it into a .docx file
 * 
 * UNITS CHEAT SHEET:
 * - DXA (Document eXtensible Architecture): 1 inch = 1440 DXA
 * - US Letter width: 12240 DXA (8.5 inches)
 * - US Letter height: 15840 DXA (11 inches)
 * - Font size: measured in HALF-POINTS, so size: 24 = 12pt font, size: 48 = 24pt font
 * - Spacing: also in DXA, so spacing: { after: 200 } = about 0.14 inches after
 * 
 * COMMON PATTERNS:
 * - new Paragraph({ children: [...] })     = A line/block of text
 * - new TextRun({ text: "...", ... })       = A styled chunk of text inside a Paragraph
 * - new Table({ rows: [...] })              = A table (used for layout AND data)
 * - new TableRow({ children: [...] })       = A row in a table
 * - new TableCell({ children: [...] })      = A cell in a row
 * - ShadingType.CLEAR with fill: "HexColor" = Background color on a cell
 * - borders: noBorders                      = Hide all cell borders (invisible layout table)
 * - margins on TableCell                    = Padding INSIDE the cell
 * - alignment: AlignmentType.CENTER         = Center text horizontally
 * - VerticalAlign.TOP                       = Align cell content to top (important for columns)
 */

const fs = require("fs");                              // Node.js file system module - lets us write the .docx file to disk
const {
  Document,                                            // The top-level document object - everything lives inside this
  Packer,                                              // Converts the Document object into actual .docx binary data
  Paragraph,                                           // A block of text (like a <p> tag in HTML)
  TextRun,                                             // A styled chunk of text inside a Paragraph (like a <span>)
  Table,                                               // A table - we use these for LAYOUT (colored backgrounds, columns) not just data
  TableRow,                                            // A single row in a Table
  TableCell,                                           // A single cell in a TableRow - can contain Paragraphs, other Tables, etc.
  AlignmentType,                                       // Text alignment options: LEFT, CENTER, RIGHT, JUSTIFIED
  BorderStyle,                                         // Border styles: SINGLE, DOUBLE, NONE, etc.
  WidthType,                                           // How width is measured: DXA (fixed points), PERCENTAGE, AUTO
  ShadingType,                                         // How background color is applied: CLEAR (use this), SOLID (don't use - causes black bg)
  VerticalAlign,                                       // Vertical alignment in cells: TOP, CENTER, BOTTOM
} = require("docx");                                   // Import everything we need from the docx library

// ============================================
// BRAND COLORS
// These are hex color codes WITHOUT the # prefix
// docx-js wants bare hex strings like "1A3A5C" not "#1A3A5C"
// Change these to update colors throughout the entire flyer
// ============================================
const NAVY = "1A3A5C";                                 // Primary dark background - used for most sections
const TEAL = "3D8EB9";                                 // Accent color - section headers, step numbers, CTA card background
const WHITE = "FFFFFF";                                // Pure white - headlines and emphasis
const TEXT_LIGHT = "C8DAE8";                           // Body text on dark bg - readable but not pure white
const TEXT_MUTED = "A0B8CC";                           // Secondary/description text - less prominent than TEXT_LIGHT
const NAVY_CARD = "162E48";                            // "HOW IT WORKS" card background - slightly different from NAVY for visual depth
const NAVY_DARK = "0F2236";                            // Footer background - darkest shade
const FOOTER_TEXT = "6B8AA5";                          // Footer text color - subtle, not meant to draw attention

// ============================================
// CONTENT - Edit all flyer text here
// Change any string to update what appears on the flyer
// ============================================
const TOP_BAR_TEXT = "TRUE NORTH DATA STRATEGIES  |  SBA-Certified SDVOSB  |  Colorado Springs, CO";
const HEADLINE = "PIPELINE";
const TAGLINE_1 = "Your business already has the answers.";
const TAGLINE_2 = "Pipeline connects them.";
const HERO_BODY = "Pipeline connects your scattered business tools \u2014 email, spreadsheets, databases, CRMs, and documents \u2014 into one central hub where anyone on your team can ask questions in plain English and get answers instantly.";
// NOTE: \u2014 is the unicode em dash character (—)

const PAIN_POINTS = [                                  // Array of 3 pain points, each with a title and description
  {
    title: "Information is everywhere",
    body: "Client details in email. Job info in a spreadsheet. Financials in one app. Schedules in another. Nothing talks to each other."
  },
  {
    title: "One person knows everything",
    body: "The owner or office manager is the human search engine. If they\u2019re gone, the team is stuck. Nobody can take a day off."
    // NOTE: \u2019 is a smart apostrophe (right single quote)
  },
  {
    title: "You can\u2019t see your own business",
    body: "The data exists, but you can\u2019t get a straight answer without digging through five tools and three people."
  },
];

const STEPS = [                                        // Array of 3 steps for "HOW PIPELINE WORKS"
  { num: "01", title: "Connect", desc: "We link your existing tools \u2014 email, spreadsheets, CRM, databases. No ripping anything out." },
  { num: "02", title: "Organize", desc: "Your business knowledge gets structured and indexed so it\u2019s actually searchable." },
  { num: "03", title: "Ask", desc: "Anyone on your team types a question: \u201CWhat\u2019s the status on the Smith job?\u201D and gets the answer." },
  // NOTE: \u201C and \u201D are smart double quotes (" and ")
];

const BENEFITS = [                                     // Array of benefit strings for "WHAT YOU GET"
  "One hub for all your business data \u2014 no more app-hopping",
  "Plain English search \u2014 no training, no tech skills needed",
  "Named for your business \u2014 Pipeline [YourCompany] \u2014 it\u2019s yours",
  "Runs locally on your computer \u2014 your data stays private and secure",
  "Hands-on install at a flat rate \u2014 fixed scope, fixed price, no surprises",
];

const CTA_HEADLINE = "See it in action. 15 minutes. No obligation.";
const CTA_CONTACT = "jacob@truenorthstrategyops.com  |  555-555-5555";
const CTA_WEBSITE = "truenorthstrategyops.com";
const FOOTER_LEFT = "TRUE NORTH DATA STRATEGIES LLC  |  Veteran-Owned Small Business  |  Turning Data into Direction";
const FOOTER_RIGHT = "\u00A9 2026 True North Data Strategies";    // \u00A9 is the copyright symbol ©

// ============================================
// OUTPUT - Change filename here
// ============================================
const OUTPUT_FILE = "Pipeline_Flyer.docx";

// ============================================
// HELPERS - Reusable pieces to keep code DRY
// ============================================

// noBorder: A border definition that means "no visible border"
// We apply this to every table cell so the layout tables are invisible
const noBorder = {
  style: BorderStyle.NONE,                             // NONE = invisible border
  size: 0,                                             // 0 thickness
  color: WHITE                                         // White color (doesn't matter since NONE, but required by the library)
};
// noBorders: Apply noBorder to all 4 sides of a cell
const noBorders = {
  top: noBorder,
  bottom: noBorder,
  left: noBorder,
  right: noBorder
};

// spacer(): Creates an empty paragraph with vertical space above it
// Use this to add gaps between elements, like a <br> with height
// height is in DXA (1440 = 1 inch, 200 = about 0.14 inches)
function spacer(height = 200) {
  return new Paragraph({
    spacing: { before: height }                        // "before" = space ABOVE this paragraph
  });
}

// fullWidthBgCell(): Creates a full-width table cell with a background color
// This is the core layout trick - we use invisible tables with colored cells
// to create colored background sections (since Paragraphs can't have bg colors)
// Parameters:
//   bgColor = background color hex string
//   children = array of Paragraphs/Tables to put inside the cell
//   margins = padding inside the cell (optional, has defaults)
function fullWidthBgCell(bgColor, children, margins = { top: 200, bottom: 200, left: 600, right: 600 }) {
  return new Table({
    width: { size: 12240, type: WidthType.DXA },       // 12240 DXA = 8.5 inches = full page width
    columnWidths: [12240],                              // One column that spans the full width
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: noBorders,                        // Hide all borders - this is a layout table, not a data table
            shading: {
              fill: bgColor,                           // Background color of this cell
              type: ShadingType.CLEAR                  // ALWAYS use CLEAR, never SOLID (SOLID causes black backgrounds)
            },
            width: { size: 12240, type: WidthType.DXA },  // Cell width matches table width
            margins: margins,                          // Padding inside the cell - controls how far content sits from edges
            children: children                         // The actual content (Paragraphs, Tables, etc.) that goes inside
          })
        ]
      })
    ]
  });
}

// ============================================
// BUILD THE DOCUMENT
// This is the main document structure
// Think of it as a tree:
//   Document
//     └── Section (one page)
//           └── Children (array of Paragraphs and Tables, rendered top to bottom)
// ============================================
const doc = new Document({
  styles: {                                            // Global style defaults for the entire document
    default: {
      document: {
        run: {                                         // "run" = text styling defaults
          font: "Arial",                               // Default font for all text
          size: 22,                                    // Default size in half-points: 22 = 11pt
          color: TEXT_LIGHT                             // Default text color
        }
      }
    }
  },
  sections: [                                          // Array of sections - each section can have its own page settings
    {
      properties: {                                    // Page setup for this section
        page: {
          size: {
            width: 12240,                              // 8.5 inches in DXA (8.5 x 1440 = 12240)
            height: 15840                              // 11 inches in DXA (11 x 1440 = 15840)
          },
          margin: {
            top: 0,                                    // Zero margins on all sides - we handle spacing with table cell margins instead
            right: 0,                                  // This lets our background colors extend edge-to-edge
            bottom: 0,
            left: 0
          }
        }
      },
      // children: array of elements rendered top-to-bottom on the page
      // Each element is either a Paragraph or a Table
      // ORDER MATTERS - first item appears at top of page, last at bottom
      children: [

        // ============================================
        // TOP ACCENT BAR
        // A thin teal strip across the very top of the page
        // Uses a table with a fixed row height and teal background
        // ============================================
        new Table({
          width: { size: 12240, type: WidthType.DXA }, // Full page width
          columnWidths: [12240],                        // One column spanning full width
          rows: [
            new TableRow({
              height: { value: 150, rule: "exact" },   // Fixed height of 150 DXA (~0.1 inch) | "exact" means don't grow/shrink | this creates the thin accent strip
              children: [
                new TableCell({
                  borders: noBorders,                  // No visible borders
                  shading: { fill: TEAL, type: ShadingType.CLEAR },  // Teal background color
                  width: { size: 12240, type: WidthType.DXA },
                  children: [new Paragraph({ text: "" })]  // Empty paragraph required - cells can't be truly empty or Word complains
                })
              ]
            })
          ]
        }),

        // ============================================
        // COMPANY INFO BAR
        // Shows "TRUE NORTH DATA STRATEGIES | SBA-Certified..." on navy background
        // ============================================
        fullWidthBgCell(                               // Using our helper function for a full-width colored cell
          NAVY,                                        // Navy background
          [                                            // Content array - what goes inside the cell
            new Paragraph({
              children: [
                new TextRun({
                  text: TOP_BAR_TEXT,                   // "TRUE NORTH DATA STRATEGIES | SBA-Certified SDVOSB | Colorado Springs, CO"
                  font: "Arial",
                  size: 16,                            // 16 half-points = 8pt font (small, subtle)
                  color: TEXT_MUTED                     // Muted color - not meant to be the focus
                })
              ]
            })
          ],
          { top: 100, bottom: 100, left: 600, right: 600 }  // Padding: 100 DXA top/bottom, 600 DXA left/right (~0.42 inch sides)
        ),

        // ============================================
        // HERO SECTION
        // Contains: PIPELINE headline, teal underline bar, taglines, body text
        // This is the most visually prominent section
        // ============================================
        fullWidthBgCell(
          NAVY,                                        // Navy background
          [
            // --- "PIPELINE" headline ---
            new Paragraph({
              spacing: { after: 80 },                  // 80 DXA of space below this paragraph
              children: [
                new TextRun({
                  text: HEADLINE,                      // "PIPELINE"
                  font: "Arial",
                  size: 72,                            // 72 half-points = 36pt font - largest text on the page
                  bold: true,
                  color: WHITE                         // White on navy for maximum contrast
                })
              ]
            }),

            // --- Teal underline bar ---
            // This is a tiny table with a teal cell, creating a colored horizontal line
            // We can't just draw a line in docx-js, so we fake it with a thin table
            new Table({
              width: { size: 3000, type: WidthType.DXA },  // 3000 DXA wide (~2 inches) - only partial width, not edge to edge
              columnWidths: [3000],
              rows: [
                new TableRow({
                  height: { value: 60, rule: "exact" },  // 60 DXA tall (~0.04 inch) - just a thin colored bar
                  children: [
                    new TableCell({
                      borders: noBorders,
                      shading: { fill: TEAL, type: ShadingType.CLEAR },  // Teal background = the "line" color
                      width: { size: 3000, type: WidthType.DXA },
                      children: [new Paragraph({ text: "" })]  // Empty content - the cell background IS the visual element
                    })
                  ]
                })
              ]
            }),

            spacer(200),                               // 200 DXA gap between underline bar and taglines

            // --- Tagline line 1 ---
            new Paragraph({
              spacing: { after: 40 },                  // Small gap before tagline 2
              children: [
                new TextRun({
                  text: TAGLINE_1,                     // "Your business already has the answers."
                  font: "Arial",
                  size: 28,                            // 28 half-points = 14pt
                  color: TEXT_LIGHT                     // Light blue-white, secondary to headline
                })
              ]
            }),

            // --- Tagline line 2 (bold) ---
            new Paragraph({
              spacing: { after: 200 },                 // Larger gap before the body paragraph
              children: [
                new TextRun({
                  text: TAGLINE_2,                     // "Pipeline connects them."
                  font: "Arial",
                  size: 28,                            // Same size as tagline 1
                  bold: true,                          // BOLD makes this line stand out from tagline 1
                  color: WHITE                         // Full white vs TEXT_LIGHT creates emphasis hierarchy
                })
              ]
            }),

            // --- Hero body paragraph ---
            new Paragraph({
              spacing: { after: 100 },
              children: [
                new TextRun({
                  text: HERO_BODY,                     // The full description paragraph
                  font: "Arial",
                  size: 22,                            // 22 half-points = 11pt - standard body text size
                  color: TEXT_MUTED                     // Most muted color in the hero - keeps focus on headline/taglines
                })
              ]
            }),
          ],
          { top: 300, bottom: 300, left: 600, right: 600 }  // Generous padding - 300 DXA top/bottom gives the hero breathing room
        ),

        // ============================================
        // SOUND FAMILIAR? - Section header
        // Just the teal header text on navy background
        // ============================================
        fullWidthBgCell(
          NAVY,
          [
            new Paragraph({
              children: [
                new TextRun({
                  text: "SOUND FAMILIAR?",
                  font: "Arial",
                  size: 22,                            // 11pt
                  bold: true,
                  color: TEAL                          // Teal section headers create visual rhythm down the page
                })
              ]
            })
          ],
          { top: 200, bottom: 100, left: 600, right: 600 }  // More space above (200) than below (100) separates from previous section
        ),

        // ============================================
        // THREE PAIN POINT COLUMNS
        // A 3-column table where each cell is one pain point
        // This is how you do multi-column layouts in Word - with tables
        // ============================================
        new Table({
          width: { size: 12240, type: WidthType.DXA }, // Full page width
          columnWidths: [4080, 4080, 4080],            // Three equal columns: 12240 / 3 = 4080 DXA each
          rows: [
            new TableRow({
              children: PAIN_POINTS.map((point, i) =>  // .map() loops through pain points and creates a TableCell for each
                new TableCell({
                  borders: noBorders,                  // Invisible borders - looks like free-standing text, not a table
                  shading: { fill: NAVY, type: ShadingType.CLEAR },  // Navy background matches the rest of the page
                  width: { size: 4080, type: WidthType.DXA },        // Each cell is 4080 DXA wide
                  margins: {
                    top: 80,
                    bottom: 200,
                    left: i === 0 ? 600 : 200,         // First column (i=0) gets 600 left margin (page edge padding) | inner columns get 200 (just gutter space)
                    right: i === 2 ? 600 : 200          // Last column (i=2) gets 600 right margin (page edge padding) | inner columns get 200
                  },
                  verticalAlign: VerticalAlign.TOP,    // Align content to TOP of cell - important when columns have different text lengths so they start at the same height
                  children: [
                    // Pain point title
                    new Paragraph({
                      spacing: { after: 80 },          // 80 DXA gap between title and body
                      children: [
                        new TextRun({
                          text: point.title,            // "Information is everywhere" etc.
                          font: "Arial",
                          size: 22,                    // 11pt bold white
                          bold: true,
                          color: WHITE
                        })
                      ]
                    }),
                    // Pain point description
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: point.body,             // The longer description text
                          font: "Arial",
                          size: 18,                    // 18 half-points = 9pt - slightly smaller than body text for visual hierarchy
                          color: TEXT_MUTED
                        })
                      ]
                    })
                  ]
                })
              )
            })
          ]
        }),

        // ============================================
        // HOW PIPELINE WORKS - Card
        // This is a "card" effect: a navy outer cell containing an inner table
        // with a slightly different background color (NAVY_CARD)
        // The outer cell provides page-edge margins
        // The inner table provides the card background and its own internal padding
        // ============================================
        fullWidthBgCell(
          NAVY,                                        // Outer background - matches page
          [
            // Inner card table
            new Table({
              width: { size: 11440, type: WidthType.DXA },  // 11440 DXA = full width minus the outer margins (12240 - 400 - 400 = 11440)
              columnWidths: [11440],
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      borders: noBorders,
                      shading: { fill: NAVY_CARD, type: ShadingType.CLEAR },  // Slightly different navy creates "card floating on page" effect
                      width: { size: 11440, type: WidthType.DXA },
                      margins: { top: 200, bottom: 200, left: 400, right: 400 },  // Internal card padding
                      children: [
                        // Card header
                        new Paragraph({
                          spacing: { after: 200 },     // Gap between header and first step
                          children: [
                            new TextRun({
                              text: "HOW PIPELINE WORKS",
                              font: "Arial",
                              size: 22,
                              bold: true,
                              color: TEAL
                            })
                          ]
                        }),
                        // Steps - map through the STEPS array to create a Paragraph for each
                        ...STEPS.map(step =>           // ... (spread operator) flattens the array into individual elements in the children array
                          new Paragraph({
                            spacing: { after: 60 },    // 60 DXA between steps
                            children: [
                              // Step number (01, 02, 03) - large teal bold
                              new TextRun({
                                text: step.num + "  ", // "01  " with trailing spaces for visual separation
                                font: "Arial",
                                size: 28,              // 14pt - larger than the title to serve as a visual anchor
                                bold: true,
                                color: TEAL
                              }),
                              // Step title (Connect, Organize, Ask) - white bold
                              new TextRun({
                                text: step.title,
                                font: "Arial",
                                size: 22,              // 11pt bold white
                                bold: true,
                                color: WHITE
                              }),
                              // Step description - muted, em dash separated
                              new TextRun({
                                text: "  \u2014  " + step.desc,  // em dash separator between title and description
                                font: "Arial",
                                size: 18,              // 9pt muted
                                color: TEXT_MUTED
                              }),
                            ]
                          })
                        )
                      ]
                    })
                  ]
                })
              ]
            })
          ],
          { top: 0, bottom: 0, left: 400, right: 400 }  // Outer cell: no top/bottom padding, 400 DXA sides create the inset from page edges
        ),

        // ============================================
        // WHAT YOU GET - Benefits list
        // Each benefit has a teal em dash followed by the text
        // Uses .map() to loop through BENEFITS array
        // ============================================
        fullWidthBgCell(
          NAVY,
          [
            // Section header
            new Paragraph({
              spacing: { after: 150 },                 // Gap between header and first benefit
              children: [
                new TextRun({
                  text: "WHAT YOU GET",
                  font: "Arial",
                  size: 22,
                  bold: true,
                  color: TEAL
                })
              ]
            }),
            // Benefits - spread the mapped array into the children
            ...BENEFITS.map(b =>                       // For each benefit string, create a Paragraph
              new Paragraph({
                spacing: { after: 60 },                // 60 DXA between each benefit line
                children: [
                  // Teal em dash prefix
                  new TextRun({
                    text: "\u2014  ",                   // Em dash + 2 spaces
                    font: "Arial",
                    size: 22,
                    bold: true,
                    color: TEAL                         // Teal dash creates a visual bullet point
                  }),
                  // Benefit text
                  new TextRun({
                    text: b,                            // The benefit string from the array
                    font: "Arial",
                    size: 20,                          // 10pt - slightly smaller than default
                    color: TEXT_LIGHT
                  }),
                ]
              })
            )
          ],
          { top: 200, bottom: 200, left: 600, right: 600 }
        ),

        // ============================================
        // CTA CARD - Teal background call to action
        // Same "card inside a cell" pattern as HOW IT WORKS
        // but with TEAL background instead of NAVY_CARD
        // ============================================
        fullWidthBgCell(
          NAVY,                                        // Outer cell is navy (matches page)
          [
            new Table({
              width: { size: 11440, type: WidthType.DXA },  // Inset card width
              columnWidths: [11440],
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      borders: noBorders,
                      shading: { fill: TEAL, type: ShadingType.CLEAR },  // TEAL background makes this pop against navy
                      width: { size: 11440, type: WidthType.DXA },
                      margins: { top: 200, bottom: 200, left: 400, right: 400 },
                      children: [
                        // CTA headline - centered, bold, white
                        new Paragraph({
                          alignment: AlignmentType.CENTER,  // Center text horizontally within the cell
                          spacing: { after: 80 },
                          children: [
                            new TextRun({
                              text: CTA_HEADLINE,       // "See it in action. 15 minutes. No obligation."
                              font: "Arial",
                              size: 28,                // 14pt bold - attention-grabbing
                              bold: true,
                              color: WHITE
                            })
                          ]
                        }),
                        // Contact info - centered
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          spacing: { after: 40 },
                          children: [
                            new TextRun({
                              text: CTA_CONTACT,        // "jacob@truenorthstrategyops.com | 555-555-5555"
                              font: "Arial",
                              size: 22,                // 11pt
                              color: WHITE
                            })
                          ]
                        }),
                        // Website - centered, smaller
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          children: [
                            new TextRun({
                              text: CTA_WEBSITE,        // "truenorthstrategyops.com"
                              font: "Arial",
                              size: 18,                // 9pt - tertiary importance
                              color: WHITE
                            })
                          ]
                        }),
                      ]
                    })
                  ]
                })
              ]
            })
          ],
          { top: 0, bottom: 0, left: 400, right: 400 }
        ),

        // ============================================
        // FOOTER - Two-column layout with left and right text
        // Uses a 2-column table: left cell for company info, right cell for copyright
        // ============================================
        new Table({
          width: { size: 12240, type: WidthType.DXA }, // Full page width
          columnWidths: [8000, 4240],                  // Left column wider (8000) for the longer text | right column narrower (4240) for copyright | must sum to 12240
          rows: [
            new TableRow({
              children: [
                // Left footer cell - company info
                new TableCell({
                  borders: noBorders,
                  shading: { fill: NAVY_DARK, type: ShadingType.CLEAR },  // Darkest navy for footer
                  width: { size: 8000, type: WidthType.DXA },
                  margins: { top: 120, bottom: 120, left: 600, right: 100 },  // 600 left margin aligns with page content above | 100 right gives gutter before copyright
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: FOOTER_LEFT,            // "TRUE NORTH DATA STRATEGIES LLC | Veteran-Owned..."
                          font: "Arial",
                          size: 14,                    // 7pt - smallest text on the page, appropriate for footer/legal
                          color: FOOTER_TEXT             // Subtle gray - not meant to compete for attention
                        })
                      ]
                    })
                  ]
                }),
                // Right footer cell - copyright
                new TableCell({
                  borders: noBorders,
                  shading: { fill: NAVY_DARK, type: ShadingType.CLEAR },
                  width: { size: 4240, type: WidthType.DXA },
                  margins: { top: 120, bottom: 120, left: 100, right: 600 },  // 600 right margin aligns with page edge
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.RIGHT,  // Right-align the copyright text
                      children: [
                        new TextRun({
                          text: FOOTER_RIGHT,           // "© 2026 True North Data Strategies"
                          font: "Arial",
                          size: 14,                    // Same 7pt as left footer
                          color: FOOTER_TEXT
                        })
                      ]
                    })
                  ]
                }),
              ]
            })
          ]
        }),

        // ============================================
        // BOTTOM ACCENT BAR - Teal strip at very bottom
        // Mirrors the top accent bar for visual symmetry
        // ============================================
        new Table({
          width: { size: 12240, type: WidthType.DXA },
          columnWidths: [12240],
          rows: [
            new TableRow({
              height: { value: 80, rule: "exact" },    // 80 DXA tall (~0.06 inch) - slightly thinner than top bar (150) since it's less prominent
              children: [
                new TableCell({
                  borders: noBorders,
                  shading: { fill: TEAL, type: ShadingType.CLEAR },
                  width: { size: 12240, type: WidthType.DXA },
                  children: [new Paragraph({ text: "" })]  // Empty paragraph - the teal background IS the visual
                })
              ]
            })
          ]
        }),

      ] // end children array
    }
  ] // end sections array
}); // end Document

// ============================================
// GENERATE THE FILE
// Packer.toBuffer() converts the Document object tree into actual .docx binary data
// Then we write that binary data to a file on disk
// ============================================
Packer.toBuffer(doc).then(buffer => {                  // toBuffer() returns a Promise (async operation) - .then() runs when it's done
  fs.writeFileSync(OUTPUT_FILE, buffer);               // Write the binary buffer to disk as a .docx file | writeFileSync = write immediately, don't continue until done
  console.log("Created: " + OUTPUT_FILE);              // Print confirmation to the terminal
});

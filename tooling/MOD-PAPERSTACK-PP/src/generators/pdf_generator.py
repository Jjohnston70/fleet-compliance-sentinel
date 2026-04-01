"""
Pipeline Flyer Generator - TRUE NORTH DATA STRATEGIES
=====================================================
Run with: python Pipeline_Flyer_Generator.py

COORDINATE SYSTEM CHEAT SHEET:
- Page is 612 points wide (8.5 inches) x 792 points tall (11 inches)
- (0, 0) is the BOTTOM-LEFT corner of the page
- X increases going RIGHT
- Y increases going UP
- So (612, 792) is the TOP-RIGHT corner
- 1 inch = 72 points

COMMON METHODS CHEAT SHEET:
- c.rect(x, y, width, height)     = Draw a rectangle starting at (x,y) bottom-left corner
- c.drawString(x, y, text)        = Draw text with LEFT edge at x
- c.drawRightString(x, y, text)   = Draw text with RIGHT edge at x
- c.drawCentredString(x, y, text) = Draw text CENTERED on x
- c.circle(x, y, radius)          = Draw circle centered at (x,y)
- c.line(x1, y1, x2, y2)         = Draw line from point 1 to point 2
- c.roundRect(x, y, w, h, radius) = Rectangle with rounded corners
- c.setFillColor(color)           = Sets color for NEXT fill operation (shapes, text)
- c.setStrokeColor(color)         = Sets color for NEXT outline/line operation
- c.setFont(name, size)           = Sets font for NEXT drawString call
- c.setLineWidth(width)           = Sets thickness for NEXT line/stroke
- fill=1 means FILL the shape with current fill color (1=yes, 0=no)
- stroke=0 means DON'T draw an outline around the shape (1=yes, 0=no)
- Paragraph(text, style)          = Rich text block that auto-wraps to a width
- p.wrap(width, height)           = Calculate how much space the paragraph needs
- p.drawOn(canvas, x, y)          = Draw the paragraph at position (x,y) = bottom-left of text block
"""

from reportlab.lib.pagesizes import letter          # Gives us the letter page dimensions (612x792)
from reportlab.lib.colors import HexColor           # Lets us use hex color codes like '#1a3a5c'
from reportlab.pdfgen import canvas                  # The main PDF drawing engine
from reportlab.platypus import Paragraph             # Text blocks that auto-wrap within a width
from reportlab.lib.styles import ParagraphStyle      # Styling rules for Paragraph objects

# ============================================
# COLORS - Edit your brand colors here
# HexColor('#RRGGBB') converts a web hex color to a reportlab color object
# You can grab hex codes from any color picker or your brand guide
# ============================================
NAVY = HexColor('#1a3a5c')          # Primary background - darkest navy
NAVY_LIGHT = HexColor('#1f4570')    # Hero section background - slightly lighter navy for contrast
NAVY_CARD = HexColor('#162e48')     # Card backgrounds - between NAVY and NAVY_DARK
NAVY_DARK = HexColor('#0f2236')     # Footer background - darkest shade
TEAL = HexColor('#3d8eb9')          # Primary accent - used for highlights, buttons, accents
WHITE = HexColor('#FFFFFF')         # Pure white - headlines and emphasis text
TEXT_LIGHT = HexColor('#c8dae8')    # Body text on dark bg - readable but not bright white
TEXT_MUTED = HexColor('#a0b8cc')    # Secondary text - less important info, descriptions
TEXT_SUBTLE = HexColor('#6b8aa5')   # Footer text - barely visible, for legal/copyright
ACCENT_LINE = HexColor('#2a5580')   # Diagonal decorative line - subtle background texture

# ============================================
# CONTENT - Edit all flyer text here
# Change any string to update what appears on the flyer
# ============================================
TOP_BAR_TEXT = "TRUE NORTH DATA STRATEGIES  |  SBA-Certified SDVOSB  |  Colorado Springs, CO"
HEADLINE = "PIPELINE"
TAGLINE_1 = "Your business already has the answers."
TAGLINE_2 = "Pipeline connects them."
HERO_BODY = (
    "Pipeline connects your scattered business tools — email, spreadsheets, "
    "databases, CRMs, and documents — into one central hub where anyone on your "
    "team can ask questions in plain English and get answers instantly."
)
STAT_NUMBER = "5+"                  # Big number displayed on right side of hero
STAT_LINE_1 = "apps checked before one"   # First line under the stat number
STAT_LINE_2 = "question gets answered"    # Second line under the stat number

# Each pain point is (title, description) - shows as 3 columns
PAIN_POINTS = [
    ("Information is everywhere",
     "Client details in email. Job info in a spreadsheet. Financials in one app. Schedules in another. Nothing talks to each other."),
    ("One person knows everything",
     "The owner or office manager is the human search engine. If they're gone, the team is stuck. Nobody can take a day off."),
    ("You can't see your own business",
     "The data exists, but you can't get a straight answer without digging through five tools and three people."),
]

# Each step is (number, title, description) - shows in the HOW IT WORKS card
STEPS = [
    ("01", "Connect", "We link your existing tools — email, spreadsheets, CRM, databases. No ripping anything out."),
    ("02", "Organize", "Your business knowledge gets structured and indexed so it's actually searchable."),
    ("03", "Ask", 'Anyone on your team types a question: "What\'s the status on the Smith job?" and gets the answer.'),
]

# Each benefit is a single string with a teal dash prefix
BENEFITS = [
    "One hub for all your business data — no more app-hopping",
    "Plain English search — no training, no tech skills needed",
    "Named for your business — Pipeline [YourCompany] — it's yours",
    "Runs locally on your computer — your data stays private and secure",
    "Hands-on install at a flat rate — fixed scope, fixed price, no surprises",
]

CTA_HEADLINE = "See it in action. 15 minutes. No obligation."
CTA_CONTACT = "jacob@truenorthstrategyops.com  |  555-555-5555"
CTA_WEBSITE = "truenorthstrategyops.com"

FOOTER_LEFT = "TRUE NORTH DATA STRATEGIES LLC  |  Veteran-Owned Small Business  |  Turning Data into Direction"
FOOTER_RIGHT = "© 2026 True North Data Strategies"

# ============================================
# OUTPUT - Change filename here
# ============================================
OUTPUT_FILE = "Pipeline_Flyer.pdf"

# ============================================
# LAYOUT - Master vertical positions for each section
# These control where each major section sits on the page
# Numbers are in POINTS measured from BOTTOM of page (unless noted)
# Increase number = move section UP on page
# Decrease number = move section DOWN on page
# If sections overlap, adjust these numbers to add/remove space
# ============================================
HERO_SECTION_TOP = 320       # How far down from TOP the hero bg extends (measured from top, not bottom)
PAIN_SECTION_Y = 472         # Y position of "SOUND FAMILIAR?" header (from bottom)
HOW_SECTION_Y = 310          # Y position of "HOW PIPELINE WORKS" card bottom edge (from bottom)
BENEFITS_SECTION_Y = 205     # Y position of "WHAT YOU GET" header (from bottom)
CTA_SECTION_Y = 85           # Y position of CTA card bottom edge (from bottom)


def draw_flyer():
    c = canvas.Canvas(OUTPUT_FILE, pagesize=letter)  # Create a new PDF file with letter dimensions
    w, h = letter                                     # w=612 (width), h=792 (height) in points

    # ============================================
    # BACKGROUND - Full page base layer
    # Everything else draws ON TOP of this
    # ============================================
    c.setFillColor(NAVY)                              # Set fill color to dark navy for next shape
    c.rect(0, 0, w, h, fill=1, stroke=0)              # rect(x=0, y=0, width=full page, height=full page) - fills entire page navy | fill=1 means color it in | stroke=0 means no border outline

    # Top accent bar - thin teal strip across very top of page
    c.setFillColor(TEAL)                              # Switch fill color to teal for accent bar
    c.rect(0, h - 8, w, 8, fill=1, stroke=0)          # rect(x=0, y=784, width=612, height=8) - starts 8pts from top, stretches full width | this creates the thin teal line at the very top

    # Hero section background - slightly lighter navy rectangle behind headline area
    c.setFillColor(NAVY_LIGHT)                        # Slightly lighter navy to differentiate hero zone from rest of page
    c.rect(0, h - HERO_SECTION_TOP, w, HERO_SECTION_TOP - 8, fill=1, stroke=0)  # rect(x=0, y=472, width=612, height=312) - starts below teal bar, extends down 320pts | the "- 8" avoids overlapping the teal top bar

    # Diagonal accent line - decorative angled line for visual texture
    c.setStrokeColor(ACCENT_LINE)                     # Set LINE color (not fill) to subtle blue
    c.setLineWidth(80)                                # Make the line 80pts thick - this creates a wide diagonal band, not a thin line
    c.line(-50, h - 180, w + 50, h - HERO_SECTION_TOP)  # line(x1=-50, y1=612, x2=662, y2=472) - draws from upper-left area to lower-right | extends past page edges (-50 and w+50) so it bleeds off both sides cleanly

    # ============================================
    # TOP BAR - Company info text at top of page
    # ============================================
    c.setFillColor(TEXT_MUTED)                        # Set text color to muted blue-gray (not white, keeps it subtle)
    c.setFont("Helvetica", 8.5)                       # Helvetica font at 8.5pt - small but readable for company info
    c.drawString(40, h - 30, TOP_BAR_TEXT)             # drawString(x=40, y=762) - 40pts from left edge, 30pts from top | this is the "TRUE NORTH DATA STRATEGIES | SBA-Certified..." line

    # ============================================
    # HERO SECTION - Main headline and tagline
    # ============================================

    # "PIPELINE" headline - biggest text on the page
    c.setFillColor(WHITE)                             # White text for maximum contrast on dark bg
    c.setFont("Helvetica-Bold", 62)                   # Bold Helvetica at 62pt - this is the dominant visual element
    c.drawString(40, h - 105, HEADLINE)                # drawString(x=40, y=687) - 40pts from left, 105pts from top | the y value controls vertical position of text baseline

    # Teal underline accent - short colored bar under "PIPELINE"
    c.setFillColor(TEAL)                              # Teal color for the accent bar
    c.rect(40, h - 115, 200, 4, fill=1, stroke=0)     # rect(x=40, y=677, width=200, height=4) - 200pts wide, 4pts tall | sits just below the headline text | change 200 to make it wider/narrower

    # Tagline line 1 - lighter weight
    c.setFillColor(TEXT_LIGHT)                        # Light blue-white for the first tagline (less emphasis than headline)
    c.setFont("Helvetica", 16)                        # Regular weight Helvetica at 16pt
    c.drawString(40, h - 148, TAGLINE_1)               # drawString(x=40, y=644) - "Your business already has the answers."

    # Tagline line 2 - bold for emphasis
    c.setFillColor(WHITE)                             # Full white to make this line pop
    c.setFont("Helvetica-Bold", 16)                   # Bold at same size - creates visual contrast with line above
    c.drawString(40, h - 170, TAGLINE_2)               # drawString(x=40, y=622) - "Pipeline connects them." | 22pts below first tagline (170-148=22)

    # Hero body paragraph - the longer description text
    style_hero = ParagraphStyle(                      # Create a reusable style object for the paragraph
        'hero',                                       # Internal name for this style (can be anything)
        fontName='Helvetica',                         # Font face
        fontSize=11.5,                                # Font size in points
        leading=17,                                   # Line spacing (distance between baselines) - larger than fontSize means more space between lines
        textColor=TEXT_MUTED,                         # Muted color keeps body text secondary to headlines
    )
    p = Paragraph(HERO_BODY, style_hero)              # Create the paragraph object with the text and style
    pw, ph = p.wrap(w - 80, 200)                      # wrap(max_width=532, max_height=200) - calculates how tall the text block will be at 532pts wide (page width minus 40pt margins each side) | pw=actual width, ph=actual height needed
    p.drawOn(c, 40, h - 175 - ph - 10)                # drawOn(canvas, x=40, y=calculated) - positions the paragraph | h-175 is below the taglines, -ph accounts for paragraph height, -10 adds padding

    # Stat callout - big number on the right side of hero section
    c.setFillColor(TEAL)                              # Teal for the big number
    c.setFont("Helvetica-Bold", 48)                   # 48pt bold - large eye-catching stat
    c.drawRightString(w - 40, h - 260, STAT_NUMBER)   # drawRightString(x=572, y=532) - RIGHT-ALIGNS text so "5+" ends 40pts from right edge

    c.setFillColor(TEXT_MUTED)                        # Muted color for the description under the stat
    c.setFont("Helvetica", 11)                        # 11pt regular weight
    c.drawRightString(w - 40, h - 278, STAT_LINE_1)   # drawRightString(x=572, y=514) - "apps checked before one" | right-aligned to match number above
    c.drawRightString(w - 40, h - 292, STAT_LINE_2)   # drawRightString(x=572, y=500) - "question gets answered" | 14pts below first line

    # ============================================
    # PAIN POINTS - Three columns side by side
    # ============================================
    c.setFillColor(TEAL)                              # Teal for section header
    c.setFont("Helvetica-Bold", 11)                   # 11pt bold for section label
    c.drawString(40, PAIN_SECTION_Y, "SOUND FAMILIAR?")  # drawString(x=40, y=472) - positioned using LAYOUT variable

    col_w = (w - 120) / 3                             # Column width: (612 - 120) / 3 = ~164pts each | 120 = 40 left margin + 40 right margin + 2x20 gutters between columns
    col_y = PAIN_SECTION_Y - 30                       # Content starts 30pts below "SOUND FAMILIAR?" header

    style_ptitle = ParagraphStyle('ptitle', fontName='Helvetica-Bold', fontSize=11, leading=14, textColor=WHITE)
    style_pbody = ParagraphStyle('pbody', fontName='Helvetica', fontSize=9.5, leading=13, textColor=TEXT_MUTED)

    for i, (title, body) in enumerate(PAIN_POINTS):   # Loop through 3 pain points, i = 0, 1, 2
        x = 40 + i * (col_w + 20)                     # X for each column: i=0 -> x=40, i=1 -> x=224, i=2 -> x=408

        c.setFillColor(TEAL)                          # Teal fill for the bullet dot
        c.circle(x + 6, col_y + 4, 4, fill=1, stroke=0)  # circle(cx, cy, r=4) - 8px diameter dot | fill=1 solid fill | stroke=0 no outline ring

        pt = Paragraph(title, style_ptitle)           # Title paragraph
        ptw, pth = pt.wrap(col_w - 10, 100)           # Wrap to column width minus 10 (room for dot)
        pt.drawOn(c, x + 18, col_y - pth + 8)         # Draw indented past the dot

        pb = Paragraph(body, style_pbody)             # Body paragraph
        pbw, pbh = pb.wrap(col_w, 100)                # Wrap to full column width
        pb.drawOn(c, x, col_y - pth - pbh + 2)        # Draw below title

    # ============================================
    # HOW IT WORKS - Card with 3 numbered steps
    # ============================================
    card_h = 130                                      # Card height in points - increase to make card taller
    c.setFillColor(NAVY_CARD)                         # Dark card bg creates visual separation from page
    c.roundRect(30, HOW_SECTION_Y, w - 60, card_h, 8, fill=1, stroke=0)  # roundRect(x=30, y=310, w=552, h=130, radius=8) | 30pt side margins | 8pt corner rounding

    c.setFillColor(TEAL)                              # Teal header text
    c.setFont("Helvetica-Bold", 11)
    c.drawString(50, HOW_SECTION_Y + card_h - 22, "HOW PIPELINE WORKS")  # 22pts down from top of card

    style_step = ParagraphStyle('step', fontName='Helvetica', fontSize=9.5, leading=13, textColor=TEXT_MUTED)

    step_y = HOW_SECTION_Y + card_h - 52              # First step starts 52pts from card top
    for num, title, desc in STEPS:
        c.setFillColor(TEAL)
        c.setFont("Helvetica-Bold", 18)               # Large bold number
        c.drawString(50, step_y, num)                  # "01" at x=50

        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 11)               # Bold title next to number
        c.drawString(85, step_y, title)                # "Connect" at x=85, right of number

        ps = Paragraph(desc, style_step)
        psw, psh = ps.wrap(w - 160, 50)               # Wrap width = 612 - 160 = 452pts
        ps.drawOn(c, 85, step_y - psh - 1)            # Draw description below title

        step_y -= 34                                  # 34pt spacing between steps - adjust for tighter/looser

    # ============================================
    # WHAT YOU GET - Benefits bullet list
    # ============================================
    c.setFillColor(TEAL)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(40, BENEFITS_SECTION_Y, "WHAT YOU GET")  # Section header at y=205

    style_benefit = ParagraphStyle('benefit', fontName='Helvetica', fontSize=10, leading=14, textColor=TEXT_LIGHT)

    ben_y = BENEFITS_SECTION_Y - 18                   # First benefit 18pts below header
    for b in BENEFITS:
        c.setFillColor(TEAL)
        c.setFont("Helvetica-Bold", 12)
        c.drawString(50, ben_y + 1, "\u2014")          # Em dash character at x=50 | \u2014 is the unicode em dash

        pb = Paragraph(b, style_benefit)
        pbw, pbh = pb.wrap(w - 130, 40)               # 612 - 130 = 482pt wrap width
        pb.drawOn(c, 75, ben_y - 2)                    # Text at x=75, right of dash

        ben_y -= 18                                   # 18pt between benefits - adjust for spacing

    # ============================================
    # CTA - Call to action card (teal background)
    # ============================================
    cta_card_h = 65                                   # CTA card height
    c.setFillColor(TEAL)                              # Teal bg makes CTA stand out from everything else
    c.roundRect(30, CTA_SECTION_Y, w - 60, cta_card_h, 8, fill=1, stroke=0)  # Same margins/rounding as HOW card

    c.setFillColor(WHITE)                             # White on teal for CTA headline
    c.setFont("Helvetica-Bold", 16)
    c.drawCentredString(w / 2, CTA_SECTION_Y + cta_card_h - 22, CTA_HEADLINE)  # Centered on page, 22pts inside card top

    c.setFont("Helvetica", 11)
    c.setFillColor(HexColor('#d4eaf7'))               # Light blue - slightly softer than white
    c.drawCentredString(w / 2, CTA_SECTION_Y + cta_card_h - 42, CTA_CONTACT)  # 20pts below headline

    c.setFont("Helvetica", 9)                         # Smallest CTA text
    c.setFillColor(HexColor('#b0d4e8'))               # Even more muted
    c.drawCentredString(w / 2, CTA_SECTION_Y + cta_card_h - 56, CTA_WEBSITE)  # 14pts below contact

    # ============================================
    # FOOTER - Bottom bar with legal text
    # ============================================
    c.setFillColor(NAVY_DARK)                         # Darkest shade for footer bar
    c.rect(0, 0, w, 40, fill=1, stroke=0)              # rect(x=0, y=0, w=612, h=40) - 40pt tall bar at absolute bottom of page

    c.setFillColor(TEXT_SUBTLE)                       # Subtle gray for legal text
    c.setFont("Helvetica", 7.5)                       # 7.5pt - smallest on page
    c.drawString(40, 18, FOOTER_LEFT)                  # Left-aligned at x=40, y=18 (centered in 40pt bar)
    c.drawRightString(w - 40, 18, FOOTER_RIGHT)        # Right-aligned copyright at x=572

    # Bottom accent bar - mirrors the teal strip at top
    c.setFillColor(TEAL)
    c.rect(0, 0, w, 4, fill=1, stroke=0)               # 4pt teal strip at very bottom | draws OVER footer bar since it comes after in draw order

    c.save()                                          # Writes everything to the PDF file and closes it
    print(f"Flyer created: {OUTPUT_FILE}")


if __name__ == "__main__":                            # Only runs when you execute this file directly
    draw_flyer()

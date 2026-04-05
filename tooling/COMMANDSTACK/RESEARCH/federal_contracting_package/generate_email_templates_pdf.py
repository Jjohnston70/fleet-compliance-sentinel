#!/usr/bin/env python3
"""
Email Templates PDF Generator for True North Data Strategies LLC
Generates professional federal outreach email templates
"""

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.enums import TA_LEFT, TA_JUSTIFY

# Brand Colors
NAVY = colors.HexColor('#0A1A3D')
TEAL = colors.HexColor('#0BA6A3')
LIGHT_GRAY = colors.HexColor('#CCCCCC')
DARK_GRAY = colors.HexColor('#333333')

def create_email_styles():
    """Create custom styles for email templates"""
    styles = getSampleStyleSheet()
    
    # Title style
    styles.add(ParagraphStyle(
        name='EmailTitle',
        parent=styles['Title'],
        fontSize=20,
        textColor=NAVY,
        spaceAfter=12,
        fontName='Helvetica-Bold'
    ))
    
    # Section header
    styles.add(ParagraphStyle(
        name='EmailSection',
        parent=styles['Heading1'],
        fontSize=16,
        textColor=NAVY,
        spaceAfter=12,
        spaceBefore=12,
        fontName='Helvetica-Bold'
    ))
    
    # Email header
    styles.add(ParagraphStyle(
        name='EmailHeader',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=TEAL,
        spaceAfter=8,
        spaceBefore=16,
        fontName='Helvetica-Bold'
    ))
    
    # Subject line
    styles.add(ParagraphStyle(
        name='SubjectLine',
        parent=styles['Normal'],
        fontSize=12,
        textColor=DARK_GRAY,
        fontName='Helvetica-Bold',
        spaceAfter=8
    ))
    
    # Email body
    styles.add(ParagraphStyle(
        name='EmailBody',
        parent=styles['Normal'],
        fontSize=11,
        textColor=DARK_GRAY,
        alignment=TA_LEFT,
        spaceAfter=6,
        leading=14
    ))
    
    return styles

def create_header_block(title):
    """Create a consistent header block"""
    styles = create_email_styles()
    elements = []
    
    # Blue header bar simulation
    elements.append(Paragraph(f'<font color="white" bgcolor="{NAVY}">  {title}  </font>', 
                            ParagraphStyle('HeaderBar', fontSize=16, textColor=colors.white,
                                         fontName='Helvetica-Bold', spaceAfter=20)))
    return elements

def create_email_templates_pdf(output_dir):
    """Generate the comprehensive email templates PDF"""
    filename = f"{output_dir}/federal_email_templates.pdf"
    doc = SimpleDocTemplate(filename, pagesize=letter,
                          topMargin=0.75*inch, bottomMargin=0.75*inch,
                          leftMargin=1*inch, rightMargin=1*inch)
    
    styles = create_email_styles()
    story = []
    
    # Title Page
    story.append(Spacer(1, 1.5*inch))
    story.append(Paragraph("Federal Outreach Email Templates", styles['EmailTitle']))
    story.append(Spacer(1, 0.3*inch))
    story.append(Paragraph("True North Data Strategies LLC", styles['EmailSection']))
    story.append(Spacer(1, 0.5*inch))
    story.append(Paragraph(
        "Professional email templates for federal contracting outreach<br/>"
        "Designed for contracting officers, OSDBU specialists, and prime contractors",
        ParagraphStyle('Subtitle', fontSize=12, textColor=DARK_GRAY, alignment=1)
    ))
    story.append(PageBreak())
    
    # Table of Contents
    story.append(Paragraph("TABLE OF CONTENTS", styles['EmailSection']))
    story.append(Spacer(1, 0.3*inch))
    
    toc_items = [
        "1. Introduction to Contracting Officer",
        "2. Micro-Purchase/Purchase Card Holder Introduction", 
        "3. OSDBU Specialist Introduction",
        "4. Prime Contractor Subcontracting Introduction",
        "5. Follow-Up Email Templates",
        "6. Phone Scripts",
        "7. Best Practices & Tips"
    ]
    
    for item in toc_items:
        story.append(Paragraph(item, styles['EmailBody']))
        story.append(Spacer(1, 0.1*inch))
    
    story.append(PageBreak())
    
    # Email 1: Introduction to Contracting Officer
    story.append(Paragraph("1. INTRODUCTION TO CONTRACTING OFFICER", styles['EmailSection']))
    story.append(Spacer(1, 0.2*inch))
    
    story.append(Paragraph("<b>Subject:</b> SDVOSB Capability Introduction – True North Data Strategies LLC", 
                          styles['SubjectLine']))
    story.append(Spacer(1, 0.1*inch))
    
    email1_body = """Hello [Name],

My name is Jacob Johnston, Owner/CEO of True North Data Strategies LLC, a Colorado-based small business specializing in workflow automation, data dashboards, systems integration, and operational process improvement. Our firm is a Service-Disabled Veteran-Owned Small Business (SDVOSB) applicant and is registered in SAM.gov under UEI/CAGE (pending activation).

I would appreciate being added to your vendor list for upcoming opportunities in NAICS 541611, 541512, and 541519. If your office has current needs for automation, dashboard development, or process improvement support, I would welcome the opportunity to discuss how we can assist.

I've attached our capabilities statement for your review.
Thank you for your time.

Respectfully,
Jacob Johnston
Owner / CEO
True North Data Strategies LLC
555-555-5555
jacob@truenorthstrategyops.com"""
    
    story.append(Paragraph(email1_body.replace('\n', '<br/>'), styles['EmailBody']))
    story.append(Spacer(1, 0.3*inch))
    
    # Email 2: Micro-Purchase Introduction
    story.append(Paragraph("2. MICRO-PURCHASE / PURCHASE CARD HOLDER INTRODUCTION", styles['EmailSection']))
    story.append(Spacer(1, 0.2*inch))
    
    story.append(Paragraph("<b>Subject:</b> Availability for Micro-Purchase Automation and Dashboard Support", 
                          styles['SubjectLine']))
    story.append(Spacer(1, 0.1*inch))
    
    email2_body = """Hello [Name],

My name is Jacob Johnston, Owner/CEO of True North Data Strategies LLC. We provide small-scale workflow automation, dashboard development, process support, and technical fixes that fit within micro-purchase thresholds.

If your office needs assistance with a one-time repair, system cleanup, workflow improvement, or data/reporting task, we can support quickly and remotely.

I've attached our capabilities statement, and I am available for same-week delivery on micro-purchase tasks.

Thank you for your consideration.
Jacob Johnston
Owner / CEO
True North Data Strategies LLC
555-555-5555
jacob@truenorthstrategyops.com"""
    
    story.append(Paragraph(email2_body.replace('\n', '<br/>'), styles['EmailBody']))
    
    story.append(PageBreak())
    
    # Email 3: OSDBU Specialist Introduction
    story.append(Paragraph("3. OSDBU SPECIALIST INTRODUCTION", styles['EmailSection']))
    story.append(Spacer(1, 0.2*inch))
    
    story.append(Paragraph("<b>Subject:</b> SDVOSB Vendor Introduction – True North Data Strategies LLC", 
                          styles['SubjectLine']))
    story.append(Spacer(1, 0.1*inch))
    
    email3_body = """Hello [Name],

I am reaching out to introduce True North Data Strategies LLC as a new SDVOSB applicant specializing in workflow automation, dashboards, system integration, and operational consulting.

If possible, I would appreciate:
1. Confirmation that I am listed correctly in your vendor database
2. Any upcoming outreach sessions, matchmaking events, or small business opportunities relevant to my NAICS codes
3. Guidance on opportunities within your agency where SDVOSBs are actively sourced

Capabilities statement attached.
Thank you for your time and support.

Respectfully,
Jacob Johnston
Owner / CEO
True North Data Strategies LLC
555-555-5555
jacob@truenorthstrategyops.com"""
    
    story.append(Paragraph(email3_body.replace('\n', '<br/>'), styles['EmailBody']))
    story.append(Spacer(1, 0.3*inch))
    
    # Email 4: Prime Contractor Subcontracting
    story.append(Paragraph("4. PRIME CONTRACTOR SUBCONTRACTING INTRODUCTION", styles['EmailSection']))
    story.append(Spacer(1, 0.2*inch))
    
    story.append(Paragraph("<b>Subject:</b> SDVOSB Subcontracting Capability – True North Data Strategies LLC", 
                          styles['SubjectLine']))
    story.append(Spacer(1, 0.1*inch))
    
    email4_body = """Hello [Name],

I am contacting you regarding SDVOSB subcontracting opportunities. My firm, True North Data Strategies LLC, provides automation engineering, dashboards, data workflows, cloud integration, and process improvement support.

We are available for subcontracting on existing federal programs and would appreciate being added to your SDVOSB database for future teaming discussions.

Attached is our capabilities statement for review.
I welcome the opportunity to discuss alignment with your current or upcoming contracts.

Regards,
Jacob Johnston
Owner / CEO
True North Data Strategies LLC
555-555-5555
jacob@truenorthstrategyops.com"""
    
    story.append(Paragraph(email4_body.replace('\n', '<br/>'), styles['EmailBody']))
    
    story.append(PageBreak())
    
    # Email 5: Follow-Up Templates
    story.append(Paragraph("5. FOLLOW-UP EMAIL TEMPLATES", styles['EmailSection']))
    story.append(Spacer(1, 0.2*inch))
    
    # First Follow-Up
    story.append(Paragraph("<b>First Follow-Up (5-7 days)</b>", styles['EmailHeader']))
    story.append(Paragraph("<b>Subject:</b> Follow-Up: SDVOSB Capability Introduction", styles['SubjectLine']))
    
    followup1_body = """Hello [Name],

Following up on my previous message regarding True North Data Strategies LLC. We provide automation, dashboard development, and operational consulting services and would appreciate being included in future procurement considerations within your office.

Please let me know if additional information would be helpful.
I would be glad to schedule a brief introductory call.

Thank you,
Jacob Johnston
Owner / CEO
True North Data Strategies LLC"""
    
    story.append(Paragraph(followup1_body.replace('\n', '<br/>'), styles['EmailBody']))
    story.append(Spacer(1, 0.3*inch))
    
    # Second Follow-Up
    story.append(Paragraph("<b>Second Follow-Up (14 days)</b>", styles['EmailHeader']))
    story.append(Paragraph("<b>Subject:</b> Quick Check-In: Technical Support Availability", styles['SubjectLine']))
    
    followup2_body = """Hello [Name],

I wanted to ensure you received our capability information for True North Data Strategies LLC. 

We remain available for micro-purchase automation tasks, dashboard development, and technical support that can be delivered quickly without complex procurement processes.

If there's a better contact for these opportunities, I would appreciate the referral.

Best regards,
Jacob Johnston
True North Data Strategies LLC"""
    
    story.append(Paragraph(followup2_body.replace('\n', '<br/>'), styles['EmailBody']))
    
    story.append(PageBreak())
    
    # Phone Scripts Section
    story.append(Paragraph("6. PHONE SCRIPTS", styles['EmailSection']))
    story.append(Spacer(1, 0.2*inch))
    
    story.append(Paragraph("<b>Contracting Officer Cold Call</b>", styles['EmailHeader']))
    phone_script1 = """Opening:
"Hello, this is Jacob Johnston with True North Data Strategies LLC. I'm calling to verify that your office received our capabilities statement for workflow automation and dashboard support. Do you have a moment?"

If Yes:
"Thank you. We're a Service-Disabled Veteran-Owned Small Business specializing in automation that fits within simplified acquisition and micro-purchase thresholds. I wanted to ensure we're properly registered in your vendor database for upcoming opportunities. May I confirm the best email to send our updated capabilities?"

If No/Busy:
"I understand. When would be a better time to call back? Or would you prefer I send our information via email?"

Closing:
"I appreciate your time. Our capabilities statement includes our NAICS codes and past performance. Thank you for supporting small business."
"""
    story.append(Paragraph(phone_script1.replace('\n', '<br/>'), styles['EmailBody']))
    story.append(Spacer(1, 0.3*inch))
    
    story.append(Paragraph("<b>Purchase Card Holder Call</b>", styles['EmailHeader']))
    phone_script2 = """Opening:
"Hello [Name], this is Jacob Johnston with True North Data Strategies LLC. I understand you handle purchase card transactions for [office/division]. I'm calling about our micro-purchase technical support services."

Main Points:
• We specialize in quick-turnaround automation and fixes under $10,000
• Most tasks completed within 3-5 days
• No complex procurement needed
• SDVOSB certified (pending)

Ask:
"Do you currently have any small technical tasks or workflow improvements that need attention? I can send you a one-page summary of common micro-purchase projects we handle."
"""
    story.append(Paragraph(phone_script2.replace('\n', '<br/>'), styles['EmailBody']))
    
    story.append(PageBreak())
    
    # Best Practices Section
    story.append(Paragraph("7. BEST PRACTICES & TIPS", styles['EmailSection']))
    story.append(Spacer(1, 0.2*inch))
    
    story.append(Paragraph("<b>Email Outreach Best Practices</b>", styles['EmailHeader']))
    practices = [
        "• Always attach your capabilities statement as a PDF",
        "• Keep subject lines under 50 characters",
        "• Send emails Tuesday-Thursday, 9-11 AM recipient's time",
        "• Use the recipient's name if known; otherwise use title",
        "• Keep initial emails under 150 words",
        "• Include your NAICS codes in the first email",
        "• Reference your SDVOSB status early",
        "• One clear call-to-action per email",
        "• Follow up exactly once per week for 3 weeks maximum"
    ]
    
    for practice in practices:
        story.append(Paragraph(practice, styles['EmailBody']))
    
    story.append(Spacer(1, 0.3*inch))
    
    story.append(Paragraph("<b>Federal Email Etiquette</b>", styles['EmailHeader']))
    etiquette = [
        "• Use 'Respectfully' or 'Very respectfully' for military/veteran recipients",
        "• 'Regards' or 'Best regards' for civilian recipients",
        "• No emojis, exclamation points, or casual language",
        "• Spell out acronyms on first use",
        "• Include full signature block with title and contact info",
        "• If replying to RFI/Sources Sought, follow their format exactly"
    ]
    
    for rule in etiquette:
        story.append(Paragraph(rule, styles['EmailBody']))
    
    story.append(Spacer(1, 0.3*inch))
    
    story.append(Paragraph("<b>Tracking Your Outreach</b>", styles['EmailHeader']))
    story.append(Paragraph(
        "Maintain a spreadsheet tracking:<br/>"
        "• Contact name and agency<br/>"
        "• Email sent date<br/>"
        "• Follow-up dates<br/>"
        "• Response received (Y/N)<br/>"
        "• Next action required<br/>"
        "• Opportunity pipeline value",
        styles['EmailBody']
    ))
    
    # Build the PDF
    doc.build(story)
    return filename

# Run the generator
if __name__ == "__main__":
    output_dir = "/home/claude/federal_contracting/pdfs"
    filename = create_email_templates_pdf(output_dir)
    print(f"Created: {filename}")

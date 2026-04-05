#!/usr/bin/env python3
"""
Federal Contracting PDF Package Generator for True North Data Strategies LLC
Generates a complete suite of branded federal contracting documents
"""

import os
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image, KeepTogether
from reportlab.pdfgen import canvas
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from datetime import datetime

# Brand Colors
NAVY = colors.HexColor('#0A1A3D')
TEAL = colors.HexColor('#0BA6A3')
LIGHT_GRAY = colors.HexColor('#CCCCCC')
DARK_GRAY = colors.HexColor('#333333')
WHITE = colors.white
BLACK = colors.black

# Company Information
COMPANY_INFO = {
    'name': 'True North Data Strategies LLC',
    'owner': 'Jacob Johnston',
    'title': 'Owner/CEO',
    'address': '123 Example St',
    'city_state_zip': 'Colorado Springs, CO 80909',
    'phone': '555-555-5555',
    'email': 'jacob@truenorthstrategyops.com',
    'website': 'www.truenorthstrategyops.com',
    'cage': 'Pending',
    'uei': 'Pending',
    'primary_naics': '541611',
    'additional_naics': ['541512', '541519', '518210', '541613', '611420', '541430'],
    'business_type': 'Small Business, SDVOSB (Pending), VOSB (Pending)'
}

class NumberedCanvas(canvas.Canvas):
    """Canvas with page numbers and consistent headers/footers"""
    def __init__(self, *args, **kwargs):
        canvas.Canvas.__init__(self, *args, **kwargs)
        self.pages = []
        self.width, self.height = letter
        
    def showPage(self):
        self.pages.append(dict(self.__dict__))
        self._startPage()
        
    def save(self):
        page_count = len(self.pages)
        for page in self.pages:
            self.__dict__.update(page)
            self.draw_page_number(page_count)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)
        
    def draw_page_number(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(DARK_GRAY)
        if self._pageNumber > 1:  # Don't number the first page
            self.drawRightString(
                self.width - 0.5*inch,
                0.5*inch,
                f"Page {self._pageNumber} of {page_count}"
            )
        self.restoreState()

def create_custom_styles():
    """Create custom paragraph styles with True North branding"""
    styles = getSampleStyleSheet()
    
    # Title style
    styles.add(ParagraphStyle(
        name='CustomTitle',
        parent=styles['Title'],
        fontSize=24,
        textColor=NAVY,
        spaceAfter=12,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    ))
    
    # Subtitle style
    styles.add(ParagraphStyle(
        name='CustomSubtitle',
        parent=styles['Normal'],
        fontSize=16,
        textColor=TEAL,
        spaceAfter=12,
        alignment=TA_CENTER,
        fontName='Helvetica'
    ))
    
    # Heading1 style
    styles.add(ParagraphStyle(
        name='CustomHeading1',
        parent=styles['Heading1'],
        fontSize=16,
        textColor=NAVY,
        spaceAfter=12,
        spaceBefore=12,
        fontName='Helvetica-Bold'
    ))
    
    # Heading2 style
    styles.add(ParagraphStyle(
        name='CustomHeading2',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=TEAL,
        spaceAfter=8,
        spaceBefore=8,
        fontName='Helvetica-Bold'
    ))
    
    # Normal text
    styles.add(ParagraphStyle(
        name='CustomNormal',
        parent=styles['Normal'],
        fontSize=11,
        textColor=DARK_GRAY,
        alignment=TA_JUSTIFY,
        spaceAfter=6,
        leading=14
    ))
    
    # Bullet style
    styles.add(ParagraphStyle(
        name='CustomBullet',
        parent=styles['Normal'],
        fontSize=11,
        textColor=DARK_GRAY,
        leftIndent=20,
        bulletIndent=10,
        spaceAfter=4,
        leading=14
    ))
    
    return styles

def create_header_table(doc_title, bw_version=False):
    """Create a consistent header table for all documents"""
    if bw_version:
        header_color = LIGHT_GRAY
        text_color = BLACK
    else:
        header_color = NAVY
        text_color = WHITE
    
    header_data = [
        [Paragraph(f'<font color="{"black" if bw_version else "white"}" size="14"><b>True North Data Strategies LLC</b></font>', 
                  getSampleStyleSheet()['Normal']),
         Paragraph(f'<font color="{"black" if bw_version else "white"}" size="12">{doc_title}</font>', 
                  getSampleStyleSheet()['Normal'])]
    ]
    
    header_table = Table(header_data, colWidths=[4*inch, 3*inch])
    header_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), header_color),
        ('TEXTCOLOR', (0, 0), (-1, -1), text_color),
        ('ALIGN', (0, 0), (0, 0), 'LEFT'),
        ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('FONTSIZE', (0, 0), (-1, -1), 12),
        ('TOPPADDING', (0, 0), (-1, -1), 12),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 12),
    ]))
    
    return header_table

def create_capabilities_statement(output_dir, bw_version=False):
    """Create the Capabilities Statement PDF"""
    filename = f"{output_dir}/capabilities_statement_{'bw' if bw_version else 'color'}.pdf"
    doc = SimpleDocTemplate(filename, pagesize=letter,
                          topMargin=0.5*inch, bottomMargin=0.5*inch,
                          leftMargin=0.75*inch, rightMargin=0.75*inch)
    
    styles = create_custom_styles()
    story = []
    
    # Header
    story.append(create_header_table("Capabilities Statement", bw_version))
    story.append(Spacer(1, 0.3*inch))
    
    # Core Competencies Section
    story.append(Paragraph("CORE COMPETENCIES", styles['CustomHeading1']))
    
    competencies = [
        "• Workflow Automation & Process Optimization",
        "• Executive Dashboards & Data Visualization",
        "• Google Workspace & Cloud Integration",
        "• API Development & Systems Integration",
        "• Business Process Documentation & Training",
        "• Python, Apps Script & Modern Web Development"
    ]
    
    for comp in competencies:
        story.append(Paragraph(comp, styles['CustomBullet']))
    
    story.append(Spacer(1, 0.2*inch))
    
    # Past Performance
    story.append(Paragraph("PAST PERFORMANCE", styles['CustomHeading1']))
    story.append(Paragraph(
        "• Automated supplier email processing, saving 20+ hours/week<br/>"
        "• Built executive dashboards tracking $2M+ monthly fuel operations<br/>"
        "• Developed fleet lifecycle management reducing equipment downtime 30%<br/>"
        "• Created compliance tracking systems with 100% audit success rate<br/>"
        "• Implemented document automation eliminating 15+ hours weekly manual work",
        styles['CustomBullet']
    ))
    
    story.append(Spacer(1, 0.2*inch))
    
    # Differentiators
    story.append(Paragraph("DIFFERENTIATORS", styles['CustomHeading1']))
    story.append(Paragraph(
        "• Rapid deployment: Working solutions in days, not months<br/>"
        "• No vendor lock-in: Solutions built on your existing platforms<br/>"
        "• Military precision: 16+ years Airborne Infantry leadership experience<br/>"
        "• Self-sustaining systems: Full documentation and training included<br/>"
        "• Cost-effective: Enterprise-grade automation at small business prices",
        styles['CustomBullet']
    ))
    
    story.append(Spacer(1, 0.2*inch))
    
    # Company Information Table
    company_data = [
        ['COMPANY INFORMATION', ''],
        ['Company Name:', COMPANY_INFO['name']],
        ['CAGE Code:', COMPANY_INFO['cage']],
        ['UEI:', COMPANY_INFO['uei']],
        ['Primary NAICS:', f"{COMPANY_INFO['primary_naics']} - Administrative Management and General Management Consulting Services"],
        ['Business Type:', COMPANY_INFO['business_type']],
        ['POC:', f"{COMPANY_INFO['owner']}, {COMPANY_INFO['title']}"],
        ['Phone:', COMPANY_INFO['phone']],
        ['Email:', COMPANY_INFO['email']],
        ['Address:', f"{COMPANY_INFO['address']}, {COMPANY_INFO['city_state_zip']}"]
    ]
    
    company_table = Table(company_data, colWidths=[2*inch, 4.5*inch])
    company_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), TEAL if not bw_version else LIGHT_GRAY),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE if not bw_version else BLACK),
        ('SPAN', (0, 0), (1, 0)),
        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
        ('ALIGN', (0, 1), (0, -1), 'RIGHT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, LIGHT_GRAY),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    
    story.append(company_table)
    
    # Build PDF
    doc.build(story, canvasmaker=NumberedCanvas)
    return filename

def create_dsbs_profile(output_dir):
    """Create DSBS Profile Sheet"""
    filename = f"{output_dir}/dsbs_profile_sheet.pdf"
    doc = SimpleDocTemplate(filename, pagesize=letter,
                          topMargin=0.5*inch, bottomMargin=0.5*inch,
                          leftMargin=0.75*inch, rightMargin=0.75*inch)
    
    styles = create_custom_styles()
    story = []
    
    # Header
    story.append(create_header_table("Dynamic Small Business Search (DSBS) Profile"))
    story.append(Spacer(1, 0.3*inch))
    
    # Profile Content
    story.append(Paragraph("COMPANY OVERVIEW", styles['CustomHeading1']))
    story.append(Paragraph(
        "True North Data Strategies LLC provides workflow automation, data dashboards, cloud integration, "
        "systems design, and operational consulting for federal program offices seeking efficiency, accuracy, "
        "and mission-aligned modernization. The firm specializes in Google Workspace automation, Apps Script, "
        "Python development, Streamlit dashboards, Firebase environments, GCP deployments, API integrations, "
        "business process improvement, documentation, training, and decision-support systems.",
        styles['CustomNormal']
    ))
    
    story.append(Spacer(1, 0.2*inch))
    
    story.append(Paragraph(
        "True North builds modular, reliable, straightforward solutions that reduce manual workload and improve "
        "operational clarity. With a background in operations, logistics, data support, and workflow management, "
        "the Owner/CEO brings practical experience supporting organizations that require dependable execution "
        "and measurable results.",
        styles['CustomNormal']
    ))
    
    story.append(Spacer(1, 0.3*inch))
    
    # NAICS Codes Section
    story.append(Paragraph("NAICS CODES & CAPABILITIES", styles['CustomHeading1']))
    
    naics_data = [
        ['NAICS Code', 'Description', 'Size Standard'],
        ['541611', 'Administrative Management and General Management Consulting Services', '$16.5M'],
        ['541512', 'Computer Systems Design Services', '$30.0M'],
        ['541519', 'Other Computer Related Services', '$30.0M'],
        ['518210', 'Data Processing, Hosting, and Related Services', '$35.0M'],
        ['541613', 'Marketing Consulting Services', '$16.5M'],
        ['611420', 'Computer Training', '$12.0M'],
        ['541430', 'Graphic Design Services', '$8.0M']
    ]
    
    naics_table = Table(naics_data, colWidths=[1.2*inch, 4*inch, 1.2*inch])
    naics_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), NAVY),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 11),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 0.5, LIGHT_GRAY),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    
    story.append(naics_table)
    
    story.append(Spacer(1, 0.3*inch))
    
    # Keywords Section
    story.append(Paragraph("KEYWORDS FOR SEARCH", styles['CustomHeading1']))
    story.append(Paragraph(
        "automation, workflow, dashboard, data visualization, Google Workspace, Apps Script, Python, API integration, "
        "systems integration, process improvement, digital transformation, cloud migration, Firebase, GCP, Streamlit, "
        "operational efficiency, decision support, business intelligence, reporting automation, documentation, training, "
        "SDVOSB, veteran-owned, small business",
        styles['CustomNormal']
    ))
    
    # Build PDF
    doc.build(story)
    return filename

def create_elevator_pitch(output_dir):
    """Create Federal Elevator Pitch Sheet"""
    filename = f"{output_dir}/federal_elevator_pitch.pdf"
    doc = SimpleDocTemplate(filename, pagesize=letter,
                          topMargin=0.5*inch, bottomMargin=0.5*inch,
                          leftMargin=0.75*inch, rightMargin=0.75*inch)
    
    styles = create_custom_styles()
    story = []
    
    # Header
    story.append(create_header_table("Federal Elevator Pitch"))
    story.append(Spacer(1, 0.5*inch))
    
    # Title
    story.append(Paragraph("Your Mission-Critical Operations Deserve Better Than Manual Processes", 
                          styles['CustomTitle']))
    story.append(Spacer(1, 0.3*inch))
    
    # Main Pitch
    story.append(Paragraph("WHO WE ARE", styles['CustomHeading1']))
    story.append(Paragraph(
        "True North Data Strategies LLC delivers automation, dashboards, systems integration, and operational "
        "consulting to help federal agencies streamline processes and improve decision-making. The company focuses "
        "on reliability, clarity, and rapid deployment, using modern cloud tools to solve real operational challenges.",
        styles['CustomNormal']
    ))
    
    story.append(Spacer(1, 0.3*inch))
    
    story.append(Paragraph("WHAT WE SOLVE", styles['CustomHeading1']))
    story.append(Paragraph(
        "Federal programs rely on accurate information, consistent workflows, and technology that works without "
        "unnecessary complexity. True North designs lean, modular solutions that eliminate manual steps, connect "
        "systems, and create real-time visibility for managers and frontline teams.",
        styles['CustomNormal']
    ))
    
    story.append(Spacer(1, 0.3*inch))
    
    story.append(Paragraph("WHY CHOOSE US", styles['CustomHeading1']))
    story.append(Paragraph(
        "As a Service-Disabled Veteran-Owned Small Business applicant based in Colorado Springs, True North is "
        "committed to supporting agency missions with practical expertise in automation engineering, workflow "
        "design, technical documentation, and data-driven operations.",
        styles['CustomNormal']
    ))
    
    story.append(Spacer(1, 0.5*inch))
    
    # Key Capabilities Box
    capabilities_data = [
        ["KEY CAPABILITIES"],
        ["✓ Workflow Automation - Eliminate manual data entry and repetitive tasks"],
        ["✓ Executive Dashboards - Real-time visibility into operations and KPIs"],
        ["✓ Systems Integration - Connect disparate systems seamlessly"],
        ["✓ Process Documentation - Clear SOPs and training materials"],
        ["✓ Rapid Deployment - Working solutions in days, not months"]
    ]
    
    cap_table = Table(capabilities_data, colWidths=[6.5*inch])
    cap_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), TEAL),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 14),
        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
        ('FONTSIZE', (0, 1), (-1, -1), 11),
        ('ALIGN', (0, 1), (-1, -1), 'LEFT'),
        ('BOX', (0, 0), (-1, -1), 1, TEAL),
        ('TOPPADDING', (0, 0), (-1, -1), 12),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('LEFTPADDING', (0, 1), (-1, -1), 20),
    ]))
    
    story.append(cap_table)
    
    story.append(Spacer(1, 0.5*inch))
    
    # Contact Information
    story.append(Paragraph("READY TO MODERNIZE YOUR OPERATIONS?", styles['CustomHeading2']))
    story.append(Paragraph(
        f"Contact: {COMPANY_INFO['owner']}, {COMPANY_INFO['title']}<br/>"
        f"Phone: {COMPANY_INFO['phone']}<br/>"
        f"Email: {COMPANY_INFO['email']}<br/>"
        f"Web: {COMPANY_INFO['website']}",
        styles['CustomNormal']
    ))
    
    # Build PDF
    doc.build(story)
    return filename

def create_landing_page(output_dir):
    """Create Company Landing Page"""
    filename = f"{output_dir}/company_landing_page.pdf"
    doc = SimpleDocTemplate(filename, pagesize=letter,
                          topMargin=0.5*inch, bottomMargin=0.5*inch,
                          leftMargin=0.75*inch, rightMargin=0.75*inch)
    
    styles = create_custom_styles()
    story = []
    
    # Header
    story.append(create_header_table("About True North Data Strategies"))
    story.append(Spacer(1, 0.5*inch))
    
    # Welcome Section
    story.append(Paragraph("Welcome to True North Data Strategies LLC", styles['CustomTitle']))
    story.append(Spacer(1, 0.3*inch))
    
    story.append(Paragraph(
        "We support federal agencies with workflow automation, dashboards, systems integration, and operational "
        "consulting designed to improve clarity, efficiency, and mission readiness.",
        styles['CustomSubtitle']
    ))
    
    story.append(Spacer(1, 0.5*inch))
    
    # Services Section
    story.append(Paragraph("OUR SERVICES", styles['CustomHeading1']))
    
    services = [
        ("Automation Engineering", "Transform manual processes into self-running systems that save time and reduce errors"),
        ("Cloud-Based Dashboards", "Real-time visibility into your operations with executive-ready visualizations"),
        ("API and System Integration", "Connect your disparate systems to create seamless data flow"),
        ("Process Improvement", "Streamline workflows and eliminate bottlenecks in your operations"),
        ("Training and Documentation", "Comprehensive guides and training to ensure your team can maintain systems"),
        ("Data Workflow Modernization", "Upgrade legacy processes with modern, scalable solutions")
    ]
    
    for service, desc in services:
        story.append(Paragraph(f"<b>{service}</b>", styles['CustomHeading2']))
        story.append(Paragraph(desc, styles['CustomNormal']))
        story.append(Spacer(1, 0.1*inch))
    
    story.append(Spacer(1, 0.3*inch))
    
    # About Section
    story.append(Paragraph("ABOUT US", styles['CustomHeading1']))
    story.append(Paragraph(
        "True North is a Service-Disabled Veteran-Owned Small Business applicant located in Colorado Springs, "
        "Colorado. We provide dependable, modular solutions that help program offices reduce manual workload "
        "and improve operational transparency.",
        styles['CustomNormal']
    ))
    
    story.append(Spacer(1, 0.3*inch))
    
    # Contact Box
    contact_data = [
        ["GET IN TOUCH"],
        [f"Contact: {COMPANY_INFO['owner']} | {COMPANY_INFO['phone']} | {COMPANY_INFO['email']}"]
    ]
    
    contact_table = Table(contact_data, colWidths=[6.5*inch])
    contact_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), NAVY),
        ('TEXTCOLOR', (0, 0), (-1, -1), WHITE),
        ('FONTNAME', (0, 0), (0, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (0, 0), 14),
        ('FONTSIZE', (0, 1), (0, 1), 11),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('TOPPADDING', (0, 0), (-1, -1), 12),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
    ]))
    
    story.append(contact_table)
    
    # Build PDF
    doc.build(story)
    return filename

def create_micropurchase_capability(output_dir):
    """Create Micro-Purchase Capability Sheet"""
    filename = f"{output_dir}/micropurchase_capability_sheet.pdf"
    doc = SimpleDocTemplate(filename, pagesize=letter,
                          topMargin=0.5*inch, bottomMargin=0.5*inch,
                          leftMargin=0.75*inch, rightMargin=0.75*inch)
    
    styles = create_custom_styles()
    story = []
    
    # Header
    story.append(create_header_table("Micro-Purchase Capability Sheet"))
    story.append(Spacer(1, 0.3*inch))
    
    # Title
    story.append(Paragraph("Quick-Turn Technical Support Under $10,000", styles['CustomTitle']))
    story.append(Spacer(1, 0.3*inch))
    
    # Introduction
    story.append(Paragraph(
        "True North Data Strategies LLC specializes in rapid-deployment automation and technical support "
        "perfectly sized for government micro-purchase thresholds. Get immediate solutions without the "
        "procurement complexity.",
        styles['CustomNormal']
    ))
    
    story.append(Spacer(1, 0.3*inch))
    
    # Common Micro-Purchase Tasks
    story.append(Paragraph("COMMON MICRO-PURCHASE TASKS WE DELIVER", styles['CustomHeading1']))
    
    tasks_data = [
        ["Task", "Typical Turnaround", "Approximate Cost"],
        ["Spreadsheet Automation", "2-3 days", "$1,500 - $3,500"],
        ["Dashboard Creation", "3-5 days", "$2,500 - $5,000"],
        ["Report Automation", "2-4 days", "$2,000 - $4,500"],
        ["API Integration", "3-5 days", "$3,000 - $6,000"],
        ["Process Documentation", "2-3 days", "$1,500 - $3,000"],
        ["Workflow Analysis", "1-2 days", "$1,000 - $2,500"],
        ["Staff Training Session", "1 day", "$1,500 - $2,500"],
        ["Data Cleanup/Migration", "2-4 days", "$2,000 - $5,000"]
    ]
    
    tasks_table = Table(tasks_data, colWidths=[2.8*inch, 1.5*inch, 1.5*inch])
    tasks_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), TEAL),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTSIZE', (0, 0), (-1, 0), 11),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 0.5, LIGHT_GRAY),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ]))
    
    story.append(tasks_table)
    
    story.append(Spacer(1, 0.3*inch))
    
    # Process Section
    story.append(Paragraph("OUR MICRO-PURCHASE PROCESS", styles['CustomHeading1']))
    
    process_steps = [
        "1. Initial Contact - Email or call with your requirement",
        "2. Quick Assessment - Same-day evaluation and quote",
        "3. Authorization - Simple email approval to proceed",
        "4. Rapid Delivery - Complete solution within agreed timeframe",
        "5. Documentation - Full documentation and training included"
    ]
    
    for step in process_steps:
        story.append(Paragraph(step, styles['CustomBullet']))
    
    story.append(Spacer(1, 0.3*inch))
    
    # Why Choose Us Box
    why_data = [
        ["WHY AGENCIES CHOOSE US FOR MICRO-PURCHASES"],
        ["✓ SDVOSB - Supporting agency small business goals"],
        ["✓ No red tape - Simple, straightforward process"],
        ["✓ Fast turnaround - Most tasks completed in under a week"],
        ["✓ Fixed pricing - No surprises or overruns"],
        ["✓ Quality guaranteed - Enterprise-grade solutions at micro prices"]
    ]
    
    why_table = Table(why_data, colWidths=[6.5*inch])
    why_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), NAVY),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
        ('FONTSIZE', (0, 1), (-1, -1), 11),
        ('ALIGN', (0, 1), (-1, -1), 'LEFT'),
        ('BOX', (0, 0), (-1, -1), 1, NAVY),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('LEFTPADDING', (0, 1), (-1, -1), 20),
    ]))
    
    story.append(why_table)
    
    # Build PDF
    doc.build(story)
    return filename

def create_outreach_materials(output_dir):
    """Create Federal Outreach Sequence document"""
    filename = f"{output_dir}/federal_outreach_sequence.pdf"
    doc = SimpleDocTemplate(filename, pagesize=letter,
                          topMargin=0.5*inch, bottomMargin=0.5*inch,
                          leftMargin=0.75*inch, rightMargin=0.75*inch)
    
    styles = create_custom_styles()
    story = []
    
    # Header
    story.append(create_header_table("Federal Outreach Sequence"))
    story.append(Spacer(1, 0.3*inch))
    
    # Email 1
    story.append(Paragraph("EMAIL 1 - INTRODUCTION", styles['CustomHeading1']))
    story.append(Paragraph("<b>Subject:</b> Availability for Micro-Purchase Automation & Dashboard Support", styles['CustomNormal']))
    story.append(Spacer(1, 0.1*inch))
    
    email1_text = """Hello [Name],

My name is Jacob Johnston, Owner/CEO of True North Data Strategies LLC. We provide small-scale workflow automation, dashboard development, and process support suitable for micro-purchase thresholds. I am available for rapid turnaround on reporting automation, spreadsheet fixes, training, and small workflow improvements.

Capabilities Statement attached.

Respectfully,
Jacob Johnston
True North Data Strategies LLC
555-555-5555"""
    
    story.append(Paragraph(email1_text.replace('\n', '<br/>'), styles['CustomNormal']))
    story.append(Spacer(1, 0.3*inch))
    
    # Email 2
    story.append(Paragraph("EMAIL 2 - FOLLOW-UP (Send 5-7 days later)", styles['CustomHeading1']))
    story.append(Paragraph("<b>Subject:</b> Follow-Up: Micro-Purchase Support Availability", styles['CustomNormal']))
    story.append(Spacer(1, 0.1*inch))
    
    email2_text = """Hello [Name],

Following up on my previous message. If your office has small automation or data tasks requiring quick turnaround, True North Data Strategies LLC can support immediately.

Thank you,
Jacob Johnston
True North Data Strategies LLC"""
    
    story.append(Paragraph(email2_text.replace('\n', '<br/>'), styles['CustomNormal']))
    story.append(Spacer(1, 0.3*inch))
    
    # Email 3
    story.append(Paragraph("EMAIL 3 - FINAL TOUCHPOINT (Send 7-10 days after Email 2)", styles['CustomHeading1']))
    story.append(Paragraph("<b>Subject:</b> Micro-Purchase Support – Final Follow-Up", styles['CustomNormal']))
    story.append(Spacer(1, 0.1*inch))
    
    email3_text = """Hello [Name],

This is a final follow-up to ensure your office has our information for micro-purchase technical support. We are prepared to assist with dashboards, automation, reporting cleanup, and documentation.

Regards,
Jacob Johnston
True North Data Strategies LLC"""
    
    story.append(Paragraph(email3_text.replace('\n', '<br/>'), styles['CustomNormal']))
    
    story.append(PageBreak())
    
    # Phone Script
    story.append(Paragraph("PHONE SCRIPT", styles['CustomHeading1']))
    story.append(Spacer(1, 0.2*inch))
    
    phone_script = """<b>Opening:</b>
"Hello, this is Jacob Johnston with True North Data Strategies LLC, a small business providing automation and dashboard support. I'm calling to confirm whether your office uses micro-purchase support for workflow automation or data tasks."

<b>If interested:</b>
"Excellent. We specialize in quick-turn technical tasks under the micro-purchase threshold. Common requests include automating reports, building dashboards, and streamlining data workflows. I can send my capabilities statement if that would be helpful."

<b>If not interested:</b>
"I understand. Would it be alright if I sent our capabilities statement for your vendor files in case needs arise in the future?"

<b>Closing:</b>
"I appreciate your time today. My email is jacob@truenorthstrategyops.com if you need anything. Have a great day."

<b>Key Points to Remember:</b>
• Keep it brief and professional
• Focus on micro-purchase threshold advantage
• Emphasize quick turnaround and specific capabilities
• Always ask to be added to vendor list
• Follow up via email with capabilities statement"""
    
    story.append(Paragraph(phone_script, styles['CustomNormal']))
    
    # Build PDF
    doc.build(story)
    return filename

def create_proposal_templates(output_dir):
    """Create Proposal & Quote Templates"""
    filename = f"{output_dir}/proposal_quote_templates.pdf"
    doc = SimpleDocTemplate(filename, pagesize=letter,
                          topMargin=0.5*inch, bottomMargin=0.5*inch,
                          leftMargin=0.75*inch, rightMargin=0.75*inch)
    
    styles = create_custom_styles()
    story = []
    
    # Header
    story.append(create_header_table("Proposal & Quote Templates"))
    story.append(Spacer(1, 0.3*inch))
    
    # Micro-Purchase Quote Template
    story.append(Paragraph("MICRO-PURCHASE QUOTE TEMPLATE", styles['CustomHeading1']))
    story.append(Spacer(1, 0.2*inch))
    
    quote_template = """<b>QUOTE FOR SERVICES</b>

<b>To:</b> [Agency Name]
<b>From:</b> True North Data Strategies LLC
<b>Date:</b> [Date]
<b>Quote #:</b> [YYYY-MM-DD-001]
<b>Valid Until:</b> [30 days from date]

<b>SCOPE OF WORK:</b>
[Describe specific deliverables, e.g., "Automate monthly reporting process currently taking 8 hours of manual work"]

<b>DELIVERABLES:</b>
• [Specific deliverable 1]
• [Specific deliverable 2]
• Documentation and training materials

<b>TIMELINE:</b> [X business days from authorization]

<b>FIXED PRICE:</b> $[Amount]

<b>TERMS:</b>
• Payment terms: Net 30
• Work begins upon email authorization
• Includes all documentation and training

<b>AUTHORIZATION:</b>
Email approval to: jacob@truenorthstrategyops.com

<b>CONTACT:</b>
Jacob Johnston, Owner/CEO
555-555-5555
jacob@truenorthstrategyops.com"""
    
    story.append(Paragraph(quote_template, styles['CustomNormal']))
    
    story.append(PageBreak())
    
    # Simplified Acquisition Proposal Template
    story.append(Paragraph("SIMPLIFIED ACQUISITION PROPOSAL TEMPLATE", styles['CustomHeading1']))
    story.append(Spacer(1, 0.2*inch))
    
    # Executive Summary
    story.append(Paragraph("<b>1. EXECUTIVE SUMMARY</b>", styles['CustomHeading2']))
    story.append(Paragraph(
        "[One paragraph summarizing the solution, our qualifications, and why we're the best choice. "
        "Emphasize SDVOSB status, past performance, and ability to deliver quickly.]",
        styles['CustomNormal']
    ))
    story.append(Spacer(1, 0.2*inch))
    
    # Technical Approach
    story.append(Paragraph("<b>2. TECHNICAL APPROACH</b>", styles['CustomHeading2']))
    story.append(Paragraph(
        "<b>Understanding of Requirement:</b><br/>"
        "[Demonstrate clear understanding of the agency's needs]<br/><br/>"
        "<b>Proposed Solution:</b><br/>"
        "[Detailed technical approach including tools, methodology, and deliverables]<br/><br/>"
        "<b>Implementation Timeline:</b><br/>"
        "[Phased approach with milestones and delivery dates]",
        styles['CustomNormal']
    ))
    story.append(Spacer(1, 0.2*inch))
    
    # Management Approach
    story.append(Paragraph("<b>3. MANAGEMENT APPROACH</b>", styles['CustomHeading2']))
    story.append(Paragraph(
        "<b>Project Management:</b><br/>"
        "[How we'll manage the project, communication plan, status reporting]<br/><br/>"
        "<b>Quality Assurance:</b><br/>"
        "[QA processes, testing approach, acceptance criteria]<br/><br/>"
        "<b>Risk Management:</b><br/>"
        "[Identified risks and mitigation strategies]",
        styles['CustomNormal']
    ))
    story.append(Spacer(1, 0.2*inch))
    
    # Past Performance
    story.append(Paragraph("<b>4. RELEVANT EXPERIENCE</b>", styles['CustomHeading2']))
    story.append(Paragraph(
        "[2-3 relevant past projects with outcomes and references]",
        styles['CustomNormal']
    ))
    story.append(Spacer(1, 0.2*inch))
    
    # Key Personnel
    story.append(Paragraph("<b>5. KEY PERSONNEL</b>", styles['CustomHeading2']))
    story.append(Paragraph(
        "<b>Jacob Johnston, Owner/CEO</b><br/>"
        "• 16+ years military leadership experience<br/>"
        "• Self-taught developer specializing in automation<br/>"
        "• Proven track record of delivering enterprise solutions",
        styles['CustomNormal']
    ))
    story.append(Spacer(1, 0.2*inch))
    
    # Pricing
    story.append(Paragraph("<b>6. PRICING</b>", styles['CustomHeading2']))
    story.append(Paragraph(
        "[Fixed price or T&M breakdown with clear cost structure]",
        styles['CustomNormal']
    ))
    
    # Build PDF
    doc.build(story)
    return filename

def create_bid_decision_checklist(output_dir):
    """Create Bid/No-Bid Decision Checklist"""
    filename = f"{output_dir}/bid_decision_checklist.pdf"
    doc = SimpleDocTemplate(filename, pagesize=letter,
                          topMargin=0.5*inch, bottomMargin=0.5*inch,
                          leftMargin=0.75*inch, rightMargin=0.75*inch)
    
    styles = create_custom_styles()
    story = []
    
    # Header
    story.append(create_header_table("Bid/No-Bid Decision Checklist"))
    story.append(Spacer(1, 0.3*inch))
    
    # Instructions
    story.append(Paragraph("OPPORTUNITY EVALUATION CHECKLIST", styles['CustomTitle']))
    story.append(Paragraph(
        "Use this checklist to evaluate each federal opportunity. Score each factor 1-5. "
        "Total score above 35 = BID. Score 25-35 = MAYBE. Below 25 = NO BID.",
        styles['CustomNormal']
    ))
    story.append(Spacer(1, 0.3*inch))
    
    # Checklist Table
    checklist_data = [
        ["Factor", "Weight", "Score (1-5)", "Notes"],
        ["1. TECHNICAL FIT", "", "", ""],
        ["Do we have the exact skills required?", "High", "___", ""],
        ["Can we meet all technical requirements?", "High", "___", ""],
        ["Do we have relevant past performance?", "High", "___", ""],
        ["2. COMPETITIVE ADVANTAGE", "", "", ""],
        ["Is it SDVOSB set-aside?", "High", "___", ""],
        ["Do we have unique qualifications?", "Medium", "___", ""],
        ["Is competition limited?", "Medium", "___", ""],
        ["3. FINANCIAL VIABILITY", "", "", ""],
        ["Is the contract value worth the effort?", "High", "___", ""],
        ["Can we complete within budget?", "High", "___", ""],
        ["Are payment terms acceptable?", "Medium", "___", ""],
        ["4. RISK ASSESSMENT", "", "", ""],
        ["Are requirements clearly defined?", "High", "___", ""],
        ["Is timeline realistic?", "High", "___", ""],
        ["Do we have bandwidth?", "High", "___", ""],
        ["5. STRATEGIC VALUE", "", "", ""],
        ["Does it align with our growth strategy?", "Medium", "___", ""],
        ["Will it lead to future opportunities?", "Medium", "___", ""],
        ["Does it build key relationships?", "Medium", "___", ""],
        ["TOTAL SCORE:", "", "___", ""]
    ]
    
    checklist_table = Table(checklist_data, colWidths=[3.5*inch, 1*inch, 1*inch, 1.3*inch])
    checklist_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), NAVY),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 11),
        ('BACKGROUND', (0, 1), (-1, 1), TEAL),
        ('BACKGROUND', (0, 5), (-1, 5), TEAL),
        ('BACKGROUND', (0, 9), (-1, 9), TEAL),
        ('BACKGROUND', (0, 13), (-1, 13), TEAL),
        ('BACKGROUND', (0, 17), (-1, 17), TEAL),
        ('BACKGROUND', (0, -1), (-1, -1), NAVY),
        ('TEXTCOLOR', (0, -1), (-1, -1), WHITE),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ('GRID', (0, 0), (-1, -1), 0.5, LIGHT_GRAY),
        ('ALIGN', (1, 0), (2, -1), 'CENTER'),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ]))
    
    story.append(checklist_table)
    
    story.append(Spacer(1, 0.3*inch))
    
    # Decision Matrix
    story.append(Paragraph("DECISION GUIDELINES", styles['CustomHeading1']))
    
    decision_data = [
        ["Score Range", "Decision", "Action"],
        ["40-50", "STRONG BID", "Pursue aggressively, allocate best resources"],
        ["35-39", "BID", "Submit competitive proposal"],
        ["25-34", "CONDITIONAL", "Bid only if resources available and low competition"],
        ["15-24", "NO BID", "Pass, but maintain relationship for future"],
        ["Below 15", "HARD PASS", "Not aligned with capabilities or strategy"]
    ]
    
    decision_table = Table(decision_data, colWidths=[1.5*inch, 1.5*inch, 3.5*inch])
    decision_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), DARK_GRAY),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('GRID', (0, 0), (-1, -1), 0.5, LIGHT_GRAY),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ]))
    
    story.append(decision_table)
    
    # Build PDF
    doc.build(story)
    return filename

def create_sdvosb_prep_packet(output_dir):
    """Create SDVOSB Application Prep Packet (multi-page)"""
    filename = f"{output_dir}/sdvosb_application_prep_packet.pdf"
    doc = SimpleDocTemplate(filename, pagesize=letter,
                          topMargin=0.5*inch, bottomMargin=0.5*inch,
                          leftMargin=0.75*inch, rightMargin=0.75*inch)
    
    styles = create_custom_styles()
    story = []
    
    # Cover Page
    story.append(create_header_table("SDVOSB Application Preparation Packet"))
    story.append(Spacer(1, 1*inch))
    
    story.append(Paragraph("Service-Disabled Veteran-Owned<br/>Small Business Certification", styles['CustomTitle']))
    story.append(Spacer(1, 0.5*inch))
    
    story.append(Paragraph("Complete Preparation Guide for<br/>True North Data Strategies LLC", styles['CustomSubtitle']))
    story.append(Spacer(1, 1*inch))
    
    story.append(Paragraph(f"Prepared: {datetime.now().strftime('%B %Y')}", styles['CustomNormal']))
    
    story.append(PageBreak())
    
    # Table of Contents
    story.append(Paragraph("TABLE OF CONTENTS", styles['CustomHeading1']))
    story.append(Spacer(1, 0.3*inch))
    
    toc_items = [
        "1. Required Documents Checklist",
        "2. Eligibility Requirements",
        "3. Application Process Steps",
        "4. Common Rejection Reasons",
        "5. Operating Agreement Requirements",
        "6. Timeline and Next Steps"
    ]
    
    for item in toc_items:
        story.append(Paragraph(item, styles['CustomNormal']))
        story.append(Spacer(1, 0.1*inch))
    
    story.append(PageBreak())
    
    # Section 1: Required Documents
    story.append(Paragraph("1. REQUIRED DOCUMENTS CHECKLIST", styles['CustomHeading1']))
    story.append(Spacer(1, 0.2*inch))
    
    story.append(Paragraph("<b>Proof of Veteran Status</b>", styles['CustomHeading2']))
    checklist_items = [
        "□ DD-214 (Member 4 copy preferred)",
        "□ VA Disability Rating Letter showing service-connected percentage",
        "□ Name must match SAM.gov registration exactly"
    ]
    for item in checklist_items:
        story.append(Paragraph(item, styles['CustomBullet']))
    
    story.append(Spacer(1, 0.2*inch))
    
    story.append(Paragraph("<b>Proof of Business Ownership</b>", styles['CustomHeading2']))
    checklist_items = [
        "□ Articles of Organization (from Colorado)",
        "□ Operating Agreement for True North Data Strategies LLC",
        "□ Any amendments to operating agreement",
        "□ EIN Assignment Letter from IRS",
        "□ State registration/good standing certificate"
    ]
    for item in checklist_items:
        story.append(Paragraph(item, styles['CustomBullet']))
    
    story.append(Spacer(1, 0.2*inch))
    
    story.append(Paragraph("<b>Proof of Control</b>", styles['CustomHeading2']))
    checklist_items = [
        "□ Documentation showing veteran as Owner/CEO",
        "□ Bank signature cards or authorization",
        "□ Evidence of decision-making authority"
    ]
    for item in checklist_items:
        story.append(Paragraph(item, styles['CustomBullet']))
    
    story.append(Spacer(1, 0.2*inch))
    
    story.append(Paragraph("<b>Financial Documents</b>", styles['CustomHeading2']))
    checklist_items = [
        "□ Bank account verification",
        "□ Business tax returns (if filed)",
        "□ Financial statements (if available)"
    ]
    for item in checklist_items:
        story.append(Paragraph(item, styles['CustomBullet']))
    
    story.append(PageBreak())
    
    # Section 2: Eligibility Requirements
    story.append(Paragraph("2. ELIGIBILITY REQUIREMENTS", styles['CustomHeading1']))
    story.append(Spacer(1, 0.2*inch))
    
    req_data = [
        ["Requirement", "Your Status", "Documentation Needed"],
        ["51% Ownership by Service-Disabled Veteran", "Must verify", "Operating Agreement"],
        ["Unconditional ownership", "Must verify", "No restrictive clauses"],
        ["Full control of operations", "Must verify", "Management structure docs"],
        ["Veteran manages daily operations", "Yes", "Resume/role description"],
        ["Valid service-connected disability", "Must verify", "VA letter"],
        ["Small business size", "Yes", "Under NAICS limits"]
    ]
    
    req_table = Table(req_data, colWidths=[2.5*inch, 1.5*inch, 2*inch])
    req_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), NAVY),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('GRID', (0, 0), (-1, -1), 0.5, LIGHT_GRAY),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    
    story.append(req_table)
    
    story.append(PageBreak())
    
    # Section 3: Application Process
    story.append(Paragraph("3. APPLICATION PROCESS STEPS", styles['CustomHeading1']))
    story.append(Spacer(1, 0.2*inch))
    
    steps = [
        ("Step 1: Complete SAM.gov Registration", "Ensure all information is current and matches corporate documents exactly"),
        ("Step 2: Gather All Documents", "Use checklist to compile all required documentation"),
        ("Step 3: Review Operating Agreement", "Ensure it clearly shows 51% veteran ownership and control"),
        ("Step 4: Create SBA Account", "Register at https://veterans.certify.sba.gov"),
        ("Step 5: Complete Online Application", "Allow 30-45 minutes for the application"),
        ("Step 6: Upload Documents", "Ensure all PDFs are clear and readable"),
        ("Step 7: Submit and Track", "Monitor status and respond quickly to any requests")
    ]
    
    for step, desc in steps:
        story.append(Paragraph(f"<b>{step}</b>", styles['CustomHeading2']))
        story.append(Paragraph(desc, styles['CustomNormal']))
        story.append(Spacer(1, 0.1*inch))
    
    story.append(PageBreak())
    
    # Section 4: Common Rejection Reasons
    story.append(Paragraph("4. COMMON REJECTION REASONS TO AVOID", styles['CustomHeading1']))
    story.append(Spacer(1, 0.2*inch))
    
    rejections = [
        "• Operating Agreement doesn't clearly show 51% ownership",
        "• Restrictive clauses that limit veteran's control",
        "• Name mismatches between documents",
        "• Missing or illegible documents",
        "• Outdated VA disability letter",
        "• Bank documents don't show veteran control",
        "• Evidence of non-veteran having veto power",
        "• Incomplete application sections"
    ]
    
    for rejection in rejections:
        story.append(Paragraph(rejection, styles['CustomBullet']))
    
    story.append(Spacer(1, 0.3*inch))
    
    # Section 5: Operating Agreement Requirements
    story.append(Paragraph("5. OPERATING AGREEMENT MUST-HAVES", styles['CustomHeading1']))
    
    story.append(Paragraph(
        "Your Operating Agreement must explicitly state:",
        styles['CustomNormal']
    ))
    
    must_haves = [
        "• Jacob Johnston owns at least 51% of the company",
        "• Jacob Johnston has full authority to make all decisions",
        "• No requirement for unanimous consent on any matters",
        "• No other member/manager can overrule the veteran owner",
        "• Veteran controls all bank accounts and financial decisions",
        "• Clear statement of management structure with veteran at top"
    ]
    
    for item in must_haves:
        story.append(Paragraph(item, styles['CustomBullet']))
    
    # Build PDF
    doc.build(story)
    return filename

def create_owner_resume(output_dir):
    """Create Federal Format Owner Resume"""
    filename = f"{output_dir}/owner_resume_federal.pdf"
    doc = SimpleDocTemplate(filename, pagesize=letter,
                          topMargin=0.5*inch, bottomMargin=0.5*inch,
                          leftMargin=0.75*inch, rightMargin=0.75*inch)
    
    styles = create_custom_styles()
    story = []
    
    # Header
    story.append(Paragraph("JACOB JOHNSTON", styles['CustomTitle']))
    story.append(Paragraph("Owner/CEO • True North Data Strategies LLC", styles['CustomSubtitle']))
    story.append(Paragraph(
        "123 Example St, Anytown, CO 80000<br/>"
        "555-555-5555 • jacob@truenorthstrategyops.com",
        styles['CustomNormal']
    ))
    story.append(Spacer(1, 0.3*inch))
    
    # Professional Summary
    story.append(Paragraph("PROFESSIONAL SUMMARY", styles['CustomHeading1']))
    story.append(Paragraph(
        "Service-disabled veteran with 16+ years of military leadership experience and proven expertise in "
        "operational automation, data systems, and process improvement. Self-taught developer at age 53, "
        "now leading successful automation consultancy serving government and commercial clients. Combines "
        "military precision with modern technology to deliver practical, scalable solutions.",
        styles['CustomNormal']
    ))
    story.append(Spacer(1, 0.2*inch))
    
    # Core Competencies
    story.append(Paragraph("CORE COMPETENCIES", styles['CustomHeading1']))
    
    competencies = [
        "• Workflow Automation & Systems Integration",
        "• Google Workspace & Cloud Platform Development",
        "• Executive Dashboard Design & Implementation",
        "• Process Analysis & Optimization",
        "• Technical Documentation & Training",
        "• Project Management & Team Leadership"
    ]
    
    for comp in competencies:
        story.append(Paragraph(comp, styles['CustomBullet']))
    
    story.append(Spacer(1, 0.2*inch))
    
    # Professional Experience
    story.append(Paragraph("PROFESSIONAL EXPERIENCE", styles['CustomHeading1']))
    
    # True North
    story.append(Paragraph("<b>Owner/CEO</b>", styles['CustomHeading2']))
    story.append(Paragraph("True North Data Strategies LLC, Colorado Springs, CO<br/>2023 - Present", styles['CustomNormal']))
    story.append(Paragraph(
        "• Founded and operate Google Workspace automation consultancy serving SMBs and government<br/>"
        "• Develop enterprise-grade automation solutions reducing client operational costs 40-60%<br/>"
        "• Maintain 30+ production repositories serving multiple client environments<br/>"
        "• Design and implement data dashboards for C-suite decision support<br/>"
        "• Create reusable automation frameworks for rapid deployment across industries",
        styles['CustomBullet']
    ))
    story.append(Spacer(1, 0.15*inch))
    
    # Example Fleet Co
    story.append(Paragraph("<b>Operations Supervisor</b>", styles['CustomHeading2']))
    story.append(Paragraph("Example Fleet Co Co., Colorado Springs, CO<br/>2021 - Present", styles['CustomNormal']))
    story.append(Paragraph(
        "• Manage dispatch operations and drive operational improvements for fuel distribution<br/>"
        "• Built automated supplier email processing system saving 20+ hours weekly<br/>"
        "• Developed fleet management dashboards tracking $2M+ monthly operations<br/>"
        "• Created compliance tracking systems achieving 100% audit success<br/>"
        "• Implemented employee handbook automation and training systems",
        styles['CustomBullet']
    ))
    story.append(Spacer(1, 0.15*inch))
    
    # Military Service
    story.append(Paragraph("<b>Infantry Team Leader / Squad Leader</b>", styles['CustomHeading2']))
    story.append(Paragraph("U.S. Army, Various Locations<br/>2003 - 2020", styles['CustomNormal']))
    story.append(Paragraph(
        "• Led Airborne Infantry teams in combat operations in Afghanistan<br/>"
        "• Managed logistics and operational planning for 30+ soldier units<br/>"
        "• Earned Bronze Star Medal for exceptional leadership under fire<br/>"
        "• Trained and mentored junior soldiers in tactics and leadership<br/>"
        "• Maintained 100% accountability for millions in military equipment",
        styles['CustomBullet']
    ))
    story.append(Spacer(1, 0.2*inch))
    
    # Technical Skills
    story.append(Paragraph("TECHNICAL PROFICIENCIES", styles['CustomHeading1']))
    
    skills_data = [
        ["Category", "Technologies"],
        ["Languages", "Python, JavaScript/TypeScript, Google Apps Script, SQL"],
        ["Frameworks", "Next.js, React, Streamlit, Node.js"],
        ["Cloud Platforms", "Google Cloud Platform, Firebase, Vercel, Railway"],
        ["Automation Tools", "Google Workspace APIs, REST APIs, Webhooks"],
        ["Databases", "PostgreSQL, Firestore, Google Sheets as DB"],
        ["Development Tools", "Git/GitHub, VS Code, Claude AI, Docker"]
    ]
    
    skills_table = Table(skills_data, colWidths=[1.8*inch, 4.5*inch])
    skills_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), NAVY),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('GRID', (0, 0), (-1, -1), 0.5, LIGHT_GRAY),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    
    story.append(skills_table)
    
    story.append(Spacer(1, 0.2*inch))
    
    # Certifications
    story.append(Paragraph("CERTIFICATIONS & CLEARANCE", styles['CustomHeading1']))
    story.append(Paragraph(
        "• Service-Disabled Veteran-Owned Small Business (SDVOSB) - Pending<br/>"
        "• Secret Security Clearance - Held 2003-2020 (reinvestigable)<br/>"
        "• Google Workspace Administrator<br/>"
        "• Agile/Scrum Fundamentals",
        styles['CustomBullet']
    ))
    
    # Build PDF
    doc.build(story)
    return filename

def create_osdbu_contact_sheet(output_dir):
    """Create Agency OSDBU Contact Sheet"""
    filename = f"{output_dir}/agency_osdbu_contacts.pdf"
    doc = SimpleDocTemplate(filename, pagesize=letter,
                          topMargin=0.5*inch, bottomMargin=0.5*inch,
                          leftMargin=0.75*inch, rightMargin=0.75*inch)
    
    styles = create_custom_styles()
    story = []
    
    # Header
    story.append(create_header_table("Agency OSDBU Contact Sheet"))
    story.append(Spacer(1, 0.3*inch))
    
    story.append(Paragraph("TARGET AGENCY SMALL BUSINESS OFFICES", styles['CustomTitle']))
    story.append(Paragraph("Offices of Small and Disadvantaged Business Utilization (OSDBU)", styles['CustomSubtitle']))
    story.append(Spacer(1, 0.3*inch))
    
    # VA
    story.append(Paragraph("DEPARTMENT OF VETERANS AFFAIRS", styles['CustomHeading1']))
    story.append(Paragraph(
        "<b>Why Target:</b> Largest SDVOSB buyer in federal government. Constant need for automation, "
        "dashboards, and operational support.<br/>"
        "<b>What They Buy:</b> IT modernization, data analytics, process improvement, system integration<br/>"
        "<b>Contact:</b> Office of Small and Disadvantaged Business Utilization<br/>"
        "<b>Website:</b> va.gov/osdbu<br/>"
        "<b>Strategy:</b> Register in VIP database, attend SDVOSB conferences, pursue direct awards",
        styles['CustomNormal']
    ))
    story.append(Spacer(1, 0.2*inch))
    
    # SBA
    story.append(Paragraph("SMALL BUSINESS ADMINISTRATION", styles['CustomHeading1']))
    story.append(Paragraph(
        "<b>Why Target:</b> Actively supports small business automation and modernization initiatives.<br/>"
        "<b>What They Buy:</b> Technical assistance, training, system improvements, dashboard development<br/>"
        "<b>Contact:</b> Office of Government Contracting<br/>"
        "<b>Website:</b> sba.gov/contracting<br/>"
        "<b>Strategy:</b> Leverage SDVOSB status, focus on technical assistance contracts",
        styles['CustomNormal']
    ))
    story.append(Spacer(1, 0.2*inch))
    
    # DOI
    story.append(Paragraph("DEPARTMENT OF INTERIOR", styles['CustomHeading1']))
    story.append(Paragraph(
        "<b>Why Target:</b> Less competition than DoD/VA, strong small business utilization.<br/>"
        "<b>What They Buy:</b> Data management, workflow automation, GIS integration, reporting tools<br/>"
        "<b>Contact:</b> Office of Small and Disadvantaged Business Utilization<br/>"
        "<b>Website:</b> doi.gov/pmb/osdbu<br/>"
        "<b>Strategy:</b> Target bureaus like NPS, BLM for operational support contracts",
        styles['CustomNormal']
    ))
    story.append(Spacer(1, 0.2*inch))
    
    # USDA
    story.append(Paragraph("DEPARTMENT OF AGRICULTURE", styles['CustomHeading1']))
    story.append(Paragraph(
        "<b>Why Target:</b> Multiple component agencies with automation needs.<br/>"
        "<b>What They Buy:</b> Data analysis, reporting automation, rural development support<br/>"
        "<b>Contact:</b> Office of Small and Disadvantaged Business Utilization<br/>"
        "<b>Website:</b> usda.gov/osdbu<br/>"
        "<b>Strategy:</b> Focus on Forest Service and Rural Development opportunities",
        styles['CustomNormal']
    ))
    story.append(Spacer(1, 0.2*inch))
    
    # Additional Agencies Table
    story.append(Paragraph("ADDITIONAL TARGET AGENCIES", styles['CustomHeading1']))
    
    agency_data = [
        ["Agency", "Focus Area", "Website"],
        ["HUD", "Data modernization, reporting", "hud.gov/smallbusiness"],
        ["GSA", "IT schedule contracts", "gsa.gov/osdbu"],
        ["DOT", "Analytics, dashboards", "transportation.gov/osdbu"],
        ["DOE", "Technical services", "energy.gov/osdbu"]
    ]
    
    agency_table = Table(agency_data, colWidths=[1.5*inch, 3*inch, 2*inch])
    agency_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), TEAL),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('GRID', (0, 0), (-1, -1), 0.5, LIGHT_GRAY),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    
    story.append(agency_table)
    
    # Build PDF
    doc.build(story)
    return filename

def create_90day_roadmap(output_dir):
    """Create 90-Day Federal Contracting Roadmap"""
    filename = f"{output_dir}/90_day_federal_roadmap.pdf"
    doc = SimpleDocTemplate(filename, pagesize=letter,
                          topMargin=0.5*inch, bottomMargin=0.5*inch,
                          leftMargin=0.75*inch, rightMargin=0.75*inch)
    
    styles = create_custom_styles()
    story = []
    
    # Header
    story.append(create_header_table("90-Day Federal Contracting Roadmap"))
    story.append(Spacer(1, 0.3*inch))
    
    # Phase 1
    story.append(Paragraph("PHASE 1: INFRASTRUCTURE & POSITIONING (Days 1-30)", styles['CustomHeading1']))
    
    phase1_items = [
        ("Week 1", [
            "Complete SAM.gov registration",
            "Submit SDVOSB application to SBA",
            "Finalize capability statement",
            "Create federal resume"
        ]),
        ("Week 2", [
            "Register in agency vendor databases (VA VIP, etc.)",
            "Set up contract opportunity tracking system",
            "Join relevant federal contracting groups",
            "Complete market research on target agencies"
        ]),
        ("Week 3", [
            "Develop micro-purchase service catalog",
            "Create proposal templates",
            "Build relationships with PTAC counselors",
            "Identify first 10 target opportunities"
        ]),
        ("Week 4", [
            "Reach out to agency OSDBUs",
            "Attend virtual federal contracting event",
            "Refine pricing strategy",
            "Complete bid/no-bid criteria"
        ])
    ]
    
    for week, tasks in phase1_items:
        story.append(Paragraph(f"<b>{week}:</b>", styles['CustomHeading2']))
        for task in tasks:
            story.append(Paragraph(f"□ {task}", styles['CustomBullet']))
        story.append(Spacer(1, 0.1*inch))
    
    story.append(Spacer(1, 0.2*inch))
    
    # Phase 2
    story.append(Paragraph("PHASE 2: VISIBILITY & OUTREACH (Days 31-60)", styles['CustomHeading1']))
    
    phase2_items = [
        ("Week 5-6", [
            "Launch outreach campaign to purchase card holders",
            "Submit first micro-purchase quotes",
            "Connect with prime contractors for subcontracting",
            "Update DSBS profile with keywords"
        ]),
        ("Week 7-8", [
            "Follow up on all quotes submitted",
            "Attend agency industry day (virtual or in-person)",
            "Schedule meetings with OSDBU representatives",
            "Respond to first RFQs under $10K"
        ])
    ]
    
    for week, tasks in phase2_items:
        story.append(Paragraph(f"<b>{week}:</b>", styles['CustomHeading2']))
        for task in tasks:
            story.append(Paragraph(f"□ {task}", styles['CustomBullet']))
        story.append(Spacer(1, 0.1*inch))
    
    story.append(Spacer(1, 0.2*inch))
    
    # Phase 3
    story.append(Paragraph("PHASE 3: PIPELINE & FIRST WINS (Days 61-90)", styles['CustomHeading1']))
    
    phase3_items = [
        ("Week 9-10", [
            "Target 5+ micro-purchase opportunities weekly",
            "Submit first simplified acquisition proposal",
            "Build relationships with program managers",
            "Track win/loss data for continuous improvement"
        ]),
        ("Week 11-12", [
            "Execute first federal contract",
            "Gather performance feedback",
            "Expand outreach to new agencies",
            "Plan scaling strategy for larger contracts"
        ])
    ]
    
    for week, tasks in phase3_items:
        story.append(Paragraph(f"<b>{week}:</b>", styles['CustomHeading2']))
        for task in tasks:
            story.append(Paragraph(f"□ {task}", styles['CustomBullet']))
        story.append(Spacer(1, 0.1*inch))
    
    story.append(Spacer(1, 0.3*inch))
    
    # Success Metrics
    story.append(Paragraph("SUCCESS METRICS", styles['CustomHeading1']))
    
    metrics_data = [
        ["Milestone", "Target", "Actual", "Notes"],
        ["SAM.gov Active", "Day 7", "___", ""],
        ["SDVOSB Submitted", "Day 14", "___", ""],
        ["First Quote Sent", "Day 30", "___", ""],
        ["First Contract Win", "Day 60", "___", ""],
        ["Pipeline Value", "$50K+", "___", ""],
        ["Agencies Engaged", "5+", "___", ""]
    ]
    
    metrics_table = Table(metrics_data, colWidths=[2*inch, 1*inch, 1*inch, 2*inch])
    metrics_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), NAVY),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('GRID', (0, 0), (-1, -1), 0.5, LIGHT_GRAY),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    
    story.append(metrics_table)
    
    # Build PDF
    doc.build(story)
    return filename

def create_cover_template(output_dir):
    """Create Cover Page Template"""
    filename = f"{output_dir}/cover_page_template.pdf"
    doc = SimpleDocTemplate(filename, pagesize=letter,
                          topMargin=1*inch, bottomMargin=1*inch,
                          leftMargin=1*inch, rightMargin=1*inch)
    
    styles = create_custom_styles()
    story = []
    
    # Logo placeholder
    story.append(Spacer(1, 1*inch))
    
    # Company Name
    story.append(Paragraph("TRUE NORTH DATA STRATEGIES LLC", 
                          ParagraphStyle('CoverTitle', fontSize=28, textColor=NAVY, 
                                       alignment=TA_CENTER, fontName='Helvetica-Bold')))
    story.append(Spacer(1, 0.5*inch))
    
    # Tagline
    story.append(Paragraph("Automation • Integration • Innovation", 
                          ParagraphStyle('Tagline', fontSize=16, textColor=TEAL, 
                                       alignment=TA_CENTER, fontName='Helvetica')))
    story.append(Spacer(1, 2*inch))
    
    # Document Title
    story.append(Paragraph("[DOCUMENT TITLE]", 
                          ParagraphStyle('DocTitle', fontSize=20, textColor=DARK_GRAY, 
                                       alignment=TA_CENTER, fontName='Helvetica-Bold')))
    story.append(Spacer(1, 0.3*inch))
    
    # Subtitle
    story.append(Paragraph("[Subtitle or Description]", 
                          ParagraphStyle('Subtitle', fontSize=14, textColor=DARK_GRAY, 
                                       alignment=TA_CENTER, fontName='Helvetica')))
    story.append(Spacer(1, 2*inch))
    
    # Submission Info
    story.append(Paragraph("Submitted to:", styles['CustomNormal']))
    story.append(Paragraph("[Agency Name]<br/>[Office/Division]", 
                          ParagraphStyle('SubmitInfo', fontSize=12, textColor=DARK_GRAY, 
                                       alignment=TA_CENTER)))
    story.append(Spacer(1, 0.5*inch))
    
    # Date
    story.append(Paragraph("[Date]", 
                          ParagraphStyle('Date', fontSize=12, textColor=DARK_GRAY, 
                                       alignment=TA_CENTER)))
    story.append(Spacer(1, 1*inch))
    
    # Footer
    footer_data = [[
        "SDVOSB (Pending) | Colorado Springs, CO | 555-555-5555 | jacob@truenorthstrategyops.com"
    ]]
    
    footer_table = Table(footer_data, colWidths=[6*inch])
    footer_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), NAVY),
        ('TEXTCOLOR', (0, 0), (-1, -1), WHITE),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
    ]))
    
    story.append(footer_table)
    
    # Build PDF
    doc.build(story)
    return filename

def create_contact_sheet(output_dir):
    """Create Branded Contact Sheet"""
    filename = f"{output_dir}/branded_contact_sheet.pdf"
    doc = SimpleDocTemplate(filename, pagesize=letter,
                          topMargin=0.5*inch, bottomMargin=0.5*inch,
                          leftMargin=0.75*inch, rightMargin=0.75*inch)
    
    styles = create_custom_styles()
    story = []
    
    # Header
    story.append(create_header_table("Contact Information"))
    story.append(Spacer(1, 1*inch))
    
    # Company Name - Large
    story.append(Paragraph("TRUE NORTH DATA STRATEGIES LLC", 
                          ParagraphStyle('ContactTitle', fontSize=24, textColor=NAVY, 
                                       alignment=TA_CENTER, fontName='Helvetica-Bold')))
    story.append(Spacer(1, 0.5*inch))
    
    # Contact Details Box
    contact_info = [
        ["", ""],
        ["Owner/CEO:", "Jacob Johnston"],
        ["", ""],
        ["Phone:", "555-555-5555"],
        ["", ""],
        ["Email:", "jacob@truenorthstrategyops.com"],
        ["", ""],
        ["Website:", "www.truenorthstrategyops.com"],
        ["", ""],
        ["Address:", "123 Example St"],
        ["", "Colorado Springs, CO 80909"],
        ["", ""],
        ["CAGE Code:", "Pending"],
        ["UEI:", "Pending"],
        ["", ""],
        ["Business Type:", "Small Business"],
        ["", "SDVOSB (Pending)"],
        ["", ""]
    ]
    
    contact_table = Table(contact_info, colWidths=[2*inch, 3*inch])
    contact_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
        ('ALIGN', (1, 0), (1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 14),
        ('TEXTCOLOR', (0, 0), (0, -1), TEAL),
        ('TEXTCOLOR', (1, 0), (1, -1), DARK_GRAY),
        ('LINEBELOW', (0, 2), (-1, 2), 1, LIGHT_GRAY),
        ('LINEBELOW', (0, 5), (-1, 5), 1, LIGHT_GRAY),
        ('LINEBELOW', (0, 8), (-1, 8), 1, LIGHT_GRAY),
        ('LINEBELOW', (0, 11), (-1, 11), 1, LIGHT_GRAY),
        ('LINEBELOW', (0, 14), (-1, 14), 1, LIGHT_GRAY),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
    ]))
    
    # Center the table
    story.append(Table([[contact_table]], colWidths=[6.5*inch]))
    
    story.append(Spacer(1, 1*inch))
    
    # Tagline
    story.append(Paragraph(
        "Enterprise-Grade Automation for Federal Agencies",
        ParagraphStyle('Tagline', fontSize=16, textColor=NAVY, 
                      alignment=TA_CENTER, fontName='Helvetica')
    ))
    
    # Build PDF
    doc.build(story)
    return filename

def create_all_pdfs():
    """Generate all PDF documents"""
    output_dir = "/home/claude/federal_contracting/pdfs"
    
    print("Generating Federal Contracting PDF Package...\n")
    
    # Create all documents
    files_created = []
    
    print("Creating Capabilities Statements...")
    files_created.append(create_capabilities_statement(output_dir, bw_version=False))
    files_created.append(create_capabilities_statement(output_dir, bw_version=True))
    
    print("Creating DSBS Profile Sheet...")
    files_created.append(create_dsbs_profile(output_dir))
    
    print("Creating Federal Elevator Pitch...")
    files_created.append(create_elevator_pitch(output_dir))
    
    print("Creating Company Landing Page...")
    files_created.append(create_landing_page(output_dir))
    
    print("Creating Micro-Purchase Capability Sheet...")
    files_created.append(create_micropurchase_capability(output_dir))
    
    print("Creating Federal Outreach Materials...")
    files_created.append(create_outreach_materials(output_dir))
    
    print("Creating Proposal Templates...")
    files_created.append(create_proposal_templates(output_dir))
    
    print("Creating Bid/No-Bid Checklist...")
    files_created.append(create_bid_decision_checklist(output_dir))
    
    print("Creating SDVOSB Application Prep Packet...")
    files_created.append(create_sdvosb_prep_packet(output_dir))
    
    print("Creating Owner Resume...")
    files_created.append(create_owner_resume(output_dir))
    
    print("Creating OSDBU Contact Sheet...")
    files_created.append(create_osdbu_contact_sheet(output_dir))
    
    print("Creating 90-Day Roadmap...")
    files_created.append(create_90day_roadmap(output_dir))
    
    print("Creating Cover Page Template...")
    files_created.append(create_cover_template(output_dir))
    
    print("Creating Branded Contact Sheet...")
    files_created.append(create_contact_sheet(output_dir))
    
    print(f"\nSuccessfully created {len(files_created)} PDF documents!")
    
    return files_created

if __name__ == "__main__":
    create_all_pdfs()

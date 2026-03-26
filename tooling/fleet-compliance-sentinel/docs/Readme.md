# Chief Sentinel

## Deployment Origin

| Field | Value |
|---|---|
| GitHub Org | Pipeline-Punks |
| Repository | pipeline-punks-pipelinex-v2 |
| Vercel Project | pipeline-punks-pipelinex-v2 |
| Vercel Team | jjohnston70s-projects |
| Production URL | https://www.pipelinepunks.com |
| Deploy Method | Vercel CLI — `vercel --prod` from the website folder |
| GitHub CI/CD | Not connected — deploys are manual via CLI |

This folder (`tooling/chief-sentinel/`) is a data and tooling workspace for Example Fleet Co compliance tracking. It is **never deployed directly**. The parent repo root is the deployable Next.js application.

### How data gets into the website

1. Edit source CSVs in `databases/`
2. Run `py build_chief_imports.py` (or `.\refresh_chief_demo.ps1`)
3. Generated TypeScript modules are written to `../website-pipeline-punks-pipelinex-v2/src/lib/`
4. Run `vercel --prod` from the website folder to deploy

---

🚀 Quick Start
Get PetroSentinel running in 5 minutes:

Deploy the system

javascript   // In Google Apps Script, run this function:
   setupPetroSentinelSystem()

Configure for your operation

Update email addresses throughout the system
Modify tank IDs and capacities in ullage logs
Enter current compliance schedules
Add company personnel to contact directory


Test automated alerts

javascript   // Run manual test functions:
   runManualComplianceCheck()
   sendManualUllageReminder()

Access your system

Open the generated Google Sheets URL
Share with authorized personnel
Begin daily operations




📋 Table of Contents

Features
System Requirements
Installation Guide
System Architecture
Configuration
Usage
Compliance Coverage
API Reference
Support
License


✨ Features
Core Compliance Management

EPA Vapor Testing Tracking - 1-year and 5-year cycles with automated alerts
DOT Driver Qualification Files - CDL, medical certificates, MVR tracking
Automated Email Notifications - 60/30/15 day compliance alerts
Real-time Status Monitoring - Visual dashboards with color-coded compliance status

Operational Management

Daily Ullage Logs - Inventory tracking with variance detection and investigation protocols
Company Asset Tracking - Complete lifecycle management of phones, tablets, laptops, vehicles
Knowledge Base - Searchable procedures, safety protocols, and regulatory guidance
Emergency Contact Directory - Instant access to critical contact information

Automation & Intelligence

Weekly Compliance Checks - Automated Monday morning compliance reviews
Daily Ullage Reminders - 5:30 AM inventory check notifications
Monthly Asset Audits - Automated equipment inventory verification
Variance Detection - Automated flagging of inventory discrepancies >1%

Reporting & Analytics

Executive Dashboards - Real-time compliance status for management
Regulatory Reports - EPA, DOT, and state compliance documentation
Operational Analytics - Inventory trends, asset utilization, driver performance
Audit Trail - Complete documentation for regulatory inspections


🔧 System Requirements
Technical Requirements
ComponentRequirementGoogle WorkspaceBusiness or Enterprise (recommended)Apps Script AccessIncluded with WorkspaceWeb BrowserChrome, Firefox, Safari, EdgeEmail SystemCapable of receiving automated notifications
User Requirements

Basic Google Sheets proficiency for data entry and review
Petroleum industry knowledge for compliance interpretation
Administrative access for system configuration and user management

Recommended Hardware

Desktop/laptop computer for initial setup and administrative functions
Mobile devices for field data entry and emergency access
Reliable internet connection for real-time synchronization


📦 Installation Guide
Step 1: Google Apps Script Setup
Create New Project

Navigate to script.google.com
Click "New Project"
Replace default code with PetroSentinel script
Save as "PetroSentinel System"

Authorize Permissions

Run setupPetroSentinelSystem()
Grant all requested permissions
Note the generated spreadsheet URL

Step 2: System Configuration
Email Configuration
javascript// Replace all instances of @examplefleetco.com with your domain
// Update notification recipients in each alert function
Tank Configuration
javascript// Update tank IDs, capacities, and product types
const tankConfig = [
  { 
    id: "T-001", 
    capacity: 10000, 
    product: "Regular Unleaded 87" 
  },
  { 
    id: "T-002", 
    capacity: 15000, 
    product: "Ultra Low Sulfur Diesel" 
  }
];
Compliance Schedules

Enter current EPA vapor test dates
Update driver certification expiration dates
Set alert timing preferences (default: 60/30/15 days)

Step 3: Data Population
Priority Data Entry

Compliance Tracking: All current certifications and due dates
Driver Records: Complete driver information and emergency contacts
Contact Directory: Verify all phone numbers and email addresses
Company Assets: Inventory all technology equipment

Knowledge Base Setup

Review and customize petroleum procedures
Add company-specific safety protocols
Update emergency response procedures

Step 4: User Access Management
Spreadsheet Sharing

Add authorized users with appropriate permissions
Set up department-specific access levels
Configure view-only access for external auditors

Training and Documentation

Provide user training on system navigation
Distribute quick reference guides
Establish data entry protocols


🏗️ System Architecture
Google Apps Script Foundation
PetroSentinel Core
├── setupPetroSentinelSystem()     // Master deployment function
├── Compliance Monitoring
│   ├── performWeeklyComplianceCheck()
│   ├── sendComplianceAlerts()
│   └── Automated trigger scheduling
├── Operational Alerts
│   ├── sendDailyUllageReminder()
│   ├── sendMonthlyAssetAuditReminder()
│   └── Custom notification systems
└── Utility Functions
    ├── getSystemStatus()
    ├── Manual override functions
    └── Data validation and error handling
Google Sheets Data Layer
Multi-Sheet Workbook
├── Knowledge Base          // Procedures and safety protocols
├── Compliance Tracking     // EPA, DOT, permits, certifications
├── Ullage Logs            // Daily inventory with variance detection
├── Driver Records         // DOT qualification files and tracking
├── Company Assets         // Technology equipment lifecycle
├── Contact Directory      // Emergency and personnel contacts
├── Categories             // Knowledge organization system
└── Approval Workflow      // Document review and approval process
Automation Triggers

Weekly Compliance Check: Monday 8:00 AM
Daily Ullage Reminder: Daily 5:30 AM
Monthly Asset Audit: First Monday 9:00 AM
Custom Triggers: Configurable based on business needs


⚙️ Configuration
Environment Variables
javascript// Core system configuration
const CONFIG = {
  companyName: "Your Company Name",
  systemVersion: "2.1",
  timezone: "America/Denver",
  alertSettings: {
    complianceCheckDay: "Monday",
    complianceCheckTime: "08:00",
    ullageReminderTime: "05:30"
  }
};
Email Settings
javascript// Update email configuration
const emailSettings = {
  defaultSender: "system@yourcompany.com",
  emergencyRecipients: [
    "manager@yourcompany.com",
    "safety@yourcompany.com"
  ],
  maxDailyEmails: 100
};
Tank Configuration
javascript// Configure your tank setup
const tankConfiguration = [
  {
    tankId: "T-001",
    capacity: 10000,
    product: "Regular Unleaded 87",
    conversionFactor: 0.95
  }
  // Add additional tanks as needed
];

📊 Usage
Daily Operations
Morning Ullage Readings (6:00 AM)
Physical Measurements

Allow tanks to settle 30+ minutes
Use calibrated ullage tape
Record temperature and water levels

Data Entry

Navigate to Ullage Logs sheet
Enter measurements for each tank
System calculates variance automatically
Investigate any variance >1.0%

Compliance Monitoring
Weekly Review (Automated Mondays)

System checks all compliance items
Email alerts sent for items due soon or overdue
Review and take action on flagged items

Document Updates

Upload new certificates immediately
Update renewal dates in tracking system
Notify responsible parties of changes

Monthly Tasks
Asset Management

Inventory Verification: Physical inspection of all equipment
Update Assessments: Record condition and any changes or issues
Insurance Review: Verify coverage and update asset values

Compliance Certification Review

Driver Qualifications: Review upcoming renewals and schedule training
Environmental Permits: Check schedules and prepare renewal applications

Emergency Procedures
System Access Issues

Use backup Google Sheets URL
Access via mobile device
Contact system administrator

Compliance Emergency

Use Emergency Contact Directory
Follow knowledge base procedures
Document all actions taken
Update compliance tracking system


📋 Compliance Coverage
Federal Regulations
EPA Requirements

Vapor Recovery Testing: 1-year and 5-year cycles
Air Pollution Compliance: Annual emissions testing
Spill Reporting: National Response Center notifications
Underground Storage Tank: Federal UST regulations (40 CFR 280)

DOT Requirements

Commercial Driver Licensing: CDL tracking and renewals
Medical Certification: DOT physical requirements
Driver Qualification Files: Complete DQF management
Hours of Service: Integration ready for ELD systems
Vehicle Inspections: Annual DOT inspection tracking

State Regulations (Colorado Focus)
Colorado Division of Oil and Public Safety

UST Operations: Monthly release detection, secondary containment
Installation Permits: New tank system requirements
Operator Training: Class A, B, C operator certification

Colorado Air Quality Control Commission

Clean Truck Regulations: Fleet reporting requirements (2024-2027)
Large Entity Reporting: November 2024 and December 2027 deadlines

Industry Standards

API Standards: Tank measurement and calibration procedures
NFPA Codes: Fire safety and prevention requirements
OSHA Standards: Workplace safety and hazmat operations


🔌 API Reference
Core Functions
System Management
javascriptsetupPetroSentinelSystem()
// Deploys complete system with all sheets and automation
// Returns: { spreadsheetId, url, status }

getSystemStatus()
// Returns comprehensive system information
// Returns: { systemName, sheets, triggers, lastUpdated }
Compliance Monitoring
javascriptperformWeeklyComplianceCheck()
// Automated compliance review and alert generation
// Triggered: Monday 8:00 AM (configurable)

runManualComplianceCheck()
// Manual override for compliance checking
// Use for testing or immediate compliance review
Operational Alerts
javascriptsendDailyUllageReminder()
// Daily inventory reminder to operations team
// Triggered: Daily 5:30 AM (configurable)

sendMonthlyAssetAuditReminder()
// Monthly asset inventory notification
// Triggered: First Monday 9:00 AM (configurable)
Utility Functions
javascriptsendManualUllageReminder()
// Test ullage reminder system
// Use for system testing and validation

setupAutomationTriggers()
// Configure all automated triggers
// Run after system changes or updates
Data Structures
Compliance Item
javascript{
  itemType: "Truck Vapor Test",
  itemId: "VH-001",
  description: "Unit 1 Annual Vapor Recovery Test",
  responsiblePerson: "Fleet Manager",
  lastCompleted: "2024-03-15",
  nextDueDate: "2025-03-15",
  frequency: "Annual",
  status: "Current",
  alertDays: 60,
  emailRecipients: "fleet@company.com"
}
Ullage Log Entry
javascript{
  date: "2024-09-18",
  time: "06:00",
  tankId: "T-001",
  productType: "Regular Unleaded 87",
  ullageDepth: 28.5,
  temperature: 68,
  calculatedGallons: 7420,
  dailyVariance: -160,
  variancePercent: 0.0,
  measuredBy: "Operations Manager",
  investigationRequired: "No"
}
Error Handling
Common Error Scenarios
javascript// Email quota exceeded
try {
  MailApp.sendEmail(emailOptions);
} catch (error) {
  Logger.log('Email quota exceeded: ' + error.toString());
  // Implement fallback notification method
}

// Invalid date calculations
if (nextDueDate && nextDueDate instanceof Date) {
  // Process compliance item
} else {
  Logger.log('Invalid date format for item: ' + itemId);
}

🛠️ Contributing
Development Environment Setup
Google Apps Script Configuration

Enable Google Apps Script API
Set up local development with clasp CLI
Configure version control integration

Code Standards

Follow Google Apps Script best practices
Use JSDoc comments for all functions
Implement comprehensive error handling
Include Logger.log statements for debugging

Contribution Guidelines
Feature Development Process

Create Feature Branch: git checkout -b feature/new-compliance-module
Write comprehensive JSDoc documentation
Include error handling and logging
Test with sample data before deployment
Update user manual if UI changes

Testing Requirements

Test all automated triggers manually
Verify email notifications work correctly
Validate data entry forms and calculations
Check permission requirements

Development Roadmap
Version 2.2 (Planned)

Hours of Service Integration: ELD data import and HOS tracking
Vehicle Inspection Module: DVIR management and DOT inspection scheduling
Environmental Monitoring: Groundwater and soil testing documentation

Version 2.3 (Future)

Mobile Application: Field data entry for drivers and technicians
Advanced Analytics: Predictive compliance alerts and trend analysis
API Integrations: Fleet management and fuel monitoring systems


📞 Support
Documentation Resources

User Manual: Complete operational guide with setup instructions
Video Tutorials: Step-by-step system configuration and usage
Compliance Guides: Regulatory requirement explanations and tracking
Best Practices: Industry-tested operational procedures

Technical Support
Self-Service Resources

Troubleshooting Guide: Common issues and solutions
FAQ Database: Frequently asked questions and answers
System Status: Real-time system health and performance monitoring
Community Forum: User community for tips and shared experiences

Direct Support Options

Email: technical-support@truenorthdatastrategies.com
Business Hours: Monday-Friday 8:00 AM - 6:00 PM Mountain Time
Emergency Support: Critical compliance issues and system failures
Training Services: Custom user training and system optimization

Professional Services

Custom Implementation: Tailored setup for unique operational requirements
Regulatory Consulting: Compliance expertise and audit preparation
System Integration: Connection with existing fleet and fuel management systems
Ongoing Maintenance: Regular system updates and optimization


📄 License
MIT License - Copyright (c) 2024 True North Data Strategies LLC
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

📞 Contact Information
True North Data Strategies LLC
Enterprise automation for businesses that existed before iPhones

Website: www.truenorthdatastrategies.com
Email: info@truenorthdatastrategies.com
Support: support@truenorthdatastrategies.com
Emergency: emergency@truenorthdatastrategies.com

Business Hours: Monday-Friday 8:00 AM - 6:00 PM Mountain Time
Emergency Support: Available 24/7 for critical compliance issues

🙏 Acknowledgments

Google Apps Script Team - For the robust automation platform
Petroleum Industry Professionals - For regulatory expertise and operational insights
Beta Testing Partners - For real-world validation and feedback
Open Source Community - For development tools and best practices

Built with enterprise reliability for the petroleum industry's most demanding operational requirements.

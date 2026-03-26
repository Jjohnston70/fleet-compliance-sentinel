# Example Fleet Co Complete Operations System
## User Manual & Setup Guide

### Version 2.1 | Production Ready System
*Comprehensive petroleum operations management with automated compliance monitoring*

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Initial Setup Guide](#initial-setup-guide)
3. [Module User Guides](#module-user-guides)
4. [Administrative Functions](#administrative-functions)
5. [Automation & Alerts](#automation--alerts)
6. [Troubleshooting](#troubleshooting)
7. [Maintenance & Updates](#maintenance--updates)

---

## System Overview

### What This System Does

The Example Fleet Co Complete Operations System is your digital command center for petroleum operations. It handles everything from EPA compliance tracking to daily ullage logs, making sure nothing falls through the cracks.

**Core Capabilities:**
- **Compliance Monitoring**: Automated tracking of EPA vapor tests, CDL renewals, medical certificates
- **Ullage Management**: Daily inventory tracking with variance detection
- **Asset Tracking**: Complete lifecycle management of company technology
- **Driver Records**: DOT-compliant driver qualification file management
- **Knowledge Base**: Searchable procedures and safety protocols
- **Emergency Contacts**: Instant access to critical contact information
- **Automated Alerts**: Email notifications before things expire or go wrong

### System Architecture

```
Example Fleet Co System
├── Knowledge Base (Procedures & Safety)
├── Compliance Tracking (EPA, DOT, Permits)
├── Ullage Logs (Daily Inventory)
├── Driver Records (CDL, Medical, DOT Files)
├── Company Assets (Phones, Tablets, Laptops)
├── Contact Directory (Emergency & Personnel)
├── Categories (Organization System)
└── Approval Workflow (Document Review)
```

---

## Initial Setup Guide

### Phase 1: Google Apps Script Deployment

**Time Required:** 15-20 minutes  
**Technical Level:** Beginner-friendly with copy/paste

#### Step 1: Create the Script Project

1. **Open Google Apps Script**
   - Go to [script.google.com](https://script.google.com)
   - Sign in with your Google account (use your company account)
   - Click "New Project"

2. **Prepare the Code**
   - Delete the default `function myFunction() {}` code
   - Copy the entire Example Fleet Co script from your document
   - Paste it into the Apps Script editor
   - Save the project (Ctrl+S or File > Save)
   - Name it: "Example Fleet Co Complete System"

#### Step 2: Initial Deployment

1. **Run the Setup Function**
   - In the function dropdown, select `setupExampleFleetCoSystem`
   - Click the "Run" button (play icon)
   - **Important**: You'll be prompted for permissions - authorize everything

2. **Permission Authorization**
   - Click "Review permissions"
   - Choose your Google account
   - Click "Advanced" if you see a warning
   - Click "Go to Example Fleet Co Complete System (unsafe)" 
   - Click "Allow" for all permissions

3. **Verify Deployment**
   - Check the execution log for success messages
   - Copy the spreadsheet URL from the log
   - Open the URL to verify your system is created

#### Step 3: Customize for Your Operations

**Critical Customizations Required:**

1. **Email Addresses** (Search and replace throughout)
   - Replace all `@examplefleetco.com` addresses with your actual emails
   - Update emergency contact emails in compliance alerts
   - Modify notification recipients for each alert type

2. **Company Information**
   - Update company name references
   - Modify phone numbers in contact directory
   - Adjust radio channel assignments

3. **Tank Configuration**
   - Edit tank IDs in ullage logs (T-001, T-002, etc.)
   - Update tank capacities and product types
   - Modify variance thresholds if needed

4. **Compliance Dates**
   - Update all sample dates to reflect your actual schedules
   - Set correct renewal periods for your permits and certifications
   - Adjust alert timing (currently 60, 30, 15 days before expiration)

### Phase 2: Data Population

**Time Required:** 2-3 hours  
**Recommended Approach:** Start with critical data, build over time

#### Essential First Day Data:

1. **Compliance Tracking Sheet**
   - Current EPA vapor test dates and certificates
   - All driver CDL and medical certificate expiration dates
   - Active permits and their renewal dates
   - Insurance policy renewal dates

2. **Driver Records Sheet**
   - Complete information for all current drivers
   - Emergency contact information
   - Current vehicle assignments

3. **Contact Directory Sheet**
   - Verify all phone numbers and email addresses
   - Update radio channel assignments
   - Confirm emergency availability schedules

4. **Company Assets Sheet**
   - Inventory all phones, tablets, and laptops
   - Record serial numbers and asset tags
   - Document current assignments

---

## Module User Guides

### Knowledge Base Module

**Purpose:** Centralized repository for all operational procedures and safety protocols

#### How to Add New Knowledge Articles

1. **Navigate to Knowledge Base Sheet**
   - Open your Example Fleet Co system spreadsheet
   - Click the "Knowledge Base" tab

2. **Create New Entry (Row)**
   - Find the next empty row
   - Fill in required fields:
     - **KB ID**: Use format KB### (KB008, KB009, etc.)
     - **Title**: Clear, descriptive title
     - **Category**: Safety, Compliance, Operations, or Reference
     - **Summary**: One-sentence overview
     - **Full Content**: Complete procedure or information

3. **Best Practices**
   - Use clear, action-oriented titles
   - Include step-by-step procedures
   - Add relevant tags for searchability
   - Set appropriate priority levels
   - Always include reviewer information

#### Searching the Knowledge Base

**Method 1: Filter by Category**
- Click the filter icon in the Category column
- Select the category you need (Safety, Compliance, etc.)

**Method 2: Text Search**
- Use Ctrl+F (or Cmd+F on Mac)
- Search across titles, content, or tags
- Use the built-in Google Sheets search functionality

### Compliance Tracking Module

**Purpose:** Automated monitoring of all regulatory requirements with email alerts

#### Adding New Compliance Items

1. **Go to Compliance Tracking Sheet**
2. **Required Information:**
   - **Item Type**: Truck Vapor Test, CDL License, Medical Certificate, etc.
   - **Item ID**: Unique identifier (VH-001, DR-001, etc.)
   - **Description**: Clear description of what needs to be tracked
   - **Responsible Person**: Who manages this compliance item
   - **Last Completed**: Most recent completion date
   - **Next Due Date**: When it expires or needs renewal
   - **Frequency**: Annual, 2 Years, 5 Years, etc.
   - **Alert Days**: How many days before expiration to send alerts (default: 60)
   - **Email Recipients**: Comma-separated list of email addresses

3. **Example Entry:**
   ```
   Item Type: Medical Certificate
   Item ID: DR-005
   Description: New Driver DOT Physical
   Responsible Person: HR Manager
   Last Completed: 1/15/2024
   Next Due Date: 1/15/2026
   Frequency: 2 Years
   Status: Current
   Alert Days: 45
   Email Recipients: hr@yourcompany.com,safety@yourcompany.com
   ```

#### Understanding Status Indicators

- **Current** (Green): Item is up to date
- **Due Soon** (Yellow): Within alert window
- **Overdue** (Red): Past due date - immediate action required

### Ullage Logs Module

**Purpose:** Daily inventory tracking with automated variance detection

#### Daily Ullage Entry Process

1. **Complete Physical Measurements (6:00 AM Daily)**
   - Allow tanks to settle 30+ minutes after last activity
   - Check for vapors before opening hatches
   - Use calibrated ullage tape/stick
   - Take temperature readings at mid-tank level
   - Check for water contamination

2. **Enter Data in Ullage Logs Sheet**
   - **Date/Time**: Automatic or manual entry
   - **Tank ID**: Select from dropdown (T-001, T-002, etc.)
   - **Ullage Depth**: Measurement in inches (to nearest 1/8")
   - **Temperature**: Degrees Fahrenheit
   - **Water Level**: Inches of water detected
   - **Deliveries/Sales**: Any product movement since last reading

3. **System Calculations**
   - Calculated gallons are computed automatically
   - Daily variance shows inventory changes
   - Variance percentage flags issues >1.0%
   - Investigation required field tracks follow-up needs

#### Variance Investigation Protocol

**When Variance >0.5%:**
1. Double-check measurements and calculations
2. Verify delivery and sales records
3. Check for equipment calibration issues
4. Document findings in Notes field

**When Variance >1.0%:**
1. Immediate investigation required
2. Set "Investigation Required" to "Yes"
3. Notify Operations Manager immediately
4. Document complete investigation process

### Driver Records Module

**Purpose:** Comprehensive driver qualification file management

#### Adding New Driver

1. **Driver Information Entry**
   - Assign unique Driver ID (DR-###)
   - Complete all required fields
   - Ensure emergency contact information is current

2. **Required Documentation Tracking**
   - CDL license number and expiration
   - Hazmat endorsement status and expiration
   - Tank vehicle endorsement
   - Medical certificate expiration
   - Last MVR (Motor Vehicle Record) check date

3. **DOT Compliance Requirements**
   - Maintain physical and digital driver qualification files
   - Update MVR annually on driver anniversary date
   - Track all required training completions
   - Document any violations or incidents

#### Driver Status Management

**Active Drivers:**
- All certifications current
- Regular route assignments
- Compliant with all DOT requirements

**Inactive Status:**
- Use for drivers on leave, terminated, or suspended
- Maintain records per retention requirements
- Update status immediately when changes occur

### Company Assets Module

**Purpose:** Complete lifecycle tracking of technology equipment

#### Asset Assignment Process

1. **New Equipment Setup**
   - Generate unique asset tag
   - Record all device specifications
   - Install required software and security
   - Complete assignment documentation

2. **Assignment Documentation**
   - Employee signs equipment responsibility agreement
   - Record assignment date and location
   - Set up remote wipe capability
   - Configure automatic backups

3. **Ongoing Management**
   - Quarterly condition assessments
   - Annual insurance value updates
   - Monitor warranty expirations
   - Track service and maintenance

#### Equipment Return Process

**When Employee Leaves or Equipment Reassigned:**
1. Schedule formal return appointment
2. Complete condition assessment
3. Backup and transfer business data
4. Perform security wipe of all data
5. Update tracking system
6. Prepare for reassignment or disposal

### Contact Directory Module

**Purpose:** Emergency contact management and personnel directory

#### Directory Maintenance

1. **Regular Updates Required**
   - Verify phone numbers monthly
   - Update emergency availability schedules
   - Confirm radio channel assignments
   - Test emergency contact procedures

2. **Emergency Contact Protocol**
   - Primary emergency: 911
   - Company emergency: Follow chain of command
   - After-hours: Use emergency phone tree
   - Radio backup: Monitor emergency channels

---

## Administrative Functions

### User Access Management

**Setting Up User Permissions:**

1. **Spreadsheet Sharing**
   - Click "Share" button in top right
   - Add email addresses of authorized users
   - Set appropriate permission levels:
     - **Editor**: Can modify data (operations staff)
     - **Commenter**: Can add comments only (some field staff)
     - **Viewer**: Read-only access (executives, external auditors)

2. **Department-Specific Access**
   - Consider creating separate sharing groups for:
     - Executive team (full access)
     - Operations team (edit operations data)
     - HR team (edit driver records)
     - Field staff (view-only or specific sheets)

### Data Backup and Security

**Automated Backups:**
- Google Sheets automatically saves and versions your data
- Revision history available under File > Version history
- Download periodic Excel backups for local storage

**Security Best Practices:**
- Use company Google accounts only
- Enable two-factor authentication
- Regular access review (quarterly)
- Monitor sharing permissions

### Reporting and Analytics

**Built-in Reports:**
- Compliance dashboard with status indicators
- Ullage variance trending
- Asset utilization reports
- Driver certification status

**Custom Reports:**
- Use Google Sheets filtering and pivot tables
- Export data for external analysis
- Create charts and graphs for executive reporting

---

## Automation & Alerts

### Email Alert System

**Automated Triggers:**
- **Weekly Compliance Check**: Every Monday at 8:00 AM
- **Daily Ullage Reminder**: Every day at 5:30 AM  
- **Monthly Asset Audit**: First Monday of each month at 9:00 AM

#### Customizing Alert Recipients

1. **Compliance Alerts**
   - Edit "Email Recipients" column in Compliance Tracking sheet
   - Use comma-separated email addresses
   - Include role-based emails (hr@company.com, fleet@company.com)

2. **Ullage Reminders**
   - Modify recipient list in `sendDailyUllageReminder()` function
   - Default: operations team and dispatch

3. **Asset Audit Reminders**
   - Update recipient list in `sendMonthlyAssetAuditReminder()` function
   - Default: management team

#### Customizing Alert Timing

**To Change Alert Schedule:**
1. Open Google Apps Script editor
2. Find the `setupAutomationTriggers()` function
3. Modify the trigger timing:
   ```javascript
   // Change from weekly Monday 8 AM to daily 7 AM
   ScriptApp.newTrigger('performWeeklyComplianceCheck')
     .timeBased()
     .everyDays(1)  // Changed from everyWeeks(1)
     .atHour(7)     // Changed from atHour(8)
     .create();
   ```

#### Alert Content Customization

**Modify Email Templates:**
- Edit the HTML email body in alert functions
- Add company logos or branding
- Adjust warning thresholds and messaging
- Include additional contact information

### Manual Alert Testing

**Test Functions Available:**
- `runManualComplianceCheck()`: Test compliance monitoring
- `sendManualUllageReminder()`: Test daily ullage reminder
- `sendMonthlyAssetAuditReminder()`: Test asset audit reminder

**How to Test:**
1. Open Apps Script editor
2. Select the test function from dropdown
3. Click Run button
4. Check execution log for results
5. Verify emails are received

---

## Troubleshooting

### Common Issues and Solutions

#### Issue: Email Alerts Not Sending

**Symptoms:** No automated emails received, manual tests fail

**Solutions:**
1. **Check Email Quota**
   - Google Apps Script has daily email limits
   - Consumer accounts: 100 emails/day
   - Business accounts: 1,500 emails/day

2. **Verify Email Addresses**
   - Ensure all recipient emails are valid
   - Check for typos in email addresses
   - Test with a simple email first

3. **Check Trigger Status**
   - Go to Apps Script > Triggers tab
   - Verify triggers are active and not disabled
   - Check trigger execution history for errors

**Code Fix:**
```javascript
// Add error handling to email functions
try {
  MailApp.sendEmail({
    to: recipients,
    subject: subject,
    htmlBody: emailBody
  });
  Logger.log('Email sent successfully');
} catch (error) {
  Logger.log('Email error: ' + error.toString());
}
```

#### Issue: Compliance Dates Not Calculating Correctly

**Symptoms:** Wrong status colors, incorrect "days until due" calculations

**Solutions:**
1. **Check Date Formats**
   - Ensure dates are in proper format (MM/DD/YYYY)
   - Verify timezone settings in Google Sheets
   - Use consistent date formatting across all sheets

2. **Verify Calculation Logic**
   - Check the `performWeeklyComplianceCheck()` function
   - Ensure alert days are set correctly
   - Verify date comparison logic

#### Issue: Ullage Calculations Incorrect

**Symptoms:** Wrong gallon calculations, variance percentages off

**Solutions:**
1. **Tank Capacity Verification**
   - Verify tank capacity values are correct
   - Check ullage-to-gallon conversion formulas
   - Ensure temperature correction factors are applied

2. **Formula Updates**
   ```javascript
   // Update ullage calculation formula
   const calculatedGallons = (tankCapacity - (ullageDepth * conversionFactor)) * temperatureCorrection;
   ```

#### Issue: Asset Tracking Data Loss

**Symptoms:** Asset information disappearing, assignment records lost

**Solutions:**
1. **Check Revision History**
   - File > Version history > See version history
   - Restore from recent backup if necessary
   - Identify when data was last correct

2. **Implement Data Validation**
   - Add dropdown lists for critical fields
   - Set up data validation rules
   - Create protected ranges for formulas

### Getting Help

**Support Resources:**
1. **System Documentation**: This manual
2. **Google Sheets Help**: support.google.com/docs/
3. **Apps Script Documentation**: developers.google.com/apps-script/
4. **Company IT Support**: Your internal team

**Escalation Process:**
1. Check this troubleshooting section
2. Review execution logs in Apps Script
3. Test with manual functions
4. Contact system administrator
5. Escalate to IT support if needed

---

## Maintenance & Updates

### Regular Maintenance Tasks

#### Weekly Tasks (Every Monday)
- **Review compliance alert results**
- **Verify automated triggers ran successfully**
- **Check for any system error notifications**
- **Update any expired contact information**

#### Monthly Tasks (First Week)
- **Asset audit completion verification**
- **Update insurance values and coverage**
- **Review and update emergency contact procedures**
- **Backup spreadsheet data locally**

#### Quarterly Tasks
- **Complete system access review**
- **Update user permissions as needed**
- **Review and update knowledge base articles**
- **Test all emergency procedures and contacts**

#### Annual Tasks
- **Complete system security audit**
- **Review and update all compliance schedules**
- **Update tank capacity charts and conversions**
- **Refresh all contact directory information**

### System Updates and Enhancements

#### Adding New Features

**Process for Modifications:**
1. **Plan the Change**
   - Document what you want to add or modify
   - Identify which sheets and functions are affected
   - Plan testing procedures

2. **Make a Backup**
   - File > Make a copy (name it with date)
   - Download Excel version as additional backup
   - Document current working configuration

3. **Implement Changes**
   - Modify sheets structure if needed
   - Update Apps Script functions
   - Test changes with sample data

4. **Deploy and Test**
   - Test all automated functions
   - Verify email alerts work correctly
   - Train users on any new features

#### Version Control

**Tracking Changes:**
- Use Google Sheets version history
- Document major changes in a change log
- Keep notes on customizations made for your company

**Change Log Template:**
```
Date: 1/15/2024
Version: 2.2
Changes: 
- Added new tank T-006 to ullage logs
- Updated email addresses for compliance team
- Modified alert timing for medical certificates
Modified by: [Your name]
Tested by: [Tester name]
```

### Data Retention and Compliance

#### Record Retention Requirements

**DOT Requirements:**
- Driver qualification files: 3 years after driver leaves
- Drug/alcohol test records: 5 years minimum
- Training records: 3 years minimum
- Medical certificates: 3 years after expiration

**EPA Requirements:**
- Vapor test records: 3 years minimum
- Spill reports: 3 years minimum
- Environmental permits: Life of permit + 3 years

**Company Records:**
- Asset tracking: Life of asset + 3 years
- Compliance certificates: 5 years recommended
- Ullage logs: 3 years minimum for tax/regulatory purposes

#### Data Archival Process

**Annual Archival (Recommended):**
1. Create dated backup of entire system
2. Remove old data beyond retention requirements
3. Archive critical documents in separate storage
4. Update system with new year structure

---

## Appendix

### Function Reference Guide

**Core Setup Functions:**
- `setupExampleFleetCoSystem()`: Complete system deployment
- `setupAutomationTriggers()`: Configure automated alerts
- `getSystemStatus()`: System health check

**Monitoring Functions:**
- `performWeeklyComplianceCheck()`: Automated compliance monitoring
- `sendDailyUllageReminder()`: Daily inventory reminder
- `sendMonthlyAssetAuditReminder()`: Asset audit reminder

**Manual Override Functions:**
- `runManualComplianceCheck()`: Test compliance monitoring
- `sendManualUllageReminder()`: Test ullage reminder
- `sendManualAssetAuditReminder()`: Test asset reminder

### Emergency Procedures

**System Down Emergency Protocol:**
1. **Immediate Actions**
   - Verify Google Sheets access
   - Check internet connectivity
   - Try accessing from different device/browser

2. **Backup Procedures**
   - Use local Excel backups if available
   - Implement manual tracking temporarily
   - Contact all stakeholders about system status

3. **Recovery Process**
   - Restore from most recent backup
   - Re-enter any data lost since backup
   - Test all automated functions
   - Notify users when system is restored

### Contact Information for Support

**Google Support Resources:**
- Google Workspace Support: admin.google.com
- Apps Script Help: developers.google.com/apps-script/support
- Google Sheets Help: support.google.com/docs/

**System Administrator:**
- [Your company contact information]
- [Emergency contact for after-hours issues]
- [Escalation procedures for critical problems]

---

*This manual covers the complete Example Fleet Co Operations System. For additional support or customization requests, contact your system administrator.*

**System Version:** 2.1 Production Ready  
**Manual Last Updated:** [Current Date]  
**Next Review Date:** [Quarterly Review Schedule]
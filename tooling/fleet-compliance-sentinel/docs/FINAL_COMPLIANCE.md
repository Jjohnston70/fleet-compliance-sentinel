/**
 * ========================================================================
 * EXAMPLE FLEET CO - COMPLETE PRODUCTION SYSTEM
 * ========================================================================
 * 
 * FINAL INTEGRATED SCRIPT - Ready for Deployment
 * 
 * Features:
 * ✅ Petroleum compliance tracking (vapor testing, CDL, medical certs)
 * ✅ Ullage log management (TANK CALIBRATION REMOVED per requirements)
 * ✅ Company asset tracking (phones, tablets, laptops)
 * ✅ Driver records and DOT file management
 * ✅ Emergency contact directory
 * ✅ Automated compliance monitoring with email alerts
 * ✅ Knowledge base with petroleum-specific procedures
 * 
 * Deployment: Run setupExampleFleetCoSystem() to create complete system
 */

// ========================================================================
// MAIN SETUP FUNCTION - Creates Complete Example Fleet Co System
// ========================================================================

/**
 * MASTER SETUP FUNCTION - Deploy this first!
 */
function setupExampleFleetCoSystem() {
  Logger.log('🛢️ Setting up Complete Example Fleet Co System...');
  
  // Create the main system spreadsheet
  const ss = SpreadsheetApp.create('Example Fleet Co Complete Operations System');
  const ssId = ss.getId();
  Logger.log(`✅ Created system spreadsheet: ${ssId}`);
  
  // Remove default sheet
  ss.deleteSheet(ss.getSheetByName('Sheet1'));
  
  // Create all system sheets in order
  setupKnowledgeBaseSheet(ss);
  setupComplianceTrackingSheet(ss);
  setupUllageLogsSheet(ss);          // NEW: Ullage logs (replaces tank calibration)
  setupDriverRecordsSheet(ss);
  setupCompanyAssetsSheet(ss);
  setupContactDirectorySheet(ss);
  setupCategoriesSheet(ss);
  setupApprovalWorkflowSheet(ss);
  
  // Set up automated triggers
  setupAutomationTriggers();
  
  Logger.log('🎯 Complete Example Fleet Co System deployed successfully!');
  Logger.log(`📋 Access your system: ${ss.getUrl()}`);
  Logger.log('📧 Automated compliance monitoring active');
  Logger.log('⏰ Daily ullage reminders scheduled');
  
  return {
    spreadsheetId: ssId,
    url: ss.getUrl(),
    status: 'Production Ready'
  };
}

// ========================================================================
// KNOWLEDGE BASE SHEET - Petroleum Operations Procedures
// ========================================================================

function setupKnowledgeBaseSheet(ss) {
  Logger.log('📖 Creating knowledge base sheet...');
  
  const sheet = ss.insertSheet('Knowledge Base');
  
  const headers = [
    'KB ID', 'Title', 'Category', 'Subcategory', 'Content Type', 
    'Summary', 'Full Content', 'Tags', 'Author', 'Reviewer',
    'Status', 'Priority', 'Created Date', 'Last Updated', 'Version',
    'Related Links', 'Attachments', 'Access Level', 'View Count', 'Rating'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format header row
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#1565c0');
  headerRange.setFontColor('white');
  headerRange.setFontWeight('bold');
  headerRange.setWrap(true);
  
  // Set column widths for optimal viewing
  sheet.setColumnWidth(1, 80);   // KB ID
  sheet.setColumnWidth(2, 300);  // Title
  sheet.setColumnWidth(3, 120);  // Category
  sheet.setColumnWidth(6, 400);  // Summary
  sheet.setColumnWidth(7, 500);  // Full Content
  
  // Enhanced petroleum industry knowledge entries (TANK CALIBRATION REMOVED)
  const knowledgeEntries = [
    [
      'KB001', 'Hazmat Spill Response Procedure', 'Safety', 'Emergency Response', 'Procedure',
      'Step-by-step response protocol for fuel spills including containment, cleanup, and reporting requirements',
      `IMMEDIATE ACTIONS (First 5 minutes):
1. ENSURE PERSONAL SAFETY - Do not enter spill area without proper PPE
2. STOP THE SOURCE - If safe to do so, stop the leak/spill
3. EVACUATE AREA - Keep personnel 150+ feet upwind from spill
4. CALL 911 if spill is >25 gallons or poses immediate danger

CONTAINMENT (5-15 minutes):
1. Use absorbent booms to prevent spread
2. Apply clay absorbent or sand around perimeter
3. Never use water to flush petroleum products
4. Block storm drains and waterways

CLEANUP & REPORTING:
- EPA National Response Center: 1-800-424-8802 (spills >100 gallons)
- State Environmental Agency within 24 hours
- Document everything with photos and written report
- Keep all cleanup materials for proper disposal`,
      'emergency,spill,hazmat,cleanup,epa,safety,response', 'Safety Director', 'General Manager',
      'Approved', 'Critical', new Date(), new Date(), '2.1',
      'EPA Spill Response Guide', '', 'All Staff', 147, 4.9
    ],

    [
      'KB002', 'Daily Ullage Log Management System', 'Operations', 'Inventory Control', 'Procedure',
      'Complete ullage measurement procedures, log recording, and inventory variance tracking protocols',
      `DAILY ULLAGE READINGS (Performed at 6:00 AM daily):

EQUIPMENT NEEDED:
- Ullage tape/stick (calibrated monthly)
- Digital temperature gauge
- Water detection paste
- Ullage log tablet/sheets
- Tank capacity charts

MEASUREMENT PROCEDURE:
1. Allow tanks to settle minimum 30 minutes after last activity
2. Open tank hatch carefully - check for vapors before entry
3. Insert ullage tape to liquid surface (measure space above product)
4. Record ullage depth to nearest 1/8 inch
5. Take temperature reading at mid-tank level
6. Check for water contamination using detection paste
7. Record all measurements in ullage log system immediately

INVENTORY CALCULATIONS:
- Use tank-specific capacity charts for ullage-to-gallons conversion
- Apply temperature correction factors per API standards
- Calculate daily variance: Previous + Deliveries - Sales - Current
- Investigate any variance >0.5% of tank capacity
- Document all discrepancies with photos and notes

QUALITY CONTROL:
- Weekly calibration check of measuring equipment
- Monthly verification of tank capacity charts
- Immediate investigation of variances >1.0%
- Keep ullage logs for minimum 3 years per regulations`,
      'ullage,inventory,tanks,measurement,logs,daily,operations,variance', 'Operations Manager', 'General Manager',
      'Approved', 'High', new Date(), new Date(), '2.3',
      'API Tank Measurement Standards', '', 'Operations', 89, 4.8
    ],

    [
      'KB003', 'EPA Truck Vapor Testing Requirements', 'Compliance', 'Vehicle Testing', 'Procedure',
      'Complete EPA vapor recovery system testing schedule including 1-year, 5-year, and air pollution compliance',
      `TRUCK VAPOR TESTING OVERVIEW:
All petroleum delivery trucks must undergo regular vapor recovery testing to comply with EPA air quality regulations.

1-YEAR VAPOR TESTING (Annual):
REQUIRED FOR: All trucks with vapor recovery systems
TESTING INCLUDES:
- Static pressure decay test (must hold 18" H2O for 5 minutes)
- Crankcase pressure test
- Liquid retention test
- System tightness verification
- Pressure/vacuum valve testing

PROCEDURE:
1. Schedule with EPA-certified testing facility 30 days before due
2. Ensure truck is empty and vapor-free before testing
3. Provide previous test certificates and maintenance records
4. Complete EPA test forms accurately
5. File certificates in DOT compliance folder within 5 days

5-YEAR VAPOR TESTING (Major Inspection):
ADDITIONAL REQUIREMENTS:
- Complete system rebuild inspection
- All seals and gaskets replacement
- Pressure vessel re-certification
- Full vapor line pressure testing
- Electronic system calibration and certification

ANNUAL AIR POLLUTION TESTING:
REQUIRED FOR: All commercial vehicles >10,000 lbs
- Emissions opacity testing
- Particulate matter measurement
- NOx levels verification
- CO2 emissions check

VIOLATION PENALTIES:
- $1,000-$10,000 per violation
- Out-of-service orders
- Environmental remediation costs`,
      'vapor,testing,epa,emissions,truck,compliance,air,pollution,certification', 'Fleet Manager', 'Compliance Officer',
      'Approved', 'Critical', new Date(), new Date(), '1.5',
      'EPA Vapor Recovery Regulations CFR 40', '', 'Fleet Management', 95, 5.0
    ],

    [
      'KB004', 'CDL and Medical Certificate Tracking', 'Compliance', 'Driver Certification', 'Procedure',
      'Complete system for tracking driver CDL licenses, medical certificates, endorsements, and automated renewal alerts',
      `CDL TRACKING REQUIREMENTS:
All commercial drivers must maintain valid CDL with proper endorsements for petroleum delivery operations.

REQUIRED ENDORSEMENTS:
- Class A or B Commercial Driver License
- Hazmat Endorsement (X or H) - Requires TSA background check
- Tank Vehicle Endorsement (N) - Required for liquid transport
- Air Brakes Endorsement (if vehicle equipped)

RENEWAL SCHEDULE TRACKING:
- CDL License: Every 4-8 years (varies by state)
- Hazmat Endorsement: Every 5 years with background check
- Medical Certificate: Every 2 years (or 1 year if conditions exist)
- Annual driver record review and violation certification

AUTOMATED TRACKING SYSTEM:
1. Enter all driver certifications in Driver Records sheet
2. System automatically calculates expiration dates
3. Email alerts sent 60, 30, and 15 days before expiration
4. Update tracking immediately upon renewal
5. Maintain copies in driver DOT qualification files

MEDICAL CERTIFICATE REQUIREMENTS:
- DOT Physical by FMCSA-registered medical examiner
- Certificate must be valid and on file
- Copy submitted to state DMV within 15 days
- Any restrictions noted and communicated to operations

COMPLIANCE VIOLATIONS & PENALTIES:
- Driving without valid CDL: $1,000+ fine, criminal charges
- Expired medical certificate: Immediate out-of-service order
- Missing endorsements: Cannot operate commercial vehicle
- Company liability for allowing unqualified drivers`,
      'cdl,medical,certificate,driver,hazmat,endorsement,dot,tracking,compliance', 'HR Manager', 'Safety Director',
      'Approved', 'Critical', new Date(), new Date(), '1.8',
      'FMCSA Driver Qualification Requirements 49 CFR 391', '', 'Management', 78, 4.9
    ],

    [
      'KB005', 'DOT Driver Qualification File Management', 'Compliance', 'Driver Records', 'Procedure',
      'Complete DOT driver qualification file requirements, document management, retention, and annual review procedures',
      `DOT DRIVER QUALIFICATION FILE (DQF) REQUIREMENTS:
Federal regulations mandate specific documents in each commercial driver's qualification file.

REQUIRED DOCUMENTS (8 Core Items):
1. Driver Application (Employment Application)
2. Motor Vehicle Record (MVR) - Updated annually
3. Road Test Certificate or License Waiver
4. Medical Examiner Certificate (Current copy)
5. Annual Driver Record Review and Certification
6. Drug and Alcohol Test Records (Pre-employment, random, post-accident)
7. Previous Employment Driving Record Inquiry (3 years)
8. Annual Driver Certification of Traffic Violations

DOCUMENT MANAGEMENT PROCEDURES:
FILE SETUP:
- Create both physical and digital driver folders
- Label with driver name, hire date, and unique ID
- Use standardized filing system for easy audit access
- Cross-reference with driver ID in tracking systems

ANNUAL REQUIREMENTS:
- Update MVR by driver anniversary date
- Complete comprehensive driver record review
- Obtain signed annual violation certification from driver
- Review and update medical certificate status
- Document any training completions or violations

RETENTION REQUIREMENTS:
- Active driver files: Keep current and accessible
- Former driver files: Retain 3 years after termination
- Drug/alcohol test records: Minimum 5 years
- Medical certificates: 3 years after expiration
- Training records: 3 years minimum

AUDIT COMPLIANCE CHECKLIST:
□ All 8 required documents present and current
□ Medical certificates valid with proper examiner credentials
□ MVR updated within past 12 months
□ Annual review completed and signed by qualified reviewer
□ Drug/alcohol test records complete with proper chain of custody
□ Violation certifications current (annual requirement)
□ Files properly organized and easily accessible for inspection`,
      'dot,dqf,driver,qualification,records,compliance,audit,retention,mvr', 'HR Manager', 'General Manager',
      'Approved', 'Critical', new Date(), new Date(), '2.0',
      'FMCSA Driver Qualification Regulations 49 CFR 391', '', 'HR & Management', 65, 4.7
    ],

    [
      'KB006', 'Company Technology Asset Management', 'Operations', 'Asset Management', 'Procedure',
      'Complete tracking system for phones, tablets, laptops, and work computers including assignment and maintenance',
      `COMPANY ASSET TRACKING OVERVIEW:
Comprehensive management of all company-issued technology equipment including lifecycle tracking and security protocols.

ASSET CATEGORIES:
1. MOBILE PHONES
- Executive smartphones (iPhone Pro models)
- Employee business phones
- Emergency communication devices
- Driver route phones

2. TABLETS & MOBILE DEVICES
- Driver route tablets with GPS
- Inventory management tablets
- Safety inspection devices
- Dispatch communication tablets

3. LAPTOPS & PORTABLE COMPUTERS
- Executive/management laptops
- Field service laptops
- Remote work computers
- Backup/replacement units

4. DESKTOP COMPUTERS & WORKSTATIONS
- Office workstations
- Dispatch computers with dual monitors
- Accounting workstations
- Specialized software terminals

ASSIGNMENT & TRACKING PROCEDURES:
NEW EQUIPMENT SETUP:
1. Generate unique asset tag and record serial number
2. Document specifications, purchase date, and warranty info
3. Install required software, security, and company applications
4. Create comprehensive asset record in tracking system
5. Employee signs equipment responsibility agreement

TRACKING INFORMATION (Maintained for Each Asset):
- Asset tag number and manufacturer serial number
- Make, model, specifications, and operating system
- Purchase date, cost, warranty period, and vendor info
- Assigned employee, assignment date, and location
- Current condition assessment and last service date
- Insurance coverage, replacement cost, and depreciation
- Phone numbers (for mobile devices) and plan details

MAINTENANCE & LIFECYCLE MANAGEMENT:
QUARTERLY MAINTENANCE:
- Physical condition inspection and cleaning
- Software updates and security patch installation
- Performance optimization and disk cleanup
- Data backup verification and cloud sync check
- Usage compliance review and policy adherence

ANNUAL PROCEDURES:
- Complete physical inventory audit with reconciliation
- Update replacement cost values for insurance
- Review and update insurance coverage as needed
- Evaluate upgrade needs based on business requirements
- Update security protocols and access permissions

SECURITY REQUIREMENTS:
- Multi-factor authentication on all devices
- Automatic screen locks with company-approved timeouts
- Remote wipe capability for all mobile devices
- Regular automated backup to secure company cloud storage
- Full encryption for all devices containing sensitive data
- VPN access required for all remote connections

REPLACEMENT CRITERIA:
Equipment scheduled for replacement when:
- Warranty expires and repair costs exceed 50% of replacement cost
- Performance no longer meets business operational needs
- Security updates no longer supported by manufacturer
- Physical damage beyond economical repair
- Employee role change requires upgraded capabilities

ASSET RETURN & DISPOSAL PROCESS:
Upon employee termination or equipment reassignment:
1. Schedule formal return appointment with IT personnel
2. Complete detailed asset condition assessment and documentation
3. Backup and transfer all business-critical data
4. Perform complete security wipe of all personal and company data
5. Update tracking system with return date and condition notes
6. Prepare asset for reassignment, storage, or secure disposal

LOSS/THEFT PROCEDURES:
- Immediate notification to IT support and management (within 2 hours)
- Police report filed within 24 hours for theft incidents
- Insurance claim initiated within 48 hours
- Remote wipe activated immediately if device supports it
- Update tracking system with complete incident details
- Employee liability assessment per company policy and agreement`,
      'assets,tracking,phones,tablets,laptops,computers,inventory,technology,security,lifecycle', 'IT Manager', 'Operations Manager',
      'Approved', 'High', new Date(), new Date(), '2.1',
      'Company IT Security Policies, Asset Management Best Practices', '', 'Management', 52, 4.6
    ],

    [
      'KB007', 'Emergency Contact Directory & Response Protocols', 'Reference', 'Emergency Response', 'Directory',
      'Complete emergency contact information for all critical situations, regulatory agencies, and response protocols',
      `IMMEDIATE EMERGENCY CONTACTS:
911 - Fire, Police, Medical Emergency (Primary emergency response)
Poison Control Center: 1-800-222-1222 (24/7 hazmat exposure)
National Response Center: 1-800-424-8802 (EPA spills >100 gallons)

REGULATORY AGENCIES:
EPA Regional Office: (555) 123-4567 (Environmental emergencies)
State Environmental Agency: (555) 234-5678 (Permits & violations)
State Fire Marshal Office: (555) 345-6789 (Facility inspections)
DOT Commercial Enforcement: (555) 456-7890 (Vehicle violations)
OSHA Regional Office: (555) 567-8901 (Workplace safety)

COMPANY EMERGENCY RESPONSE TEAM:
General Manager: John Smith
- Office: (555) 100-0001
- Mobile: (555) 100-0101 (Available 24/7)
- Email: j.smith@examplefleetco.com
- Radio: Command Channel

Safety Director: Jane Doe
- Office: (555) 100-0002  
- Mobile: (555) 100-0102 (Available 24/7)
- Email: j.doe@examplefleetco.com
- Radio: Safety Channel 9

Operations Manager: Bob Johnson
- Office: (555) 100-0003
- Mobile: (555) 100-0103
- Email: b.johnson@examplefleetco.com
- Radio: Operations Channel 5

Lead Dispatcher: Mary Williams
- Dispatch: (555) 100-0004
- Mobile: (555) 100-0104
- Email: dispatch@examplefleetco.com
- Radio: Dispatch Channel 7

SUPPLIERS & VENDORS:
Primary Fuel Supplier: Chevron Terminal
- Main: 1-800-CHEVRON
- Emergency: (555) 200-0001 (24/7)

Secondary Supplier: Shell Distribution
- Main: 1-800-SHELL-01
- Emergency: (555) 200-0002 (24/7)

Hazmat Cleanup Contractor: Environmental Solutions Inc.
- Main: (555) 333-0001
- Emergency: (555) 333-SPILL (24/7 response)
- Account: CP-12345

Vehicle Repair & Towing: Pete's Truck Service
- Shop: (555) 444-0001
- Emergency/Towing: (555) 444-TOWS (24/7)

EMERGENCY RESPONSE CHAIN OF COMMAND:
1. Immediate Scene Safety: First responder/witness
2. Emergency Services: Call 911 if life safety threatened
3. Company Notification: Safety Director (24/7)
4. Management Notification: General Manager (24/7)
5. Regulatory Notification: As required by situation
6. Customer Notification: Customer service as needed

COMMUNICATION PROTOCOLS:
Radio System:
- Channel 7: Primary dispatch/operations
- Channel 9: Emergency/safety only
- Channel 5: Secondary operations
- Base Station: Main office repeater

Phone Tree Activation:
For major incidents affecting operations:
1. Safety Director activates phone tree
2. General Manager authorizes external communications
3. All department heads notified within 30 minutes
4. All employees notified within 2 hours
5. Customers notified as operations allow

After-Hours Emergency Contact:
Main emergency line: (555) 100-HELP
- Automatically forwards to on-call manager
- Backup forwarding to safety director
- Voice message system for non-urgent issues`,
      'emergency,contacts,phone,regulatory,suppliers,directory,response,protocols', 'Admin Assistant', 'General Manager',
      'Approved', 'Critical', new Date(), new Date(), '2.5',
      'Emergency Response Plan, Regulatory Contact Database', '', 'All Staff', 156, 4.9
    ]
  ];
  
  // Add knowledge entries to sheet
  sheet.getRange(2, 1, knowledgeEntries.length, headers.length).setValues(knowledgeEntries);
  
  // Add conditional formatting for status and priority
  const statusRange = sheet.getRange(2, 11, 100, 1); // Status column
  const priorityRange = sheet.getRange(2, 12, 100, 1); // Priority column
  
  const approvedRule = SpreadsheetApp.newConditionalFormatRule()
    .setRanges([statusRange])
    .whenTextEqualTo('Approved')
    .setBackground('#d4edda')
    .setFontColor('#155724')
    .build();
    
  const criticalRule = SpreadsheetApp.newConditionalFormatRule()
    .setRanges([priorityRange])
    .whenTextEqualTo('Critical')
    .setBackground('#f8d7da')
    .setFontColor('#721c24')
    .build();
  
  sheet.setConditionalFormatRules([approvedRule, criticalRule]);
  sheet.setFrozenRows(1);
  
  Logger.log('✅ Knowledge base sheet created with petroleum procedures');
}

// ========================================================================
// COMPLIANCE TRACKING SHEET - Automated Monitoring System
// ========================================================================

function setupComplianceTrackingSheet(ss) {
  Logger.log('📋 Creating compliance tracking sheet...');
  
  const sheet = ss.insertSheet('Compliance Tracking');
  
  const headers = [
    'Item Type', 'Item ID', 'Description', 'Responsible Person', 
    'Last Completed', 'Next Due Date', 'Frequency', 'Status',
    'Testing Facility', 'Certificate Number', 'Cost', 'Notes',
    'Alert Days', 'Email Recipients'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format headers
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#d32f2f');
  headerRange.setFontColor('white');
  headerRange.setFontWeight('bold');
  
  // Sample compliance tracking data with realistic dates
  const complianceData = [
    ['Truck Vapor Test', 'VH-001', 'Unit 1 Annual Vapor Recovery Test', 'Fleet Manager', 
     new Date(2024, 2, 15), new Date(2025, 2, 15), 'Annual', 'Current',
     'ABC Testing Services', 'VT-2024-001', 850, '1-year test completed successfully', 60, 'fleet@examplefleetco.com'],
    
    ['Truck Vapor Test', 'VH-002', 'Unit 2 5-Year Major Inspection', 'Fleet Manager',
     new Date(2024, 1, 20), new Date(2029, 1, 20), '5 Years', 'Current',
     'XYZ Environmental Testing', 'VT5-2024-002', 2400, 'Major inspection with full system rebuild', 90, 'fleet@examplefleetco.com'],
    
    ['Air Pollution Test', 'VH-001', 'Unit 1 Annual Emissions Test', 'Fleet Manager',
     new Date(2024, 11, 10), new Date(2025, 11, 10), 'Annual', 'Current',
     'State Emissions Testing Center', 'APT-2024-001', 125, 'Passed all EPA emissions requirements', 45, 'fleet@examplefleetco.com'],
     
    ['CDL License', 'DR-001', 'Lead Driver CDL Class A License', 'HR Manager',
     new Date(2024, 5, 30), new Date(2028, 5, 30), '4 Years', 'Current',
     'State DMV', 'CDL-123456789', 75, 'Hazmat and Tank endorsements current', 60, 'hr@examplefleetco.com'],
     
    ['Medical Certificate', 'DR-001', 'Lead Driver DOT Physical', 'HR Manager',
     new Date(2024, 8, 15), new Date(2026, 8, 15), '2 Years', 'Current',
     'DOT Medical Examiner - Dr. Johnson', 'MED-2024-001', 150, 'No medical restrictions noted', 45, 'hr@examplefleetco.com,safety@examplefleetco.com'],
     
    ['Facility Permit', 'FAC-001', 'Underground Storage Tank Operating Permit', 'Compliance Officer',
     new Date(2024, 0, 10), new Date(2025, 0, 10), 'Annual', 'Due Soon',
     'State Environmental Protection Agency', 'UST-2024-001', 500, 'Renewal application submitted, awaiting approval', 30, 'compliance@examplefleetco.com'],
     
    ['Insurance Policy', 'INS-001', 'Commercial Auto & General Liability', 'General Manager',
     new Date(2024, 6, 1), new Date(2025, 6, 1), 'Annual', 'Current',
     'ABC Insurance Company', 'POL-2024-12345', 12500, '$2M liability, $1M property coverage', 45, 'gm@examplefleetco.com,admin@examplefleetco.com'],
     
    ['Environmental Permit', 'ENV-001', 'Air Quality Operating Permit', 'Compliance Officer',
     new Date(2023, 11, 1), new Date(2025, 11, 1), '2 Years', 'Current',
     'State Air Quality Control Board', 'AQ-2023-045', 750, 'Permit covers vapor recovery operations', 60, 'compliance@examplefleetco.com']
  ];
  
  sheet.getRange(2, 1, complianceData.length, headers.length).setValues(complianceData);
  
  // Add conditional formatting for status visualization
  const statusCol = sheet.getRange(2, 8, 100, 1); // Status column
  
  const currentRule = SpreadsheetApp.newConditionalFormatRule()
    .setRanges([statusCol])
    .whenTextEqualTo('Current')
    .setBackground('#d4edda')
    .setFontColor('#155724')
    .build();
    
  const dueSoonRule = SpreadsheetApp.newConditionalFormatRule()
    .setRanges([statusCol])
    .whenTextEqualTo('Due Soon')
    .setBackground('#fff3cd')
    .setFontColor('#856404')
    .build();
    
  const overdueRule = SpreadsheetApp.newConditionalFormatRule()
    .setRanges([statusCol])
    .whenTextEqualTo('Overdue')
    .setBackground('#f8d7da')
    .setFontColor('#721c24')
    .build();
  
  sheet.setConditionalFormatRules([currentRule, dueSoonRule, overdueRule]);
  
  // Set optimal column widths
  sheet.setColumnWidth(3, 300); // Description
  sheet.setColumnWidth(12, 350); // Notes
  sheet.setColumnWidth(14, 200); // Email Recipients
  
  sheet.setFrozenRows(1);
  Logger.log('✅ Compliance tracking sheet created with automated monitoring');
}

// ========================================================================
// ULLAGE LOGS SHEET - Daily Inventory Tracking (Replaces Tank Calibration)
// ========================================================================

function setupUllageLogsSheet(ss) {
  Logger.log('📏 Creating ullage logs tracking sheet...');
  
  const sheet = ss.insertSheet('Ullage Logs');
  
  const headers = [
    'Date', 'Time', 'Tank ID', 'Product Type', 'Tank Capacity (gal)',
    'Ullage Depth (in)', 'Temperature (°F)', 'Water Level (in)', 
    'Calculated Gallons', 'Previous Reading', 'Daily Variance',
    'Deliveries Received', 'Sales/Withdrawals', 'Expected Gallons', 
    'Actual vs Expected', 'Variance %', 'Measured By',
    'Weather Conditions', 'Notes/Issues', 'Investigation Required'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format headers
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#4caf50');
  headerRange.setFontColor('white');
  headerRange.setFontWeight('bold');
  
  // Sample ullage log data with realistic petroleum inventory scenarios
  const today = new Date();
  const yesterday = new Date(today.getTime() - 24*60*60*1000);
  const twoDaysAgo = new Date(today.getTime() - 2*24*60*60*1000);
  
  const ullageData = [
    // Today's readings
    [
      today, '06:00', 'T-001', 'Regular Unleaded 87', 10000,
      28.5, 68, 0, 7420, 7580, -160,
      0, 160, 7420, 0, 0.0, 'Operations Manager',
      'Clear, 65°F', 'Normal overnight sales activity', 'No'
    ],
    [
      today, '06:00', 'T-002', 'Ultra Low Sulfur Diesel', 15000,
      22.3, 67, 0.125, 11850, 12000, -150,
      0, 150, 11850, 0, 0.0, 'Operations Manager', 
      'Clear, 65°F', 'Minor water detected - within acceptable limits', 'No'
    ],
    [
      today, '06:00', 'T-003', 'Premium Unleaded 91', 8000,
      31.2, 69, 0, 5180, 5300, -120,
      0, 120, 5180, 0, 0.0, 'Operations Manager',
      'Clear, 65°F', 'Good reading, no issues detected', 'No'
    ],
    
    // Yesterday's readings
    [
      yesterday, '06:00', 'T-001', 'Regular Unleaded 87', 10000,
      26.8, 66, 0, 7580, 7200, 380,
      8000, 7620, 7580, 0, 0.0, 'Lead Driver',
      'Partly cloudy, 62°F', 'Delivery received at 14:30 yesterday', 'No'
    ],
    [
      yesterday, '06:00', 'T-002', 'Ultra Low Sulfur Diesel', 15000,
      20.7, 65, 0.0625, 12000, 11850, 150,
      0, 0, 11850, 150, 1.25, 'Lead Driver',
      'Partly cloudy, 62°F', 'Variance >1% - investigated, pump calibration issue found', 'Yes'
    ],
    [
      yesterday, '06:00', 'T-003', 'Premium Unleaded 91', 8000,
      29.8, 67, 0, 5300, 5450, -150,
      0, 150, 5300, 0, 0.0, 'Lead Driver',
      'Partly cloudy, 62°F', 'Normal sales, no delivery', 'No'
    ],
    
    // Two days ago readings
    [
      twoDaysAgo, '06:00', 'T-001', 'Regular Unleaded 87', 10000,
      45.2, 64, 0, 7200, 7350, -150,
      0, 150, 7200, 0, 0.0, 'Senior Driver',
      'Overcast, 58°F', 'Steady sales overnight', 'No'
    ],
    [
      twoDaysAgo, '06:00', 'T-002', 'Ultra Low Sulfur Diesel', 15000,
      21.8, 63, 0, 11850, 12600, -750,
      0, 750, 11850, 0, 0.0, 'Senior Driver',
      'Overcast, 58°F', 'Large commercial delivery to fleet customer', 'No'
    ]
  ];
  
  sheet.getRange(2, 1, ullageData.length, headers.length).setValues(ullageData);
  
  // Set optimal column widths
  sheet.setColumnWidth(1, 100);  // Date
  sheet.setColumnWidth(2, 80);   // Time
  sheet.setColumnWidth(3, 80);   // Tank ID
  sheet.setColumnWidth(4, 180);  // Product Type
  sheet.setColumnWidth(6, 120);  // Ullage Depth
  sheet.setColumnWidth(9, 120);  // Calculated Gallons
  sheet.setColumnWidth(17, 150); // Measured By
  sheet.setColumnWidth(19, 250); // Notes
  
  // Add conditional formatting for variance monitoring
  const variancePercentRange = sheet.getRange(2, 16, 100, 1); // Variance % column
  
  const normalVarianceRule = SpreadsheetApp.newConditionalFormatRule()
    .setRanges([variancePercentRange])
    .whenNumberBetween(0, 0.5)
    .setBackground('#d4edda')
    .setFontColor('#155724')
    .build();
    
  const moderateVarianceRule = SpreadsheetApp.newConditionalFormatRule()
    .setRanges([variancePercentRange])
    .whenNumberBetween(0.5, 1.0)
    .setBackground('#fff3cd')
    .setFontColor('#856404')
    .build();
    
  const highVarianceRule = SpreadsheetApp.newConditionalFormatRule()
    .setRanges([variancePercentRange])
    .whenNumberGreaterThan(1.0)
    .setBackground('#f8d7da')
    .setFontColor('#721c24')
    .build();
  
  sheet.setConditionalFormatRules([normalVarianceRule, moderateVarianceRule, highVarianceRule]);
  
  // Add data validation for Tank ID dropdown
  const tankIdRange = sheet.getRange(2, 3, 1000, 1);
  const tankValidation = SpreadsheetApp.newDataValidation()
    .requireValueInList(['T-001', 'T-002', 'T-003', 'T-004', 'T-005'])
    .setAllowInvalid(false)
    .setHelpText('Select valid Tank ID from list')
    .build();
  tankIdRange.setDataValidation(tankValidation);
  
  // Add data validation for Investigation Required
  const investigationRange = sheet.getRange(2, 20, 1000, 1);
  const investigationValidation = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Yes', 'No'])
    .setAllowInvalid(false)
    .setHelpText('Does this reading require investigation?')
    .build();
  investigationRange.setDataValidation(investigationValidation);
  
  sheet.setFrozenRows(1);
  Logger.log('✅ Ullage logs sheet created with variance monitoring');
}

// ========================================================================
// DRIVER RECORDS SHEET - Comprehensive Driver Management
// ========================================================================

function setupDriverRecordsSheet(ss) {
  Logger.log('👨‍💼 Creating driver records sheet...');
  
  const sheet = ss.insertSheet('Driver Records');
  
  const headers = [
    'Driver ID', 'Full Name', 'Hire Date', 'CDL Number', 'CDL Class', 'CDL Expiry',
    'Hazmat Endorsement', 'Hazmat Expiry', 'Tank Endorsement', 'Medical Certificate',
    'Medical Expiry', 'Last MVR Check', 'Next MVR Due', 'DOT Physical Status',
    'Drug Test Status', 'Last Training Date', 'Current Vehicle Assignment', 'Phone Number',
    'Emergency Contact Name', 'Emergency Phone', 'Employment Status', 'Notes & Qualifications'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format headers
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#7b1fa2');
  headerRange.setFontColor('white');
  headerRange.setFontWeight('bold');
  
  // Sample driver data with realistic information
  const driverData = [
    ['DR-001', 'Carlos Martinez', new Date(2019, 2, 15), 'CDL123456789', 'Class A', 
     new Date(2027, 2, 15), 'Yes', new Date(2026, 1, 20), 'Yes', 'Current',
     new Date(2026, 7, 30), new Date(2024, 9, 15), new Date(2025, 9, 15), 'Current',
     'Passed', new Date(2024, 5, 20), 'Unit 1 - Peterbilt 379', '(555) 100-0109',
     'Maria Martinez (Spouse)', '(555) 100-0199', 'Active', 'Lead driver, 12 years experience, excellent safety record, bilingual Spanish/English'],
     
    ['DR-002', 'David Lee', new Date(2021, 4, 10), 'CDL987654321', 'Class A',
     new Date(2029, 4, 10), 'Yes', new Date(2026, 11, 5), 'Yes', 'Current',
     new Date(2025, 10, 20), new Date(2024, 8, 1), new Date(2025, 8, 1), 'Current',
     'Passed', new Date(2024, 4, 15), 'Unit 2 - Kenworth T800', '(555) 100-0110',
     'Susan Lee (Spouse)', '(555) 100-0200', 'Active', 'Senior driver, CDL instructor certified, defensive driving trainer'],
     
    ['DR-003', 'James Rodriguez', new Date(2022, 8, 20), 'CDL456789123', 'Class B',
     new Date(2026, 8, 20), 'In Process', new Date(2025, 6, 15), 'Yes', 'Current',
     new Date(2025, 9, 10), new Date(2024, 7, 10), new Date(2025, 7, 10), 'Current',
     'Passed', new Date(2024, 3, 10), 'Unit 3 - Freightliner M2', '(555) 100-0111',
     'Elena Rodriguez (Spouse)', '(555) 100-0201', 'Active', 'Newer driver, hazmat endorsement in progress, local delivery specialist'],
     
    ['DR-004', 'Michael Thompson', new Date(2020, 0, 5), 'CDL789123456', 'Class A',
     new Date(2028, 0, 5), 'Yes', new Date(2025, 8, 30), 'Yes', 'Current',
     new Date(2026, 3, 15), new Date(2024, 6, 20), new Date(2025, 6, 20), 'Current',
     'Passed', new Date(2024, 2, 25), 'Unit 4 - Mack Granite', '(555) 100-0112',
     'Jennifer Thompson (Spouse)', '(555) 100-0202', 'Active', 'Route supervisor, 8 years experience, customer service specialist']
  ];
  
  sheet.getRange(2, 1, driverData.length, headers.length).setValues(driverData);
  
  // Set optimal column widths
  sheet.setColumnWidth(2, 150);  // Full Name
  sheet.setColumnWidth(4, 120);  // CDL Number
  sheet.setColumnWidth(17, 180); // Current Vehicle
  sheet.setColumnWidth(18, 120); // Phone
  sheet.setColumnWidth(19, 150); // Emergency Contact
  sheet.setColumnWidth(22, 400); // Notes & Qualifications
  
  // Add conditional formatting for employment status
  const statusRange = sheet.getRange(2, 21, 100, 1); // Employment Status column
  
  const activeRule = SpreadsheetApp.newConditionalFormatRule()
    .setRanges([statusRange])
    .whenTextEqualTo('Active')
    .setBackground('#d4edda')
    .setFontColor('#155724')
    .build();
    
  const inactiveRule = SpreadsheetApp.newConditionalFormatRule()
    .setRanges([statusRange])
    .whenTextEqualTo('Inactive')
    .setBackground('#f8d7da')
    .setFontColor('#721c24')
    .build();
  
  sheet.setConditionalFormatRules([activeRule, inactiveRule]);
  
  sheet.setFrozenRows(1);
  Logger.log('✅ Driver records sheet created with comprehensive tracking');
}

// ========================================================================
// COMPANY ASSETS SHEET - Technology Equipment Management
// ========================================================================

function setupCompanyAssetsSheet(ss) {
  Logger.log('💻 Creating company assets sheet...');
  
  const sheet = ss.insertSheet('Company Assets');
  
  const headers = [
    'Asset Tag', 'Asset Type', 'Make/Model', 'Serial Number', 'Purchase Date',
    'Warranty Expiry', 'Assigned To', 'Assignment Date', 'Physical Location', 'Condition Status',
    'Last Service Date', 'Next Service Due', 'Purchase Cost', 'Current Value', 'Insurance Coverage',
    'Phone Number', 'Service Plan Details', 'Monthly Cost', 'Detailed Notes'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format headers
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#ff9800');
  headerRange.setFontColor('white');
  headerRange.setFontWeight('bold');
  
  // Comprehensive asset data covering all technology equipment
  const assetData = [
    // Executive Mobile Phones
    ['PH-001', 'Mobile Phone', 'iPhone 15 Pro Max 256GB', 'IMEI-123456789012345', new Date(2024, 0, 15),
     new Date(2025, 0, 15), 'John Smith (General Manager)', new Date(2024, 0, 15), 'Executive Office', 'Excellent',
     new Date(2024, 6, 1), new Date(2024, 12, 1), 1299, 1100, 'Yes',
     '(555) 100-0101', 'Verizon Unlimited Premium', 95, 'Executive phone with maximum storage, AppleCare+ coverage'],
     
    ['PH-002', 'Mobile Phone', 'Samsung Galaxy S24 Ultra 512GB', 'IMEI-987654321098765', new Date(2024, 1, 10),
     new Date(2025, 1, 10), 'Jane Doe (Safety Director)', new Date(2024, 1, 10), 'Safety Office', 'Excellent',
     new Date(2024, 6, 15), new Date(2024, 12, 15), 1199, 1000, 'Yes',
     '(555) 100-0102', 'AT&T Business Unlimited', 85, 'Rugged case for field use, Samsung Care+ protection'],
     
    ['PH-003', 'Mobile Phone', 'iPhone 14 Pro 128GB', 'IMEI-456789123045678', new Date(2023, 8, 20),
     new Date(2024, 8, 20), 'Bob Johnson (Operations Manager)', new Date(2023, 8, 20), 'Operations Office', 'Good',
     new Date(2024, 5, 1), new Date(2024, 11, 1), 999, 700, 'Yes',
     '(555) 100-0103', 'Verizon Business Plan', 75, 'Standard business configuration, regular software updates'],
     
    // Driver and Field Mobile Phones
    ['PH-004', 'Mobile Phone', 'iPhone 13 64GB', 'IMEI-789123456078912', new Date(2023, 3, 15),
     new Date(2024, 3, 15), 'Carlos Martinez (Lead Driver)', new Date(2023, 3, 15), 'Unit 1 Vehicle', 'Good',
     new Date(2024, 4, 20), new Date(2024, 10, 20), 629, 450, 'Yes',
     '(555) 100-0109', 'T-Mobile Business Basic', 65, 'Driver phone with vehicle mount, GPS navigation apps'],
     
    ['PH-005', 'Mobile Phone', 'Samsung Galaxy A54 128GB', 'IMEI-234567890123456', new Date(2024, 2, 5),
     new Date(2025, 2, 5), 'David Lee (Senior Driver)', new Date(2024, 2, 5), 'Unit 2 Vehicle', 'Excellent',
     new Date(2024, 7, 10), new Date(2025, 1, 10), 449, 400, 'Yes',
     '(555) 100-0110', 'T-Mobile Business Basic', 65, 'Cost-effective driver phone, durable construction'],
     
    // Tablets for Operations and Dispatch
    ['TB-001', 'Tablet', 'iPad Pro 12.9" 256GB WiFi+Cellular', 'SN-TB001234567890', new Date(2023, 10, 5),
     new Date(2024, 10, 5), 'Mary Williams (Lead Dispatcher)', new Date(2023, 10, 5), 'Dispatch Center', 'Excellent',
     new Date(2024, 4, 1), new Date(2024, 10, 1), 1199, 850, 'Yes',
     'Cellular data included', 'Verizon Tablet Plan 15GB', 35, 'Primary dispatch tablet with routing software, dual-monitor setup'],
     
    ['TB-002', 'Tablet', 'Microsoft Surface Pro 9 256GB', 'SN-TB002345678901', new Date(2024, 1, 12),
     new Date(2025, 1, 12), 'Carlos Martinez (Lead Driver)', new Date(2024, 1, 12), 'Unit 1 Vehicle', 'Excellent',
     new Date(2024, 7, 1), new Date(2025, 1, 1), 1299, 1150, 'Yes',
     'N/A', 'WiFi Only', 0, 'Driver tablet with delivery tracking, customer signature capture, vehicle diagnostics'],
     
    ['TB-003', 'Tablet', 'iPad Air 64GB WiFi', 'SN-TB003456789012', new Date(2023, 6, 20),
     new Date(2024, 6, 20), 'Jane Doe (Safety Director)', new Date(2023, 6, 20), 'Safety Office/Field', 'Good',
     new Date(2024, 3, 15), new Date(2024, 9, 15), 599, 400, 'Yes',
     'N/A', 'WiFi Only', 0, 'Mobile safety inspection tablet, incident reporting, training materials'],
     
    // Executive and Management Laptops
    ['LT-001', 'Laptop', 'MacBook Pro 16" M3 Max 1TB', 'SN-LT001456789123', new Date(2024, 4, 20),
     new Date(2027, 4, 20), 'John Smith (General Manager)', new Date(2024, 4, 20), 'Executive Office', 'Excellent',
     new Date(2024, 8, 15), new Date(2025, 2, 15), 3499, 3200, 'Yes',
     'N/A', 'N/A', 0, 'Executive laptop with full software suite, financial modeling, presentations'],
     
    ['LT-002', 'Laptop', 'Dell Latitude 5540 512GB', 'SN-LT002567890234', new Date(2023, 2, 10),
     new Date(2026, 2, 10), 'Tom Brown (Accounting Manager)', new Date(2023, 2, 10), 'Accounting Office', 'Good',
     new Date(2024, 1, 1), new Date(2024, 7, 1), 1399, 900, 'Yes',
     'N/A', 'N/A', 0, 'Accounting laptop with QuickBooks, Excel, financial software, secure document storage'],
     
    ['LT-003', 'Laptop', 'Lenovo ThinkPad P1 Gen 6', 'SN-LT003678901345', new Date(2024, 3, 5),
     new Date(2027, 3, 5), 'Bob Johnson (Operations Manager)', new Date(2024, 3, 5), 'Operations Office', 'Excellent',
     new Date(2024, 8, 1), new Date(2025, 2, 1), 2199, 2000, 'Yes',
     'N/A', 'N/A', 0, 'High-performance laptop for operations planning, logistics software, data analysis'],
     
    // Desktop Workstations
    ['DT-001', 'Desktop Computer', 'Dell OptiPlex 7090 SFF', 'SN-DT001789012456', new Date(2022, 7, 15),
     new Date(2025, 7, 15), 'Lisa Davis (Customer Service)', new Date(2022, 7, 15), 'Customer Service Desk', 'Good',
     new Date(2024, 0, 10), new Date(2024, 6, 10), 899, 500, 'Yes',
     'N/A', 'N/A', 0, 'Customer service workstation with CRM software, dual monitors, headset setup'],
     
    ['DT-002', 'Desktop Computer', 'HP EliteDesk 800 G9 Mini', 'SN-DT002890123567', new Date(2023, 0, 5),
     new Date(2026, 0, 5), 'Mary Williams (Lead Dispatcher)', new Date(2023, 0, 5), 'Dispatch Center', 'Excellent',
     new Date(2024, 5, 20), new Date(2024, 11, 20), 1199, 850, 'Yes',
     'N/A', 'N/A', 0, 'Primary dispatch computer with route optimization, GPS tracking, radio integration'],
     
    ['DT-003', 'Desktop Computer', 'Dell Precision 3660 Tower', 'SN-DT003901234678', new Date(2024, 0, 15),
     new Date(2027, 0, 15), 'Mike Rodriguez (Fleet Manager)', new Date(2024, 0, 15), 'Fleet Office', 'Excellent',
     new Date(2024, 6, 1), new Date(2024, 12, 1), 1599, 1400, 'Yes',
     'N/A', 'N/A', 0, 'Fleet management workstation with vehicle tracking, maintenance scheduling, DOT compliance software']
  ];
  
  sheet.getRange(2, 1, assetData.length, headers.length).setValues(assetData);
  
  // Set optimal column widths for readability
  sheet.setColumnWidth(1, 80);   // Asset Tag
  sheet.setColumnWidth(3, 200);  // Make/Model
  sheet.setColumnWidth(4, 180);  // Serial Number
  sheet.setColumnWidth(7, 200);  // Assigned To
  sheet.setColumnWidth(9, 150);  // Physical Location
  sheet.setColumnWidth(16, 120); // Phone Number
  sheet.setColumnWidth(17, 180); // Service Plan
  sheet.setColumnWidth(19, 400); // Detailed Notes
  
  // Add conditional formatting for condition status
  const conditionRange = sheet.getRange(2, 10, 100, 1); // Condition Status column
  
  const excellentConditionRule = SpreadsheetApp.newConditionalFormatRule()
    .setRanges([conditionRange])
    .whenTextEqualTo('Excellent')
    .setBackground('#d4edda')
    .setFontColor('#155724')
    .build();
    
  const goodConditionRule = SpreadsheetApp.newConditionalFormatRule()
    .setRanges([conditionRange])
    .whenTextEqualTo('Good')
    .setBackground('#fff3cd')
    .setFontColor('#856404')
    .build();
    
  const fairConditionRule = SpreadsheetApp.newConditionalFormatRule()
    .setRanges([conditionRange])
    .whenTextEqualTo('Fair')
    .setBackground('#f8d7da')
    .setFontColor('#721c24')
    .build();
  
  sheet.setConditionalFormatRules([excellentConditionRule, goodConditionRule, fairConditionRule]);
  
  sheet.setFrozenRows(1);
  Logger.log('✅ Company assets sheet created with comprehensive tracking');
}

// ========================================================================
// CONTACT DIRECTORY SHEET - Complete Company Information
// ========================================================================

function setupContactDirectorySheet(ss) {
  Logger.log('📞 Creating contact directory sheet...');
  
  const sheet = ss.insertSheet('Contact Directory');
  
  const headers = [
    'Department', 'Full Name', 'Job Title', 'Office Phone', 'Mobile Phone', 'Email Address',
    'Radio Channel', 'Emergency Availability', 'Assigned Assets', 'Backup Contact',
    'Work Schedule', 'Primary Location', 'Reports To', 'Direct Reports'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format headers
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#2e7d32');
  headerRange.setFontColor('white');
  headerRange.setFontWeight('bold');
  
  // Complete company directory with all personnel
  const directoryData = [
    // Executive Leadership
    ['Executive', 'John Smith', 'General Manager & CEO', '(555) 100-0001', '(555) 100-0101',
     'j.smith@examplefleetco.com', 'Command Channel', '24/7 Available', 'PH-001, LT-001',
     'Jane Doe (Safety Director)', 'Monday-Friday 7AM-6PM, On-call weekends', 'Main Office - Executive Suite', 'Board of Directors', 'All Department Heads'],
     
    // Safety Department
    ['Safety', 'Jane Doe', 'Safety Director & Compliance Officer', '(555) 100-0002', '(555) 100-0102',
     'j.doe@examplefleetco.com', 'Safety Channel 9', '24/7 Emergency Response', 'PH-002, TB-003',
     'John Smith (General Manager)', 'Monday-Friday 6AM-6PM, 24/7 emergency', 'Main Office - Safety Department', 'John Smith', 'Safety Specialists, Compliance Team'],
     
    // Operations Management
    ['Operations', 'Bob Johnson', 'Operations Manager', '(555) 100-0003', '(555) 100-0103',
     'b.johnson@examplefleetco.com', 'Operations Channel 5', 'Business Hours + On-call', 'PH-003, LT-003',
     'Mary Williams (Lead Dispatcher)', 'Monday-Saturday 5AM-7PM', 'Main Office - Operations Center', 'John Smith', 'Dispatch, Fleet, Drivers, Maintenance'],
     
    // Dispatch Operations
    ['Dispatch', 'Mary Williams', 'Lead Dispatcher & Route Coordinator', '(555) 100-0004', '(555) 100-0104',
     'dispatch@examplefleetco.com', 'Dispatch Channel 7', 'During scheduled shifts', 'PH-004, TB-001, DT-002',
     'Bob Johnson (Operations Manager)', '24/7 Rotating Shifts', 'Dispatch Center', 'Bob Johnson', 'Dispatch Team, Customer Service'],
     
    // Finance & Administration
    ['Finance', 'Tom Brown', 'Accounting Manager & CFO', '(555) 100-0005', '(555) 100-0105',
     'accounting@examplefleetco.com', 'N/A', 'Business Hours Only', 'PH-005, LT-002',
     'Sarah Wilson (Admin Assistant)', 'Monday-Friday 8AM-5PM', 'Accounting Office', 'John Smith', 'Accounting Staff, Payroll Clerk'],
     
    ['Customer Service', 'Lisa Davis', 'Customer Service Manager', '(555) 100-0006', '(555) 100-0106',
     'service@examplefleetco.com', 'Customer Service Channel', 'Business Hours', 'PH-006, DT-001',
     'Sarah Wilson (Admin Assistant)', 'Monday-Friday 7AM-6PM, Saturday 8AM-2PM', 'Customer Service Desk', 'Mary Williams', 'Customer Service Representatives'],
     
    ['Administration', 'Sarah Wilson', 'Administrative Assistant & HR Coordinator', '(555) 100-0007', '(555) 100-0107',
     'admin@examplefleetco.com', 'N/A', 'Business Hours Only', 'PH-007, DT-004',
     'Lisa Davis (Customer Service Manager)', 'Monday-Friday 8AM-5PM', 'Front Office Reception', 'John Smith', 'Administrative Support Staff'],
     
    // Fleet & Maintenance
    ['Fleet Management', 'Mike Rodriguez', 'Fleet Manager & DOT Compliance', '(555) 100-0008', '(555) 100-0108',
     'fleet@examplefleetco.com', 'Fleet Channel 5', 'On-call for emergencies', 'PH-008, DT-003',
     'Robert Garcia (Maintenance Supervisor)', 'Monday-Friday 6AM-6PM, Emergency on-call', 'Fleet Maintenance Facility', 'Bob Johnson', 'Maintenance Team, DOT Compliance'],
     
    ['Maintenance', 'Robert Garcia', 'Maintenance Supervisor & Lead Mechanic', '(555) 100-0012', '(555) 100-0112',
     'maintenance@examplefleetco.com', 'Maintenance Channel 6', 'Emergency on-call rotation', 'PH-012',
     'Mike Rodriguez (Fleet Manager)', 'Monday-Friday 6AM-4PM, Emergency weekends', 'Fleet Maintenance Shop', 'Mike Rodriguez', 'Maintenance Mechanics, Shop Assistant'],
     
    // Driver Operations
    ['Drivers', 'Carlos Martinez', 'Lead Driver & Route Supervisor', 'N/A', '(555) 100-0109',
     'c.martinez@examplefleetco.com', 'Unit 1 Radio', 'During shift hours', 'PH-004, TB-002',
     'David Lee (Senior Driver)', 'Monday-Friday 5AM-5PM', 'Unit 1 - Field Operations', 'Bob Johnson', 'Junior Drivers, Route Training'],
     
    ['Drivers', 'David Lee', 'Senior Driver & Safety Trainer', 'N/A', '(555) 100-0110',
     'd.lee@examplefleetco.com', 'Unit 2 Radio', 'During shift hours', 'PH-005',
     'Carlos Martinez (Lead Driver)', 'Tuesday-Saturday 6AM-6PM', 'Unit 2 - Field Operations', 'Bob Johnson', 'New Driver Training, Safety Compliance'],
     
    ['Drivers', 'James Rodriguez', 'Delivery Driver', 'N/A', '(555) 100-0111',
     'j.rodriguez@examplefleetco.com', 'Unit 3 Radio', 'During shift hours', 'PH-011',
     'Carlos Martinez (Lead Driver)', 'Monday-Friday 7AM-5PM', 'Unit 3 - Field Operations', 'Carlos Martinez', 'N/A'],
     
    ['Drivers', 'Michael Thompson', 'Delivery Driver & Route Specialist', 'N/A', '(555) 100-0112',
     'm.thompson@examplefleetco.com', 'Unit 4 Radio', 'During shift hours', 'PH-013',
     'David Lee (Senior Driver)', 'Wednesday-Sunday 6AM-6PM', 'Unit 4 - Field Operations', 'David Lee', 'N/A']
  ];
  
  sheet.getRange(2, 1, directoryData.length, headers.length).setValues(directoryData);
  
  // Set optimal column widths for complete information display
  sheet.setColumnWidth(2, 150);  // Full Name
  sheet.setColumnWidth(3, 200);  // Job Title  
  sheet.setColumnWidth(6, 220);  // Email Address
  sheet.setColumnWidth(9, 150);  // Assigned Assets
  sheet.setColumnWidth(10, 180); // Backup Contact
  sheet.setColumnWidth(11, 200); // Work Schedule
  sheet.setColumnWidth(12, 180); // Primary Location
  sheet.setColumnWidth(14, 200); // Direct Reports
  
  sheet.setFrozenRows(1);
  Logger.log('✅ Contact directory sheet created with complete company information');
}

// ========================================================================
// CATEGORIES SHEET - Knowledge Organization System
// ========================================================================

function setupCategoriesSheet(ss) {
  Logger.log('📂 Creating categories sheet...');
  
  const sheet = ss.insertSheet('Categories');
  
  const headers = ['Category', 'Subcategory', 'Description', 'Priority Level', 'Department Owner', 'Article Count'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format headers
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#2e7d32');
  headerRange.setFontColor('white');
  headerRange.setFontWeight('bold');
  
  // Enhanced petroleum industry categories
  const categories = [
    ['Safety', 'Emergency Response', 'Procedures for handling emergencies, spills, fires, and accidents', 'Critical', 'Safety Director', '=COUNTIFS(\'Knowledge Base\'!C:C,"Safety",\'Knowledge Base\'!D:D,"Emergency Response")'],
    ['Safety', 'Personal Protective Equipment', 'PPE requirements, usage guidelines, and maintenance procedures', 'Critical', 'Safety Director', '=COUNTIFS(\'Knowledge Base\'!C:C,"Safety",\'Knowledge Base\'!D:D,"Personal Protective Equipment")'],
    
    ['Compliance', 'Vehicle Testing', 'EPA vapor testing, emissions testing, and air pollution compliance', 'Critical', 'Fleet Manager', '=COUNTIFS(\'Knowledge Base\'!C:C,"Compliance",\'Knowledge Base\'!D:D,"Vehicle Testing")'],
    ['Compliance', 'Driver Certification', 'CDL tracking, medical certificates, and driver qualification requirements', 'Critical', 'HR Manager', '=COUNTIFS(\'Knowledge Base\'!C:C,"Compliance",\'Knowledge Base\'!D:D,"Driver Certification")'],
    ['Compliance', 'Driver Records', 'DOT driver qualification files, record keeping, and documentation', 'Critical', 'HR Manager', '=COUNTIFS(\'Knowledge Base\'!C:C,"Compliance",\'Knowledge Base\'!D:D,"Driver Records")'],
    ['Compliance', 'Environmental', 'EPA regulations, environmental permits, and reporting requirements', 'Critical', 'Compliance Officer', '=COUNTIFS(\'Knowledge Base\'!C:C,"Compliance",\'Knowledge Base\'!D:D,"Environmental")'],
    
    ['Operations', 'Inventory Control', 'Ullage measurement, tank management, and inventory procedures', 'High', 'Operations Manager', '=COUNTIFS(\'Knowledge Base\'!C:C,"Operations",\'Knowledge Base\'!D:D,"Inventory Control")'],
    ['Operations', 'Asset Management', 'Technology equipment tracking, assignment, and maintenance', 'High', 'IT Manager', '=COUNTIFS(\'Knowledge Base\'!C:C,"Operations",\'Knowledge Base\'!D:D,"Asset Management")'],
    ['Operations', 'Vehicle Maintenance', 'Fleet maintenance procedures, scheduling, and compliance', 'High', 'Fleet Manager', '=COUNTIFS(\'Knowledge Base\'!C:C,"Operations",\'Knowledge Base\'!D:D,"Vehicle Maintenance")'],
    
    ['Reference', 'Contact Directory', 'Company phone directory, emergency contacts, and communication info', 'Critical', 'Admin Assistant', '=COUNTIFS(\'Knowledge Base\'!C:C,"Reference",\'Knowledge Base\'!D:D,"Contact Directory")'],
    ['Reference', 'Emergency Response', 'Emergency contact information and response protocols', 'Critical', 'Safety Director', '=COUNTIFS(\'Knowledge Base\'!C:C,"Reference",\'Knowledge Base\'!D:D,"Emergency Response")'],
    ['Reference', 'Regulatory Contacts', 'Government agency contacts and reporting requirements', 'High', 'Compliance Officer', '=COUNTIFS(\'Knowledge Base\'!C:C,"Reference",\'Knowledge Base\'!D:D,"Regulatory Contacts")']
  ];
  
  sheet.getRange(2, 1, categories.length, headers.length).setValues(categories);
  
  // Set column widths
  sheet.setColumnWidth(3, 300); // Description
  sheet.setColumnWidth(5, 150); // Department Owner
  
  sheet.setFrozenRows(1);
  Logger.log('✅ Categories sheet created with petroleum industry focus');
}

// ========================================================================
// APPROVAL WORKFLOW SHEET - Document Review Process
// ========================================================================

function setupApprovalWorkflowSheet(ss) {
  Logger.log('✅ Creating approval workflow sheet...');
  
  const sheet = ss.insertSheet('Approval Workflow');
  
  const headers = [
    'KB ID', 'Document Title', 'Author', 'Submitted Date', 'Assigned Reviewer',
    'Review Status', 'Review Date', 'Reviewer Comments', 'Approval Date',
    'Next Review Due', 'Review Frequency'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format headers
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#6a1b9a');
  headerRange.setFontColor('white');
  headerRange.setFontWeight('bold');
  
  // Set column widths
  sheet.setColumnWidth(2, 250); // Document Title
  sheet.setColumnWidth(8, 300); // Reviewer Comments
  
  sheet.setFrozenRows(1);
  Logger.log('✅ Approval workflow sheet created');
}

// ========================================================================
// AUTOMATION TRIGGERS - Automated Monitoring System
// ========================================================================

function setupAutomationTriggers() {
  Logger.log('⚙️ Setting up automation triggers...');
  
  // Delete any existing triggers to avoid duplicates
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));
  
  // Weekly compliance check - every Monday at 8:00 AM
  ScriptApp.newTrigger('performWeeklyComplianceCheck')
    .timeBased()
    .everyWeeks(1)
    .onWeekDay(ScriptApp.WeekDay.MONDAY)
    .atHour(8)
    .create();
  
  // Daily ullage log reminder - every day at 5:30 AM
  ScriptApp.newTrigger('sendDailyUllageReminder')
    .timeBased()
    .everyDays(1)
    .atHour(5)
    .nearMinute(30)
    .create();
  
  // Monthly asset audit reminder - first Monday of each month at 9:00 AM
  ScriptApp.newTrigger('sendMonthlyAssetAuditReminder')
    .timeBased()
    .everyWeeks(4)
    .onWeekDay(ScriptApp.WeekDay.MONDAY)
    .atHour(9)
    .create();
    
  Logger.log('✅ Automation triggers created successfully');
}

// ========================================================================
// COMPLIANCE MONITORING FUNCTIONS - Automated Alerts
// ========================================================================

/**
 * WEEKLY COMPLIANCE CHECK - Monitors all compliance items and sends alerts
 */
function performWeeklyComplianceCheck() {
  Logger.log('🔍 Performing weekly compliance check...');
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const complianceSheet = ss.getSheetByName('Compliance Tracking');
  
  if (!complianceSheet) {
    Logger.log('❌ Compliance Tracking sheet not found');
    return;
  }
  
  const data = complianceSheet.getDataRange().getValues();
  const today = new Date();
  
  const dueSoonItems = [];
  const overdueItems = [];
  
  // Check each compliance item (skip header row)
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const itemType = row[0];
    const itemId = row[1];
    const description = row[2];
    const nextDueDate = row[5];
    const alertDays = row[12] || 30;
    const emailRecipients = row[13];
    
    if (nextDueDate && nextDueDate instanceof Date) {
      const daysUntilDue = Math.ceil((nextDueDate - today) / (1000 * 60 * 60 * 24));
      
      if (daysUntilDue < 0) {
        // Item is overdue
        overdueItems.push({
          type: itemType,
          id: itemId,
          description: description,
          dueDate: nextDueDate,
          daysOverdue: Math.abs(daysUntilDue),
          recipients: emailRecipients
        });
        
        // Update status to Overdue
        complianceSheet.getRange(i + 1, 8).setValue('Overdue');
        
      } else if (daysUntilDue <= alertDays) {
        // Item is due soon
        dueSoonItems.push({
          type: itemType,
          id: itemId,
          description: description,
          dueDate: nextDueDate,
          daysUntilDue: daysUntilDue,
          recipients: emailRecipients
        });
        
        // Update status to Due Soon
        complianceSheet.getRange(i + 1, 8).setValue('Due Soon');
      }
    }
  }
  
  // Send alert emails if items need attention
  if (overdueItems.length > 0 || dueSoonItems.length > 0) {
    sendComplianceAlerts(overdueItems, dueSoonItems);
  }
  
  Logger.log(`✅ Compliance check complete: ${overdueItems.length} overdue, ${dueSoonItems.length} due soon`);
}

/**
 * SEND COMPLIANCE ALERTS - Email notifications for compliance items
 */
function sendComplianceAlerts(overdueItems, dueSoonItems) {
  Logger.log('📧 Sending compliance alerts...');
  
  let subject = '🛢️ Example Fleet Co Compliance Alert - ';
  if (overdueItems.length > 0) {
    subject += `${overdueItems.length} OVERDUE Items Require Immediate Action`;
  } else {
    subject += `${dueSoonItems.length} Items Due Soon`;
  }
  
  let emailBody = `
<h2 style="color: #d32f2f;">🛢️ Example Fleet Co Compliance Monitoring Alert</h2>
<p><strong>Report Generated:</strong> ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
<p><strong>System:</strong> Automated Compliance Monitoring</p>
`;

  // Handle overdue items (critical alerts)
  if (overdueItems.length > 0) {
    emailBody += `
<h3 style="color: #d32f2f;">🚨 OVERDUE COMPLIANCE ITEMS - IMMEDIATE ACTION REQUIRED</h3>
<p style="color: #d32f2f; font-weight: bold;">The following items are past their due dates and require immediate attention:</p>
<table border="1" style="border-collapse: collapse; width: 100%; margin: 10px 0;">
  <tr style="background-color: #d32f2f; color: white;">
    <th style="padding: 8px;">Type</th>
    <th style="padding: 8px;">ID</th>
    <th style="padding: 8px;">Description</th>
    <th style="padding: 8px;">Due Date</th>
    <th style="padding: 8px;">Days Overdue</th>
  </tr>`;
    
    overdueItems.forEach(item => {
      emailBody += `
  <tr style="background-color: #ffebee;">
    <td style="padding: 8px;">${item.type}</td>
    <td style="padding: 8px;">${item.id}</td>
    <td style="padding: 8px;">${item.description}</td>
    <td style="padding: 8px;">${item.dueDate.toLocaleDateString()}</td>
    <td style="padding: 8px; color: #d32f2f; font-weight: bold;">${item.daysOverdue} days</td>
  </tr>`;
    });
    
    emailBody += `</table>`;
  }

  // Handle due soon items (warning alerts)
  if (dueSoonItems.length > 0) {
    emailBody += `
<h3 style="color: #f57c00;">⏰ ITEMS DUE SOON - ACTION REQUIRED</h3>
<p style="color: #f57c00; font-weight: bold;">The following items are approaching their due dates:</p>
<table border="1" style="border-collapse: collapse; width: 100%; margin: 10px 0;">
  <tr style="background-color: #f57c00; color: white;">
    <th style="padding: 8px;">Type</th>
    <th style="padding: 8px;">ID</th>
    <th style="padding: 8px;">Description</th>
    <th style="padding: 8px;">Due Date</th>
    <th style="padding: 8px;">Days Remaining</th>
  </tr>`;
    
    dueSoonItems.forEach(item => {
      emailBody += `
  <tr style="background-color: #fff3e0;">
    <td style="padding: 8px;">${item.type}</td>
    <td style="padding: 8px;">${item.id}</td>
    <td style="padding: 8px;">${item.description}</td>
    <td style="padding: 8px;">${item.dueDate.toLocaleDateString()}</td>
    <td style="padding: 8px; color: #f57c00; font-weight: bold;">${item.daysUntilDue} days</td>
  </tr>`;
    });
    
    emailBody += `</table>`;
  }

  // Add action instructions and system information
  emailBody += `
<h3 style="color: #1976d2;">📋 Required Actions</h3>
<ul>
  <li><strong>Overdue Items:</strong> Schedule immediately and complete within 48 hours</li>
  <li><strong>Due Soon Items:</strong> Schedule completion before due date</li>
  <li><strong>Update System:</strong> Record completion in Compliance Tracking sheet</li>
  <li><strong>Verification:</strong> Upload certificates and documentation</li>
</ul>

<h3 style="color: #1976d2;">📞 Support Contacts</h3>
<ul>
  <li><strong>Compliance Questions:</strong> Jane Doe (Safety Director) - (555) 100-0102</li>
  <li><strong>System Access:</strong> <a href="${SpreadsheetApp.getActiveSpreadsheet().getUrl()}">Example Fleet Co Compliance System</a></li>
  <li><strong>Emergency:</strong> Call (555) 100-HELP</li>
</ul>

<hr>
<p style="font-size: 12px; color: #666;">
This is an automated message from the Example Fleet Co Compliance Monitoring System.<br>
System Time: ${new Date().toString()}<br>
Do not reply to this email. For assistance, contact your system administrator.
</p>`;

  // Collect all unique email recipients
  const allRecipients = new Set();
  [...overdueItems, ...dueSoonItems].forEach(item => {
    if (item.recipients) {
      item.recipients.split(',').forEach(email => {
        allRecipients.add(email.trim());
      });
    }
  });
  
  // Send email to all recipients
  const recipientList = Array.from(allRecipients).join(',');
  
  try {
    MailApp.sendEmail({
      to: recipientList,
      cc: 'j.smith@examplefleetco.com', // Always CC General Manager
      subject: subject,
      htmlBody: emailBody
    });
    
    Logger.log(`✅ Compliance alert sent to: ${recipientList}`);
  } catch (error) {
    Logger.log(`❌ Failed to send compliance alert: ${error.toString()}`);
  }
}

/**
 * DAILY ULLAGE REMINDER - Automated reminder for daily inventory readings
 */
function sendDailyUllageReminder() {
  Logger.log('📏 Sending daily ullage reminder...');
  
  const emailBody = `
<h2>🛢️ Daily Ullage Reading Reminder</h2>
<p><strong>Good morning!</strong></p>
<p>This is your automated reminder to complete today's ullage readings by 6:30 AM.</p>

<h3>📋 Required Tasks:</h3>
<ul>
  <li>✅ Measure ullage depths for all active tanks</li>
  <li>🌡️ Record temperature readings at mid-tank level</li>
  <li>💧 Check for water contamination using detection paste</li>
  <li>📝 Enter all readings in the ullage log system</li>
  <li>🔍 Investigate any variances greater than 0.5%</li>
  <li>📸 Document any issues with photos</li>
</ul>

<h3>⚠️ Important Reminders:</h3>
<ul>
  <li>Allow tanks to settle minimum 30 minutes after last activity</li>
  <li>Check for vapors before opening tank hatches</li>
  <li>Use calibrated measuring equipment only</li>
  <li>Report variances >1.0% immediately to management</li>
</ul>

<h3>🔗 System Access:</h3>
<p><a href="${SpreadsheetApp.getActiveSpreadsheet().getUrl()}">Example Fleet Co Ullage Log System</a></p>

<h3>📞 Questions or Issues:</h3>
<ul>
  <li><strong>Operations Manager:</strong> Bob Johnson - (555) 100-0103</li>
  <li><strong>Safety Director:</strong> Jane Doe - (555) 100-0102</li>
  <li><strong>Emergency:</strong> (555) 100-HELP</li>
</ul>

<p><strong>Have a safe and productive day!</strong></p>

<hr>
<p style="font-size: 12px; color: #666;">
Example Fleet Co Automated Operations System<br>
Daily Ullage Reminder - ${new Date().toLocaleDateString()}<br>
Do not reply to this email.
</p>`;
  
  // Send to operations team
  const recipients = 'operations@examplefleetco.com,dispatch@examplefleetco.com,b.johnson@examplefleetco.com';
  
  try {
    MailApp.sendEmail({
      to: recipients,
      subject: '🛢️ Daily Ullage Reading Reminder - Action Required',
      htmlBody: emailBody
    });
    
    Logger.log('✅ Daily ullage reminder sent successfully');
  } catch (error) {
    Logger.log(`❌ Failed to send ullage reminder: ${error.toString()}`);
  }
}

/**
 * MONTHLY ASSET AUDIT REMINDER - Technology equipment inventory check
 */
function sendMonthlyAssetAuditReminder() {
  Logger.log('💻 Sending monthly asset audit reminder...');
  
  const emailBody = `
<h2>💻 Monthly Technology Asset Audit Reminder</h2>
<p><strong>Time for the monthly asset inventory check!</strong></p>

<h3>📋 Asset Audit Checklist:</h3>
<ul>
  <li>✅ Verify all assigned equipment is accounted for</li>
  <li>🔍 Check physical condition of all devices</li>
  <li>📱 Test all mobile devices and tablets</li>
  <li>💻 Confirm laptop and desktop functionality</li>
  <li>🔐 Verify security updates are current</li>
  <li>📄 Update asset tracking records</li>
  <li>💰 Review insurance coverage and values</li>
</ul>

<h3>🎯 Focus Areas This Month:</h3>
<ul>
  <li>Phone plan utilization review</li>
  <li>Software license compliance check</li>
  <li>Warranty expiration monitoring</li>
  <li>Equipment replacement planning</li>
</ul>

<h3>🔗 System Access:</h3>
<p><a href="${SpreadsheetApp.getActiveSpreadsheet().getUrl()}">Example Fleet Co Asset Management System</a></p>

<h3>📞 Asset Management Contacts:</h3>
<ul>
  <li><strong>IT Manager:</strong> Contact main office</li>
  <li><strong>Operations Manager:</strong> Bob Johnson - (555) 100-0103</li>
  <li><strong>General Manager:</strong> John Smith - (555) 100-0101</li>
</ul>

<p><strong>Please complete audit by end of business day.</strong></p>

<hr>
<p style="font-size: 12px; color: #666;">
Example Fleet Co Asset Management System<br>
Monthly Audit Reminder - ${new Date().toLocaleDateString()}<br>
Do not reply to this email.
</p>`;
  
  // Send to management team
  const recipients = 'j.smith@examplefleetco.com,b.johnson@examplefleetco.com,admin@examplefleetco.com';
  
  try {
    MailApp.sendEmail({
      to: recipients,
      subject: '💻 Monthly Asset Audit Reminder - Example Fleet Co',
      htmlBody: emailBody
    });
    
    Logger.log('✅ Monthly asset audit reminder sent successfully');
  } catch (error) {
    Logger.log(`❌ Failed to send asset audit reminder: ${error.toString()}`);
  }
}

// ========================================================================
// UTILITY FUNCTIONS - System Maintenance and Reporting
// ========================================================================

/**
 * GET SYSTEM STATUS - Returns comprehensive system information
 */
function getSystemStatus() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  const status = {
    systemName: 'Example Fleet Co Complete Operations System',
    spreadsheetId: ss.getId(),
    url: ss.getUrl(),
    lastUpdated: new Date(),
    sheets: ss.getSheets().map(sheet => ({
      name: sheet.getName(),
      rows: sheet.getLastRow(),
      columns: sheet.getLastColumn()
    })),
    triggers: ScriptApp.getProjectTriggers().map(trigger => ({
      handlerFunction: trigger.getHandlerFunction(),
      eventType: trigger.getEventType(),
      triggerSource: trigger.getTriggerSource()
    }))
  };
  
  Logger.log('System Status: ' + JSON.stringify(status, null, 2));
  return status;
}

/**
 * MANUAL COMPLIANCE CHECK - Run compliance check manually
 */
function runManualComplianceCheck() {
  Logger.log('🔍 Running manual compliance check...');
  performWeeklyComplianceCheck();
  Logger.log('✅ Manual compliance check completed');
}

/**
 * MANUAL ULLAGE REMINDER - Send ullage reminder manually
 */
function sendManualUllageReminder() {
  Logger.log('📏 Sending manual ullage reminder...');
  sendDailyUllageReminder();
  Logger.log('✅ Manual ullage reminder sent');
}

// ========================================================================
// DEPLOYMENT INSTRUCTIONS
// ========================================================================

/**
 * DEPLOYMENT GUIDE:
 * 
 * 1. GOOGLE APPS SCRIPT SETUP:
 *    - Open script.google.com in your browser
 *    - Click "New Project"
 *    - Delete the default code and paste this entire script
 *    - Save the project as "Example Fleet Co Complete System"
 * 
 * 2. INITIAL DEPLOYMENT:
 *    - Run the function setupExampleFleetCoSystem()
 *    - Authorize all required permissions when prompted
 *    - Copy the spreadsheet URL from the execution log
 * 
 * 3. CUSTOMIZATION REQUIRED:
 *    - Update email addresses throughout the script to your actual emails
 *    - Modify tank IDs in ullage logs to match your tanks
 *    - Update contact information in the directory sheet
 *    - Adjust compliance dates to match your actual schedules
 * 
 * 4. TESTING:
 *    - Run runManualComplianceCheck() to test alerts
 *    - Run sendManualUllageReminder() to test daily reminders
 *    - Verify all email notifications are working
 * 
 * 5. PRODUCTION USE:
 *    - Train staff on system access and data entry
 *    - Set up regular data backup procedures
 *    - Review and update compliance schedules monthly
 * 
 * SYSTEM FEATURES:
 * ✅ Complete petroleum operations knowledge base (tank calibration removed)
 * ✅ Ullage log management with variance detection
 * ✅ Automated EPA compliance monitoring (vapor testing, CDL, medical certs)
 * ✅ Company asset tracking (phones, tablets, laptops, computers)
 * ✅ Driver records and DOT file management
 * ✅ Emergency contact directory
 * ✅ Automated email alerts and reminders
 * ✅ Weekly compliance checks every Monday 8 AM
 * ✅ Daily ullage reminders every day 5:30 AM
 * ✅ Monthly asset audit reminders
 * ✅ Production-ready with comprehensive petroleum industry content
 */
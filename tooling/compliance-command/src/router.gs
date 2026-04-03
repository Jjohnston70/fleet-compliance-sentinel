/**
 * compliance-command — Router
 * True North Data Strategies
 *
 * Client fills out company info once → all compliance documents auto-populate.
 * Web App entry point: doPost receives { action, data, apiKey? }
 *
 * ACTIONS:
 *   submitCompanyInfo  — Submit/update company info for document generation
 *   generatePackage    — Generate a single compliance package (1-7)
 *   generateAll        — Generate all 7 compliance packages
 *   getCompanyInfo     — Retrieve stored company profile
 *   listCompanies      — List all companies with compliance profiles
 *   getPackageStatus   — Check generation status for a company's packages
 */

// ============================================================
// CONFIG — Fill per deployment
// ============================================================
const COMPLIANCE_CONFIG = {
  SPREADSHEET_ID: '',            // Company info intake/tracking sheet
  TEMPLATE_FOLDER_ID: '',        // Root folder with Package_1..7 template subfolders
  OUTPUT_ROOT_FOLDER_ID: '',     // Root folder where client packages are generated
  API_KEY: '',                   // Optional auth key
  COMPANY_SHEET: 'Companies',    // Tab name for company profiles
  LOG_SHEET: 'GenerationLog',    // Tab name for generation audit log
};

// ============================================================
// COLUMN MAP — Companies sheet
// ============================================================
const COMP_COL = {
  COMPANY_ID:       1,
  COMPANY_NAME:     2,
  SHORT_NAME:       3,
  ADDRESS:          4,
  CITY:             5,
  STATE:            6,
  ZIP:              7,
  EMAIL:            8,
  PHONE:            9,
  WEBSITE:         10,
  EIN:             11,
  STATE_INC:       12,
  YEAR_FOUNDED:    13,
  ENTITY_TYPE:     14,
  CAGE_CODE:       15,
  DUNS:            16,
  SAM_UEI:         17,
  NAICS:           18,
  SIC:             19,
  CONTRACT_TYPES:  20,
  CLEARANCE:       21,
  SET_ASIDE:       22,
  CEO:             23,
  CFO:             24,
  CTO:             25,
  CISO:            26,
  PRIMARY_CONTACT: 27,
  IT_POC:          28,
  SECURITY_POC:    29,
  COMPLIANCE_POC:  30,
  HR_POC:          31,
  EMPLOYEE_COUNT:  32,
  ANNUAL_REVENUE:  33,
  LOCATIONS:       34,
  REMOTE:          35,
  CLOUD_PROVIDER:  36,
  EMAIL_PLATFORM:  37,
  INSURANCE:       38,
  CYBER_INSURANCE: 39,
  CREATED_AT:      40,
  UPDATED_AT:      41,
};

// ============================================================
// PACKAGE DEFINITIONS
// ============================================================
const PACKAGES = {
  1: { name: 'Internal Compliance',           folder: 'PACKAGE_1_INTERNAL_COMPLIANCE' },
  2: { name: 'Security Compliance Handbook',  folder: 'PACKAGE_2_SECURITY_COMPLIANCE_HANDBOOK' },
  3: { name: 'Data Handling & Privacy',       folder: 'PACKAGE_3_DATA_HANDLING_PRIVACY' },
  4: { name: 'Government Contracting',        folder: 'PACKAGE_4_GOVERNMENT_CONTRACTING' },
  5: { name: 'Google Partner',                folder: 'PACKAGE_5_GOOGLE_PARTNER' },
  6: { name: 'Business Operations',           folder: 'PACKAGE_6_BUSINESS_OPERATIONS' },
  7: { name: 'Advanced Compliance',           folder: 'PACKAGE_7_ADVANCED_COMPLIANCE' },
};

// ============================================================
// MODULE META
// ============================================================
const MODULE_META = {
  module: 'compliance-command',
  version: '0.1.0',
  actions: Object.keys(_getRoutes()),
};

// ============================================================
// WEB APP ENTRY
// ============================================================
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const { action, data, apiKey } = body;

    if (COMPLIANCE_CONFIG.API_KEY && apiKey !== COMPLIANCE_CONFIG.API_KEY) {
      return _jsonResponse({ success: false, error: 'Unauthorized' }, 401);
    }

    const routes = _getRoutes();
    if (!routes[action]) {
      return _jsonResponse({
        success: false,
        error: `Unknown action: ${action}`,
        availableActions: Object.keys(routes),
      }, 400);
    }

    const result = routes[action](data || {});
    return _jsonResponse({ success: true, data: result });
  } catch (err) {
    Logger.log('compliance-command error: ' + err.message);
    return _jsonResponse({ success: false, error: err.message }, 500);
  }
}

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || 'meta';
  if (action === 'meta') {
    return _jsonResponse({ success: true, data: MODULE_META });
  }
  return _jsonResponse({ success: false, error: 'Use POST for actions' }, 405);
}

// ============================================================
// ROUTE TABLE
// ============================================================
function _getRoutes() {
  return {
    submitCompanyInfo:  _submitCompanyInfo,
    generatePackage:    _generatePackage,
    generateAll:        _generateAll,
    getCompanyInfo:     _getCompanyInfo,
    listCompanies:      _listCompanies,
    getPackageStatus:   _getPackageStatus,
  };
}

// ============================================================
// HELPER: Spreadsheet access
// ============================================================
function _getComplianceSS(data) {
  if (data && data.spreadsheetId) {
    return SpreadsheetApp.openById(data.spreadsheetId);
  }
  if (COMPLIANCE_CONFIG.SPREADSHEET_ID) {
    return SpreadsheetApp.openById(COMPLIANCE_CONFIG.SPREADSHEET_ID);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

function _getCompanySheet(data) {
  return _getComplianceSS(data).getSheetByName(COMPLIANCE_CONFIG.COMPANY_SHEET);
}

function _getLogSheet(data) {
  const ss = _getComplianceSS(data);
  let sheet = ss.getSheetByName(COMPLIANCE_CONFIG.LOG_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(COMPLIANCE_CONFIG.LOG_SHEET);
    sheet.appendRow(['Timestamp', 'CompanyID', 'Package', 'Documents', 'FolderURL', 'Status']);
  }
  return sheet;
}

// ============================================================
// ACTION: submitCompanyInfo
// ============================================================
function _submitCompanyInfo(data) {
  if (!data.companyName) throw new Error('companyName is required');
  if (!data.primaryContact) throw new Error('primaryContact is required');

  const sheet = _getCompanySheet(data);
  const allData = sheet.getDataRange().getValues();

  // Check if company already exists (by name match)
  let existingRow = -1;
  for (let i = 1; i < allData.length; i++) {
    if (allData[i][COMP_COL.COMPANY_NAME - 1] &&
        allData[i][COMP_COL.COMPANY_NAME - 1].toString().toLowerCase() === data.companyName.toLowerCase()) {
      existingRow = i + 1; // 1-indexed sheet row
      break;
    }
  }

  const now = new Date();
  const companyId = existingRow > 0
    ? allData[existingRow - 1][COMP_COL.COMPANY_ID - 1]
    : 'COMP-' + Utilities.getUuid().substring(0, 8).toUpperCase();

  const rowData = _buildRowFromData(data, companyId, now, existingRow > 0);

  if (existingRow > 0) {
    // Update existing row
    const range = sheet.getRange(existingRow, 1, 1, rowData.length);
    range.setValues([rowData]);
    return { companyId: companyId, status: 'updated', timestamp: now.toISOString() };
  } else {
    // Append new row
    sheet.appendRow(rowData);
    return { companyId: companyId, status: 'created', timestamp: now.toISOString() };
  }
}

function _buildRowFromData(data, companyId, now, isUpdate) {
  const row = [];
  row[COMP_COL.COMPANY_ID - 1]       = companyId;
  row[COMP_COL.COMPANY_NAME - 1]     = data.companyName || '';
  row[COMP_COL.SHORT_NAME - 1]       = data.companyShortName || '';
  row[COMP_COL.ADDRESS - 1]          = data.companyAddress || '';
  row[COMP_COL.CITY - 1]             = data.companyCity || '';
  row[COMP_COL.STATE - 1]            = data.companyState || '';
  row[COMP_COL.ZIP - 1]              = data.companyZip || '';
  row[COMP_COL.EMAIL - 1]            = data.companyEmail || '';
  row[COMP_COL.PHONE - 1]            = data.companyPhone || '';
  row[COMP_COL.WEBSITE - 1]          = data.website || '';
  row[COMP_COL.EIN - 1]              = data.ein || '';
  row[COMP_COL.STATE_INC - 1]        = data.stateOfIncorporation || '';
  row[COMP_COL.YEAR_FOUNDED - 1]     = data.yearFounded || '';
  row[COMP_COL.ENTITY_TYPE - 1]      = data.entityType || '';
  row[COMP_COL.CAGE_CODE - 1]        = data.cageCode || '';
  row[COMP_COL.DUNS - 1]             = data.dunsNumber || '';
  row[COMP_COL.SAM_UEI - 1]         = data.samUei || '';
  row[COMP_COL.NAICS - 1]            = data.naicsCodes || '';
  row[COMP_COL.SIC - 1]              = data.sicCodes || '';
  row[COMP_COL.CONTRACT_TYPES - 1]   = data.contractTypes || '';
  row[COMP_COL.CLEARANCE - 1]        = data.clearanceLevel || '';
  row[COMP_COL.SET_ASIDE - 1]        = data.setAsideStatus || '';
  row[COMP_COL.CEO - 1]              = data.ceo || '';
  row[COMP_COL.CFO - 1]              = data.cfo || '';
  row[COMP_COL.CTO - 1]              = data.cto || '';
  row[COMP_COL.CISO - 1]             = data.ciso || '';
  row[COMP_COL.PRIMARY_CONTACT - 1]  = data.primaryContact || '';
  row[COMP_COL.IT_POC - 1]           = data.itPoc || '';
  row[COMP_COL.SECURITY_POC - 1]     = data.securityPoc || '';
  row[COMP_COL.COMPLIANCE_POC - 1]   = data.compliancePoc || '';
  row[COMP_COL.HR_POC - 1]           = data.hrPoc || '';
  row[COMP_COL.EMPLOYEE_COUNT - 1]   = data.employeeCount || '';
  row[COMP_COL.ANNUAL_REVENUE - 1]   = data.annualRevenue || '';
  row[COMP_COL.LOCATIONS - 1]        = data.physicalLocations || '';
  row[COMP_COL.REMOTE - 1]           = data.remoteWorkforce || '';
  row[COMP_COL.CLOUD_PROVIDER - 1]   = data.cloudProvider || '';
  row[COMP_COL.EMAIL_PLATFORM - 1]   = data.emailPlatform || '';
  row[COMP_COL.INSURANCE - 1]        = data.insuranceCarrier || '';
  row[COMP_COL.CYBER_INSURANCE - 1]  = data.cyberInsurance || '';
  row[COMP_COL.CREATED_AT - 1]       = isUpdate ? '' : now.toISOString();  // preserve on update
  row[COMP_COL.UPDATED_AT - 1]       = now.toISOString();
  return row;
}

// ============================================================
// ACTION: generatePackage
// ============================================================
function _generatePackage(data) {
  if (!data.companyId) throw new Error('companyId is required');
  if (!data.packageNumber) throw new Error('packageNumber is required');

  const pkgNum = parseInt(data.packageNumber);
  if (!PACKAGES[pkgNum]) throw new Error('Invalid packageNumber. Must be 1-7.');

  const company = _loadCompanyById(data.companyId, data);
  if (!company) throw new Error('Company not found: ' + data.companyId);

  const pkg = PACKAGES[pkgNum];
  const result = ComplianceGenerator.generatePackage(company, pkgNum, pkg, data.outputFolderId);

  // Log generation
  _logGeneration(data.companyId, pkg.name, result.documentsGenerated, result.folderUrl, data);

  return {
    packageName: pkg.name,
    packageNumber: pkgNum,
    documentsGenerated: result.documentsGenerated,
    folderUrl: result.folderUrl,
  };
}

// ============================================================
// ACTION: generateAll
// ============================================================
function _generateAll(data) {
  if (!data.companyId) throw new Error('companyId is required');

  const company = _loadCompanyById(data.companyId, data);
  if (!company) throw new Error('Company not found: ' + data.companyId);

  const results = [];
  let totalDocs = 0;

  for (let pkgNum = 1; pkgNum <= 7; pkgNum++) {
    const pkg = PACKAGES[pkgNum];
    try {
      const result = ComplianceGenerator.generatePackage(company, pkgNum, pkg, data.outputFolderId);
      results.push({
        packageNumber: pkgNum,
        packageName: pkg.name,
        documentsGenerated: result.documentsGenerated,
        folderUrl: result.folderUrl,
        status: 'generated',
      });
      totalDocs += result.documentsGenerated;
      _logGeneration(data.companyId, pkg.name, result.documentsGenerated, result.folderUrl, data);
    } catch (err) {
      results.push({
        packageNumber: pkgNum,
        packageName: pkg.name,
        documentsGenerated: 0,
        status: 'error',
        error: err.message,
      });
      _logGeneration(data.companyId, pkg.name, 0, '', data, 'ERROR: ' + err.message);
    }
  }

  return {
    packages: results,
    totalDocuments: totalDocs,
    folderUrl: _getOrCreateCompanyFolder(company.companyName, data.outputFolderId).getUrl(),
  };
}

// ============================================================
// ACTION: getCompanyInfo
// ============================================================
function _getCompanyInfo(data) {
  if (!data.companyId) throw new Error('companyId is required');
  const company = _loadCompanyById(data.companyId, data);
  if (!company) throw new Error('Company not found: ' + data.companyId);
  return company;
}

// ============================================================
// ACTION: listCompanies
// ============================================================
function _listCompanies(data) {
  const sheet = _getCompanySheet(data);
  const allData = sheet.getDataRange().getValues();
  const companies = [];

  for (let i = 1; i < allData.length; i++) {
    const row = allData[i];
    if (!row[COMP_COL.COMPANY_ID - 1]) continue;
    companies.push({
      companyId: row[COMP_COL.COMPANY_ID - 1],
      companyName: row[COMP_COL.COMPANY_NAME - 1],
      primaryContact: row[COMP_COL.PRIMARY_CONTACT - 1],
      updatedAt: row[COMP_COL.UPDATED_AT - 1],
    });
  }

  return { companies: companies, count: companies.length };
}

// ============================================================
// ACTION: getPackageStatus
// ============================================================
function _getPackageStatus(data) {
  if (!data.companyId) throw new Error('companyId is required');

  const logSheet = _getLogSheet(data);
  const logData = logSheet.getDataRange().getValues();

  const packageStatus = {};
  for (let pkgNum = 1; pkgNum <= 7; pkgNum++) {
    packageStatus[pkgNum] = {
      name: PACKAGES[pkgNum].name,
      status: 'not_generated',
      documentCount: 0,
      lastGenerated: null,
    };
  }

  // Scan log for this company's entries
  for (let i = 1; i < logData.length; i++) {
    if (logData[i][1] !== data.companyId) continue;
    const pkgName = logData[i][2];
    for (let pkgNum = 1; pkgNum <= 7; pkgNum++) {
      if (PACKAGES[pkgNum].name === pkgName) {
        const status = logData[i][5] || 'generated';
        packageStatus[pkgNum] = {
          name: pkgName,
          status: status.toString().startsWith('ERROR') ? 'error' : 'generated',
          documentCount: logData[i][3] || 0,
          lastGenerated: logData[i][0],
          folderUrl: logData[i][4] || '',
        };
      }
    }
  }

  return {
    companyId: data.companyId,
    packages: Object.keys(packageStatus).map(function(k) { return packageStatus[k]; }),
  };
}

// ============================================================
// HELPERS
// ============================================================
function _loadCompanyById(companyId, data) {
  const sheet = _getCompanySheet(data);
  const allData = sheet.getDataRange().getValues();

  for (let i = 1; i < allData.length; i++) {
    if (allData[i][COMP_COL.COMPANY_ID - 1] === companyId) {
      return _rowToCompanyObj(allData[i]);
    }
  }
  return null;
}

function _rowToCompanyObj(row) {
  return {
    companyId:            row[COMP_COL.COMPANY_ID - 1],
    companyName:          row[COMP_COL.COMPANY_NAME - 1],
    companyShortName:     row[COMP_COL.SHORT_NAME - 1],
    companyAddress:       row[COMP_COL.ADDRESS - 1],
    companyCity:          row[COMP_COL.CITY - 1],
    companyState:         row[COMP_COL.STATE - 1],
    companyZip:           row[COMP_COL.ZIP - 1],
    companyEmail:         row[COMP_COL.EMAIL - 1],
    companyPhone:         row[COMP_COL.PHONE - 1],
    website:              row[COMP_COL.WEBSITE - 1],
    ein:                  row[COMP_COL.EIN - 1],
    stateOfIncorporation: row[COMP_COL.STATE_INC - 1],
    yearFounded:          row[COMP_COL.YEAR_FOUNDED - 1],
    entityType:           row[COMP_COL.ENTITY_TYPE - 1],
    cageCode:             row[COMP_COL.CAGE_CODE - 1],
    dunsNumber:           row[COMP_COL.DUNS - 1],
    samUei:               row[COMP_COL.SAM_UEI - 1],
    naicsCodes:           row[COMP_COL.NAICS - 1],
    sicCodes:             row[COMP_COL.SIC - 1],
    contractTypes:        row[COMP_COL.CONTRACT_TYPES - 1],
    clearanceLevel:       row[COMP_COL.CLEARANCE - 1],
    setAsideStatus:       row[COMP_COL.SET_ASIDE - 1],
    ceo:                  row[COMP_COL.CEO - 1],
    cfo:                  row[COMP_COL.CFO - 1],
    cto:                  row[COMP_COL.CTO - 1],
    ciso:                 row[COMP_COL.CISO - 1],
    primaryContact:       row[COMP_COL.PRIMARY_CONTACT - 1],
    itPoc:                row[COMP_COL.IT_POC - 1],
    securityPoc:          row[COMP_COL.SECURITY_POC - 1],
    compliancePoc:        row[COMP_COL.COMPLIANCE_POC - 1],
    hrPoc:                row[COMP_COL.HR_POC - 1],
    employeeCount:        row[COMP_COL.EMPLOYEE_COUNT - 1],
    annualRevenue:        row[COMP_COL.ANNUAL_REVENUE - 1],
    physicalLocations:    row[COMP_COL.LOCATIONS - 1],
    remoteWorkforce:      row[COMP_COL.REMOTE - 1],
    cloudProvider:        row[COMP_COL.CLOUD_PROVIDER - 1],
    emailPlatform:        row[COMP_COL.EMAIL_PLATFORM - 1],
    insuranceCarrier:     row[COMP_COL.INSURANCE - 1],
    cyberInsurance:       row[COMP_COL.CYBER_INSURANCE - 1],
    createdAt:            row[COMP_COL.CREATED_AT - 1],
    updatedAt:            row[COMP_COL.UPDATED_AT - 1],
  };
}

function _getOrCreateCompanyFolder(companyName, parentFolderId) {
  const parentId = parentFolderId || COMPLIANCE_CONFIG.OUTPUT_ROOT_FOLDER_ID;
  if (!parentId) throw new Error('No output folder configured. Set OUTPUT_ROOT_FOLDER_ID or pass outputFolderId.');

  const parent = DriveApp.getFolderById(parentId);
  const existing = parent.getFoldersByName(companyName);
  if (existing.hasNext()) return existing.next();
  return parent.createFolder(companyName);
}

function _logGeneration(companyId, packageName, docCount, folderUrl, data, status) {
  const logSheet = _getLogSheet(data);
  logSheet.appendRow([
    new Date().toISOString(),
    companyId,
    packageName,
    docCount,
    folderUrl,
    status || 'generated',
  ]);
}

function _jsonResponse(obj, code) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

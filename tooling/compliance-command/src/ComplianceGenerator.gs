/**
 * ComplianceGenerator — Template Population Engine
 * True North Data Strategies
 *
 * Reads company info, copies Google Doc templates, replaces all
 * {{PLACEHOLDER}} tokens with company data, organizes output into
 * Drive folders per package.
 *
 * TEMPLATE CONVENTION:
 *   Templates are Google Docs stored in subfolders under TEMPLATE_FOLDER_ID.
 *   Each subfolder matches PACKAGES[n].folder (e.g., PACKAGE_1_INTERNAL_COMPLIANCE).
 *   Placeholders use double-curly-brace format: {{COMPANY_NAME}}, {{CEO}}, etc.
 *
 * PLACEHOLDER MAP:
 *   Template placeholders map to companyInfoSchema keys via PLACEHOLDER_MAP below.
 *   Any {{TOKEN}} not in the map is left as-is (flagged in output for manual review).
 */

var ComplianceGenerator = (function() {

  // ============================================================
  // PLACEHOLDER MAP — maps {{TEMPLATE_TOKEN}} to company object keys
  // ============================================================
  var PLACEHOLDER_MAP = {
    // Core
    'COMPANY_NAME':         'companyName',
    'COMPANY_SHORT_NAME':   'companyShortName',
    'COMPANY_ADDRESS':      'companyAddress',
    'COMPANY_CITY':         'companyCity',
    'COMPANY_STATE':        'companyState',
    'COMPANY_ZIP':          'companyZip',
    'COMPANY_EMAIL':        'companyEmail',
    'COMPANY_PHONE':        'companyPhone',
    'WEBSITE':              'website',

    // Legal
    'EIN':                  'ein',
    'STATE_OF_INCORPORATION': 'stateOfIncorporation',
    'YEAR_FOUNDED':         'yearFounded',
    'ENTITY_TYPE':          'entityType',

    // Government
    'CAGE_CODE':            'cageCode',
    'DUNS_NUMBER':          'dunsNumber',
    'SAM_UEI':              'samUei',
    'NAICS_CODES':          'naicsCodes',
    'SIC_CODES':            'sicCodes',
    'CONTRACT_TYPES':       'contractTypes',
    'CLEARANCE_LEVEL':      'clearanceLevel',
    'SET_ASIDE_STATUS':     'setAsideStatus',

    // Personnel
    'CEO':                  'ceo',
    'CFO':                  'cfo',
    'CTO':                  'cto',
    'CISO':                 'ciso',
    'PRIMARY_CONTACT':      'primaryContact',
    'IT_POC':               'itPoc',
    'SECURITY_POC':         'securityPoc',
    'COMPLIANCE_POC':       'compliancePoc',
    'HR_POC':               'hrPoc',

    // Operations
    'EMPLOYEE_COUNT':       'employeeCount',
    'ANNUAL_REVENUE':       'annualRevenue',
    'PHYSICAL_LOCATIONS':   'physicalLocations',
    'REMOTE_WORKFORCE':     'remoteWorkforce',
    'CLOUD_PROVIDER':       'cloudProvider',
    'EMAIL_PLATFORM':       'emailPlatform',
    'INSURANCE_CARRIER':    'insuranceCarrier',
    'CYBER_INSURANCE':      'cyberInsurance',

    // Auto-generated
    'CURRENT_DATE':         '_currentDate',
    'CURRENT_YEAR':         '_currentYear',
    'GENERATED_BY':         '_generatedBy',
  };

  // ============================================================
  // PUBLIC: generatePackage
  // ============================================================
  function generatePackage(company, pkgNum, pkgDef, outputFolderId) {
    var templateFolder = _getTemplateSubfolder(pkgDef.folder);
    if (!templateFolder) {
      throw new Error('Template folder not found: ' + pkgDef.folder);
    }

    var companyFolder = _getOrCreateCompanyFolder(company.companyName, outputFolderId);
    var pkgFolder = _getOrCreateSubfolder(companyFolder, 'Package_' + pkgNum + '_' + pkgDef.name.replace(/[^a-zA-Z0-9]/g, '_'));

    var templates = templateFolder.getFilesByType(MimeType.GOOGLE_DOCS);
    var docsGenerated = 0;
    var unresolvedPlaceholders = [];

    while (templates.hasNext()) {
      var templateFile = templates.next();
      var result = _populateTemplate(templateFile, company, pkgFolder);
      docsGenerated++;
      if (result.unresolved.length > 0) {
        unresolvedPlaceholders = unresolvedPlaceholders.concat(result.unresolved);
      }
    }

    // Also process any Google Sheets templates in the folder
    var sheetTemplates = templateFolder.getFilesByType(MimeType.GOOGLE_SHEETS);
    while (sheetTemplates.hasNext()) {
      var sheetFile = sheetTemplates.next();
      _populateSheetTemplate(sheetFile, company, pkgFolder);
      docsGenerated++;
    }

    Logger.log('Package ' + pkgNum + ' generated: ' + docsGenerated + ' docs for ' + company.companyName);
    if (unresolvedPlaceholders.length > 0) {
      Logger.log('Unresolved placeholders: ' + unresolvedPlaceholders.join(', '));
    }

    return {
      documentsGenerated: docsGenerated,
      folderUrl: pkgFolder.getUrl(),
      unresolvedPlaceholders: unresolvedPlaceholders,
    };
  }

  // ============================================================
  // INTERNAL: Populate a single Google Doc template
  // ============================================================
  function _populateTemplate(templateFile, company, outputFolder) {
    // Copy template to output folder
    var docName = company.companyShortName
      ? company.companyShortName + ' - ' + templateFile.getName()
      : company.companyName + ' - ' + templateFile.getName();

    var copy = templateFile.makeCopy(docName, outputFolder);
    var doc = DocumentApp.openById(copy.getId());
    var body = doc.getBody();

    var unresolved = [];
    var replacementValues = _buildReplacementValues(company);

    // Replace all placeholders in document body
    for (var token in PLACEHOLDER_MAP) {
      var placeholder = '{{' + token + '}}';
      var value = replacementValues[token];

      if (value !== undefined && value !== null && value !== '') {
        body.replaceText('\\{\\{' + token + '\\}\\}', value.toString());
      } else {
        // Check if placeholder exists in doc
        if (body.findText('\\{\\{' + token + '\\}\\}')) {
          unresolved.push(token);
        }
      }
    }

    // Also replace in headers and footers
    var headers = doc.getHeader();
    var footers = doc.getFooter();
    if (headers) _replaceInElement(headers, replacementValues);
    if (footers) _replaceInElement(footers, replacementValues);

    doc.saveAndClose();

    return { docId: copy.getId(), unresolved: unresolved };
  }

  // ============================================================
  // INTERNAL: Populate a Google Sheets template
  // ============================================================
  function _populateSheetTemplate(sheetFile, company, outputFolder) {
    var sheetName = company.companyShortName
      ? company.companyShortName + ' - ' + sheetFile.getName()
      : company.companyName + ' - ' + sheetFile.getName();

    var copy = sheetFile.makeCopy(sheetName, outputFolder);
    var ss = SpreadsheetApp.openById(copy.getId());
    var replacementValues = _buildReplacementValues(company);

    ss.getSheets().forEach(function(sheet) {
      var range = sheet.getDataRange();
      var values = range.getValues();
      var modified = false;

      for (var r = 0; r < values.length; r++) {
        for (var c = 0; c < values[r].length; c++) {
          var cell = values[r][c];
          if (typeof cell === 'string' && cell.indexOf('{{') !== -1) {
            var newVal = _replaceAllTokens(cell, replacementValues);
            if (newVal !== cell) {
              values[r][c] = newVal;
              modified = true;
            }
          }
        }
      }

      if (modified) {
        range.setValues(values);
      }
    });
  }

  // ============================================================
  // INTERNAL: Build replacement values map
  // ============================================================
  function _buildReplacementValues(company) {
    var values = {};
    var now = new Date();

    for (var token in PLACEHOLDER_MAP) {
      var key = PLACEHOLDER_MAP[token];

      // Handle auto-generated values
      if (key === '_currentDate') {
        values[token] = Utilities.formatDate(now, Session.getScriptTimeZone(), 'MMMM d, yyyy');
      } else if (key === '_currentYear') {
        values[token] = now.getFullYear().toString();
      } else if (key === '_generatedBy') {
        values[token] = 'True North Data Strategies — compliance-command v0.1.0';
      } else {
        values[token] = company[key] || '';
      }
    }

    // Also build FULL_ADDRESS composite
    var parts = [company.companyAddress, company.companyCity, company.companyState, company.companyZip];
    values['FULL_ADDRESS'] = parts.filter(function(p) { return p; }).join(', ');

    return values;
  }

  // ============================================================
  // INTERNAL: Replace tokens in a string
  // ============================================================
  function _replaceAllTokens(str, replacementValues) {
    return str.replace(/\{\{([A-Z_]+)\}\}/g, function(match, token) {
      if (replacementValues[token] !== undefined && replacementValues[token] !== '') {
        return replacementValues[token].toString();
      }
      return match; // Leave unresolved
    });
  }

  // ============================================================
  // INTERNAL: Replace in header/footer elements
  // ============================================================
  function _replaceInElement(element, replacementValues) {
    for (var token in replacementValues) {
      var value = replacementValues[token];
      if (value) {
        element.replaceText('\\{\\{' + token + '\\}\\}', value.toString());
      }
    }
  }

  // ============================================================
  // INTERNAL: Drive folder helpers
  // ============================================================
  function _getTemplateSubfolder(folderName) {
    if (!COMPLIANCE_CONFIG.TEMPLATE_FOLDER_ID) {
      throw new Error('TEMPLATE_FOLDER_ID not configured');
    }
    var root = DriveApp.getFolderById(COMPLIANCE_CONFIG.TEMPLATE_FOLDER_ID);
    var folders = root.getFoldersByName(folderName);
    return folders.hasNext() ? folders.next() : null;
  }

  function _getOrCreateCompanyFolder(companyName, parentFolderId) {
    var parentId = parentFolderId || COMPLIANCE_CONFIG.OUTPUT_ROOT_FOLDER_ID;
    if (!parentId) throw new Error('No output folder configured');
    var parent = DriveApp.getFolderById(parentId);
    var existing = parent.getFoldersByName(companyName);
    if (existing.hasNext()) return existing.next();
    return parent.createFolder(companyName);
  }

  function _getOrCreateSubfolder(parent, name) {
    var existing = parent.getFoldersByName(name);
    if (existing.hasNext()) return existing.next();
    return parent.createFolder(name);
  }

  // ============================================================
  // PUBLIC API
  // ============================================================
  return {
    generatePackage: generatePackage,
    PLACEHOLDER_MAP: PLACEHOLDER_MAP,
  };

})();

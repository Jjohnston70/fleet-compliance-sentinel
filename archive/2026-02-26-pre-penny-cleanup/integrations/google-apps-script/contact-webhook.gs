/**
 * TNDS Contact Form Webhook
 * Google Apps Script — deploys as a Web App to receive POST from the website contact form
 * Writes to this sheet and sends Jacob an email alert on each submission.
 *
 * SETUP INSTRUCTIONS:
 * 1. Open Google Sheets → create a new sheet named "Contact Form Leads"
 * 2. In the sheet, go to Extensions → Apps Script
 * 3. Paste this entire script, replacing any existing code
 * 4. Save (Ctrl+S)
 * 5. Click Deploy → New Deployment
 *    - Type: Web App
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 6. Click Deploy → copy the Web App URL
 * 7. In your project, create .env.local and add:
 *    GOOGLE_SHEET_WEBHOOK_URL=<paste the URL here>
 * 8. Add that same env var in Vercel → Project → Settings → Environment Variables
 *
 * SHEET COLUMNS (auto-created on first submission):
 * A: Timestamp | B: Name | C: Business | D: Phone | E: Email | F: Message | G: Source
 */

const ALERT_EMAIL = 'jacob@truenorthstrategyops.com';
const SHEET_NAME = 'Contact Form Leads';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    writeToSheet(data);
    sendAlertEmail(data);
    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    Logger.log('doPost error: ' + err.message);
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function writeToSheet(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['Timestamp', 'Name', 'Business', 'Phone', 'Email', 'Message', 'Source']);
    sheet.getRange(1, 1, 1, 7).setFontWeight('bold').setBackground('#1a3a5c').setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }

  sheet.appendRow([
    data.timestamp || new Date().toISOString(),
    data.name || '',
    data.business || '',
    data.phone || '',
    data.email || '',
    data.message || '',
    data.source || 'website',
  ]);

  Logger.log('Row written for: ' + data.name);
}

function sendAlertEmail(data) {
  const subject = 'New Lead: ' + (data.name || 'Unknown') + ' — TNDS Website';
  const body = [
    'New contact form submission from truenorthstrategyops.com',
    '',
    'Name:     ' + (data.name || '—'),
    'Business: ' + (data.business || '—'),
    'Phone:    ' + (data.phone || '—'),
    'Email:    ' + (data.email || '—'),
    '',
    'Message:',
    (data.message || '(no message)'),
    '',
    'Submitted: ' + (data.timestamp || new Date().toISOString()),
    '',
    '---',
    'Reply directly to this email or call: ' + (data.phone || '(no phone provided)'),
  ].join('\n');

  GmailApp.sendEmail(ALERT_EMAIL, subject, body, {
    replyTo: data.email || ALERT_EMAIL,
    name: 'TNDS Website Alert',
  });

  Logger.log('Alert email sent to ' + ALERT_EMAIL);
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'TNDS contact webhook is live' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Run this manually in Apps Script editor to test everything works before going live
function testSubmission() {
  const mockData = {
    timestamp: new Date().toISOString(),
    name: 'Test User',
    business: 'Test HVAC LLC',
    phone: '(719) 555-0100',
    email: 'test@example.com',
    message: 'Test submission from the Apps Script editor.',
    source: 'manual test',
  };
  writeToSheet(mockData);
  sendAlertEmail(mockData);
  Logger.log('Test complete. Check the sheet and your email.');
}

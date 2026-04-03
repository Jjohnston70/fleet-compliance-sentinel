# Apps Script Integration

This directory is reserved for Google Apps Script components that integrate with the onboard-command module.

## Architecture

The onboard-command module is split between TypeScript (this repo) and Google Apps Script:

### TypeScript Services (src/)
The core business logic, state management, and queue processing happens in TypeScript:
- State machine and workflow orchestration
- Queue service and retry logic
- Document generation and templating
- Audit logging and compliance
- Reporting and analytics

### Google Apps Script (future: apps-script/)
Google Workspace Admin SDK operations stay in Apps Script because:
- Direct access to Admin Directory API
- User creation/suspension/deletion
- License assignment
- Drive creation and sharing
- Label management
- Email forwarding configuration

## Integration Pattern

1. **Frontend/UI**: Apps Script Web App or Google Sheets interface
2. **Queue Processor Hook**: TypeScript service processes queue items
3. **Delegation**: For production actions, queue processor triggers Apps Script via:
   - UrlFetchApp (webhook callbacks)
   - Script execution via Google Cloud Tasks
   - Pub/Sub messaging
4. **Test Mode**: TypeScript simulates operations without calling Apps Script

## Future Implementation

When building apps-script/:

1. Create `Code.gs` with Google Workspace Admin SDK calls
2. Create `AppsScriptApiEndpoints.gs` to expose functions
3. Implement these operations:
   - `createUser(email, givenName, familyName)`
   - `suspendUser(email)`
   - `assignLicense(email, licenseType)`
   - `createDrive(displayName, email)`
   - `createFolders(driveId, folderNames)`
   - `createLabels(email, labelNames)`
   - `setForwarding(email, forwardTo)`

4. Create webhook receiver to process queue items from TypeScript

## Configuration

Apps Script will need access to:
- Firebase Firestore for queue items
- Service account credentials for Admin SDK
- Environment variables (via PropertiesService)

## Testing

- TypeScript tests mock all operations (in-memory)
- Integration tests (if built) would use Apps Script Editor's built-in test runner
- E2E tests would use Google Test Runner or Apps Script Manifest v2 testing APIs

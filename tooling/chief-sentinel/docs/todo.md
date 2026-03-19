# Todo

## Immediate

- Review `generated_imports/validation_report.json` and decide which warnings should become hard failures vs soft warnings.
- Reduce seeded fallback rows by populating the blank source files for permits, tanks, vehicles, and maintenance schedule.
- Add per-record validation badges or source-quality flags inside the Chief detail pages.

## Data

- Import and normalize `EMPLOYEES.csv`.
- Import and normalize `VEHICLES & EQUIPMENT.csv`.
- Import and normalize `STORAGE TANKS.csv`.
- Import and normalize `PERMITS & LICENSES.csv`.
- Import and normalize `MAINTENANCE SCHEDULE.csv`.
- Import `COLORADO CONTACTS.csv`.
- Import `EMERGENCY CONTACTS.csv`.
- Extract relevant workbook records from:
  - `Assets Master`
  - `Drivers`
  - `Activity Log`
  - `Maintenance Tracker`
  - `Config`

## Penny

- Continue improving retrieval and prompt routing for plain-language compliance questions.
- Add source section display or deep-linking for returned CFR answers.

## Chief App

- Add resource/document linkage to each asset and compliance record.
- Add importer validation visibility inside the `/chief` overview page.
- Add sortable columns or saved filter presets for assets, compliance, and suspense routes.
- Add record drill-ins for maintenance events and activity logs.

## Alerts

- Define suspense item generation rules.
- Add due-soon and overdue alert windows.
- Add scheduled alert runner.
- Add email template for reminders.
- Add notification log to avoid duplicate sends.

## Files / Resources

- Define attachment model using Google Drive links for the demo.
- Decide which files should render inline vs open in Drive.
- Identify required Chief manuals, permits, and certificates for protected resources.

## FMCSA

- Refactor `fetch_fmcsa_data.py` into a server-safe FMCSA client.
- Add DOT-number lookup flow.
- Store FMCSA snapshots.
- Evaluate whether FMCSA results should create suspense or warning records.

## Later

- Add inline editing.
- Add mobile capture flows for photos.
- Add native file uploads.
- Add Firestore writes behind the current import-backed demo views.
- Add Firestore / Storage-backed operational workflows if the demo converts into a fuller build.

Archived during Pipeline Penny cleanup on February 26, 2026.

Reason:
- Preserve legacy marketing assets/integration files that are not used by the current Penny site routes.
- Keep repository deploy surface focused on active routes/components.

Contents:
- `public/`: legacy images and PDFs no longer referenced by current app code.
- `integrations/google-apps-script/`: old contact form webhook script no longer used after contact route removal.
- `misc/next-sitemap.config.js`: old sitemap config no longer used (app now uses `src/app/sitemap.ts`).
- `misc/New Text Document.txt`: stray local file.

# AquaPriority MX — Prototype Security Review

## Architecture boundary

The application is a public, read-only-hosted academic interface with browser-session state. It has no database, authentication, accounts, API routes, external write APIs, secrets, or personal data. Supabase is intentionally absent; authentication and RLS are therefore not applicable to the current data model. Any future shared persistence or personal information must stop implementation until authentication and per-user Row Level Security are designed and tested.

## Implemented controls

- `.env*`, keys, dependencies, builds, hosting metadata, logs and raw transcript capture are Git-ignored.
- All committed case IDs, roles, coordinates, contexts, records and outcomes are explicitly fictional.
- Sensor source is fixed to `SIMULATED`; timestamp, numeric ranges, quality, scenario and seed are validated.
- Free text is bounded to 10–300 characters and rendered by React without raw HTML.
- Numeric override priority is constrained to integer 1–8.
- Workflow states and required reviewer roles use closed TypeScript unions and explicit transition maps.
- Model artifact structure, feature order, finite values and checksum are tested; failures return unavailable.
- No income, payment status, household identity or protected-class field exists in the ranking schema.
- No automatic dispatch, excavation, diagnosis, repair or verification operation exists.

## Executed checks

- `npm audit --audit-level=high`: zero vulnerabilities after upgrading Next/Vitest and removing a vulnerable lint dependency chain.
- `git status --ignored`: raw terminal transcript remains ignored.
- Full TypeScript, lint, unit, browser and production-build checks passed at the recorded local version.
- No application environment variables or runtime credentials are required.

## Residual risks

- OpenStreetMap tiles require third-party connectivity and disclose ordinary tile requests; the accessible list remains functional without them.
- Session history is non-durable and disappears on refresh/reset. The UI discloses that it is not a municipal audit database.
- Synthetic data/model performance may not transfer to real infrastructure and must never be represented as field validation.
- Public deployment configuration must remain free of Vercel authentication protection for grading while the app itself stores no private data.

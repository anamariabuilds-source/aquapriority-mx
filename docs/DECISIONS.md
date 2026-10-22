# DECISIONS — Week 11 AquaPriority MX

## 2026-10-22 · Pre-code packet session
- Authoritative project: Team 3 Week 11 Blueprint, approved Loss Visibility, 3-2. Preserve dissent in documentation.
- Ana María declaration: spreadsheet baseline vs transparent rule-based repair prioritization on labeled hypothetical cases.
- DRAGON STACK: (1) deterministic simulated IoT pressure/flow feed, (2) actually trained offline synthetic-data Logistic Regression ML model and measured holdout metrics, (3) interactive GeoJSON/Leaflet fictional map with fallback.
- Security choice: no personal data, real incidents, authentication or persistent shared backend at first; scope expansion requires auth and RLS if user personal data are stored.
- Human authority, uncertainty, equity/anti-rationing and distinct evidence status enforced in acceptance criteria.
- Packet and mockup created before code. No commits, deployments or live runtime yet.

## Open blockers
- Obtain working local repository, commit and push packet before writing application code.
- Approve a detailed implementation prompt based on this packet before Codex begins code.
- Implement actual ML training artifact, inference parity tests and interactive sensor/map workflows.
- Document legitimate mechanical bug-fix-redeploy and fresh-chat persona test.

## Next session's first move
1. Add `docs/PACKET.md`, `docs/DECISIONS.md` and `assets/aquapriority_mockup.png` to the local repository.
2. Commit and push as the first **pre-code** commit (record real hash).
3. Convert the packet into an acceptance-criteria-first Codex implementation prompt; then begin code.

## Session close status
Packet written; working Git repository is not connected here, therefore **commit/push not performed**, and no commit is claimed.

## 2026-10-22 · Implementation authorization and audit correction
- Historical note preserved: the preceding session-close statement became stale after commit `1c55139` was created. Git now verifies that commit as the root commit containing the Packet, Blueprint, decisions log, Packet PDF and pre-code mockup before any application code.
- The approved implementation audit is accepted. `docs/METHODOLOGY.md` freezes the spreadsheet baseline, sensor validation and feature formulas, 0–100 rule specification, tie-breaking, ML target/evaluation gates, human-authority transitions and adversarial fairness cases before implementation.
- Hosting remains Vercel as required; the unrelated Sites/Cloudflare workflow is not used.
- Security baseline: raw terminal recording, environment files, dependencies, build output and sensitive logs are excluded from Git. No accounts, Supabase, personal data or external write API are authorized.
- Current external blocker: no Git remote is configured, so pushes and GitHub-linked deployment cannot occur until repository access is supplied. Local implementation and verification may continue.

## 2026-10-22 · Complete implementation and two-deployment session
- Built a responsive Spanish Next.js dashboard over eight validated fictional incidents. The immutable spreadsheet baseline, transparent 0–100 rules and trained experimental ML all consume the same incident/sensor evidence.
- Implemented deterministic simulated pressure/flow scenarios with validation and visible recomputation. Incomplete evidence abstains as `REVIEW REQUIRED`; ML separately returns `ML UNAVAILABLE`.
- Trained scikit-learn logistic regression with fixed seed, group-disjoint holdout, saved coefficients/scaler/checksum and Python/TypeScript golden parity. Actual synthetic holdout: F1 `0.804469`, ROC-AUC `0.755090`, Brier `0.196724`; not field validation.
- Implemented Leaflet with eight fictional markers, fictional service-context polygons, two-way incident selection, OpenStreetMap attribution and accessible tile-failure fallback.
- Implemented role-gated exact status transitions, bounded confirmed human overrides, append-only in-session evidence/review history, and reset. No persistent municipal audit claim is made.
- Mechanical result: typecheck passed; lint passed; 21 unit/component tests passed; production build passed; dependency audit found zero vulnerabilities; final Deployment 2 browser suite passed 4 tests.
- Genuine BUG-001 was preserved on Deployment 1: all unavailable ML cases reversed because the comparator violated antisymmetry. Commit `1d71aed` added the explicit both-null tie path and regression coverage; Deployment 2 passes.
- Deployment 1: `dpl_BCtXw2Xm5pv7tBqz5vMyfJqwp74V`. Deployment 2: `dpl_AyaNYp6PXXUYuGj3cFfYLqsWrEMN`. Current verified production URL: `https://aquapriority-mx.vercel.app`.
- Five ordered screenshots from Deployment 2 and a fresh-chat persona protocol are prepared. Persona responses, persona-driven correction, `PERSONA_AnaMariaMatas.pdf`, demo video and final Build Chat PDF remain unperformed and must not be claimed.
- Native Codex JSONL and the separate raw terminal capture exist privately. Export/redaction procedure is documented; neither raw source is committed.

## Remaining risks and blockers
- No GitHub remote is configured and the `gh` CLI is unavailable. A GitHub repository URL/authenticated remote is required for push evidence.
- The fresh-chat persona test must be performed by the user in a separate conversation using the ordered screenshots; its responses cannot be fabricated here.
- `DEMO_AnaMariaMatas.mp4`, `PERSONA_AnaMariaMatas.pdf` and `BUILDCHAT_AnaMariaMatas.pdf` remain pending.
- OpenStreetMap basemap access depends on network connectivity; the accessible incident list is the tested fallback.

## Next session's first action
1. Run the separate fresh-chat persona test with `docs/persona-screenshots/01-baseline.png` through `05-human-review.png` in order and preserve every response verbatim.
2. Record all confusions, implement and test the highest-severity confirmed usability correction, then redeploy if the product changes.
3. Configure the authenticated GitHub remote, push the complete history, and record the repository URL.

## Session close status
Core application, Dragon Stack, comparison, mechanical testing, genuine bug-fix-redeploy cycle, two Vercel deployments, security scan and persona-test preparation are complete. External submission artifacts and the separate persona interaction remain pending as explicitly listed above.

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

# AquaPriority MX — Mechanical Test Record

All results below are from actual commands on 22 October 2026. They concern a synthetic academic prototype, not real water infrastructure.

## Verified local checks after BUG-001 fix

| Check | Command | Observed result |
|---|---|---|
| Type safety | `npm run typecheck` | Passed |
| Lint | `npm run lint` | Passed, zero reported errors |
| Unit/component suite | `npm test` | 6 files, 21 tests passed |
| Local browser suite | `npm run test:e2e` | 3 Playwright tests passed in Chrome |
| Production build | `npm run build` | Passed; `/` statically generated |
| Dependency advisory scan | `npm audit --audit-level=high` | 0 vulnerabilities |
| ML training | `npm run ml:train` | Completed with fixed seed and saved artifact |
| ML parity | Vitest `lib/ml.test.ts` | 12 golden fixture predictions within `1e-6` |

## Coverage by behavior

- Eight-case schema and fictional provenance validation
- Pressure/flow bounds, source, timestamp and missing-data checks
- Same-seed simulator reproducibility and scenario feature changes
- Transparent rule component bounds, stable tie-breaks and abstention
- No income/payment/household scoring fields
- Group-disjoint ML holdout, artifact checksum, finite metrics and inference parity
- Corrupt/non-finite ML failure returning unavailable
- Eight map markers, marker/list selection, table-driven focus and tile fallback
- Override rationale/priority/confirmation requirements
- Exact role-gated status transition and append-only history
- Demo reset browser behavior
- Regression for all-unavailable ML stable order

## Preserved failures

1. Initial Vercel deployment command rejected the long directory-derived project name; retry used explicit `aquapriority-mx`.
2. First deployed browser run reached Vercel login instead of the product; project SSO protection was disabled and the same two tests then passed.
3. Deployment 1 edge test found BUG-001: all unavailable ML cases reversed. The unchanged regression passes after commit `1d71aed`.
4. A local cloud-synced ignored dependency directory appeared as `@vitest/spy 2`; it was restored to the lockfile-defined path. Vitest configuration was also narrowed so Playwright specs are not interpreted as unit tests.

## External results

- Deployment 1 public smoke tests: 2 passed after access correction.
- Deployment 1 BUG-001 regression: 1 failed before fix, as documented.
- Deployment 2: 4 Playwright flows passed against immutable URL `https://aquapriority-1d8hj2voq-anamaria-builds.vercel.app`, including BUG-001 and persona screenshot capture.
- Secret-pattern scan of tracked working content and Git patches found no API-key, bearer-token, or private-key matches.

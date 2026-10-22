# AquaPriority MX — Deployment Evidence

## Deployment 1 — pre-bug-fix baseline

- Vercel project: `anamaria-builds/aquapriority-mx`
- Deployment ID: `dpl_BCtXw2Xm5pv7tBqz5vMyfJqwp74V`
- Git commit: `17b5139` (`feat: add fictional geodata and human review workflow`)
- Created: 2026-10-22 12:38:56 America/Mexico_City
- Immutable URL: https://aquapriority-2k0u58lvs-anamaria-builds.vercel.app
- Production alias after readiness: https://aquapriority-mx.vercel.app
- Vercel terminal state: `Ready`
- Build duration reported by Vercel: 3m 8s; post-build 16s

### Mechanical results

- Local Playwright before deployment: 2 passed.
- First clean-browser deployed run: 2 failed because Vercel SSO protection redirected to login. This was a real deployment-configuration failure; project SSO protection was disabled without exposing credentials.
- Clean-browser deployed rerun after public-access correction: 2 passed.
- Edge-case test `ML unavailable cases retain deterministic sheet-row order`: **failed on Deployment 1**. See `docs/BUG_LOG.md`.

Deployment 1 is preserved as the pre-application-bug-fix deployment. It contains only fictional/synthetic data and does not prove real municipal outcomes.

## Deployment 2

- Vercel project: `anamaria-builds/aquapriority-mx`
- Deployment ID: `dpl_AyaNYp6PXXUYuGj3cFfYLqsWrEMN`
- Git commit: `1d71aed` (`fix: stabilize ML unavailable ordering with regression coverage`)
- Created: 2026-10-22 13:02:48 America/Mexico_City
- Immutable URL: https://aquapriority-1d8hj2voq-anamaria-builds.vercel.app
- Production URL: https://aquapriority-mx.vercel.app
- Vercel terminal state: `READY`
- Deployment protection reported by Vercel: none

### Mechanical results

- Four deployed Playwright flows passed: comparison/scenario behavior, map and guarded review workflow, unchanged BUG-001 regression, and five ordered persona screenshot captures.
- BUG-001 now retains `sheetRow` order 1→8 when all ML signals are unavailable.
- Deployment IDs and immutable URLs are distinct from Deployment 1.

Deployment 2 is the current verified production version. Reachability and test success demonstrate software behavior only; they do not demonstrate real repairs, water savings, cost savings, or field model validity.

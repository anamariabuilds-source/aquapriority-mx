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

Pending regression fix and redeployment. Do not infer a URL or successful result until recorded here.

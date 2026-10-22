# AquaPriority MX — Genuine Bug Evidence

## BUG-001 — `ML UNAVAILABLE` cases displayed in reverse order

- Discovered: 2026-10-22 after Deployment 1
- Environment: Deployment `dpl_BCtXw2Xm5pv7tBqz5vMyfJqwp74V`
- Commit under test: `17b5139`
- Test: `e2e/bug-regression.spec.ts`
- Status before fix: **FAILED**

### Reproduction

1. Open the public deployed application.
2. Choose `Lecturas incompletas o no confiables`.
3. Open `ML experimental`.
4. Observe that all results correctly say `ML UNAVAILABLE`, but incident order is reversed from sheet rows 8→1 instead of using the documented stable fallback 1→8.

### Expected

When every ML inference is unavailable, preserve deterministic ordering by `sheetRow` ascending, then incident ID ascending. Unavailable model results must not imply an experimental rank.

### Actual preserved test output

Expected IDs began `INC-FX-1047`, `INC-FX-1032`, `INC-FX-1075`; received IDs began `INC-FX-1104`, `INC-FX-1091`, `INC-FX-1082`. Playwright result: 1 failed. The failed run retained its trace in local ignored `test-results` output.

### Cause

The ML comparator returned `-1` whenever the right-hand probability was null. When both values were null it still returned `-1`, violating comparator antisymmetry and causing V8 to reverse the array.

### Fix

The comparator now handles both-null values explicitly using `sheetRow` ascending and incident ID ascending, handles exactly one null value separately, and only compares probabilities when both are finite results. A unit regression sorts a deliberately reversed all-null set and requires rows 1–8. The original Playwright regression remains unchanged.

### Post-fix verification

- Unit suite: 21 passed, including the explicit all-null comparator regression.
- Local Playwright: 3 passed, including the unchanged browser reproduction.
- TypeScript and lint: passed before the fix verification cycle.
- Deployment 2: pending at the time of this edit; deployment evidence must be appended rather than assumed.

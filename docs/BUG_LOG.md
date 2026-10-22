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

### Fix and redeployment

Pending at the time this evidence entry was committed. The next commit must implement an explicit both-null tie path, add a unit regression, run the browser regression, and produce Deployment 2.

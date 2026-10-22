# AquaPriority MX — Frozen Experimental Methodology

**Frozen before application implementation: 22 October 2026.** These specifications govern a fictional academic prototype. They are not municipal operating standards and do not establish real leaks, repairs, savings, or benefits.

## Shared evaluation set

The application uses eight fixed hypothetical incidents in every displayed method. `sheetRow` is immutable and uniquely identifies the basic spreadsheet order. Demo incident IDs are excluded from ML training.

## Basic spreadsheet baseline

The baseline sorts by `sheetRow` ascending. Report timestamps are displayed but never affect the baseline order. This is a deliberately minimal spreadsheet proxy, not an observed municipal workflow.

## Simulated sensing

Each deterministic reading contains `sensorId`, ISO `timestamp`, `pressureBar`, `flowLpm`, `qualityFlag`, `source: SIMULATED`, `scenarioId`, and integer `seed`.

Prototype validation bounds are pressure 0–10 bar and flow 0–500 L/min. These are validation bounds for the simulator, not claims about infrastructure standards. The three scenarios are `STABLE`, `POSSIBLE_ANOMALY`, and `INCOMPLETE_UNRELIABLE`. Missing, non-finite, out-of-range, wrongly sourced, or invalid-time observations are invalid essential evidence and force `REVIEW REQUIRED`.

For valid evidence, sensor anomaly is normalized from pressure-drop and flow-rise features:

- `pressureDrop = clamp((referencePressureBar - meanPressureBar) / referencePressureBar, 0, 1)`
- `flowRise = clamp((meanFlowLpm - referenceFlowLpm) / referenceFlowLpm, 0, 1)`
- `sensorAnomaly = clamp(0.6 × pressureDrop + 0.4 × flowRise, 0, 1)`

Changing scenario regenerates readings from the incident seed, re-extracts features, recomputes rules, and runs ML inference only when inputs are valid. Sensor output never advances status or authorizes action.

## Transparent rule engine

The score is fixed at 0–100:

| Component | Normalization | Points |
|---|---|---:|
| Sensor anomaly evidence | `sensorAnomaly × 40` | 0–40 |
| Area-level service vulnerability | LOW 5, MEDIUM 15, HIGH 25 | 0–25 |
| Service interruption severity | LOW 5, MEDIUM 12, HIGH 20 | 0–20 |
| Operational feasibility | LOW 5, MEDIUM 10, HIGH 15 | 0–15 |

Operational feasibility contributes at most 15 points and cannot erase the vulnerability or interruption components. It never independently suppresses an urgent case. The model contains no income, ability-to-pay, household, protected-class, or punitive-rationing feature.

Valid cases sort by total score descending, then `sheetRow` ascending, then incident ID ascending. Cases with invalid essential sensing display `REVIEW REQUIRED` and sort after scored cases using `sheetRow`, then ID. Every result is a proposal for qualified human review, never automatic dispatch, diagnosis, excavation, repair, or verification.

Displayed explanations must include the four components, evidence quality, missing evidence, rank difference from baseline, and limitations.

## Experimental machine learning

Target: **Synthetic anomaly warrants human inspection.** The target cannot authorize repair, ration water, change workflow status, or verify an outcome.

An offline scikit-learn `LogisticRegression` estimator is fitted on reproducibly generated synthetic cases. A noisy latent outcome combines generated pressure change, flow change, quality, interruption, and area-level vulnerability with random noise; it is not copied from the transparent rule score. Groups are split before fitting, and no group may appear in both train and holdout. The eight demo IDs are absent from training.

The artifact records model version, seed, feature order, scaler means/scales, coefficients, intercept, and checksum. Golden fixtures verify Python/TypeScript parity within `1e-6`. All predictions must be finite and within [0,1]. The untouched holdout always reports confusion matrix, precision, recall, F1, ROC-AUC when defined, and Brier score. F1 ≥ 0.65 is a provisional experimental target only; results below it remain visible and are not tuned away using the holdout.

The UI label is `ML EXPERIMENTAL — TRAINED ON SYNTHETIC DATA; NOT VALIDATED ON REAL LEAKS`. Invalid input or artifact/inference failure produces `ML UNAVAILABLE`, never a rule-derived substitute.

## Human authority and truth states

Exact states are `SUSPECTED`, `PHYSICALLY_CONFIRMED`, `REPAIRED`, and `OUTCOME_VERIFIED`.

- `SUSPECTED → PHYSICALLY_CONFIRMED` requires qualified human inspection evidence.
- `PHYSICALLY_CONFIRMED → REPAIRED` requires a human-approved repair record.
- `REPAIRED → OUTCOME_VERIFIED` requires independent post-repair evidence.

All other forward jumps are prohibited. Sensors, rules, and ML cannot change status. Priority overrides require a fictional qualified role, a 10–300 character rationale, explicit confirmation, and an append-only local-session audit event. Browser storage, if used, contains fictional demo state only and is explicitly not a durable municipal audit database.

## Fictional geodata

All points and service-context polygons are locally stored illustrative coordinates, not observed sites or real utility coverage. Marker and accessible-list selection share one selected incident state. Map-tile failure must not block selection or core comparison behavior. OpenStreetMap tiles require visible attribution.

## Frozen fairness adversarial cases

1. Equivalent sensor and interruption evidence with different fictional vulnerability levels: the component difference must be visible and human-reviewable, without dispatch.
2. High vulnerability plus low feasibility: feasibility cannot remove vulnerability points or force deprioritization below an otherwise weaker case solely due to feasibility.
3. Missing sensing in a high-vulnerability area: display `REVIEW REQUIRED`; do not manufacture confidence.
4. Any input resembling income, payment status, household identity, or protected-class profiling is outside the schema and rejected.


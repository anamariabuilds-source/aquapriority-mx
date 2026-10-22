# AquaPriority MX Experimental Model Card

- Model: `aquapriority-synthetic-logreg-v1`
- Target: Synthetic anomaly warrants human inspection
- Fixed seed: `20261022`
- Train cases/groups: 720 / 180
- Holdout cases/groups: 240 / 60
- Train/holdout group overlap: 0
- Confusion matrix `[[TN, FP], [FN, TP]]`: `[[26, 61], [9, 144]]`
- Precision: 0.702439
- Recall: 0.941176
- F1: 0.804469
- ROC-AUC: 0.755090
- Brier score: 0.196724
- Provisional F1 target met: True
- Artifact SHA-256: `b94ca71def0a6c5f4c1567229e0007754953eb564dea1cdfb90a112bac36b2d7`

## Data-generating assumptions

Synthetic pressure-drop, flow-rise, signal-quality, interruption, and area-level vulnerability factors are sampled in scenario groups. A noisy latent logistic process generates labels; it is not copied from the transparent rule score. Groups are split before fitting to prevent related cases appearing on both sides. The eight `INC-FX-*` demonstration incidents are never training records.

## Limitations

All performance is measured on an untouched synthetic holdout. It is not evidence of real leak detection, repair effectiveness, water savings, equity outcomes, or municipal performance. The model can only provide an experimental signal for human inspection review.

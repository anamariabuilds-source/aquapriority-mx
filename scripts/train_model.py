#!/usr/bin/env python3
"""Train AquaPriority MX's real experimental model on labeled synthetic cases."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    brier_score_loss,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import GroupShuffleSplit
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

SEED = 20261022
MODEL_VERSION = "aquapriority-synthetic-logreg-v1"
FEATURE_NAMES = [
    "pressure_drop",
    "flow_rise",
    "quality_score",
    "interruption_ordinal",
    "vulnerability_ordinal",
]
ROOT = Path(__file__).resolve().parents[1]
ARTIFACT_DIR = ROOT / "public" / "model"
DOCS_DIR = ROOT / "docs"


def sigmoid(value: np.ndarray) -> np.ndarray:
    return 1.0 / (1.0 + np.exp(-value))


def generate_cases() -> tuple[np.ndarray, np.ndarray, np.ndarray, list[str]]:
    """Create noisy labels from latent factors, independently of the rule formula."""
    rng = np.random.default_rng(SEED)
    features: list[list[float]] = []
    labels: list[int] = []
    groups: list[str] = []
    case_ids: list[str] = []
    for group_number in range(240):
        group_id = f"TRAIN-GROUP-{group_number:03d}"
        group_pressure = rng.beta(1.8, 3.0)
        group_flow = rng.beta(1.7, 3.2)
        group_quality = rng.choice([0.45, 0.75, 1.0], p=[0.12, 0.22, 0.66])
        group_interruption = int(rng.integers(0, 3))
        group_vulnerability = int(rng.integers(0, 3))
        group_noise = rng.normal(0, 0.25)
        for sample_number in range(4):
            pressure_drop = float(np.clip(group_pressure + rng.normal(0, 0.055), 0, 1))
            flow_rise = float(np.clip(group_flow + rng.normal(0, 0.06), 0, 1))
            quality_score = float(np.clip(group_quality + rng.normal(0, 0.04), 0, 1))
            interruption = float(group_interruption)
            vulnerability = float(group_vulnerability)
            # This stochastic latent outcome is not the transparent 0–100 rule.
            latent = (
                -3.0
                + 4.0 * pressure_drop
                + 3.2 * flow_rise
                + 0.8 * quality_score
                + 0.5 * interruption
                + 0.25 * vulnerability
                + group_noise
                + rng.normal(0, 0.45)
            )
            probability = float(sigmoid(np.array([latent]))[0])
            label = int(rng.binomial(1, probability))
            features.append([pressure_drop, flow_rise, quality_score, interruption, vulnerability])
            labels.append(label)
            groups.append(group_id)
            case_ids.append(f"SYN-TRAIN-{group_number:03d}-{sample_number}")
    return np.asarray(features), np.asarray(labels), np.asarray(groups), case_ids


def canonical_json(value: object) -> str:
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False)


def main() -> None:
    x, y, groups, case_ids = generate_cases()
    splitter = GroupShuffleSplit(n_splits=1, test_size=0.25, random_state=SEED)
    train_idx, holdout_idx = next(splitter.split(x, y, groups))
    train_groups = set(groups[train_idx].tolist())
    holdout_groups = set(groups[holdout_idx].tolist())
    overlap = sorted(train_groups.intersection(holdout_groups))
    if overlap:
        raise RuntimeError(f"Group leakage detected: {overlap}")
    if any(identifier.startswith("INC-FX-") for identifier in case_ids):
        raise RuntimeError("Demo incident leaked into training IDs")

    pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("model", LogisticRegression(random_state=SEED, max_iter=2000, solver="liblinear")),
    ])
    pipeline.fit(x[train_idx], y[train_idx])
    probabilities = pipeline.predict_proba(x[holdout_idx])[:, 1]
    predictions = (probabilities >= 0.5).astype(int)
    matrix = confusion_matrix(y[holdout_idx], predictions, labels=[0, 1]).tolist()
    metrics = {
        "holdout_size": int(len(holdout_idx)),
        "train_size": int(len(train_idx)),
        "train_group_count": len(train_groups),
        "holdout_group_count": len(holdout_groups),
        "group_overlap_count": len(overlap),
        "confusion_matrix": matrix,
        "precision": float(precision_score(y[holdout_idx], predictions, zero_division=0)),
        "recall": float(recall_score(y[holdout_idx], predictions, zero_division=0)),
        "f1": float(f1_score(y[holdout_idx], predictions, zero_division=0)),
        "roc_auc": float(roc_auc_score(y[holdout_idx], probabilities)),
        "brier_score": float(brier_score_loss(y[holdout_idx], probabilities)),
        "provisional_f1_target": 0.65,
        "target_met": bool(f1_score(y[holdout_idx], predictions, zero_division=0) >= 0.65),
    }
    scaler: StandardScaler = pipeline.named_steps["scaler"]
    model: LogisticRegression = pipeline.named_steps["model"]
    artifact_without_checksum = {
        "schema_version": 1,
        "model_version": MODEL_VERSION,
        "target": "Synthetic anomaly warrants human inspection",
        "training_seed": SEED,
        "feature_names": FEATURE_NAMES,
        "scaler_mean": scaler.mean_.tolist(),
        "scaler_scale": scaler.scale_.tolist(),
        "coefficients": model.coef_[0].tolist(),
        "intercept": float(model.intercept_[0]),
        "decision_threshold": 0.5,
        "metrics": metrics,
        "limitations": [
            "Trained and evaluated only on generated synthetic cases.",
            "Not validated against real leaks, repairs, infrastructure, or field outcomes.",
            "Output is an experimental inspection signal and cannot authorize action.",
        ],
    }
    checksum = hashlib.sha256(canonical_json(artifact_without_checksum).encode("utf-8")).hexdigest()
    artifact = {**artifact_without_checksum, "artifact_checksum_sha256": checksum}

    fixture_indices = holdout_idx[:12]
    fixture_probabilities = pipeline.predict_proba(x[fixture_indices])[:, 1]
    fixtures = [
        {
            "case_id": case_ids[index],
            "features": {name: float(x[index, position]) for position, name in enumerate(FEATURE_NAMES)},
            "expected_probability": float(probability),
        }
        for index, probability in zip(fixture_indices, fixture_probabilities)
    ]

    ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)
    (ARTIFACT_DIR / "model_coefficients.json").write_text(json.dumps(artifact, indent=2) + "\n", encoding="utf-8")
    (ARTIFACT_DIR / "golden_fixtures.json").write_text(json.dumps(fixtures, indent=2) + "\n", encoding="utf-8")
    (ARTIFACT_DIR / "holdout_manifest.json").write_text(json.dumps({
        "seed": SEED,
        "train_groups": sorted(train_groups),
        "holdout_groups": sorted(holdout_groups),
        "overlap": overlap,
    }, indent=2) + "\n", encoding="utf-8")
    (DOCS_DIR / "MODEL_CARD.md").write_text(
        "# AquaPriority MX Experimental Model Card\n\n"
        f"- Model: `{MODEL_VERSION}`\n"
        f"- Target: Synthetic anomaly warrants human inspection\n"
        f"- Fixed seed: `{SEED}`\n"
        f"- Train cases/groups: {metrics['train_size']} / {metrics['train_group_count']}\n"
        f"- Holdout cases/groups: {metrics['holdout_size']} / {metrics['holdout_group_count']}\n"
        f"- Train/holdout group overlap: {metrics['group_overlap_count']}\n"
        f"- Confusion matrix `[[TN, FP], [FN, TP]]`: `{matrix}`\n"
        f"- Precision: {metrics['precision']:.6f}\n"
        f"- Recall: {metrics['recall']:.6f}\n"
        f"- F1: {metrics['f1']:.6f}\n"
        f"- ROC-AUC: {metrics['roc_auc']:.6f}\n"
        f"- Brier score: {metrics['brier_score']:.6f}\n"
        f"- Provisional F1 target met: {metrics['target_met']}\n"
        f"- Artifact SHA-256: `{checksum}`\n\n"
        "## Data-generating assumptions\n\n"
        "Synthetic pressure-drop, flow-rise, signal-quality, interruption, and area-level vulnerability factors are sampled in scenario groups. A noisy latent logistic process generates labels; it is not copied from the transparent rule score. Groups are split before fitting to prevent related cases appearing on both sides. The eight `INC-FX-*` demonstration incidents are never training records.\n\n"
        "## Limitations\n\n"
        "All performance is measured on an untouched synthetic holdout. It is not evidence of real leak detection, repair effectiveness, water savings, equity outcomes, or municipal performance. The model can only provide an experimental signal for human inspection review.\n",
        encoding="utf-8",
    )
    print(json.dumps({"model_version": MODEL_VERSION, "checksum": checksum, "metrics": metrics}, indent=2))


if __name__ == "__main__":
    main()

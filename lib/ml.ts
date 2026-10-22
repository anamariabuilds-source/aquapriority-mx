import artifactJson from "@/public/model/model_coefficients.json";
import type { Incident } from "@/types/domain";
import type { SensorFeatures } from "@/lib/simulator";

export const ML_FEATURE_NAMES = ["pressure_drop", "flow_rise", "quality_score", "interruption_ordinal", "vulnerability_ordinal"] as const;
export type MlFeatureName = (typeof ML_FEATURE_NAMES)[number];
export type MlFeatures = Record<MlFeatureName, number>;

export interface MlArtifact {
  schema_version: number;
  model_version: string;
  target: string;
  training_seed: number;
  feature_names: string[];
  scaler_mean: number[];
  scaler_scale: number[];
  coefficients: number[];
  intercept: number;
  decision_threshold: number;
  metrics: {
    holdout_size: number;
    train_size: number;
    train_group_count: number;
    holdout_group_count: number;
    group_overlap_count: number;
    confusion_matrix: number[][];
    precision: number;
    recall: number;
    f1: number;
    roc_auc: number;
    brier_score: number;
    provisional_f1_target: number;
    target_met: boolean;
  };
  limitations: string[];
  artifact_checksum_sha256: string;
}

const artifact = artifactJson as MlArtifact;

export function validateMlArtifact(value: MlArtifact = artifact): string[] {
  const errors: string[] = [];
  if (value.schema_version !== 1) errors.push("unsupported artifact schema");
  if (value.target !== "Synthetic anomaly warrants human inspection") errors.push("unexpected model target");
  if (JSON.stringify(value.feature_names) !== JSON.stringify(ML_FEATURE_NAMES)) errors.push("feature order mismatch");
  for (const [name, array] of [["means", value.scaler_mean], ["scales", value.scaler_scale], ["coefficients", value.coefficients]] as const) {
    if (array.length !== ML_FEATURE_NAMES.length || !array.every(Number.isFinite)) errors.push(`invalid ${name}`);
  }
  if (value.scaler_scale.some((item) => item <= 0)) errors.push("invalid scaler scale");
  if (!Number.isFinite(value.intercept)) errors.push("invalid intercept");
  if (!/^[a-f0-9]{64}$/.test(value.artifact_checksum_sha256)) errors.push("invalid checksum");
  return errors;
}

const ordinal = { LOW: 0, MEDIUM: 1, HIGH: 2 } as const;

export function buildMlFeatures(incident: Incident, sensor: SensorFeatures): MlFeatures | null {
  if (sensor.evidenceQuality !== "COMPLETE" || sensor.pressureDrop === null || sensor.flowRise === null) return null;
  return {
    pressure_drop: sensor.pressureDrop,
    flow_rise: sensor.flowRise,
    quality_score: 1,
    interruption_ordinal: ordinal[incident.interruption],
    vulnerability_ordinal: ordinal[incident.vulnerability],
  };
}

export function predictInspectionSignal(features: MlFeatures, value: MlArtifact = artifact): number | null {
  if (validateMlArtifact(value).length > 0) return null;
  const rawValues = ML_FEATURE_NAMES.map((name) => features[name]);
  if (!rawValues.every(Number.isFinite)) return null;
  const logit = rawValues.reduce((sum, raw, index) => sum + ((raw - value.scaler_mean[index]) / value.scaler_scale[index]) * value.coefficients[index], value.intercept);
  const probability = 1 / (1 + Math.exp(-logit));
  return Number.isFinite(probability) && probability >= 0 && probability <= 1 ? probability : null;
}

export function getMlArtifact(): MlArtifact { return artifact; }

export function compareMlSignals(left: { incident: Incident; probability: number | null }, right: { incident: Incident; probability: number | null }): number {
  if (left.probability === null && right.probability === null) {
    return left.incident.sheetRow - right.incident.sheetRow || left.incident.id.localeCompare(right.incident.id);
  }
  if (left.probability === null) return 1;
  if (right.probability === null) return -1;
  return right.probability - left.probability || left.incident.sheetRow - right.incident.sheetRow || left.incident.id.localeCompare(right.incident.id);
}

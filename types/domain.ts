export const STATUSES = ["SUSPECTED", "PHYSICALLY_CONFIRMED", "REPAIRED", "OUTCOME_VERIFIED"] as const;
export type IncidentStatus = (typeof STATUSES)[number];
export type Level = "LOW" | "MEDIUM" | "HIGH";
export type ScenarioId = "STABLE" | "POSSIBLE_ANOMALY" | "INCOMPLETE_UNRELIABLE";
export type QualityFlag = "GOOD" | "MISSING" | "UNRELIABLE" | "INVALID";

export interface EvidenceEvent {
  id: string;
  timestamp: string;
  source: "SIMULATED_SENSOR" | "FICTIONAL_HUMAN_RECORD";
  summary: string;
}

export interface ReviewEvent {
  id: string;
  timestamp: string;
  role: ReviewerRole;
  action: "PRIORITY_OVERRIDE" | "STATUS_TRANSITION" | "CORRECTION";
  rationale: string;
  priority?: number;
}

export type ReviewerRole = "COORDINADOR_DE_TRIAGE" | "INSPECTOR_CALIFICADO" | "SUPERVISOR_DE_REPARACION" | "REVISOR_INDEPENDIENTE";

export interface Incident {
  id: string;
  sheetRow: number;
  zoneName: string;
  locationLabel: string;
  coordinates: readonly [number, number];
  locationSource: "FICTIONAL";
  reportTimestamp: string;
  sensorId: string;
  sensorSeed: number;
  referencePressureBar: number;
  referenceFlowLpm: number;
  vulnerability: Level;
  vulnerabilityRationale: string;
  interruption: Level;
  feasibility: Level;
  ownerRole: ReviewerRole;
  nextAction: string;
  status: IncidentStatus;
  resolutionRecord: string;
  evidenceHistory: EvidenceEvent[];
  reviewHistory: ReviewEvent[];
}

export interface SensorReading {
  sensorId: string;
  timestamp: string;
  pressureBar: number | null;
  flowLpm: number | null;
  qualityFlag: QualityFlag;
  source: "SIMULATED";
  scenarioId: ScenarioId;
  seed: number;
}

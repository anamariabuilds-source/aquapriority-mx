import type { Incident, ScenarioId, SensorReading } from "@/types/domain";
import { validateSensorReading } from "@/lib/validation";

function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

const round = (value: number, precision = 3) => Number(value.toFixed(precision));

export function simulateReadings(incident: Incident, scenarioId: ScenarioId): SensorReading[] {
  const random = mulberry32(incident.sensorSeed + scenarioId.length * 997);
  const baseTime = Date.parse(incident.reportTimestamp);
  return Array.from({ length: 6 }, (_, index) => {
    const timeFactor = index / 5;
    let pressureBar: number | null = incident.referencePressureBar + (random() - 0.5) * 0.12;
    let flowLpm: number | null = incident.referenceFlowLpm + (random() - 0.5) * 5;
    let qualityFlag: SensorReading["qualityFlag"] = "GOOD";

    if (scenarioId === "POSSIBLE_ANOMALY") {
      const incidentVariation = 0.75 + (incident.sensorSeed % 7) / 20;
      pressureBar -= incident.referencePressureBar * (0.08 + timeFactor * 0.34) * incidentVariation;
      flowLpm += incident.referenceFlowLpm * (0.05 + timeFactor * 0.31) * incidentVariation;
    }
    if (scenarioId === "INCOMPLETE_UNRELIABLE") {
      if (index === 2) pressureBar = null;
      if (index === 4) flowLpm = null;
      qualityFlag = index % 2 === 0 ? "UNRELIABLE" : "GOOD";
    }

    return {
      sensorId: incident.sensorId,
      timestamp: new Date(baseTime + index * 5 * 60_000).toISOString(),
      pressureBar: pressureBar === null ? null : round(pressureBar),
      flowLpm: flowLpm === null ? null : round(flowLpm),
      qualityFlag,
      source: "SIMULATED",
      scenarioId,
      seed: incident.sensorSeed,
    };
  });
}

export interface SensorFeatures {
  meanPressureBar: number | null;
  meanFlowLpm: number | null;
  pressureDrop: number | null;
  flowRise: number | null;
  sensorAnomaly: number | null;
  evidenceQuality: "COMPLETE" | "INVALID_OR_INCOMPLETE";
  missingEvidence: string[];
}

const clamp = (value: number) => Math.min(1, Math.max(0, value));

export function extractSensorFeatures(incident: Incident, readings: SensorReading[]): SensorFeatures {
  const missingEvidence = readings.flatMap((reading, index) => validateSensorReading(reading).map((error) => `Lectura ${index + 1}: ${error}`));
  if (readings.length === 0) missingEvidence.push("No hay lecturas");
  if (missingEvidence.length > 0) {
    return { meanPressureBar: null, meanFlowLpm: null, pressureDrop: null, flowRise: null, sensorAnomaly: null, evidenceQuality: "INVALID_OR_INCOMPLETE", missingEvidence };
  }
  const meanPressureBar = readings.reduce((sum, item) => sum + (item.pressureBar ?? 0), 0) / readings.length;
  const meanFlowLpm = readings.reduce((sum, item) => sum + (item.flowLpm ?? 0), 0) / readings.length;
  const pressureDrop = clamp((incident.referencePressureBar - meanPressureBar) / incident.referencePressureBar);
  const flowRise = clamp((meanFlowLpm - incident.referenceFlowLpm) / incident.referenceFlowLpm);
  const sensorAnomaly = clamp(0.6 * pressureDrop + 0.4 * flowRise);
  return { meanPressureBar: round(meanPressureBar), meanFlowLpm: round(meanFlowLpm), pressureDrop: round(pressureDrop, 6), flowRise: round(flowRise, 6), sensorAnomaly: round(sensorAnomaly, 6), evidenceQuality: "COMPLETE", missingEvidence: [] };
}

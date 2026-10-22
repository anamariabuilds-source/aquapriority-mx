import type { Incident, Level, ScenarioId } from "@/types/domain";
import { extractSensorFeatures, simulateReadings, type SensorFeatures } from "@/lib/simulator";

const VULNERABILITY_POINTS: Record<Level, number> = { LOW: 5, MEDIUM: 15, HIGH: 25 };
const INTERRUPTION_POINTS: Record<Level, number> = { LOW: 5, MEDIUM: 12, HIGH: 20 };
const FEASIBILITY_POINTS: Record<Level, number> = { LOW: 5, MEDIUM: 10, HIGH: 15 };

export interface RuleResult {
  incidentId: string;
  baselineRank: number;
  ruleRank: number;
  rankDifference: number;
  score: number | null;
  requiresReview: boolean;
  components: { sensor: number | null; vulnerability: number; interruption: number; feasibility: number };
  features: SensorFeatures;
  explanation: string;
}

export function scoreIncident(incident: Incident, scenarioId: ScenarioId): Omit<RuleResult, "ruleRank" | "rankDifference"> {
  const features = extractSensorFeatures(incident, simulateReadings(incident, scenarioId));
  const components = {
    sensor: features.sensorAnomaly === null ? null : Number((features.sensorAnomaly * 40).toFixed(2)),
    vulnerability: VULNERABILITY_POINTS[incident.vulnerability],
    interruption: INTERRUPTION_POINTS[incident.interruption],
    feasibility: FEASIBILITY_POINTS[incident.feasibility],
  };
  const sensorPoints = components.sensor;
  const requiresReview = sensorPoints === null;
  const score = sensorPoints === null ? null : Number((sensorPoints + components.vulnerability + components.interruption + components.feasibility).toFixed(2));
  const explanation = requiresReview
    ? `REVIEW REQUIRED · Evidencia esencial incompleta (${features.missingEvidence.length} observaciones). No se emite recomendación confiada.`
    : `Señal simulada ${components.sensor}/40, vulnerabilidad de servicio ${components.vulnerability}/25, interrupción ${components.interruption}/20 y factibilidad ${components.feasibility}/15. Requiere decisión humana.`;
  return { incidentId: incident.id, baselineRank: incident.sheetRow, score, requiresReview, components, features, explanation };
}

export function rankByRules(incidents: readonly Incident[], scenarioId: ScenarioId): RuleResult[] {
  const scored = incidents.map((incident) => ({ incident, result: scoreIncident(incident, scenarioId) }));
  scored.sort((left, right) => {
    if (left.result.score === null && right.result.score !== null) return 1;
    if (left.result.score !== null && right.result.score === null) return -1;
    if (left.result.score !== null && right.result.score !== null && left.result.score !== right.result.score) return right.result.score - left.result.score;
    if (left.incident.sheetRow !== right.incident.sheetRow) return left.incident.sheetRow - right.incident.sheetRow;
    return left.incident.id.localeCompare(right.incident.id);
  });
  return scored.map(({ result }, index) => ({ ...result, ruleRank: index + 1, rankDifference: result.baselineRank - (index + 1) }));
}

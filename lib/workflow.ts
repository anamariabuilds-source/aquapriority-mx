import type { Incident, IncidentStatus, ReviewerRole, ReviewEvent } from "@/types/domain";

export const MAX_RATIONALE_LENGTH = 300;
export const MIN_RATIONALE_LENGTH = 10;

const NEXT_STATUS: Partial<Record<IncidentStatus, IncidentStatus>> = {
  SUSPECTED: "PHYSICALLY_CONFIRMED",
  PHYSICALLY_CONFIRMED: "REPAIRED",
  REPAIRED: "OUTCOME_VERIFIED",
};

const REQUIRED_ROLE: Partial<Record<IncidentStatus, ReviewerRole>> = {
  SUSPECTED: "INSPECTOR_CALIFICADO",
  PHYSICALLY_CONFIRMED: "SUPERVISOR_DE_REPARACION",
  REPAIRED: "REVISOR_INDEPENDIENTE",
};

export function validateBoundedText(value: string): string | null {
  const length = value.trim().length;
  if (length < MIN_RATIONALE_LENGTH) return `Se requieren al menos ${MIN_RATIONALE_LENGTH} caracteres.`;
  if (length > MAX_RATIONALE_LENGTH) return `Máximo ${MAX_RATIONALE_LENGTH} caracteres.`;
  return null;
}

export function appendPriorityOverride(incident: Incident, input: { role: ReviewerRole; rationale: string; priority: number; confirmed: boolean; timestamp: string }): { incident: Incident | null; error: string | null } {
  const textError = validateBoundedText(input.rationale);
  if (textError) return { incident: null, error: textError };
  if (!input.confirmed) return { incident: null, error: "Se requiere confirmación explícita." };
  if (!Number.isInteger(input.priority) || input.priority < 1 || input.priority > 8) return { incident: null, error: "La prioridad debe ser un entero de 1 a 8." };
  const event: ReviewEvent = { id: `REV-${incident.id}-${input.timestamp}`, timestamp: input.timestamp, role: input.role, action: "PRIORITY_OVERRIDE", rationale: input.rationale.trim(), priority: input.priority };
  return { incident: { ...incident, reviewHistory: [...incident.reviewHistory, event] }, error: null };
}

export function transitionStatus(incident: Incident, input: { role: ReviewerRole; evidence: string; confirmed: boolean; timestamp: string }): { incident: Incident | null; error: string | null } {
  const target = NEXT_STATUS[incident.status];
  if (!target) return { incident: null, error: "No existe una transición posterior permitida." };
  const evidenceError = validateBoundedText(input.evidence);
  if (evidenceError) return { incident: null, error: evidenceError };
  if (!input.confirmed) return { incident: null, error: "Se requiere confirmación humana explícita." };
  if (input.role !== REQUIRED_ROLE[incident.status]) return { incident: null, error: `La transición requiere el rol ${REQUIRED_ROLE[incident.status]}.` };
  const descriptions: Record<IncidentStatus, string> = {
    SUSPECTED: "Señal o reporte sin confirmación física.",
    PHYSICALLY_CONFIRMED: "Inspección humana calificada ficticia registrada.",
    REPAIRED: "Reparación ficticia aprobada; resultado aún no verificado.",
    OUTCOME_VERIFIED: "Evidencia posterior ficticia revisada de forma independiente.",
  };
  return {
    incident: {
      ...incident,
      status: target,
      resolutionRecord: descriptions[target],
      evidenceHistory: [...incident.evidenceHistory, { id: `EV-${incident.id}-${input.timestamp}`, timestamp: input.timestamp, source: "FICTIONAL_HUMAN_RECORD", summary: input.evidence.trim() }],
      reviewHistory: [...incident.reviewHistory, { id: `REV-${incident.id}-${input.timestamp}`, timestamp: input.timestamp, role: input.role, action: "STATUS_TRANSITION", rationale: `Transición humana aprobada: ${incident.status} → ${target}` }],
    },
    error: null,
  };
}

export function getNextStatus(status: IncidentStatus): IncidentStatus | null { return NEXT_STATUS[status] ?? null; }
export function getRequiredRole(status: IncidentStatus): ReviewerRole | null { return REQUIRED_ROLE[status] ?? null; }

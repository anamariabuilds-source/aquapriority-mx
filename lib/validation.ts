import { STATUSES, type Incident, type SensorReading } from "@/types/domain";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;

export function isValidIsoTimestamp(value: string): boolean {
  return ISO_DATE.test(value) && Number.isFinite(Date.parse(value));
}

export function validateIncident(incident: Incident): string[] {
  const errors: string[] = [];
  if (!/^INC-FX-\d{4}$/.test(incident.id)) errors.push("invalid fictional incident ID");
  if (!Number.isInteger(incident.sheetRow) || incident.sheetRow < 1) errors.push("invalid sheetRow");
  if (incident.locationSource !== "FICTIONAL") errors.push("location must be fictional");
  const [lat, lng] = incident.coordinates;
  if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lng) || lng < -180 || lng > 180) errors.push("invalid coordinates");
  if (!isValidIsoTimestamp(incident.reportTimestamp)) errors.push("invalid report timestamp");
  if (!(STATUSES as readonly string[]).includes(incident.status)) errors.push("invalid status");
  if (incident.nextAction.trim().length < 3 || incident.nextAction.length > 160) errors.push("invalid next action");
  if (incident.resolutionRecord.trim().length < 3 || incident.resolutionRecord.length > 400) errors.push("invalid resolution record");
  if (incident.vulnerabilityRationale.trim().length < 10 || incident.vulnerabilityRationale.length > 300) errors.push("invalid vulnerability rationale");
  return errors;
}

export function validateSensorReading(reading: SensorReading): string[] {
  const errors: string[] = [];
  if (!reading.sensorId || reading.sensorId.length > 40) errors.push("invalid sensor identifier");
  if (!isValidIsoTimestamp(reading.timestamp)) errors.push("invalid timestamp");
  if (reading.source !== "SIMULATED") errors.push("source must be SIMULATED");
  if (!Number.isInteger(reading.seed)) errors.push("seed must be an integer");
  if (reading.pressureBar === null) errors.push("missing pressure");
  else if (!Number.isFinite(reading.pressureBar) || reading.pressureBar < 0 || reading.pressureBar > 10) errors.push("pressure outside prototype bounds");
  if (reading.flowLpm === null) errors.push("missing flow");
  else if (!Number.isFinite(reading.flowLpm) || reading.flowLpm < 0 || reading.flowLpm > 500) errors.push("flow outside prototype bounds");
  if (reading.qualityFlag !== "GOOD") errors.push(`quality ${reading.qualityFlag.toLowerCase()}`);
  return errors;
}

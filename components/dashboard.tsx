"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { INCIDENTS } from "@/data/incidents";
import { rankByRules } from "@/lib/rules";
import { extractSensorFeatures, simulateReadings } from "@/lib/simulator";
import { buildMlFeatures, compareMlSignals, getMlArtifact, predictInspectionSignal } from "@/lib/ml";
import type { ScenarioId } from "@/types/domain";
import type { Incident, ReviewerRole } from "@/types/domain";
import { appendPriorityOverride, getNextStatus, getRequiredRole, transitionStatus } from "@/lib/workflow";

const IncidentMap = dynamic(() => import("@/components/incident-map"), { ssr: false, loading: () => <div className="map-loading">Cargando mapa interactivo…</div> });

type Mode = "BASELINE" | "RULES" | "ML";
const levelLabel = { HIGH: "Alta", MEDIUM: "Media", LOW: "Baja" } as const;
const scenarioLabel: Record<ScenarioId, string> = { STABLE: "Lecturas estables", POSSIBLE_ANOMALY: "Posible anomalía", INCOMPLETE_UNRELIABLE: "Lecturas incompletas o no confiables" };

export function Dashboard() {
  const [incidents, setIncidents] = useState<Incident[]>(() => INCIDENTS.map((item) => ({ ...item, evidenceHistory: [...item.evidenceHistory], reviewHistory: [...item.reviewHistory] })));
  const [mode, setMode] = useState<Mode>("BASELINE");
  const [scenario, setScenario] = useState<ScenarioId>("POSSIBLE_ANOMALY");
  const [selectedId, setSelectedId] = useState(INCIDENTS[0].id);
  const [reviewRole, setReviewRole] = useState<ReviewerRole>("COORDINADOR_DE_TRIAGE");
  const [overridePriority, setOverridePriority] = useState(1);
  const [rationale, setRationale] = useState("");
  const [evidence, setEvidence] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [formMessage, setFormMessage] = useState("");
  const rules = useMemo(() => rankByRules(incidents, scenario), [incidents, scenario]);
  const ruleById = useMemo(() => new Map(rules.map((item) => [item.incidentId, item])), [rules]);
  const mlResults = useMemo(() => incidents.map((incident) => {
    const sensor = extractSensorFeatures(incident, simulateReadings(incident, scenario));
    const features = buildMlFeatures(incident, sensor);
    return { incident, probability: features ? predictInspectionSignal(features) : null };
  }).sort(compareMlSignals), [incidents, scenario]);
  const mlById = useMemo(() => new Map(mlResults.map((item, index) => [item.incident.id, { ...item, rank: index + 1 }])), [mlResults]);
  const ordered = mode === "RULES" ? rules.map((item) => incidents.find((incident) => incident.id === item.incidentId)!) : mode === "ML" ? mlResults.map((item) => item.incident) : [...incidents];
  const selected = incidents.find((incident) => incident.id === selectedId) ?? incidents[0];
  const selectedRule = ruleById.get(selectedId)!;
  const readings = simulateReadings(selected, scenario);
  const selectedMl = mlById.get(selectedId)!;
  const artifact = getMlArtifact();
  const nextStatus = getNextStatus(selected.status);

  const updateIncident = (updated: Incident) => setIncidents((current) => current.map((item) => item.id === updated.id ? updated : item));
  const submitOverride = () => {
    const result = appendPriorityOverride(selected, { role: reviewRole, rationale, priority: overridePriority, confirmed, timestamp: new Date().toISOString() });
    if (!result.incident) return setFormMessage(result.error ?? "No fue posible registrar la revisión.");
    updateIncident(result.incident); setRationale(""); setConfirmed(false); setFormMessage("Prioridad humana registrada en el historial local ficticio.");
  };
  const submitTransition = () => {
    const result = transitionStatus(selected, { role: reviewRole, evidence, confirmed, timestamp: new Date().toISOString() });
    if (!result.incident) return setFormMessage(result.error ?? "Transición rechazada.");
    updateIncident(result.incident); setEvidence(""); setConfirmed(false); setFormMessage(`Estado actualizado a ${result.incident.status} por revisión humana ficticia.`);
  };
  const resetDemo = () => {
    const reset = INCIDENTS.map((item) => ({ ...item, evidenceHistory: [...item.evidenceHistory], reviewHistory: [...item.reviewHistory] }));
    setIncidents(reset); setSelectedId(reset[0].id); setFormMessage("Demo ficticia restablecida.");
  };

  return <main className="app-shell">
    <header className="topbar"><div className="brand"><div className="drop" aria-hidden="true" /><div><h1>AquaPriority MX</h1><p>Priorización con revisión humana</p></div></div><div className="demo-banner" role="note">DEMO · DATOS SINTÉTICOS · NO OPERATIVO</div><div className="role-chip">Rol ficticio<br /><strong>Coordinación de triage</strong></div></header>
    <div className="content">
      <section className="hero"><div><p className="eyebrow">Vacío aprobado · Visibilidad de pérdidas</p><h2>¿Qué incidente se revisa primero?</h2><p className="hero-copy">La comparación obligatoria usa los mismos ocho casos: fila de hoja básica frente a reglas transparentes. ML permanece separado y experimental.</p></div><aside className="truth-note"><strong>Límite de evidencia:</strong> una alerta no prueba una fuga. Una reparación registrada no demuestra reducción de pérdidas.</aside></section>
      <section className="dragon-grid" aria-label="Tecnologías del prototipo"><article className="dragon-card iot"><strong>IoT · Señales simuladas</strong><span>Presión y flujo reproducibles, con fuente, calidad, fecha, escenario y semilla.</span></article><article className="dragon-card ml"><strong>ML · Experimental entrenado</strong><span>{artifact.model_version} · F1 sintético {artifact.metrics.f1.toFixed(3)} · Brier {artifact.metrics.brier_score.toFixed(3)}. No validado en fugas reales.</span></article><article className="dragon-card geo"><strong>GEO · Ubicaciones ficticias</strong><span>Contexto agregado inventado; no representa cobertura ni reportes reales.</span></article></section>
      <IncidentMap incidents={incidents} selectedId={selectedId} onSelect={setSelectedId} />
      <div className="dashboard-grid">
        <section className="panel">
          <div className="controls"><div className="tabs" role="tablist" aria-label="Método de comparación">
            <button type="button" role="tab" aria-selected={mode === "BASELINE"} onClick={() => setMode("BASELINE")}>1 · Hoja básica</button>
            <button type="button" role="tab" aria-selected={mode === "RULES"} onClick={() => setMode("RULES")}>2 · Reglas transparentes</button>
            <button type="button" role="tab" aria-selected={mode === "ML"} onClick={() => setMode("ML")}>3 · ML experimental</button>
          </div><label className="scenario-control">Escenario IoT simulado<select value={scenario} onChange={(event) => setScenario(event.target.value as ScenarioId)}>{Object.entries(scenarioLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></div>
          <div className="panel-head"><h3>{mode === "BASELINE" ? "Hoja básica · sheetRow ascendente" : mode === "RULES" ? "Reglas transparentes · 0–100" : "ML EXPERIMENTAL · señal para inspección humana"}</h3><p>{mode === "ML" ? `Entrenado en datos sintéticos · holdout F1 ${artifact.metrics.f1.toFixed(3)}, ROC-AUC ${artifact.metrics.roc_auc.toFixed(3)}, Brier ${artifact.metrics.brier_score.toFixed(3)} · no es probabilidad de reparación.` : "Toda prioridad es una propuesta sujeta a revisión humana calificada."}</p></div>
          <div className="table-wrap"><table><thead><tr><th>{mode === "RULES" ? "Rango regla" : mode === "ML" ? "Rango ML" : "Fila"}</th><th>Incidente</th><th>Zona ficticia</th><th>Estado exacto</th><th>{mode === "RULES" ? "Puntaje / diferencia" : mode === "ML" ? "Señal experimental" : "Vulnerabilidad"}</th><th>Evidencia / explicación</th></tr></thead><tbody>{ordered.map((incident) => {
            const rule = ruleById.get(incident.id)!; const ml = mlById.get(incident.id)!; return <tr key={incident.id} className={incident.id === selectedId ? "selected-row" : ""}><td>{mode === "RULES" ? rule.ruleRank : mode === "ML" ? ml.rank : incident.sheetRow}</td><td><button className="id-button" type="button" onClick={() => setSelectedId(incident.id)} aria-pressed={incident.id === selectedId}>{incident.id}</button><br /><small>Base #{incident.sheetRow}</small></td><td>{incident.zoneName}<br /><small>{incident.locationLabel}</small></td><td><span className="status">{incident.status}</span></td><td>{mode === "RULES" ? <>{rule.score ?? "REVIEW REQUIRED"}<br /><small>Cambio: {rule.rankDifference > 0 ? "+" : ""}{rule.rankDifference}</small></> : mode === "ML" ? <>{ml.probability === null ? "ML UNAVAILABLE" : `${(ml.probability * 100).toFixed(1)}%`}<br /><small>No es probabilidad de fuga verificada.</small></> : <><span className={`pill ${incident.vulnerability.toLowerCase()}`}>{levelLabel[incident.vulnerability]}</span><br /><small>{incident.vulnerabilityRationale}</small></>}</td><td>{mode === "RULES" ? rule.explanation : mode === "ML" ? ml.probability === null ? "ML UNAVAILABLE · evidencia inválida; no se usaron reglas como reemplazo." : "Señal del modelo entrenado para considerar inspección humana. No autoriza acción." : <>Reportado {new Date(incident.reportTimestamp).toLocaleString("es-MX", { timeZone: "UTC" })} UTC<br /><small>{incident.nextAction}</small></>}</td></tr>;
          })}</tbody></table></div>
        </section>
        <aside className="detail-panel" aria-live="polite"><p className="eyebrow">Incidente seleccionado</p><h3>{selected.id}</h3><span className="status">{selected.status}</span><p><strong>{selected.locationLabel}</strong><br />Ubicación y caso completamente ficticios.</p><div className="score-box"><span>Regla transparente</span><strong>{selectedRule.score ?? "REVIEW REQUIRED"}</strong><small>Rango #{selectedRule.ruleRank}; base #{selected.sheetRow}</small></div><div className="score-box ml-score"><span>ML EXPERIMENTAL</span><strong>{selectedMl.probability === null ? "ML UNAVAILABLE" : `${(selectedMl.probability * 100).toFixed(1)}%`}</strong><small>Señal sintética para inspección; no una probabilidad de reparación o fuga verificada.</small></div><h4>Componentes</h4><ul className="components-list"><li>Señal: {selectedRule.components.sensor ?? "sin evidencia"}/40</li><li>Vulnerabilidad: {selectedRule.components.vulnerability}/25</li><li>Interrupción: {selectedRule.components.interruption}/20</li><li>Factibilidad: {selectedRule.components.feasibility}/15</li></ul><h4>Lecturas · SIMULATED</h4><div className="reading-list">{readings.map((reading) => <div key={reading.timestamp}><span>{reading.timestamp.slice(11, 16)} UTC</span><strong>{reading.pressureBar ?? "—"} bar · {reading.flowLpm ?? "—"} L/min</strong><small>{reading.qualityFlag} · seed {reading.seed}</small></div>)}</div><h4>Cierre accionable</h4><p><strong>Responsable:</strong> {selected.ownerRole.replaceAll("_", " ")}<br /><strong>Siguiente:</strong> {selected.nextAction}<br /><strong>Resolución:</strong> {selected.resolutionRecord}</p><h4>Revisión humana ficticia</h4><label className="form-label">Rol calificado<select value={reviewRole} onChange={(event) => setReviewRole(event.target.value as ReviewerRole)}><option value="COORDINADOR_DE_TRIAGE">COORDINADOR_DE_TRIAGE</option><option value="INSPECTOR_CALIFICADO">INSPECTOR_CALIFICADO</option><option value="SUPERVISOR_DE_REPARACION">SUPERVISOR_DE_REPARACION</option><option value="REVISOR_INDEPENDIENTE">REVISOR_INDEPENDIENTE</option></select></label><label className="form-label">Prioridad humana (1–8)<input type="number" min="1" max="8" value={overridePriority} onChange={(event) => setOverridePriority(Number(event.target.value))} /></label><label className="form-label">Razón del override (10–300)<textarea maxLength={300} value={rationale} onChange={(event) => setRationale(event.target.value)} /></label><button type="button" className="action secondary" onClick={submitOverride}>Registrar override</button>{nextStatus && <><p className="transition-note">Siguiente transición permitida: <strong>{nextStatus}</strong><br />Rol requerido: {getRequiredRole(selected.status)}</p><label className="form-label">Evidencia humana requerida (10–300)<textarea maxLength={300} value={evidence} onChange={(event) => setEvidence(event.target.value)} /></label></>}<label className="confirm-label"><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} /> Confirmo que ésta es una decisión humana ficticia y revisada.</label>{nextStatus && <button type="button" className="action" onClick={submitTransition}>Registrar transición humana</button>}<button type="button" className="reset-button" onClick={resetDemo}>Restablecer demo</button>{formMessage && <p className="form-message" role="status">{formMessage}</p>}<h4>Historial preservado</h4><ol className="history-list">{[...selected.reviewHistory].reverse().map((event) => <li key={event.id}><strong>{event.action}</strong> · {event.role}{event.priority ? ` · prioridad ${event.priority}` : ""}<br />{event.rationale}</li>)}{selected.reviewHistory.length === 0 && <li>Sin decisiones humanas registradas en esta sesión.</li>}</ol><p className="audit-warning">Historia sólo para demo local; no es una base de auditoría municipal durable.</p></aside>
      </div><p className="footer-note">Proyecto académico · Sin datos personales · Sin despacho, diagnóstico, excavación o verificación autónoma</p>
    </div>
  </main>;
}

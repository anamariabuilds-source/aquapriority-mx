"use client";

import { useMemo, useState } from "react";
import { INCIDENTS } from "@/data/incidents";
import { rankByRules } from "@/lib/rules";
import { simulateReadings } from "@/lib/simulator";
import type { ScenarioId } from "@/types/domain";

type Mode = "BASELINE" | "RULES" | "ML";
const levelLabel = { HIGH: "Alta", MEDIUM: "Media", LOW: "Baja" } as const;
const scenarioLabel: Record<ScenarioId, string> = { STABLE: "Lecturas estables", POSSIBLE_ANOMALY: "Posible anomalía", INCOMPLETE_UNRELIABLE: "Lecturas incompletas o no confiables" };

export function Dashboard() {
  const [mode, setMode] = useState<Mode>("BASELINE");
  const [scenario, setScenario] = useState<ScenarioId>("POSSIBLE_ANOMALY");
  const [selectedId, setSelectedId] = useState(INCIDENTS[0].id);
  const rules = useMemo(() => rankByRules(INCIDENTS, scenario), [scenario]);
  const ruleById = useMemo(() => new Map(rules.map((item) => [item.incidentId, item])), [rules]);
  const ordered = mode === "RULES" ? rules.map((item) => INCIDENTS.find((incident) => incident.id === item.incidentId)!) : [...INCIDENTS];
  const selected = INCIDENTS.find((incident) => incident.id === selectedId)!;
  const selectedRule = ruleById.get(selectedId)!;
  const readings = simulateReadings(selected, scenario);

  return <main className="app-shell">
    <header className="topbar"><div className="brand"><div className="drop" aria-hidden="true" /><div><h1>AquaPriority MX</h1><p>Priorización con revisión humana</p></div></div><div className="demo-banner" role="note">DEMO · DATOS SINTÉTICOS · NO OPERATIVO</div><div className="role-chip">Rol ficticio<br /><strong>Coordinación de triage</strong></div></header>
    <div className="content">
      <section className="hero"><div><p className="eyebrow">Vacío aprobado · Visibilidad de pérdidas</p><h2>¿Qué incidente se revisa primero?</h2><p className="hero-copy">La comparación obligatoria usa los mismos ocho casos: fila de hoja básica frente a reglas transparentes. ML permanece separado y experimental.</p></div><aside className="truth-note"><strong>Límite de evidencia:</strong> una alerta no prueba una fuga. Una reparación registrada no demuestra reducción de pérdidas.</aside></section>
      <section className="dragon-grid" aria-label="Tecnologías del prototipo"><article className="dragon-card iot"><strong>IoT · Señales simuladas</strong><span>Presión y flujo reproducibles, con fuente, calidad, fecha, escenario y semilla.</span></article><article className="dragon-card ml"><strong>ML · Experimental</strong><span>{mode === "ML" ? "ML UNAVAILABLE — artefacto aún no conectado." : "Modelo entrenado sólo con datos sintéticos; nunca decide acciones."}</span></article><article className="dragon-card geo"><strong>GEO · Ubicaciones ficticias</strong><span>Contexto agregado inventado; no representa cobertura ni reportes reales.</span></article></section>
      <div className="dashboard-grid">
        <section className="panel">
          <div className="controls"><div className="tabs" role="tablist" aria-label="Método de comparación">
            <button type="button" role="tab" aria-selected={mode === "BASELINE"} onClick={() => setMode("BASELINE")}>1 · Hoja básica</button>
            <button type="button" role="tab" aria-selected={mode === "RULES"} onClick={() => setMode("RULES")}>2 · Reglas transparentes</button>
            <button type="button" role="tab" aria-selected={mode === "ML"} onClick={() => setMode("ML")}>3 · ML experimental</button>
          </div><label className="scenario-control">Escenario IoT simulado<select value={scenario} onChange={(event) => setScenario(event.target.value as ScenarioId)}>{Object.entries(scenarioLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></div>
          <div className="panel-head"><h3>{mode === "BASELINE" ? "Hoja básica · sheetRow ascendente" : mode === "RULES" ? "Reglas transparentes · 0–100" : "ML EXPERIMENTAL"}</h3><p>{mode === "ML" ? "ML UNAVAILABLE — nunca se sustituyen predicciones con reglas." : "Toda prioridad es una propuesta sujeta a revisión humana calificada."}</p></div>
          <div className="table-wrap"><table><thead><tr><th>{mode === "RULES" ? "Rango regla" : "Fila"}</th><th>Incidente</th><th>Zona ficticia</th><th>Estado exacto</th><th>{mode === "RULES" ? "Puntaje / diferencia" : "Vulnerabilidad"}</th><th>Evidencia / explicación</th></tr></thead><tbody>{ordered.map((incident) => {
            const rule = ruleById.get(incident.id)!; return <tr key={incident.id} className={incident.id === selectedId ? "selected-row" : ""}><td>{mode === "RULES" ? rule.ruleRank : incident.sheetRow}</td><td><button className="id-button" type="button" onClick={() => setSelectedId(incident.id)} aria-pressed={incident.id === selectedId}>{incident.id}</button><br /><small>Base #{incident.sheetRow}</small></td><td>{incident.zoneName}<br /><small>{incident.locationLabel}</small></td><td><span className="status">{incident.status}</span></td><td>{mode === "RULES" ? <>{rule.score ?? "REVIEW REQUIRED"}<br /><small>Cambio: {rule.rankDifference > 0 ? "+" : ""}{rule.rankDifference}</small></> : <><span className={`pill ${incident.vulnerability.toLowerCase()}`}>{levelLabel[incident.vulnerability]}</span><br /><small>{incident.vulnerabilityRationale}</small></>}</td><td>{mode === "RULES" ? rule.explanation : <>Reportado {new Date(incident.reportTimestamp).toLocaleString("es-MX", { timeZone: "UTC" })} UTC<br /><small>{incident.nextAction}</small></>}</td></tr>;
          })}</tbody></table></div>
        </section>
        <aside className="detail-panel" aria-live="polite"><p className="eyebrow">Incidente seleccionado</p><h3>{selected.id}</h3><span className="status">{selected.status}</span><p><strong>{selected.locationLabel}</strong><br />Ubicación y caso completamente ficticios.</p><div className="score-box"><span>Regla transparente</span><strong>{selectedRule.score ?? "REVIEW REQUIRED"}</strong><small>Rango #{selectedRule.ruleRank}; base #{selected.sheetRow}</small></div><h4>Componentes</h4><ul className="components-list"><li>Señal: {selectedRule.components.sensor ?? "sin evidencia"}/40</li><li>Vulnerabilidad: {selectedRule.components.vulnerability}/25</li><li>Interrupción: {selectedRule.components.interruption}/20</li><li>Factibilidad: {selectedRule.components.feasibility}/15</li></ul><h4>Lecturas · SIMULATED</h4><div className="reading-list">{readings.map((reading) => <div key={reading.timestamp}><span>{reading.timestamp.slice(11, 16)} UTC</span><strong>{reading.pressureBar ?? "—"} bar · {reading.flowLpm ?? "—"} L/min</strong><small>{reading.qualityFlag} · seed {reading.seed}</small></div>)}</div><h4>Cierre accionable</h4><p><strong>Responsable:</strong> {selected.ownerRole.replaceAll("_", " ")}<br /><strong>Siguiente:</strong> {selected.nextAction}<br /><strong>Resolución:</strong> {selected.resolutionRecord}</p><p className="audit-warning">Historia sólo para demo local; no es una base de auditoría municipal durable.</p></aside>
      </div><p className="footer-note">Proyecto académico · Sin datos personales · Sin despacho, diagnóstico, excavación o verificación autónoma</p>
    </div>
  </main>;
}

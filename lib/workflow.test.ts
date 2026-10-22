import { describe, expect, it } from "vitest";
import { INCIDENTS } from "@/data/incidents";
import { appendPriorityOverride, transitionStatus } from "@/lib/workflow";

const timestamp = "2026-10-22T18:00:00.000Z";

describe("human-authority workflow", () => {
  it("requires role, bounded rationale, integer priority and confirmation for overrides", () => {
    expect(appendPriorityOverride(INCIDENTS[0], { role: "COORDINADOR_DE_TRIAGE", rationale: "corto", priority: 1, confirmed: true, timestamp }).error).toContain("10");
    expect(appendPriorityOverride(INCIDENTS[0], { role: "COORDINADOR_DE_TRIAGE", rationale: "Evidencia revisada por coordinación.", priority: 9, confirmed: true, timestamp }).error).toContain("1 a 8");
    expect(appendPriorityOverride(INCIDENTS[0], { role: "COORDINADOR_DE_TRIAGE", rationale: "Evidencia revisada por coordinación.", priority: 1, confirmed: false, timestamp }).error).toContain("confirmación");
    const accepted = appendPriorityOverride(INCIDENTS[0], { role: "COORDINADOR_DE_TRIAGE", rationale: "Evidencia revisada por coordinación.", priority: 1, confirmed: true, timestamp });
    expect(accepted.incident?.reviewHistory.at(-1)?.priority).toBe(1);
    expect(INCIDENTS[0].reviewHistory).toHaveLength(0);
  });

  it("rejects status jumps and wrong human roles", () => {
    const wrongRole = transitionStatus(INCIDENTS[0], { role: "COORDINADOR_DE_TRIAGE", evidence: "Inspección ficticia documentada claramente.", confirmed: true, timestamp });
    expect(wrongRole.incident).toBeNull();
    expect(wrongRole.error).toContain("INSPECTOR_CALIFICADO");
    const terminal = transitionStatus(INCIDENTS[4], { role: "REVISOR_INDEPENDIENTE", evidence: "Evidencia posterior ficticia ya registrada.", confirmed: true, timestamp });
    expect(terminal.incident).toBeNull();
  });

  it("allows only the next state with required evidence and preserves history", () => {
    const result = transitionStatus(INCIDENTS[0], { role: "INSPECTOR_CALIFICADO", evidence: "Inspección física ficticia completada y documentada.", confirmed: true, timestamp });
    expect(result.error).toBeNull();
    expect(result.incident?.status).toBe("PHYSICALLY_CONFIRMED");
    expect(result.incident?.evidenceHistory).toHaveLength(INCIDENTS[0].evidenceHistory.length + 1);
    expect(result.incident?.reviewHistory.at(-1)?.action).toBe("STATUS_TRANSITION");
  });
});

import { describe, expect, it } from "vitest";
import { INCIDENTS } from "@/data/incidents";
import { rankByRules, scoreIncident } from "@/lib/rules";

describe("transparent prioritization rules", () => {
  it("keeps every complete score within 0–100", () => {
    for (const result of rankByRules(INCIDENTS, "POSSIBLE_ANOMALY")) {
      expect(result.score).not.toBeNull();
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    }
  });
  it("abstains when essential sensor evidence is missing", () => {
    const result = scoreIncident(INCIDENTS[0], "INCOMPLETE_UNRELIABLE");
    expect(result.score).toBeNull();
    expect(result.requiresReview).toBe(true);
    expect(result.explanation).toContain("REVIEW REQUIRED");
  });
  it("uses frozen component values and stable sheet-row ordering for equal cases", () => {
    const result = scoreIncident(INCIDENTS[0], "STABLE");
    expect(result.components.vulnerability).toBe(25);
    expect(result.components.interruption).toBe(20);
    expect(result.components.feasibility).toBe(10);
    const equal = [{ ...INCIDENTS[1], id: "INC-FX-2002", sheetRow: 2 }, { ...INCIDENTS[1], id: "INC-FX-2001", sheetRow: 1 }];
    expect(rankByRules(equal, "STABLE").map((item) => item.incidentId)).toEqual(["INC-FX-2001", "INC-FX-2002"]);
  });
  it("does not include income or payment fields", () => {
    const keys = new Set(INCIDENTS.flatMap((incident) => Object.keys(incident).map((key) => key.toLowerCase())));
    expect([...keys]).not.toEqual(expect.arrayContaining(["income", "ingreso", "payment", "pago", "household", "hogar"]));
  });
});

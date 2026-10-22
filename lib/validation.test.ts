import { describe, expect, it } from "vitest";
import { INCIDENTS } from "@/data/incidents";
import { validateIncident, validateSensorReading } from "@/lib/validation";

describe("canonical fictional data", () => {
  it("contains eight unique, valid incidents in immutable sheet order", () => {
    expect(INCIDENTS).toHaveLength(8);
    expect(new Set(INCIDENTS.map((item) => item.id)).size).toBe(8);
    expect(INCIDENTS.map((item) => item.sheetRow)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(INCIDENTS.flatMap(validateIncident)).toEqual([]);
  });

  it("rejects real-location provenance", () => {
    const invalid = { ...INCIDENTS[0], locationSource: "REAL" as never };
    expect(validateIncident(invalid)).toContain("location must be fictional");
  });
});

describe("sensor validation", () => {
  const valid = { sensorId: "SIM-PF-1", timestamp: "2026-10-22T12:00:00.000Z", pressureBar: 4.2, flowLpm: 140, qualityFlag: "GOOD" as const, source: "SIMULATED" as const, scenarioId: "STABLE" as const, seed: 7 };
  it("accepts complete simulated readings", () => expect(validateSensorReading(valid)).toEqual([]));
  it("rejects missing and out-of-bound readings", () => {
    expect(validateSensorReading({ ...valid, pressureBar: null })).toContain("missing pressure");
    expect(validateSensorReading({ ...valid, flowLpm: 501 })).toContain("flow outside prototype bounds");
  });
});

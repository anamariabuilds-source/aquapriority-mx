import { describe, expect, it } from "vitest";
import { INCIDENTS } from "@/data/incidents";
import { extractSensorFeatures, simulateReadings } from "@/lib/simulator";

describe("deterministic simulated sensing", () => {
  it("reproduces readings for the same seed and scenario", () => {
    expect(simulateReadings(INCIDENTS[0], "STABLE")).toEqual(simulateReadings(INCIDENTS[0], "STABLE"));
  });
  it("changes evidence features when the scenario changes", () => {
    const stable = extractSensorFeatures(INCIDENTS[0], simulateReadings(INCIDENTS[0], "STABLE"));
    const anomaly = extractSensorFeatures(INCIDENTS[0], simulateReadings(INCIDENTS[0], "POSSIBLE_ANOMALY"));
    expect(anomaly.sensorAnomaly).toBeGreaterThan(stable.sensorAnomaly ?? 0);
  });
  it("marks incomplete evidence invalid instead of inventing confidence", () => {
    const features = extractSensorFeatures(INCIDENTS[0], simulateReadings(INCIDENTS[0], "INCOMPLETE_UNRELIABLE"));
    expect(features.evidenceQuality).toBe("INVALID_OR_INCOMPLETE");
    expect(features.sensorAnomaly).toBeNull();
    expect(features.missingEvidence.length).toBeGreaterThan(0);
  });
});

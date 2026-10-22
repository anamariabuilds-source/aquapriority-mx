import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import fixtures from "@/public/model/golden_fixtures.json";
import { getMlArtifact, predictInspectionSignal, validateMlArtifact, type MlFeatures } from "@/lib/ml";

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => `${JSON.stringify(key)}:${canonicalJson(item)}`).join(",")}}`;
  return JSON.stringify(value);
}

describe("trained synthetic ML artifact", () => {
  it("is structurally valid and has a verified checksum", () => {
    const artifact = getMlArtifact();
    expect(validateMlArtifact(artifact)).toEqual([]);
    const { artifact_checksum_sha256, ...payload } = artifact;
    const checksum = createHash("sha256").update(canonicalJson(payload)).digest("hex");
    expect(checksum).toBe(artifact_checksum_sha256);
  });

  it("reports a disjoint holdout and all required measured metrics", () => {
    const metrics = getMlArtifact().metrics;
    expect(metrics.group_overlap_count).toBe(0);
    expect(metrics.holdout_size).toBeGreaterThan(0);
    expect(metrics.confusion_matrix).toHaveLength(2);
    for (const name of ["precision", "recall", "f1", "roc_auc", "brier_score"] as const) expect(Number.isFinite(metrics[name])).toBe(true);
  });

  it("matches Python golden predictions within 1e-6", () => {
    for (const fixture of fixtures) {
      const actual = predictInspectionSignal(fixture.features as MlFeatures);
      expect(actual).not.toBeNull();
      expect(Math.abs((actual ?? 0) - fixture.expected_probability)).toBeLessThanOrEqual(1e-6);
    }
  });

  it("fails closed for corrupt artifacts and non-finite inputs", () => {
    const artifact = getMlArtifact();
    expect(predictInspectionSignal(fixtures[0].features as MlFeatures, { ...artifact, feature_names: ["wrong"] })).toBeNull();
    expect(predictInspectionSignal({ ...fixtures[0].features, flow_rise: Number.NaN } as MlFeatures)).toBeNull();
  });
});

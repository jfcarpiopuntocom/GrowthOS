import { describe, expect, it } from "vitest";
import { calculateSSS, normalizeMetric, WEIGHTS } from "../src/score.js";

describe("SSS v0.2.0", () => {
  it("weights sum to 100", () => {
    expect(Object.values(WEIGHTS).reduce((a,b)=>a+b,0)).toBe(100);
  });

  it("normalization anchors are exact", () => {
    expect(normalizeMetric("runwayMonths", 18)).toBe(100);
    expect(normalizeMetric("runwayMonths", 9)).toBe(50);
    expect(normalizeMetric("runwayMonths", 0)).toBe(0);
    expect(normalizeMetric("cacPaybackMonths", 0)).toBe(100);
    expect(normalizeMetric("cacPaybackMonths", 12)).toBe(50);
    expect(normalizeMetric("cacPaybackMonths", 24)).toBe(0);
    expect(normalizeMetric("burnMultiple", 1)).toBe(100);
    expect(normalizeMetric("burnMultiple", 2.5)).toBe(50);
    expect(normalizeMetric("burnMultiple", 4)).toBe(0);
    expect(normalizeMetric("grossMarginPct", 80)).toBe(100);
    expect(normalizeMetric("grossMarginPct", 40)).toBe(50);
    expect(normalizeMetric("workingCapitalRatio", 2)).toBe(100);
    expect(normalizeMetric("workingCapitalRatio", 1)).toBe(40);
    expect(normalizeMetric("customerConcentrationPct", 0)).toBe(100);
    expect(normalizeMetric("customerConcentrationPct", 30)).toBe(70);
    expect(normalizeMetric("debtToCashflowVelocity", 2)).toBe(100);
    expect(normalizeMetric("debtToCashflowVelocity", 1)).toBe(50);
    expect(normalizeMetric("capitalEfficiencyIndex", 2)).toBe(100);
    expect(normalizeMetric("capitalEfficiencyIndex", 1)).toBe(50);
  });

  it("verified healthy fixture scores 96 green", () => {
    const r = calculateSSS({
      runwayMonths:18, cacPaybackMonths:2, burnMultiple:1, grossMarginPct:75,
      workingCapitalRatio:2, customerConcentrationPct:10,
      debtToCashflowVelocity:2, capitalEfficiencyIndex:1.8
    });
    expect(r.score).toBe(96);
    expect(r.risk).toBe("green");
  });

  it("verified crisis fixture scores 25 red", () => {
    const r = calculateSSS({
      runwayMonths:2, cacPaybackMonths:18, burnMultiple:3, grossMarginPct:20,
      workingCapitalRatio:0.5, customerConcentrationPct:60,
      debtToCashflowVelocity:0.5, capitalEfficiencyIndex:0.5
    });
    expect(r.score).toBe(25);
    expect(r.risk).toBe("red");
  });

  it("action plan contains at most 3 weakest metrics under 60", () => {
    const r = calculateSSS({
      runwayMonths:2, cacPaybackMonths:18, burnMultiple:3, grossMarginPct:20,
      workingCapitalRatio:0.5, customerConcentrationPct:60,
      debtToCashflowVelocity:0.5, capitalEfficiencyIndex:0.5
    });
    expect(r.actionPlan.length).toBeLessThanOrEqual(3);
    expect(r.actionPlan.every(m => m.subScore < 60)).toBe(true);
    expect(r.actionPlan[0].subScore).toBeLessThanOrEqual(r.actionPlan[1].subScore);
  });
});

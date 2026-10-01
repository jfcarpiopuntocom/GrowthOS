export type SSSInput = {
  runwayMonths: number;
  cacPaybackMonths: number;
  burnMultiple: number;
  grossMarginPct: number;
  workingCapitalRatio: number;
  customerConcentrationPct: number;
  debtToCashflowVelocity: number;
  capitalEfficiencyIndex: number;
};

export type MetricKey = keyof SSSInput;

export type MetricResult = {
  key: MetricKey;
  label: string;
  value: number;
  weight: number;
  subScore: number;
  severity: "high" | "medium" | "ok";
};

export type SSSResult = {
  score: number;
  risk: "green" | "yellow" | "red";
  metrics: MetricResult[];
  actionPlan: MetricResult[];
};

const clamp = (n:number, lo=0, hi=100) => Math.min(hi, Math.max(lo, n));

export const WEIGHTS: Record<MetricKey, number> = {
  runwayMonths: 15,
  cacPaybackMonths: 10,
  burnMultiple: 15,
  grossMarginPct: 12,
  workingCapitalRatio: 12,
  customerConcentrationPct: 10,
  debtToCashflowVelocity: 13,
  capitalEfficiencyIndex: 13
};

export const LABELS: Record<MetricKey, string> = {
  runwayMonths: "Runway real de caja",
  cacPaybackMonths: "CAC Payback Period",
  burnMultiple: "Burn Rate Ajustado / Burn Multiple",
  grossMarginPct: "Gross Margin Health",
  workingCapitalRatio: "Working Capital Ratio",
  customerConcentrationPct: "Customer Concentration Risk",
  debtToCashflowVelocity: "Debt-to-Cashflow Velocity",
  capitalEfficiencyIndex: "Capital Efficiency Index"
};

// Piecewise-linear, deterministic, auditable normalization.
// Anchors come directly from the SSS specification.
export function normalizeMetric(key: MetricKey, raw: number): number {
  const v = Number.isFinite(raw) ? raw : 0;
  switch (key) {
    case "runwayMonths":
      return clamp(v >= 18 ? 100 : (v / 18) * 100);
    case "cacPaybackMonths":
      return clamp(v <= 0 ? 100 : v >= 24 ? 0 : 100 - (v / 24) * 100);
    case "burnMultiple":
      return clamp(v <= 1 ? 100 : v >= 4 ? 0 : 100 - ((v - 1) / 3) * 100);
    case "grossMarginPct":
      return clamp(v >= 80 ? 100 : (v / 80) * 100);
    case "workingCapitalRatio":
      if (v <= 0) return 0;
      if (v >= 2) return 100;
      return v <= 1 ? v * 40 : 40 + (v - 1) * 60;
    case "customerConcentrationPct":
      return clamp(100 - v);
    case "debtToCashflowVelocity":
    case "capitalEfficiencyIndex":
      return clamp(v * 50);
  }
}

function severity(subScore:number): MetricResult["severity"] {
  if (subScore < 40) return "high";
  if (subScore < 60) return "medium";
  return "ok";
}

export function calculateSSS(input: SSSInput): SSSResult {
  const keys = Object.keys(WEIGHTS) as MetricKey[];
  const metrics = keys.map((key) => {
    const subScore = normalizeMetric(key, input[key]);
    return {
      key,
      label: LABELS[key],
      value: input[key],
      weight: WEIGHTS[key],
      subScore: Number(subScore.toFixed(2)),
      severity: severity(subScore)
    };
  });

  const weighted = metrics.reduce((sum, m) => sum + m.subScore * m.weight, 0) / 100;
  const score = Math.round(clamp(weighted));
  const risk = score >= 70 ? "green" : score >= 40 ? "yellow" : "red";

  const actionPlan = metrics
    .filter((m) => m.subScore < 60)
    .sort((a,b) => a.subScore - b.subScore || b.weight - a.weight)
    .slice(0,3);

  return { score, risk, metrics, actionPlan };
}

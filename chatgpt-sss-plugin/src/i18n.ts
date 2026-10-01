import type { MetricKey, MetricResult, SSSResult } from "./score.js";

export type Locale = "en" | "es" | "pt";

export const metricLabels: Record<Locale, Record<MetricKey,string>> = {
  en: {
    runwayMonths:"Real Cash Runway",
    cacPaybackMonths:"CAC Payback Period",
    burnMultiple:"Adjusted Burn / Burn Multiple",
    grossMarginPct:"Gross Margin Health",
    workingCapitalRatio:"Working Capital Ratio",
    customerConcentrationPct:"Customer Concentration Risk",
    debtToCashflowVelocity:"Debt-to-Cashflow Velocity",
    capitalEfficiencyIndex:"Capital Efficiency Index"
  },
  es: {
    runwayMonths:"Runway real de caja",
    cacPaybackMonths:"Período de recuperación del CAC",
    burnMultiple:"Burn ajustado / Burn Multiple",
    grossMarginPct:"Salud del margen bruto",
    workingCapitalRatio:"Ratio de capital de trabajo",
    customerConcentrationPct:"Riesgo de concentración de clientes",
    debtToCashflowVelocity:"Velocidad deuda / flujo de caja",
    capitalEfficiencyIndex:"Índice de eficiencia de capital"
  },
  pt: {
    runwayMonths:"Runway real de caixa",
    cacPaybackMonths:"Período de recuperação do CAC",
    burnMultiple:"Burn ajustado / Burn Multiple",
    grossMarginPct:"Saúde da margem bruta",
    workingCapitalRatio:"Rácio de fundo de maneio",
    customerConcentrationPct:"Risco de concentração de clientes",
    debtToCashflowVelocity:"Velocidade dívida / fluxo de caixa",
    capitalEfficiencyIndex:"Índice de eficiência de capital"
  }
};

export const copy = {
  en:{
    risk:{green:"Low risk",yellow:"Moderate risk",red:"Critical"},
    privacy:"Uses only 8 aggregate numbers. No bank login. No transaction data. No document upload. No persistent storage.",
    open:"Open-source scoring logic — inspect every weight and normalization rule.",
    action:"Priority action plan",
    tagline:"Eight numbers. One survival score. No financial-data plumbing."
  },
  es:{
    risk:{green:"Riesgo bajo",yellow:"Riesgo moderado",red:"Crítico"},
    privacy:"Usa solo 8 cifras agregadas. Sin acceso bancario. Sin transacciones. Sin documentos. Sin almacenamiento persistente.",
    open:"Lógica de scoring abierta — puedes auditar cada peso y regla de normalización.",
    action:"Plan de acción prioritario",
    tagline:"Ocho cifras. Un score de supervivencia. Sin conectar tus finanzas."
  },
  pt:{
    risk:{green:"Baixo risco",yellow:"Risco moderado",red:"Crítico"},
    privacy:"Utiliza apenas 8 números agregados. Sem acesso bancário. Sem transações. Sem documentos. Sem armazenamento persistente.",
    open:"Lógica de scoring aberta — pode auditar cada peso e regra de normalização.",
    action:"Plano de ação prioritário",
    tagline:"Oito números. Um score de sobrevivência. Sem ligar as suas finanças."
  }
} as const;

export function localizeResult(result:SSSResult, locale:Locale){
  const metrics=result.metrics.map(m=>({...m,label:metricLabels[locale][m.key]}));
  const byKey=new Map(metrics.map(m=>[m.key,m]));
  const actionPlan=result.actionPlan.map(m=>byKey.get(m.key) as MetricResult);
  return {...result,metrics,actionPlan,locale,privacy:copy[locale].privacy,openSource:copy[locale].open,riskLabel:copy[locale].risk[result.risk]};
}

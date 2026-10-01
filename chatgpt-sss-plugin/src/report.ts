import type { SSSInput, SSSResult } from "./score.js";

const esc=(v:unknown)=>String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]!));

export function executiveReport(input:SSSInput,result:SSSResult){
  const color=result.risk==="green"?"#066B40":result.risk==="yellow"?"#A06800":"#AA1A1A";
  const rows=result.metrics.map(m=>`<tr><td>${esc(m.label)}</td><td>${esc(m.value)}</td><td>${m.weight}%</td><td><strong>${m.subScore}</strong></td><td>${m.severity}</td></tr>`).join("");
  const actions=result.actionPlan.length
    ? result.actionPlan.map((m,i)=>`<li><strong>${i+1}. ${esc(m.label)}</strong> — sub-score ${m.subScore}/100 (${m.severity}). Priorizar corrección antes de nuevas iniciativas.</li>`).join("")
    : "<li>No hay métricas con sub-score inferior a 60.</li>";
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Startup Survival Score — Reporte</title><style>
  body{font-family:Arial,sans-serif;max-width:900px;margin:40px auto;color:#0A1929;line-height:1.5;padding:0 20px}
  h1{margin-bottom:4px}.score{font-size:72px;font-weight:800;color:${color};line-height:1}.risk{text-transform:uppercase;font-weight:700;color:${color}}
  table{width:100%;border-collapse:collapse;margin-top:24px}th,td{padding:9px;border-bottom:1px solid #d9e1ec;text-align:left}th{background:#0A1929;color:white}
  .box{border-left:4px solid ${color};background:#f0f4fa;padding:16px;margin:22px 0}@media print{body{margin:0}.noprint{display:none}}
  </style></head><body><h1>Startup Survival Score</h1><div class="score">${result.score}</div><div class="risk">${result.risk}</div>
  <div class="box"><strong>Lectura:</strong> ${result.risk==="green"?"bajo riesgo; salud financiera sólida.":result.risk==="yellow"?"riesgo moderado; vigilar y corregir.":"crítico; acción inmediata requerida."}</div>
  <h2>Desglose auditable</h2><table><thead><tr><th>Métrica</th><th>Input</th><th>Peso</th><th>Sub-score</th><th>Severidad</th></tr></thead><tbody>${rows}</tbody></table>
  <h2>Top prioridades</h2><ol>${actions}</ol><p><small>Growth OS · Startup Survival Score v0.2.0 · J.F. Carpio</small></p>
  <button class="noprint" onclick="window.print()">Imprimir / Guardar PDF</button></body></html>`;
}

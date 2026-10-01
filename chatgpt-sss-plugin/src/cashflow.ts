export type CashflowInput = {
  openingCash:number;
  monthlyRevenue:number;
  monthlyCosts:number;
  revenueGrowthPct?:number;
  costGrowthPct?:number;
};

export type Scenario = "base"|"stress"|"crash";

const factors:Record<Scenario,{rev:number;cost:number}> = {
  base:{rev:1,cost:1},
  stress:{rev:0.85,cost:1.08},
  crash:{rev:0.60,cost:1.18}
};

export function simulate24(input:CashflowInput, scenario:Scenario){
  const f=factors[scenario];
  let cash=input.openingCash;
  let revenue=input.monthlyRevenue*f.rev;
  let costs=input.monthlyCosts*f.cost;
  const rows=[];
  for(let month=1; month<=24; month++){
    cash += revenue-costs;
    rows.push({month,revenue:Number(revenue.toFixed(2)),costs:Number(costs.toFixed(2)),cash:Number(cash.toFixed(2))});
    revenue *= 1 + ((input.revenueGrowthPct ?? 0)/100);
    costs *= 1 + ((input.costGrowthPct ?? 0)/100);
  }
  return {scenario, rows, runwayMonth: rows.find(r=>r.cash<0)?.month ?? null};
}

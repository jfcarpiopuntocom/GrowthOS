# Startup Survival Score — ChatGPT Plugin

This directory is intentionally isolated from the existing Growth OS web app.

## Runtime

- MCP: `/mcp` (Streamable HTTP)
- Health: `/health`
- Free HTTP: `POST /api/calculate`
- Pro HTTP: `/api/analyze`, `/api/simulate`, `/api/report`
- Free MCP tool: `calculate_sss`
- Pro MCP tools: `analyze_sss`, `simulate_cashflow`, `generate_report`

## SSS v0.2.0

8 deterministic sub-scores, normalized to 0–100 and weighted to 100 total.

| Metric | Weight |
|---|---:|
| Runway real | 15 |
| CAC Payback | 10 |
| Burn Multiple | 15 |
| Gross Margin | 12 |
| Working Capital Ratio | 12 |
| Customer Concentration | 10 |
| Debt-to-Cashflow Velocity | 13 |
| Capital Efficiency Index | 13 |

Risk: green >=70; yellow 40–69; red <40. Action plan = 3 weakest metrics whose sub-score is <60.

Verified fixtures:
- Healthy = 96 / green
- Crisis = 25 / red

## Local

```bash
cp .env.example .env
npm install
npm test
npm start
```

Then connect ChatGPT developer mode to `https://YOUR_HOST/mcp`.

## Deploy

Render blueprint is included. Set `SSS_LICENSE_SECRET` in the host. Replace the placeholder server URL in `openapi/sss.yaml` after deployment.

## Important

The current OpenAI plugin flow connects directly to the public MCP `/mcp` URL. `manifest/plugin.json` is project/package metadata for this repository; it is not assumed to replace the current ChatGPT developer-mode connection flow.


## Trust proposition

SSS is built around a minimum-data model:

- 8 aggregate business numbers only
- no bank connection required
- no accounting integration required
- no Drive or Notion connection required
- no transaction-level data
- no client or employee names
- no uploaded financial documents
- no persistent scoring database in the application
- open-source score engine
- deterministic formula: same input = same output

See [PRIVACY.md](./PRIVACY.md).

## Languages

- English (global reference)
- Spanish
- Portuguese (Portugal / neutral international business Portuguese)

## Product guarantee

The commercial guarantee is about **method, transparency and product delivery**, never about a company's future survival.

We can promise:
1. the published scoring formula is auditable;
2. the same valid input produces the same score;
3. SSS itself does not require bank/accounting connections or document uploads;
4. calculation inputs are not intentionally persisted by the SSS application;
5. Pro buyers receive the Pro capabilities described at purchase.

We do **not** promise that a given score predicts bankruptcy, investment returns, funding success or business survival.

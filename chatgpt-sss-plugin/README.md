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

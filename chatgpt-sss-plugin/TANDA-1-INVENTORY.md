# Tanda 1 — Tool & Submission Inventory

Date: 2026-10-01

## Canonical repo location

Repository: `jfcarpiopuntocom/GrowthOS`
Branch: `chatgpt-sss-v0.2.0`
Folder: `chatgpt-sss-plugin/`

This is the active SSS prototype. Do not confuse it with the older standalone GrowthOS Visor Antiquiebra HTML.

## Current public tool inventory

| Tool | Core purpose | Auth today | Sensitive input issue | Safety annotations |
|---|---|---|---|---|
| `calculate_sss` | deterministic survival score | no auth | none | readOnly=true, destructive=false, openWorld=false |
| `analyze_sss` | deeper interpretation | licenseKey argument | BLOCKER | readOnly=true, destructive=false, openWorld=false |
| `simulate_cashflow` | 24-month scenario model | licenseKey argument | BLOCKER | readOnly=true, destructive=false, openWorld=false |
| `generate_report` | executive HTML report | licenseKey argument | BLOCKER | readOnly=true, destructive=false, openWorld=false |

## HTTP inventory

- `GET /health`: public.
- `POST /api/calculate`: public.
- `POST /api/analyze`: x-sss-license or body licenseKey.
- `POST /api/simulate`: x-sss-license or body licenseKey.
- `POST /api/report`: x-sss-license or body licenseKey.

All license-based Pro HTTP routes are pre-production only and must be replaced before submission.

## OpenAI packaging finding

The old `manifest/plugin.json` is project metadata from an earlier implementation and is not the canonical current Agent Plugins package manifest.

Canonical package identity now lives at root:
- `plugin.json`

It follows:
`https://agent-plugins.org/schemas/1.0.0/plugin.schema.json`

Do not add a fake `mcp.json` with a placeholder host. Add the remote MCP declaration only after the real public HTTPS MCP endpoint exists.

## Submission blockers

1. Remove licenseKey from tool schemas and HTTP API.
2. Implement real OAuth 2.1 entitlement for paid-account tools, or omit those tools from the submitted MCP until complete.
3. Publish a real public HTTPS MCP endpoint.
4. Add the real MCP URL to package/submission configuration.
5. Publish privacy + terms/support URLs that match actual behavior.
6. Expand tests beyond scoring fixtures.
7. Run dependency/security audit and resolve high/critical findings.
8. Verify request bodies are not logged by app or hosting middleware.
9. Test Developer Mode against the real endpoint.
10. Run direct, indirect, edge, negative and unauthorized prompts.

## Hard stop

Do not call this plugin submission-ready until every blocker above is closed.

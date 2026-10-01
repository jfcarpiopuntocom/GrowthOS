# OpenAI Plugin Compliance Gate

**Status: NOT submission-ready until every blocker below is closed.**

This document is normative for this plugin.

## Hard rule

OpenAI's current plugin guidelines are product requirements. Re-check the official guidelines before every submission or material release.

Official references:
- https://developers.openai.com/plugins/plugin-guidelines
- https://developers.openai.com/plugins/guides/security-privacy
- https://developers.openai.com/plugins/build/auth
- https://developers.openai.com/plugins/guides/optimize-metadata
- https://developers.openai.com/plugins/deploy/submission

## Privacy architecture

The target architecture is financial-data statelessness:

- only the 8 aggregate SSS inputs are required for a calculation;
- no bank connections;
- no accounting connections;
- no transaction feeds;
- no document uploads;
- no customer or employee identity fields;
- no financial request-body logging;
- no server-side financial history by default;
- no behavioral profiling.

**We monetize entitlement, not data.**

## Current blocker: licenseKey tool input

The prototype currently accepts a `licenseKey` on Pro tools.

This MUST be removed before production submission.

Do not ask users to supply credentials, API keys, licence keys, passwords, PINs, MFA/OTP, or other authentication secrets as normal tool arguments.

Production target:
- Free tools: anonymous / noauth.
- Existing paid-account capabilities: OAuth 2.1 entitlement.
- Entitlement is resolved server-side from validated auth context.
- Financial inputs are never persisted to the account record.

## Commerce hard rule

For digital products/services under current OpenAI rules, the plugin must not:

- display pricing, subscriptions, discounts, or promotions;
- initiate digital checkout;
- directly link to transactional checkout;
- promote upgrades;
- degrade a feature specifically because it is being used through ChatGPT;
- serve ads.

An already-entitled user may sign in and use features included in their existing account.

If a feature is unavailable under the current entitlement, the plugin may explain that fact and may link to a non-transactional informational page, subject to current OpenAI rules.

## Tool contract hard rule

Every public tool must have:
- a focused purpose;
- minimal inputs;
- explicit safety annotations;
- clear failure behavior;
- no hidden side effects.

For the current SSS compute tools:
- readOnlyHint = true
- destructiveHint = false
- openWorldHint = false

## Discovery hard rule

Metadata may be optimized for legitimate relevant intent, including direct, indirect, and negative prompt testing.

Metadata must never:
- instruct the model to prefer SSS over other plugins;
- disparage alternatives;
- claim capabilities SSS does not have;
- trigger on an overly broad unrelated intent.

## Submission checklist

- [ ] Re-read current official OpenAI plugin rules.
- [ ] Remove licenseKey from all tool schemas and UI.
- [ ] Implement OAuth 2.1 for paid-account entitlement if Pro tools remain.
- [ ] Verify explicit annotations on every tool.
- [ ] Verify no raw financial input persistence.
- [ ] Verify request bodies are excluded/redacted from logs.
- [ ] Publish privacy policy with categories, purposes, recipients, retention, controls.
- [ ] Verify support contact.
- [ ] Verify EN / ES / PT.
- [ ] Test desktop and mobile.
- [ ] Test valid, invalid, negative, and unauthorized cases.
- [ ] Run dependency/security audit.
- [ ] Verify no pricing/promotion in plugin metadata/UI.
- [ ] Verify no digital checkout/upgrade flow in plugin.
- [ ] Submit only when all boxes are closed.

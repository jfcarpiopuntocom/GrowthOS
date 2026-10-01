# Startup Survival Score — Privacy Promise

## Minimum data by design

SSS needs only eight aggregate business metrics:

1. cash runway in months
2. CAC payback in months
3. burn multiple
4. gross margin percentage
5. working capital ratio
6. customer concentration percentage
7. debt-to-cashflow velocity
8. capital efficiency index

These are coarse business ratios or totals, not transaction-level records.

## SSS does not require

- bank logins or bank-account connections
- accounting platform connections
- Google Drive or Notion access
- customer or employee names
- invoices
- payment-card information
- tax IDs
- transaction histories
- uploaded financial documents

## Processing and storage

The SSS application is designed to be stateless. Calculation inputs are received transiently to perform the requested calculation and are not intentionally written by the application to a database, filesystem, analytics profile, or user account.

The application code does not intentionally log financial request bodies.

Infrastructure providers may retain operational metadata such as IP address, timestamp, route, status code, or security/error logs. Production hosting should use the shortest practical retention period and avoid body logging.

## Open-source auditability

The scoring engine is open source. Anyone can inspect:

- all 8 metric weights
- every normalization anchor
- all traffic-light thresholds
- the top-3 action-plan selection rule

Source:
https://github.com/jfcarpiopuntocom/GrowthOS/tree/chatgpt-sss-v0.2.0/chatgpt-sss-plugin

## ChatGPT boundary

When SSS is used through ChatGPT, the surrounding ChatGPT conversation and platform processing are governed separately by the user's relationship with OpenAI. SSS does not claim control over storage or processing performed by ChatGPT itself.

## Promise

**Minimum data in. Maximum diagnostic value out.**

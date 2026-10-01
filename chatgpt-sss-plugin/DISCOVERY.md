# Discovery strategy — Startup Survival Score

The target is **problem-intent discovery**, not name-only discovery.

## Core intents

- avoid business failure
- avoid early bankruptcy / closure
- cash crunch / runway pressure
- unsustainable growth
- financial growth pains
- readiness to scale
- startup survival
- early-warning financial diagnosis

## Metadata rule

Every model-visible tool description should:
1. begin with "Use this when...";
2. describe user outcomes in natural language;
3. include adjacent indirect intents;
4. explicitly exclude personal finance, investing, tax filing, and insolvency legal advice;
5. explain the minimum-data privacy model when relevant.

## Languages

EN / ES / PT (Portugal-neutral business Portuguese).

## Evaluation

Use `discovery/golden-prompts.json` as the selection-regression dataset. Expand toward:
- 30 direct prompts;
- 70 indirect prompts;
- 30 negative prompts;
across all three languages.

Track:
- correct plugin selection recall;
- false-positive activation rate;
- task completion;
- repeat use;
- user satisfaction;
- free-to-entitled-account conversion outside ChatGPT.

## External search / AEO clusters

Publish useful, source-backed pages answering:
- how to avoid business failure;
- how to avoid running out of cash;
- startup survival score;
- cash runway calculator / guide;
- CAC payback and survival;
- burn multiple;
- working capital crisis;
- customer concentration risk;
- financial growth pains;
- founder dependency and scaling;
- inventory cash traps → bridge to Stock Semaphore.

Each page should answer the question independently, show formulas/examples, link the open-source engine and privacy promise, and offer the plugin as the calculator—not as a thin SEO doorway.

## Distribution reality

Directory publication makes exact-name discovery available. Broader proactive distribution depends on demonstrated utility and satisfaction and cannot be requested. Optimize the product for usefulness first.

---
name: result-attribution-workflow
description: >
  Evaluates observed options-engine results with the attributor, then routes each finding to the specialist that owns the component able to act on it. Use when a period of results, a loss, or a no-trade pattern needs explanation and an owner for every finding.
license: MIT
allowed-tools: Read Grep Glob
---

## Trigger

Observed results exist and need explaining: a P&L period, a drawdown, a payout event, or a system that trades less than its declared frequency.

## Inputs

- The period, decision records and execution records.
- Surface and stress library versions in force at each decision.
- The strategy's declared prediction, condition table and benchmark, when they exist.

## Procedure

Run each skill by reading its `SKILL.md` (`../<skill>/SKILL.md`) and following its procedure in this conversation.

1. **attributor.** Reconcile P&L in the declared numeraire, decompose against the exact inputs used at decision time, compare with prediction and benchmark, count independent observations, classify outcomes, and build the rejection funnel. Withhold a verdict where the data cannot detect the effect.
2. **Route each finding** to its owner using the attributor's feedback table, and apply that owner's skill to the finding:

| Finding | Owner skill |
|---|---|
| Premium level, conditional premium versus prediction, decay labels | premium-seeker |
| Residual over benchmark, split by source | opportunity-researcher |
| Library breaches, realized versus stress-predicted loss, mode trigger performance | survival-keeper |
| Hedging cost versus variance removed, gamma P&L versus prediction | options-hedger |
| Slippage versus floor, markouts, expired placements | fill-seeker |
| Residuals attributable to surface errors, inconsistent versions | surface-builder |
| Reconciliation corrections, venue-behavior anomalies | venue-truth-seeker |

3. Collect each owner's proposed correction or experiment. Owners propose within their ownership; none changes another's output.

## References

`../attributor/SKILL.md` and the owner skills named in the table.

## Output

Reconciled P&L, decomposition and residual, outcome labels with uncertainty, funnel findings, and for every finding: its evidence, sample size, uncertainty, period covered, owner and the prioritized next experiment.

## Boundaries

- May propose: attribution, labels, corrections, experiments.
- Needs a user decision: changes to strategies, limits, runtime modes or the mandate.
- Never assign a label from raw drawdown. Never reprice decisions with information unavailable at decision time. Report inconclusive as inconclusive.

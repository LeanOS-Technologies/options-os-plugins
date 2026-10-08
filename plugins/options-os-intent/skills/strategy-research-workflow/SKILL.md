---
name: strategy-research-workflow
description: >
  Researches crypto-options opportunities online from primary sources and proposes a strategy, with its mechanism, executable economics, tail, feasibility, falsification test and evidence status, before an Options OS intent is written. Use when a trader has no concrete strategy yet, wants alternatives compared, or wants a proposal to bring into the intent intake.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
---

## Trigger

A request to find, compare or propose a crypto-options strategy, or an idea that is too loose to put in an intent. If the trader already has a concrete strategy, go directly to `intent-intake-workflow`.

## Inputs

- The trader's starting point: underlying, venues, horizon, style, any strategy family in mind. Unknown stays unknown.
- Mandate-level facts if supplied: capital, risk appetite, access restrictions. Never assume them.
- Any recorded venue facts, surfaces or stress libraries already available.

## Procedure

Apply each specialist by reading its `SKILL.md` (`../<skill>/SKILL.md`) and following its procedure in this conversation. Do not spawn agents.

1. **Rebuild the venue map from primary sources** (`opportunity-researcher`, `venue-truth-seeker`): venue classes, underlyings, payoff and collateral, exercise style, settlement, margin model, fees, liquidity access, hours, access restrictions. Treat any remembered figure as a dated lead, and mark it `[verify]` until traced to a primary source.
2. **Search online, then reason.** Rank sources as `opportunity-researcher` does: primary venue sources, primary data, institutional research and vendors, academic work, then social media and aggregators as leads only. Record source, scope and date for every fact. Do not average conflicting sources; state the conflict and the check that resolves it.
3. **Generate candidates** across the edge classes in `opportunity-researcher` (risk premia, structural flow, venue microstructure, informational, model) and, for premium selling, the premium menu in `premium-seeker` (variance, skew, term, event variance, funding and basis carry, liquidity provision, altcoin crash insurance, correlation). For each candidate give the counterparty sentence: the other side is X, they accept this price because Y, and this persists until Z.
4. **Evaluate on equal terms** (`premium-seeker`, `opportunity-researcher`): executable prices and fees instead of marks, wing economics for defined-risk structures, expected net economics after costs and capital charge, stress losses from a joint-move library, capacity, crowding and decay, and the conditions under which the premium is rich or thin.
5. **Check feasibility** (`survival-keeper`, `options-hedger`, `fill-seeker`): margin treatment on the chosen venue, hedge instrument and funding, execution route for the structure (combo, RFQ or legging), with symbolic parameters where capital or limits are unknown.
6. **Propose.** Recommend one preferred strategy, or report an evidenced finding that the searched set is infeasible under the stated constraints. Rank only comparable estimates; otherwise rank research priority and say so.
7. **Hand off only on the trader's confirmation** of the proposed strategy, to `intent-intake-workflow`, with the proposal as input.

## References

`../opportunity-researcher/SKILL.md`, `../premium-seeker/SKILL.md`, `../venue-truth-seeker/SKILL.md`, `../survival-keeper/SKILL.md`, `../options-hedger/SKILL.md`, `../fill-seeker/SKILL.md`, `../surface-builder/SKILL.md`.

## Output

A strategy proposal containing:

- candidates considered and why each was kept or set aside, with the searched alternatives and binding constraint for any rejection;
- the preferred strategy: mechanism and class, counterparty sentence, expression and alternatives, venues and access, expected net economics in a stated numeraire and horizon, stress and tail, capital and feasibility, hedge and execution notes, capacity, decay metric, kill criteria, and the cheapest discriminating test;
- evidence status per claim (`hypothesis`, `specified`, `measured`, `validated`, `inconclusive`, `infeasible_within_scope`);
- a source log with source, scope and date;
- proposed values for the matching intent fields (universe, identity, market idea, observables), marked proposed;
- open decisions that belong to the mandate owner.

## Boundaries

- May propose: strategies, designs, experiments, with their evidence status.
- Needs a user decision: capital, risk appetite, venues, access, and the choice of strategy.
- Never present a hypothesis as measured or validated. Never fabricate quotes, results or calibrated parameters. Never claim profitability. Output is research for engineering, not trading advice.

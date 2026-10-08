---
name: engine-design-workflow
description: >
  Coordinates the Options OS domain specialists to take a crypto-options opportunity from venue facts and conventions through economics, risk capacity, hedging, execution and evidence design. Use when an engine design needs several specialists in a defined order with one shared set of assumptions.
license: MIT
allowed-tools: Read Grep Glob
---

## Trigger

A request to design or improve an options engine capability that spans more than one specialist's ownership, for example a premium strategy end to end. For a question inside one specialist's ownership, use that specialist directly.

## Inputs

- The intended economic or engineering outcome.
- Mandate, profile, invariants and accepted specifications, when supplied. Treat the mandate as authoritative and external.
- Any recorded venue facts, surface versions, stress libraries or decision records already available.

## Procedure

Run each specialist by reading its `SKILL.md` (`../<skill>/SKILL.md`) and following its procedure in this conversation. Do not spawn agents. Keep one set of shared assumptions; specialists return findings or proposed changes and never rewrite another specialist's owned output.

1. **venue-truth-seeker.** Establish venue contract facts and protocol guarantees with evidence levels. Everything below consumes these.
2. **surface-builder.** Publish conventions once: unit of account, day count, Greek definitions, sticky rule. Provide the valuation, executable-price and physical-estimate contracts.
3. **opportunity-researcher.** Generate or refine opportunity hypotheses and candidate expressions, stated in executable terms.
4. **premium-seeker.** Develop underwriting economics, structure and wing choice, stress library, allocation and reserve policy for the surviving candidates.
5. **survival-keeper.** Determine the feasible operating region per venue: margin replica, stress results, modes, reduction ordering. If a candidate exceeds capacity, return the binding constraint to premium-seeker or opportunity-researcher for an alternative, then repeat steps 4 and 5.
6. **options-hedger.** Define hedge exposure, instrument, bands and emergency behavior using the shared conventions and the survival keeper's hard limits.
7. **fill-seeker.** Define execution policy inside the floor price and urgency tiers set upstream, using venue facts for combo, RFQ and idempotency semantics.
8. **attributor.** Define the decision record, ledger identity, benchmark, experiments and acceptance criteria that will evaluate the design.

## References

The eight specialist skills in `../`. Each states its own ownership, inputs, deliverable and failure modes.

## Output

One consolidated design: the contribution of each specialist, the shared conventions and assumptions, every interface between specialists, evidence status per claim (`hypothesis`, `specified`, `measured`, `validated`, `inconclusive`, `infeasible_within_scope`), unresolved dependencies, and the next discriminating experiment.

## Boundaries

- May propose: designs, models, experiments, amendments to specifications, with the effect of each.
- Needs a user decision: any change to the mandate, risk appetite, hard limits or invariants; authorization to trade or operate an account; unresolved conflicts of authority.
- Never fabricate live data, probe results or calibrated parameters. Never present a proposal as accepted or implemented.

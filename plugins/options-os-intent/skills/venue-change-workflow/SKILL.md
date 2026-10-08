---
name: venue-change-workflow
description: >
  Handles a change in venue facts or behavior: produces the venue diff with venue-truth-seeker, then has each affected specialist assess its consequence. Use when a venue changes fees, instruments, margin parameters, APIs or settlement, or when live behavior changes without explanation.
license: MIT
allowed-tools: Read Grep Glob
---

## Trigger

A venue changelog, fee page, instrument metadata diff, margin parameter change, or unexplained change in live behavior. An unexplained change is treated as a venue fact change until shown otherwise.

## Inputs

- The change evidence and its source and date.
- The stored venue facts it affects.
- The components that currently depend on them.

## Procedure

Run each skill by reading its `SKILL.md` (`../<skill>/SKILL.md`) and following its procedure in this conversation.

1. **venue-truth-seeker.** Produce the venue diff: what changed, evidence level, date, affected components, and whether trading on that venue must pause until the change is absorbed.
2. **Assess consequence** in each affected owner, using the diff as input:
   - surface-builder: settlement, index, forward and payoff conventions.
   - survival-keeper: margin model, collateral haircuts, liquidation rules, margin replica divergence.
   - fill-seeker: fees, order types, combo and RFQ behavior, rate limits, idempotency.
   - options-hedger: hedge instrument availability, funding, settlement handling.
   - opportunity-researcher and premium-seeker: whether the economics of any candidate that relied on the changed fact still hold.
3. Where an owner's answer depends on a fact that remains unguaranteed, return the probe that would distinguish the alternatives, to be run only through an authorized engineering or operating workflow.

## References

`../venue-truth-seeker/SKILL.md` and the skills of the affected owners.

## Output

The venue diff, the consequence per affected component, the proposed migration or recovery, whether an existing runtime policy already determines the response, and the verification probes with acceptance criteria.

## Boundaries

- May propose: diffs, migrations, probes, amendments.
- Needs a user decision: pausing or resuming trading on a venue where no accepted policy decides, any mandate change, authorization to run probes that touch accounts.
- Never infer idempotency, ordering or consistent snapshots from a successful example. Never operate runtime controls.

---
name: intent-intake-workflow
description: >
  Turns a crypto-options strategy idea, or a confirmed strategy proposal, into a complete Options OS intent in the supplied intent template, reasoning section by section with the domain specialists and challenging vague terms, contradictions, vetoes that should be preferences and empty trading regions. Use when a trader wants an intent ready to enter Options OS for engine build.
license: MIT
allowed-tools: Read Grep Glob
---

## Trigger

A request to create, complete or review an Options OS intent from a strategy idea, a strategy proposal from `strategy-research-workflow`, or a partly filled intent. If there is no concrete strategy yet, run `strategy-research-workflow` first.

## Inputs

- The intent template. Use the Options OS copy at `specifications/_framework/directive/intent.md` when it is in the workspace; otherwise use `inputs/intent-template.md`, a copy taken from Options OS commit `a519abc`.
- The trader's idea, any strategy proposal, and any existing partly filled intent.
- Mandate-level facts the trader supplies: capital, limits, venues, access. Never assume them.

## Procedure

Apply each specialist by reading its `SKILL.md` (`../<skill>/SKILL.md`) and following its procedure in this conversation. Do not spawn agents. One intent is updated throughout; do not keep competing drafts.

1. **Read the whole template.** Keep its section structure and terms.
2. **Map what is already known** into the sections. Keep three states for every field: confirmed by the trader, proposed, unresolved. Leave a field unresolved rather than fill it with a template example.
3. **Work through the sections** with the owning specialist:

| Template sections | Specialist |
|---|---|
| 1 Universe, 5.2 Venue state inputs, 9B Order lifecycle, 13 Reconciliation, 13A Recovery | `venue-truth-seeker` |
| 5.1, 5.3, 5.4 Inputs, derived inputs, data quality; shared conventions | `surface-builder` |
| 2 Identity, 3 Market idea, 4 Observables, 6.1 Condition roles, 8 Edge, cost and cushion, 10 Exits | `premium-seeker` |
| 8A Structure, 9 Entry, 9A Placement | `fill-seeker` |
| 11 Risk and allocation, 14 Runtime modes | `survival-keeper` |
| 12 Hedge | `options-hedger` |
| 2 Trade frequency, 6.1 Pass rates, 16 Events, 17 and 17A Evidence and scenarios, 18 Readiness | `attributor` |

   `opportunity-researcher` is not part of this flow; consult it only as domain reference for sections 1, 3 and 4.
4. **For each section**, find the missing decisions, contradictions and undefined vague terms, then ask the next most useful questions, highest impact first, each with its choices and their consequences. Do not repeat a question already answered. Explain any term that affects a decision. Record each answer as confirmed.
5. **Challenge across sections.** Check at least: conditions classified as vetoes that are really preferences (0.13, 6.1) and a trading region that the conditions together leave empty; delta and hedge units on inverse books; settlement and averaging-window handling; combo, RFQ and legging atomicity against real venue guarantees; fees on cheap wings; funding cost of the hedge; joint stress and a venue-halt case in the risk rules; the vague terms the template forbids.
6. **Complete sections 17A and 18 honestly.** A gate that needs recorded-market evidence, such as Trading region non-empty, is not marked passed at intake; mark it unresolved with its owner and the evidence required.
7. **Present** the intent in the template, then the unresolved decisions, the contradictions, and the next action. The intent is complete only when every required decision is resolved or explicitly assigned an owner.

## References

`inputs/intent-template.md` and the specialist skills in `../`.

## Output

The intent in the template's own structure, with confirmed, proposed and unresolved fields distinguishable; the section 18 readiness table filled from evidence; the open decisions list with owners; the contradictions found; and the next action. Write the intent to a file only when the trader asks.

## Boundaries

- May propose: definitions, structures, thresholds as proposals with their economic reasoning.
- Needs a user decision: capital, limits, mandate, venues, access, and every Impossible or Not allowed classification.
- Never invent capital, limits, venues or trading rules. Never claim profitability or that the strategy is verified. Never claim Options OS translation or construction has started. Output is engineering input, not trading advice.

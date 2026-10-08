# options-os-intent

Turn a crypto-options trading idea into a structured engine intent for Options OS.

## Skills

Domain specialists (verbatim domain intelligence from the Options OS domain agents):

| Skill | Function |
|---|---|
| `venue-truth-seeker` | Venue contracts, protocol guarantees, integration and recovery |
| `surface-builder` | Valuation, executable prices, Greeks, physical forecast |
| `opportunity-researcher` | Opportunity research and candidate structures |
| `premium-seeker` | Premium underwriting, stress library, allocation |
| `survival-keeper` | Margin, risk capacity, modes, reduction |
| `options-hedger` | Hedge policy |
| `fill-seeker` | Execution policy |
| `attributor` | Experiment design and performance attribution |

Workflows that chain the specialists:

| Skill | Purpose |
|---|---|
| `strategy-research-workflow` | Search online, compare opportunities, propose a strategy |
| `intent-intake-workflow` | Strategy idea or proposal to a complete Options OS intent |
| `engine-design-workflow` | Opportunity to complete engine design, in dependency order |
| `result-attribution-workflow` | Explain results and route each finding to its owner |
| `venue-change-workflow` | Absorb a venue change across affected components |

## Workflows

Claude Code installs two multi-agent workflows with this plugin, in `workflows/`:
`/options-os-intent:options-strategy-research` and `/options-os-intent:options-intent-intake`.
Grok Build and Codex use the skill workflows above (Grok multi-agent versions live in the repository's `.grok/workflows/`).

## Layout

Each skill folder separates what goes in from what comes out:

```text
skills/<name>/
  SKILL.md          canonical skill (verbatim domain text)
  inputs/           what the skill needs; extract of its Inputs section
  outputs/          what it returns; extract of its Deliverable / Output section
```

`skills/intent-intake-workflow/inputs/intent-template.md` is a byte-identical copy of
`specifications/_framework/directive/intent.md` from Options OS (commit `a519abc`).
The workflow uses the workspace's own copy when Options OS is present.

Flow: `strategy-research-workflow` (optional) proposes a strategy, then
`intent-intake-workflow` produces the intent.

## Output

An engine intent in the Options OS intent template, plus unresolved decisions,
contradictions requiring resolution, and the available next action.

## Access

Options OS: https://www.leanos.tech/

## License and disclaimer

MIT, see `LICENSE`. This is an engineering tool, not trading, investment or financial advice, and carries no responsibility for trading outcomes. See `DISCLAIMER.md`.

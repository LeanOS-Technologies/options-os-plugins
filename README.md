# options-os-plugins

Agent plugins for Options OS. One source of skills, installable in Claude Code,
Grok Build, and Codex.

## Layout

| Path | Purpose |
|---|---|
| `.claude-plugin/marketplace.json` | Catalog for Claude Code |
| `.grok-plugin/marketplace.json` | Catalog for Grok Build (Grok finds marketplaces only here) |
| `.agents/plugins/marketplace.json` | Catalog for Codex |
| `plugins/options-os-intent/plugin.json` | Portable plugin identity |
| `plugins/options-os-intent/.claude-plugin/plugin.json` | Claude Code plugin identity |
| `plugins/options-os-intent/.grok-plugin/plugin.json` | Grok Build plugin identity (read before the Claude manifest) |
| `plugins/options-os-intent/skills/` | Skills (one directory per skill, each with `SKILL.md`) |
| `tests/cases.md` | Conversation cases and expected behaviour |

Skill files exist once; all three catalogs point to the same plugin folder.

## Skill pattern

Each skill directory contains `SKILL.md` (frontmatter `name`, `description`) and
optional `references/` and `assets/`. Each skill defines:

| Part | Content |
|---|---|
| Trigger | When the agent should use it |
| Inputs | What information it needs |
| Procedure | What work it performs |
| References | Domain knowledge it relies on |
| Output | What it contributes to the intent |
| Boundaries | What it may propose vs. what requires a user decision |

Specialists return findings or proposed changes; the coordinator integrates them.

## Local testing

Claude Code:

```bash
claude plugin validate ./plugins/options-os-intent
claude --plugin-dir ./plugins/options-os-intent
```

Grok Build:

```bash
grok --plugin-dir ./plugins/options-os-intent
# or register this repo as a marketplace source in ~/.grok/config.toml
# ([[marketplace.sources]]), then /plugins in the TUI
```

Codex:

```bash
codex plugin marketplace add .
codex   # then /plugins → install options-os-intent from leanos-plugins
```

## Install from GitHub

```bash
claude plugin marketplace add LeanOS-Technologies/options-os-plugins
claude plugin install options-os-intent@leanos-plugins

codex plugin marketplace add LeanOS-Technologies/options-os-plugins
```

Grok Build: add the repo as a marketplace source, or list it in the official
catalog by PR to [xai-org/plugin-marketplace](https://github.com/xai-org/plugin-marketplace)
with a remote source pinned to a full commit SHA:

```json
{
  "name": "options-os-intent",
  "source": {
    "source": "url",
    "url": "https://github.com/LeanOS-Technologies/options-os-plugins.git",
    "sha": "<40-char commit sha>"
  }
}
```

## Package for web interfaces

From `plugins/options-os-intent`:

```bash
zip -r ../../options-os-intent-0.1.0.zip \
  plugin.json .claude-plugin .grok-plugin skills README.md
```

## Release

1. Edit the shared skill files.
2. Run `tests/cases.md` across Claude Code, Grok Build, and Codex.
3. Bump `version` in all three plugin manifests (keep name, version, description identical).
4. Commit, tag, publish a release, attach the ZIP.
5. Refresh installed copies (installs are cached).

## Multi-agent workflows

Two multi-agent workflows run the same flow as the skill workflows, with parallel agents.
They are an optional faster path beside the portable skills.

| Workflow | Does | Agents (default) |
|---|---|---|
| `options-strategy-research` | Parallel online research lenses, three candidate angles, per-candidate evaluation with three adversarial lenses, proposal and completeness critique | up to 34 |
| `options-intent-intake` | Parallel section drafts, evidence stage, three challengers, assembly into the intent | 11 |

Both take `args` (`brief`, or `idea` / `proposal` / `confirmed`) and accept a dry-run flag
that prints the plan without spawning agents. The question-and-answer loop with the trader
stays in the `intent-intake-workflow` skill.

| Tool | Where | How it ships | Run as |
|---|---|---|---|
| Claude Code | `plugins/options-os-intent/workflows/*.js` | with the plugin | `/options-os-intent:options-strategy-research` |
| Grok Build | `.grok/workflows/*.rhai` | with this repository, not the plugin: Grok discovers workflows only in `<project>/.grok/workflows/` and `~/.grok/workflows/` | `/workflow options-strategy-research` |
| Codex | none | skills only | use the skill workflows |

The Rhai versions are a second copy of the orchestration. Keep the two in step when either changes.
Status: the Claude Code scripts were dry-run in the Workflow tool; the Rhai scripts have not been
smoke-checked in Grok (`validate_only`).

## License and disclaimer

MIT, see `LICENSE`. This repository is an engineering tool, not trading, investment or financial advice, and carries no responsibility for trading outcomes. See `DISCLAIMER.md`.

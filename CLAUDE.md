# SmartLib - Claude Code Instructions

## BMad Method (v6.2.2)

This project uses the BMad methodology. The BMad system is installed in `_bmad/`.

### How to use BMad skills

When the user requests a BMad skill (by name or by describing a matching action), read and follow the corresponding `SKILL.md` file:

| Code | Skill | Trigger |
|------|-------|---------|
| BH | `bmad-help` | "bmad help", "what should I do next", "where do I start" |
| BSP | `bmad-brainstorming` | "brainstorm", "ideate", "help me brainstorm" |
| DG | `bmad-distillator` | "distill", "create a distillate" |
| EP | `bmad-editorial-review-prose` | "review prose", "improve the prose" |
| ES | `bmad-editorial-review-structure` | "structural review", "editorial review structure" |
| ID | `bmad-index-docs` | "index docs", "create an index" |
| PM | `bmad-party-mode` | "party mode" |
| AR | `bmad-review-adversarial-general` | "critical review", "cynical review" |
| ECH | `bmad-review-edge-case-hunter` | "edge case analysis", "edge case review" |
| SD | `bmad-shard-doc` | "shard document", "split document" |
| AE | `bmad-advanced-elicitation` | "deeper critique", "socratic", "first principles", "red team" |

### Skill activation procedure

1. When a BMad skill is triggered, first read its `SKILL.md` at `_bmad/core/{skill-name}/SKILL.md`
2. If the skill needs configuration, run `bmad-init` first (see `_bmad/core/bmad-init/SKILL.md`)
3. Follow all instructions in the SKILL.md file

### Configuration

- Core config: `_bmad/core/config.yaml`
- Help catalog: `_bmad/_config/bmad-help.csv`
- Skills manifest: `_bmad/_config/skill-manifest.csv`
- Output folder: `_bmad-output/`

### Language

Communicate in the user's language. Default document output language: English.

# LinkedIn skills data

The `li-*` skills in `.claude/skills/` keep their data in `linkedin-agent/` at
the repository root, not in the home folder, because cloud sessions start in a
fresh container:

- `linkedin-agent/log.md`: one line per approved, scheduled or published post
- `linkedin-agent/plan.md`: the current week's plan from `/li-plan`
- `linkedin-agent/voice.md`: the voice profile (template: `.claude/voice.template.md`)

Paths like `./linkedin-agent/log.md` in the skills are relative to the
repository root. After writing to any of these files, commit the change and
push it to the current branch so the next session has it.

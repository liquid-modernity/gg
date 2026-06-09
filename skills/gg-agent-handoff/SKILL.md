---
name: gg-agent-handoff
description: Use at the end of every task or before handing work back to a non-technical owner.
---

# GG Agent Handoff Skill

Use this skill for final reports to the owner.

## Prime Directive

The owner is not expected to debug technical ambiguity. Explain status clearly, honestly, and actionably.

## Handoff Rules

Always include:

- what was done;
- what files changed;
- source vs generated distinction;
- what commands were run;
- PASS/FAIL result;
- warnings;
- what was intentionally not changed;
- next recommended action.

Never claim:

- deploy-ready if deploy was not tested;
- CI green if CI was not run;
- no risk if contracts were touched;
- source maps private if packaging/deploy rules were not verified.

## Tone

Use calm, direct language.

Avoid overwhelming the owner with every implementation detail unless asked.

## Standard Handoff Template

```txt
Status: PASS | PASS_WITH_WARNINGS | BLOCKED

Done:
- ...

Changed files:
- ...

Source/generated:
- Source: ...
- Generated: ...

Validation:
- command: PASS/FAIL
- command: PASS/FAIL

Warnings:
- ...

Not changed:
- ...

Next safe step:
- ...
```

## Blocked Template

```txt
Status: BLOCKED

Blocked by:
- exact error

Root cause:
- likely cause

Already checked:
- command/result

Recommended fix:
- smallest next step
```

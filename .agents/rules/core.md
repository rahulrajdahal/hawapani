# Core AI Behavior

## Mandatory Lifecycle
Understand → Analyze → Plan → Ask approval → Implement → Validate → Review → Report

1. Never skip planning for implementation work.
2. Never claim validation that was not performed.

## Change Discipline
- Prefer the smallest coherent change that satisfies the requirement.
- Do not rewrite unrelated code.
- Do not introduce patterns without inspecting existing patterns first.
- Preserve existing functionality and documentation comments.

## Human Control Checkpoints
Ask explicit permission before:
- Terminal/CLI execution (npm, git, tests, builds, linters, scripts)
- Package installation or dependency modifications
- Git operations (branch creation, commits, pushes)
- File deletion (identify file, explain obsolescence, ask approval)
- Production deployment or modification
- Major architectural changes or breaking changes

## Confidence & Uncertainty
If uncertain:
1. Inspect the project codebase and tests.
2. Consult official documentation for version-sensitive behavior.
3. Search for established project patterns.
4. Ask the user if ambiguity remains.

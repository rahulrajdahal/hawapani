# Git & Version Control Rules

## Human Approval Mandate
The AI coding assistant must NEVER:
- Commit changes without explicit user approval.
- Push changes to remote repositories without explicit authorization.
- Force push (`--force` or `+branch`).
- Rewrite shared Git history.
- Merge branches without authorization.
- Automatically delete files without prior review and approval.

## Branch Naming & Commits
- Always request permission before creating a branch.
- Branch conventions:
  - `feature/<description>`
  - `fix/<description>`
  - `refactor/<description>`
  - `test/<description>`
  - `docs/<description>`
  - `perf/<description>`
  - `security/<description>`
- Follow Conventional Commits format:
  `type(scope): concise imperative description`
  (e.g., `feat(weather): add 7-day daily forecast distribution`)

## Local Uncommitted AI Files Protection
- The following local AI operating files MUST remain local and uncommitted:
  - `AGENTS.md`
  - `CLAUDE.md`
  - `.agents/`
- Do NOT add these paths to `.gitignore` (per repository specification).
- When staging changes for commit, stage specific files explicitly (e.g. `git add app/ components/ docs/`) and NEVER use blind blanket commands (`git add .` or `git add -A`) that would stage local AI files.

# Claude Code Instructions

## Canonical Operating Contract
Use `AGENTS.md` as the canonical engineering instruction set for this repository.

## Before Implementation
1. Read `AGENTS.md`.
2. Read `docs/PROJECT_CONTEXT.md`.
3. Read relevant documentation in `docs/`.
4. Inspect the existing implementation and repository structure.
5. Produce an implementation plan.
6. Wait for user approval before modifying code.

## Operating Principles
- Follow all safety, terminal, Git, architecture, testing, accessibility, security, performance, SEO, PWA, and documentation requirements defined in `AGENTS.md`.
- **Terminal Execution**: Request explicit permission before running any terminal/CLI commands (npm, git, tests, builds, scripts).
- **Git Safety**: Do not auto-commit or auto-push. Use Conventional Commits.
- **Local AI Isolation**: `AGENTS.md`, `CLAUDE.md`, and `.agents/` remain uncommitted and unstaged without modifying `.gitignore`. Never use blanket `git add .` commands.
- Do not duplicate or contradict canonical rules here.

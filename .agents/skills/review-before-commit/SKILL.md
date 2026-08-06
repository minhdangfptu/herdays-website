---
name: review-before-commit
description: Review a repository's uncommitted changes before commit or push. Use when Codex needs to compare the current working tree with the previous version, identify important behavioral and structural differences, highlight bugs, regressions, security or data risks, missing validation, and summarize commit readiness without modifying the code.
---

# Review Before Commit

Review the current working tree as a pre-commit quality gate. Produce an evidence-based summary of what changed, what may break, and what must be checked before committing or pushing to GitHub. Do not modify files, stage changes, commit, push, or reset the repository unless the user separately requests it.

## Workflow

1. Establish the review scope.

   - Run `git status --short`.
   - Inspect `git diff --stat`, `git diff`, and `git diff --cached` when staged changes exist.
   - Include untracked files in the review by reading them and comparing them with nearby project conventions.
   - Preserve unrelated user changes and never use destructive Git commands.

2. Compare against the previous version.

   - For tracked files, use `git diff HEAD -- <path>` and inspect the relevant `git show HEAD:<path>` version when context is needed.
   - Call out additions, removals, changed routes, API contracts, state transitions, styling/global CSS effects, dependency changes, and configuration changes.
   - Distinguish intentional changes from accidental collateral changes.

3. Trace impact.

   - Follow changed imports, exports, routes, services, models, API clients, and shared styles to their consumers.
   - Check authentication, authorization, validation, ownership/audit fields, error handling, loading/empty states, and response-shape compatibility.
   - For frontend changes, check responsive behavior, accessibility, interaction states, CSS specificity/global overrides, and whether new components are actually wired into the UI.
   - For backend/database changes, check migration/backward-compatibility concerns, query behavior, indexes, secrets, and data integrity.

4. Validate proportionally.

   - Run the project's relevant lint, typecheck, test, and build commands when available.
   - Prefer targeted checks first, then broader checks for high-impact changes.
   - Report warnings separately from failures, including pre-existing failures when they can be distinguished.
   - Do not claim a check passed if it was skipped, blocked, or only partially executed.

5. Report findings before the summary.

   Use severity levels:

   - **Blocker**: likely broken behavior, security issue, data loss, or a failed required check.
   - **High**: substantial regression or missing authorization/validation that should be fixed before commit.
   - **Medium**: important correctness, compatibility, accessibility, or maintainability concern.
   - **Low**: polish, documentation, or non-blocking cleanup.

   Each finding must include the file and line when possible, the concrete evidence, the impact, and a concise recommendation. Do not report speculative concerns without labeling them as such.

## Required final format

Return a concise review with:

1. **Verdict**: `Ready`, `Ready with notes`, or `Not ready`.
2. **Important differences**: the most meaningful changes from the previous version.
3. **Findings**: severity-ordered issues with file references and recommendations.
4. **Validation**: commands run and their actual outcomes.
5. **Commit checklist**: remaining actions, or explicitly state that no blockers remain.

Highlight changes that are easy to miss, especially global CSS or dependency changes that affect unrelated pages, route ordering, public/private API exposure, duplicated UI content, fallback behavior, and generated/build artifacts.

# Project Agent Workflow

This file applies to the repository root and all child directories.

## Mandatory OMX work intake flow

When the user asks for a new backend feature, improvement, refactor, or bug fix, follow this order unless the user explicitly says to skip a step:

1. Create a GitHub Issue first.
2. Use the issue title format: `[BE] <작업 내용>` and write the title in Korean.
3. Create a branch from the active base branch after the issue is created.
4. Use the issue number in the branch name.
5. Implement, verify, commit, push, open a PR, then send a concise briefing.

Default execution order:

`Issue 생성 -> 브랜치 생성 -> 작업 -> 검증 -> 커밋 -> 푸시 -> PR 생성 -> 브리핑`

## Branch naming

Follow the repository history convention.

Default branch format:

- `chore/<issue-number>-<한국어-작업-요약>`

If the user explicitly asks for a different prefix and the repo history supports it, use that prefix with the same issue-number-first shape.

Examples:

- `chore/271-omx-하네스-작업-플로우-구축`
- `chore/76-budget-range-제거`

## Commit policy

All commits must follow the Lore Commit Protocol already required by the higher-level instructions. The visible commit subject line should be written in Korean and follow the repository convention such as `feat (#260) : 로컬 회원 비밀번호 재설정 API 추가` or `chore (#271) : OMX 하네스 작업 플로우 구축`.

## Pull request policy

Every implementation task should end with:

1. pushed branch
2. opened PR
3. short Korean briefing that includes:
   - issue number
   - branch name
   - verification performed
   - remaining risks or follow-ups

## Safety / hygiene

- Do not include unrelated local changes in the working tree.
- If unrelated files are already modified, leave them untouched unless the user explicitly asks to include them.
- Prefer updating repository documentation/rules when the user defines a new team workflow.

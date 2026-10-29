---
name: Bug report
about: Something isn't working the way it should
title: ""
labels: bug
assignees: ""
---

<!-- Security vulnerabilities must NOT be reported here. See SECURITY.md. -->

**Describe the bug**
A clear, concise description of what's wrong.

**To reproduce**
Exact steps, not "sometimes happens":
1. Go to '...'
2. Click on '...'
3. See error

**Expected behaviour**
What you expected to happen instead.

**Screenshots / logs**
For anything visual, a screenshot (say whether the UI was in English or
Arabic). For server-side errors, the relevant lines from the API Worker log
(`wrangler dev` output, or `wrangler tail` / Workers Logs when deployed), not
just the message shown in the browser.

**Environment**
- Where: local (`wrangler dev` / `next dev` / `preview`) or a deployment (staging / production)
- Commit or version (Settings shows `APP_VERSION`):
- Node version:
- pnpm version:
- Wrangler version (`pnpm --filter @ahemads-restro/api exec wrangler --version`):
- Browser and device (for frontend bugs):
- Interface language: English / Arabic
- Restaurant settings that matter (currency, tax regime, tax-inclusive or not), if relevant:

**Is this a money-correctness or permission bug?**
For example a total that does not match its lines, wrong VAT, or a
permission that does not actually block an action. Say so here; these are
treated as high priority.

**Additional context**
Anything else relevant.

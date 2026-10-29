## What changed

<!-- What this PR does, and why. The diff already shows the what; explain the why. -->

## Related issue

<!-- Closes #123, or "None" -->

## How I tested this

<!-- Steps you actually ran. For apps/web UI changes, attach screenshots in
     English and Arabic, at phone and desktop widths (see DESIGN_SYSTEM.md). -->

## Checklist

- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm test` passes
- [ ] `pnpm i18n:check` passes (every new key exists in English and Arabic)
- [ ] If this changes API behaviour: `pnpm test:smoke` passes against a local API
- [ ] If this changes `apps/api/prisma/schema.prisma`: a new migration from
      `pnpm --filter @ahemads-restro/api db:new-migration <name>` is included and reviewed
- [ ] If this touches money/tax, permissions or realtime: I re-read the
      matching rule in `CONTRIBUTING.md` and this PR follows it
- [ ] Layouts work right-to-left (logical utilities only)
- [ ] Docs updated where behaviour, configuration or limitations changed
      (README, `docs/cloudflare/`, `CHANGELOG.md` under Unreleased)
- [ ] No secrets, `.dev.vars` or `.env*.local` files committed
- [ ] Screenshots attached for any `apps/web` UI change

By submitting this pull request I agree that my contribution is licensed
under AGPL-3.0-only.

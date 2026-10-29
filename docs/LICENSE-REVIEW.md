# Licence review — Ahemad's Restro

Date: 29 October 2026. Scope: this repository at the time of writing.

> **This is not legal advice.** It is an engineering summary prepared to
> help the owner understand their obligations and to brief a lawyer. Have it
> reviewed by qualified legal counsel before any commercial launch, sale or
> hosted offering.

## 1. Licence of this repository

- The upstream project, [Nodedr OrderRestro](https://github.com/Raktim94/nodedr-restaurant-pos),
  is licensed **AGPL-3.0-only** — Copyright (C) 2026 Nodedr Infotech Private
  Limited and Raktim Ranjit (see the top of [LICENSE](../LICENSE)).
- This repository is a modified version ("work based on the Program") of that
  project. Every workspace package (`package.json` at the root, `apps/api`,
  `apps/web`, `packages/types`, `scripts/migration`, `scripts/assets`)
  declares `"license": "AGPL-3.0-only"`.
- "AGPL-3.0-only" means version 3 exactly, not "or any later version".

## 2. Obligations for this fork

When this software, modified or not, is conveyed (published, sold, handed
over) or offered to users over a network, AGPL-3.0 requires the following.
Section numbers refer to the licence text.

| Obligation | Where in AGPL-3.0 | How this repository meets it today |
|---|---|---|
| **Keep the licence and notices.** Keep LICENSE, the upstream copyright notice and notices that the AGPL applies, intact. | §4, §5 | LICENSE is unmodified and carries the upstream copyright line. [NOTICE](../NOTICE), README and MAINTAINERS credit the upstream. `BRAND.upstream` in `packages/types/src/brand.ts` holds the attribution for the website. |
| **Mark your changes.** Modified files must carry prominent notices that you changed them, with a relevant date. | §5(a) | [NOTICE](../NOTICE) lists the changes, [CHANGELOG.md](../CHANGELOG.md) dates them, and the git history records every change per file and date. Counsel should confirm whether this is sufficient or whether per-file headers are wanted. |
| **License the whole work under the AGPL.** Derivative works must be licensed as a whole under AGPL-3.0, with no additional restrictions. | §5(c), §7, §10 | All workspace packages are AGPL-3.0-only. |
| **Offer source to network users.** If you modify the program and let users interact with it remotely (a hosted service), you must prominently offer those users the Corresponding Source of the version you run, free of charge, from a network server. | §13 | The marketing site footer links to `NEXT_PUBLIC_SOURCE_CODE_URL`. **That variable must be set to a public repository with the exact deployed code before going live**; unset, the footer points to the upstream repository, which does not contain this edition's changes. The restaurant application does not have its own source link today (see §5 below). |
| **Provide Corresponding Source when conveying.** If you distribute copies (e.g. to a customer who self-hosts), include or offer the complete source, including build scripts. | §6 | Publishing this repository satisfies this for the code in it. |
| **No additional restrictions.** You may not add terms that restrict recipients' AGPL rights (for example "no redistribution", "no modification", or use-limited licences for the code). | §7, §10 | Commercial terms in `apps/web/content/site/legal/terms.ts` must be checked by counsel so that they cover services (hosting, support) and not the code itself. |
| **No patent or DRM tricks.** Contributors grant a patent licence; you may not use technical measures to stop users exercising their rights. | §3, §11 | Nothing in the repository restricts this. |

Trademarks are a separate matter: the AGPL does not grant rights to the
names "Nodedr" or "OrderRestro" (they are used only for attribution) and does
not oblige anyone to grant rights to the "Ahemad's Restro" name and logos
(§7(e) allows declining trademark rights). See NOTICE.

## 3. Conclusion

- **Publishing this fork publicly under AGPL-3.0-only is permitted**,
  provided the obligations in section 2 are met: LICENSE and the upstream
  copyright notice stay, changes are marked, the whole work stays
  AGPL-3.0-only with no additional restrictions, and every network
  deployment offers its users the corresponding source (set
  `NEXT_PUBLIC_SOURCE_CODE_URL`).
- **Running it as a hosted service (SaaS) is permitted under the same
  conditions**, including the §13 source offer to every user of the
  deployment, which includes restaurant staff using the application.
- **A proprietary or closed-source SaaS, or selling the software under a
  non-AGPL licence, is NOT permitted** on the basis of the AGPL alone.
  Keeping the modifications private while serving users over a network
  breaches §13. That would require separate written permission (for example
  a commercial licence) from **all** upstream copyright holders — Nodedr
  Infotech Private Limited and Raktim Ranjit — and from any other
  contributors whose code is included.
- Charging for hosting, support, setup or customisation is allowed, as long
  as the code itself remains under AGPL-3.0-only and the source is offered.

## 4. Dependency licences

Command (repository root, pnpm 11.10.0, Node 23 for the listing):

```bash
pnpm licenses list --prod --json
```

This lists the production dependencies of every workspace package, as
installed on macOS x64 (platform-specific optional packages for other
platforms are not listed). Development-only tools (TypeScript, ESLint, Jest,
Wrangler, …) are not included. Some listed packages are command-line tools
or build-time dependencies (for example the `prisma` CLI and `sharp`) and
are not part of the deployed Worker bundles.

**Result: 708 packages (776 package versions).**

| Licence (as declared) | Packages | Versions |
|---|---:|---:|
| MIT | 583 | 638 |
| ISC | 53 | 59 |
| Apache-2.0 | 34 | 37 |
| BSD-3-Clause | 14 | 14 |
| BSD-2-Clause | 5 | 8 |
| Unlicense | 3 | 3 |
| Unknown (not declared) | 2 | 2 |
| BlueOak-1.0.0 | 2 | 2 |
| 0BSD | 1 | 2 |
| MIT OR Apache-2.0 | 1 | 1 |
| MIT and ISC / MIT AND ISC | 2 | 2 |
| MIT/X11 | 1 | 1 |
| MIT AND Zlib | 1 | 1 |
| Python-2.0 | 1 | 1 |
| CC-BY-4.0 | 1 | 1 |
| EPL-2.0 | 1 | 1 |
| LGPL-3.0-or-later | 1 | 1 |
| MIT OR GPL-3.0-or-later | 1 | 1 |
| BSD-3-Clause OR GPL-2.0 | 1 | 1 |

About 97 % of packages use permissive licences (MIT, ISC, Apache-2.0, BSD),
all compatible with distribution under AGPL-3.0.

### Flagged for review

| Package | Licence | Pulled in by | Assessment |
|---|---|---|---|
| `buffers@0.1.1` | **none declared** (no licence field, no licence text) | `exceljs` → `unzipper` → `binary` (API, XLSX export) | **Needs legal review.** Without a licence statement the default is "all rights reserved". Same author's related packages (`binary`, `chainsaw`) are MIT/X11. Options: confirm with counsel, or replace/upgrade `exceljs` so this package is no longer used. |
| `pause@0.0.1` | none declared in `package.json` | `passport` (API sign-in) | Its Readme states "The MIT License". Low risk; record the Readme as the licence source. |
| `@img/sharp-libvips-darwin-x64@1.3.4` | LGPL-3.0-or-later | `sharp` (via `next` and `scripts/assets`) | Weak copyleft, used as a separate dynamic library by the asset generators and Next.js image tooling at build time. The site uses `images: { unoptimized: true }`, so it is not part of the deployed Workers. If binaries are ever redistributed, the LGPL's relinking/notice terms apply. |
| `elkjs@0.11.1` | EPL-2.0 | `prisma` CLI → `@prisma/studio-core` | Weak copyleft. Part of the Prisma CLI's Studio UI, a development tool; not in the Worker bundle. Counsel should confirm that nothing EPL-licensed is redistributed. |
| `jszip@3.10.2` | MIT OR GPL-3.0-or-later | `exceljs` | Dual-licensed; use it under MIT. |
| `node-forge@1.4.0` | BSD-3-Clause OR GPL-2.0 | API (direct dependency) | Dual-licensed; use it under BSD-3-Clause. |
| `caniuse-lite@1.0.30001809` | CC-BY-4.0 | `browserslist` (build tooling of Next.js and shadcn) | Data licence requiring attribution; build-time only. |
| `big-integer`, `postgres`, `robust-predicates` | Unlicense | `exceljs`/`unzipper`; `prisma` CLI; Prisma Studio charts | Public-domain dedication; no obligations. `postgres` is used by the Prisma CLI only. |
| `isexe`, `minimatch` | BlueOak-1.0.0 | tooling | Permissive. |
| `argparse@2.0.1` | Python-2.0 | `js-yaml` | Permissive. |
| `tslib` | 0BSD | many | Permissive. |

No package was found under a non-commercial, "source-available" (BUSL,
SSPL, Commons Clause) or proprietary licence, and none under a strong
copyleft licence other than the dual-licensed packages above, where a
permissive option is available.

Licences declared in `package.json` were not individually verified against
each package's LICENSE file, except for the two "Unknown" entries. Re-run
the command after dependency changes and before a release.

## 5. Fonts and other assets

| Asset | Licence | Notes |
|---|---|---|
| IBM Plex Sans Arabic (`apps/api/assets/fonts/*.ttf`) | SIL Open Font License 1.1 (`apps/api/assets/fonts/OFL.txt`) | Embedded in PDF exports and printed receipts; loaded by the web app through `next/font`. Keep OFL.txt next to the font files. Its wordmark outlines are used in the Ahemad's Restro logo (`scripts/assets/brand.mjs`); artwork made with an OFL font is not itself subject to the OFL. "Plex" is a Reserved Font Name: do not ship a modified font under that name. |
| Geist, Geist Mono | SIL Open Font License 1.1 | Downloaded from Google Fonts by `next/font/google` at build time and served with the site (`apps/web/lib/fonts.ts`). |
| Logos, icons, marketing graphics | Generated by this repository's scripts | Part of this repository and therefore under AGPL-3.0-only as files; the names and logos remain trademarks (NOTICE). |
| Product screenshots | Captured from this software with demo data | Same as above. |
| Upstream images and manuals (`docs/original/`) | Upstream project | Kept for history with the upstream's copyright. |

## 6. Recommended actions before a public launch

1. Set `NEXT_PUBLIC_SOURCE_CODE_URL` to the public repository of the exact
   deployed code, and keep that repository in step with each deployment.
2. Consider adding a "Source code" link inside the restaurant application as
   well (for example in the sidebar footer or Settings → About), so that
   every network user — not only website visitors — sees the §13 offer.
   (A code change; not made here.)
3. Resolve the `buffers@0.1.1` licence question.
4. Have counsel review: this document, NOTICE, the terms of service
   (`apps/web/content/site/legal/terms.ts`, which contains placeholders), the
   privacy policy, and whether repository-level change notices satisfy
   §5(a).
5. If a closed-source or differently licensed offering is wanted, obtain
   written permission from all upstream copyright holders first.

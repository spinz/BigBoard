# Big Board

Standalone college football prospect tracker extracted from Nova Dashboard. Only Big Board is included: no homelab services, cameras, other sports apps, server credentials, or Nova navigation.

## Included

- Eight position groups: QB, RB, WR, EDGE, OL, DT, LB, and DB.
- Position-specific leader cards, sortable tables, search, and class/draft-year filters.
- Scouting and advanced-metric editing, baseline reset, and ESPN statistics sync.
- PPI / TOV and other derived metrics, recalculated using season game participation.
- Sync reporting that distinguishes verified records, changed records, and skipped players.
- Populated current and baseline datasets: 55 prospects each, including existing scouting notes and rankings.

## Run locally

Use Node.js 22 LTS, then:

```sh
npm ci
npm run dev
```

The repository includes the current Nova prospect snapshot and the original reset baseline, published with the owner's explicit permission. No separate data download is required.

Open http://localhost:3000. `/big-board` redirects to the standalone homepage.

```sh
npm test
npm run typecheck
npm run build
npm start
```

## Files

- `src/app/page.tsx`: prospect board and edit controls.
- `src/components/BigBoardHeader.tsx`: standalone navigation/header.
- `src/app/api/prospects/route.ts`: read, edit, reset, and sync API.
- `src/app/api/prospects/sync_espn.ts`: ESPN integration.
- `src/data/prospects.json`: current persisted prospect snapshot.
- `src/data/prospects_baseline.json`: original reset baseline.
- `tests/prospects-sync.test.cjs`: isolated sync regression checks.

## Hosting / Vercel handoff

This repository preserves the working Nova implementation. **It currently stores edits and sync results in local JSON files. Vercel's deployed application filesystem is not a durable writable database.** The app starts with the included 55-prospect snapshot. Production sync, edits, and reset need a persistent database/storage adapter before they will work reliably on Vercel. Writing to `/tmp` alone would not solve persistence.

Before enabling public writes, add authentication/authorization to the mutation endpoints. The extracted API retains the original trusted-local-network behavior and currently has no login. Do not expose edit/reset/sync endpoints publicly without protecting them.

A Vercel deployment is not created or configured by this repository. Vercel Hobby is intended for personal/non-commercial use and is subject to usage limits: https://vercel.com/docs/plans/hobby .

## ESPN data behavior

- The sync currently targets the **2026 season** explicitly; adjust `season` in `sync_espn.ts` for a future season.
- Only exact-season stats are accepted; old-season fallback is disabled.
- Games played comes from the matching-season athlete game log before per-game metrics are calculated.
- Missing/unsupported stats retain existing values, and skipped prospects show a reason.
- OL grades, pressures, snaps, coverage grades, and similar advanced scouting fields remain manually maintained when ESPN does not supply them.
- Player IDs and ESPN endpoint availability still need ongoing maintenance.
- A successful stats sync does not verify scouting notes or advanced metrics.
- Manual ranks and scouting edits are preserved by sync. Reset intentionally replaces the current data with the configured baseline.

## Scope

This is a separate codebase for future changes. Changes pushed here do not modify the live Nova dashboard automatically. No secrets or environment files are included.

## Handoff for continued development

Both datasets were copied from Nova on October 18, 2026. The current snapshot includes the repaired ESPN sync results; the baseline is intentionally the original reset snapshot. Existing scouting notes can describe earlier weeks and are not revalidated by sync. Before Vercel production use, replace file-based writes with durable storage and protect mutation endpoints, as described above. The live Nova deployment is maintained separately.

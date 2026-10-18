# Big Board

### College Football Position Tracker

Big Board follows college football players throughout the season, organizing them into position-specific boards that make it easy to compare production, track prospects, and see who is rising or falling.

The goal is a living board: after games finish, new statistics flow in, player metrics are recalculated, and rankings update to reflect how the season is unfolding.

## What you can do today

- Explore 55 players across eight position groups: **QB, RB, WR, EDGE, OL, DT, LB, and DB**.
- Compare position-specific statistics and category leaders in sortable tables.
- Find players by name or team and filter by class or draft-eligible year.
- Manually sync available 2026 season statistics from ESPN.
- Review derived metrics, including Passing Production Index (PPI) and Total Offensive Value (TOV) for quarterbacks.
- Maintain scouting notes, injury notes, and advanced metrics that need manual input.
- See which players were refreshed, which records changed, and why others were skipped during sync.

## Where Big Board is headed

### Automatic updates after games

Detect completed games and refresh the participating players' statistics without requiring a manual sync. Show when each record was last updated, retry delayed data, and distinguish pending results from completed updates.

### Position boards that evolve with the season

Recalculate rankings as fresh results arrive, using transparent, position-specific criteria. Track each player's previous rank and show movement up or down the board, with the performance changes behind that movement.

### A season-long view

Keep historical snapshots so a player's progression can be followed from week to week. Highlight breakout performances, sustained improvement, and changes in position-group leaders.

### Scouting context alongside the numbers

Combine updated production metrics with scouting notes and manually maintained advanced data. Keep editorial input distinct from automated rankings so both can inform player evaluation.

**These are planned capabilities.** The current app supports manual stats sync and table sorting; it does not yet schedule postgame updates, automatically rerank prospects, or store ranking history. Displayed ranks currently come from saved rank values. Sorting a table changes the view, not those saved ranks. The ranking method still needs to be defined and implemented.

## Data and metrics

The repository includes a populated 55-player snapshot and a separate baseline used by the reset feature. The current sync targets the **2026 college football season**, accepts only matching-season statistics, and uses game participation to calculate per-game metrics.

Data coverage varies by player and position. Missing or unsupported values retain their existing data rather than being treated as confirmed zeroes. Offensive-line grades and other advanced scouting fields remain manually maintained where the source does not provide them. Player identifiers and source availability may require maintenance.

Scouting notes and baseline values are snapshots, not live reporting; refreshing statistics does not independently verify every note or advanced metric. Reset replaces the current records with the baseline snapshot.

## Run locally

Requires **Node.js 22 LTS**.

```sh
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). The included dataset populates the board immediately.

```sh
npm test
npm run typecheck
npm run build
npm start
```

## Development

Built with **Next.js, React, TypeScript, and Tailwind CSS**.

| Area | Location |
| --- | --- |
| Position boards, filters, and editing | `src/app/page.tsx` |
| App header | `src/components/BigBoardHeader.tsx` |
| Prospect API | `src/app/api/prospects/route.ts` |
| ESPN statistics sync | `src/app/api/prospects/sync_espn.ts` |
| Current player data | `src/data/prospects.json` |
| Reset baseline | `src/data/prospects_baseline.json` |
| Sync regression tests | `tests/prospects-sync.test.cjs` |

## Deployment status

The current implementation saves changes to local JSON files. A Vercel deployment needs durable storage for sync results, edits, and future ranking history. Public write operations also need authentication and authorization; the current API does not include a login.

Postgame scheduling, persistent storage, access controls, and the ranking engine are the next infrastructure and product steps toward a fully automatic season-long tracker.

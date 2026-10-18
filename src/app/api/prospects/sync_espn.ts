import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src', 'data', 'prospects.json');

function cleanNumber(val: any): number {
  if (val === undefined || val === null || val === '') return 0;
  if (typeof val === 'number') return val;
  const str = String(val).replace(/,/g, '').trim();
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

function calculateQBMerics(
  games: number,
  pass_yds: number,
  pass_td: number,
  ints: number,
  comp_pct: number,
  rush_yds: number,
  rush_td: number
) {
  const g = games > 0 ? games : 1;
  const total_td = pass_td + rush_td;
  const ppi = ((pass_yds / g) * 0.15) + ((pass_td / g) * 12.0) - ((ints / g) * 10.0) + ((comp_pct - 50.0) * 1.2);
  const tov = ppi + ((rush_yds / g) * 0.25) + ((rush_td / g) * 10.0);
  return {
    total_td,
    ppi: Math.round(ppi * 10) / 10,
    tov: Math.round(tov * 10) / 10,
  };
}

let runningSync: Promise<any> | null = null;
export function syncFromESPN(): Promise<any> {
  if (runningSync) return runningSync;
  runningSync = runSync().finally(() => { runningSync = null; });
  return runningSync;
}

async function runSync() {
  if (!fs.existsSync(DATA_FILE)) {
    throw new Error('prospects.json does not exist');
  }

  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  const prospects = JSON.parse(raw);

  let updatedCount = 0;
  let changedCount = 0;
  const skipped: { name: string; reason: string }[] = [];
  const patches = new Map<number, any>();
  const season = 2026;

  for (const p of prospects) {
    if (!p.espn_id || p.position_group === 'OL') {
      skipped.push({ name: p.name, reason: p.position_group === 'OL' ? 'Offensive line grades require manual entry; ESPN does not provide them.' : 'Missing ESPN player ID.' });
      continue;
    }
    const before = { ...p };

    try {
      const url = `https://site.web.api.espn.com/apis/common/v3/sports/football/college-football/athletes/${p.espn_id}/stats`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        cache: 'no-store', signal: AbortSignal.timeout(12000)
      });

      if (!res.ok) {
        skipped.push({ name: p.name, reason: `ESPN returned HTTP ${res.status}; check player ID ${p.espn_id}.` });
        continue;
      }

      const data = await res.json();
      const categories = data.categories || [];

      // Extract stats for 2026 season or latest season available
      const statsByCategory: Record<string, Record<string, string>> = {};

      for (const cat of categories) {
        const catName = cat.name;
        const names: string[] = cat.names || [];
        const statEntries: any[] = cat.statistics || [];

        // Find 2026 season entry, or take latest
        const targetEntry = statEntries.find((s: any) => Number(s.season?.year) === season);

        if (targetEntry && targetEntry.stats) {
          const dict: Record<string, string> = {};
          targetEntry.stats.forEach((val: string, idx: number) => {
            if (idx < names.length) {
              if (val !== null && val !== undefined && String(val).trim() !== '' && String(val).trim() !== '-' && Number.isFinite(Number(String(val).replace(/,/g, '')))) dict[names[idx]] = val;
            }
          });
          statsByCategory[catName] = dict;
        }
      }

      const passStats = statsByCategory['passing'] || {};
      const rushStats = statsByCategory['rushing'] || {};
      const recStats = statsByCategory['receiving'] || {};
      const defStats = statsByCategory['defensive'] || {};

      const posGroup = p.position_group;
      const primary = posGroup === 'QB' ? passStats : posGroup === 'RB' ? rushStats : posGroup === 'WR' ? recStats : defStats;
      if (!Object.keys(primary).length) {
        skipped.push({ name: p.name, reason: `No usable ${season} ${posGroup} statistics from ESPN.` });
        continue;
      }
      // Season totals and participation must refer to the same season.
      const logRes = await fetch(`https://site.web.api.espn.com/apis/common/v3/sports/football/college-football/athletes/${p.espn_id}/gamelog?season=${season}`, { cache: 'no-store', signal: AbortSignal.timeout(12000) });
      if (!logRes.ok) throw new Error(`Game log returned HTTP ${logRes.status}`);
      const log = await logRes.json();
      if (!log.filters?.some((f: any) => f.name === 'season' && Number(f.value) === season)) throw new Error('ESPN game log did not confirm the requested season');
      const eventIds = new Set<string>();
      for (const type of log.seasonTypes || []) {
        for (const category of type.categories || []) {
          if (category.type !== 'event') continue;
          for (const event of category.events || []) {
            if (event.eventId && event.stats?.some((v: any) => v !== '-' && v !== null && v !== '')) eventIds.add(String(event.eventId));
          }
        }
      }
      if (!eventIds.size) throw new Error('No season game participation found; existing data preserved');
      p.games = eventIds.size;


      if (posGroup === 'QB') {
        if (Object.keys(passStats).length > 0) {
          p.pass_yds = cleanNumber(passStats['passingYards'] ?? p.pass_yds);
          p.pass_td = cleanNumber(passStats['passingTouchdowns'] ?? p.pass_td);
          p.interceptions_thrown = cleanNumber(passStats['interceptions'] ?? p.interceptions_thrown);
          p.comp_pct = cleanNumber(passStats['completionPct'] ?? p.comp_pct);
        }
        if (Object.keys(rushStats).length > 0) {
          p.rush_yds = cleanNumber(rushStats['rushingYards'] ?? p.rush_yds);
          p.rush_td = cleanNumber(rushStats['rushingTouchdowns'] ?? p.rush_td);
        }

        const calc = calculateQBMerics(
          p.games || 1,
          p.pass_yds,
          p.pass_td,
          p.interceptions_thrown,
          p.comp_pct,
          p.rush_yds,
          p.rush_td
        );
        p.ppi = calc.ppi;
        p.tov = calc.tov;
        p.total_td = calc.total_td;
        updatedCount++;
      } else if (posGroup === 'RB') {
        if (Object.keys(rushStats).length > 0) {
          p.rush_yds = cleanNumber(rushStats['rushingYards'] ?? p.rush_yds);
          p.rush_att = cleanNumber(rushStats['rushingAttempts'] ?? p.rush_att);
          p.rush_td = cleanNumber(rushStats['rushingTouchdowns'] ?? p.rush_td);
          p.ypc = p.rush_att > 0 ? Math.round((p.rush_yds / p.rush_att) * 10) / 10 : p.ypc;
        }
        if (Object.keys(recStats).length > 0) {
          p.rec_yds = cleanNumber(recStats['receivingYards'] ?? p.rec_yds);
          p.rec_td = cleanNumber(recStats['receivingTouchdowns'] ?? p.rec_td);
        }
        p.total_td = p.rush_td + (p.rec_td || 0);
        p.scrimmage_yds = p.rush_yds + p.rec_yds;
        updatedCount++;
      } else if (posGroup === 'WR') {
        if (Object.keys(recStats).length > 0) {
          p.receptions = cleanNumber(recStats['receptions'] ?? p.receptions);
          p.rec_yds = cleanNumber(recStats['receivingYards'] ?? p.rec_yds);
          p.rec_td = cleanNumber(recStats['receivingTouchdowns'] ?? p.rec_td);
          p.rec_td = cleanNumber(recStats['receivingTouchdowns'] ?? p.rec_td);
          p.ypr = p.receptions > 0 ? Math.round((p.rec_yds / p.receptions) * 10) / 10 : p.ypr;
          p.yds_per_game = (p.games || 1) > 0 ? Math.round((p.rec_yds / (p.games || 1)) * 10) / 10 : p.yds_per_game;
          p.total_td = p.rec_td;
          p.scrimmage_yds = p.rec_yds;
        }
        updatedCount++;
      } else if (['EDGE', 'DT', 'LB', 'DB'].includes(posGroup)) {
        if (Object.keys(defStats).length > 0) {
          p.total_tackles = cleanNumber(defStats['totalTackles'] ?? p.total_tackles);
          p.solo_tackles = cleanNumber(defStats['soloTackles'] ?? p.solo_tackles);
          p.ast_tackles = cleanNumber(defStats['assistTackles'] ?? Math.max(0, p.total_tackles - p.solo_tackles));
          p.sacks = cleanNumber(defStats['sacks'] ?? p.sacks);
          p.tfl = cleanNumber(defStats['tacklesForLoss'] ?? p.tfl);
          p.pbu = cleanNumber(defStats['passesDefended'] ?? p.pbu);
          p.forced_fumbles = cleanNumber(defStats['fumblesForced'] ?? p.forced_fumbles);
          p.def_interceptions = cleanNumber(defStats['interceptions'] ?? p.def_interceptions);
          p.turnovers_caused = (p.forced_fumbles || 0) + (p.def_interceptions || 0);
        }
        updatedCount++;
      }

      const patch: Record<string, any> = {};
      for (const key of Object.keys(p)) if (p[key] !== before[key]) patch[key] = p[key];
      if (Object.keys(patch).length) changedCount++;
      patch.last_updated = new Date().toISOString();
      patch.stats_season = season;
      patches.set(p.id, patch);
    } catch (err) {
      skipped.push({ name: p.name, reason: err instanceof Error ? err.message : 'ESPN request failed' });
    }
  }

  // Merge only fetched fields into the latest file so concurrent scouting edits survive.
  const latest = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  for (const p of latest) Object.assign(p, patches.get(p.id) || {});
  const tempFile = `${DATA_FILE}.sync.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(latest, null, 2), 'utf-8');
  fs.renameSync(tempFile, DATA_FILE);

  return {
    status: updatedCount ? 'success' : 'error',
    updated: updatedCount, changed: changedCount, skipped, season,
    message: `${season} ESPN stats: ${updatedCount} verified, ${changedCount} changed, ${skipped.length} skipped. Scouting notes and unsupported advanced metrics are preserved.`
  };
}

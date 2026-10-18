import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { syncFromESPN } from './sync_espn';

const DATA_FILE = path.join(process.cwd(), 'src', 'data', 'prospects.json');
const BASELINE_FILE = path.join(process.cwd(), 'src', 'data', 'prospects_baseline.json');

function getProspects(): any[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading prospects.json:', err);
  }
  return [];
}

function saveProspects(data: any[]) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function calculateQBMerics(games: number, pass_yds: number, pass_td: number, ints: number, comp_pct: number, rush_yds: number, rush_td: number) {
  if (games <= 0) return { total_td: pass_td + rush_td, ppi: 0.0, tov: 0.0 };
  const total_td = pass_td + rush_td;
  const ppi = ((pass_yds / games) * 0.15) + ((pass_td / games) * 12.0) - ((ints / games) * 10.0) + ((comp_pct - 50.0) * 1.2);
  const tov = ppi + ((rush_yds / games) * 0.25) + ((rush_td / games) * 10.0);
  return {
    total_td,
    ppi: Math.round(ppi * 10) / 10,
    tov: Math.round(tov * 10) / 10,
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const position_group = searchParams.get('position_group');

  let prospects = getProspects();
  if (position_group) {
    prospects = prospects.filter(p => p.position_group?.toUpperCase() === position_group.toUpperCase());
  }

  return NextResponse.json(prospects);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action || 'edit';

    if (action === 'reseed') {
      if (fs.existsSync(BASELINE_FILE)) {
        const baseline = fs.readFileSync(BASELINE_FILE, 'utf-8');
        fs.writeFileSync(DATA_FILE, baseline, 'utf-8');
        return NextResponse.json({ status: 'success', message: 'Big Board reset to verified Week 7 baseline.' });
      }
      return NextResponse.json({ status: 'error', message: 'Baseline file not found.' }, { status: 500 });
    }

    if (action === 'sync') {
      try {
        const result = await syncFromESPN();
        return NextResponse.json(result);
      } catch (err: any) {
        return NextResponse.json({ status: 'error', message: err.message }, { status: 500 });
      }
    }

    if (action === 'edit') {
      const { id, updates } = body;
      if (!id || !updates) {
        return NextResponse.json({ status: 'error', message: 'Missing id or updates' }, { status: 400 });
      }

      let prospects = getProspects();
      const index = prospects.findIndex(p => p.id === id);
      if (index === -1) {
        return NextResponse.json({ status: 'error', message: 'Prospect not found' }, { status: 404 });
      }

      const p = prospects[index];
      Object.assign(p, updates);

      // Recalculate metrics if relevant fields changed
      if (p.position_group === 'QB') {
        const calc = calculateQBMerics(
          p.games || 1,
          p.pass_yds || 0,
          p.pass_td || 0,
          p.interceptions_thrown || 0,
          p.comp_pct || 0.0,
          p.rush_yds || 0,
          p.rush_td || 0
        );
        p.ppi = calc.ppi;
        p.tov = calc.tov;
        p.total_td = calc.total_td;
      } else if (p.position_group === 'RB') {
        p.ypc = (p.rush_att || 0) > 0 ? Math.round(((p.rush_yds || 0) / p.rush_att) * 10) / 10 : 0.0;
        p.total_td = (p.rush_td || 0) + (p.rec_td || 0);
        p.scrimmage_yds = (p.rush_yds || 0) + (p.rec_yds || 0);
      } else if (p.position_group === 'WR') {
        p.ypr = (p.receptions || 0) > 0 ? Math.round(((p.rec_yds || 0) / p.receptions) * 10) / 10 : 0.0;
        p.yds_per_game = (p.games || 0) > 0 ? Math.round(((p.rec_yds || 0) / p.games) * 10) / 10 : 0.0;
      }

      p.last_updated = new Date().toISOString();
      prospects[index] = p;
      saveProspects(prospects);

      return NextResponse.json({ status: 'success', prospect: p });
    }

    return NextResponse.json({ status: 'error', message: `Unknown action: ${action}` }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ status: 'error', message: err.message }, { status: 500 });
  }
}

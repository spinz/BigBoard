'use client';

import React, { useState, useEffect, useMemo } from 'react';
import BigBoardHeader from '@/components/BigBoardHeader';
import {
  TrendingUp,
  RefreshCw,
  Search,
  SlidersHorizontal,
  X,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  Trophy,
  Sparkles,
  Award,
  AlertCircle,
  FileSpreadsheet,
  CheckCircle2
} from 'lucide-react';

type PositionGroup = 'QB' | 'RB' | 'WR' | 'EDGE' | 'OL' | 'DT' | 'LB' | 'DB';

interface ColumnDef {
  key: string;
  label: string;
  sortable?: boolean;
  highlight?: boolean;
  format?: (val: any) => string;
}

const TAB_CONFIGS: Record<PositionGroup, { name: string; columns: ColumnDef[] }> = {
  QB: {
    name: 'QB Prospects',
    columns: [
      { key: 'rank_override', label: 'Rank', sortable: true },
      { key: 'name', label: 'Player', sortable: true },
      { key: 'team', label: 'Team', sortable: true },
      { key: 'class_year', label: 'Class', sortable: true },
      { key: 'games', label: 'GP', sortable: true },
      { key: 'pass_yds', label: 'Pass Yds', sortable: true },
      { key: 'pass_td', label: 'Pass TD', sortable: true },
      { key: 'interceptions_thrown', label: 'INT', sortable: true },
      { key: 'comp_pct', label: 'Comp %', sortable: true, format: v => v ? `${v}%` : '0%' },
      { key: 'rush_yds', label: 'Rush Yds', sortable: true },
      { key: 'rush_td', label: 'Rush TD', sortable: true },
      { key: 'total_td', label: 'Total TD', sortable: true },
      { key: 'ppi', label: 'PPI', sortable: true, highlight: true },
      { key: 'tov', label: 'TOV', sortable: true, highlight: true },
      { key: 'audit_note', label: '2026 Audit / Scouting Note' }
    ]
  },
  RB: {
    name: 'RB Prospects',
    columns: [
      { key: 'rank_override', label: 'Rank', sortable: true },
      { key: 'name', label: 'Player', sortable: true },
      { key: 'team', label: 'Team', sortable: true },
      { key: 'class_year', label: 'Class', sortable: true },
      { key: 'games', label: 'GP', sortable: true },
      { key: 'rush_yds', label: 'Rush Yds', sortable: true },
      { key: 'rush_att', label: 'Att', sortable: true },
      { key: 'ypc', label: 'YPC', sortable: true, format: v => v ? Number(v).toFixed(1) : '0.0', highlight: true },
      { key: 'rush_td', label: 'Rush TD', sortable: true },
      { key: 'rec_yds', label: 'Rec Yds', sortable: true },
      { key: 'total_td', label: 'Total TD', sortable: true, highlight: true },
      { key: 'scrimmage_yds', label: 'Scrimmage Yds', sortable: true, highlight: true },
      { key: 'audit_note', label: '2026 Audit / Scouting Note' }
    ]
  },
  WR: {
    name: 'WR Prospects',
    columns: [
      { key: 'rank_override', label: 'Rank', sortable: true },
      { key: 'name', label: 'Player', sortable: true },
      { key: 'team', label: 'Team', sortable: true },
      { key: 'class_year', label: 'Class', sortable: true },
      { key: 'games', label: 'GP', sortable: true },
      { key: 'receptions', label: 'Rec', sortable: true },
      { key: 'rec_yds', label: 'Rec Yds', sortable: true },
      { key: 'ypr', label: 'YPR', sortable: true, format: v => v ? Number(v).toFixed(1) : '0.0', highlight: true },
      { key: 'targets', label: 'Targets', sortable: true },
      { key: 'rec_td', label: 'Rec TD', sortable: true, highlight: true },
      { key: 'yds_per_game', label: 'Yds/G', sortable: true, format: v => v ? Number(v).toFixed(1) : '0.0', highlight: true },
      { key: 'audit_note', label: '2026 Audit / Scouting Note' }
    ]
  },
  EDGE: {
    name: 'EDGE Prospects',
    columns: [
      { key: 'rank_override', label: 'Rank', sortable: true },
      { key: 'name', label: 'Player', sortable: true },
      { key: 'team', label: 'Team', sortable: true },
      { key: 'class_year', label: 'Class', sortable: true },
      { key: 'games', label: 'GP', sortable: true },
      { key: 'solo_tackles', label: 'Solo', sortable: true },
      { key: 'ast_tackles', label: 'Ast', sortable: true },
      { key: 'total_tackles', label: 'Tot', sortable: true },
      { key: 'tfl', label: 'TFL', sortable: true, format: v => v ? Number(v).toFixed(1) : '0.0', highlight: true },
      { key: 'sacks', label: 'Sacks', sortable: true, format: v => v ? Number(v).toFixed(1) : '0.0', highlight: true },
      { key: 'forced_fumbles', label: 'FF', sortable: true },
      { key: 'turnovers_caused', label: 'TO Caused', sortable: true, highlight: true },
      { key: 'audit_note', label: '2026 Audit / Scouting Note' }
    ]
  },
  OL: {
    name: 'OL Prospects',
    columns: [
      { key: 'rank_override', label: 'Rank', sortable: true },
      { key: 'name', label: 'Player', sortable: true },
      { key: 'team', label: 'Team', sortable: true },
      { key: 'specific_pos', label: 'Pos', sortable: true },
      { key: 'class_year', label: 'Class', sortable: true },
      { key: 'games', label: 'GP', sortable: true },
      { key: 'snaps', label: 'Snaps', sortable: true, highlight: true },
      { key: 'sacks_allowed', label: 'Sacks All', sortable: true },
      { key: 'pressures', label: 'Pressures', sortable: true },
      { key: 'pass_blk_pct', label: 'Pass Blk %', sortable: true, format: v => v ? `${v}%` : '0%', highlight: true },
      { key: 'audit_note', label: 'PFF & Scouting Notes' }
    ]
  },
  DT: {
    name: 'DT Prospects',
    columns: [
      { key: 'rank_override', label: 'Rank', sortable: true },
      { key: 'name', label: 'Player', sortable: true },
      { key: 'team', label: 'Team', sortable: true },
      { key: 'class_year', label: 'Class', sortable: true },
      { key: 'games', label: 'GP', sortable: true },
      { key: 'total_tackles', label: 'Tackles', sortable: true },
      { key: 'tfl', label: 'TFL', sortable: true, format: v => v ? Number(v).toFixed(1) : '0.0' },
      { key: 'sacks', label: 'Sacks', sortable: true, format: v => v ? Number(v).toFixed(1) : '0.0' },
      { key: 'pressures', label: 'Pressures', sortable: true, highlight: true },
      { key: 'run_stops', label: 'Run Stops', sortable: true, highlight: true },
      { key: 'havoc_plays', label: 'Havoc Plays', sortable: true, format: v => v ? Number(v).toFixed(1) : '0.0', highlight: true },
      { key: 'audit_note', label: 'Scouting / Audit Note' }
    ]
  },
  LB: {
    name: 'LB Prospects',
    columns: [
      { key: 'rank_override', label: 'Rank', sortable: true },
      { key: 'name', label: 'Player', sortable: true },
      { key: 'team', label: 'Team', sortable: true },
      { key: 'class_year', label: 'Class', sortable: true },
      { key: 'games', label: 'GP', sortable: true },
      { key: 'solo_tackles', label: 'Solo', sortable: true },
      { key: 'ast_tackles', label: 'Ast', sortable: true },
      { key: 'total_tackles', label: 'Tot', sortable: true, highlight: true },
      { key: 'tfl', label: 'TFL', sortable: true, format: v => v ? Number(v).toFixed(1) : '0.0', highlight: true },
      { key: 'sacks', label: 'Sacks', sortable: true, format: v => v ? Number(v).toFixed(1) : '0.0', highlight: true },
      { key: 'forced_fumbles', label: 'FF', sortable: true },
      { key: 'turnovers_caused', label: 'TO Caused', sortable: true, highlight: true },
      { key: 'audit_note', label: '2026 Audit / Transfer Note' }
    ]
  },
  DB: {
    name: 'DB Prospects',
    columns: [
      { key: 'rank_override', label: 'Rank', sortable: true },
      { key: 'name', label: 'Player', sortable: true },
      { key: 'team', label: 'Team', sortable: true },
      { key: 'specific_pos', label: 'Pos', sortable: true },
      { key: 'class_year', label: 'Class', sortable: true },
      { key: 'games', label: 'GP', sortable: true },
      { key: 'def_interceptions', label: 'INT', sortable: true, highlight: true },
      { key: 'pbu', label: 'PBU', sortable: true, highlight: true },
      { key: 'total_tackles', label: 'Tackles', sortable: true },
      { key: 'cov_targets', label: 'Targets', sortable: true },
      { key: 'passer_rating_allowed', label: 'Rating Allowed', sortable: true, format: v => v ? Number(v).toFixed(1) : '0.0', highlight: true },
      { key: 'audit_note', label: 'Scouting / Audit Note' }
    ]
  }
};

export default function BigBoardPage() {
  const [activeTab, setActiveTab] = useState<PositionGroup>('QB');
  const [prospects, setProspects] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sortField, setSortField] = useState<string>('rank_override');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [classFilter, setClassFilter] = useState<string>('');
  const [draftFilter, setDraftFilter] = useState<string>('');

  // Modal State
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  // Sync / Toast state
  const [syncReport, setSyncReport] = useState<any>(null);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [toast, setToast] = useState<{ title: string; desc: string; icon?: string } | null>(null);

  const showToast = (title: string, desc: string, icon = '✨') => {
    setToast({ title, desc, icon });
    setTimeout(() => setToast(null), 4000);
  };

  const loadProspects = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/prospects');
      if (res.ok) {
        const data = await res.json();
        setProspects(data);
      }
    } catch (err: any) {
      showToast('Error', 'Failed to load prospects: ' + err.message, '⚠️');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProspects();
  }, []);

  const tabProspects = useMemo(() => {
    return prospects.filter(p => p.position_group === activeTab);
  }, [prospects, activeTab]);

  // Compute 4 Hero Cards for current Tab
  const heroCards = useMemo(() => {
    if (!tabProspects.length) return [];

    if (activeTab === 'QB') {
      const passLdr = [...tabProspects].sort((a, b) => b.pass_yds - a.pass_yds)[0];
      const ppiLdr = [...tabProspects].sort((a, b) => b.ppi - a.ppi)[0];
      const tovLdr = [...tabProspects].sort((a, b) => b.tov - a.tov)[0];
      const topRank = tabProspects[0];
      return [
        { title: 'Passing Yards Leader', name: passLdr.name, team: passLdr.team, label: 'Pass Yds', value: `${passLdr.pass_yds.toLocaleString()} Yds (${passLdr.pass_td} TD)` },
        { title: 'Top Ranked Prospect', name: topRank.name, team: topRank.team, label: 'Draft Class', value: `Rank #${topRank.rank_override} (${topRank.class_year})` },
        { title: 'Passing Production (PPI)', name: ppiLdr.name, team: ppiLdr.team, label: 'PPI Score', value: `${ppiLdr.ppi}` },
        { title: 'Total Offensive Value (TOV)', name: tovLdr.name, team: tovLdr.team, label: 'TOV Score', value: `${tovLdr.tov}` },
      ];
    } else if (activeTab === 'RB') {
      const rushLdr = [...tabProspects].sort((a, b) => b.rush_yds - a.rush_yds)[0];
      const ypcLdr = [...tabProspects].sort((a, b) => b.ypc - a.ypc)[0];
      const tdLdr = [...tabProspects].sort((a, b) => b.total_td - a.total_td)[0];
      const scrimLdr = [...tabProspects].sort((a, b) => b.scrimmage_yds - a.scrimmage_yds)[0];
      return [
        { title: 'Rushing Yards Leader', name: rushLdr.name, team: rushLdr.team, label: 'Rush Yds', value: `${rushLdr.rush_yds.toLocaleString()} Yds (${rushLdr.rush_td} TD)` },
        { title: 'Efficiency Leader (YPC)', name: ypcLdr.name, team: ypcLdr.team, label: 'Yards / Carry', value: `${ypcLdr.ypc} YPC` },
        { title: 'Total Touchdown Leader', name: tdLdr.name, team: tdLdr.team, label: 'Total TDs', value: `${tdLdr.total_td} Total TDs` },
        { title: 'All-Purpose Scrimmage', name: scrimLdr.name, team: scrimLdr.team, label: 'Scrimmage Yds', value: `${scrimLdr.scrimmage_yds.toLocaleString()} Yds` },
      ];
    } else if (activeTab === 'WR') {
      const ydsLdr = [...tabProspects].sort((a, b) => b.rec_yds - a.rec_yds)[0];
      const recLdr = [...tabProspects].sort((a, b) => b.receptions - a.receptions)[0];
      const yprLdr = [...tabProspects].sort((a, b) => b.ypr - a.ypr)[0];
      const tdLdr = [...tabProspects].sort((a, b) => b.rec_td - a.rec_td)[0];
      return [
        { title: 'Receiving Yards Leader', name: ydsLdr.name, team: ydsLdr.team, label: 'Rec Yds', value: `${ydsLdr.rec_yds.toLocaleString()} Yds (${ydsLdr.yds_per_game} Y/G)` },
        { title: 'Target Machine (Receptions)', name: recLdr.name, team: recLdr.team, label: 'Receptions', value: `${recLdr.receptions} Rec (${recLdr.targets} Targets)` },
        { title: 'Big Play Deep Threat (YPR)', name: yprLdr.name, team: yprLdr.team, label: 'Yards / Catch', value: `${yprLdr.ypr} YPR` },
        { title: 'Touchdown Leader', name: tdLdr.name, team: tdLdr.team, label: 'Receiving TDs', value: `${tdLdr.rec_td} TDs` },
      ];
    } else if (activeTab === 'EDGE') {
      const sacksLdr = [...tabProspects].sort((a, b) => b.sacks - a.sacks)[0];
      const tflLdr = [...tabProspects].sort((a, b) => b.tfl - a.tfl)[0];
      const tackLdr = [...tabProspects].sort((a, b) => b.total_tackles - a.total_tackles)[0];
      const toLdr = [...tabProspects].sort((a, b) => b.turnovers_caused - a.turnovers_caused)[0];
      return [
        { title: 'Sacks Leader', name: sacksLdr.name, team: sacksLdr.team, label: 'Sacks', value: `${sacksLdr.sacks} Sacks` },
        { title: 'Tackles For Loss Leader', name: tflLdr.name, team: tflLdr.team, label: 'TFL', value: `${tflLdr.tfl} TFL` },
        { title: 'Total Tackles', name: tackLdr.name, team: tackLdr.team, label: 'Tackles', value: `${tackLdr.total_tackles} Tackles (${tackLdr.solo_tackles} Solo)` },
        { title: 'Havoc & Turnover Creator', name: toLdr.name, team: toLdr.team, label: 'Turnovers Caused', value: `${toLdr.turnovers_caused} TOs (${toLdr.forced_fumbles} FF)` },
      ];
    } else if (activeTab === 'OL') {
      const blkLdr = [...tabProspects].sort((a, b) => b.pass_blk_pct - a.pass_blk_pct)[0];
      const snapLdr = [...tabProspects].sort((a, b) => b.snaps - a.snaps)[0];
      const zeroSack = tabProspects.filter(p => p.sacks_allowed === 0).sort((a, b) => b.snaps - a.snaps)[0] || tabProspects[0];
      const pressLdr = [...tabProspects].sort((a, b) => a.pressures - b.pressures)[0];
      return [
        { title: 'Pass Block Efficiency', name: blkLdr.name, team: blkLdr.team, label: 'Pass Blk %', value: `${blkLdr.pass_blk_pct}%` },
        { title: 'Sack-Free Anchor', name: zeroSack.name, team: zeroSack.team, label: 'Snaps (0 Sacks)', value: `${zeroSack.snaps} Snaps` },
        { title: 'Ironman Snaps Leader', name: snapLdr.name, team: snapLdr.team, label: 'Total Snaps', value: `${snapLdr.snaps} Snaps` },
        { title: 'Lowest Pressures Allowed', name: pressLdr.name, team: pressLdr.team, label: 'Pressures', value: `${pressLdr.pressures} Pressures` },
      ];
    } else if (activeTab === 'DT') {
      const havocLdr = [...tabProspects].sort((a, b) => b.havoc_plays - a.havoc_plays)[0];
      const pressLdr = [...tabProspects].sort((a, b) => b.pressures - a.pressures)[0];
      const runLdr = [...tabProspects].sort((a, b) => b.run_stops - a.run_stops)[0];
      const sackLdr = [...tabProspects].sort((a, b) => b.sacks - a.sacks)[0];
      return [
        { title: 'Havoc Index Leader', name: havocLdr.name, team: havocLdr.team, label: 'Havoc Plays', value: `${havocLdr.havoc_plays} Havoc` },
        { title: 'Interior Pressure Leader', name: pressLdr.name, team: pressLdr.team, label: 'Pressures', value: `${pressLdr.pressures} Pressures` },
        { title: 'Run Defense Wall', name: runLdr.name, team: runLdr.team, label: 'Run Stops', value: `${runLdr.run_stops} Run Stops` },
        { title: 'Interior Sacks Leader', name: sackLdr.name, team: sackLdr.team, label: 'Sacks', value: `${sackLdr.sacks} Sacks (${sackLdr.tfl} TFL)` },
      ];
    } else if (activeTab === 'LB') {
      const tackLdr = [...tabProspects].sort((a, b) => b.total_tackles - a.total_tackles)[0];
      const tflLdr = [...tabProspects].sort((a, b) => b.tfl - a.tfl)[0];
      const sackLdr = [...tabProspects].sort((a, b) => b.sacks - a.sacks)[0];
      const toLdr = [...tabProspects].sort((a, b) => b.turnovers_caused - a.turnovers_caused)[0];
      return [
        { title: 'Tackles Machine', name: tackLdr.name, team: tackLdr.team, label: 'Total Tackles', value: `${tackLdr.total_tackles} Tackles (${tackLdr.solo_tackles} Solo)` },
        { title: 'Backfield Penetration', name: tflLdr.name, team: tflLdr.team, label: 'TFL', value: `${tflLdr.tfl} TFL` },
        { title: 'Blitz / Sacks Leader', name: sackLdr.name, team: sackLdr.team, label: 'Sacks', value: `${sackLdr.sacks} Sacks` },
        { title: 'Turnover Creator', name: toLdr.name, team: toLdr.team, label: 'Turnovers Caused', value: `${toLdr.turnovers_caused} TOs` },
      ];
    } else if (activeTab === 'DB') {
      const rtgLdr = [...tabProspects].sort((a, b) => a.passer_rating_allowed - b.passer_rating_allowed)[0];
      const intLdr = [...tabProspects].sort((a, b) => b.def_interceptions - a.def_interceptions)[0];
      const pbuLdr = [...tabProspects].sort((a, b) => b.pbu - a.pbu)[0];
      const tackLdr = [...tabProspects].sort((a, b) => b.total_tackles - a.total_tackles)[0];
      return [
        { title: 'Lockdown Passer Rating', name: rtgLdr.name, team: rtgLdr.team, label: 'Rating Allowed', value: `${rtgLdr.passer_rating_allowed} RTG` },
        { title: 'Ball Hawk (INTs)', name: intLdr.name, team: intLdr.team, label: 'Interceptions', value: `${intLdr.def_interceptions} INT` },
        { title: 'Coverage PD / PBU', name: pbuLdr.name, team: pbuLdr.team, label: 'Pass Breakups', value: `${pbuLdr.pbu} PBU` },
        { title: 'Secondary Tackler', name: tackLdr.name, team: tackLdr.team, label: 'Tackles', value: `${tackLdr.total_tackles} Tackles` },
      ];
    }
    return [];
  }, [tabProspects, activeTab]);

  // Filter & Sort table data
  const filteredAndSorted = useMemo(() => {
    let list = tabProspects.filter(p => {
      const q = searchQuery.toLowerCase().trim();
      const matchQ = !q || p.name.toLowerCase().includes(q) || p.team.toLowerCase().includes(q) || (p.audit_note && p.audit_note.toLowerCase().includes(q));
      const matchClass = !classFilter || p.class_year === classFilter;
      const matchDraft = !draftFilter || String(p.draft_eligible_year) === draftFilter;
      return matchQ && matchClass && matchDraft;
    });

    list.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (valA === undefined || valA === null) valA = 0;
      if (valB === undefined || valB === null) valB = 0;

      if (typeof valA === 'string') {
        return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortDirection === 'asc' ? valA - valB : valB - valA;
    });

    return list;
  }, [tabProspects, searchQuery, classFilter, draftFilter, sortField, sortDirection]);

  const handleSort = (key: string) => {
    if (sortField === key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(key);
      setSortDirection('desc');
    }
  };

  const handleOpenEdit = (player: any) => {
    setSelectedPlayer(player);
    setFormData({
      games: player.games || 0,
      snaps: player.snaps || 0,
      pressures: player.pressures || 0,
      sacks_allowed: player.sacks_allowed || 0,
      pass_blk_pct: player.pass_blk_pct || 0.0,
      run_stops: player.run_stops || 0,
      havoc_plays: player.havoc_plays || 0.0,
      cov_targets: player.cov_targets || 0,
      passer_rating_allowed: player.passer_rating_allowed || 0.0,
      injury_note: player.injury_note || '',
      audit_note: player.audit_note || ''
    });
    setModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayer) return;

    try {
      const res = await fetch('/api/prospects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'edit',
          id: selectedPlayer.id,
          updates: {
            ...formData,
            games: Number(formData.games) || 0,
            snaps: Number(formData.snaps) || 0,
            pressures: Number(formData.pressures) || 0,
            sacks_allowed: Number(formData.sacks_allowed) || 0,
            pass_blk_pct: Number(formData.pass_blk_pct) || 0.0,
            run_stops: Number(formData.run_stops) || 0,
            havoc_plays: Number(formData.havoc_plays) || 0.0,
            cov_targets: Number(formData.cov_targets) || 0,
            passer_rating_allowed: Number(formData.passer_rating_allowed) || 0.0,
            injury_note: formData.injury_note?.trim() || null,
            audit_note: formData.audit_note?.trim() || null
          }
        })
      });

      if (res.ok) {
        showToast('Saved', `Updated ${selectedPlayer.name} successfully.`, '✅');
        setModalOpen(false);
        loadProspects();
      } else {
        const err = await res.json();
        showToast('Error', err.message || 'Update failed', '⚠️');
      }
    } catch (err: any) {
      showToast('Error', err.message, '⚠️');
    }
  };

  const handleSyncStats = async () => {
    try {
      setSyncing(true);
      const res = await fetch('/api/prospects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync' })
      });
      const data = await res.json();
      setSyncReport(data);
      if (res.ok && data.status === 'success') {
        showToast('ESPN Sync Complete', data.message || `Updated ${data.updated} prospects from ESPN.`, '⚡');
        loadProspects();
      } else {
        showToast('Sync Notice', data.message || 'Sync failed.', '⚠️');
      }
    } catch (err: any) {
      showToast('Sync Error', err.message, '⚠️');
    } finally {
      setSyncing(false);
    }
  };

  const handleReseed = async () => {
    if (!confirm('Reset all prospects to Part 2 verified baseline? Any manual overrides will be reset.')) return;
    try {
      const res = await fetch('/api/prospects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reseed' })
      });
      const data = await res.json();
      showToast('Reset Complete', data.message, '↺');
      loadProspects();
    } catch (err: any) {
      showToast('Reset Error', err.message, '⚠️');
    }
  };

  return (
    <main className="min-h-screen bg-[#090d14] text-slate-100 font-sans pb-16">
      {/* Top Nav */}
      <div className="px-4 pt-4">
        {syncReport && <section role="status" className="mb-4 rounded-xl border border-emerald-500/30 bg-slate-900 p-4 text-sm">
          <p>{syncReport.message}</p>
          {syncReport.skipped?.length > 0 && <details className="mt-2"><summary className="cursor-pointer">View skipped prospects and reasons</summary><ul className="mt-2 space-y-1">{syncReport.skipped.map((item: any, index: number) => <li key={index}>{item.name}: {item.reason}</li>)}</ul></details>}
        </section>}

        <BigBoardHeader
          rightActions={
            <div className="flex items-center gap-2">
              <button
                onClick={handleSyncStats}
                disabled={syncing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition disabled:opacity-50 shadow-sm"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                <span>Sync NCAA Stats</span>
              </button>
              <button
                onClick={() => handleOpenEdit(tabProspects[0] || null)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white transition shadow-sm"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>PFF Quick Edit</span>
              </button>
              <button
                onClick={handleReseed}
                title="Reset to verified baseline"
                className="inline-flex items-center px-2 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition"
              >
                ↺
              </button>
            </div>
          }
        />
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#162032] border border-slate-700 rounded-xl p-4 shadow-2xl flex items-start gap-3 max-w-sm animate-in fade-in slide-in-from-bottom-5">
          <div className="text-xl">{toast.icon}</div>
          <div>
            <div className="text-sm font-semibold text-white">{toast.title}</div>
            <div className="text-xs text-slate-400 mt-0.5">{toast.desc}</div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-5 space-y-6">

        {/* Position Group Tabs */}
        <div className="flex overflow-x-auto no-scrollbar gap-1.5 border-b border-slate-800 pb-2">
          {(Object.keys(TAB_CONFIGS) as PositionGroup[]).map(tab => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setSortField('rank_override');
                setSortDirection('asc');
              }}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {TAB_CONFIGS[tab].name}
            </button>
          ))}
        </div>

        {/* Dynamic 4-Card Hero Banner */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{TAB_CONFIGS[activeTab].name} — Category Leaders</span>
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              {tabProspects.length} Verified Prospects
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {heroCards.map((card, idx) => (
              <div
                key={idx}
                className="bg-[#121a29] border border-slate-800/80 p-4 rounded-xl relative overflow-hidden group hover:border-slate-700 transition shadow-lg"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition"></div>
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{card.title}</div>
                <div className="text-base font-bold text-white mt-1 group-hover:text-emerald-400 transition flex items-center gap-1.5">
                  <span>{card.name}</span>
                  <span className="text-xs font-normal text-slate-400">({card.team})</span>
                </div>
                <div className="mt-2.5 flex items-baseline justify-between">
                  <span className="text-xs text-slate-400">{card.label}</span>
                  <span className="text-sm font-extrabold text-emerald-400 tracking-tight">{card.value}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Search & Filter Bar */}
        <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#101726] border border-slate-800 p-3 rounded-xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by player, team, scouting note..."
              className="w-full bg-[#0b101c] border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={classFilter}
              onChange={e => setClassFilter(e.target.value)}
              className="bg-[#0b101c] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="">All Classes</option>
              <option value="FR">FR</option>
              <option value="SO">SO</option>
              <option value="JR">JR</option>
              <option value="RS JR">RS JR</option>
              <option value="SR">SR</option>
              <option value="RS SR">RS SR</option>
            </select>
            <select
              value={draftFilter}
              onChange={e => setDraftFilter(e.target.value)}
              className="bg-[#0b101c] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="">All Draft Years</option>
              <option value="2027">2027 Draft</option>
              <option value="2028">2028 Draft</option>
              <option value="2029">2029 Draft</option>
            </select>
          </div>
        </section>

        {/* Master Big Board Table */}
        <section className="bg-[#101726] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-[#141e30] text-slate-300 uppercase tracking-wider text-[11px] border-b border-slate-800 select-none">
                <tr>
                  {TAB_CONFIGS[activeTab].columns.map(col => (
                    <th
                      key={col.key}
                      onClick={() => col.sortable && handleSort(col.key)}
                      className={`px-4 py-3.5 ${col.sortable ? 'cursor-pointer hover:text-emerald-400' : ''} ${col.key === 'audit_note' ? 'min-w-[280px]' : ''}`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{col.label}</span>
                        {col.sortable && (
                          <span className="text-[10px]">
                            {sortField === col.key ? (sortDirection === 'asc' ? '▲' : '▼') : '↕'}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="px-3 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredAndSorted.map(p => {
                  const isOut = p.injury_note && p.injury_note.toLowerCase().includes('out');
                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition">
                      {TAB_CONFIGS[activeTab].columns.map(col => {
                        const val = p[col.key];
                        const displayVal = col.format ? col.format(val) : (val !== null && val !== undefined ? val : '—');

                        if (col.key === 'rank_override') {
                          return <td key={col.key} className="px-4 py-3 font-bold text-slate-400">#{displayVal}</td>;
                        }
                        if (col.key === 'name') {
                          return (
                            <td key={col.key} className="px-4 py-3 font-semibold text-white">
                              <div className="flex items-center gap-1.5">
                                <span>{val}</span>
                                {p.injury_note && (
                                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                    isOut ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                  }`}>
                                    {p.injury_note}
                                  </span>
                                )}
                              </div>
                            </td>
                          );
                        }
                        if (col.key === 'team') {
                          return <td key={col.key} className="px-4 py-3 text-emerald-400 font-semibold">{val}</td>;
                        }
                        if (col.key === 'audit_note') {
                          return <td key={col.key} className="px-4 py-3 text-[11px] text-slate-400 font-normal italic">{displayVal}</td>;
                        }
                        if (col.highlight) {
                          return <td key={col.key} className="px-4 py-3 font-bold text-emerald-300">{displayVal}</td>;
                        }
                        return <td key={col.key} className="px-4 py-3 text-slate-300">{displayVal}</td>;
                      })}
                      <td className="px-3 py-3 text-right">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="px-2 py-1 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredAndSorted.length === 0 && (
            <div className="p-10 text-center text-slate-500">
              <p className="text-sm font-semibold">No prospects matched your search filter.</p>
              <p className="text-xs text-slate-600 mt-1">Try clearing your filters or search keyword.</p>
            </div>
          )}
        </section>

      </div>

      {/* Edit PFF / Manual Stats Modal */}
      {modalOpen && selectedPlayer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121a29] border border-slate-700 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>🛡️ PFF & Manual Stats Override</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Editing {selectedPlayer.name} ({selectedPlayer.team} - {selectedPlayer.position_group})
                </p>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Games Played</label>
                  <input
                    type="number"
                    value={formData.games}
                    onChange={e => setFormData({ ...formData, games: e.target.value })}
                    className="w-full bg-[#0b101c] border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Snaps (OL/DT)</label>
                  <input
                    type="number"
                    value={formData.snaps}
                    onChange={e => setFormData({ ...formData, snaps: e.target.value })}
                    className="w-full bg-[#0b101c] border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Pressures Allowed</label>
                  <input
                    type="number"
                    value={formData.pressures}
                    onChange={e => setFormData({ ...formData, pressures: e.target.value })}
                    className="w-full bg-[#0b101c] border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Sacks Allowed (OL)</label>
                  <input
                    type="number"
                    value={formData.sacks_allowed}
                    onChange={e => setFormData({ ...formData, sacks_allowed: e.target.value })}
                    className="w-full bg-[#0b101c] border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Pass Block % (OL)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.pass_blk_pct}
                    onChange={e => setFormData({ ...formData, pass_blk_pct: e.target.value })}
                    className="w-full bg-[#0b101c] border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Run Stops (DT)</label>
                  <input
                    type="number"
                    value={formData.run_stops}
                    onChange={e => setFormData({ ...formData, run_stops: e.target.value })}
                    className="w-full bg-[#0b101c] border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Havoc Plays (DT)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.havoc_plays}
                    onChange={e => setFormData({ ...formData, havoc_plays: e.target.value })}
                    className="w-full bg-[#0b101c] border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Coverage Targets (DB)</label>
                  <input
                    type="number"
                    value={formData.cov_targets}
                    onChange={e => setFormData({ ...formData, cov_targets: e.target.value })}
                    className="w-full bg-[#0b101c] border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Passer Rating Allowed</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.passer_rating_allowed}
                    onChange={e => setFormData({ ...formData, passer_rating_allowed: e.target.value })}
                    className="w-full bg-[#0b101c] border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Injury Status Note</label>
                  <input
                    type="text"
                    value={formData.injury_note}
                    onChange={e => setFormData({ ...formData, injury_note: e.target.value })}
                    placeholder="e.g. OUT (Ankle) or DTD (Toe)"
                    className="w-full bg-[#0b101c] border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Scouting / Audit Note</label>
                  <input
                    type="text"
                    value={formData.audit_note}
                    onChange={e => setFormData({ ...formData, audit_note: e.target.value })}
                    placeholder="Verified status, transfer info, etc."
                    className="w-full bg-[#0b101c] border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

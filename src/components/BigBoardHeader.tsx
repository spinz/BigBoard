import type { ReactNode } from 'react';
import { Award } from 'lucide-react';

export default function BigBoardHeader({ rightActions }: { rightActions?: ReactNode }) {
  return (
    <header className="glass-panel flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-emerald-400"><Award className="h-6 w-6" /></div>
        <div><h1 className="text-xl font-bold tracking-tight text-white">Big Board</h1><p className="mt-1 text-xs text-slate-400">2026/27 College Football Prospect Tracker</p></div>
      </div>
      <div className="flex flex-wrap items-center gap-2">{rightActions}</div>
    </header>
  );
}

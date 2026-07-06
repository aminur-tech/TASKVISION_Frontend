'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Compass, MoveLeft, Terminal, LayoutDashboard } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-slate-950 text-slate-100 font-sans relative overflow-hidden">
      {/* Blueprint Grid Layout Background */}
      <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#3b82f6_1px,transparent_1px),linear-gradient(to_bottom,#3b82f6_1px,transparent_1px)] [background-size:40px_40px]"></div>
      
      {/* Decorative Radial Backdrop Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#020617_80%)]"></div>

      <div className="relative flex flex-col items-center max-w-lg text-center px-6 z-10 space-y-8">
        
        {/* Radar Scanning Icon Group */}
        <div className="relative flex items-center justify-center h-24 w-24 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 text-indigo-400 shadow-[0_0_50px_rgba(99,102,241,0.1)]">
          {/* Animated pulsing outer rings */}
          <span className="absolute inset-0 rounded-2xl border border-indigo-500/30 animate-ping opacity-40 [animation-duration:2s]"></span>
          <Compass size={44} className="animate-[spin_20s_linear_infinite] text-indigo-400" />
          
          {/* Absolute corner crosshairs */}
          <span className="absolute -top-1 -left-1 h-3 w-3 border-t-2 border-l-2 border-indigo-500"></span>
          <span className="absolute -bottom-1 -right-1 h-3 w-3 border-b-2 border-r-2 border-indigo-500"></span>
        </div>

        {/* Technical Error Metrics */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-xs font-mono text-rose-400 tracking-wider uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse"></span>
            Error Code: 404_MATRIX_MISALIGN
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
            Coordinate Lost.
          </h1>
          <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">
            The workspace array or semantic mask sequence you are attempting to pull does not exist in the active database clusters.
          </p>
        </div>

        {/* Pseudo Code Console Display */}
        <div className="w-full rounded-xl bg-slate-900/60 border border-slate-800/80 p-4 font-mono text-xs text-left shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2 mb-2 text-slate-500">
            <Terminal size={14} />
            <span>sys_diagnostics.log</span>
          </div>
          <p className="text-slate-500">&gt; TaskVision.Router.resolve_route()</p>
          <p className="text-rose-400">&gt; [ERROR] Route dynamic map returned 0 entries.</p>
          <p className="text-indigo-400">&gt; Redirect suggested: pipeline_fallback</p>
        </div>

        {/* Call to Action Navigation Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center gap-2 w-full sm:w-1/2 py-3 px-4 bg-slate-900 hover:bg-slate-850 active:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-medium rounded-xl transition text-sm"
          >
            <MoveLeft size={16} />
            Step Back
          </button>
          
          <button
            onClick={() => router.push('/tasks')}
            className="flex items-center justify-center gap-2 w-full sm:w-1/2 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 transition text-sm"
          >
            <LayoutDashboard size={16} />
            Return to Board
          </button>
        </div>
      </div>

      {/* Subtle Ambient Footer Grid Metadata */}
      <div className="absolute bottom-6 font-mono text-[10px] text-slate-600 tracking-widest uppercase">
        LAT: 40.4000° N // LONG: 40.4000° W
      </div>
    </div>
  );
}
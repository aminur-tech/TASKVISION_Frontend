import React from 'react';
import { Loader2, ShieldCheck } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-slate-950 text-slate-100 font-sans relative overflow-hidden">
      {/* Visual Tech Grid Background to match your Auth Layout */}
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px]"></div>
      
      <div className="relative flex flex-col items-center space-y-6 z-10">
        {/* Brand Icon Module with Pulsing Outer Glow */}
        <div className="relative p-4 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20 shadow-[0_0_50px_rgba(99,102,241,0.15)] animate-pulse">
          <ShieldCheck size={40} className="tracking-wider" />
        </div>

        {/* Status Text & Dynamic Spinner Container */}
        <div className="flex flex-col items-center space-y-2">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
            <span className="text-sm font-semibold tracking-widest text-slate-400 uppercase">
              Mounting Environment
            </span>
          </div>
          <p className="text-xs text-slate-600 text-center max-w-[220px]">
            Configuring neural canvas matrices and secure tokens...
          </p>
        </div>
      </div>

      {/* Micro-Indicator Status Bar at the bottom edge */}
      <div className="absolute bottom-6 flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/60 border border-slate-800 text-[10px] text-slate-500 tracking-wider uppercase">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
        System Status: Link Active
      </div>
    </div>
  );
}
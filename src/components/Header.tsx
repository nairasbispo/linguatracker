import React, { useState } from 'react';
import { Cloud, CheckCircle2, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Header: React.FC = () => {
  const { syncStatus, sessions, vocabulary, grammar } = useApp();
  const [showStatusTooltip, setShowStatusTooltip] = useState(false);

  return (
    <header
      id="app-top-header"
      className="h-16 px-8 flex items-center justify-between border-b border-[#E8E2D5] bg-[#FAF8F2]/80 backdrop-blur-xs sticky top-0 z-20 select-none"
    >
      {/* Left Eyebrow Slogan */}
      <div className="text-[11px] font-bold tracking-[0.2em] text-slate-500 uppercase">
        A LITTLE PROGRESS, EVERY DAY
      </div>

      {/* Right User & Cloud Sync Info */}
      <div className="flex items-center gap-5">
        {/* Real-time Firebase Sync Pill */}
        <div
          className="relative"
          onMouseEnter={() => setShowStatusTooltip(true)}
          onMouseLeave={() => setShowStatusTooltip(false)}
        >
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-medium cursor-help shadow-2xs">
            {syncStatus === 'syncing' ? (
              <RefreshCw className="w-3 h-3 animate-spin text-emerald-600" />
            ) : (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}
            <span className="text-[11px] tracking-wide font-semibold text-emerald-900">
              Firebase Live Sync
            </span>
          </div>

          {showStatusTooltip && (
            <div className="absolute right-0 mt-2 w-64 p-3 bg-white rounded-xl shadow-lg border border-slate-200 text-xs text-slate-600 z-50">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Connected in real-time</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed mb-2">
                All sessions, vocabulary, and grammar rules are synced live across devices with Firestore.
              </p>
              <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-1.5 flex justify-between">
                <span>{sessions.length} sessions</span>
                <span>{vocabulary.length} words</span>
                <span>{grammar.length} topics</span>
              </div>
            </div>
          )}
        </div>

        {/* Study Season & User Avatar */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-slate-800 tracking-tight">
              Study season
            </div>
            <div className="text-[11px] text-slate-400 font-medium">
              Keep the thread going
            </div>
          </div>
          <div
            id="user-avatar"
            className="w-8 h-8 rounded-full bg-[#EDE9FE] text-[#6D28D9] font-bold text-xs flex items-center justify-center border border-[#DDD6FE] shadow-2xs"
            title="Logged in Learner"
          >
            S
          </div>
        </div>
      </div>
    </header>
  );
};

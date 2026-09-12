import React, { useState } from 'react';
import { Menu, CheckCircle2, RefreshCw, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Header: React.FC = () => {
  const {
    syncStatus,
    sessions,
    vocabulary,
    grammar,
    setIsMobileNavOpen,
    setModal,
    setSelectedLanguageForModal,
    languages,
  } = useApp();
  const [showStatusTooltip, setShowStatusTooltip] = useState(false);

  const handleQuickLog = () => {
    setSelectedLanguageForModal(languages[0]?.id || 'en');
    setModal('logSession');
  };

  return (
    <header
      id="app-top-header"
      className="h-14 sm:h-16 px-3.5 sm:px-8 flex items-center justify-between border-b border-[#E8E2D5] bg-[#FAF8F2]/90 backdrop-blur-xs sticky top-0 z-20 select-none"
    >
      {/* Left: Mobile Hamburger & Brand / Desktop Eyebrow Slogan */}
      <div className="flex items-center gap-2.5">
        {/* Mobile menu button */}
        <button
          id="mobile-menu-toggle-btn"
          onClick={() => setIsMobileNavOpen(true)}
          className="md:hidden p-2 text-slate-700 hover:text-slate-950 hover:bg-slate-200/60 rounded-xl transition-colors active:scale-95"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile brand text */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="w-7 h-7 rounded-lg bg-[#1E5E44] flex items-center justify-center text-white font-bold text-xs shadow-2xs">
            L
          </div>
          <span className="text-sm font-bold text-[#141A26] tracking-tight">
            LinguaTrack
          </span>
        </div>

        {/* Desktop Eyebrow Slogan */}
        <div className="hidden md:block text-[11px] font-bold tracking-[0.2em] text-slate-500 uppercase">
          A LITTLE PROGRESS, EVERY DAY
        </div>
      </div>

      {/* Right User & Cloud Sync Info */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Real-time Firebase Sync Pill */}
        <div
          className="relative"
          onMouseEnter={() => setShowStatusTooltip(true)}
          onMouseLeave={() => setShowStatusTooltip(false)}
          onClick={() => setShowStatusTooltip((prev) => !prev)}
        >
          <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-medium cursor-pointer shadow-2xs">
            {syncStatus === 'syncing' ? (
              <RefreshCw className="w-3 h-3 animate-spin text-emerald-600" />
            ) : (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}
            <span className="text-[11px] tracking-wide font-semibold text-emerald-900 hidden xs:inline">
              Firebase Live
            </span>
            <span className="text-[10px] tracking-wide font-semibold text-emerald-900 xs:hidden">
              Live
            </span>
          </div>

          {showStatusTooltip && (
            <div
              className="absolute right-0 mt-2 w-64 p-3 bg-white rounded-xl shadow-lg border border-slate-200 text-xs text-slate-600 z-50"
              onClick={(e) => e.stopPropagation()}
            >
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

        {/* Mobile Quick Log button */}
        <button
          id="mobile-quick-log-btn"
          onClick={handleQuickLog}
          className="md:hidden flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1E5E44] text-white text-xs font-semibold shadow-2xs active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Log</span>
        </button>

        {/* Study Season & User Avatar */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="text-right">
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

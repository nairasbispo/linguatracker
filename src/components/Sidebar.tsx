import React from 'react';
import {
  LayoutGrid,
  BookMarked,
  BookOpen,
  Target,
  Sparkles,
  ChevronRight,
  Plus,
  Timer,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Sidebar: React.FC = () => {
  const { languages, activeTab, setActiveTab, setModal, todayMinutes } = useApp();

  const ritualProgress = Math.min(100, Math.round((todayMinutes / 10) * 100));

  return (
    <aside
      id="sidebar-container"
      className="w-64 bg-[#161B26] text-slate-200 flex flex-col justify-between shrink-0 min-h-screen border-r border-[#202736] select-none"
    >
      {/* Top Header & Logo */}
      <div className="p-5">
        <div id="app-brand-logo" className="flex items-center gap-3 mb-8 cursor-pointer" onClick={() => setActiveTab('overview')}>
          <div className="w-10 h-10 rounded-xl bg-[#1E5E44] flex items-center justify-center text-white font-bold text-lg shadow-sm border border-emerald-600/40 relative">
            <span>L</span>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-300 ring-2 ring-[#161B26]"></span>
          </div>
          <div>
            <div className="text-white font-bold text-base tracking-tight flex items-center gap-1.5">
              LinguaTrack
            </div>
            <div className="text-[10px] tracking-wider text-slate-400 font-semibold uppercase">
              DAILY PRACTICE
            </div>
          </div>
        </div>

        {/* Section: Your Workspace */}
        <div className="mb-2">
          <div className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase px-3 mb-2">
            YOUR WORKSPACE
          </div>
          <nav className="space-y-1">
            {/* Overview */}
            <button
              id="nav-overview"
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'overview'
                  ? 'bg-[#222B3D] text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-[#1C2333]'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutGrid className="w-4 h-4 text-slate-400" />
                <span>Overview</span>
              </div>
              {activeTab === 'overview' && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
            </button>

            {/* Dynamic Languages (English, Français, etc.) */}
            {languages.map((lang) => {
              const isActive = activeTab === lang.id;
              return (
                <button
                  key={lang.id}
                  id={`nav-language-${lang.id}`}
                  onClick={() => setActiveTab(lang.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#222B3D] text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-[#1C2333]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-4 h-4 text-slate-400" />
                    <span>{lang.name}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                </button>
              );
            })}

            {/* Add Language Button */}
            <button
              id="nav-add-language-btn"
              onClick={() => setModal('addLanguage')}
              className="w-full flex items-center gap-3 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-emerald-400 hover:bg-[#1C2333] transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add language</span>
            </button>

            {/* Grammar */}
            <button
              id="nav-grammar"
              onClick={() => setActiveTab('grammar')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'grammar'
                  ? 'bg-[#222B3D] text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-[#1C2333]'
              }`}
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4 text-slate-400" />
                <span>Grammar</span>
              </div>
              {activeTab === 'grammar' && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
            </button>

            {/* Vocabulary */}
            <button
              id="nav-vocabulary"
              onClick={() => setActiveTab('vocabulary')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'vocabulary'
                  ? 'bg-[#222B3D] text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-[#1C2333]'
              }`}
            >
              <div className="flex items-center gap-3">
                <BookMarked className="w-4 h-4 text-slate-400" />
                <span>Vocabulary</span>
              </div>
              {activeTab === 'vocabulary' && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
            </button>

            {/* Goals */}
            <button
              id="nav-goals"
              onClick={() => setActiveTab('goals')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'goals'
                  ? 'bg-[#222B3D] text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-[#1C2333]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Target className="w-4 h-4 text-slate-400" />
                <span>Goals</span>
              </div>
              {activeTab === 'goals' && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
            </button>
          </nav>
        </div>
      </div>

      {/* Bottom Section: A SMALL RITUAL */}
      <div className="p-4 border-t border-[#202736]">
        <div
          id="small-ritual-card"
          onClick={() => setModal('ritualTimer')}
          className="bg-[#1C2333] hover:bg-[#222B3D] cursor-pointer rounded-2xl p-4 border border-[#2B354D] transition-all group shadow-sm"
          title="Click to open the 10-minute Ritual Focus Timer"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>A SMALL RITUAL</span>
            </div>
            <Timer className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            Ten focused minutes count. Come back tomorrow and let the days add up.
          </p>

          {/* Progress bar */}
          <div className="w-full bg-[#141A27] rounded-full h-1.5 overflow-hidden mb-2">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${ritualProgress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>{todayMinutes}m / 10m today</span>
            <span className="text-emerald-400 font-semibold">{ritualProgress >= 100 ? 'Completed ✓' : 'Start timer →'}</span>
          </div>
        </div>

        <div className="mt-3 text-center">
          <span className="text-[11px] text-slate-500 font-medium">
            Built for the long game
          </span>
        </div>
      </div>
    </aside>
  );
};

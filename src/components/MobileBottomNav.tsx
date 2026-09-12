import React from 'react';
import {
  LayoutGrid,
  BookOpen,
  BookMarked,
  Plus,
  Target,
  Menu,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const MobileBottomNav: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    setModal,
    setSelectedLanguageForModal,
    languages,
    setIsMobileNavOpen,
  } = useApp();

  const handleOpenLog = () => {
    setSelectedLanguageForModal(languages[0]?.id || 'en');
    setModal('logSession');
  };

  const isLanguageActive = languages.some((l) => l.id === activeTab);

  return (
    <nav
      id="mobile-bottom-nav"
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#161B26]/95 backdrop-blur-md border-t border-[#252F42] px-2 py-1.5 flex items-center justify-around text-slate-400 select-none pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]"
    >
      {/* Overview */}
      <button
        id="bottom-nav-overview"
        onClick={() => setActiveTab('overview')}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
          activeTab === 'overview' ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <LayoutGrid className="w-5 h-5 mb-0.5" />
        <span className="text-[10px]">Overview</span>
      </button>

      {/* Languages (cycles or switches to first language or currently active) */}
      <button
        id="bottom-nav-languages"
        onClick={() => {
          if (languages.length > 0) {
            // If already on a language, switch to next or stay, or open drawer
            const currentIdx = languages.findIndex((l) => l.id === activeTab);
            if (currentIdx !== -1) {
              const nextIdx = (currentIdx + 1) % languages.length;
              setActiveTab(languages[nextIdx].id);
            } else {
              setActiveTab(languages[0].id);
            }
          }
        }}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
          isLanguageActive ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <BookOpen className="w-5 h-5 mb-0.5" />
        <span className="text-[10px]">
          {isLanguageActive
            ? languages.find((l) => l.id === activeTab)?.name || 'Language'
            : 'Languages'}
        </span>
      </button>

      {/* Center Elevated Log Action */}
      <div className="flex-1 flex justify-center -mt-5">
        <button
          id="bottom-nav-log-btn"
          onClick={handleOpenLog}
          className="w-12 h-12 rounded-full bg-[#1E5E44] hover:bg-[#184E38] text-white flex items-center justify-center shadow-lg shadow-emerald-950/60 border-4 border-[#161B26] active:scale-90 transition-transform"
          aria-label="Log practice session"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      {/* Grammar */}
      <button
        id="bottom-nav-grammar"
        onClick={() => setActiveTab('grammar')}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
          activeTab === 'grammar' ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Target className="w-5 h-5 mb-0.5" />
        <span className="text-[10px]">Grammar</span>
      </button>

      {/* Vocabulary */}
      <button
        id="bottom-nav-vocab"
        onClick={() => setActiveTab('vocabulary')}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
          activeTab === 'vocabulary' ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <BookMarked className="w-5 h-5 mb-0.5" />
        <span className="text-[10px]">Vocab</span>
      </button>

      {/* Menu / More */}
      <button
        id="bottom-nav-menu"
        onClick={() => setIsMobileNavOpen(true)}
        className="flex flex-col items-center justify-center flex-1 py-1 text-slate-400 hover:text-slate-200 transition-colors"
      >
        <Menu className="w-5 h-5 mb-0.5" />
        <span className="text-[10px]">More</span>
      </button>
    </nav>
  );
};

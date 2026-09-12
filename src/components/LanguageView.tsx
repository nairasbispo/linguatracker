import React from 'react';
import {
  Clock,
  Flame,
  Calendar,
  Plus,
  Headphones,
  Mic,
  BookOpen,
  PenTool,
  Bookmark,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Language } from '../types';
import { ContentRankingSection } from './ContentRankingSection';

interface LanguageViewProps {
  language: Language;
}

export const LanguageView: React.FC<LanguageViewProps> = ({ language }) => {
  const {
    sessions,
    statsByLanguage,
    setModal,
    setSelectedLanguageForModal,
    removeSession,
  } = useApp();

  const stats = statsByLanguage[language.id] || {
    totalMinutes: 0,
    weekMinutes: 0,
    listening: 0,
    speaking: 0,
    reading: 0,
    writing: 0,
    grammar: 0,
    streak: 0,
    activeDaysThisWeek: 0,
    goalMinutes: 30,
    rhythmPercent: 0,
  };

  const langSessions = sessions.filter((s) => s.languageId === language.id);

  const handleOpenLog = () => {
    setSelectedLanguageForModal(language.id);
    setModal('logSession');
  };

  // Skill max for bar proportion
  const maxSkillMin = Math.max(1, stats.listening, stats.speaking, stats.reading, stats.writing, stats.grammar || 0);

  return (
    <div id={`language-view-${language.id}`} className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Top Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 tracking-wider uppercase mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>{language.name.toUpperCase()} PRACTICE</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#141A26] tracking-tight">
            Make {language.name.toLowerCase()} yours.
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 font-normal max-w-xl">
            Track the work that happens between lessons: a page read, a conversation, a song understood.
          </p>
        </div>

        <button
          id="lang-log-practice-btn"
          onClick={handleOpenLog}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#1E5E44] hover:bg-[#184E38] text-white text-sm font-semibold shadow-sm transition-all transform active:scale-95 shrink-0 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Log practice</span>
        </button>
      </div>

      {/* Top 3 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* This week */}
        <div className="bg-white rounded-2xl p-5 border border-[#E9E4D9] shadow-2xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-[#1E5E44]">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              This week
            </div>
            <div className="text-xl font-extrabold text-slate-900">
              {stats.weekMinutes} min
            </div>
          </div>
        </div>

        {/* Current streak */}
        <div className="bg-white rounded-2xl p-5 border border-[#E9E4D9] shadow-2xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Current streak
            </div>
            <div className="text-xl font-extrabold text-slate-900">
              {stats.streak} days
            </div>
          </div>
        </div>

        {/* Days active */}
        <div className="bg-white rounded-2xl p-5 border border-[#E9E4D9] shadow-2xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Days active
            </div>
            <div className="text-xl font-extrabold text-slate-900">
              {stats.activeDaysThisWeek} / 7
            </div>
          </div>
        </div>
      </div>

      {/* Two Main Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Card: Weekly Overview & Skills (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-[#E9E4D9] shadow-2xs space-y-6 flex flex-col justify-between">
          <div>
            {/* Top badges */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700">
                  {language.code}
                </span>
                <span className="font-bold text-slate-800 text-sm">{language.name}</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF6EE] text-slate-500 uppercase tracking-wider">
                THIS WEEK
              </span>
            </div>

            {/* Big practiced minutes */}
            <div className="mb-4">
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-extrabold text-slate-900">
                  {stats.weekMinutes}
                </span>
                <span className="text-xs font-medium text-slate-500">
                  minutes practiced
                </span>
              </div>
            </div>

            {/* Weekly rhythm meter */}
            <div className="mb-5">
              <div className="flex justify-between text-[11px] text-slate-500 font-medium mb-1.5">
                <span>Weekly rhythm</span>
                <span>
                  {stats.rhythmPercent}% of {stats.goalMinutes} min
                </span>
              </div>
              <div className="w-full bg-[#EAE5DA] rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 bg-[#1E5E44]"
                  style={{ width: `${Math.min(100, stats.rhythmPercent)}%` }}
                ></div>
              </div>
            </div>

            {/* Mini streak & practice days */}
            <div className="grid grid-cols-2 gap-4 py-3 border-y border-[#F0EBE0] text-xs mb-6">
              <div className="flex items-center gap-2 text-slate-600">
                <Flame className="w-4 h-4 text-purple-400" />
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Streak</span>
                  <span className="font-bold text-slate-800">{stats.streak} days</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Practice days</span>
                  <span className="font-bold text-slate-800">{stats.activeDaysThisWeek} of 7</span>
                </div>
              </div>
            </div>

            {/* Skills breakdown bars */}
            <div className="space-y-3.5">
              {/* Listening */}
              <div className="flex items-center justify-between gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-2 w-24">
                  <Headphones className="w-3.5 h-3.5 text-slate-400" />
                  <span>listening</span>
                </div>
                <div className="flex-1 bg-[#F0ECE1] rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-[#D2C8B8] h-full rounded-full"
                    style={{
                      width: `${Math.min(100, (stats.listening / maxSkillMin) * 100)}%`,
                    }}
                  ></div>
                </div>
                <span className="font-semibold text-slate-800 w-8 text-right">
                  {stats.listening}
                </span>
              </div>

              {/* Speaking */}
              <div className="flex items-center justify-between gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-2 w-24">
                  <Mic className="w-3.5 h-3.5 text-slate-400" />
                  <span>speaking</span>
                </div>
                <div className="flex-1 bg-[#F0ECE1] rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-[#D2C8B8] h-full rounded-full"
                    style={{
                      width: `${Math.min(100, (stats.speaking / maxSkillMin) * 100)}%`,
                    }}
                  ></div>
                </div>
                <span className="font-semibold text-slate-800 w-8 text-right">
                  {stats.speaking}
                </span>
              </div>

              {/* Reading */}
              <div className="flex items-center justify-between gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-2 w-24">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                  <span>reading</span>
                </div>
                <div className="flex-1 bg-[#F0ECE1] rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-[#D2C8B8] h-full rounded-full"
                    style={{
                      width: `${Math.min(100, (stats.reading / maxSkillMin) * 100)}%`,
                    }}
                  ></div>
                </div>
                <span className="font-semibold text-slate-800 w-8 text-right">
                  {stats.reading}
                </span>
              </div>

              {/* Writing */}
              <div className="flex items-center justify-between gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-2 w-24">
                  <PenTool className="w-3.5 h-3.5 text-slate-400" />
                  <span>writing</span>
                </div>
                <div className="flex-1 bg-[#F0ECE1] rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-[#D2C8B8] h-full rounded-full"
                    style={{
                      width: `${Math.min(100, (stats.writing / maxSkillMin) * 100)}%`,
                    }}
                  ></div>
                </div>
                <span className="font-semibold text-slate-800 w-8 text-right">
                  {stats.writing}
                </span>
              </div>

              {/* Grammar */}
              <div className="flex items-center justify-between gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-2 w-24">
                  <Bookmark className="w-3.5 h-3.5 text-amber-600" />
                  <span>grammar</span>
                </div>
                <div className="flex-1 bg-[#F0ECE1] rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-amber-600/70 h-full rounded-full"
                    style={{
                      width: `${Math.min(100, ((stats.grammar || 0) / maxSkillMin) * 100)}%`,
                    }}
                  ></div>
                </div>
                <span className="font-semibold text-slate-800 w-8 text-right">
                  {stats.grammar || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: YOUR LOG / Practice sessions (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-[#E9E4D9] shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  YOUR LOG
                </div>
                <h2 className="text-xl font-bold text-slate-900">Practice sessions</h2>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600">
                {langSessions.length} total
              </span>
            </div>

            {/* Content area */}
            {langSessions.length === 0 ? (
              <div className="p-12 rounded-2xl border border-dashed border-[#DDD7C9] bg-grid-soft flex flex-col items-center justify-center text-center my-6 min-h-[260px]">
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-[#1E5E44] mb-3">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1">
                  The first mark is yours.
                </h3>
                <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                  Once you record a practice session, your consistency will start to take shape here.
                </p>
                <button
                  onClick={handleOpenLog}
                  className="mt-4 px-4 py-1.5 rounded-full bg-[#1E5E44] text-white text-xs font-semibold hover:bg-emerald-800 transition-colors"
                >
                  Log session now
                </button>
              </div>
            ) : (
              <div className="space-y-3 my-2 max-h-[500px] overflow-y-auto pr-1">
                {langSessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-4 rounded-xl border border-[#EDE8DC] bg-[#FAF8F3] hover:bg-white transition-all shadow-2xs group flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          {session.totalMinutes} minutes
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-500 font-medium">
                          {session.date}
                        </span>
                      </div>

                      {session.notes && (
                        <p className="text-xs text-slate-600 leading-relaxed italic bg-white/70 p-2 rounded-lg border border-slate-100">
                          "{session.notes}"
                        </p>
                      )}

                      {/* Skill badges with content details */}
                      <div className="flex flex-wrap gap-1.5 pt-1 text-[11px] text-slate-500">
                        {session.listening > 0 && (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 font-medium rounded-md">
                            🎧 {session.listening}m listening {session.listeningDetail?.format ? `• ${session.listeningDetail.format}` : ''} {session.listeningDetail?.topicCategory ? `(${session.listeningDetail.topicCategory})` : ''}
                          </span>
                        )}
                        {session.reading > 0 && (
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-800 font-medium rounded-md">
                            📖 {session.reading}m reading {session.readingDetail?.format ? `• ${session.readingDetail.format}` : ''} {session.readingDetail?.topicCategory ? `(${session.readingDetail.topicCategory})` : ''}
                          </span>
                        )}
                        {(session.grammar || 0) > 0 && (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-900 font-medium rounded-md">
                            📐 {session.grammar}m grammar {session.grammarTopic ? `• ${session.grammarTopic}` : ''}
                          </span>
                        )}
                        {session.writing > 0 && (
                          <span className="px-2 py-0.5 bg-orange-50 text-orange-800 font-medium rounded-md">
                            ✍️ {session.writing}m writing {session.writingDetail?.format ? `• ${session.writingDetail.format}` : ''}
                          </span>
                        )}
                        {session.speaking > 0 && (
                          <span className="px-2 py-0.5 bg-purple-50 text-purple-800 font-medium rounded-md">
                            🗣️ {session.speaking}m speaking {session.speakingDetail?.format ? `• ${session.speakingDetail.format}` : ''}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => removeSession(session.id)}
                      className="opacity-60 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      title="Delete this session"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Language-specific Content & Grammar Ranking */}
      <div className="pt-2">
        <ContentRankingSection initialLanguageId={language.id} showLanguageSelector={false} />
      </div>
    </div>
  );
};

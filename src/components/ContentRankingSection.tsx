import React, { useState, useMemo } from 'react';
import {
  Trophy,
  Headphones,
  BookOpen,
  PenTool,
  Mic,
  Bookmark,
  Sparkles,
  BarChart3,
  TrendingUp,
  Tag,
  Clock,
  Layers,
  Award,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { PracticeSession } from '../types';

interface ContentRankingSectionProps {
  initialLanguageId?: string; // Optional: if provided, lock or default to this language
  showLanguageSelector?: boolean;
}

export const ContentRankingSection: React.FC<ContentRankingSectionProps> = ({
  initialLanguageId,
  showLanguageSelector = true,
}) => {
  const { sessions, languages, grammar } = useApp();

  const [selectedLang, setSelectedLang] = useState<string>(initialLanguageId || 'all');
  const [activeTab, setActiveTab] = useState<'all' | 'formats' | 'topics' | 'grammar'>('all');
  const [selectedSkillFilter, setSelectedSkillFilter] = useState<'all' | 'listening' | 'reading' | 'writing' | 'grammar'>('all');

  // Filter sessions by selected language
  const filteredSessions = useMemo(() => {
    if (selectedLang === 'all') return sessions;
    return sessions.filter((s) => s.languageId === selectedLang);
  }, [sessions, selectedLang]);

  // Aggregate Media / Content Formats
  const formatRankings = useMemo(() => {
    const stats: Record<string, { format: string; minutes: number; count: number; skills: Set<string> }> = {};

    filteredSessions.forEach((s) => {
      // Check listening
      if (s.listeningDetail?.format && (selectedSkillFilter === 'all' || selectedSkillFilter === 'listening')) {
        const fmt = s.listeningDetail.format.trim();
        if (!stats[fmt]) stats[fmt] = { format: fmt, minutes: 0, count: 0, skills: new Set() };
        stats[fmt].minutes += s.listening || 0;
        stats[fmt].count += 1;
        stats[fmt].skills.add('listening');
      }
      // Check reading
      if (s.readingDetail?.format && (selectedSkillFilter === 'all' || selectedSkillFilter === 'reading')) {
        const fmt = s.readingDetail.format.trim();
        if (!stats[fmt]) stats[fmt] = { format: fmt, minutes: 0, count: 0, skills: new Set() };
        stats[fmt].minutes += s.reading || 0;
        stats[fmt].count += 1;
        stats[fmt].skills.add('reading');
      }
      // Check writing
      if (s.writingDetail?.format && (selectedSkillFilter === 'all' || selectedSkillFilter === 'writing')) {
        const fmt = s.writingDetail.format.trim();
        if (!stats[fmt]) stats[fmt] = { format: fmt, minutes: 0, count: 0, skills: new Set() };
        stats[fmt].minutes += s.writing || 0;
        stats[fmt].count += 1;
        stats[fmt].skills.add('writing');
      }
      // Check speaking
      if (s.speakingDetail?.format && (selectedSkillFilter === 'all' || selectedSkillFilter === 'speaking')) {
        const fmt = s.speakingDetail.format.trim();
        if (!stats[fmt]) stats[fmt] = { format: fmt, minutes: 0, count: 0, skills: new Set() };
        stats[fmt].minutes += s.speaking || 0;
        stats[fmt].count += 1;
        stats[fmt].skills.add('speaking');
      }
    });

    const list = Object.values(stats).map((item) => ({
      ...item,
      skills: Array.from(item.skills),
    }));

    list.sort((a, b) => b.minutes - a.minutes || b.count - a.count);
    return list;
  }, [filteredSessions, selectedSkillFilter]);

  // Aggregate Themes / Topics (e.g. AI, Geopolitics, Entertainment)
  const topicRankings = useMemo(() => {
    const stats: Record<string, { topic: string; minutes: number; count: number; examples: string[] }> = {};

    filteredSessions.forEach((s) => {
      const checkAndAdd = (cat?: string, min?: number, title?: string) => {
        if (!cat) return;
        const key = cat.trim();
        if (!stats[key]) stats[key] = { topic: key, minutes: 0, count: 0, examples: [] };
        stats[key].minutes += min || 0;
        stats[key].count += 1;
        if (title && !stats[key].examples.includes(title)) {
          if (stats[key].examples.length < 3) stats[key].examples.push(title);
        }
      };

      if (selectedSkillFilter === 'all' || selectedSkillFilter === 'listening') {
        checkAndAdd(s.listeningDetail?.topicCategory, s.listening, s.listeningDetail?.titleOrDescription);
      }
      if (selectedSkillFilter === 'all' || selectedSkillFilter === 'reading') {
        checkAndAdd(s.readingDetail?.topicCategory, s.reading, s.readingDetail?.titleOrDescription);
      }
      if (selectedSkillFilter === 'all' || selectedSkillFilter === 'writing') {
        checkAndAdd(s.writingDetail?.topicCategory, s.writing, s.writingDetail?.titleOrDescription);
      }
      if (selectedSkillFilter === 'all' || selectedSkillFilter === 'speaking') {
        checkAndAdd(s.speakingDetail?.topicCategory, s.speaking, s.speakingDetail?.titleOrDescription);
      }
    });

    const list = Object.values(stats);
    list.sort((a, b) => b.minutes - a.minutes || b.count - a.count);
    return list;
  }, [filteredSessions, selectedSkillFilter]);

  // Aggregate Grammar Topics Studied with Minutes & Count
  const grammarRankings = useMemo(() => {
    const stats: Record<string, { topic: string; minutes: number; count: number; lastDate: string }> = {};

    filteredSessions.forEach((s) => {
      if (s.grammarTopic) {
        const key = s.grammarTopic.trim();
        if (!stats[key]) {
          stats[key] = {
            topic: key,
            minutes: 0,
            count: 0,
            lastDate: s.date,
          };
        }
        stats[key].minutes += s.grammar || 0;
        stats[key].count += 1;
        if (s.date > stats[key].lastDate) {
          stats[key].lastDate = s.date;
        }
      }
    });

    // Also include grammar topics from grammar list if not logged in sessions yet
    grammar.forEach((g) => {
      if (selectedLang !== 'all' && g.languageId !== selectedLang) return;
      const key = g.title.trim();
      if (!stats[key]) {
        stats[key] = {
          topic: key,
          minutes: 0,
          count: 0,
          lastDate: new Date(g.updatedAt || g.createdAt).toISOString().split('T')[0],
        };
      }
    });

    const list = Object.values(stats);
    list.sort((a, b) => b.minutes - a.minutes || b.count - a.count);
    return list;
  }, [filteredSessions, grammar, selectedLang]);

  // Total logged content minutes for percentage calculations
  const totalContentMinutes = useMemo(() => {
    return formatRankings.reduce((acc, f) => acc + f.minutes, 0);
  }, [formatRankings]);

  const totalTopicMinutes = useMemo(() => {
    return topicRankings.reduce((acc, t) => acc + t.minutes, 0);
  }, [topicRankings]);

  const totalGrammarMinutes = useMemo(() => {
    return grammarRankings.reduce((acc, g) => acc + g.minutes, 0);
  }, [grammarRankings]);

  // Check if user has logged any content details yet
  const hasContentData = formatRankings.length > 0 || topicRankings.length > 0 || grammarRankings.some((g) => g.minutes > 0);

  return (
    <div id="content-ranking-section" className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-[#E9E4D9] shadow-2xs space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F0EBE0] pb-5">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-emerald-800 uppercase mb-1">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>WHAT YOU CONSUME MOST • CONTENT RANKINGS</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Media formats, topics, and grammar in focus.
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
            Real visibility into what you listen to, read, and study — categorized by topic, media format, and grammar focus.
          </p>
        </div>

        {/* Language selector chips */}
        {showLanguageSelector && (
          <div className="flex items-center gap-1.5 p-1 bg-[#FAF8F3] border border-[#EBE5D8] rounded-xl self-start sm:self-center">
            <button
              id="ranking-filter-lang-all"
              onClick={() => setSelectedLang('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedLang === 'all'
                  ? 'bg-[#1E5E44] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            {languages.map((lang) => (
              <button
                key={lang.id}
                id={`ranking-filter-lang-${lang.id}`}
                onClick={() => setSelectedLang(lang.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  selectedLang === lang.id
                    ? 'bg-[#1E5E44] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: lang.id === 'fr' ? '#C084FC' : '#6EE7B7' }}
                ></span>
                <span>{lang.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* View Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          <button
            id="tab-ranking-all"
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Overview
          </button>
          <button
            id="tab-ranking-formats"
            onClick={() => setActiveTab('formats')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'formats'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Media & Formats ({formatRankings.length})</span>
          </button>
          <button
            id="tab-ranking-topics"
            onClick={() => setActiveTab('topics')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'topics'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Themes & Topics ({topicRankings.length})</span>
          </button>
          <button
            id="tab-ranking-grammar"
            onClick={() => setActiveTab('grammar')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'grammar'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Grammar Studied ({grammarRankings.length})</span>
          </button>
        </div>

        {/* Skill filter pill */}
        {(activeTab === 'all' || activeTab === 'formats' || activeTab === 'topics') && (
          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-[#FAF8F3] px-2.5 py-1 rounded-lg border border-[#EAE4D7]">
            <span className="text-slate-400 mr-1">Filter:</span>
            {(['all', 'listening', 'reading', 'writing'] as const).map((skill) => (
              <button
                key={skill}
                onClick={() => setSelectedSkillFilter(skill)}
                className={`px-2 py-0.5 rounded-md transition-colors ${
                  selectedSkillFilter === skill
                    ? 'bg-emerald-800 text-white font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {skill === 'all' && 'All'}
                {skill === 'listening' && 'Listening'}
                {skill === 'reading' && 'Reading'}
                {skill === 'writing' && 'Writing'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {!hasContentData ? (
        <div className="p-8 sm:p-12 rounded-2xl border border-dashed border-[#DDD7C9] bg-[#FAF8F3] text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">
            Your content ranking starts here
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-4">
            When logging a session in <strong>"Log a session"</strong>, choose the media you listened to or read (YouTube, Podcast, Article, Book...) and the subject category (AI, Geopolitics, Entertainment...). The ranking will automatically reflect what you consume most!
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-slate-600">
            <span className="px-3 py-1 bg-white rounded-full border border-slate-200">🎧 YouTube / Podcasts</span>
            <span className="px-3 py-1 bg-white rounded-full border border-slate-200">💡 AI & Geopolitics</span>
            <span className="px-3 py-1 bg-white rounded-full border border-slate-200">📖 Articles & Books</span>
            <span className="px-3 py-1 bg-white rounded-full border border-slate-200">📐 Grammar Topics</span>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* OVERVIEW TAB: Bento Grid with Top Formats, Top Topics, and Top Grammar */}
          {activeTab === 'all' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Top Formats Column */}
              <div className="bg-[#FAF8F3] rounded-2xl p-5 border border-[#EDE8DC] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                      <BarChart3 className="w-4 h-4 text-emerald-700" />
                      <span>Top Media & Formats</span>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {totalContentMinutes} min
                    </span>
                  </div>

                  {formatRankings.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 italic">No media recorded yet.</p>
                  ) : (
                    <div className="space-y-3 mt-2">
                      {formatRankings.slice(0, 4).map((item, idx) => {
                        const pct = totalContentMinutes > 0 ? Math.round((item.minutes / totalContentMinutes) * 100) : 0;
                        return (
                          <div key={item.format} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                                <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                                  idx === 0 ? 'bg-amber-100 text-amber-800' : idx === 1 ? 'bg-slate-200 text-slate-700' : 'bg-orange-100 text-orange-800'
                                }`}>
                                  {idx + 1}
                                </span>
                                <span>{item.format}</span>
                              </span>
                              <span className="font-semibold text-slate-600">
                                {item.minutes}m <span className="text-slate-400 font-normal">({pct}%)</span>
                              </span>
                            </div>
                            <div className="w-full bg-[#EAE5DA] rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-[#1E5E44] h-full rounded-full transition-all duration-500"
                                style={{ width: `${pct}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setActiveTab('formats')}
                  className="mt-4 pt-3 border-t border-[#EDE8DC] text-[11px] font-bold text-emerald-800 hover:text-emerald-950 flex items-center justify-between w-full"
                >
                  <span>View all media</span>
                  <span>→</span>
                </button>
              </div>

              {/* Top Themes Column */}
              <div className="bg-[#FAF8F3] rounded-2xl p-5 border border-[#EDE8DC] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                      <Tag className="w-4 h-4 text-purple-600" />
                      <span>Top Consumed Topics</span>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {totalTopicMinutes} min
                    </span>
                  </div>

                  {topicRankings.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 italic">No topics (AI, Politics, Tech...) recorded yet.</p>
                  ) : (
                    <div className="space-y-3 mt-2">
                      {topicRankings.slice(0, 4).map((item, idx) => {
                        const pct = totalTopicMinutes > 0 ? Math.round((item.minutes / totalTopicMinutes) * 100) : 0;
                        return (
                          <div key={item.topic} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                                <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                                  idx === 0 ? 'bg-purple-100 text-purple-800' : 'bg-slate-200 text-slate-700'
                                }`}>
                                  {idx + 1}
                                </span>
                                <span className="truncate max-w-[130px]">{item.topic}</span>
                              </span>
                              <span className="font-semibold text-slate-600">
                                {item.minutes}m <span className="text-slate-400 font-normal">({pct}%)</span>
                              </span>
                            </div>
                            <div className="w-full bg-[#EAE5DA] rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-purple-600 h-full rounded-full transition-all duration-500"
                                style={{ width: `${pct}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setActiveTab('topics')}
                  className="mt-4 pt-3 border-t border-[#EDE8DC] text-[11px] font-bold text-purple-800 hover:text-purple-950 flex items-center justify-between w-full"
                >
                  <span>View all topics</span>
                  <span>→</span>
                </button>
              </div>

              {/* Top Grammar Studied Column */}
              <div className="bg-[#FAF8F3] rounded-2xl p-5 border border-[#EDE8DC] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                      <Bookmark className="w-4 h-4 text-emerald-800" />
                      <span>Top Practiced Grammar</span>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {totalGrammarMinutes} min
                    </span>
                  </div>

                  {grammarRankings.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 italic">No grammar topics recorded yet.</p>
                  ) : (
                    <div className="space-y-2.5 mt-2">
                      {grammarRankings.slice(0, 4).map((item, idx) => (
                        <div
                          key={item.topic}
                          className="p-2.5 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between gap-2 shadow-2xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <span className="text-xs font-bold text-slate-800 truncate">
                              {item.topic}
                            </span>
                          </div>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[11px] font-extrabold shrink-0">
                            {item.minutes > 0 ? `${item.minutes}m` : `${item.count} logs`}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setActiveTab('grammar')}
                  className="mt-4 pt-3 border-t border-[#EDE8DC] text-[11px] font-bold text-emerald-800 hover:text-emerald-950 flex items-center justify-between w-full"
                >
                  <span>View grammar topics</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          )}

          {/* FORMATS TAB: Detailed List */}
          {activeTab === 'formats' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {formatRankings.map((item, idx) => {
                  const pct = totalContentMinutes > 0 ? Math.round((item.minutes / totalContentMinutes) * 100) : 0;
                  return (
                    <div
                      key={item.format}
                      className="p-4 rounded-2xl border border-[#EDE8DC] bg-[#FAF8F3] hover:bg-white transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-sm font-bold text-slate-900">
                          <span className={`w-5 h-5 rounded-full text-xs flex items-center justify-center font-extrabold ${
                            idx === 0 ? 'bg-amber-100 text-amber-800' : idx === 1 ? 'bg-slate-200 text-slate-700' : 'bg-orange-100 text-orange-800'
                          }`}>
                            {idx + 1}
                          </span>
                          <span>{item.format}</span>
                        </span>
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                          {item.minutes} min
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>{item.count} sessions recorded</span>
                        <span>{pct}% of content</span>
                      </div>
                      <div className="w-full bg-[#EAE5DA] rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-[#1E5E44] h-full rounded-full"
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TOPICS TAB: Detailed List */}
          {activeTab === 'topics' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {topicRankings.map((item, idx) => {
                  const pct = totalTopicMinutes > 0 ? Math.round((item.minutes / totalTopicMinutes) * 100) : 0;
                  return (
                    <div
                      key={item.topic}
                      className="p-4 rounded-2xl border border-[#EDE8DC] bg-[#FAF8F3] hover:bg-white transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-sm font-bold text-slate-900">
                          <span className={`w-5 h-5 rounded-full text-xs flex items-center justify-center font-extrabold ${
                            idx === 0 ? 'bg-purple-100 text-purple-800' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {idx + 1}
                          </span>
                          <span>{item.topic}</span>
                        </span>
                        <span className="text-xs font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded-md">
                          {item.minutes} min
                        </span>
                      </div>
                      {item.examples.length > 0 && (
                        <div className="text-[11px] text-slate-500 italic truncate">
                          Ex: {item.examples.join(', ')}
                        </div>
                      )}
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>{item.count} sessions</span>
                        <span>{pct}% of topics</span>
                      </div>
                      <div className="w-full bg-[#EAE5DA] rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-purple-600 h-full rounded-full"
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* GRAMMAR TAB: Detailed List */}
          {activeTab === 'grammar' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {grammarRankings.map((item, idx) => (
                  <div
                    key={item.topic}
                    className="p-4 rounded-2xl border border-[#EDE8DC] bg-[#FAF8F3] hover:bg-white transition-all space-y-2 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="flex items-center gap-2 text-sm font-bold text-slate-900">
                          <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-xs flex items-center justify-center font-extrabold shrink-0">
                            {idx + 1}
                          </span>
                          <span className="leading-snug">{item.topic}</span>
                        </span>
                        <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md shrink-0">
                          {item.minutes} min
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
                      <span>{item.count} practice sessions</span>
                      <span>Last: {item.lastDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

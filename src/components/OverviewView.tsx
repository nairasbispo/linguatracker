import React from 'react';
import {
  TrendingUp,
  Plus,
  Sparkles,
  Flame,
  Calendar,
  ArrowUpRight,
  Clock,
  Trash2,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const OverviewView: React.FC = () => {
  const {
    languages,
    sessions,
    grammar,
    thisWeekMinutes,
    statsByLanguage,
    setActiveTab,
    setModal,
    setSelectedLanguageForModal,
    removeSession,
  } = useApp();

  // Current day of week in uppercase
  const now = new Date();
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();

  const handleOpenLog = () => {
    setSelectedLanguageForModal(languages[0]?.id || 'en');
    setModal('logSession');
  };

  // 30 days activity matrix data
  const activityDays = React.useMemo(() => {
    const days: { date: string; minutes: number; dayNum: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const dateStr = d.toISOString().split('T')[0];
      const daySessions = sessions.filter((s) => s.date === dateStr);
      const totalMin = daySessions.reduce((acc, s) => acc + (s.totalMinutes || 0), 0);
      days.push({
        date: dateStr,
        minutes: totalMin,
        dayNum: d.getDate(),
      });
    }
    return days;
  }, [sessions]);

  return (
    <div id="overview-view" className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Top Welcome & Log Action */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 tracking-wider uppercase mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
            <span>{dayName}, YOUR PACE IS YOURS</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#141A26] tracking-tight">
            Keep the thread going.
          </h1>
          <p className="text-sm text-slate-500 mt-1.5 font-normal">
            A clear view of the small sessions that are becoming a real language practice.
          </p>
        </div>

        <button
          id="overview-log-session-btn"
          onClick={handleOpenLog}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1E5E44] hover:bg-[#184E38] text-white text-sm font-semibold shadow-sm transition-all transform active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Log a session</span>
        </button>
      </div>

      {/* Top Dual Cards: Green Grid + Quiet Reminder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Green Grid Card: YOUR WEEK SO FAR */}
        <div
          id="hero-week-card"
          className="lg:col-span-2 rounded-2xl bg-[#1F583E] text-white p-6 relative overflow-hidden bg-grid-white shadow-sm border border-emerald-900/30 flex flex-col justify-between min-h-[190px]"
        >
          {/* Top row */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-emerald-200/90 uppercase">
              YOUR WEEK SO FAR
            </span>
            <TrendingUp className="w-5 h-5 text-emerald-300" />
          </div>

          {/* Big number */}
          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                {thisWeekMinutes}
              </span>
              <span className="text-lg font-medium text-emerald-100">minutes</span>
            </div>
            <p className="text-xs text-emerald-100/90 mt-1 font-normal max-w-md">
              You are building a beautiful habit, one deliberate session at a time.
            </p>
          </div>

          {/* Languages breakdown dots */}
          <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-emerald-600/30 text-xs font-medium text-emerald-100">
            {languages.map((lang) => {
              const min = statsByLanguage[lang.id]?.weekMinutes || 0;
              return (
                <div key={lang.id} className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: lang.id === 'fr' ? '#C084FC' : '#6EE7B7' }}
                  ></span>
                  <span>
                    {lang.name} {min}m
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Card: QUIET REMINDER */}
        <div
          id="hero-quiet-reminder-card"
          className="rounded-2xl bg-white border border-[#E9E4D9] p-6 shadow-2xs flex flex-col justify-between"
        >
          <div>
            <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-3">
              QUIET REMINDER
            </div>
            <p className="text-lg sm:text-xl font-bold text-slate-800 leading-snug font-editorial italic">
              "Consistency has a softer voice than urgency."
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 text-xs font-semibold text-slate-600">
            <span>Show up gently</span>
            <Sparkles className="w-4 h-4 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Section: AT A GLANCE / Two languages, one rhythm */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              AT A GLANCE
            </div>
            <h2 className="text-xl font-bold text-[#141A26] tracking-tight">
              {languages.length === 2 ? 'Two languages, one rhythm.' : 'Languages in rhythm.'}
            </h2>
          </div>
          <button
            id="tune-goals-btn"
            onClick={() => setActiveTab('goals')}
            className="text-xs font-semibold text-[#1E5E44] hover:text-emerald-800 flex items-center gap-1 transition-colors"
          >
            <span>Tune your goals</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Language Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {languages.map((lang) => {
            const stats = statsByLanguage[lang.id] || {
              weekMinutes: 0,
              streak: 0,
              activeDaysThisWeek: 0,
              goalMinutes: 60,
              rhythmPercent: 0,
            };

            return (
              <div
                key={lang.id}
                id={`overview-lang-card-${lang.id}`}
                onClick={() => setActiveTab(lang.id)}
                className="bg-white rounded-2xl p-6 border border-[#E9E4D9] shadow-2xs hover:shadow-sm hover:border-[#D5CEBF] transition-all cursor-pointer group"
              >
                {/* Header row */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700">
                      {lang.code}
                    </span>
                    <span className="font-bold text-slate-800 text-sm group-hover:text-emerald-700 transition-colors">
                      {lang.name}
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF6EE] text-slate-500 uppercase tracking-wider">
                    THIS WEEK
                  </span>
                </div>

                {/* Big minutes */}
                <div className="mb-4">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-extrabold text-slate-900">
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
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, stats.rhythmPercent)}%`,
                        backgroundColor: lang.id === 'fr' ? '#1E5E44' : '#1E5E44',
                      }}
                    ></div>
                  </div>
                </div>

                {/* Footer streaks */}
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-[#F0EBE0] text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Flame className="w-4 h-4 text-purple-400" />
                    <div>
                      <div className="text-[10px] text-slate-400 font-semibold">Streak</div>
                      <div className="font-bold text-slate-800">{stats.streak} days</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="text-[10px] text-slate-400 font-semibold">Practice days</div>
                      <div className="font-bold text-slate-800">{stats.activeDaysThisWeek} of 7</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Non-AI Innovation: 30-Day Consistency Heatmap */}
      <div className="bg-white rounded-2xl p-6 border border-[#E9E4D9] shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              CONSISTENCY CALENDAR
            </div>
            <h3 className="text-base font-bold text-slate-800">
              Last 30 days of deliberate practice
            </h3>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
            <span>Less</span>
            <span className="w-2.5 h-2.5 rounded-xs bg-[#EAE5DA]"></span>
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-200"></span>
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-400"></span>
            <span className="w-2.5 h-2.5 rounded-xs bg-[#1E5E44]"></span>
            <span>More</span>
          </div>
        </div>

        <div className="grid grid-cols-10 sm:grid-cols-15 md:grid-cols-30 gap-1.5">
          {activityDays.map((item) => {
            let bgClass = 'bg-[#EAE5DA]';
            if (item.minutes > 60) bgClass = 'bg-[#1E5E44] text-white';
            else if (item.minutes > 30) bgClass = 'bg-emerald-500 text-white';
            else if (item.minutes > 0) bgClass = 'bg-emerald-200 text-emerald-900';

            return (
              <div
                key={item.date}
                className={`h-9 rounded-md flex flex-col items-center justify-center text-[10px] font-medium transition-transform hover:scale-110 cursor-pointer ${bgClass}`}
                title={`${item.date}: ${item.minutes} minutes`}
              >
                <span>{item.dayNum}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Row: Recent Practice + Grammar Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Practice (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-[#E9E4D9] shadow-2xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                RECENT PRACTICE
              </div>
              <h3 className="text-lg font-bold text-slate-800">
                Latest sessions
              </h3>
            </div>
            <button
              onClick={handleOpenLog}
              className="text-xs font-semibold text-[#1E5E44] hover:underline flex items-center gap-1"
            >
              <span>+ Log new</span>
            </button>
          </div>

          {sessions.length === 0 ? (
            <div className="p-8 rounded-xl border border-dashed border-[#DDD7C9] bg-grid-soft flex flex-col items-center justify-center text-center my-auto min-h-[140px]">
              <Clock className="w-6 h-6 text-slate-300 mb-2" />
              <div className="text-sm font-medium text-slate-500">No sessions logged yet.</div>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.slice(0, 4).map((s) => {
                const lang = languages.find((l) => l.id === s.languageId);
                return (
                  <div
                    key={s.id}
                    className="p-3.5 rounded-xl border border-[#EDE8DC] bg-[#FAF8F3] hover:bg-white transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-slate-200 text-slate-800">
                        {lang?.code || 'LANG'}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                          <span>{s.totalMinutes} min practice</span>
                          <span className="text-[10px] font-normal text-slate-400">• {s.date}</span>
                        </div>
                        {s.notes && (
                          <div className="text-[11px] text-slate-500 truncate max-w-xs sm:max-w-md mt-0.5">
                            {s.notes}
                          </div>
                        )}
                        <div className="flex gap-2 text-[10px] text-slate-400 mt-1">
                          {s.listening > 0 && <span>🎧 {s.listening}m</span>}
                          {s.speaking > 0 && <span>🗣️ {s.speaking}m</span>}
                          {s.reading > 0 && <span>📖 {s.reading}m</span>}
                          {s.writing > 0 && <span>✍️ {s.writing}m</span>}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => removeSession(s.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                      title="Delete session"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Grammar Mini Overview (1 col) */}
        <div className="bg-white rounded-2xl p-6 border border-[#E9E4D9] shadow-2xs flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-1">
              GRAMMAR PROGRESS
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-4">
              Mechanics at a glance
            </h3>

            <div className="space-y-3">
              {languages.map((lang) => {
                const langGrammar = grammar.filter((g) => g.languageId === lang.id);
                const masteredCount = langGrammar.filter((g) => g.status === 'mastered').length;
                const learningCount = langGrammar.filter((g) => g.status === 'learning').length;

                return (
                  <div
                    key={lang.id}
                    onClick={() => setActiveTab('grammar')}
                    className="p-3 rounded-xl border border-[#EDE8DC] bg-[#FAF8F3] hover:bg-[#F3EFE6] cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                          {lang.code}
                        </span>
                        <span className="text-xs font-bold text-slate-800">{lang.name}</span>
                      </div>
                      <div className="text-2xl font-extrabold text-slate-900 mt-1">
                        {langGrammar.length}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        grammar topics
                      </div>
                    </div>
                    <div className="text-right text-[10px] text-slate-500 space-y-0.5">
                      <div><strong className="text-emerald-700">{masteredCount}</strong> mastered</div>
                      <div><strong className="text-purple-700">{learningCount}</strong> learning</div>
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 ml-auto mt-1" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => setActiveTab('grammar')}
            className="w-full mt-4 py-2 text-center text-xs font-semibold text-[#1E5E44] hover:bg-emerald-50 rounded-xl transition-colors"
          >
            Explore all grammar →
          </button>
        </div>
      </div>
    </div>
  );
};

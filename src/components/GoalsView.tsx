import React, { useState } from 'react';
import { Target, Plus, Trash2, CheckCircle2, TrendingUp } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const GoalsView: React.FC = () => {
  const { languages, goals, statsByLanguage, setModal, editGoal, removeGoal } = useApp();
  const [selectedLangFilter, setSelectedLangFilter] = useState<string>('all');

  const filteredGoals = goals.filter((g) => {
    if (selectedLangFilter === 'all') return true;
    return g.languageId === selectedLangFilter;
  });

  return (
    <div id="goals-view" className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 tracking-wider uppercase mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>A DIRECTION, NOT A DEMAND</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#141A26] tracking-tight">
            Goals with room to breathe.
          </h1>
          <p className="text-sm text-slate-500 mt-1.5 font-normal max-w-xl">
            Set a little structure around the skills you care about. A good goal is just somewhere to land.
          </p>
        </div>

        <button
          id="goals-set-goal-btn"
          onClick={() => setModal('addGoal')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1E5E44] hover:bg-[#184E38] text-white text-sm font-semibold shadow-sm transition-all transform active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Set goal</span>
        </button>
      </div>

      {/* Filter Tabs & Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E9E4D9]">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedLangFilter('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              selectedLangFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-[#E0D9CB] hover:bg-slate-50'
            }`}
          >
            All languages
          </button>
          {languages.map((lang) => (
            <button
              key={lang.id}
              onClick={() => setSelectedLangFilter(lang.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedLangFilter === lang.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-[#E0D9CB] hover:bg-slate-50'
              }`}
            >
              {lang.name}
            </button>
          ))}
        </div>

        <div className="text-xs font-medium text-slate-500">
          {filteredGoals.filter((g) => g.active).length} active directions
        </div>
      </div>

      {/* Goals Grid */}
      {filteredGoals.length === 0 ? (
        <div className="p-16 rounded-2xl border border-dashed border-[#DDD7C9] bg-grid-soft flex flex-col items-center justify-center text-center">
          <Target className="w-8 h-8 text-slate-400 mb-3" />
          <h3 className="text-base font-bold text-slate-800 mb-1">
            No goals set yet.
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mb-4">
            A small target, like 15 minutes a week, helps build steady momentum without pressure.
          </p>
          <button
            onClick={() => setModal('addGoal')}
            className="px-4 py-2 rounded-full bg-[#1E5E44] text-white text-xs font-semibold hover:bg-emerald-800 transition-colors"
          >
            + Set a gentle goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGoals.map((goal) => {
            const lang = languages.find((l) => l.id === goal.languageId);
            const stats = statsByLanguage[goal.languageId] || { weekMinutes: 0 };
            const current = stats.weekMinutes || 0;
            const progress = Math.min(100, Math.round((current / Math.max(1, goal.targetMinutes)) * 100));
            const isDone = progress >= 100;

            return (
              <div
                key={goal.id}
                id={`goal-card-${goal.id}`}
                className="bg-white rounded-2xl p-6 border border-[#E9E4D9] shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top language badge & delete */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {lang?.code || 'LANG'}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        {lang?.name}
                      </span>
                    </div>

                    <button
                      onClick={() => removeGoal(goal.id)}
                      className="text-slate-300 hover:text-red-500 p-1 transition-colors"
                      title="Remove goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Goal title */}
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    {goal.skill} • {goal.period === 'week' ? 'Every week' : 'Every day'}
                  </div>
                  <h3 className="text-2xl font-extrabold text-slate-900 mb-3 tracking-tight">
                    {goal.targetMinutes} <span className="text-base font-medium text-slate-500">min</span>
                  </h3>

                  {/* Progress info */}
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-slate-600 font-medium">
                      {current} of {goal.targetMinutes} min practiced
                    </span>
                    <span className={`font-bold ${isDone ? 'text-emerald-700' : 'text-slate-700'}`}>
                      {progress}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-[#EAE5DA] rounded-full h-2 overflow-hidden mb-4">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isDone ? 'bg-emerald-600' : 'bg-[#1E5E44]'
                      }`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Bottom active toggle */}
                <div className="pt-3 border-t border-[#F0EBE0] flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    {goal.active ? (
                      <span className="text-emerald-700 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Active direction
                      </span>
                    ) : (
                      'Paused'
                    )}
                  </span>
                  <button
                    onClick={() => editGoal(goal.id, { active: !goal.active })}
                    className={`text-xs font-semibold px-3 py-1 rounded-full border transition-all ${
                      goal.active
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                        : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border-emerald-200'
                    }`}
                  >
                    {goal.active ? 'Pause' : 'Activate'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

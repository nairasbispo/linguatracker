import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AddGoalModal: React.FC = () => {
  const { languages, selectedLanguageForModal, modal, setModal, createGoal } = useApp();

  const [languageId, setLanguageId] = useState<string>(
    selectedLanguageForModal || languages[0]?.id || 'en'
  );
  const [skill, setSkill] = useState<string>('Total practice');
  const [period, setPeriod] = useState<'week' | 'day'>('week');
  const [targetMinutes, setTargetMinutes] = useState<number>(30);
  const [active, setActive] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (modal !== 'addGoal') return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (targetMinutes <= 0) return;

    setIsSubmitting(true);
    await createGoal({
      languageId,
      skill,
      period,
      targetMinutes: Number(targetMinutes),
      active,
      createdAt: Date.now(),
    });

    setIsSubmitting(false);
    setModal(null);
  };

  return (
    <div
      id="modal-backdrop-add-goal"
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
    >
      <div
        id="modal-add-goal"
        className="bg-white rounded-3xl p-7 max-w-lg w-full shadow-2xl border border-slate-200/80 relative"
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="text-[11px] font-bold tracking-wider text-emerald-800 uppercase mb-1">
              NEW GOAL
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Choose your next edge.
            </h2>
          </div>
          <button
            onClick={() => setModal(null)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Language */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Language
            </label>
            <select
              value={languageId}
              onChange={(e) => setLanguageId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E5E0D5] bg-[#FAF8F3] text-slate-800 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-[#1E5E44]"
            >
              {languages.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* Skill & Period Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Skill
              </label>
              <select
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E0D5] bg-[#FAF8F3] text-slate-800 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-[#1E5E44]"
              >
                <option value="Total practice">Total practice</option>
                <option value="Listening">Listening</option>
                <option value="Speaking">Speaking</option>
                <option value="Reading">Reading</option>
                <option value="Writing">Writing</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Period
              </label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as 'week' | 'day')}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E0D5] bg-[#FAF8F3] text-slate-800 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-[#1E5E44]"
              >
                <option value="week">Every week</option>
                <option value="day">Every day</option>
              </select>
            </div>
          </div>

          {/* Target Minutes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Target minutes
            </label>
            <input
              type="number"
              min="1"
              required
              value={targetMinutes}
              onChange={(e) => setTargetMinutes(Math.max(1, parseInt(e.target.value) || 0))}
              placeholder="30"
              className="w-full px-4 py-2.5 rounded-xl border border-[#E5E0D5] bg-[#FAF8F3] text-slate-800 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-[#1E5E44]"
            />
            <span className="block text-[11px] text-slate-400 mt-1">
              Use a number you can return to, even on a busy week.
            </span>
          </div>

          {/* Active toggle */}
          <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#EDE8DC] flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-800">Goal is active</div>
              <div className="text-[11px] text-slate-500">You can change this anytime.</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1E5E44]"></div>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModal(null)}
              className="px-5 py-2.5 rounded-full text-slate-600 hover:text-slate-900 text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-full bg-[#1E5E44] hover:bg-[#184E38] text-white text-sm font-semibold shadow-sm transition-all transform active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Setting...' : 'Set goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

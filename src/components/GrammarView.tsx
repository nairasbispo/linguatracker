import React, { useState } from 'react';
import { Plus, Trash2, Edit3, CheckCircle2, BookOpen } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { GrammarStatus } from '../types';

export const GrammarView: React.FC = () => {
  const { languages, grammar, setModal, editGrammar, removeGrammar } = useApp();
  const [selectedLangFilter, setSelectedLangFilter] = useState<string>('all');

  const filteredGrammar = grammar.filter((item) => {
    if (selectedLangFilter === 'all') return true;
    return item.languageId === selectedLangFilter;
  });

  const getStatusColor = (status: GrammarStatus) => {
    switch (status) {
      case 'mastered':
        return {
          bg: 'bg-emerald-50',
          text: 'text-emerald-700',
          border: 'border-emerald-200',
          dot: 'bg-emerald-500',
          bar: 'bg-emerald-600',
        };
      case 'practicing':
        return {
          bg: 'bg-[#EBF7F0]',
          text: 'text-[#1E5E44]',
          border: 'border-emerald-200',
          dot: 'bg-[#1E5E44]',
          bar: 'bg-[#1E5E44]',
        };
      case 'learning':
      default:
        return {
          bg: 'bg-purple-50',
          text: 'text-purple-700',
          border: 'border-purple-200',
          dot: 'bg-purple-500',
          bar: 'bg-purple-500',
        };
    }
  };

  return (
    <div id="grammar-view" className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 tracking-wider uppercase mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
            <span>LANGUAGE MECHANICS</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#141A26] tracking-tight">
            Grammar, in progress.
          </h1>
          <p className="text-sm text-slate-500 mt-1.5 font-normal max-w-xl">
            Keep the rules you are learning visible. Confidence grows faster when you can see the pieces click into place.
          </p>
        </div>

        <button
          id="grammar-add-topic-btn"
          onClick={() => setModal('addGrammar')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1E5E44] hover:bg-[#184E38] text-white text-sm font-semibold shadow-sm transition-all transform active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add topic</span>
        </button>
      </div>

      {/* Filter Tabs & Legend Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E9E4D9]">
        {/* Language filter pills */}
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

        {/* Status Legend */}
        <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            <span>Learning</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#1E5E44]"></span>
            <span>Practicing</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Mastered</span>
          </div>
        </div>
      </div>

      {/* Topics Grid */}
      {filteredGrammar.length === 0 ? (
        <div className="p-16 rounded-2xl border border-dashed border-[#DDD7C9] bg-grid-soft flex flex-col items-center justify-center text-center">
          <BookOpen className="w-8 h-8 text-slate-400 mb-3" />
          <h3 className="text-base font-bold text-slate-800 mb-1">
            No grammar topics yet.
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mb-4">
            Record a tricky tense, preposition rule, or sentence structure to track your progress.
          </p>
          <button
            onClick={() => setModal('addGrammar')}
            className="px-4 py-2 rounded-full bg-[#1E5E44] text-white text-xs font-semibold hover:bg-emerald-800 transition-colors"
          >
            + Add topic
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGrammar.map((topic) => {
            const lang = languages.find((l) => l.id === topic.languageId);
            const styling = getStatusColor(topic.status);

            return (
              <div
                key={topic.id}
                id={`grammar-card-${topic.id}`}
                className="bg-white rounded-2xl p-6 border border-[#E9E4D9] shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top language badge */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {lang?.code || 'LANG'}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        {lang?.name}
                      </span>
                    </div>

                    <button
                      onClick={() => removeGrammar(topic.id)}
                      className="text-slate-300 hover:text-red-500 p-1 transition-colors"
                      title="Delete topic"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-slate-900 mb-3 tracking-tight">
                    {topic.title}
                  </h3>

                  {/* Status & Confidence row */}
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] border ${styling.bg} ${styling.text} ${styling.border}`}
                    >
                      {topic.status}
                    </span>
                    <span className="text-slate-500 font-medium text-xs">
                      {topic.confidence}% confident
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-[#EAE5DA] rounded-full h-1.5 overflow-hidden mb-4">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${styling.bar}`}
                      style={{ width: `${topic.confidence}%` }}
                    ></div>
                  </div>

                  {/* Personal notes */}
                  {topic.notes && (
                    <div className="text-xs text-slate-600 bg-[#FAF8F3] p-3 rounded-xl border border-[#EDE8DC] leading-relaxed">
                      {topic.notes}
                    </div>
                  )}
                </div>

                {/* Quick Confidence adjuster */}
                <div className="mt-4 pt-3 border-t border-[#F0EBE0] flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400 font-medium">
                    Adjust confidence:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() =>
                        editGrammar(topic.id, {
                          confidence: Math.max(0, topic.confidence - 10),
                          status:
                            topic.confidence - 10 >= 85
                              ? 'mastered'
                              : topic.confidence - 10 >= 40
                              ? 'practicing'
                              : 'learning',
                        })
                      }
                      className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold"
                    >
                      -10%
                    </button>
                    <button
                      onClick={() =>
                        editGrammar(topic.id, {
                          confidence: Math.min(100, topic.confidence + 10),
                          status:
                            topic.confidence + 10 >= 85
                              ? 'mastered'
                              : topic.confidence + 10 >= 40
                              ? 'practicing'
                              : 'learning',
                        })
                      }
                      className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 hover:bg-emerald-200 text-xs font-bold"
                    >
                      +10%
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

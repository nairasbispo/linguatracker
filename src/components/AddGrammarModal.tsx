import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { GrammarStatus } from '../types';

export const AddGrammarModal: React.FC = () => {
  const { languages, selectedLanguageForModal, modal, setModal, createGrammar } = useApp();

  const [languageId, setLanguageId] = useState<string>(
    selectedLanguageForModal || languages[0]?.id || 'en'
  );
  const [title, setTitle] = useState<string>('');
  const [status, setStatus] = useState<GrammarStatus>('learning');
  const [confidence, setConfidence] = useState<number>(40);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (modal !== 'addGrammar') return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    await createGrammar({
      languageId,
      title: title.trim(),
      status,
      confidence: Number(confidence),
      notes: notes.trim() || undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    setIsSubmitting(false);
    setModal(null);
  };

  return (
    <div
      id="modal-backdrop-add-grammar"
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
    >
      <div
        id="modal-add-grammar"
        className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200/80 relative"
      >
        <div className="flex items-start justify-between mb-5">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Name the pattern.
          </h2>
          <button
            onClick={() => setModal(null)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Language Selector */}
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

          {/* Topic Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Topic title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Past perfect"
              className="w-full px-4 py-2.5 rounded-xl border border-[#E5E0D5] bg-[#FAF8F3] text-slate-800 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-[#1E5E44]"
            />
          </div>

          {/* Status and Confidence */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as GrammarStatus)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E0D5] bg-[#FAF8F3] text-slate-800 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-[#1E5E44]"
              >
                <option value="learning">Learning</option>
                <option value="practicing">Practicing</option>
                <option value="mastered">Mastered</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Confidence — {confidence}%
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={confidence}
                onChange={(e) => setConfidence(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E0D5] bg-[#FAF8F3] text-slate-800 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-[#1E5E44]"
              />
            </div>
          </div>

          {/* Personal Note */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Personal note
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What still feels slippery?"
              className="w-full px-4 py-3 rounded-2xl border border-[#E5E0D5] bg-[#FAF8F3] text-slate-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#1E5E44] placeholder:text-slate-400"
            ></textarea>
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
              {isSubmitting ? 'Adding...' : 'Add topic'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

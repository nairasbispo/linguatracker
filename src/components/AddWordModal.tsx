import React, { useState } from 'react';
import { X, Volume2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AddWordModal: React.FC = () => {
  const { languages, selectedLanguageForModal, modal, setModal, createWord } = useApp();

  const [languageId, setLanguageId] = useState<string>(
    selectedLanguageForModal || languages[0]?.id || 'en'
  );
  const [word, setWord] = useState<string>('');
  const [pronunciation, setPronunciation] = useState<string>('');
  const [meaning, setMeaning] = useState<string>('');
  const [example, setExample] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (modal !== 'addWord') return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim() || !meaning.trim()) return;

    setIsSubmitting(true);
    await createWord({
      languageId,
      word: word.trim(),
      pronunciation: pronunciation.trim() || undefined,
      meaning: meaning.trim(),
      example: example.trim() || undefined,
      createdAt: Date.now(),
    });

    setIsSubmitting(false);
    setModal(null);
  };

  return (
    <div
      id="modal-backdrop-add-word"
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
    >
      <div
        id="modal-add-word"
        className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200/80 relative"
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="text-[11px] font-bold tracking-wider text-emerald-800 uppercase mb-1">
              WORDS WORTH KEEPING
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Add to your word shelf.
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Word or expression
              </label>
              <input
                type="text"
                required
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder="e.g. Bonjour, Insight"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E0D5] bg-[#FAF8F3] text-slate-800 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-[#1E5E44]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Pronunciation (phonetic)
              </label>
              <input
                type="text"
                value={pronunciation}
                onChange={(e) => setPronunciation(e.target.value)}
                placeholder="e.g. /bɔ̃.ʒuʁ/"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E0D5] bg-[#FAF8F3] text-slate-800 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-[#1E5E44]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Meaning or personal translation
            </label>
            <input
              type="text"
              required
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              placeholder="e.g. Hello, good morning"
              className="w-full px-4 py-2.5 rounded-xl border border-[#E5E0D5] bg-[#FAF8F3] text-slate-800 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-[#1E5E44]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Example sentence or context
            </label>
            <textarea
              rows={2}
              value={example}
              onChange={(e) => setExample(e.target.value)}
              placeholder="e.g. Bonjour tout le monde !"
              className="w-full px-4 py-2.5 rounded-xl border border-[#E5E0D5] bg-[#FAF8F3] text-slate-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#1E5E44] placeholder:text-slate-400"
            ></textarea>
          </div>

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
              {isSubmitting ? 'Saving...' : 'Save word'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

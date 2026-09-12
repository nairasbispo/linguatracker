import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AddLanguageModal: React.FC = () => {
  const { modal, setModal, createNewLanguage } = useApp();

  const [name, setName] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [color, setColor] = useState<string>('#2563EB');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (modal !== 'addLanguage') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const id = name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 4) || 'lang';
    const cleanCode = (code.trim() || name.slice(0, 2)).toUpperCase();

    setIsSubmitting(true);
    createNewLanguage({
      id,
      name: name.trim(),
      code: cleanCode,
      color,
      badgeBg: '#F1F5F9',
      badgeText: '#0F172A',
      accentColor: color,
    }).catch(console.error);

    setModal(null);
  };

  return (
    <div
      id="modal-backdrop-add-language"
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
    >
      <div
        id="modal-add-language"
        className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 max-w-sm w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 relative"
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-1">
              NEW WORKSPACE
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Add a language.
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
              Language name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!code && e.target.value.length >= 2) {
                  setCode(e.target.value.slice(0, 2).toUpperCase());
                }
              }}
              placeholder="e.g. Spanish, German, Japanese"
              className="w-full px-4 py-2.5 rounded-xl border border-[#E5E0D5] bg-[#FAF8F3] text-slate-800 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-[#1E5E44]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              2-letter abbreviation
            </label>
            <input
              type="text"
              maxLength={3}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. ES, DE, JA"
              className="w-full px-4 py-2.5 rounded-xl border border-[#E5E0D5] bg-[#FAF8F3] text-slate-800 text-sm font-medium uppercase focus:outline-hidden focus:ring-2 focus:ring-[#1E5E44]"
            />
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
              {isSubmitting ? 'Adding...' : 'Add language'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

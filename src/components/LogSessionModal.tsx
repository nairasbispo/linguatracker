import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import confetti from 'canvas-confetti';

export const LogSessionModal: React.FC = () => {
  const { languages, selectedLanguageForModal, modal, setModal, createSession } = useApp();

  const [languageId, setLanguageId] = useState<string>(
    selectedLanguageForModal || languages[0]?.id || 'en'
  );
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [listening, setListening] = useState<number>(0);
  const [speaking, setSpeaking] = useState<number>(0);
  const [reading, setReading] = useState<number>(0);
  const [writing, setWriting] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (modal !== 'logSession') return null;

  const totalMin = Number(listening || 0) + Number(speaking || 0) + Number(reading || 0) + Number(writing || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalMin <= 0) {
      alert('Please enter at least 1 minute in one of the skills.');
      return;
    }

    setIsSubmitting(true);
    await createSession({
      languageId,
      date,
      listening: Number(listening || 0),
      speaking: Number(speaking || 0),
      reading: Number(reading || 0),
      writing: Number(writing || 0),
      totalMinutes: totalMin,
      notes: notes.trim() || undefined,
      createdAt: Date.now(),
    });

    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch {
      // non-critical
    }

    setIsSubmitting(false);
    setModal(null);
  };

  return (
    <div
      id="modal-backdrop-log-session"
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
    >
      <div
        id="modal-log-session"
        className="bg-white rounded-3xl p-7 max-w-lg w-full shadow-2xl border border-slate-200/80 relative"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="text-[11px] font-bold tracking-wider text-emerald-800 uppercase mb-1">
              NEW PRACTICE
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              What did you practice?
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
          {/* Language Selector if multiple */}
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
                  {lang.name} ({lang.code})
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E5E0D5] bg-[#FAF8F3] text-slate-800 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-[#1E5E44]"
            />
          </div>

          {/* 4 Skills Inputs Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Listening (min)
              </label>
              <input
                type="number"
                min="0"
                value={listening === 0 ? '' : listening}
                onChange={(e) => setListening(Math.max(0, parseInt(e.target.value) || 0))}
                placeholder="0"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E0D5] bg-[#FAF8F3] text-slate-800 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-[#1E5E44]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Speaking (min)
              </label>
              <input
                type="number"
                min="0"
                value={speaking === 0 ? '' : speaking}
                onChange={(e) => setSpeaking(Math.max(0, parseInt(e.target.value) || 0))}
                placeholder="0"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E0D5] bg-[#FAF8F3] text-slate-800 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-[#1E5E44]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Reading (min)
              </label>
              <input
                type="number"
                min="0"
                value={reading === 0 ? '' : reading}
                onChange={(e) => setReading(Math.max(0, parseInt(e.target.value) || 0))}
                placeholder="0"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E0D5] bg-[#FAF8F3] text-slate-800 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-[#1E5E44]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Writing (min)
              </label>
              <input
                type="number"
                min="0"
                value={writing === 0 ? '' : writing}
                onChange={(e) => setWriting(Math.max(0, parseInt(e.target.value) || 0))}
                placeholder="0"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E0D5] bg-[#FAF8F3] text-slate-800 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-[#1E5E44]"
              />
            </div>
          </div>

          {/* Total duration indicator */}
          <div className="flex justify-between items-center px-1 text-xs text-slate-500">
            <span>Total practice session:</span>
            <span className="font-extrabold text-slate-900 text-sm">{totalMin} minutes</span>
          </div>

          {/* A note for future you */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              A note for future you
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="A podcast, a tricky phrase, a win..."
              className="w-full px-4 py-3 rounded-2xl border border-[#E5E0D5] bg-[#FAF8F3] text-slate-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#1E5E44] placeholder:text-slate-400"
            ></textarea>
            <span className="block text-[11px] text-slate-400 mt-1">
              Optional — capture the tiny detail worth remembering.
            </span>
          </div>

          {/* Action buttons */}
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
              {isSubmitting ? 'Saving...' : 'Save session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

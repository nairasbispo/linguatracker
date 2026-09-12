import React, { useState } from 'react';
import { Volume2, Plus, Trash2, Sparkles, Layers, BookMarked } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const VocabularyView: React.FC = () => {
  const { languages, vocabulary, setModal, removeWord } = useApp();
  const [selectedLangFilter, setSelectedLangFilter] = useState<string>('all');
  const [speakingWordId, setSpeakingWordId] = useState<string | null>(null);

  const filteredVocab = vocabulary.filter((item) => {
    if (selectedLangFilter === 'all') return true;
    return item.languageId === selectedLangFilter;
  });

  // Browser Native Web Speech Synthesis (zero AI required!)
  const playPronunciation = (word: string, langCode: string, id: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    if (langCode === 'fr') utterance.lang = 'fr-FR';
    else if (langCode === 'en') utterance.lang = 'en-US';
    else if (langCode === 'es') utterance.lang = 'es-ES';
    else if (langCode === 'de') utterance.lang = 'de-DE';
    else if (langCode === 'pt') utterance.lang = 'pt-BR';
    else utterance.lang = 'en-US';

    utterance.rate = 0.9; // clear, comfortable pace for learners
    setSpeakingWordId(id);

    utterance.onend = () => setSpeakingWordId(null);
    utterance.onerror = () => setSpeakingWordId(null);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div id="vocabulary-view" className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 tracking-wider uppercase mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>WORDS WORTH KEEPING</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#141A26] tracking-tight">
            Build your word shelf.
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 font-normal max-w-xl">
            Save the words you want to remember and keep their pronunciation close at hand.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {filteredVocab.length > 0 && (
            <button
              id="vocab-flashcards-btn"
              onClick={() => setModal('flashcards')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 border border-[#D5CEBF] text-sm font-semibold shadow-2xs transition-all active:scale-95 flex-1 sm:flex-initial"
            >
              <Layers className="w-4 h-4 text-purple-600" />
              <span>Flashcards</span>
            </button>
          )}

          <button
            id="vocab-add-word-btn"
            onClick={() => setModal('addWord')}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#1E5E44] hover:bg-[#184E38] text-white text-sm font-semibold shadow-sm transition-all transform active:scale-95 shrink-0 flex-1 sm:flex-initial"
          >
            <Plus className="w-4 h-4" />
            <span>Add word</span>
          </button>
        </div>
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
          {filteredVocab.length} saved words
        </div>
      </div>

      {/* Cards Grid */}
      {filteredVocab.length === 0 ? (
        <div className="p-16 rounded-2xl border border-dashed border-[#DDD7C9] bg-grid-soft flex flex-col items-center justify-center text-center">
          <BookMarked className="w-8 h-8 text-slate-400 mb-3" />
          <h3 className="text-base font-bold text-slate-800 mb-1">
            Your shelf is quiet.
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mb-4">
            Collect vocabulary from your reading, audio, or daily conversations.
          </p>
          <button
            onClick={() => setModal('addWord')}
            className="px-4 py-2 rounded-full bg-[#1E5E44] text-white text-xs font-semibold hover:bg-emerald-800 transition-colors"
          >
            + Add first word
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVocab.map((item) => {
            const lang = languages.find((l) => l.id === item.languageId);
            const isSpeaking = speakingWordId === item.id;

            return (
              <div
                key={item.id}
                id={`vocab-card-${item.id}`}
                className="bg-white rounded-2xl p-6 border border-[#E9E4D9] shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top language pill */}
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
                      onClick={() => removeWord(item.id)}
                      className="opacity-40 group-hover:opacity-100 text-slate-300 hover:text-red-500 p-1 transition-all"
                      title="Delete word"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Word title */}
                  <h3 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">
                    {item.word}
                  </h3>

                  {/* Audio Pronunciation Button + Phonetic */}
                  <div className="flex items-center gap-2 mb-4">
                    <button
                      onClick={() =>
                        playPronunciation(item.word, item.languageId, item.id)
                      }
                      className={`p-1.5 rounded-lg border transition-all flex items-center justify-center ${
                        isSpeaking
                          ? 'bg-purple-100 border-purple-300 text-purple-700 animate-pulse'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-purple-50 hover:text-purple-700'
                      }`}
                      title="Listen to native audio pronunciation"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    {item.pronunciation && (
                      <span className="text-xs text-slate-500 font-mono">
                        {item.pronunciation}
                      </span>
                    )}
                  </div>

                  {/* Meaning(s) */}
                  {item.languageId === 'fr' || item.meaningEn ? (
                    <div className="space-y-2 mb-3">
                      <div className="bg-amber-50/70 border border-amber-200/70 rounded-xl p-2.5">
                        <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block mb-0.5">
                          FR • Définition
                        </span>
                        <p className="text-sm font-medium text-slate-800 leading-snug">
                          {item.meaning}
                        </p>
                      </div>
                      {item.meaningEn && (
                        <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-xl p-2.5">
                          <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider block mb-0.5">
                            EN • Meaning
                          </span>
                          <p className="text-sm font-medium text-slate-800 leading-snug">
                            {item.meaningEn}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-600 leading-relaxed font-normal mb-3">
                      {item.meaning}
                    </p>
                  )}

                  {/* Example if any */}
                  {item.example && (
                    <p className="mt-3 text-xs text-slate-400 italic bg-[#FAF8F3] p-2.5 rounded-xl border border-slate-100">
                      "{item.example}"
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

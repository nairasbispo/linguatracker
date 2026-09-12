import React, { useState } from 'react';
import { X, Volume2, ArrowRight, ArrowLeft, RotateCw, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const FlashcardModal: React.FC = () => {
  const { vocabulary, languages, modal, setModal, editWord } = useApp();
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  if (modal !== 'flashcards') return null;

  if (vocabulary.length === 0) {
    return (
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center">
          <p className="text-sm text-slate-600 mb-4">No vocabulary words saved yet.</p>
          <button
            onClick={() => setModal(null)}
            className="px-5 py-2 rounded-full bg-slate-900 text-white text-xs font-bold"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const currentWord = vocabulary[currentIndex] || vocabulary[0];
  const lang = languages.find((l) => l.id === currentWord.languageId);

  const playPronunciation = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentWord.word);
    if (currentWord.languageId === 'fr') utterance.lang = 'fr-FR';
    else if (currentWord.languageId === 'en') utterance.lang = 'en-US';
    else utterance.lang = 'en-US';
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % vocabulary.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + vocabulary.length) % vocabulary.length);
  };

  return (
    <div
      id="modal-backdrop-flashcards"
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
    >
      <div
        id="modal-flashcards"
        className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 max-w-md w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 relative flex flex-col items-center"
      >
        <button
          onClick={() => setModal(null)}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Counter */}
        <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-4">
          WORD SHELF FLASHCARDS • {currentIndex + 1} OF {vocabulary.length}
        </div>

        {/* Flashcard Body */}
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className="w-full h-64 rounded-2xl bg-[#FAF8F3] border border-[#E9E4D9] p-6 flex flex-col justify-between items-center text-center cursor-pointer select-none transition-all duration-300 shadow-2xs hover:shadow-xs relative"
        >
          {/* Top badge */}
          <div className="w-full flex items-center justify-between text-xs">
            <span className="px-2 py-0.5 rounded-md font-bold bg-white border border-slate-200 text-slate-700">
              {lang?.code || 'LANG'} {lang?.name}
            </span>
            <span className="text-slate-400 text-[11px] flex items-center gap-1 font-medium">
              <RotateCw className="w-3 h-3" /> Click card to flip
            </span>
          </div>

          {/* Center text */}
          <div className="my-auto">
            {!isFlipped ? (
              <div className="space-y-3">
                <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {currentWord.word}
                </h3>
                {currentWord.pronunciation && (
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={playPronunciation}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-purple-700 hover:bg-purple-50 transition-colors"
                      title="Audio Pronunciation"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-mono text-slate-500">
                      {currentWord.pronunciation}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3 animate-in fade-in zoom-in-95 duration-150">
                <div className="text-xl font-bold text-slate-900">
                  {currentWord.meaning}
                </div>
                {currentWord.example && (
                  <p className="text-xs text-slate-500 italic bg-white p-2.5 rounded-xl border border-slate-100 max-w-xs">
                    "{currentWord.example}"
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Footer cue */}
          <div className="text-[11px] font-semibold text-[#1E5E44]">
            {!isFlipped ? 'Reveal definition' : 'Hide definition'}
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between w-full mt-6 gap-3">
          <button
            onClick={handlePrev}
            className="flex-1 py-2.5 rounded-full border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center justify-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Previous
          </button>

          <button
            onClick={playPronunciation}
            className="p-2.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 hover:bg-purple-100 transition-colors"
            title="Audio Pronunciation"
          >
            <Volume2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleNext}
            className="flex-1 py-2.5 rounded-full bg-[#1E5E44] text-white text-xs font-semibold hover:bg-emerald-800 flex items-center justify-center gap-1 transition-colors"
          >
            Next <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

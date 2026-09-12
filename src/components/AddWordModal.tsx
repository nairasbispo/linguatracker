import React, { useState, useEffect, useRef } from 'react';
import { X, Volume2, Sparkles, Loader2, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { fetchPhonetic } from '../services/phoneticService';

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
  const [isFetchingPhonetic, setIsFetchingPhonetic] = useState<boolean>(false);
  const [suggestedMeaning, setSuggestedMeaning] = useState<string | null>(null);
  const [suggestedExample, setSuggestedExample] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [isPhoneticAutoFilled, setIsPhoneticAutoFilled] = useState<boolean>(false);

  // Track if the user manually modified the pronunciation field
  const userEditedPronunciationRef = useRef<boolean>(false);

  const selectedLang = languages.find((l) => l.id === languageId) || languages[0];

  // Auto-fetch phonetic only after user stops typing (1200ms debounce), non-intrusive
  useEffect(() => {
    if (modal !== 'addWord') return;

    const trimmedWord = word.trim();
    if (!trimmedWord || trimmedWord.length < 2) {
      if (!userEditedPronunciationRef.current) {
        setPronunciation('');
        setIsPhoneticAutoFilled(false);
      }
      setSuggestedMeaning(null);
      setSuggestedExample(null);
      return;
    }

    const timer = setTimeout(async () => {
      // Only auto-fetch if user hasn't explicitly typed pronunciation or meaning
      if (userEditedPronunciationRef.current || meaning.trim()) {
        return;
      }

      setIsFetchingPhonetic(true);
      try {
        const result = await fetchPhonetic(trimmedWord, selectedLang?.name || 'English');
        if (result.phonetic && !userEditedPronunciationRef.current) {
          setPronunciation(result.phonetic);
          setIsPhoneticAutoFilled(true);
        }
        if (result.suggestedMeaning && !meaning.trim()) {
          setSuggestedMeaning(result.suggestedMeaning);
        }
        if (result.example && !example.trim()) {
          setSuggestedExample(result.example);
        }
      } catch (e) {
        console.error('Error fetching phonetic:', e);
      } finally {
        setIsFetchingPhonetic(false);
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [word, languageId, modal, selectedLang, meaning, example]);

  // Reset states on modal open
  useEffect(() => {
    if (modal === 'addWord') {
      userEditedPronunciationRef.current = false;
      setIsPhoneticAutoFilled(false);
      setSuggestedMeaning(null);
      setSuggestedExample(null);
      setWord('');
      setPronunciation('');
      setMeaning('');
      setExample('');
      if (selectedLanguageForModal) {
        setLanguageId(selectedLanguageForModal);
      }
    }
  }, [modal, selectedLanguageForModal]);

  if (modal !== 'addWord') return null;

  // Manual trigger for phonetic fetch
  const handleManualFetchPhonetic = async () => {
    const trimmedWord = word.trim();
    if (!trimmedWord) return;

    setIsFetchingPhonetic(true);
    try {
      const result = await fetchPhonetic(trimmedWord, selectedLang?.name || 'English');
      if (result.phonetic) {
        setPronunciation(result.phonetic);
        setIsPhoneticAutoFilled(true);
      }
      if (result.suggestedMeaning) {
        setSuggestedMeaning(result.suggestedMeaning);
      }
      if (result.example) {
        setSuggestedExample(result.example);
      }
    } catch (e) {
      console.error('Manual phonetic lookup failed:', e);
    } finally {
      setIsFetchingPhonetic(false);
    }
  };

  const handleTestAudio = () => {
    if (!word.trim() || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word.trim());
    const langCode = selectedLang?.code || 'en';
    if (langCode === 'fr') utterance.lang = 'fr-FR';
    else if (langCode === 'en') utterance.lang = 'en-US';
    else if (langCode === 'es') utterance.lang = 'es-ES';
    else if (langCode === 'de') utterance.lang = 'de-DE';
    else if (langCode === 'it') utterance.lang = 'it-IT';
    else if (langCode === 'ja') utterance.lang = 'ja-JP';
    else if (langCode === 'pt') utterance.lang = 'pt-BR';
    else utterance.lang = 'en-US';

    utterance.rate = 0.9;
    setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim() || !meaning.trim()) return;

    setIsSubmitting(true);
    createWord({
      languageId,
      word: word.trim(),
      pronunciation: pronunciation.trim() || undefined,
      meaning: meaning.trim(),
      example: example.trim() || undefined,
      createdAt: Date.now(),
    }).catch(console.error);

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
              <div className="relative">
                <input
                  type="text"
                  required
                  value={word}
                  onChange={(e) => {
                    setWord(e.target.value);
                  }}
                  placeholder="e.g. Bonjour, Insight"
                  className="w-full px-4 py-2.5 pr-9 rounded-xl border border-[#E5E0D5] bg-[#FAF8F3] text-slate-800 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-[#1E5E44]"
                />
                {word.trim().length > 0 && (
                  <button
                    type="button"
                    onClick={handleTestAudio}
                    title="Listen to audio"
                    className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-[#1E5E44] rounded-md transition-colors ${
                      isPlayingAudio ? 'text-emerald-600 animate-pulse' : ''
                    }`}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Pronunciation (phonetic)
                </label>
                <div className="flex items-center gap-1.5">
                  {isFetchingPhonetic ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 animate-pulse">
                      <Loader2 className="w-2.5 h-2.5 animate-spin" />
                      <span>Fetching IPA...</span>
                    </span>
                  ) : isPhoneticAutoFilled ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50/80 px-2 py-0.5 rounded-full border border-emerald-200">
                      <Check className="w-2.5 h-2.5 text-emerald-600" />
                      <span>Auto</span>
                    </span>
                  ) : (
                    word.trim().length >= 2 && (
                      <button
                        type="button"
                        onClick={handleManualFetchPhonetic}
                        className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200/80 transition-colors"
                      >
                        <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                        <span>Generate</span>
                      </button>
                    )
                  )}
                </div>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={pronunciation}
                  onChange={(e) => {
                    userEditedPronunciationRef.current = true;
                    setIsPhoneticAutoFilled(false);
                    setPronunciation(e.target.value);
                  }}
                  placeholder="e.g. /bɔ̃.ʒuʁ/"
                  className={`w-full px-4 py-2.5 rounded-xl border font-mono text-xs text-slate-800 bg-[#FAF8F3] focus:outline-hidden focus:ring-2 focus:ring-[#1E5E44] transition-all ${
                    isPhoneticAutoFilled
                      ? 'border-emerald-300 bg-emerald-50/20'
                      : 'border-[#E5E0D5]'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Contextual Translation & Meaning */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Meaning or personal translation
              </label>
              {suggestedMeaning && !meaning.trim() && (
                <button
                  type="button"
                  onClick={() => setMeaning(suggestedMeaning)}
                  className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold underline underline-offset-2 flex items-center gap-1"
                >
                  <span>Use suggested: "{suggestedMeaning.slice(0, 28)}{suggestedMeaning.length > 28 ? '...' : ''}"</span>
                </button>
              )}
            </div>
            <input
              type="text"
              required
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              placeholder="e.g. Hello, good morning"
              className="w-full px-4 py-2.5 rounded-xl border border-[#E5E0D5] bg-[#FAF8F3] text-slate-800 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-[#1E5E44]"
            />
          </div>

          {/* Example sentence */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Example sentence or context
              </label>
              {suggestedExample && !example.trim() && (
                <button
                  type="button"
                  onClick={() => setExample(suggestedExample)}
                  className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold underline underline-offset-2 flex items-center gap-1"
                >
                  <span>Use suggested example</span>
                </button>
              )}
            </div>
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


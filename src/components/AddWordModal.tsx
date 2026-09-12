import React, { useState, useEffect, useRef } from 'react';
import { X, Volume2, Sparkles, Loader2, Check, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { fetchPhonetic } from '../services/phoneticService';

export const AddWordModal: React.FC = () => {
  const { languages, selectedLanguageForModal, modal, setModal, createWord } = useApp();

  const [languageId, setLanguageId] = useState<string>(
    selectedLanguageForModal || languages[0]?.id || 'en'
  );
  const [word, setWord] = useState<string>('');
  const [pronunciation, setPronunciation] = useState<string>('');
  const [meaning, setMeaning] = useState<string>(''); // French definition (for FR) or English definition (for EN)
  const [meaningEn, setMeaningEn] = useState<string>(''); // English meaning/translation (specifically for French words)
  const [example, setExample] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isFetchingDetails, setIsFetchingDetails] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [isPhoneticAutoFilled, setIsPhoneticAutoFilled] = useState<boolean>(false);
  const [isMeaningAutoFilled, setIsMeaningAutoFilled] = useState<boolean>(false);
  const [isMeaningEnAutoFilled, setIsMeaningEnAutoFilled] = useState<boolean>(false);

  // Track if the user explicitly typed their own custom values
  const userEditedPronunciationRef = useRef<boolean>(false);
  const userEditedMeaningRef = useRef<boolean>(false);
  const userEditedMeaningEnRef = useRef<boolean>(false);

  const selectedLang = languages.find((l) => l.id === languageId) || languages[0];
  const isFrench =
    selectedLang?.code === 'fr' ||
    selectedLang?.name?.toLowerCase().includes('french') ||
    selectedLang?.name?.toLowerCase().includes('français');

  // Helper function to fetch and auto-populate word details
  const executeFetchDetails = async (
    targetWord: string,
    targetLangName: string,
    isTargetFrench: boolean,
    forceOverride: boolean = false
  ) => {
    const clean = targetWord.trim();
    if (!clean || clean.length < 2) return;

    setIsFetchingDetails(true);
    try {
      const result = await fetchPhonetic(clean, targetLangName);
      
      // Auto-fill phonetic if user hasn't manually edited it or forced
      if (result.phonetic && (forceOverride || !userEditedPronunciationRef.current || !pronunciation.trim())) {
        setPronunciation(result.phonetic);
        setIsPhoneticAutoFilled(true);
      }

      if (isTargetFrench) {
        // French word: fill French definition AND English meaning
        if (result.meaningFr && (forceOverride || !userEditedMeaningRef.current || !meaning.trim())) {
          setMeaning(result.meaningFr);
          setIsMeaningAutoFilled(true);
        } else if (result.suggestedMeaning && (forceOverride || !userEditedMeaningRef.current || !meaning.trim())) {
          setMeaning(result.suggestedMeaning);
          setIsMeaningAutoFilled(true);
        }

        if (result.meaningEn && (forceOverride || !userEditedMeaningEnRef.current || !meaningEn.trim())) {
          setMeaningEn(result.meaningEn);
          setIsMeaningEnAutoFilled(true);
        }
      } else {
        // English word: fill English definition only
        if ((result.meaningEn || result.suggestedMeaning) && (forceOverride || !userEditedMeaningRef.current || !meaning.trim())) {
          setMeaning(result.meaningEn || result.suggestedMeaning || '');
          setIsMeaningAutoFilled(true);
        }
      }

      // Auto-fill context example if empty
      if (result.example && (!example.trim() || forceOverride)) {
        setExample(result.example);
      }
    } catch (e) {
      console.error('Error auto-generating word meaning and phonetic:', e);
    } finally {
      setIsFetchingDetails(false);
    }
  };

  const selectedLangName = selectedLang?.name || 'English';

  // Auto-fetch details after user pauses typing (500ms debounce)
  useEffect(() => {
    if (modal !== 'addWord') return;

    const trimmedWord = word.trim();
    if (!trimmedWord || trimmedWord.length < 2) {
      if (!userEditedPronunciationRef.current) {
        setPronunciation('');
        setIsPhoneticAutoFilled(false);
      }
      if (!userEditedMeaningRef.current) {
        setMeaning('');
        setIsMeaningAutoFilled(false);
      }
      if (!userEditedMeaningEnRef.current) {
        setMeaningEn('');
        setIsMeaningEnAutoFilled(false);
      }
      return;
    }

    const timer = setTimeout(() => {
      executeFetchDetails(trimmedWord, selectedLangName, isFrench, false);
    }, 500);

    return () => clearTimeout(timer);
  }, [word, languageId, modal, selectedLangName, isFrench]);

  // Reset states on modal open
  useEffect(() => {
    if (modal === 'addWord') {
      userEditedPronunciationRef.current = false;
      userEditedMeaningRef.current = false;
      userEditedMeaningEnRef.current = false;
      setIsPhoneticAutoFilled(false);
      setIsMeaningAutoFilled(false);
      setIsMeaningEnAutoFilled(false);
      setWord('');
      setPronunciation('');
      setMeaning('');
      setMeaningEn('');
      setExample('');
      if (selectedLanguageForModal) {
        setLanguageId(selectedLanguageForModal);
      }
    }
  }, [modal, selectedLanguageForModal]);

  if (modal !== 'addWord') return null;

  // Manual regenerate trigger
  const handleRegenerate = async () => {
    userEditedMeaningRef.current = false;
    userEditedMeaningEnRef.current = false;
    userEditedPronunciationRef.current = false;
    await executeFetchDetails(word.trim(), selectedLangName, isFrench, true);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedWord = word.trim();
    if (!trimmedWord) return;

    setIsSubmitting(true);

    let finalMeaning = meaning.trim();
    let finalMeaningEn = meaningEn.trim();
    let finalPronunciation = pronunciation.trim();
    let finalExample = example.trim();

    // If user clicked Save before auto-fill finished, or if IPA or meaning is missing,
    // fetch them immediately so the card always has complete information!
    if (!finalMeaning || (isFrench && !finalMeaningEn) || !finalPronunciation) {
      try {
        const result = await fetchPhonetic(trimmedWord, selectedLangName);
        if (isFrench) {
          if (!finalMeaning && result.meaningFr) {
            finalMeaning = result.meaningFr;
          }
          if (!finalMeaningEn && result.meaningEn) {
            finalMeaningEn = result.meaningEn;
          }
        } else {
          if (!finalMeaning && (result.meaningEn || result.suggestedMeaning)) {
            finalMeaning = result.meaningEn || result.suggestedMeaning || '';
          }
        }
        if (!finalPronunciation && result.phonetic) {
          finalPronunciation = result.phonetic;
        }
        if (!finalExample && result.example) {
          finalExample = result.example;
        }
      } catch (err) {
        console.warn('Auto-generation on submit failed:', err);
      }
    }

    if (!finalMeaning) {
      finalMeaning = trimmedWord; // graceful fallback
    }

    try {
      await createWord({
        languageId,
        word: trimmedWord,
        pronunciation: finalPronunciation || undefined,
        meaning: finalMeaning,
        meaningEn: isFrench && finalMeaningEn ? finalMeaningEn : undefined,
        example: finalExample || undefined,
        createdAt: Date.now(),
      });
      setModal(null);
    } catch (err) {
      console.error('Error saving word:', err);
    } finally {
      setIsSubmitting(false);
    }
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
            <p className="text-xs text-slate-500 mt-1">
              {isFrench
                ? 'Type a French word — both the French definition and English meaning are generated automatically!'
                : 'Type an English word — its short meaning and pronunciation are generated automatically!'}
            </p>
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
              onChange={(e) => {
                const newId = e.target.value;
                setLanguageId(newId);
                const newLang = languages.find((l) => l.id === newId);
                const isNewFrench =
                  newLang?.code === 'fr' ||
                  newLang?.name?.toLowerCase().includes('french') ||
                  newLang?.name?.toLowerCase().includes('français');
                if (word.trim().length >= 2) {
                  userEditedMeaningRef.current = false;
                  userEditedMeaningEnRef.current = false;
                  userEditedPronunciationRef.current = false;
                  executeFetchDetails(word, newLang?.name || 'English', isNewFrench);
                }
              }}
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Word or expression
                </label>
                {word.trim().length >= 2 && (
                  <button
                    type="button"
                    onClick={() => handleRegenerate()}
                    disabled={isFetchingDetails}
                    className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200/80 transition-colors"
                    title="Regenerate meanings & IPA"
                  >
                    <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                    <span>Generate</span>
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={word}
                  onChange={(e) => {
                    setWord(e.target.value);
                  }}
                  placeholder={isFrench ? 'e.g. Épanouissement, Démarche' : 'e.g. Serendipity, Insight'}
                  className="w-full px-4 py-2.5 pr-9 rounded-xl border border-[#E5E0D5] bg-[#FAF8F3] text-slate-800 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-[#1E5E44]"
                />
                {word.trim().length > 0 && (
                  <button
                    type="button"
                    onClick={handleTestAudio}
                    title="Listen to audio pronunciation"
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
                  {isFetchingDetails ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 animate-pulse">
                      <Loader2 className="w-2.5 h-2.5 animate-spin" />
                      <span>IPA...</span>
                    </span>
                  ) : isPhoneticAutoFilled ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50/80 px-2 py-0.5 rounded-full border border-emerald-200">
                      <Check className="w-2.5 h-2.5 text-emerald-600" />
                      <span>Auto</span>
                    </span>
                  ) : null}
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

          {/* MEANINGS SECTION */}
          {isFrench ? (
            /* FRENCH WORDS: Show BOTH French Definition and English Meaning */
            <div className="space-y-3.5 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/70">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span>Meanings (French definition & English translation)</span>
                </div>
                {isFetchingDetails && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full animate-pulse">
                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                    <span>Auto-generating both...</span>
                  </span>
                )}
              </div>

              {/* 1. Meaning in French (Définition en français) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Meaning in French (Définition en français)
                  </label>
                  {isMeaningAutoFilled && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded-full">
                      <Check className="w-2.5 h-2.5 text-amber-700" />
                      <span>Auto (FR)</span>
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={meaning}
                    onChange={(e) => {
                      userEditedMeaningRef.current = true;
                      setIsMeaningAutoFilled(false);
                      setMeaning(e.target.value);
                    }}
                    placeholder={
                      isFetchingDetails
                        ? 'Génération de la définition en français...'
                        : 'e.g. Développement harmonieux de la personnalité (auto-generated)'
                    }
                    className={`w-full px-4 py-2.5 rounded-xl border text-slate-800 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-[#1E5E44] transition-all ${
                      isMeaningAutoFilled
                        ? 'border-amber-300 bg-amber-50/30'
                        : 'border-[#E5E0D5] bg-white'
                    }`}
                  />
                  {word.trim().length >= 2 && !isFetchingDetails && (
                    <button
                      type="button"
                      onClick={handleRegenerate}
                      title="Regenerate definition"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-amber-800 rounded-md transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* 2. Meaning in English (English translation) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Meaning in English (Translation)
                  </label>
                  {isMeaningEnAutoFilled && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-900 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                      <Check className="w-2.5 h-2.5 text-emerald-700" />
                      <span>Auto (EN)</span>
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={meaningEn}
                    onChange={(e) => {
                      userEditedMeaningEnRef.current = true;
                      setIsMeaningEnAutoFilled(false);
                      setMeaningEn(e.target.value);
                    }}
                    placeholder={
                      isFetchingDetails
                        ? 'Generating English meaning...'
                        : 'e.g. Fulfillment, flourishing, blossoming (auto-generated)'
                    }
                    className={`w-full px-4 py-2.5 rounded-xl border text-slate-800 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-[#1E5E44] transition-all ${
                      isMeaningEnAutoFilled
                        ? 'border-emerald-300 bg-emerald-50/30'
                        : 'border-[#E5E0D5] bg-white'
                    }`}
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-500 flex items-center justify-between">
                <span>✨ Both French definition and English meaning auto-fill instantly.</span>
                {(isMeaningAutoFilled || isMeaningEnAutoFilled) && (
                  <span className="text-emerald-700 font-medium">Ready to save!</span>
                )}
              </p>
            </div>
          ) : (
            /* ENGLISH WORDS: Show English Definition Only (No Portuguese!) */
            <div>
              <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1.5">
                <div className="flex items-center gap-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Short meaning (English)
                  </label>
                  {isFetchingDetails ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 animate-pulse">
                      <Loader2 className="w-2.5 h-2.5 animate-spin" />
                      <span>Generating English definition...</span>
                    </span>
                  ) : isMeaningAutoFilled ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50/90 px-2 py-0.5 rounded-full border border-emerald-200/80">
                      <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                      <span>Auto-generated</span>
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={meaning}
                  onChange={(e) => {
                    userEditedMeaningRef.current = true;
                    setIsMeaningAutoFilled(false);
                    setMeaning(e.target.value);
                  }}
                  placeholder={
                    isFetchingDetails
                      ? 'Generating English definition automatically...'
                      : 'e.g. Deep intuitive understanding (auto-generated)'
                  }
                  className={`w-full px-4 py-2.5 rounded-xl border text-slate-800 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-[#1E5E44] transition-all ${
                    isMeaningAutoFilled
                      ? 'border-emerald-300 bg-emerald-50/20'
                      : 'border-[#E5E0D5] bg-[#FAF8F3]'
                  }`}
                />

                {word.trim().length >= 2 && !isFetchingDetails && (
                  <button
                    type="button"
                    onClick={handleRegenerate}
                    title="Generate a new short meaning"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-emerald-700 rounded-md transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              
              <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                <span>✨ No typing needed: English definition auto-fills as soon as you type the word.</span>
                {isMeaningAutoFilled && (
                  <span className="text-emerald-700 font-medium">Ready to save!</span>
                )}
              </p>
            </div>
          )}

          {/* Example sentence */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Example sentence or context
              </label>
              {example && (
                <span className="text-[10px] text-slate-400 font-medium">
                  Contextual sentence
                </span>
              )}
            </div>
            <textarea
              rows={2}
              value={example}
              onChange={(e) => setExample(e.target.value)}
              placeholder={
                isFrench
                  ? 'e.g. Ce travail contribue grandement à son épanouissement personnel.'
                  : 'e.g. Her insight into the problem saved us days of work.'
              }
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
              disabled={isSubmitting || !word.trim()}
              className="px-6 py-2.5 rounded-full bg-[#1E5E44] hover:bg-[#184E38] text-white text-sm font-semibold shadow-sm transition-all transform active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving word...</span>
                </>
              ) : (
                <span>Save word</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


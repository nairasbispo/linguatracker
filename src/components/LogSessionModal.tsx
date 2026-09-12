import React, { useState } from 'react';
import {
  X,
  Headphones,
  BookOpen,
  PenTool,
  Mic,
  Bookmark,
  ChevronDown,
  ChevronUp,
  Tag,
  Layers,
  Sparkles,
  Plus,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import confetti from 'canvas-confetti';
import { getLocalDateString } from '../lib/dateUtils';
import type { SkillContentDetail } from '../types';

const LISTENING_FORMATS = [
  'YouTube',
  'Podcast',
  'Movie / Series',
  'Documentary',
  'Music',
  'Audiobook',
  'Conversation',
];

const LISTENING_TOPICS = [
  'AI & Technology',
  'Geopolitics & News',
  'Entertainment & Pop',
  'Science & Health',
  'History & Society',
  'Daily Life & Small Talk',
  'Business & Career',
  'Philosophy & Culture',
];

const READING_FORMATS = [
  'Online Article',
  'Newspaper / News',
  'Book',
  'Short Story',
  'Comics / Graphic Novel',
  'Blog / Newsletter',
  'Subtitles',
];

const READING_TOPICS = [
  'Geopolitics & World',
  'Technology & AI',
  'Literature & Fiction',
  'Science & Nature',
  'Culture & Art',
  'Everyday Life',
];

const WRITING_FORMATS = [
  'Journal / Diary',
  'Essay / Article',
  'Work Email',
  'Messages / Chat',
  'Study Summary',
  'Grammar Exercises',
];

const WRITING_TOPICS = [
  'Personal Reflection',
  'Daily Routine & Plans',
  'Work & Studies',
  'Opinion & Debate',
  'Creative / Fiction',
];

const SPEAKING_FORMATS = [
  'Self-talk / Monologue',
  'Conversation with Native',
  'Reading Out Loud',
  'Shadowing / Repetition',
  'Class / Tutor',
];

const SPEAKING_TOPICS = [
  'Everyday Life',
  'Personal Presentation',
  'Debate & Opinion',
  'Storytelling',
];

export const LogSessionModal: React.FC = () => {
  const {
    languages,
    selectedLanguageForModal,
    modal,
    setModal,
    createSession,
    grammar,
    createGrammar,
  } = useApp();

  const [languageId, setLanguageId] = useState<string>(
    selectedLanguageForModal || languages[0]?.id || 'en'
  );
  const [date, setDate] = useState<string>(getLocalDateString(new Date()));

  // Skill minutes
  const [listening, setListening] = useState<number>(0);
  const [speaking, setSpeaking] = useState<number>(0);
  const [reading, setReading] = useState<number>(0);
  const [writing, setWriting] = useState<number>(0);
  const [grammarMinutes, setGrammarMinutes] = useState<number>(0);

  // Grammar topic
  const [grammarTopic, setGrammarTopic] = useState<string>('');
  const [isCustomGrammarTopic, setIsCustomGrammarTopic] = useState<boolean>(false);

  // Content Details for each skill
  const [listeningFormat, setListeningFormat] = useState<string>('');
  const [listeningTopic, setListeningTopic] = useState<string>('');
  const [listeningTitle, setListeningTitle] = useState<string>('');

  const [readingFormat, setReadingFormat] = useState<string>('');
  const [readingTopic, setReadingTopic] = useState<string>('');
  const [readingTitle, setReadingTitle] = useState<string>('');

  const [writingFormat, setWritingFormat] = useState<string>('');
  const [writingTopic, setWritingTopic] = useState<string>('');
  const [writingTitle, setWritingTitle] = useState<string>('');

  const [speakingFormat, setSpeakingFormat] = useState<string>('');
  const [speakingTopic, setSpeakingTopic] = useState<string>('');
  const [speakingTitle, setSpeakingTitle] = useState<string>('');

  // Expandable state for each skill details
  const [expandedSkill, setExpandedSkill] = useState<'listening' | 'reading' | 'writing' | 'speaking' | 'grammar' | null>(null);

  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (modal !== 'logSession') return null;

  // Available grammar topics for selected language
  const languageGrammarTopics = grammar.filter((g) => g.languageId === languageId);

  const totalMin =
    Number(listening || 0) +
    Number(speaking || 0) +
    Number(reading || 0) +
    Number(writing || 0) +
    Number(grammarMinutes || 0);

  const toggleExpand = (skill: 'listening' | 'reading' | 'writing' | 'speaking' | 'grammar') => {
    setExpandedSkill((prev) => (prev === skill ? null : skill));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (totalMin <= 0) {
      setErrorMessage('Please enter at least 1 minute for at least one skill.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Build details objects if populated
      const listeningDetail: SkillContentDetail | undefined =
        listening > 0 && (listeningFormat || listeningTopic || listeningTitle)
          ? {
              format: listeningFormat.trim() || undefined,
              topicCategory: listeningTopic.trim() || undefined,
              titleOrDescription: listeningTitle.trim() || undefined,
            }
          : undefined;

      const readingDetail: SkillContentDetail | undefined =
        reading > 0 && (readingFormat || readingTopic || readingTitle)
          ? {
              format: readingFormat.trim() || undefined,
              topicCategory: readingTopic.trim() || undefined,
              titleOrDescription: readingTitle.trim() || undefined,
            }
          : undefined;

      const writingDetail: SkillContentDetail | undefined =
        writing > 0 && (writingFormat || writingTopic || writingTitle)
          ? {
              format: writingFormat.trim() || undefined,
              topicCategory: writingTopic.trim() || undefined,
              titleOrDescription: writingTitle.trim() || undefined,
            }
          : undefined;

      const speakingDetail: SkillContentDetail | undefined =
        speaking > 0 && (speakingFormat || speakingTopic || speakingTitle)
          ? {
              format: speakingFormat.trim() || undefined,
              topicCategory: speakingTopic.trim() || undefined,
              titleOrDescription: speakingTitle.trim() || undefined,
            }
          : undefined;

      const cleanGrammarTopic = grammarTopic.trim() || undefined;

      // Save session
      await createSession({
        languageId,
        date: date || getLocalDateString(new Date()),
        listening: Number(listening || 0),
        speaking: Number(speaking || 0),
        reading: Number(reading || 0),
        writing: Number(writing || 0),
        grammar: Number(grammarMinutes || 0),
        grammarTopic: cleanGrammarTopic,
        totalMinutes: totalMin,
        notes: notes.trim() || undefined,
        listeningDetail,
        readingDetail,
        writingDetail,
        speakingDetail,
        createdAt: Date.now(),
      });

      // If a new grammar topic was studied and isn't registered yet in the grammar list, auto-add it!
      if (cleanGrammarTopic && grammarMinutes > 0) {
        const exists = grammar.some(
          (g) => g.languageId === languageId && g.title.toLowerCase() === cleanGrammarTopic.toLowerCase()
        );
        if (!exists) {
          createGrammar({
            languageId,
            title: cleanGrammarTopic,
            status: 'practicing',
            confidence: 50,
            notes: `Added via ${grammarMinutes}m practice session on ${date}`,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }).catch(console.error);
        }
      }

      try {
        confetti({
          particleCount: 45,
          spread: 65,
          origin: { y: 0.8 },
        });
      } catch {
        // non-critical
      }

      setModal(null);
    } catch (err: any) {
      console.error('Error saving session:', err);
      setErrorMessage(err?.message || 'Failed to save session. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="modal-backdrop-log-session"
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-150"
    >
      <div
        id="modal-log-session"
        className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200/80 relative"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="text-[11px] font-bold tracking-wider text-emerald-800 uppercase mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>LOG PRACTICE & CONTENT</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              What did you practice today?
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter your minutes and content details (YouTube, topics, grammar) for your progress ranking.
            </p>
          </div>
          <button
            onClick={() => setModal(null)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Language & Date Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Language
              </label>
              <select
                value={languageId}
                onChange={(e) => setLanguageId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E0D5] bg-[#FAF8F3] text-slate-800 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-[#1E5E44]"
              >
                {languages.map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.name} ({lang.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E0D5] bg-[#FAF8F3] text-slate-800 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-[#1E5E44]"
              />
            </div>
          </div>

          {/* Section: Skills & Content Breakdown */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              Time by skill & content details
            </label>

            {/* 1. LISTENING CARD */}
            <div className={`p-3.5 rounded-xl border transition-all ${
              listening > 0 ? 'border-emerald-700/40 bg-[#F5F9F6]' : 'border-[#EAE5DA] bg-[#FAF8F3]'
            }`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <Headphones className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Listening (Audio & Video)</div>
                    <div className="text-[11px] text-slate-400">
                      {listeningFormat ? `${listeningFormat} • ${listeningTopic || 'No topic'}` : 'YouTube, Podcasts, Movies...'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    value={listening === 0 ? '' : listening}
                    onChange={(e) => {
                      const val = Math.max(0, parseInt(e.target.value) || 0);
                      setListening(val);
                      if (val > 0 && !expandedSkill) setExpandedSkill('listening');
                    }}
                    placeholder="0"
                    className="w-20 px-2.5 py-1.5 text-right rounded-lg border border-[#D5CEBF] bg-white text-slate-900 text-sm font-bold focus:outline-hidden focus:ring-2 focus:ring-[#1E5E44]"
                  />
                  <span className="text-xs font-semibold text-slate-500 w-7">min</span>
                  <button
                    type="button"
                    onClick={() => toggleExpand('listening')}
                    className={`p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-black/5 transition-colors ${
                      expandedSkill === 'listening' ? 'bg-black/5 text-slate-900' : ''
                    }`}
                    title="Content details"
                  >
                    {expandedSkill === 'listening' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Listening Content Drawer */}
              {expandedSkill === 'listening' && (
                <div className="mt-3 pt-3 border-t border-emerald-900/10 space-y-2.5 animate-in fade-in duration-100 text-xs">
                  <div>
                    <span className="text-[11px] font-bold text-slate-600 block mb-1">
                      Media / Format:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {LISTENING_FORMATS.map((fmt) => (
                        <button
                          key={fmt}
                          type="button"
                          onClick={() => setListeningFormat(fmt === listeningFormat ? '' : fmt)}
                          className={`px-2.5 py-1 rounded-md transition-colors ${
                            listeningFormat === fmt
                              ? 'bg-emerald-800 text-white font-bold'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {fmt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-600 block mb-1">
                      Topic / Subject:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {LISTENING_TOPICS.map((top) => (
                        <button
                          key={top}
                          type="button"
                          onClick={() => setListeningTopic(top === listeningTopic ? '' : top)}
                          className={`px-2.5 py-1 rounded-md transition-colors ${
                            listeningTopic === top
                              ? 'bg-purple-700 text-white font-bold'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {top}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-600 block mb-1">
                      Title or specific source (optional):
                    </span>
                    <input
                      type="text"
                      value={listeningTitle}
                      onChange={(e) => setListeningTitle(e.target.value)}
                      placeholder="e.g., Kurzgesagt AI video, Le Monde podcast episode..."
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-hidden focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 2. READING CARD */}
            <div className={`p-3.5 rounded-xl border transition-all ${
              reading > 0 ? 'border-emerald-700/40 bg-[#F5F9F6]' : 'border-[#EAE5DA] bg-[#FAF8F3]'
            }`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Reading</div>
                    <div className="text-[11px] text-slate-400">
                      {readingFormat ? `${readingFormat} • ${readingTopic || 'No topic'}` : 'Articles, News, Books...'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    value={reading === 0 ? '' : reading}
                    onChange={(e) => {
                      const val = Math.max(0, parseInt(e.target.value) || 0);
                      setReading(val);
                      if (val > 0 && !expandedSkill) setExpandedSkill('reading');
                    }}
                    placeholder="0"
                    className="w-20 px-2.5 py-1.5 text-right rounded-lg border border-[#D5CEBF] bg-white text-slate-900 text-sm font-bold focus:outline-hidden focus:ring-2 focus:ring-[#1E5E44]"
                  />
                  <span className="text-xs font-semibold text-slate-500 w-7">min</span>
                  <button
                    type="button"
                    onClick={() => toggleExpand('reading')}
                    className={`p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-black/5 transition-colors ${
                      expandedSkill === 'reading' ? 'bg-black/5 text-slate-900' : ''
                    }`}
                    title="Content details"
                  >
                    {expandedSkill === 'reading' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Reading Content Drawer */}
              {expandedSkill === 'reading' && (
                <div className="mt-3 pt-3 border-t border-emerald-900/10 space-y-2.5 animate-in fade-in duration-100 text-xs">
                  <div>
                    <span className="text-[11px] font-bold text-slate-600 block mb-1">
                      Reading format:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {READING_FORMATS.map((fmt) => (
                        <button
                          key={fmt}
                          type="button"
                          onClick={() => setReadingFormat(fmt === readingFormat ? '' : fmt)}
                          className={`px-2.5 py-1 rounded-md transition-colors ${
                            readingFormat === fmt
                              ? 'bg-blue-700 text-white font-bold'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {fmt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-600 block mb-1">
                      Topic / Subject read:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {READING_TOPICS.map((top) => (
                        <button
                          key={top}
                          type="button"
                          onClick={() => setReadingTopic(top === readingTopic ? '' : top)}
                          className={`px-2.5 py-1 rounded-md transition-colors ${
                            readingTopic === top
                              ? 'bg-purple-700 text-white font-bold'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {top}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-600 block mb-1">
                      Title or source (optional):
                    </span>
                    <input
                      type="text"
                      value={readingTitle}
                      onChange={(e) => setReadingTitle(e.target.value)}
                      placeholder="e.g., Le Figaro article on economics, Book chapter 3..."
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-700"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 3. GRAMMAR TOPIC CARD */}
            <div className={`p-3.5 rounded-xl border transition-all ${
              grammarMinutes > 0 ? 'border-emerald-700/40 bg-[#F5F9F6]' : 'border-[#EAE5DA] bg-[#FAF8F3]'
            }`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                    <Bookmark className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Grammar (Topic / Concept)</div>
                    <div className="text-[11px] text-slate-400">
                      {grammarTopic ? `Topic: ${grammarTopic}` : 'Passé Composé, Phrasal Verbs, Subjunctive...'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    value={grammarMinutes === 0 ? '' : grammarMinutes}
                    onChange={(e) => {
                      const val = Math.max(0, parseInt(e.target.value) || 0);
                      setGrammarMinutes(val);
                      if (val > 0 && !expandedSkill) setExpandedSkill('grammar');
                    }}
                    placeholder="0"
                    className="w-20 px-2.5 py-1.5 text-right rounded-lg border border-[#D5CEBF] bg-white text-slate-900 text-sm font-bold focus:outline-hidden focus:ring-2 focus:ring-[#1E5E44]"
                  />
                  <span className="text-xs font-semibold text-slate-500 w-7">min</span>
                  <button
                    type="button"
                    onClick={() => toggleExpand('grammar')}
                    className={`p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-black/5 transition-colors ${
                      expandedSkill === 'grammar' ? 'bg-black/5 text-slate-900' : ''
                    }`}
                    title="Grammar topic details"
                  >
                    {expandedSkill === 'grammar' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Grammar Topic Drawer */}
              {(expandedSkill === 'grammar' || grammarMinutes > 0) && (
                <div className="mt-3 pt-3 border-t border-emerald-900/10 space-y-2.5 animate-in fade-in duration-100 text-xs">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-slate-700">
                        Which grammar topic did you study?
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsCustomGrammarTopic(!isCustomGrammarTopic)}
                        className="text-[11px] text-emerald-800 font-bold hover:underline"
                      >
                        {isCustomGrammarTopic ? 'Pick from list' : '+ Type new topic'}
                      </button>
                    </div>

                    {!isCustomGrammarTopic && languageGrammarTopics.length > 0 ? (
                      <div className="space-y-2">
                        <select
                          value={grammarTopic}
                          onChange={(e) => {
                            if (e.target.value === '__custom__') {
                              setIsCustomGrammarTopic(true);
                              setGrammarTopic('');
                            } else {
                              setGrammarTopic(e.target.value);
                            }
                          }}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs font-medium focus:outline-hidden focus:ring-1 focus:ring-emerald-700"
                        >
                          <option value="">Select an existing topic...</option>
                          {languageGrammarTopics.map((g) => (
                            <option key={g.id} value={g.title}>
                              {g.title} ({g.status})
                            </option>
                          ))}
                          <option value="__custom__">+ Other unlisted topic...</option>
                        </select>
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={grammarTopic}
                        onChange={(e) => setGrammarTopic(e.target.value)}
                        placeholder="e.g., Passé Composé, Relative Pronouns, Phrasal Verbs, Subjunctive..."
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-hidden focus:ring-1 focus:ring-emerald-700"
                      />
                    )}
                    <span className="block text-[10px] text-slate-400 mt-1">
                      Minutes spent will automatically feed into your Grammar Ranking!
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 4. WRITING CARD */}
            <div className={`p-3.5 rounded-xl border transition-all ${
              writing > 0 ? 'border-emerald-700/40 bg-[#F5F9F6]' : 'border-[#EAE5DA] bg-[#FAF8F3]'
            }`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-800 flex items-center justify-center">
                    <PenTool className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Writing</div>
                    <div className="text-[11px] text-slate-400">
                      {writingFormat ? `${writingFormat} • ${writingTopic || 'No topic'}` : 'Journal, Essays, Emails...'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    value={writing === 0 ? '' : writing}
                    onChange={(e) => {
                      const val = Math.max(0, parseInt(e.target.value) || 0);
                      setWriting(val);
                      if (val > 0 && !expandedSkill) setExpandedSkill('writing');
                    }}
                    placeholder="0"
                    className="w-20 px-2.5 py-1.5 text-right rounded-lg border border-[#D5CEBF] bg-white text-slate-900 text-sm font-bold focus:outline-hidden focus:ring-2 focus:ring-[#1E5E44]"
                  />
                  <span className="text-xs font-semibold text-slate-500 w-7">min</span>
                  <button
                    type="button"
                    onClick={() => toggleExpand('writing')}
                    className={`p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-black/5 transition-colors ${
                      expandedSkill === 'writing' ? 'bg-black/5 text-slate-900' : ''
                    }`}
                    title="Writing details"
                  >
                    {expandedSkill === 'writing' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Writing Content Drawer */}
              {expandedSkill === 'writing' && (
                <div className="mt-3 pt-3 border-t border-emerald-900/10 space-y-2.5 animate-in fade-in duration-100 text-xs">
                  <div>
                    <span className="text-[11px] font-bold text-slate-600 block mb-1">
                      Writing format:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {WRITING_FORMATS.map((fmt) => (
                        <button
                          key={fmt}
                          type="button"
                          onClick={() => setWritingFormat(fmt === writingFormat ? '' : fmt)}
                          className={`px-2.5 py-1 rounded-md transition-colors ${
                            writingFormat === fmt
                              ? 'bg-orange-700 text-white font-bold'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {fmt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-600 block mb-1">
                      Writing theme:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {WRITING_TOPICS.map((top) => (
                        <button
                          key={top}
                          type="button"
                          onClick={() => setWritingTopic(top === writingTopic ? '' : top)}
                          className={`px-2.5 py-1 rounded-md transition-colors ${
                            writingTopic === top
                              ? 'bg-purple-700 text-white font-bold'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {top}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-600 block mb-1">
                      Text details (optional):
                    </span>
                    <input
                      type="text"
                      value={writingTitle}
                      onChange={(e) => setWritingTitle(e.target.value)}
                      placeholder="e.g., Paragraphs about my weekend, message to a penpal..."
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-hidden focus:ring-1 focus:ring-orange-700"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 5. SPEAKING CARD */}
            <div className={`p-3.5 rounded-xl border transition-all ${
              speaking > 0 ? 'border-emerald-700/40 bg-[#F5F9F6]' : 'border-[#EAE5DA] bg-[#FAF8F3]'
            }`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <Mic className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Speaking (Conversation & Practice)</div>
                    <div className="text-[11px] text-slate-400">
                      {speakingFormat ? `${speakingFormat}` : 'Monologue, Tandem, Class...'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    value={speaking === 0 ? '' : speaking}
                    onChange={(e) => {
                      const val = Math.max(0, parseInt(e.target.value) || 0);
                      setSpeaking(val);
                      if (val > 0 && !expandedSkill) setExpandedSkill('speaking');
                    }}
                    placeholder="0"
                    className="w-20 px-2.5 py-1.5 text-right rounded-lg border border-[#D5CEBF] bg-white text-slate-900 text-sm font-bold focus:outline-hidden focus:ring-2 focus:ring-[#1E5E44]"
                  />
                  <span className="text-xs font-semibold text-slate-500 w-7">min</span>
                  <button
                    type="button"
                    onClick={() => toggleExpand('speaking')}
                    className={`p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-black/5 transition-colors ${
                      expandedSkill === 'speaking' ? 'bg-black/5 text-slate-900' : ''
                    }`}
                    title="Speaking details"
                  >
                    {expandedSkill === 'speaking' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Speaking Drawer */}
              {expandedSkill === 'speaking' && (
                <div className="mt-3 pt-3 border-t border-emerald-900/10 space-y-2.5 animate-in fade-in duration-100 text-xs">
                  <div>
                    <span className="text-[11px] font-bold text-slate-600 block mb-1">
                      Speaking format:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {SPEAKING_FORMATS.map((fmt) => (
                        <button
                          key={fmt}
                          type="button"
                          onClick={() => setSpeakingFormat(fmt === speakingFormat ? '' : fmt)}
                          className={`px-2.5 py-1 rounded-md transition-colors ${
                            speakingFormat === fmt
                              ? 'bg-emerald-800 text-white font-bold'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {fmt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Total duration indicator */}
          <div className="flex justify-between items-center px-2 py-2 bg-[#FAF8F3] rounded-xl border border-[#EBE5D8] text-xs">
            <span className="text-slate-600 font-medium">Total session duration:</span>
            <span className="font-extrabold text-[#1E5E44] text-base">{totalMin} minutes</span>
          </div>

          {/* A note for future you */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Personal reflection or notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="A memorable phrase, new word, or reflection from today..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E0D5] bg-[#FAF8F3] text-slate-800 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#1E5E44] placeholder:text-slate-400"
            ></textarea>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
              {errorMessage}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModal(null)}
              className="px-5 py-2 rounded-full text-slate-600 hover:text-slate-900 text-xs sm:text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || totalMin <= 0}
              className="px-6 py-2.5 rounded-full bg-[#1E5E44] hover:bg-[#184E38] text-white text-xs sm:text-sm font-bold shadow-sm transition-all transform active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

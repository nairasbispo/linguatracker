import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import type { Language, PracticeSession, GrammarTopic, VocabularyWord, LanguageGoal } from '../types';
import {
  subscribeToCollection,
  seedInitialDataIfEmpty,
  DEFAULT_LANGUAGES,
  INITIAL_SESSIONS,
  INITIAL_GRAMMAR,
  INITIAL_VOCABULARY,
  INITIAL_GOALS,
  addPracticeSession,
  deletePracticeSession,
  addGrammarTopic,
  updateGrammarTopic,
  deleteGrammarTopic,
  addVocabularyWord,
  updateVocabularyWord,
  deleteVocabularyWord,
  addLanguageGoal,
  updateLanguageGoal,
  deleteLanguageGoal,
  addLanguage,
} from '../lib/firebase';

interface AppContextType {
  languages: Language[];
  sessions: PracticeSession[];
  grammar: GrammarTopic[];
  vocabulary: VocabularyWord[];
  goals: LanguageGoal[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  syncStatus: 'connected' | 'syncing' | 'offline';
  modal: string | null;
  setModal: (modal: string | null) => void;
  selectedLanguageForModal?: string;
  setSelectedLanguageForModal: (langId: string | undefined) => void;
  
  // Actions
  createSession: (session: Omit<PracticeSession, 'id'>) => Promise<void>;
  removeSession: (id: string) => Promise<void>;
  createGrammar: (topic: Omit<GrammarTopic, 'id'>) => Promise<void>;
  editGrammar: (id: string, updates: Partial<GrammarTopic>) => Promise<void>;
  removeGrammar: (id: string) => Promise<void>;
  createWord: (word: Omit<VocabularyWord, 'id'>) => Promise<void>;
  editWord: (id: string, updates: Partial<VocabularyWord>) => Promise<void>;
  removeWord: (id: string) => Promise<void>;
  createGoal: (goal: Omit<LanguageGoal, 'id'>) => Promise<void>;
  editGoal: (id: string, updates: Partial<LanguageGoal>) => Promise<void>;
  removeGoal: (id: string) => Promise<void>;
  createNewLanguage: (lang: Language) => Promise<void>;

  // Computed metrics
  todayMinutes: number;
  thisWeekMinutes: number;
  statsByLanguage: Record<
    string,
    {
      totalMinutes: number;
      weekMinutes: number;
      listening: number;
      speaking: number;
      reading: number;
      writing: number;
      streak: number;
      activeDaysThisWeek: number;
      goalMinutes: number;
      rhythmPercent: number;
    }
  >;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [languages, setLanguages] = useState<Language[]>(DEFAULT_LANGUAGES);
  const [sessions, setSessions] = useState<PracticeSession[]>(() => {
    return INITIAL_SESSIONS.map((s, idx) => ({ ...s, id: `seed-session-${idx}` }));
  });
  const [grammar, setGrammar] = useState<GrammarTopic[]>(() => {
    return INITIAL_GRAMMAR.map((g, idx) => ({ ...g, id: `seed-grammar-${idx}` }));
  });
  const [vocabulary, setVocabulary] = useState<VocabularyWord[]>(() => {
    return INITIAL_VOCABULARY.map((v, idx) => ({ ...v, id: `seed-vocab-${idx}` }));
  });
  const [goals, setGoals] = useState<LanguageGoal[]>(() => {
    return INITIAL_GOALS.map((gl, idx) => ({ ...gl, id: `seed-goal-${idx}` }));
  });

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [syncStatus, setSyncStatus] = useState<'connected' | 'syncing' | 'offline'>('syncing');
  const [modal, setModal] = useState<string | null>(null);
  const [selectedLanguageForModal, setSelectedLanguageForModal] = useState<string | undefined>(undefined);

  // Initialize Firebase subscriptions and seeding
  useEffect(() => {
    let unsubs: (() => void)[] = [];

    async function init() {
      try {
        await seedInitialDataIfEmpty();

        const unsubLang = subscribeToCollection<Language>('languages', (data) => {
          if (data.length > 0) setLanguages(data);
          setSyncStatus('connected');
        });

        const unsubSessions = subscribeToCollection<PracticeSession>('practice_sessions', (data) => {
          data.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          setSessions(data);
          setSyncStatus('connected');
        });

        const unsubGrammar = subscribeToCollection<GrammarTopic>('grammar_topics', (data) => {
          data.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
          setGrammar(data);
          setSyncStatus('connected');
        });

        const unsubVocab = subscribeToCollection<VocabularyWord>('vocabulary_words', (data) => {
          data.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          setVocabulary(data);
          setSyncStatus('connected');
        });

        const unsubGoals = subscribeToCollection<LanguageGoal>('language_goals', (data) => {
          setGoals(data);
          setSyncStatus('connected');
        });

        unsubs = [unsubLang, unsubSessions, unsubGrammar, unsubVocab, unsubGoals];
      } catch (e) {
        console.warn('Firebase connection note:', e);
        setSyncStatus('connected');
      }
    }

    init();

    return () => {
      unsubs.forEach((unsub) => unsub && unsub());
    };
  }, []);

  // Helper date functions
  const isDateInCurrentWeek = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    const now = new Date();
    const day = now.getDay(); // 0 is Sunday
    const diffToMonday = (day === 0 ? -6 : 1) - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return d >= monday && d <= sunday;
  };

  const isToday = (dateStr: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    return dateStr === todayStr;
  };

  // Compute stats per language
  const statsByLanguage = useMemo(() => {
    const result: AppContextType['statsByLanguage'] = {};

    languages.forEach((lang) => {
      const langSessions = sessions.filter((s) => s.languageId === lang.id);
      const totalMinutes = langSessions.reduce((acc, s) => acc + (s.totalMinutes || 0), 0);

      const weekSessions = langSessions.filter((s) => isDateInCurrentWeek(s.date));
      const weekMinutes = weekSessions.reduce((acc, s) => acc + (s.totalMinutes || 0), 0);

      const listening = langSessions.reduce((acc, s) => acc + (s.listening || 0), 0);
      const speaking = langSessions.reduce((acc, s) => acc + (s.speaking || 0), 0);
      const reading = langSessions.reduce((acc, s) => acc + (s.reading || 0), 0);
      const writing = langSessions.reduce((acc, s) => acc + (s.writing || 0), 0);

      // Active distinct days in current week
      const distinctDaysThisWeek = new Set(weekSessions.map((s) => s.date)).size;

      // Calculate streak
      const distinctAllDays = Array.from(new Set(langSessions.map((s) => s.date))).sort().reverse();
      let streak = 0;
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      if (distinctAllDays.length > 0) {
        let checkDate = distinctAllDays[0] === today ? today : distinctAllDays[0] === yesterday ? yesterday : null;
        if (checkDate) {
          streak = 1;
          for (let i = 1; i < distinctAllDays.length; i++) {
            const expectedPrev = new Date(new Date(checkDate).getTime() - 86400000).toISOString().split('T')[0];
            if (distinctAllDays[i] === expectedPrev) {
              streak++;
              checkDate = expectedPrev;
            } else {
              break;
            }
          }
        }
      }

      // Goal target
      const langGoal = goals.find((g) => g.languageId === lang.id && g.active);
      const goalMinutes = langGoal ? langGoal.targetMinutes : 1;
      const rhythmPercent = Math.round((weekMinutes / Math.max(goalMinutes, 1)) * 100);

      result[lang.id] = {
        totalMinutes,
        weekMinutes,
        listening,
        speaking,
        reading,
        writing,
        streak,
        activeDaysThisWeek: distinctDaysThisWeek,
        goalMinutes,
        rhythmPercent,
      };
    });

    return result;
  }, [languages, sessions, goals]);

  // Overall metrics
  const todayMinutes = useMemo(() => {
    return sessions.filter((s) => isToday(s.date)).reduce((acc, s) => acc + (s.totalMinutes || 0), 0);
  }, [sessions]);

  const thisWeekMinutes = useMemo(() => {
    return sessions.filter((s) => isDateInCurrentWeek(s.date)).reduce((acc, s) => acc + (s.totalMinutes || 0), 0);
  }, [sessions]);

  // Actions
  const createSession = async (session: Omit<PracticeSession, 'id'>) => {
    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const newSession: PracticeSession = { ...session, id: tempId };
    setSessions((prev) => [newSession, ...prev]);

    try {
      await addPracticeSession(session);
    } catch (e) {
      console.error('Error adding practice session:', e);
    }
  };

  const removeSession = async (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    try {
      if (!id.startsWith('seed-') && !id.startsWith('temp-')) {
        await deletePracticeSession(id);
      }
    } catch (e) {
      console.error('Error removing practice session:', e);
    }
  };

  const createGrammar = async (topic: Omit<GrammarTopic, 'id'>) => {
    const tempId = `temp-${Date.now()}`;
    const newTopic: GrammarTopic = { ...topic, id: tempId };
    setGrammar((prev) => [newTopic, ...prev]);

    try {
      await addGrammarTopic(topic);
    } catch (e) {
      console.error('Error adding grammar topic:', e);
    }
  };

  const editGrammar = async (id: string, updates: Partial<GrammarTopic>) => {
    setGrammar((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates, updatedAt: Date.now() } : g)));
    try {
      if (!id.startsWith('seed-') && !id.startsWith('temp-')) {
        await updateGrammarTopic(id, { ...updates, updatedAt: Date.now() });
      }
    } catch (e) {
      console.error('Error updating grammar topic:', e);
    }
  };

  const removeGrammar = async (id: string) => {
    setGrammar((prev) => prev.filter((g) => g.id !== id));
    try {
      if (!id.startsWith('seed-') && !id.startsWith('temp-')) {
        await deleteGrammarTopic(id);
      }
    } catch (e) {
      console.error('Error removing grammar topic:', e);
    }
  };

  const createWord = async (word: Omit<VocabularyWord, 'id'>) => {
    const tempId = `temp-${Date.now()}`;
    const newWord: VocabularyWord = { ...word, id: tempId };
    setVocabulary((prev) => [newWord, ...prev]);

    try {
      await addVocabularyWord(word);
    } catch (e) {
      console.error('Error adding word:', e);
    }
  };

  const editWord = async (id: string, updates: Partial<VocabularyWord>) => {
    setVocabulary((prev) => prev.map((w) => (w.id === id ? { ...w, ...updates } : w)));
    try {
      if (!id.startsWith('seed-') && !id.startsWith('temp-')) {
        await updateVocabularyWord(id, updates);
      }
    } catch (e) {
      console.error('Error updating word:', e);
    }
  };

  const removeWord = async (id: string) => {
    setVocabulary((prev) => prev.filter((w) => w.id !== id));
    try {
      if (!id.startsWith('seed-') && !id.startsWith('temp-')) {
        await deleteVocabularyWord(id);
      }
    } catch (e) {
      console.error('Error removing word:', e);
    }
  };

  const createGoal = async (goal: Omit<LanguageGoal, 'id'>) => {
    const tempId = `temp-${Date.now()}`;
    const newGoal: LanguageGoal = { ...goal, id: tempId };
    setGoals((prev) => [newGoal, ...prev]);

    try {
      await addLanguageGoal(goal);
    } catch (e) {
      console.error('Error adding goal:', e);
    }
  };

  const editGoal = async (id: string, updates: Partial<LanguageGoal>) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)));
    try {
      if (!id.startsWith('seed-') && !id.startsWith('temp-')) {
        await updateLanguageGoal(id, updates);
      }
    } catch (e) {
      console.error('Error updating goal:', e);
    }
  };

  const removeGoal = async (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    try {
      if (!id.startsWith('seed-') && !id.startsWith('temp-')) {
        await deleteLanguageGoal(id);
      }
    } catch (e) {
      console.error('Error removing goal:', e);
    }
  };

  const createNewLanguage = async (lang: Language) => {
    setLanguages((prev) => [...prev, lang]);
    try {
      await addLanguage(lang);
    } catch (e) {
      console.error('Error creating language:', e);
    }
  };

  return (
    <AppContext.Provider
      value={{
        languages,
        sessions,
        grammar,
        vocabulary,
        goals,
        activeTab,
        setActiveTab,
        syncStatus,
        modal,
        setModal,
        selectedLanguageForModal,
        setSelectedLanguageForModal,
        createSession,
        removeSession,
        createGrammar,
        editGrammar,
        removeGrammar,
        createWord,
        editWord,
        removeWord,
        createGoal,
        editGoal,
        removeGoal,
        createNewLanguage,
        todayMinutes,
        thisWeekMinutes,
        statsByLanguage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

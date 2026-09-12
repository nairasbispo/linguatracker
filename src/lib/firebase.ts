import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  onSnapshot,
  setDoc,
  addDoc,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  getDocs,
  Firestore,
} from 'firebase/firestore';
import type { PracticeSession, GrammarTopic, VocabularyWord, LanguageGoal, Language } from '../types';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db: Firestore = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Initial default languages
export const DEFAULT_LANGUAGES: Language[] = [
  {
    id: 'en',
    name: 'English',
    code: 'EN',
    color: '#059669',
    badgeBg: '#ECFDF5',
    badgeText: '#065F46',
    accentColor: '#10B981',
  },
  {
    id: 'fr',
    name: 'Français',
    code: 'FR',
    color: '#7C3AED',
    badgeBg: '#F5F3FF',
    badgeText: '#5B21B6',
    accentColor: '#8B5CF6',
  },
];

// Initial seed data matching the user's screenshots
export const INITIAL_SESSIONS: Omit<PracticeSession, 'id'>[] = [
  {
    languageId: 'fr',
    date: new Date().toISOString().split('T')[0],
    listening: 40,
    speaking: 30,
    reading: 30,
    writing: 20,
    totalMinutes: 120,
    notes: 'Listened to journal en français facile and reviewed grammar nuances.',
    createdAt: Date.now() - 3600000,
  },
];

export const INITIAL_GRAMMAR: Omit<GrammarTopic, 'id'>[] = [
  {
    languageId: 'en',
    title: 'Present Simple',
    status: 'practicing',
    confidence: 80,
    notes: 'Pay attention to 3rd person singular -s endings.',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
  },
];

export const INITIAL_VOCABULARY: Omit<VocabularyWord, 'id'>[] = [
  {
    languageId: 'en',
    word: 'Hi',
    pronunciation: '/Raɪ/',
    meaning: 'first greeting',
    createdAt: Date.now() - 86400000,
  },
  {
    languageId: 'fr',
    word: 'Bonjour',
    pronunciation: '/Bon.zhour/',
    meaning: 'Hi or Good morning',
    createdAt: Date.now() - 86400000,
  },
];

export const INITIAL_GOALS: Omit<LanguageGoal, 'id'>[] = [
  {
    languageId: 'en',
    skill: 'Total practice',
    period: 'week',
    targetMinutes: 30,
    active: true,
    createdAt: Date.now() - 86400000,
  },
  {
    languageId: 'fr',
    skill: 'Total practice',
    period: 'week',
    targetMinutes: 120,
    active: true,
    createdAt: Date.now() - 86400000,
  },
];

// Realtime subscription hook helpers
export function subscribeToCollection<T>(
  collectionName: string,
  onUpdate: (data: (T & { id: string })[]) => void,
  onError?: (err: Error) => void
) {
  const colRef = collection(db, collectionName);
  const q = query(colRef);

  return onSnapshot(
    q,
    (snapshot) => {
      const items: (T & { id: string })[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...(docSnap.data() as T) });
      });
      onUpdate(items);
    },
    (err) => {
      console.warn(`Firestore listener error on ${collectionName}:`, err);
      if (onError) onError(err);
    }
  );
}

// Check and seed initial data if empty
export async function seedInitialDataIfEmpty() {
  try {
    // 1. Languages
    const langSnap = await getDocs(collection(db, 'languages'));
    if (langSnap.empty) {
      for (const lang of DEFAULT_LANGUAGES) {
        await setDoc(doc(db, 'languages', lang.id), lang);
      }
    }

    // 2. Practice sessions
    const sessionSnap = await getDocs(collection(db, 'practice_sessions'));
    if (sessionSnap.empty) {
      for (const session of INITIAL_SESSIONS) {
        await addDoc(collection(db, 'practice_sessions'), session);
      }
    }

    // 3. Grammar topics
    const grammarSnap = await getDocs(collection(db, 'grammar_topics'));
    if (grammarSnap.empty) {
      for (const topic of INITIAL_GRAMMAR) {
        await addDoc(collection(db, 'grammar_topics'), topic);
      }
    }

    // 4. Vocabulary
    const vocabSnap = await getDocs(collection(db, 'vocabulary_words'));
    if (vocabSnap.empty) {
      for (const word of INITIAL_VOCABULARY) {
        await addDoc(collection(db, 'vocabulary_words'), word);
      }
    }

    // 5. Goals
    const goalSnap = await getDocs(collection(db, 'language_goals'));
    if (goalSnap.empty) {
      for (const goal of INITIAL_GOALS) {
        await addDoc(collection(db, 'language_goals'), goal);
      }
    }
  } catch (err) {
    console.warn('Initial seeding fallback handled:', err);
  }
}

// Database mutation actions
export async function addPracticeSession(session: Omit<PracticeSession, 'id'>) {
  return await addDoc(collection(db, 'practice_sessions'), session);
}

export async function deletePracticeSession(id: string) {
  return await deleteDoc(doc(db, 'practice_sessions', id));
}

export async function addGrammarTopic(topic: Omit<GrammarTopic, 'id'>) {
  return await addDoc(collection(db, 'grammar_topics'), topic);
}

export async function updateGrammarTopic(id: string, updates: Partial<GrammarTopic>) {
  return await updateDoc(doc(db, 'grammar_topics', id), updates);
}

export async function deleteGrammarTopic(id: string) {
  return await deleteDoc(doc(db, 'grammar_topics', id));
}

export async function addVocabularyWord(word: Omit<VocabularyWord, 'id'>) {
  return await addDoc(collection(db, 'vocabulary_words'), word);
}

export async function updateVocabularyWord(id: string, updates: Partial<VocabularyWord>) {
  return await updateDoc(doc(db, 'vocabulary_words', id), updates);
}

export async function deleteVocabularyWord(id: string) {
  return await deleteDoc(doc(db, 'vocabulary_words', id));
}

export async function addLanguageGoal(goal: Omit<LanguageGoal, 'id'>) {
  return await addDoc(collection(db, 'language_goals'), goal);
}

export async function updateLanguageGoal(id: string, updates: Partial<LanguageGoal>) {
  return await updateDoc(doc(db, 'language_goals', id), updates);
}

export async function deleteLanguageGoal(id: string) {
  return await deleteDoc(doc(db, 'language_goals', id));
}

export async function addLanguage(lang: Language) {
  return await setDoc(doc(db, 'languages', lang.id), lang);
}

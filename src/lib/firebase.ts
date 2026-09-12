import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
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
  getDocs,
  getDocFromServer,
  Firestore,
} from 'firebase/firestore';
import type { PracticeSession, GrammarTopic, VocabularyWord, LanguageGoal, Language } from '../types';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with custom database ID from config
export const db: Firestore = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Initialize Firebase Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Operation Types conforming to Firebase Skill guidelines
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Authentication Helpers
export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

export { onAuthStateChanged };
export type { User };

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

// Initial seed data matching the learner requirements
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
    pronunciation: '/haɪ/',
    meaning: 'Primeiro cumprimento, olá informal',
    createdAt: Date.now() - 86400000,
  },
  {
    languageId: 'fr',
    word: 'Bonjour',
    pronunciation: '/bɔ̃.ʒuʁ/',
    meaning: 'Bom dia ou olá formal/cotidiano',
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

// Realtime subscription hook helpers with hardened error callbacks
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
      if (onError) {
        onError(err);
      } else {
        try {
          handleFirestoreError(err, OperationType.GET, collectionName);
        } catch {
          // Handled via logging
        }
      }
    }
  );
}

// Test live connection to Firestore using getDocFromServer
export async function testFirestoreConnection(): Promise<{
  success: boolean;
  latencyMs: number;
  databaseId: string;
  projectId: string;
  error?: string;
}> {
  const start = performance.now();
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    const latencyMs = Math.round(performance.now() - start);
    return {
      success: true,
      latencyMs,
      databaseId: firebaseConfig.firestoreDatabaseId,
      projectId: firebaseConfig.projectId,
    };
  } catch (error) {
    const latencyMs = Math.round(performance.now() - start);
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Firestore connection test failed:', error);
    return {
      success: false,
      latencyMs,
      databaseId: firebaseConfig.firestoreDatabaseId,
      projectId: firebaseConfig.projectId,
      error: msg,
    };
  }
}

// Perform a real write + read + delete diagnostic test in Firestore
export async function runFirestoreDiagnosticWrite(): Promise<{
  success: boolean;
  writeLatencyMs: number;
  readLatencyMs: number;
  docId: string;
  error?: string;
}> {
  const testCol = collection(db, 'test');
  const testPayload = {
    testPing: true,
    timestamp: Date.now(),
    agent: 'LinguaTrack Diagnostics',
  };

  const startWrite = performance.now();
  let createdDocRef;
  try {
    createdDocRef = await addDoc(testCol, testPayload);
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.WRITE, 'test');
    } catch {
      // Ignored
    }
    return {
      success: false,
      writeLatencyMs: Math.round(performance.now() - startWrite),
      readLatencyMs: 0,
      docId: '',
      error: err instanceof Error ? err.message : String(err),
    };
  }
  const writeLatencyMs = Math.round(performance.now() - startWrite);

  const startRead = performance.now();
  try {
    await getDocFromServer(doc(db, 'test', createdDocRef.id));
  } catch (err) {
    return {
      success: false,
      writeLatencyMs,
      readLatencyMs: Math.round(performance.now() - startRead),
      docId: createdDocRef.id,
      error: err instanceof Error ? err.message : String(err),
    };
  }
  const readLatencyMs = Math.round(performance.now() - startRead);

  // Clean up test document
  try {
    await deleteDoc(doc(db, 'test', createdDocRef.id));
  } catch (e) {
    console.warn('Could not clean up test doc:', e);
  }

  return {
    success: true,
    writeLatencyMs,
    readLatencyMs,
    docId: createdDocRef.id,
  };
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

// Database mutation actions with strict error handlers
export async function addPracticeSession(session: Omit<PracticeSession, 'id'>) {
  try {
    return await addDoc(collection(db, 'practice_sessions'), session);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'practice_sessions');
    throw error;
  }
}

export async function deletePracticeSession(id: string) {
  try {
    return await deleteDoc(doc(db, 'practice_sessions', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `practice_sessions/${id}`);
    throw error;
  }
}

export async function addGrammarTopic(topic: Omit<GrammarTopic, 'id'>) {
  try {
    return await addDoc(collection(db, 'grammar_topics'), topic);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'grammar_topics');
    throw error;
  }
}

export async function updateGrammarTopic(id: string, updates: Partial<GrammarTopic>) {
  try {
    return await updateDoc(doc(db, 'grammar_topics', id), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `grammar_topics/${id}`);
    throw error;
  }
}

export async function deleteGrammarTopic(id: string) {
  try {
    return await deleteDoc(doc(db, 'grammar_topics', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `grammar_topics/${id}`);
    throw error;
  }
}

export async function addVocabularyWord(word: Omit<VocabularyWord, 'id'>) {
  try {
    return await addDoc(collection(db, 'vocabulary_words'), word);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'vocabulary_words');
    throw error;
  }
}

export async function updateVocabularyWord(id: string, updates: Partial<VocabularyWord>) {
  try {
    return await updateDoc(doc(db, 'vocabulary_words', id), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `vocabulary_words/${id}`);
    throw error;
  }
}

export async function deleteVocabularyWord(id: string) {
  try {
    return await deleteDoc(doc(db, 'vocabulary_words', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `vocabulary_words/${id}`);
    throw error;
  }
}

export async function addLanguageGoal(goal: Omit<LanguageGoal, 'id'>) {
  try {
    return await addDoc(collection(db, 'language_goals'), goal);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'language_goals');
    throw error;
  }
}

export async function updateLanguageGoal(id: string, updates: Partial<LanguageGoal>) {
  try {
    return await updateDoc(doc(db, 'language_goals', id), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `language_goals/${id}`);
    throw error;
  }
}

export async function deleteLanguageGoal(id: string) {
  try {
    return await deleteDoc(doc(db, 'language_goals', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `language_goals/${id}`);
    throw error;
  }
}

export async function addLanguage(lang: Language) {
  try {
    return await setDoc(doc(db, 'languages', lang.id), lang);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `languages/${lang.id}`);
    throw error;
  }
}

export type SkillType = 'listening' | 'speaking' | 'reading' | 'writing' | 'grammar';

export interface SkillContentDetail {
  format?: string;        // e.g. "YouTube", "Podcast", "Movie", "Article", "Book", "Journal", "Conversation"
  topicCategory?: string; // e.g. "AI / Tech", "Geopolitics", "Entertainment", "Science", "History", "Daily Life"
  titleOrDescription?: string; // specific content title or custom detail
}

export interface Language {
  id: string;
  name: string;
  code: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  accentColor: string;
}

export interface PracticeSession {
  id: string;
  languageId: string;
  date: string; // YYYY-MM-DD
  listening: number; // in minutes
  speaking: number;
  reading: number;
  writing: number;
  grammar?: number; // in minutes
  grammarTopic?: string; // e.g. "Passé Composé", "Conditionnel", "Phrasal Verbs"
  totalMinutes: number;
  notes?: string;
  createdAt: number;
  listeningDetail?: SkillContentDetail;
  readingDetail?: SkillContentDetail;
  writingDetail?: SkillContentDetail;
  speakingDetail?: SkillContentDetail;
}

export type GrammarStatus = 'learning' | 'practicing' | 'mastered';

export interface GrammarTopic {
  id: string;
  languageId: string;
  title: string;
  status: GrammarStatus;
  confidence: number; // 0 to 100
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface VocabularyWord {
  id: string;
  languageId: string;
  word: string;
  pronunciation?: string;
  meaning: string;
  meaningEn?: string; // English meaning/translation (used for French words)
  example?: string;
  mastered?: boolean;
  createdAt: number;
}

export interface LanguageGoal {
  id: string;
  languageId: string;
  skill: string; // 'total' | 'listening' | 'speaking' | 'reading' | 'writing'
  period: 'week' | 'day';
  targetMinutes: number;
  active: boolean;
  createdAt: number;
}

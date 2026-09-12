import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { OverviewView } from './components/OverviewView';
import { LanguageView } from './components/LanguageView';
import { GrammarView } from './components/GrammarView';
import { VocabularyView } from './components/VocabularyView';
import { GoalsView } from './components/GoalsView';
import { LogSessionModal } from './components/LogSessionModal';
import { AddGrammarModal } from './components/AddGrammarModal';
import { AddWordModal } from './components/AddWordModal';
import { AddGoalModal } from './components/AddGoalModal';
import { RitualTimerModal } from './components/RitualTimerModal';
import { FlashcardModal } from './components/FlashcardModal';
import { AddLanguageModal } from './components/AddLanguageModal';

const MainContent: React.FC = () => {
  const { activeTab, languages } = useApp();

  const currentLanguage = languages.find((l) => l.id === activeTab);

  return (
    <main className="flex-1 overflow-y-auto px-6 sm:px-10 py-8 bg-[#FAF8F2]">
      {activeTab === 'overview' && <OverviewView />}
      {activeTab === 'grammar' && <GrammarView />}
      {activeTab === 'vocabulary' && <VocabularyView />}
      {activeTab === 'goals' && <GoalsView />}
      {currentLanguage && <LanguageView language={currentLanguage} />}
    </main>
  );
};

export default function App() {
  return (
    <AppProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-[#FAF8F2] text-[#161B26]">
        {/* Left Navigation Workspace */}
        <Sidebar />

        {/* Right Application Stage */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <Header />
          <MainContent />
        </div>

        {/* Modals & Overlays */}
        <LogSessionModal />
        <AddGrammarModal />
        <AddWordModal />
        <AddGoalModal />
        <RitualTimerModal />
        <FlashcardModal />
        <AddLanguageModal />
      </div>
    </AppProvider>
  );
}

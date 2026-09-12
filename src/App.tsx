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
import { FirebaseStatusModal } from './components/FirebaseStatusModal';
import { MobileBottomNav } from './components/MobileBottomNav';

const MainContent: React.FC = () => {
  const { activeTab, languages } = useApp();

  const currentLanguage = languages.find((l) => l.id === activeTab);

  return (
    <main className="flex-1 overflow-y-auto px-3.5 sm:px-6 md:px-10 py-4 sm:py-8 pb-24 md:pb-8 bg-[#FAF8F2]">
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
        {/* Left Navigation Workspace (Responsive Desktop Sidebar + Mobile Drawer) */}
        <Sidebar />

        {/* Right Application Stage */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
          <Header />
          <MainContent />
          {/* Mobile Bottom Navigation */}
          <MobileBottomNav />
        </div>

        {/* Modals & Overlays */}
        <LogSessionModal />
        <AddGrammarModal />
        <AddWordModal />
        <AddGoalModal />
        <RitualTimerModal />
        <FlashcardModal />
        <AddLanguageModal />
        <FirebaseStatusModal />
      </div>
    </AppProvider>
  );
}

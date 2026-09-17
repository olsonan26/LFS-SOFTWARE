/**
 * @license
 * Lettrology Forensic Science - Primary Application Entry Point
 * PRD Full Compliance: Multi-Module Deterministic Criminology & Time-Map Research Platform
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Header, NavTab } from './components/Header.tsx';
import { CaseOverviewView } from './components/CaseOverviewView.tsx';
import { PeopleView } from './components/PeopleView.tsx';
import { ChartView } from './components/ChartView.tsx';
import { ForensicFocusView } from './components/ForensicFocusView.tsx';
import { ChronologyView } from './components/ChronologyView.tsx';
import { EvidenceView } from './components/EvidenceView.tsx';
import { DocumentsMediaView } from './components/DocumentsMediaView.tsx';
import { HypothesesView } from './components/HypothesesView.tsx';
import { ResearchView } from './components/ResearchView.tsx';
import { ReportsView } from './components/ReportsView.tsx';
import { MethodologyView } from './components/MethodologyView.tsx';
import { BlindAnalysisView } from './components/BlindAnalysisView.tsx';
import { NewCaseModal, NewPersonModal, NewEventModal } from './components/Modals.tsx';
import { InteractiveTutorial } from './components/InteractiveTutorial.tsx';
import { Compass, Sparkles, X, ArrowRight } from 'lucide-react';

import {
  SEED_CASES,
  SEED_PEOPLE,
  SEED_EVENTS,
  SEED_EVIDENCE,
  SEED_HYPOTHESES,
  SEED_USERS,
} from './data/seedData.ts';
import {
  CaseRecord,
  PersonRecord,
  EventRecord,
  EvidenceRecord,
  HypothesisRecord,
  UserProfile,
} from './types.ts';

export default function App() {
  // Global Navigation & User Role
  const [activeTab, setActiveTab] = useState<NavTab>('CHART');
  const [allUsers] = useState<UserProfile[]>(SEED_USERS);
  const [currentUser, setCurrentUser] = useState<UserProfile>(SEED_USERS[0]);

  // Core Entity State
  const [cases, setCases] = useState<CaseRecord[]>(SEED_CASES);
  const [activeCase, setActiveCase] = useState<CaseRecord>(SEED_CASES[0]);
  const [people, setPeople] = useState<PersonRecord[]>(SEED_PEOPLE);
  const [events, setEvents] = useState<EventRecord[]>(SEED_EVENTS);
  const [evidenceList, setEvidenceList] = useState<EvidenceRecord[]>(SEED_EVIDENCE);
  const [hypotheses, setHypotheses] = useState<HypothesisRecord[]>(SEED_HYPOTHESES);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Cross-Navigation Contexts
  const [chartSelectedPersonId, setChartSelectedPersonId] = useState<string>('');
  const [focusSelectedEventId, setFocusSelectedEventId] = useState<string>('');

  // Font Scale Accessibility State for Older Users
  const [fontScale, setFontScale] = useState<'normal' | 'large' | 'xlarge'>(() => {
    try {
      return (localStorage.getItem('lfs_font_scale') as any) || 'large';
    } catch {
      return 'large';
    }
  });

  const handleSetFontScale = (scale: 'normal' | 'large' | 'xlarge') => {
    setFontScale(scale);
    try {
      localStorage.setItem('lfs_font_scale', scale);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('font-scale-normal', 'font-scale-large', 'font-scale-xlarge');
      document.documentElement.classList.add(`font-scale-${fontScale}`);
    }
  }, [fontScale]);

  // Modals
  const [isNewCaseOpen, setIsNewCaseOpen] = useState<boolean>(false);
  const [isNewPersonOpen, setIsNewPersonOpen] = useState<boolean>(false);
  const [isNewEventOpen, setIsNewEventOpen] = useState<boolean>(false);

  // Tutorial State
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);
  const [showWelcomeBanner, setShowWelcomeBanner] = useState<boolean>(() => {
    try {
      return localStorage.getItem('lfs_tutorial_banner_dismissed') !== 'true';
    } catch {
      return true;
    }
  });

  const handleDismissBanner = () => {
    setShowWelcomeBanner(false);
    try {
      localStorage.setItem('lfs_tutorial_banner_dismissed', 'true');
    } catch {
      // ignore
    }
  };

  const handleLaunchTutorial = () => {
    handleDismissBanner();
    setIsTutorialOpen(true);
  };

  // Filtered entities for active case
  const activeCasePeople = useMemo(() => {
    return people.filter(p => activeCase?.peopleIds?.includes(p.personId));
  }, [people, activeCase]);

  const activeCaseEvents = useMemo(() => {
    return events.filter(e => e.caseId === activeCase?.caseId);
  }, [events, activeCase]);

  const activeCaseEvidence = useMemo(() => {
    return evidenceList.filter(ev => ev.caseId === activeCase?.caseId);
  }, [evidenceList, activeCase]);

  const activeCaseHypotheses = useMemo(() => {
    return hypotheses.filter(h => h.caseId === activeCase?.caseId);
  }, [hypotheses, activeCase]);

  // Handler: Jump to Chart with specific person
  const handleSelectPersonForChart = (personId: string) => {
    setChartSelectedPersonId(personId);
    setActiveTab('CHART');
  };

  // Handler: Jump to Forensic Focus with specific event
  const handleSelectEventForFocus = (event: EventRecord) => {
    setFocusSelectedEventId(event.eventId);
    setActiveTab('ANALYSIS');
  };

  // Creation Handlers
  const handleCreateCase = (newCase: CaseRecord) => {
    setCases(prev => [newCase, ...prev]);
    setActiveCase(newCase);
  };

  const handleCreatePerson = (newPerson: PersonRecord) => {
    setPeople(prev => [newPerson, ...prev]);
    setActiveCase(prev => ({
      ...prev,
      peopleIds: [...(prev.peopleIds || []), newPerson.personId],
    }));
  };

  const handleCreateEvent = (newEvent: EventRecord) => {
    setEvents(prev => [newEvent, ...prev]);
  };

  return (
    <div className={`min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-amber-200 selection:text-black font-scale-${fontScale}`}>
      {/* Top Global Header & Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        allUsers={allUsers}
        setCurrentUser={setCurrentUser}
        activeCase={activeCase}
        allCases={cases}
        setActiveCase={setActiveCase}
        onOpenNewCaseModal={() => setIsNewCaseOpen(true)}
        onOpenNewPersonModal={() => setIsNewPersonOpen(true)}
        onOpenNewEventModal={() => setIsNewEventOpen(true)}
        onOpenTutorial={() => setIsTutorialOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        fontScale={fontScale}
        onSetFontScale={handleSetFontScale}
      />

      {/* Welcome & Interactive Tutorial Prompt Banner (High Readability) */}
      {showWelcomeBanner && (
        <div className="bg-amber-50/80 border-b-2 border-amber-300 px-4 py-2.5 text-xs animate-in fade-in shadow-sm">
          <div className="max-w-[1700px] mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded bg-amber-200 text-amber-950 font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-slate-800 font-medium">
                <strong className="text-slate-950 font-bold">New to Lettrology Forensic Science?</strong> Master the deterministic time-map engine, six primary numbers, and evidentiary audit protocols in an easy, step-by-step interactive walkthrough.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleLaunchTutorial}
                className="px-3 py-1.5 rounded bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 text-xs shadow-sm border border-amber-600"
              >
                <Compass className="w-4 h-4" /> Start Interactive Tutorial
              </button>
              <button
                onClick={handleDismissBanner}
                className="p-1 text-slate-600 hover:text-black rounded hover:bg-amber-200 transition-colors"
                title="Dismiss banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Workspace Area */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto px-4 py-4 bg-white">
        {activeTab === 'CASES' && (
          <CaseOverviewView
            cases={cases}
            activeCase={activeCase}
            onSelectCase={setActiveCase}
            people={activeCasePeople.length > 0 ? activeCasePeople : people}
            events={activeCaseEvents.length > 0 ? activeCaseEvents : events}
            evidenceList={activeCaseEvidence.length > 0 ? activeCaseEvidence : evidenceList}
            onOpenNewCaseModal={() => setIsNewCaseOpen(true)}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'PEOPLE' && (
          <PeopleView
            caseRecord={activeCase}
            people={activeCasePeople.length > 0 ? activeCasePeople : people}
            onSelectPersonForChart={handleSelectPersonForChart}
            onOpenNewPersonModal={() => setIsNewPersonOpen(true)}
          />
        )}

        {activeTab === 'CHART' && (
          <ChartView
            caseRecord={activeCase}
            people={activeCasePeople.length > 0 ? activeCasePeople : people}
            events={activeCaseEvents.length > 0 ? activeCaseEvents : events}
            selectedPersonId={chartSelectedPersonId}
            onSelectPersonId={setChartSelectedPersonId}
            onJumpToForensicFocus={handleSelectEventForFocus}
          />
        )}

        {activeTab === 'ANALYSIS' && (
          <ForensicFocusView
            caseRecord={activeCase}
            events={activeCaseEvents.length > 0 ? activeCaseEvents : events}
            people={activeCasePeople.length > 0 ? activeCasePeople : people}
            evidenceList={activeCaseEvidence.length > 0 ? activeCaseEvidence : evidenceList}
            initialEventId={focusSelectedEventId}
          />
        )}

        {activeTab === 'CHRONOLOGY' && (
          <ChronologyView
            caseRecord={activeCase}
            events={activeCaseEvents.length > 0 ? activeCaseEvents : events}
            people={activeCasePeople.length > 0 ? activeCasePeople : people}
            evidenceList={activeCaseEvidence.length > 0 ? activeCaseEvidence : evidenceList}
            onSelectEventForFocus={handleSelectEventForFocus}
            onOpenNewEventModal={() => setIsNewEventOpen(true)}
          />
        )}

        {activeTab === 'EVIDENCE' && (
          <EvidenceView
            caseRecord={activeCase}
            evidenceList={activeCaseEvidence.length > 0 ? activeCaseEvidence : evidenceList}
            people={activeCasePeople.length > 0 ? activeCasePeople : people}
          />
        )}

        {activeTab === 'DOCUMENTS' && (
          <DocumentsMediaView
            caseRecord={activeCase}
            people={activeCasePeople.length > 0 ? activeCasePeople : people}
            mode="DOCUMENTS"
          />
        )}

        {activeTab === 'MEDIA' && (
          <DocumentsMediaView
            caseRecord={activeCase}
            people={activeCasePeople.length > 0 ? activeCasePeople : people}
            mode="MEDIA"
          />
        )}

        {activeTab === 'HYPOTHESES' && (
          <HypothesesView
            caseRecord={activeCase}
            hypotheses={activeCaseHypotheses.length > 0 ? activeCaseHypotheses : hypotheses}
            evidenceList={activeCaseEvidence.length > 0 ? activeCaseEvidence : evidenceList}
            events={activeCaseEvents.length > 0 ? activeCaseEvents : events}
          />
        )}

        {activeTab === 'RESEARCH' && (
          <ResearchView
            allCases={cases}
            allPeople={people}
            allEvents={events}
          />
        )}

        {activeTab === 'REPORTS' && (
          <ReportsView
            caseRecord={activeCase}
            people={activeCasePeople.length > 0 ? activeCasePeople : people}
            events={activeCaseEvents.length > 0 ? activeCaseEvents : events}
            evidenceList={activeCaseEvidence.length > 0 ? activeCaseEvidence : evidenceList}
            hypotheses={activeCaseHypotheses.length > 0 ? activeCaseHypotheses : hypotheses}
          />
        )}

        {activeTab === 'METHODOLOGY' && (
          <MethodologyView />
        )}

        {activeTab === 'BLIND' && (
          <BlindAnalysisView
            caseRecord={activeCase}
            events={activeCaseEvents.length > 0 ? activeCaseEvents : events}
          />
        )}
      </main>

      {/* Creation Modals */}
      <NewCaseModal
        isOpen={isNewCaseOpen}
        onClose={() => setIsNewCaseOpen(false)}
        onSubmit={handleCreateCase}
      />
      <NewPersonModal
        isOpen={isNewPersonOpen}
        onClose={() => setIsNewPersonOpen(false)}
        onSubmit={handleCreatePerson}
        caseId={activeCase.caseId}
      />
      <NewEventModal
        isOpen={isNewEventOpen}
        onClose={() => setIsNewEventOpen(false)}
        onSubmit={handleCreateEvent}
        caseId={activeCase.caseId}
        people={activeCasePeople.length > 0 ? activeCasePeople : people}
      />

      {/* Interactive Guided Tutorial */}
      <InteractiveTutorial
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        activeTab={activeTab}
        onNavigateTab={setActiveTab}
        onSelectPersonForChart={handleSelectPersonForChart}
      />
    </div>
  );
}

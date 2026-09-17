/**
 * @license
 * Lettrology Forensic Science - Primary Application Entry Point
 * PRD Full Compliance: Multi-Module Deterministic Criminology & Time-Map Research Platform
 */

import React, { useState, useMemo, useEffect } from "react";
import { Header, NavTab } from "./components/Header.tsx";
import { CaseTrailView } from "./components/CaseTrailView";
import { CaseOverviewView } from "./components/CaseOverviewView.tsx";
import { PeopleView } from "./components/PeopleView.tsx";
import { ChartView } from "./components/ChartView.tsx";
import { ForensicFocusView } from "./components/ForensicFocusView.tsx";
import { ChronologyView } from "./components/ChronologyView.tsx";
import { EvidenceView } from "./components/EvidenceView.tsx";
import { DocumentsMediaView } from "./components/DocumentsMediaView.tsx";
import { HypothesesView } from "./components/HypothesesView.tsx";
import { ResearchView } from "./components/ResearchView.tsx";
import { ReportsView } from "./components/ReportsView.tsx";
import { MethodologyView } from "./components/MethodologyView.tsx";
import { BlindAnalysisView } from "./components/BlindAnalysisView.tsx";
import {
  NewCaseModal,
  NewPersonModal,
  NewEventModal,
} from "./components/Modals.tsx";
import { InteractiveTutorial } from "./components/InteractiveTutorial.tsx";

import {
  SEED_CASES,
  SEED_PEOPLE,
  SEED_EVENTS,
  SEED_EVIDENCE,
  SEED_HYPOTHESES,
  SEED_USERS,
} from "./data/seedData.ts";
import {
  CaseRecord,
  PersonRecord,
  EventRecord,
  EvidenceRecord,
  HypothesisRecord,
  UserProfile,
} from "./types.ts";

export default function App() {
  // Global Navigation & User Role
  const [activeTab, setActiveTab] = useState<NavTab>("HOME");
  const [allUsers] = useState<UserProfile[]>(SEED_USERS);
  const [currentUser, setCurrentUser] = useState<UserProfile>(SEED_USERS[0]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  // Core Entity State
  const [cases, setCases] = useState<CaseRecord[]>(SEED_CASES);
  const [activeCase, setActiveCase] = useState<CaseRecord>(SEED_CASES[0]);
  const [people, setPeople] = useState<PersonRecord[]>(SEED_PEOPLE);
  const [events, setEvents] = useState<EventRecord[]>(SEED_EVENTS);
  const [evidenceList, setEvidenceList] =
    useState<EvidenceRecord[]>(SEED_EVIDENCE);
  const [hypotheses, setHypotheses] =
    useState<HypothesisRecord[]>(SEED_HYPOTHESES);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Cross-Navigation Contexts
  const [chartSelectedPersonId, setChartSelectedPersonId] =
    useState<string>("");
  const [focusSelectedEventId, setFocusSelectedEventId] = useState<string>("");

  // Font Scale Accessibility State for Older Users
  const [fontScale, setFontScale] = useState<"normal" | "large" | "xlarge">(
    () => {
      try {
        const saved = localStorage.getItem("lfs_font_scale");
        return saved === "normal" || saved === "xlarge" ? saved : "large";
      } catch {
        return "large";
      }
    },
  );

  const handleSetFontScale = (scale: "normal" | "large" | "xlarge") => {
    setFontScale(scale);
    try {
      localStorage.setItem("lfs_font_scale", scale);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.remove(
        "font-scale-normal",
        "font-scale-large",
        "font-scale-xlarge",
      );
      document.documentElement.classList.add(`font-scale-${fontScale}`);
    }
  }, [fontScale]);

  const [theme, setTheme] = useState<"dark" | "light">(() => {
    try {
      return localStorage.getItem("lfs_theme") === "light" ? "light" : "dark";
    } catch {
      return "dark";
    }
  });
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("lfs_theme", theme);
    } catch {}
  }, [theme]);

  const handleSelectCase = (c: CaseRecord) => {
    setActiveCase(c);
    setChartSelectedPersonId("");
    setFocusSelectedEventId("");
  };

  // Modals
  const [isNewCaseOpen, setIsNewCaseOpen] = useState<boolean>(false);
  const [isNewPersonOpen, setIsNewPersonOpen] = useState<boolean>(false);
  const [isNewEventOpen, setIsNewEventOpen] = useState<boolean>(false);

  // Tutorial State
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);
  // Filtered entities for active case
  const activeCasePeople = useMemo(() => {
    return people.filter((p) => activeCase?.peopleIds?.includes(p.personId));
  }, [people, activeCase]);

  const activeCaseEvents = useMemo(() => {
    return events.filter((e) => e.caseId === activeCase?.caseId);
  }, [events, activeCase]);

  const activeCaseEvidence = useMemo(() => {
    return evidenceList.filter((ev) => ev.caseId === activeCase?.caseId);
  }, [evidenceList, activeCase]);

  const activeCaseHypotheses = useMemo(() => {
    return hypotheses.filter((h) => h.caseId === activeCase?.caseId);
  }, [hypotheses, activeCase]);

  // Handler: Jump to Chart with specific person
  const handleSelectPersonForChart = (personId: string) => {
    setChartSelectedPersonId(personId);
    setActiveTab("CHART");
  };

  // Handler: Jump to Forensic Focus with specific event
  const handleSelectEventForFocus = (event: EventRecord) => {
    setFocusSelectedEventId(event.eventId);
    setActiveTab("ANALYSIS");
  };

  // Creation Handlers
  const handleCreateCase = (newCase: CaseRecord) => {
    setCases((prev) => [newCase, ...prev]);
    handleSelectCase(newCase);
    setActiveTab("TRAIL");
  };

  const handleCreatePerson = (newPerson: PersonRecord) => {
    setPeople((prev) => [newPerson, ...prev]);
    const updated = {
      ...activeCase,
      peopleIds: [...activeCase.peopleIds, newPerson.personId],
    };
    setActiveCase(updated);
    setCases((prev) =>
      prev.map((c) => (c.caseId === updated.caseId ? updated : c)),
    );
  };

  const handleCreateEvent = (newEvent: EventRecord) => {
    setEvents((prev) => [newEvent, ...prev]);
  };

  return (
    <div className="app-shell">
      {/* Top Global Header & Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        allUsers={allUsers}
        setCurrentUser={setCurrentUser}
        activeCase={activeCase}
        allCases={cases}
        setActiveCase={handleSelectCase}
        onOpenNewCaseModal={() => setIsNewCaseOpen(true)}
        onOpenNewPersonModal={() => setIsNewPersonOpen(true)}
        onOpenNewEventModal={() => setIsNewEventOpen(true)}
        onOpenTutorial={() => setIsTutorialOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        fontScale={fontScale}
        onSetFontScale={handleSetFontScale}
        theme={theme}
        onSetTheme={setTheme}
      />

      <main id="main-content" className="main-workspace" tabIndex={-1}>
        <div
          key={activeCase.caseId + ":" + activeTab}
          className={
            [
              "HOME",
              "CASES",
              "TRAIL",
              "PEOPLE",
              "CHRONOLOGY",
              "DOCUMENTS",
              "MEDIA",
              "EVIDENCE",
              "HYPOTHESES",
            ].includes(activeTab)
              ? "workspace-view"
              : "workspace-view legacy-view"
          }
        >
          {(activeTab === "CASES" || activeTab === "HOME") && (
            <CaseOverviewView
              cases={cases}
              activeCase={activeCase}
              onSelectCase={handleSelectCase}
              people={activeCasePeople}
              events={activeCaseEvents}
              evidenceList={evidenceList}
              onOpenNewCaseModal={() => setIsNewCaseOpen(true)}
              onNavigateTab={setActiveTab}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isHome={activeTab === "HOME"}
            />
          )}

          {activeTab === "TRAIL" && (
            <CaseTrailView
              caseRecord={activeCase}
              people={activeCasePeople}
              events={activeCaseEvents}
              evidenceList={activeCaseEvidence}
              onNavigate={setActiveTab}
              onPerson={(id) => {
                setChartSelectedPersonId(id);
                setActiveTab("PEOPLE");
              }}
              onEvent={handleSelectEventForFocus}
            />
          )}

          {activeTab === "PEOPLE" && (
            <PeopleView
              caseRecord={activeCase}
              people={activeCasePeople}
              onSelectPersonForChart={handleSelectPersonForChart}
              selectedPersonId={chartSelectedPersonId}
              events={activeCaseEvents}
              evidenceList={activeCaseEvidence}
              onOpenTimeline={() => setActiveTab("CHRONOLOGY")}
              onOpenEvidence={() => setActiveTab("EVIDENCE")}
              onOpenNewPersonModal={() => setIsNewPersonOpen(true)}
            />
          )}

          {activeTab === "CHART" && (
            <ChartView
              caseRecord={activeCase}
              people={activeCasePeople}
              events={activeCaseEvents}
              selectedPersonId={chartSelectedPersonId}
              onSelectPersonId={setChartSelectedPersonId}
              onJumpToForensicFocus={handleSelectEventForFocus}
            />
          )}

          {activeTab === "ANALYSIS" && (
            <ForensicFocusView
              caseRecord={activeCase}
              events={activeCaseEvents}
              people={activeCasePeople}
              evidenceList={activeCaseEvidence}
              initialEventId={focusSelectedEventId}
            />
          )}

          {activeTab === "CHRONOLOGY" && (
            <ChronologyView
              caseRecord={activeCase}
              events={activeCaseEvents}
              people={activeCasePeople}
              evidenceList={activeCaseEvidence}
              onSelectEventForFocus={handleSelectEventForFocus}
              onOpenNewEventModal={() => setIsNewEventOpen(true)}
            />
          )}

          {activeTab === "EVIDENCE" && (
            <EvidenceView
              caseRecord={activeCase}
              evidenceList={activeCaseEvidence}
              people={activeCasePeople}
            />
          )}

          {activeTab === "DOCUMENTS" && (
            <DocumentsMediaView
              caseRecord={activeCase}
              people={activeCasePeople}
              mode="DOCUMENTS"
            />
          )}

          {activeTab === "MEDIA" && (
            <DocumentsMediaView
              caseRecord={activeCase}
              people={activeCasePeople}
              mode="MEDIA"
            />
          )}

          {activeTab === "HYPOTHESES" && (
            <HypothesesView
              caseRecord={activeCase}
              hypotheses={activeCaseHypotheses}
              evidenceList={activeCaseEvidence}
              events={activeCaseEvents}
            />
          )}

          {activeTab === "RESEARCH" && (
            <ResearchView
              allCases={cases}
              allPeople={people}
              allEvents={events}
            />
          )}

          {activeTab === "REPORTS" && (
            <ReportsView
              caseRecord={activeCase}
              people={activeCasePeople}
              events={activeCaseEvents}
              evidenceList={activeCaseEvidence}
              hypotheses={activeCaseHypotheses}
            />
          )}

          {activeTab === "METHODOLOGY" && <MethodologyView />}

          {activeTab === "BLIND" && (
            <BlindAnalysisView
              caseRecord={activeCase}
              events={activeCaseEvents}
            />
          )}
        </div>
      </main>

      {/* Creation Modals */}
      <NewCaseModal
        key={String(isNewCaseOpen)}
        isOpen={isNewCaseOpen}
        onClose={() => setIsNewCaseOpen(false)}
        onSubmit={handleCreateCase}
      />
      <NewPersonModal
        key={activeCase.caseId + String(isNewPersonOpen)}
        isOpen={isNewPersonOpen}
        onClose={() => setIsNewPersonOpen(false)}
        onSubmit={handleCreatePerson}
        caseId={activeCase.caseId}
      />
      <NewEventModal
        key={activeCase.caseId + String(isNewEventOpen)}
        isOpen={isNewEventOpen}
        onClose={() => setIsNewEventOpen(false)}
        onSubmit={handleCreateEvent}
        caseId={activeCase.caseId}
        people={activeCasePeople}
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

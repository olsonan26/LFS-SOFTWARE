/**
 * @license
 * Lettrology Forensic Science - Primary Application Entry Point
 * PRD Full Compliance: Multi-Module Deterministic Criminology & Time-Map Research Platform
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import { NewCaseModal, NewEventModal } from "./components/Modals.tsx";
import { HistoricalNewPersonModal } from "./components/HistoricalNewPersonModal.tsx";
import { InteractiveTutorial } from "./components/InteractiveTutorial.tsx";
import { CloudAccessModal } from "./components/CloudAccessModal.tsx";

import {
  SEED_CASES,
  SEED_PEOPLE,
  SEED_EVENTS,
  SEED_EVIDENCE,
  SEED_HYPOTHESES,
  SEED_USERS,
} from "./data/seedData.ts";
import {
  LFS_STORAGE_KEYS,
  loadStoredValue,
  saveStoredValue,
} from "./data/localPersistence.ts";
import {
  ensureCloudSession,
  getStoredCloudSession,
  listCollaborators,
  loadSharedRecords,
  upsertSharedRecord,
  type CloudSession,
  type SharedRecord,
  type SharedRecordType,
} from "./data/cloudWorkspace.ts";
import {
  CaseRecord,
  PersonRecord,
  EventRecord,
  EvidenceRecord,
  HypothesisRecord,
  UserProfile,
} from "./types.ts";

type CloudStatus = "signed-out" | "connecting" | "synced" | "denied" | "error";

function stableHash(value: unknown) {
  return JSON.stringify(value);
}

function sharedKey(type: SharedRecordType, id: string) {
  return `${type}:${id}`;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>("HOME");
  const [allUsers] = useState<UserProfile[]>(SEED_USERS);
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const savedUserId = loadStoredValue<string>(LFS_STORAGE_KEYS.currentUserId, "");
    return SEED_USERS.find((user) => user.userId === savedUserId) || SEED_USERS[0];
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  const [cases, setCases] = useState<CaseRecord[]>(() =>
    loadStoredValue<CaseRecord[]>(LFS_STORAGE_KEYS.cases, SEED_CASES),
  );
  const [people, setPeople] = useState<PersonRecord[]>(() =>
    loadStoredValue<PersonRecord[]>(LFS_STORAGE_KEYS.people, SEED_PEOPLE),
  );
  const [events, setEvents] = useState<EventRecord[]>(() =>
    loadStoredValue<EventRecord[]>(LFS_STORAGE_KEYS.events, SEED_EVENTS),
  );
  const [evidenceList, setEvidenceList] = useState<EvidenceRecord[]>(() =>
    loadStoredValue<EvidenceRecord[]>(LFS_STORAGE_KEYS.evidence, SEED_EVIDENCE),
  );
  const [hypotheses, setHypotheses] = useState<HypothesisRecord[]>(() =>
    loadStoredValue<HypothesisRecord[]>(LFS_STORAGE_KEYS.hypotheses, SEED_HYPOTHESES),
  );
  const [activeCase, setActiveCase] = useState<CaseRecord>(() => {
    const savedCaseId = loadStoredValue<string>(LFS_STORAGE_KEYS.activeCaseId, "");
    return cases.find((item) => item.caseId === savedCaseId) || cases[0] || SEED_CASES[0];
  });

  useEffect(() => saveStoredValue(LFS_STORAGE_KEYS.cases, cases), [cases]);
  useEffect(() => saveStoredValue(LFS_STORAGE_KEYS.people, people), [people]);
  useEffect(() => saveStoredValue(LFS_STORAGE_KEYS.events, events), [events]);
  useEffect(() => saveStoredValue(LFS_STORAGE_KEYS.evidence, evidenceList), [evidenceList]);
  useEffect(() => saveStoredValue(LFS_STORAGE_KEYS.hypotheses, hypotheses), [hypotheses]);
  useEffect(() => {
    saveStoredValue(LFS_STORAGE_KEYS.activeCaseId, activeCase.caseId);
  }, [activeCase.caseId]);
  useEffect(() => {
    saveStoredValue(LFS_STORAGE_KEYS.currentUserId, currentUser.userId);
  }, [currentUser.userId]);

  // Shared cloud workspace. Local storage stays as an offline backup; approved
  // Supabase collaborators exchange the same case/person records across devices.
  const [cloudSession, setCloudSession] = useState<CloudSession | null>(() =>
    getStoredCloudSession(),
  );
  const [cloudStatus, setCloudStatus] = useState<CloudStatus>(
    cloudSession ? "connecting" : "signed-out",
  );
  const [cloudModalOpen, setCloudModalOpen] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string>();
  const syncedHashes = useRef<Record<string, string>>({});

  const mergeRemote = useCallback(
    <T extends Record<string, any>>(
      current: T[],
      rows: SharedRecord[],
      type: SharedRecordType,
      idField: keyof T,
    ) => {
      const map = new Map(current.map((item) => [String(item[idField]), item]));
      for (const row of rows.filter((item) => item.record_type === type)) {
        const id = row.record_id;
        const remote = row.payload as T;
        const local = map.get(id);
        const key = sharedKey(type, id);
        const baseline = syncedHashes.current[key];
        const localHash = local ? stableHash(local) : "";
        const remoteHash = stableHash(remote);

        // Remote wins when the local record has not changed since the last sync.
        // If a local edit is pending, keep it so the outbound sync can save it.
        if (!local || !baseline || localHash === baseline) {
          map.set(id, remote);
          syncedHashes.current[key] = remoteHash;
        }
      }
      return Array.from(map.values());
    },
    [],
  );

  const syncFromCloud = useCallback(
    async (sessionOverride?: CloudSession | null, quiet = false) => {
      const sourceSession = sessionOverride || cloudSession;
      if (!sourceSession) {
        setCloudStatus("signed-out");
        return;
      }

      if (!quiet) setCloudStatus("connecting");
      try {
        const validSession = await ensureCloudSession(sourceSession);
        if (!validSession) {
          setCloudSession(null);
          setCloudStatus("signed-out");
          return;
        }
        if (validSession.accessToken !== sourceSession.accessToken) {
          setCloudSession(validSession);
        }

        const collaborators = await listCollaborators(validSession);
        const hasAccess = collaborators.some(
          (item) => item.email === validSession.user.email,
        );
        if (!hasAccess) {
          setCloudStatus("denied");
          return;
        }

        const rows = await loadSharedRecords(validSession);
        setCases((prev) => mergeRemote(prev, rows, "case", "caseId"));
        setPeople((prev) => mergeRemote(prev, rows, "person", "personId"));
        setEvents((prev) => mergeRemote(prev, rows, "event", "eventId"));
        setEvidenceList((prev) => mergeRemote(prev, rows, "evidence", "evidenceId"));
        setHypotheses((prev) =>
          mergeRemote(prev, rows, "hypothesis", "hypothesisId"),
        );
        setCloudStatus("synced");
        setLastSyncedAt(new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
      } catch (error) {
        console.error("Unable to load shared LFS workspace", error);
        setCloudStatus("error");
      }
    },
    [cloudSession, mergeRemote],
  );

  useEffect(() => {
    if (!cloudSession) {
      setCloudStatus("signed-out");
      return;
    }
    void syncFromCloud(cloudSession);
  }, [cloudSession?.accessToken]);

  useEffect(() => {
    if (!cloudSession || cloudStatus !== "synced") return;
    const timer = window.setInterval(() => {
      void syncFromCloud(cloudSession, true);
    }, 10000);
    return () => window.clearInterval(timer);
  }, [cloudSession?.accessToken, cloudStatus, syncFromCloud]);

  // Save only records that changed since the last successful cloud read/write.
  // A short debounce keeps a rapid run of checkbox clicks from creating noisy writes.
  useEffect(() => {
    if (!cloudSession || cloudStatus !== "synced") return;

    const timer = window.setTimeout(async () => {
      const entries: Array<{
        type: SharedRecordType;
        id: string;
        payload: SharedRecord["payload"];
      }> = [
        ...cases.map((payload) => ({ type: "case" as const, id: payload.caseId, payload })),
        ...people.map((payload) => ({ type: "person" as const, id: payload.personId, payload })),
        ...events.map((payload) => ({ type: "event" as const, id: payload.eventId, payload })),
        ...evidenceList.map((payload) => ({ type: "evidence" as const, id: payload.evidenceId, payload })),
        ...hypotheses.map((payload) => ({ type: "hypothesis" as const, id: payload.hypothesisId, payload })),
      ];

      const changed = entries.filter(({ type, id, payload }) => {
        return syncedHashes.current[sharedKey(type, id)] !== stableHash(payload);
      });
      if (!changed.length) return;

      try {
        await Promise.all(
          changed.map(({ type, id, payload }) =>
            upsertSharedRecord(cloudSession, type, id, payload),
          ),
        );
        for (const { type, id, payload } of changed) {
          syncedHashes.current[sharedKey(type, id)] = stableHash(payload);
        }
        setLastSyncedAt(new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
      } catch (error) {
        console.error("Unable to save shared LFS workspace", error);
        setCloudStatus("error");
      }
    }, 550);

    return () => window.clearTimeout(timer);
  }, [cases, people, events, evidenceList, hypotheses, cloudSession, cloudStatus]);

  // Keep the active-case object current when another collaborator changes that case.
  useEffect(() => {
    const fresh = cases.find((item) => item.caseId === activeCase.caseId);
    if (fresh && stableHash(fresh) !== stableHash(activeCase)) {
      setActiveCase(fresh);
    }
  }, [cases, activeCase]);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [chartSelectedPersonId, setChartSelectedPersonId] = useState<string>("");
  const [focusSelectedEventId, setFocusSelectedEventId] = useState<string>("");

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
    } catch {}
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

  const [isNewCaseOpen, setIsNewCaseOpen] = useState<boolean>(false);
  const [isNewPersonOpen, setIsNewPersonOpen] = useState<boolean>(false);
  const [isNewEventOpen, setIsNewEventOpen] = useState<boolean>(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);

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

  const handleSelectPersonForChart = (personId: string) => {
    setChartSelectedPersonId(personId);
    setActiveTab("CHART");
  };

  const handleSelectEventForFocus = (event: EventRecord) => {
    setFocusSelectedEventId(event.eventId);
    setActiveTab("ANALYSIS");
  };

  const handleCreateCase = (newCase: CaseRecord) => {
    setCases((prev) => [newCase, ...prev]);
    handleSelectCase(newCase);
    setActiveTab("TRAIL");
  };

  const handleCreatePerson = (newPerson: PersonRecord) => {
    setPeople((prev) => [newPerson, ...prev]);
    const updated = {
      ...activeCase,
      peopleIds: Array.from(new Set([...activeCase.peopleIds, newPerson.personId])),
      lastUpdated: new Date().toISOString(),
    };
    setActiveCase(updated);
    setCases((prev) =>
      prev.map((c) => (c.caseId === updated.caseId ? updated : c)),
    );
  };

  const handleUpdatePerson = (updatedPerson: PersonRecord) => {
    setPeople((prev) =>
      prev.map((person) =>
        person.personId === updatedPerson.personId ? updatedPerson : person,
      ),
    );
    const updatedCase = { ...activeCase, lastUpdated: new Date().toISOString() };
    setActiveCase(updatedCase);
    setCases((prev) =>
      prev.map((c) => (c.caseId === updatedCase.caseId ? updatedCase : c)),
    );
  };

  const handleCreateEvent = (newEvent: EventRecord) => {
    setEvents((prev) => [newEvent, ...prev]);
    const updated = { ...activeCase, lastUpdated: new Date().toISOString() };
    setActiveCase(updated);
    setCases((prev) =>
      prev.map((c) => (c.caseId === updated.caseId ? updated : c)),
    );
  };

  return (
    <div className="app-shell">
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
        onOpenCloud={() => setCloudModalOpen(true)}
        cloudStatus={cloudStatus}
        cloudEmail={cloudSession?.user.email}
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
              onUpdatePerson={handleUpdatePerson}
              editorName={currentUser.name}
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
            <ResearchView allCases={cases} allPeople={people} allEvents={events} />
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
            <BlindAnalysisView caseRecord={activeCase} events={activeCaseEvents} />
          )}
        </div>
      </main>

      <NewCaseModal
        key={String(isNewCaseOpen)}
        isOpen={isNewCaseOpen}
        onClose={() => setIsNewCaseOpen(false)}
        onSubmit={handleCreateCase}
      />
      <HistoricalNewPersonModal
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

      <CloudAccessModal
        open={cloudModalOpen}
        onClose={() => setCloudModalOpen(false)}
        session={cloudSession}
        cloudStatus={cloudStatus}
        lastSyncedAt={lastSyncedAt}
        onSessionChange={(session) => {
          setCloudSession(session);
          setCloudStatus(session ? "connecting" : "signed-out");
          if (!session) syncedHashes.current = {};
        }}
        onSyncNow={() => syncFromCloud(cloudSession)}
      />

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

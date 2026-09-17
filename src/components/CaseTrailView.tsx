import React, { useState } from "react";
import {
  FolderOpen,
  Users,
  CalendarDays,
  FileText,
  ChevronDown,
  Minus,
  Plus,
  Maximize2,
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import {
  CaseRecord,
  PersonRecord,
  EventRecord,
  EvidenceRecord,
} from "../types";
import { NavTab } from "./Header";
import {
  ContextInspector,
  ExpandableSection,
  FollowTrail,
  PageHeading,
  humanize,
  displayDate,
} from "./WorkspaceUI";
interface Props {
  caseRecord: CaseRecord;
  people: PersonRecord[];
  events: EventRecord[];
  evidenceList: EvidenceRecord[];
  onNavigate: (tab: NavTab) => void;
  onPerson: (id: string) => void;
  onEvent: (event: EventRecord) => void;
}
type Selection = { kind: "person" | "event" | "source"; id: string } | null;
export function EventDetails({
  event,
  people,
  evidenceList,
  onAnalyze,
}: {
  event: EventRecord;
  people: PersonRecord[];
  evidenceList: EvidenceRecord[];
  onAnalyze: () => void;
}) {
  const linked = evidenceList.filter((e) =>
    event.evidenceIds.includes(e.evidenceId),
  );
  return (
    <>
      <span className="status-badge">{humanize(event.factStatus)}</span>
      <p className="detail-date">
        {displayDate(event.startDate)}
        {event.time && ` · ${event.time}`}
      </p>
      <p>{event.description}</p>
      <dl className="detail-list">
        <dt>Location</dt>
        <dd>{event.location || "Not recorded"}</dd>
        <dt>Date precision</dt>
        <dd>{humanize(event.datePrecision)}</dd>
        <dt>People involved</dt>
        <dd>
          {people
            .filter((p) => event.peopleInvolved.includes(p.personId))
            .map((p) => p.displayName)
            .join(", ") || "No linked people"}
        </dd>
        <dt>Source reliability</dt>
        <dd>{humanize(event.sourceReliability)}</dd>
      </dl>
      <ExpandableSection
        title="Supporting sources"
        summary={`${linked.length} linked records`}
      >
        {linked.length ? (
          linked.map((ev) => (
            <div className="citation" key={ev.evidenceId}>
              <strong>{ev.title}</strong>
              <p>{ev.sourcePublisher}</p>
              {ev.extractedFacts.map((f) => (
                <blockquote key={f.factId}>
                  {f.exactStatement}
                  <cite>{f.citation}</cite>
                </blockquote>
              ))}
            </div>
          ))
        ) : (
          <p>No source records attached yet.</p>
        )}
        {event.evidenceIds.length > linked.length && (
          <p className="muted">
            Some referenced source files have not been attached.
          </p>
        )}
      </ExpandableSection>
      <FollowTrail
        items={[{ label: "Explore Lettrology context", action: onAnalyze }]}
      />
    </>
  );
}
export function CaseTrailView(p: Props) {
  const [selected, setSelected] = useState<Selection>(null);
  const [branch, setBranch] = useState<"people" | "events" | "sources" | null>(
    null,
  );
  const [zoom, setZoom] = useState(100);
  const person =
    selected?.kind === "person"
      ? p.people.find((x) => x.personId === selected.id)
      : null;
  const event =
    selected?.kind === "event"
      ? p.events.find((x) => x.eventId === selected.id)
      : null;
  const source =
    selected?.kind === "source"
      ? p.evidenceList.find((x) => x.evidenceId === selected.id)
      : null;
  const incident =
    p.events.find((e) => e.eventId === p.caseRecord.primaryIncidentId) ||
    p.events[0];
  const groups = [
    {
      id: "people" as const,
      label: "People",
      description: "Who is part of this case?",
      icon: Users,
      count: p.people.length,
    },
    {
      id: "events" as const,
      label: "Events",
      description: "What happened, and when?",
      icon: CalendarDays,
      count: p.events.length,
    },
    {
      id: "sources" as const,
      label: "Evidence",
      description: "What supports the record?",
      icon: FileText,
      count: p.evidenceList.length,
    },
  ];
  return (
    <div className="page-stack">
      <PageHeading
        eyebrow="Follow the connections"
        title="Case Trail"
        description="Start with the case. Open a branch to see what connects."
        action={
          <button
            className="secondary-button"
            onClick={() => p.onNavigate("CHRONOLOGY")}
          >
            View timeline
            <ArrowRight size={19} />
          </button>
        }
      />
      <div
        className={`investigation-layout ${selected ? "with-inspector" : ""}`}
      >
        <section className="trail-canvas" aria-label="Interactive case trail">
          <div className="canvas-topline">
            <span className="eyebrow">Case connections</span>
            <span className="muted">Select a branch to explore</span>
          </div>
          <div className="trail-scroll">
            <div className="trail-graph" style={{ zoom: zoom / 100 }}>
              <div className="trail-root">
                <FolderOpen size={26} />
                <div>
                  <span className="eyebrow">{p.caseRecord.caseNumber}</span>
                  <h2>{p.caseRecord.title}</h2>
                </div>
              </div>
              <div className="trail-connection">Contains</div>
              <div className="trail-branches">
                {groups.map(({ id, label, description, icon: Icon, count }) => (
                  <div className="trail-branch" key={id}>
                    <button
                      className={`branch-button ${branch === id ? "selected" : ""}`}
                      onClick={() => {
                        setBranch(branch === id ? null : id);
                        setSelected(null);
                      }}
                      aria-expanded={branch === id}
                    >
                      <Icon size={25} />
                      <strong>{label}</strong>
                      <span>{count} records</span>
                      <ChevronDown size={19} />
                    </button>
                    <p>{description}</p>
                  </div>
                ))}
              </div>
              {branch && (
                <div className="branch-results">
                  <span className="eyebrow">
                    {branch === "people"
                      ? "People in this case"
                      : branch === "events"
                        ? "Recorded events"
                        : "Source records"}
                  </span>
                  {branch === "people" &&
                    p.people.map((x) => (
                      <button
                        key={x.personId}
                        className="trail-record"
                        aria-pressed={selected?.id === x.personId}
                        onClick={() =>
                          setSelected({ kind: "person", id: x.personId })
                        }
                      >
                        <Users size={20} />
                        <span>
                          <strong>{x.displayName}</strong>
                          <small>{humanize(x.roleInCase)}</small>
                        </span>
                        <ArrowRight size={18} />
                      </button>
                    ))}
                  {branch === "events" &&
                    [...p.events]
                      .sort((a, b) => a.startDate.localeCompare(b.startDate))
                      .map((x) => (
                        <button
                          key={x.eventId}
                          className="trail-record"
                          aria-pressed={selected?.id === x.eventId}
                          onClick={() =>
                            setSelected({ kind: "event", id: x.eventId })
                          }
                        >
                          <CalendarDays size={20} />
                          <span>
                            <strong>{x.title}</strong>
                            <small>{displayDate(x.startDate)}</small>
                          </span>
                          <ArrowRight size={18} />
                        </button>
                      ))}
                  {branch === "sources" &&
                    p.evidenceList.map((x) => (
                      <button
                        key={x.evidenceId}
                        className="trail-record"
                        aria-pressed={selected?.id === x.evidenceId}
                        onClick={() =>
                          setSelected({ kind: "source", id: x.evidenceId })
                        }
                      >
                        <FileText size={20} />
                        <span>
                          <strong>{x.title}</strong>
                          <small>{humanize(x.evidenceType)}</small>
                        </span>
                        <ArrowRight size={18} />
                      </button>
                    ))}
                  {!groups.find((g) => g.id === branch)?.count && (
                    <p>No {branch} have been added to this case.</p>
                  )}
                </div>
              )}
              {!branch && (
                <div className="trail-start">
                  <p className="eyebrow">A place to begin</p>
                  {incident ? (
                    <button
                      className="trail-record"
                      onClick={() => {
                        setBranch("events");
                        setSelected({ kind: "event", id: incident.eventId });
                      }}
                    >
                      <CalendarDays size={22} />
                      <span>
                        <strong>{incident.title}</strong>
                        <small>{displayDate(incident.startDate)}</small>
                      </span>
                      <ArrowRight size={19} />
                    </button>
                  ) : (
                    <p>Open People or add an event to begin this trail.</p>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="canvas-footer">
            <span>
              <FileText size={17} />
              Recorded links only
            </span>
            <div className="zoom-controls">
              <button
                className="icon-button"
                aria-label="Zoom out"
                disabled={zoom <= 80}
                onClick={() => setZoom((z) => Math.max(80, z - 10))}
              >
                <Minus size={18} />
              </button>
              <output aria-live="polite">{zoom}%</output>
              <button
                className="icon-button"
                aria-label="Zoom in"
                disabled={zoom >= 150}
                onClick={() => setZoom((z) => Math.min(150, z + 10))}
              >
                <Plus size={18} />
              </button>
              <button
                className="icon-button"
                aria-label="Reset zoom"
                onClick={() => setZoom(100)}
              >
                <Maximize2 size={18} />
              </button>
            </div>
          </div>
        </section>
        {selected && (
          <ContextInspector
            title={
              person?.displayName || event?.title || source?.title || "Record"
            }
            onClose={() => setSelected(null)}
          >
            {person && (
              <>
                <span className="status-badge">
                  {humanize(person.roleInCase)}
                </span>
                <p>
                  {person.occupation || "Person linked to this investigation."}
                </p>
                <dl className="detail-list">
                  <dt>Birth name</dt>
                  <dd>{person.verifiedBirthName}</dd>
                  <dt>Date of birth</dt>
                  <dd>{displayDate(person.dob)}</dd>
                  <dt>Name source</dt>
                  <dd>{person.sourceForName}</dd>
                </dl>
                <FollowTrail
                  items={[
                    {
                      label: `Who is ${person.displayName.split(" ")[0]}?`,
                      action: () => p.onPerson(person.personId),
                    },
                    {
                      label: "View people in this case",
                      action: () => p.onNavigate("PEOPLE"),
                    },
                  ]}
                />
              </>
            )}
            {event && (
              <EventDetails
                event={event}
                people={p.people}
                evidenceList={p.evidenceList}
                onAnalyze={() => p.onEvent(event)}
              />
            )}
            {source && (
              <>
                <span className="status-badge">
                  {humanize(source.verificationStatus)}
                </span>
                <p>{source.sourcePublisher}</p>
                <p className="muted">{displayDate(source.publicationDate)}</p>
                {source.extractedFacts.map((f) => (
                  <blockquote className="citation" key={f.factId}>
                    {f.exactStatement}
                    <cite>{f.citation}</cite>
                  </blockquote>
                ))}
                <FollowTrail
                  items={[
                    {
                      label: "Open evidence workspace",
                      action: () => p.onNavigate("EVIDENCE"),
                    },
                  ]}
                />
              </>
            )}
          </ContextInspector>
        )}
      </div>
      <div className="quiet-next">
        <HelpCircle size={20} />
        <span>What needs a closer look?</span>
        <button
          className="text-button"
          onClick={() => p.onNavigate("HYPOTHESES")}
        >
          Open questions
          <ArrowRight size={17} />
        </button>
      </div>
      <ExpandableSection
        title="Case details"
        summary="Synopsis, investigation owner and record information"
      >
        <p>{p.caseRecord.synopsis}</p>
        <dl className="detail-list">
          <dt>Lead investigator</dt>
          <dd>{p.caseRecord.leadInvestigator}</dd>
          <dt>Location</dt>
          <dd>{p.caseRecord.primaryLocation}</dd>
          <dt>Last updated</dt>
          <dd>{displayDate(p.caseRecord.lastUpdated)}</dd>
          <dt>Record visibility</dt>
          <dd>{humanize(p.caseRecord.privacyLevel)}</dd>
          <dt>External case number</dt>
          <dd>{p.caseRecord.externalCaseNumber || "Not recorded"}</dd>
        </dl>
      </ExpandableSection>
    </div>
  );
}

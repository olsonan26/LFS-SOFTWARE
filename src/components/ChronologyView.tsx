import React, { useMemo, useState } from "react";
import { Plus, Search, CalendarDays, ArrowRight } from "lucide-react";
import {
  EventRecord,
  PersonRecord,
  CaseRecord,
  EvidenceRecord,
} from "../types";
import {
  ContextInspector,
  EmptyState,
  PageHeading,
  displayDate,
  humanize,
} from "./WorkspaceUI";
import { EventDetails } from "./CaseTrailView";
interface Props {
  caseRecord: CaseRecord;
  events: EventRecord[];
  people: PersonRecord[];
  evidenceList: EvidenceRecord[];
  onSelectEventForFocus: (event: EventRecord) => void;
  onOpenNewEventModal: () => void;
}
export function ChronologyView(p: Props) {
  const [category, setCategory] = useState("ALL");
  const [person, setPerson] = useState("ALL");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<EventRecord | null>(null);
  const [range, setRange] = useState("ALL");
  const categories = Array.from(new Set(p.events.map((e) => e.category)));
  const incident =
    p.events.find((e) => e.eventId === p.caseRecord.primaryIncidentId) ||
    p.events[0];
  const filtered = useMemo(
    () =>
      [...p.events]
        .filter(
          (e) =>
            (category === "ALL" || e.category === category) &&
            (person === "ALL" || e.peopleInvolved.includes(person)) &&
            (range === "ALL" || e.startDate === incident?.startDate) &&
            `${e.title} ${e.description} ${e.location}`
              .toLowerCase()
              .includes(query.toLowerCase()),
        )
        .sort((a, b) =>
          (a.startDate + (a.time || "")).localeCompare(
            b.startDate + (b.time || ""),
          ),
        ),
    [p.events, category, person, query, range, incident],
  );
  return (
    <div className="page-stack">
      <PageHeading
        eyebrow="The sequence of events"
        title="Timeline"
        description="What happened, when, and who was involved?"
        action={
          <button className="secondary-button" onClick={p.onOpenNewEventModal}>
            <Plus size={20} />
            Add event
          </button>
        }
      />
      <div className="timeline-toolbar">
        <div className="search-field">
          <Search size={20} />
          <input
            aria-label="Search timeline"
            placeholder="Find an event"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <label>
          Person
          <select value={person} onChange={(e) => setPerson(e.target.value)}>
            <option value="ALL">All people</option>
            {p.people.map((x) => (
              <option key={x.personId} value={x.personId}>
                {x.displayName}
              </option>
            ))}
          </select>
        </label>
        <label>
          Category
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="ALL">All categories</option>
            {categories.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="section-heading">
        <div className="segmented">
          <button
            aria-pressed={range === "ALL"}
            onClick={() => setRange("ALL")}
          >
            All events
          </button>
          <button
            aria-pressed={range === "INCIDENT"}
            disabled={!incident}
            onClick={() => {
              setRange("INCIDENT");
              setPerson("ALL");
              setCategory("ALL");
              setQuery("");
              setSelected(incident || null);
            }}
          >
            Incident window
          </button>
        </div>
        <span className="muted">{filtered.length} events</span>
      </div>
      <div
        className={`investigation-layout ${selected ? "with-inspector" : ""}`}
      >
        <section className="timeline-stream" aria-label="Recorded events">
          {filtered.map((e, i) => (
            <button
              key={e.eventId}
              className={`timeline-event ${selected?.eventId === e.eventId ? "selected" : ""}`}
              onClick={() => setSelected(e)}
              aria-pressed={selected?.eventId === e.eventId}
            >
              <div className="event-date">
                <span>{displayDate(e.startDate)}</span>
                {e.time && <small>{e.time}</small>}
              </div>
              <div className="event-marker">
                <CalendarDays size={22} />
              </div>
              <div className="event-copy">
                <span className="eyebrow">{e.category}</span>
                <h2>{e.title}</h2>
                <p>
                  {humanize(e.factStatus)} ·{" "}
                  {
                    p.evidenceList.filter((x) =>
                      e.evidenceIds.includes(x.evidenceId),
                    ).length
                  }{" "}
                  attached sources
                </p>
              </div>
              <ArrowRight size={20} />
            </button>
          ))}
          {!filtered.length && (
            <EmptyState
              title="No events in this view"
              description="Change the filters or add an event to this case."
              action={
                <button
                  className="secondary-button"
                  onClick={() => {
                    setRange("ALL");
                    setCategory("ALL");
                    setPerson("ALL");
                    setQuery("");
                  }}
                >
                  Reset filters
                </button>
              }
            />
          )}
        </section>
        {selected && (
          <ContextInspector
            title={selected.title}
            onClose={() => setSelected(null)}
          >
            <EventDetails
              event={selected}
              people={p.people}
              evidenceList={p.evidenceList}
              onAnalyze={() => p.onSelectEventForFocus(selected)}
            />
          </ContextInspector>
        )}
      </div>
      <p className="workspace-note">
        Select an event to read its sources. Lettrology context opens separately
        from the event record.
      </p>
    </div>
  );
}

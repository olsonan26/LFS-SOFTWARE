import React, { useState } from "react";
import { FileCheck2, Search, ArrowRight } from "lucide-react";
import { EvidenceRecord, CaseRecord, PersonRecord } from "../types";
import {
  PageHeading,
  ContextInspector,
  EmptyState,
  ExpandableSection,
  humanize,
  displayDate,
} from "./WorkspaceUI";
interface Props {
  caseRecord: CaseRecord;
  evidenceList: EvidenceRecord[];
  people: PersonRecord[];
}
export function EvidenceView({ evidenceList, people }: Props) {
  const [selected, setSelected] = useState("");
  const [type, setType] = useState("ALL");
  const [query, setQuery] = useState("");
  const filtered = evidenceList.filter(
    (e) =>
      (type === "ALL" || e.evidenceType === type) &&
      `${e.title} ${e.sourcePublisher}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const record = evidenceList.find((e) => e.evidenceId === selected);
  return (
    <div className="page-stack">
      <PageHeading
        eyebrow="Examine the sources"
        title="Evidence"
        description="Select a record to read the facts, citations and review status."
      />
      <div className="library-toolbar">
        <div className="search-field">
          <Search size={20} />
          <input
            aria-label="Search evidence"
            placeholder="Search title or publisher"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <label className="filter-label">
          Type
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setSelected("");
            }}
          >
            <option value="ALL">All types</option>
            {Array.from(new Set(evidenceList.map((e) => e.evidenceType))).map(
              (t) => (
                <option key={t} value={t}>
                  {humanize(t)}
                </option>
              ),
            )}
          </select>
        </label>
      </div>
      <div className={`investigation-layout ${record ? "with-inspector" : ""}`}>
        <div>
          {filtered.map((e) => (
            <button
              key={e.evidenceId}
              className="trail-record"
              onClick={() => setSelected(e.evidenceId)}
              aria-pressed={selected === e.evidenceId}
            >
              <FileCheck2 size={24} />
              <span>
                <strong>{e.title}</strong>
                <small>
                  {humanize(e.evidenceType)} · {e.extractedFacts.length}{" "}
                  extracted facts
                </small>
              </span>
              <ArrowRight size={20} />
            </button>
          ))}
          {!filtered.length && (
            <EmptyState
              title="No evidence in this view"
              description="Try a different filter or select a case with evidence records."
            />
          )}
        </div>
        {record && (
          <ContextInspector
            title={record.title}
            onClose={() => setSelected("")}
          >
            <span className="status-badge">
              {humanize(record.verificationStatus)}
            </span>
            <p>{record.sourcePublisher}</p>
            <dl className="detail-list">
              <dt>Publication date</dt>
              <dd>{displayDate(record.publicationDate)}</dd>
              <dt>Source reliability rating</dt>
              <dd>{record.reliabilityRating}</dd>
              <dt>Linked people</dt>
              <dd>
                {people
                  .filter((p) => record.relatedPeople.includes(p.personId))
                  .map((p) => p.displayName)
                  .join(", ") || "None recorded"}
              </dd>
            </dl>
            <h3>Extracted facts</h3>
            {record.extractedFacts.map((f) => (
              <blockquote className="citation" key={f.factId}>
                {f.exactStatement}
                <cite>{f.citation}</cite>
                <p>
                  {humanize(f.factStatus)} ·{" "}
                  {f.humanReviewed ? "Human reviewed" : "Awaiting review"}
                </p>
                <p>Extracted {displayDate(f.dateExtracted)}</p>
              </blockquote>
            ))}
            {!record.extractedFacts.length && <p>No facts extracted.</p>}
            <ExpandableSection
              title="Analyst notes"
              summary={
                record.analystNotes ? "Notes available" : "No notes recorded"
              }
            >
              <p>{record.analystNotes || "No notes recorded."}</p>
              {record.fileReference && (
                <p>File reference: {record.fileReference}</p>
              )}
            </ExpandableSection>
          </ContextInspector>
        )}
      </div>
    </div>
  );
}

import React, { useState } from "react";
import {
  FileText,
  Image as ImageIcon,
  Search,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { CaseRecord, PersonRecord } from "../types";
import { SEED_DOCUMENTS, SEED_MEDIA } from "../data/seedData";
import {
  ContextInspector,
  EmptyState,
  PageHeading,
  ExpandableSection,
  displayDate,
  humanize,
} from "./WorkspaceUI";
interface Props {
  caseRecord: CaseRecord;
  people: PersonRecord[];
  mode: "DOCUMENTS" | "MEDIA";
}
export function DocumentsMediaView({ caseRecord, people, mode }: Props) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState("");
  const documents = SEED_DOCUMENTS.filter(
    (x) =>
      x.caseId === caseRecord.caseId &&
      x.title.toLowerCase().includes(query.toLowerCase()),
  );
  const media = SEED_MEDIA.filter(
    (x) =>
      x.caseId === caseRecord.caseId &&
      x.title.toLowerCase().includes(query.toLowerCase()),
  );
  const doc = documents.find((x) => x.documentId === selected);
  const asset = media.find((x) => x.mediaId === selected);
  return (
    <div className="page-stack">
      <PageHeading
        eyebrow="The source library"
        title={mode === "DOCUMENTS" ? "Documents" : "Media"}
        description={
          mode === "DOCUMENTS"
            ? "Select a source to read its details and linked information."
            : "Select an asset to review its context and associated people."
        }
      />
      <div className="search-field">
        <Search size={20} />
        <input
          aria-label={
            mode === "DOCUMENTS" ? "Search documents" : "Search media"
          }
          placeholder="Find a source by title"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelected("");
          }}
        />
      </div>
      <div
        className={`investigation-layout ${doc || asset ? "with-inspector" : ""}`}
      >
        <div>
          {mode === "DOCUMENTS"
            ? documents.map((x) => (
                <button
                  className="trail-record"
                  key={x.documentId}
                  onClick={() => setSelected(x.documentId)}
                  aria-pressed={selected === x.documentId}
                >
                  <FileText size={26} />
                  <span>
                    <strong>{x.title}</strong>
                    <small>
                      {x.documentType} · {x.pageCount} pages ·{" "}
                      {displayDate(x.uploadDate)}
                    </small>
                  </span>
                  <ArrowRight size={20} />
                </button>
              ))
            : media.map((x) => (
                <button
                  className="trail-record"
                  key={x.mediaId}
                  onClick={() => setSelected(x.mediaId)}
                  aria-pressed={selected === x.mediaId}
                >
                  <ImageIcon size={26} />
                  <span>
                    <strong>{x.title}</strong>
                    <small>
                      {humanize(x.mediaType)} · {displayDate(x.capturedDate)}
                    </small>
                  </span>
                  <ArrowRight size={20} />
                </button>
              ))}
          {!(mode === "DOCUMENTS" ? documents.length : media.length) && (
            <EmptyState
              title="No sources in this view"
              description={
                query
                  ? "Try a different search."
                  : "This case has no attached records in this library yet."
              }
            />
          )}
        </div>
        {doc && (
          <ContextInspector title={doc.title} onClose={() => setSelected("")}>
            <p>{doc.author}</p>
            <span className="status-badge">{doc.documentType}</span>
            <dl className="detail-list">
              <dt>Added</dt>
              <dd>{displayDate(doc.uploadDate)}</dd>
              <dt>Pages</dt>
              <dd>{doc.pageCount}</dd>
            </dl>
            {doc.fileUrl ? (
              <a
                className="secondary-button"
                href={doc.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open document
                <ExternalLink size={18} />
              </a>
            ) : (
              <p className="muted">
                Document metadata is available. The original file has not been
                attached.
              </p>
            )}
            <ExpandableSection
              title="Extracted information"
              summary={`${doc.extractedEntities.length} entities recorded`}
            >
              {doc.extractedEntities.map((e, i) => (
                <div className="citation" key={i}>
                  <strong>{e.entity}</strong>
                  <p>
                    {humanize(e.type)} · Page {e.page}
                  </p>
                </div>
              ))}
            </ExpandableSection>
          </ContextInspector>
        )}
        {asset && (
          <ContextInspector title={asset.title} onClose={() => setSelected("")}>
            <span className="status-badge">Sample media record</span>
            <p>{asset.timecodeNotes}</p>
            <dl className="detail-list">
              <dt>Recorded date</dt>
              <dd>{displayDate(asset.capturedDate)}</dd>
              <dt>Linked people</dt>
              <dd>
                {people
                  .filter((x) => asset.taggedPeople.includes(x.personId))
                  .map((x) => x.displayName)
                  .join(", ") || "None recorded"}
              </dd>
            </dl>
            <p className="muted">
              The supplied media links are illustrative sample images, not
              verified case photographs.
            </p>
            <a
              href={asset.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="secondary-button"
            >
              Open sample image
              <ExternalLink size={18} />
            </a>
          </ContextInspector>
        )}
      </div>
    </div>
  );
}

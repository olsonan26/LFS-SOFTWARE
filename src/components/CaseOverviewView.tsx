import React, { useState } from "react";
import {
  Search,
  Plus,
  ArrowRight,
  MapPin,
  CalendarDays,
  FolderOpen,
  Bookmark,
  Users,
  FileText,
  ArrowUpRight,
} from "lucide-react";
import {
  CaseRecord,
  PersonRecord,
  EventRecord,
  EvidenceRecord,
} from "../types";
import { NavTab } from "./Header";
import { PageHeading, EmptyState, humanize, displayDate } from "./WorkspaceUI";
interface Props {
  cases: CaseRecord[];
  activeCase: CaseRecord;
  onSelectCase: (c: CaseRecord) => void;
  people: PersonRecord[];
  events: EventRecord[];
  evidenceList: EvidenceRecord[];
  onOpenNewCaseModal: () => void;
  onNavigateTab: (tab: NavTab) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isHome?: boolean;
}
export function CaseOverviewView(p: Props) {
  const [filter, setFilter] = useState("ALL");
  const [saved, setSaved] = useState<string[]>(() => {
    try {
      const v = JSON.parse(localStorage.getItem("lfs_saved_cases") || "[]");
      return Array.isArray(v) ? v : [];
    } catch {
      return [];
    }
  });
  const toggleSaved = (id: string) =>
    setSaved((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      try {
        localStorage.setItem("lfs_saved_cases", JSON.stringify(next));
      } catch {}
      return next;
    });
  const open = (c: CaseRecord) => {
    p.onSelectCase(c);
    p.onNavigateTab("TRAIL");
  };
  const recent = [...p.cases].sort((a, b) =>
    b.lastUpdated.localeCompare(a.lastUpdated),
  );
  const filtered = recent.filter(
    (c) =>
      (filter === "ALL" ||
        (filter === "SAVED"
          ? saved.includes(c.caseId)
          : filter === "ACTIVE"
            ? ["ACTIVE", "UNDER_REVIEW", "COLD_CASE"].includes(c.status)
            : c.status === filter)) &&
      `${c.title} ${c.primaryLocation} ${c.caseNumber}`
        .toLowerCase()
        .includes(p.searchQuery.toLowerCase()),
  );
  const featured = p.activeCase;
  return (
    <div className="hub page-stack">
      <PageHeading
        eyebrow="Your research workspace"
        title={p.isHome ? "Investigation Hub" : "Case Library"}
        description="Choose a case. Follow the story. Explore one detail at a time."
        action={
          <button className="secondary-button" onClick={p.onOpenNewCaseModal}>
            <Plus size={20} />
            New case
          </button>
        }
      />
      {p.isHome && !p.searchQuery && filter === "ALL" && (
        <section className="featured-case">
          <div className="featured-copy">
            <p className="eyebrow gold">Continue your investigation</p>
            <h2>{featured.title}</h2>
            <p className="feature-synopsis">{featured.synopsis}</p>
            <div className="case-meta">
              <span>
                <MapPin size={18} />
                {featured.primaryLocation}
              </span>
              <span>
                <CalendarDays size={18} />
                {displayDate(featured.primaryIncidentDate)}
              </span>
            </div>
            <button className="primary-button" onClick={() => open(featured)}>
              Open case
              <ArrowRight size={21} />
            </button>
          </div>
          <div className="dossier-preview">
            <FolderOpen size={48} strokeWidth={1} />
            <span className="eyebrow">Case file</span>
            <strong>{featured.caseNumber}</strong>
            <span className="status-badge">{humanize(featured.status)}</span>
            <div className="dossier-counts">
              <span>
                <Users size={18} />
                {featured.peopleIds.length} people
              </span>
              <span>
                <FileText size={18} />
                {
                  p.evidenceList.filter((e) => e.caseId === featured.caseId)
                    .length
                }{" "}
                evidence records
              </span>
            </div>
          </div>
        </section>
      )}
      <section className="case-library" aria-label="Investigations">
        <div className="section-heading">
          <h2>{p.isHome ? "Your investigations" : "All investigations"}</h2>
          <span className="muted">
            {filtered.length} {filtered.length === 1 ? "case" : "cases"}
          </span>
        </div>
        <div className="library-toolbar">
          <div className="search-field">
            <Search size={21} />
            <input
              aria-label="Search investigations"
              placeholder="Search by case name, number or location"
              value={p.searchQuery}
              onChange={(e) => p.setSearchQuery(e.target.value)}
            />
            {p.searchQuery && (
              <button
                className="text-button"
                onClick={() => p.setSearchQuery("")}
              >
                Clear
              </button>
            )}
          </div>
          <label className="filter-label">
            Show
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="ALL">All cases</option>
              <option value="ACTIVE">Active</option>
              <option value="SAVED">Saved</option>
              <option value="SOLVED">Solved</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </label>
        </div>
        <div className="case-list">
          {filtered.map((c) => (
            <article className="case-row" key={c.caseId}>
              <div className="case-row-icon">
                <FolderOpen size={27} strokeWidth={1.5} />
              </div>
              <div className="case-row-copy">
                <span className="eyebrow">{c.caseNumber}</span>
                <h3>
                  <button onClick={() => open(c)}>{c.title}</button>
                </h3>
                <p>
                  {c.primaryLocation}
                  <span aria-hidden="true"> · </span>
                  {c.peopleIds.length}{" "}
                  {c.peopleIds.length === 1 ? "person" : "people"}
                </p>
              </div>
              <span className="status-badge">{humanize(c.status)}</span>
              <button
                className={`icon-button save-button ${saved.includes(c.caseId) ? "saved" : ""}`}
                aria-label={`${saved.includes(c.caseId) ? "Unsave" : "Save"} ${c.title}`}
                aria-pressed={saved.includes(c.caseId)}
                onClick={() => toggleSaved(c.caseId)}
              >
                <Bookmark
                  size={21}
                  fill={saved.includes(c.caseId) ? "currentColor" : "none"}
                />
              </button>
              <button
                className="icon-button open-case"
                aria-label={`Open ${c.title}`}
                onClick={() => open(c)}
              >
                <ArrowUpRight size={22} />
              </button>
            </article>
          ))}
        </div>
        {!filtered.length && (
          <EmptyState
            title="No matching investigations"
            description="Try another search or choose a different filter."
            action={
              <button
                className="secondary-button"
                onClick={() => {
                  p.setSearchQuery("");
                  setFilter("ALL");
                }}
              >
                Reset filters
              </button>
            }
          />
        )}
      </section>
      <p className="workspace-note">
        The supplied cases are sample and methodology records. Add your own case
        to begin a new investigation.
      </p>
    </div>
  );
}

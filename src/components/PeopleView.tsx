import React, { useMemo, useState } from "react";
import {
  Plus,
  Search,
  ArrowRight,
  UserRound,
  LineChart,
  Brain,
  FileText,
  Users,
} from "lucide-react";
import {
  PersonRecord,
  CaseRecord,
  EventRecord,
  EvidenceRecord,
} from "../types";
import { calculatePrimaryProfile } from "../core/lettrology-engine/identityCalculations";
import { formatCompound } from "../core/lettrology-engine/compoundTrail";
import {
  PageHeading,
  EmptyState,
  ExpandableSection,
  FollowTrail,
  humanize,
  displayDate,
} from "./WorkspaceUI";
interface Props {
  caseRecord: CaseRecord;
  people: PersonRecord[];
  events: EventRecord[];
  evidenceList: EvidenceRecord[];
  selectedPersonId?: string;
  onSelectPersonForChart: (id: string) => void;
  onOpenNewPersonModal: () => void;
  onOpenTimeline: () => void;
  onOpenEvidence: () => void;
}
export function PeopleView(p: Props) {
  const [selected, setSelected] = useState(p.selectedPersonId || "");
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("ALL");
  const [tab, setTab] = useState("profile");
  const person = p.people.find((x) => x.personId === selected);
  const fixed = useMemo(
    () =>
      person
        ? calculatePrimaryProfile(
            person.verifiedBirthName,
            person.dob,
            person.calledName,
          )
        : null,
    [person],
  );
  const filtered = p.people.filter(
    (x) =>
      (role === "ALL" || x.roleInCase === role) &&
      `${x.displayName} ${x.verifiedBirthName}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const linkedEvents = p.events.filter(
    (e) => person && e.peopleInvolved.includes(person.personId),
  );
  const linkedEvidence = p.evidenceList.filter(
    (e) => person && e.relatedPeople.includes(person.personId),
  );
  const rows = fixed
    ? ([
        ["Initial impressions", "First name", fixed.firstName],
        ["Personality", "Full birth name", fixed.fullName],
        ["Heart’s desire", "Vowels", fixed.vowels],
        ["Habits", "Day of birth", fixed.dayOfBirth],
        ["Natural skills", "Total birth date", fixed.totalBirthDate],
        ["Ultimate goal", "Full name + birth date", fixed.ultimateGoal],
      ] as const)
    : [];
  return (
    <div className="page-stack">
      <PageHeading
        eyebrow="People behind the case"
        title={person ? `Who is ${person.displayName}?` : "People"}
        description={
          person
            ? "A clear profile, with deeper detail when you need it."
            : "Choose a person to explore their identity, chart and case connections."
        }
        action={
          <button className="secondary-button" onClick={p.onOpenNewPersonModal}>
            <Plus size={20} />
            Add person
          </button>
        }
      />
      {!person ? (
        <>
          <div className="library-toolbar">
            <div className="search-field">
              <Search size={20} />
              <input
                aria-label="Search people"
                placeholder="Find a person"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <label className="filter-label">
              Role
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="ALL">All roles</option>
                {Array.from(new Set(p.people.map((x) => x.roleInCase))).map(
                  (x) => (
                    <option key={x} value={x}>
                      {humanize(x)}
                    </option>
                  ),
                )}
              </select>
            </label>
          </div>
          <div className="people-grid">
            {filtered.map((x) => (
              <button
                key={x.personId}
                className="person-card"
                onClick={() => {
                  setSelected(x.personId);
                  setTab("profile");
                }}
              >
                <span className="avatar">
                  <UserRound size={30} />
                </span>
                <span className="status-badge">{humanize(x.roleInCase)}</span>
                <h2>{x.displayName}</h2>
                <p>{x.occupation || "Identity record"}</p>
                <span className="person-card-footer">
                  View profile
                  <ArrowRight size={20} />
                </span>
              </button>
            ))}
          </div>
          {!filtered.length && (
            <EmptyState
              title={
                p.people.length ? "No matching people" : "No people added yet"
              }
              description="Add a person to begin their Lettrology profile."
              action={
                <button
                  className="secondary-button"
                  onClick={p.onOpenNewPersonModal}
                >
                  Add person
                </button>
              }
            />
          )}
        </>
      ) : (
        <>
          <div className="profile-toolbar">
            <button className="text-button" onClick={() => setSelected("")}>
              Back to people
            </button>
            <div className="segmented" aria-label="Profile views">
              <button
                aria-pressed={tab === "profile"}
                onClick={() => setTab("profile")}
              >
                <UserRound size={18} />
                Profile
              </button>
              <button
                aria-pressed={tab === "psychology"}
                onClick={() => setTab("psychology")}
              >
                <Brain size={18} />
                Psychology
              </button>
              <button
                aria-pressed={tab === "relationships"}
                onClick={() => setTab("relationships")}
              >
                <Users size={18} />
                Connections
              </button>
            </div>
          </div>
          {tab === "profile" && (
            <div className="profile-layout">
              <section className="person-summary">
                <span className="avatar large">
                  <UserRound size={42} />
                </span>
                <span className="status-badge">
                  {humanize(person.roleInCase)}
                </span>
                <h2>{person.displayName}</h2>
                <p>{person.occupation || "Occupation not recorded"}</p>
                <dl className="detail-list">
                  <dt>Birth name</dt>
                  <dd>{person.verifiedBirthName}</dd>
                  <dt>Date of birth</dt>
                  <dd>{displayDate(person.dob)}</dd>
                  <dt>Birth location</dt>
                  <dd>{person.birthLocation || "Not recorded"}</dd>
                </dl>
                <button
                  className="primary-button"
                  onClick={() => p.onSelectPersonForChart(person.personId)}
                >
                  <LineChart size={20} />
                  Open chart
                </button>
              </section>
              <div className="profile-sections">
                <ExpandableSection
                  title="Identity & sources"
                  summary="Birth details, source records and name history"
                >
                  <dl className="detail-list">
                    <dt>Identity status</dt>
                    <dd>{humanize(person.identityVerificationState)}</dd>
                    <dt>Birth date source</dt>
                    <dd>{person.sourceForDob}</dd>
                    <dt>Name source</dt>
                    <dd>{person.sourceForName}</dd>
                    <dt>Date precision</dt>
                    <dd>{humanize(person.datePrecision)}</dd>
                  </dl>
                  {person.identities.map((id) => (
                    <div className="citation" key={id.identityId}>
                      <strong>{id.exactNameString}</strong>
                      <p>
                        {humanize(id.identityType)} · {id.legalStatus}
                      </p>
                      <p>Used as: {id.sociallyUsedName}</p>
                      <p>{humanize(id.verificationStatus)}</p>
                    </div>
                  ))}
                </ExpandableSection>
                <ExpandableSection
                  title="Lettrology profile"
                  summary="Six primary numbers and their calculation trails"
                >
                  <p className="interpretation-label">
                    Lettrology interpretation framework
                  </p>
                  <div className="profile-values">
                    {rows.map(([label, source, value]) => (
                      <div key={label}>
                        <span>
                          <strong>{label}</strong>
                          <small>{source}</small>
                        </span>
                        <strong>{formatCompound(value)}</strong>
                      </div>
                    ))}
                  </div>
                  <p className="muted">
                    These are calculated letter and date patterns, not a
                    psychological assessment.
                  </p>
                </ExpandableSection>
                {fixed?.calledName && (
                  <ExpandableSection
                    title="Called name"
                    summary={`${fixed.calledName.calledGivenName} ${fixed.calledName.calledSurname}`}
                  >
                    <div className="profile-values">
                      {[
                        ["Given component", fixed.calledName.givenComponent],
                        [
                          "Surname component",
                          fixed.calledName.surnameComponent,
                        ],
                        [
                          "Combined called name",
                          fixed.calledName.combinedCalledName,
                        ],
                        [
                          "Called ultimate goal",
                          fixed.calledName.calledUltimateGoal,
                        ],
                      ].map(([label, v]) => (
                        <div key={label as string}>
                          <span>{label as string}</span>
                          <strong>{formatCompound(v as any)}</strong>
                        </div>
                      ))}
                    </div>
                  </ExpandableSection>
                )}
                <ExpandableSection
                  title="Case notes"
                  summary={
                    person.notes
                      ? "Read the notes attached to this person."
                      : "No notes have been recorded."
                  }
                >
                  <p>{person.notes || "No notes have been recorded."}</p>
                </ExpandableSection>
                <ExpandableSection
                  title="Major life events"
                  summary={`${linkedEvents.length} events linked to this person`}
                >
                  {linkedEvents.map((e) => (
                    <div className="citation" key={e.eventId}>
                      <strong>{e.title}</strong>
                      <p>{displayDate(e.startDate)}</p>
                    </div>
                  ))}
                  {!linkedEvents.length && <p>No events linked yet.</p>}
                  <button className="text-button" onClick={p.onOpenTimeline}>
                    Explore timeline
                    <ArrowRight size={18} />
                  </button>
                </ExpandableSection>
                <ExpandableSection
                  title="Related sources"
                  summary={`${linkedEvidence.length} evidence records`}
                >
                  {linkedEvidence.map((e) => (
                    <div className="citation" key={e.evidenceId}>
                      <strong>{e.title}</strong>
                      <p>{e.sourcePublisher}</p>
                    </div>
                  ))}
                  {!linkedEvidence.length && (
                    <p>No evidence records linked yet.</p>
                  )}
                  <button className="text-button" onClick={p.onOpenEvidence}>
                    Open evidence
                    <ArrowRight size={18} />
                  </button>
                </ExpandableSection>
              </div>
            </div>
          )}
          {tab === "psychology" && (
            <section className="reading-surface">
              <p className="eyebrow">Behavioral research</p>
              <h2>Explore the person with context</h2>
              <p>
                Open a domain to review what is available. This case does not
                yet contain sourced assessments for these domains.
              </p>
              {[
                "Positive expression",
                "Shadow expression",
                "Core traits",
                "Emotional drivers",
                "Communication style",
                "Relationship style",
                "Stress response",
                "Motivations",
                "Life direction",
              ].map((domain) => (
                <ExpandableSection
                  key={domain}
                  title={domain}
                  summary="No sourced assessment recorded"
                >
                  <p>
                    <strong>Documented evidence:</strong> No domain-specific
                    assessment has been recorded.
                  </p>
                  <p>
                    <strong>Lettrology interpretation:</strong> Review the
                    person’s chart before adding an interpretation.
                  </p>
                  <p>
                    <strong>Research hypothesis:</strong> No hypothesis recorded
                    for this domain.
                  </p>
                  <button
                    className="text-button"
                    onClick={() => p.onSelectPersonForChart(person.personId)}
                  >
                    Review chart
                    <ArrowRight size={18} />
                  </button>
                </ExpandableSection>
              ))}
            </section>
          )}
          {tab === "relationships" && (
            <section className="reading-surface">
              <p className="eyebrow">Recorded connections</p>
              <h2>People in shared events</h2>
              <p>
                Connections below mean the people appear in the same event
                record. A family or personal relationship has not been inferred.
              </p>
              {p.people
                .filter(
                  (x) =>
                    x.personId !== person.personId &&
                    linkedEvents.some((e) =>
                      e.peopleInvolved.includes(x.personId),
                    ),
                )
                .map((x) => (
                  <button
                    className="trail-record"
                    key={x.personId}
                    onClick={() => {
                      setSelected(x.personId);
                      setTab("profile");
                    }}
                  >
                    <UserRound size={24} />
                    <span>
                      <strong>{x.displayName}</strong>
                      <small>
                        Mentioned in{" "}
                        {
                          linkedEvents.filter((e) =>
                            e.peopleInvolved.includes(x.personId),
                          ).length
                        }{" "}
                        shared events
                      </small>
                    </span>
                    <ArrowRight size={20} />
                  </button>
                ))}
              {!p.people.some(
                (x) =>
                  x.personId !== person.personId &&
                  linkedEvents.some((e) =>
                    e.peopleInvolved.includes(x.personId),
                  ),
              ) && <p>No shared event connections have been recorded.</p>}
            </section>
          )}
          <FollowTrail
            items={[
              { label: "What happened next?", action: p.onOpenTimeline },
              { label: "What sources support this?", action: p.onOpenEvidence },
            ]}
          />
        </>
      )}
    </div>
  );
}

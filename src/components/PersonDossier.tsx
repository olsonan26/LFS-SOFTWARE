import React, { useMemo } from "react";
import {
  AlertTriangle,
  BarChart3,
  CalendarDays,
  Gem,
  Leaf,
  MapPin,
  MessageCircle,
  Printer,
  UserRound,
  X,
} from "lucide-react";
import type { PersonRecord } from "../types";
import { calculatePrimaryProfile } from "../core/lettrology-engine/identityCalculations";
import {
  formatCompound,
  type CompoundValue,
} from "../core/lettrology-engine/compoundTrail";
import {
  getDossierInterpretation,
  type CorePerspectiveId,
  type DossierInterpretation,
} from "../data/personDossierInterpretations";
import { useDialogFocus } from "./useDialogFocus";
import "./PersonDossier.css";

interface Props {
  person: PersonRecord;
  open: boolean;
  onClose: () => void;
}

interface PerspectiveDefinition {
  id: CorePerspectiveId;
  number: number;
  title: string;
  source: string;
  value: CompoundValue;
  interpretation?: DossierInterpretation;
}

function parseDob(dob: string) {
  const segments = dob.split("-").map((part) => Number.parseInt(part, 10));
  if (segments.length !== 3 || segments.some((part) => Number.isNaN(part))) {
    return null;
  }

  if (dob.split("-")[0]?.length === 4) {
    return { year: segments[0], month: segments[1], day: segments[2] };
  }

  return { year: segments[2], month: segments[1], day: segments[0] };
}

function formatBirthDate(dob: string) {
  const parts = parseDob(dob);
  if (!parts) return dob;
  const date = new Date(parts.year, parts.month - 1, parts.day);
  if (Number.isNaN(date.getTime())) return dob;
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function calculateAge(person: PersonRecord) {
  if (person.datePrecision !== "EXACT") return undefined;
  const parts = parseDob(person.dob);
  if (!parts) return undefined;

  const now = new Date();
  let age = now.getFullYear() - parts.year;
  const birthdayHasPassed =
    now.getMonth() + 1 > parts.month ||
    (now.getMonth() + 1 === parts.month && now.getDate() >= parts.day);
  if (!birthdayHasPassed) age -= 1;
  return age >= 0 ? age : undefined;
}

function unique(items: string[], limit = 5) {
  return Array.from(new Set(items.filter(Boolean))).slice(0, limit);
}

function profileId(person: PersonRecord) {
  const suffix = person.personId.replace(/[^a-z0-9]/gi, "").slice(-8).toUpperCase();
  return `LT-${suffix || "PROFILE"}`;
}

function fallbackTraits(value: CompoundValue, mode: "elevated" | "shadow") {
  const calculation = formatCompound(value);
  if (mode === "elevated") {
    return {
      summary:
        "Canonical elevated wording has not yet been loaded for this position.",
      traits: unique([
        `Calculation ${calculation}`,
        `Root value ${value.root}`,
        value.powerNumber ? `Power marker ${value.powerNumber}` : "Compound trail preserved",
        "No unsupported personality claim generated",
      ]),
    };
  }

  return {
    summary: "Canonical shadow wording has not yet been loaded for this position.",
    traits: unique([
      `Calculation ${calculation}`,
      "Shadow interpretation pending methodology approval",
      "No diagnostic inference generated",
      "Review the canonical interpretation library",
    ]),
  };
}

function listOrPending(items: string[]) {
  const values = unique(items, 5);
  return values.length ? values : ["Canonical interpretation pending"];
}

export function PersonDossier({ person, open, onClose }: Props) {
  const dialogRef = useDialogFocus(open, onClose);
  const fixed = useMemo(
    () =>
      calculatePrimaryProfile(
        person.verifiedBirthName,
        person.dob,
        person.calledName,
      ),
    [person],
  );

  const perspectives = useMemo<PerspectiveDefinition[]>(() => {
    const definitions: Omit<PerspectiveDefinition, "interpretation">[] = [
      {
        id: "initialImpressions",
        number: 1,
        title: "Initial Impressions",
        source: "Based on First Name",
        value: fixed.firstName,
      },
      {
        id: "personality",
        number: 2,
        title: "Personality Description",
        source: "Based on Full Birth Name",
        value: fixed.fullName,
      },
      {
        id: "heartDesire",
        number: 3,
        title: "Heart’s Desire",
        source: "Based on Vowels",
        value: fixed.vowels,
      },
      {
        id: "habits",
        number: 4,
        title: "Habits & Tendencies",
        source: "Based on Day of Birth",
        value: fixed.dayOfBirth,
      },
      {
        id: "naturalSkills",
        number: 5,
        title: "Natural Skills & Talents",
        source: "Based on Total Birth Date",
        value: fixed.totalBirthDate,
      },
      {
        id: "ultimateGoal",
        number: 6,
        title: "Ultimate Goal",
        source: "Based on Total Name + DOB",
        value: fixed.ultimateGoal,
      },
    ];

    return definitions.map((definition) => ({
      ...definition,
      interpretation: getDossierInterpretation(definition.id, definition.value),
    }));
  }, [fixed]);

  const age = calculateAge(person);
  const generated = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date());
  const loadedCount = perspectives.filter((item) => item.interpretation).length;

  const summary = useMemo(() => {
    const elevated = unique(
      perspectives.flatMap((item) => item.interpretation?.elevated.traits || []),
      3,
    );
    const shadow = unique(
      perspectives.flatMap((item) => item.interpretation?.shadow.traits || []),
      2,
    );

    if (loadedCount === perspectives.length && elevated.length) {
      const elevatedText = elevated.join(", ");
      const shadowText = shadow.length ? ` Under pressure, the corresponding shadow expressions include ${shadow.join(", ")}.` : "";
      return `${person.displayName}’s six core Lettrology perspectives emphasize ${elevatedText}.${shadowText}`;
    }

    return `This dossier assembles ${person.displayName}’s six fixed Lettrology calculations from the recorded birth name and birth date. ${loadedCount} of ${perspectives.length} canonical narrative interpretations are currently loaded; positions without approved wording remain calculation-only rather than generating unsupported personality claims.`;
  }, [loadedCount, person.displayName, perspectives]);

  const coreStrengths = listOrPending(
    perspectives.flatMap((item) => item.interpretation?.elevated.traits || []),
  );
  const shadowTendencies = listOrPending(
    perspectives.flatMap((item) => item.interpretation?.shadow.traits || []),
  );
  const communicationStyle = listOrPending(
    perspectives.flatMap((item) => item.interpretation?.communication || []),
  );
  const primaryMotivations = listOrPending(
    perspectives.flatMap((item) => item.interpretation?.motivations || []),
  );
  const descriptor =
    perspectives.find((item) => item.interpretation?.descriptor)?.interpretation
      ?.descriptor || "Six fixed patterns. One verified profile.";

  if (!open) return null;

  return (
    <div
      className="person-dossier-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="person-dossier-dialog"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="person-dossier-title"
      >
        <div className="dossier-folder dossier-folder-back" aria-hidden="true" />
        <div className="dossier-folder dossier-folder-mid" aria-hidden="true" />

        <aside className="dossier-tabs" aria-label="Dossier sections">
          <button type="button" className="active" aria-current="page">
            Overview
          </button>
          <button type="button" disabled>
            Patterns
          </button>
          <button type="button" disabled>
            Insights
          </button>
          <button type="button" disabled>
            Notes
          </button>
        </aside>

        <article className="person-dossier-paper">
          <button
            type="button"
            className="dossier-close"
            onClick={onClose}
            aria-label="Close person dossier"
          >
            <X size={24} />
          </button>

          <header className="dossier-brand-header">
            <div className="dossier-brand">
              <span className="dossier-brand-mark" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
              <span>
                <strong>Lettrology™</strong>
                <small>People • Patterns • Purpose</small>
              </span>
            </div>
            <p>
              Letters reveal what’s within.
              <br />
              People reveal what’s possible.
            </p>
          </header>

          <section className="dossier-identity">
            <div className="dossier-photo-card">
              <span className="dossier-paperclip" aria-hidden="true" />
              <div className="dossier-photo">
                {person.photoUrl ? (
                  <img src={person.photoUrl} alt={`Portrait of ${person.displayName}`} />
                ) : (
                  <UserRound size={88} strokeWidth={1.2} aria-hidden="true" />
                )}
              </div>
              <p>“{descriptor}”</p>
            </div>

            <div className="dossier-person-copy">
              <div className="dossier-title-row">
                <div>
                  <h1 id="person-dossier-title">Person Dossier</h1>
                  <p className="dossier-kicker">
                    A deeper understanding. A more complete person.
                  </p>
                </div>
                <dl className="dossier-metadata">
                  <div>
                    <dt>Profile ID</dt>
                    <dd>{profileId(person)}</dd>
                  </div>
                  <div>
                    <dt>Generated</dt>
                    <dd>{generated}</dd>
                  </div>
                  <div>
                    <dt>Classification</dt>
                    <dd>Personal Insight Report</dd>
                  </div>
                </dl>
              </div>

              <div className="dossier-name-row">
                <div>
                  <h2>{person.displayName}</h2>
                  <div className="dossier-person-facts">
                    <span>
                      <CalendarDays size={17} />
                      {formatBirthDate(person.dob)}
                    </span>
                    {typeof age === "number" && <span>Age {age}</span>}
                    {person.birthLocation && (
                      <span>
                        <MapPin size={17} />
                        {person.birthLocation}
                      </span>
                    )}
                  </div>
                </div>
                <div className="dossier-confidential" aria-label="Lettrology confidential">
                  Lettrology
                  <strong>Confidential</strong>
                </div>
              </div>

              <div className="dossier-summary-row">
                <p>{summary}</p>
                <blockquote>
                  Unique patterns.
                  <br />
                  Real potential.
                  <br />
                  A brighter tomorrow.
                </blockquote>
              </div>
            </div>
          </section>

          <section className="dossier-core-section">
            <div className="dossier-section-heading">
              <h2>The Six Core Perspectives</h2>
              <p>One name. Many insights. A more complete you.</p>
            </div>

            <div className="dossier-core-grid">
              {perspectives.map((perspective) => {
                const elevated =
                  perspective.interpretation?.elevated ||
                  fallbackTraits(perspective.value, "elevated");
                const shadow =
                  perspective.interpretation?.shadow ||
                  fallbackTraits(perspective.value, "shadow");

                return (
                  <article className="dossier-core-card" key={perspective.id}>
                    <header>
                      <span className="dossier-number">{perspective.number}</span>
                      <span className="dossier-core-title">
                        <strong>{perspective.title}</strong>
                        <small>{perspective.source}</small>
                      </span>
                      <span className="dossier-calculation">
                        {formatCompound(perspective.value)}
                      </span>
                    </header>

                    <div className="dossier-expression-grid">
                      <section className="dossier-expression elevated">
                        <h3>
                          <Leaf size={15} /> Elevated Expression
                        </h3>
                        <p>{elevated.summary}</p>
                        <ul>
                          {elevated.traits.slice(0, 5).map((trait) => (
                            <li key={trait}>{trait}</li>
                          ))}
                        </ul>
                      </section>

                      <section className="dossier-expression shadow">
                        <h3>
                          <AlertTriangle size={15} /> Shadow Expression
                        </h3>
                        <p>{shadow.summary}</p>
                        <ul>
                          {shadow.traits.slice(0, 5).map((trait) => (
                            <li key={trait}>{trait}</li>
                          ))}
                        </ul>
                      </section>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="dossier-glance">
            <div className="dossier-glance-intro">
              <span className="dossier-compass" aria-hidden="true">✦</span>
              <span>
                <strong>At A Glance</strong>
                <small>Key takeaways for a more complete view.</small>
              </span>
            </div>

            <DossierGlanceColumn
              icon={<Gem size={21} />}
              title="Core Strengths"
              items={coreStrengths}
            />
            <DossierGlanceColumn
              icon={<AlertTriangle size={21} />}
              title="Shadow Tendencies"
              items={shadowTendencies}
            />
            <DossierGlanceColumn
              icon={<MessageCircle size={21} />}
              title="Communication Style"
              items={communicationStyle}
            />
            <DossierGlanceColumn
              icon={<BarChart3 size={21} />}
              title="Primary Motivations"
              items={primaryMotivations}
            />
          </section>

          <footer className="dossier-footer">
            <div className="dossier-footer-brand">
              <span className="dossier-brand-mark compact" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
              <span>
                <strong>Lettrology™</strong>
                <small>People • Patterns • Purpose</small>
              </span>
            </div>
            <p>“Understanding people creates a brighter tomorrow.”</p>
            <div className="dossier-footer-actions">
              <button type="button" className="dossier-print" onClick={() => window.print()}>
                <Printer size={17} />
                Export / Print Report
              </button>
              <button type="button" className="dossier-close-button" onClick={onClose}>
                <X size={17} />
                Close
              </button>
            </div>
          </footer>
        </article>
      </div>
    </div>
  );
}

function DossierGlanceColumn({
  icon,
  title,
  items,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
}) {
  return (
    <div className="dossier-glance-column">
      <h3>
        {icon}
        {title}
      </h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

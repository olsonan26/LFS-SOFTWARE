import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  Leaf,
  MapPin,
  Printer,
  UserRound,
  X,
} from "lucide-react";
import type {
  DossierPerspectiveId,
  DossierTraitSelection,
  PersonRecord,
} from "../types";
import { calculatePrimaryProfile } from "../core/lettrology-engine/identityCalculations";
import {
  formatCompound,
  type CompoundValue,
} from "../core/lettrology-engine/compoundTrail";
import {
  getDossierInterpretation,
  loadDossierInterpretationRegistry,
  type CorePerspectiveId,
  type DossierInterpretation,
  type DossierInterpretationRegistry,
} from "../data/personDossierInterpretations";
import { useDialogFocus } from "./useDialogFocus";
import "./PersonDossier.css";

interface Props {
  person: PersonRecord;
  open: boolean;
  onClose: () => void;
  onUpdatePerson: (person: PersonRecord) => void;
  editorName?: string;
}

interface PerspectiveDefinition {
  id: CorePerspectiveId;
  number: number;
  title: string;
  source: string;
  value: CompoundValue;
  interpretation?: DossierInterpretation;
}

type InterpretationStatus = "idle" | "loading" | "ready" | "error";
type ExpressionMode = "elevated" | "shadow";

const EMPTY_SELECTION: DossierTraitSelection = {
  elevated: [],
  shadow: [],
  updatedAt: "",
};

function parseDob(dob: string) {
  const normalized = dob.replace(/\s(?:BC|BCE|AD|CE)$/i, "");
  const segments = normalized.split("-").map((part) => Number.parseInt(part, 10));
  if (segments.length !== 3 || segments.some((part) => Number.isNaN(part))) {
    return null;
  }

  if (normalized.split("-")[0]?.length === 4) {
    return { year: segments[0], month: segments[1], day: segments[2] };
  }

  return { year: segments[2], month: segments[1], day: segments[0] };
}

function formatBirthDate(dob: string) {
  if (/\s(?:BC|BCE)$/i.test(dob)) {
    const parts = parseDob(dob);
    if (!parts) return dob;
    const month = new Intl.DateTimeFormat("en-US", { month: "long" }).format(
      new Date(2000, parts.month - 1, 1),
    );
    return `${month} ${parts.day}, ${parts.year} BC`;
  }

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
  if (person.datePrecision !== "EXACT" || /\s(?:BC|BCE)$/i.test(person.dob)) {
    return undefined;
  }
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

function fallbackTraits(value: CompoundValue, mode: ExpressionMode) {
  const calculation = formatCompound(value);
  if (mode === "elevated") {
    return {
      summary: "Approved elevated wording could not be loaded for this position.",
      traits: unique([
        `Calculation ${calculation}`,
        `Root value ${value.root}`,
        value.powerNumber ? `Power marker ${value.powerNumber}` : "Compound trail preserved",
        "No unsupported personality claim generated",
      ]),
    };
  }

  return {
    summary: "Approved shadow wording could not be loaded for this position.",
    traits: unique([
      `Calculation ${calculation}`,
      "Shadow interpretation unavailable",
      "No diagnostic inference generated",
      "Review the interpretation library",
    ]),
  };
}

function balanceLabel(elevated: number, shadow: number) {
  if (!elevated && !shadow) return "Not assessed";
  if (elevated > shadow) return "More elevated traits checked";
  if (shadow > elevated) return "More shadow traits checked";
  return "Mixed / balanced traits checked";
}

export function PersonDossier({
  person,
  open,
  onClose,
  onUpdatePerson,
  editorName,
}: Props) {
  const dialogRef = useDialogFocus(open, onClose);
  const [interpretationRegistry, setInterpretationRegistry] =
    useState<DossierInterpretationRegistry>({});
  const [interpretationStatus, setInterpretationStatus] =
    useState<InterpretationStatus>("idle");

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setInterpretationStatus("loading");

    loadDossierInterpretationRegistry()
      .then((registry) => {
        if (cancelled) return;
        setInterpretationRegistry(registry);
        setInterpretationStatus("ready");
      })
      .catch((error) => {
        console.error("Unable to load Person Dossier interpretations", error);
        if (!cancelled) setInterpretationStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [open]);

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
      interpretation: getDossierInterpretation(
        definition.id,
        definition.value,
        interpretationRegistry,
      ),
    }));
  }, [fixed, interpretationRegistry]);

  const age = calculateAge(person);
  const generated = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  const selectionFor = (id: CorePerspectiveId) =>
    person.dossierTraitSelections?.[id as DossierPerspectiveId] || EMPTY_SELECTION;

  const toggleTrait = (
    perspectiveId: CorePerspectiveId,
    mode: ExpressionMode,
    trait: string,
  ) => {
    const id = perspectiveId as DossierPerspectiveId;
    const current = person.dossierTraitSelections?.[id] || EMPTY_SELECTION;
    const currentList = current[mode];
    const nextList = currentList.includes(trait)
      ? currentList.filter((item) => item !== trait)
      : [...currentList, trait];

    const nextSelection: DossierTraitSelection = {
      ...current,
      [mode]: nextList,
      updatedAt: new Date().toISOString(),
      updatedBy: editorName,
    };

    onUpdatePerson({
      ...person,
      dossierTraitSelections: {
        ...(person.dossierTraitSelections || {}),
        [id]: nextSelection,
      },
    });
  };

  const totalElevated = perspectives.reduce(
    (sum, item) => sum + selectionFor(item.id).elevated.length,
    0,
  );
  const totalShadow = perspectives.reduce(
    (sum, item) => sum + selectionFor(item.id).shadow.length,
    0,
  );

  const descriptor =
    perspectives.find((item) => item.interpretation?.descriptor)?.interpretation
      ?.descriptor || "Six fixed patterns. One verified profile.";

  const summary = `Below is a good overview of who ${person.displayName} is through the six core Lettrology perspectives. Read below for the full breakdown.`;

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
          <button type="button" className="active" aria-current="page">Overview</button>
          <button type="button" disabled>Patterns</button>
          <button type="button" disabled>Insights</button>
          <button type="button" disabled>Notes</button>
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
                  <p className="dossier-kicker">A deeper understanding. A more complete person.</p>
                </div>
                <dl className="dossier-metadata">
                  <div><dt>Profile ID</dt><dd>{profileId(person)}</dd></div>
                  <div><dt>Generated</dt><dd>{generated}</dd></div>
                  <div><dt>Classification</dt><dd>Personal Insight Report</dd></div>
                </dl>
              </div>

              <div className="dossier-name-row">
                <div>
                  <h2>{person.displayName}</h2>
                  <div className="dossier-person-facts">
                    <span><CalendarDays size={17} />{formatBirthDate(person.dob)}</span>
                    {typeof age === "number" && <span>Age {age}</span>}
                    {person.birthLocation && <span><MapPin size={17} />{person.birthLocation}</span>}
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
                  <br />Real potential.
                  <br />A brighter tomorrow.
                </blockquote>
              </div>
            </div>
          </section>

          <section className="dossier-core-section">
            <div className="dossier-section-heading">
              <div>
                <h2>The Six Core Perspectives</h2>
                <small className="dossier-check-instruction">
                  Check the traits that actually fit this person. Every choice is saved to their profile.
                </small>
              </div>
              <p>One name. Many insights. A more complete you.</p>
            </div>

            <div className="dossier-core-grid">
              {perspectives.map((perspective) => {
                const elevated = perspective.interpretation?.elevated || fallbackTraits(perspective.value, "elevated");
                const shadow = perspective.interpretation?.shadow || fallbackTraits(perspective.value, "shadow");
                const selected = selectionFor(perspective.id);

                return (
                  <article className="dossier-core-card" key={perspective.id}>
                    <header>
                      <span className="dossier-number">{perspective.number}</span>
                      <span className="dossier-core-title">
                        <strong>{perspective.title}</strong>
                        <small>{perspective.source}</small>
                      </span>
                      <span className="dossier-calculation">{formatCompound(perspective.value)}</span>
                    </header>

                    <div className="dossier-expression-grid">
                      <section className="dossier-expression elevated">
                        <h3><Leaf size={15} /> Elevated Expression</h3>
                        <p>{elevated.summary}</p>
                        <ul className="dossier-trait-list">
                          {elevated.traits.slice(0, 5).map((trait) => (
                            <li key={trait}>
                              <label className="dossier-trait-check">
                                <input
                                  type="checkbox"
                                  checked={selected.elevated.includes(trait)}
                                  onChange={() => toggleTrait(perspective.id, "elevated", trait)}
                                  aria-label={`Mark ${trait} as fitting ${person.displayName}`}
                                />
                                <span>{trait}</span>
                              </label>
                            </li>
                          ))}
                        </ul>
                      </section>

                      <section className="dossier-expression shadow">
                        <h3><AlertTriangle size={15} /> Shadow Expression</h3>
                        <p>{shadow.summary}</p>
                        <ul className="dossier-trait-list">
                          {shadow.traits.slice(0, 5).map((trait) => (
                            <li key={trait}>
                              <label className="dossier-trait-check">
                                <input
                                  type="checkbox"
                                  checked={selected.shadow.includes(trait)}
                                  onChange={() => toggleTrait(perspective.id, "shadow", trait)}
                                  aria-label={`Mark ${trait} as fitting ${person.displayName}`}
                                />
                                <span>{trait}</span>
                              </label>
                            </li>
                          ))}
                        </ul>
                      </section>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="dossier-glance dossier-glance-profile">
            <div className="dossier-glance-intro">
              <span className="dossier-compass" aria-hidden="true">✦</span>
              <span>
                <strong>At A Glance</strong>
                <small>{balanceLabel(totalElevated, totalShadow)} · {totalElevated} elevated · {totalShadow} shadow</small>
              </span>
            </div>

            <div className="dossier-glance-matrix">
              {perspectives.map((perspective) => {
                const selected = selectionFor(perspective.id);
                return (
                  <div className="dossier-glance-row" key={`glance-${perspective.id}`}>
                    <strong>{perspective.title}</strong>
                    <span className="glance-elevated">
                      <b>Elevated:</b> {selected.elevated.length ? selected.elevated.join(", ") : "None checked yet"}
                    </span>
                    <span className="glance-shadow">
                      <b>Shadow:</b> {selected.shadow.length ? selected.shadow.join(", ") : "None checked yet"}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          <footer className="dossier-footer">
            <div className="dossier-footer-brand">
              <span className="dossier-brand-mark compact" aria-hidden="true"><span /><span /><span /></span>
              <span><strong>Lettrology™</strong><small>People • Patterns • Purpose</small></span>
            </div>
            <p>“Understanding people creates a brighter tomorrow.”</p>
            <div className="dossier-footer-actions">
              <button type="button" className="dossier-print" onClick={() => window.print()}>
                <Printer size={17} />Export / Print Report
              </button>
              <button type="button" className="dossier-close-button" onClick={onClose}>
                <X size={17} />Close
              </button>
            </div>
          </footer>
        </article>
      </div>
    </div>
  );
}

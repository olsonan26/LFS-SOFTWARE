import React, { useState } from "react";
import { HelpCircle, ArrowRight } from "lucide-react";
import {
  HypothesisRecord,
  CaseRecord,
  EvidenceRecord,
  EventRecord,
} from "../types";
import {
  PageHeading,
  EmptyState,
  ExpandableSection,
  humanize,
} from "./WorkspaceUI";
interface Props {
  caseRecord: CaseRecord;
  hypotheses: HypothesisRecord[];
  evidenceList: EvidenceRecord[];
  events: EventRecord[];
}
export function HypothesesView({ hypotheses, evidenceList }: Props) {
  const [selected, setSelected] = useState("");
  const h = hypotheses.find((x) => x.hypothesisId === selected);
  return (
    <div className="page-stack">
      <PageHeading
        eyebrow="Questions worth following"
        title="Open Questions"
        description="Review a hypothesis, its supporting sources and what remains unresolved."
      />
      {!h ? (
        <div>
          {hypotheses.map((x) => (
            <button
              className="trail-record"
              key={x.hypothesisId}
              onClick={() => setSelected(x.hypothesisId)}
            >
              <HelpCircle size={25} />
              <span>
                <strong>{x.title}</strong>
                <small>
                  {humanize(x.status)} · {x.unresolvedQuestions.length} open
                  questions
                </small>
              </span>
              <ArrowRight size={20} />
            </button>
          ))}
          {!hypotheses.length && (
            <EmptyState
              title="No hypotheses recorded"
              description="There are no research questions attached to this case yet."
            />
          )}
        </div>
      ) : (
        <>
          <button className="text-button" onClick={() => setSelected("")}>
            Back to questions
          </button>
          <section className="reading-surface">
            <span className="status-badge">{humanize(h.status)}</span>
            <h2>{h.title}</h2>
            <p>{h.description}</p>
            <p className="muted">Recorded by {h.author}</p>
            <h3>What remains unanswered?</h3>
            {h.unresolvedQuestions.map((q, i) => (
              <p className="citation" key={i}>
                {q}
              </p>
            ))}
            {[
              ["Supporting sources", h.supportingEvidenceIds],
              ["Contradicting sources", h.contradictingEvidenceIds],
            ].map(([title, ids]) => (
              <ExpandableSection
                key={title as string}
                title={title as string}
                summary={`${(ids as string[]).length} linked records`}
              >
                {(ids as string[]).map((id) => (
                  <p className="citation" key={id}>
                    {evidenceList.find((e) => e.evidenceId === id)?.title ||
                      "Referenced source not attached"}
                  </p>
                ))}
                {!(ids as string[]).length && <p>No sources recorded.</p>}
              </ExpandableSection>
            ))}
            <ExpandableSection
              title="Research indicators"
              summary="Three separate measures; no combined culpability score"
            >
              <p className="muted">
                These stored research scores are not probabilities of guilt.
              </p>
              <div className="profile-values">
                {[
                  ["Evidence completeness", h.evidenceCompletenessScore],
                  ["Timeline compatibility", h.timelineCompatibilityScore],
                  [
                    "Lettrology correlation density",
                    h.lettrologyCorrelationDensityScore,
                  ],
                ].map(([label, value]) => (
                  <div key={label}>
                    <span>{label}</span>
                    <strong>{value}%</strong>
                  </div>
                ))}
              </div>
            </ExpandableSection>
            <ExpandableSection
              title="Research notes"
              summary={
                h.notes ? "Read the attached notes" : "No notes attached"
              }
            >
              <p>{h.notes || "No notes attached."}</p>
            </ExpandableSection>
          </section>
        </>
      )}
    </div>
  );
}

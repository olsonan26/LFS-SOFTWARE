/**
 * @license
 * Lettrology Forensic Science - Investigative Hypotheses & Multi-Meter Evaluation
 * PRD Section 30: Hypothesis Sandbox
 * PRD Section 30.1: Three Distinct Visual Meters (NEVER combined into guilt probability)
 */

import React, { useState } from 'react';
import {
  HelpCircle,
  AlertTriangle,
  FileCheck2,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Plus,
  ShieldCheck,
} from 'lucide-react';
import { HypothesisRecord, CaseRecord, EvidenceRecord, EventRecord } from '../types.ts';

interface HypothesesViewProps {
  caseRecord: CaseRecord;
  hypotheses: HypothesisRecord[];
  evidenceList: EvidenceRecord[];
  events: EventRecord[];
}

export const HypothesesView: React.FC<HypothesesViewProps> = ({
  caseRecord,
  hypotheses,
  evidenceList,
  events,
}) => {
  const [selectedHypothesisId, setSelectedHypothesisId] = useState<string>(
    hypotheses[0]?.hypothesisId || ''
  );

  const currentHypothesis =
    hypotheses.find(h => h.hypothesisId === selectedHypothesisId) ||
    hypotheses[0];

  return (
    <div className="space-y-4">
      {/* Absolute Rule 7 & 15 Banner */}
      <div className="p-4 rounded-lg bg-amber-50 border-2 border-amber-300 flex items-start gap-3 text-xs text-amber-950 shadow-sm">
        <AlertTriangle className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
        <div>
          <span className="font-black uppercase tracking-wider text-amber-900 block mb-0.5">
            Mandatory Separation of Meters (PRD Section 30.1)
          </span>
          <p className="text-slate-800 font-medium leading-relaxed">
            Evidence Completeness, Timeline Compatibility, and Lettrology Correlation Density are independent
            analytical dimensions. <strong className="font-black text-black">The software strictly prohibits combining these meters into a single
            "Guilt Probability" or composite culpability score.</strong> Numerical correlation must never be conflated
            with forensic guilt.
          </p>
        </div>
      </div>

      {/* Main Grid: Hypothesis Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Hypotheses List */}
        <div className="lg:col-span-5 space-y-3">
          {hypotheses.map(hyp => {
            const isSelected = hyp.hypothesisId === currentHypothesis?.hypothesisId;
            return (
              <button
                key={hyp.hypothesisId}
                onClick={() => setSelectedHypothesisId(hyp.hypothesisId)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-amber-600 bg-amber-50/70 shadow-sm ring-1 ring-amber-400'
                    : 'border-slate-300 bg-white hover:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs uppercase font-black tracking-wider px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-900 border border-slate-300">
                    {hyp.status}
                  </span>
                  <span className="text-xs text-slate-700 font-bold font-mono">
                    Updated: {hyp.lastUpdated}
                  </span>
                </div>
                <h3 className="text-sm font-black text-slate-950 mb-2">{hyp.title}</h3>

                {/* 3 Distinct Meters Mini-Bar Preview */}
                <div className="space-y-2 pt-2 border-t-2 border-slate-200 text-xs font-bold">
                  <div className="flex items-center justify-between text-emerald-950">
                    <span>Evidence Completeness:</span>
                    <span className="font-black">{hyp.evidenceCompleteness}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full"
                      style={{ width: `${hyp.evidenceCompleteness}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-blue-950">
                    <span>Timeline Compatibility:</span>
                    <span className="font-black">{hyp.timelineCompatibility}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full"
                      style={{ width: `${hyp.timelineCompatibility}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-amber-950">
                    <span>Lettrology Correlation Density:</span>
                    <span className="font-black">{hyp.lettrologyCorrelationDensity}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-600 h-full rounded-full"
                      style={{ width: `${hyp.lettrologyCorrelationDensity}%` }}
                    ></div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Detailed Hypothesis Dossier */}
        <div className="lg:col-span-7 space-y-4">
          {currentHypothesis && (
            <div className="rounded-lg bg-white border-2 border-slate-300 p-5 shadow-sm space-y-4">
              <div className="flex items-start justify-between pb-3 border-b-2 border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-slate-950">{currentHypothesis.title}</h3>
                    <span className="text-xs font-black px-2 py-0.5 rounded-md bg-blue-100 border border-blue-300 text-blue-950 uppercase">
                      {currentHypothesis.status}
                    </span>
                  </div>
                  <span className="text-xs text-slate-700 font-bold block mt-0.5">
                    Formulated: {currentHypothesis.formulatedDate} by Investigator
                  </span>
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-700 font-bold uppercase tracking-wider block mb-1">
                  Investigative Hypothesis Statement
                </span>
                <p className="text-xs text-slate-900 font-semibold bg-slate-50 p-3.5 rounded-lg border-2 border-slate-200 leading-relaxed">
                  {currentHypothesis.statement}
                </p>
              </div>

              {/* The Three Independent Meters (Detailed) */}
              <div className="p-4 rounded-lg bg-slate-50 border-2 border-slate-300 space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-amber-900 block">
                  Three Independent Dimensional Meters (Non-Combinable)
                </span>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-white border-2 border-emerald-300 shadow-sm">
                    <span className="text-[11px] text-emerald-950 font-black uppercase block">
                      Evidence Completeness
                    </span>
                    <div className="text-2xl font-black text-emerald-800 my-1">
                      {currentHypothesis.evidenceCompleteness}%
                    </div>
                    <p className="text-xs text-slate-700 font-medium">
                      Physical & documentary proof supporting the premise.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-white border-2 border-blue-300 shadow-sm">
                    <span className="text-[11px] text-blue-950 font-black uppercase block">
                      Timeline Compatibility
                    </span>
                    <div className="text-2xl font-black text-blue-800 my-1">
                      {currentHypothesis.timelineCompatibility}%
                    </div>
                    <p className="text-xs text-slate-700 font-medium">
                      Absence of verified alibis and chronological contradictions.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-white border-2 border-amber-400 shadow-sm">
                    <span className="text-[11px] text-amber-950 font-black uppercase block">
                      Correlation Density
                    </span>
                    <div className="text-2xl font-black text-amber-900 my-1">
                      {currentHypothesis.lettrologyCorrelationDensity}%
                    </div>
                    <p className="text-xs text-slate-700 font-medium">
                      Numerical timing markers (11, 13, 16, intensifications).
                    </p>
                  </div>
                </div>
              </div>

              {/* Supporting Evidence vs Contradicting Facts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-lg bg-slate-50 border-2 border-emerald-300 space-y-2">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    Supporting Evidence ({currentHypothesis.supportingEvidenceIds.length})
                  </span>
                  {currentHypothesis.supportingEvidenceIds.map(id => {
                    const ev = evidenceList.find(e => e.evidenceId === id);
                    return (
                      <div key={id} className="p-2 rounded-md bg-white border border-slate-300 text-xs font-bold text-slate-900">
                        {ev?.title || id}
                      </div>
                    );
                  })}
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 border-2 border-red-300 space-y-2">
                  <span className="text-xs font-black uppercase tracking-wider text-red-950 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-red-700" />
                    Contradicting Evidence ({(currentHypothesis.contradictingEvidenceIds || []).length})
                  </span>
                  {(currentHypothesis.contradictingEvidenceIds || []).length > 0 ? (
                    currentHypothesis.contradictingEvidenceIds.map(id => {
                      const ev = (evidenceList || []).find(e => e.evidenceId === id);
                      return (
                        <div key={id} className="p-2 rounded-md bg-red-50 border border-red-300 text-xs font-bold text-red-950">
                          {ev?.title || id}
                        </div>
                      );
                    })
                  ) : (
                    <span className="text-xs text-slate-600 italic block font-medium">No active contradicting evidence recorded.</span>
                  )}
                </div>
              </div>

              {/* Unresolved Questions */}
              {currentHypothesis.unresolvedQuestions.length > 0 && (
                <div className="p-3.5 rounded-lg bg-slate-50 border-2 border-slate-300 space-y-2 text-xs">
                  <span className="text-xs uppercase tracking-wider text-slate-950 font-black block">
                    Unresolved Questions & Critical Inquiries:
                  </span>
                  {currentHypothesis.unresolvedQuestions.map((q, i) => (
                    <div key={i} className="text-slate-900 font-semibold flex items-start gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-600 mt-1.5 shrink-0"></span>
                      <span>{q}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * @license
 * Lettrology Forensic Science - Blind Analysis & Prospective Prediction Protocol
 * PRD Section 31: Blind-Analysis Mode
 */

import React, { useState } from 'react';
import {
  EyeOff,
  Eye,
  Lock,
  CheckCircle2,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { BlindExperiment, CaseRecord, EventRecord } from '../types.ts';
import { SEED_BLIND_EXPERIMENTS } from '../data/seedData.ts';

interface BlindAnalysisViewProps {
  caseRecord: CaseRecord;
  events: EventRecord[];
}

export const BlindAnalysisView: React.FC<BlindAnalysisViewProps> = ({
  caseRecord,
  events,
}) => {
  const [experiment, setExperiment] = useState<BlindExperiment | undefined>(() => SEED_BLIND_EXPERIMENTS.find(e => e.caseId === caseRecord.caseId));
  const [isRevealed, setIsRevealed] = useState<boolean>(experiment?.isRevealed || false);
  const [newPredYear, setNewPredYear] = useState<number>(2024);
  const [newPredDifficulty, setNewPredDifficulty] = useState<string>(
    'Critical disruption & acute pressure window'
  );
  const [newPredOpportunity, setNewPredOpportunity] = useState<string>(
    'Post-reset stabilization'
  );
  const [newConfidence, setNewConfidence] = useState<'HIGH' | 'MEDIUM' | 'EXPLORATORY'>('HIGH');

  const handleRevealExperiment = () => {
    if (!experiment) return;
    setIsRevealed(true);
    setExperiment(prev => ({
      ...prev,
      isRevealed: true,
      revealedAt: new Date().toISOString(),
    }));
  };

  if (!experiment) return <div className="empty-state"><h2>No blind study for this case</h2><p>No experiment has been recorded for this investigation.</p></div>;

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="p-4 rounded-lg bg-blue-50 border-2 border-blue-300 flex items-start gap-3 text-xs text-blue-950 shadow-sm">
        <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-black uppercase tracking-wider text-blue-950 block mb-0.5 text-sm">
            Blind Study — sample protocol
          </span>
          <p className="text-slate-800 font-medium leading-relaxed">
            To prevent confirmation bias and retrospective fitting, analysts formulate timing forecasts with case facts,
            media, and outcomes masked. Predictions are cryptographically locked with immutable hashes prior to revealing verified timeline reality.
          </p>
        </div>
      </div>

      {/* Main Experiment Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Masked Subject & Protocol Info */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-lg bg-white border-2 border-slate-300 p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-200">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-950 flex items-center gap-2">
                <EyeOff className="w-4 h-4 text-amber-600" />
                Masked Subject Dossier
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-md bg-amber-100 border border-amber-300 text-amber-950 font-bold">
                {experiment.experimentId}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-md bg-slate-50 border-2 border-slate-200">
                <span className="text-xs text-slate-700 uppercase font-black tracking-wider block">
                  Masked Subject Status
                </span>
                <span className="font-black text-base text-slate-950 block mt-0.5">
                  {isRevealed ? 'Julian Vance Blackwood' : 'Subject Ref #MASKED-8204'}
                </span>
                {isRevealed && (
                  <span className="text-xs text-emerald-800 font-bold block mt-1">
                    Identity Unmasked • Case #2024-CR-0891
                  </span>
                )}
              </div>

              <div className="p-3 rounded-md bg-slate-50 border-2 border-slate-200">
                <span className="text-xs text-slate-700 uppercase font-black tracking-wider block">
                  Input Parameters Provided to Analyst
                </span>
                <div className="font-mono text-slate-950 font-black pt-1">
                  <div>DOB: 1982-04-14 (Exact)</div>
                  <div>Full Birth Name Letters: Provided</div>
                </div>
              </div>

              <div className="p-3 rounded-md bg-slate-50 border-2 border-slate-200">
                <span className="text-xs text-slate-700 uppercase font-black tracking-wider block">
                  Hidden Fields (Masked)
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {experiment.hiddenFields.map(f => (
                    <span key={f} className="text-xs font-bold px-2 py-0.5 rounded-md bg-white border border-slate-300 text-slate-900 uppercase">
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-md bg-emerald-50 border-2 border-emerald-300 text-xs text-emerald-950 space-y-1">
                <div className="flex items-center gap-1.5 font-black">
                  <Lock className="w-4 h-4 text-emerald-700" /> Immutable Prediction Hash
                </div>
                <div className="font-mono text-xs text-slate-800 break-all font-bold">
                  {experiment.predictionHash}
                </div>
                <div className="text-xs text-slate-700 font-semibold pt-1">
                  Locked At: <strong className="text-slate-950">{new Date(experiment.submittedAt).toLocaleDateString()}</strong>
                </div>
              </div>

              {!isRevealed && (
                <button
                  onClick={handleRevealExperiment}
                  className="w-full py-2.5 rounded-md bg-amber-500 border border-amber-600 hover:bg-amber-600 text-xs text-slate-950 font-black transition-colors uppercase tracking-wider flex items-center justify-center gap-2 mt-2 shadow-sm"
                >
                  <Eye className="w-4 h-4" /> Unmask Reality & Compare Outcomes
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Blind Prediction Forecast & Verification */}
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-lg bg-white border-2 border-slate-300 p-4 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-200">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-950 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-600" />
                  Prospective Timing Forecast & Verification Audit
                </h3>
                <p className="text-xs text-slate-700 font-semibold mt-0.5">
                  {experiment.title}
                </p>
              </div>
              <span className="text-xs text-slate-800 font-bold">
                Analyst: <strong className="text-slate-950">{experiment.analystName}</strong>
              </span>
            </div>

            {/* Analyst Forecast Details */}
            <div className="p-4 rounded-lg bg-slate-50 border-2 border-slate-200 text-xs space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="font-black text-sm text-slate-950">
                  Forecasted Transition Years: {experiment.predictions.expectedTransitionYears.join(', ')}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-md bg-blue-100 border border-blue-300 text-blue-950 font-black uppercase">
                  Confidence: {experiment.predictions.analystConfidence}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-700 block text-xs uppercase font-black">
                    Forecasted Difficulty / High-Pressure Window:
                  </span>
                  <p className="text-slate-950 font-bold mt-0.5 leading-relaxed bg-white p-2.5 rounded border border-slate-200">
                    {experiment.predictions.expectedDifficultyPeriods}
                  </p>
                </div>

                <div>
                  <span className="text-slate-700 block text-xs uppercase font-black">
                    Forecasted Opportunity / Expansion Window:
                  </span>
                  <p className="text-slate-900 font-medium mt-0.5 leading-relaxed bg-white p-2.5 rounded border border-slate-200">
                    {experiment.predictions.expectedOpportunityPeriods}
                  </p>
                </div>

                <div className="pt-2 border-t-2 border-slate-200">
                  <span className="text-slate-700 block text-xs uppercase font-black">Theoretical Notes:</span>
                  <span className="text-slate-800 font-medium italic">{experiment.predictions.notes}</span>
                </div>
              </div>
            </div>

            {/* Outcome Comparison (Revealed State) */}
            {isRevealed && experiment.outcomeComparison && (
              <div className="p-4 rounded-lg bg-white border-2 border-emerald-400 text-xs space-y-3 shadow-sm">
                <div className="flex items-center justify-between border-b-2 border-slate-200 pb-2">
                  <span className="font-black text-emerald-950 uppercase tracking-wider flex items-center gap-1.5 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                    Verified Reality Outcome Comparison
                  </span>
                  <span className="text-xs text-slate-700 font-bold">
                    Revealed: {experiment.revealedAt ? new Date(experiment.revealedAt).toLocaleDateString() : 'Active'}
                  </span>
                </div>

                <div className="space-y-2.5">
                  <div>
                    <span className="text-xs uppercase font-black text-emerald-950 block mb-1">
                      Validated Hits ({experiment.outcomeComparison.hits.length})
                    </span>
                    <div className="space-y-1.5">
                      {experiment.outcomeComparison.hits.map((hit, i) => (
                        <div key={i} className="p-2.5 rounded-md bg-emerald-50 border border-emerald-300 text-xs text-emerald-950 font-bold flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                          <span>{hit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs uppercase font-black text-amber-950 block mb-1">
                      Deviations / Misses ({experiment.outcomeComparison.misses.length})
                    </span>
                    <div className="space-y-1.5">
                      {experiment.outcomeComparison.misses.map((miss, i) => (
                        <div key={i} className="p-2.5 rounded-md bg-amber-50 border border-amber-300 text-xs text-amber-950 font-medium flex items-start gap-2">
                          <span className="text-amber-700 font-black">•</span>
                          <span>{miss}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 rounded-md bg-slate-50 border-2 border-slate-200 text-xs text-slate-900 mt-2 font-medium">
                    <strong className="text-slate-950 block text-xs uppercase mb-1 font-black">Scientific Evaluation Summary:</strong>
                    {experiment.outcomeComparison.summary}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

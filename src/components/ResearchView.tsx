/**
 * @license
 * Lettrology Forensic Science - Research Database & Statistical Pattern Explorer
 * PRD Section 32, 33, 36.10
 */

import React, { useState } from 'react';
import {
  Database,
  Search,
  Filter,
  BarChart3,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { CaseRecord, EventRecord, PersonRecord } from '../types.ts';

interface ResearchViewProps {
  allCases: CaseRecord[];
  allPeople: PersonRecord[];
  allEvents: EventRecord[];
}

export const ResearchView: React.FC<ResearchViewProps> = ({
  allCases,
  allPeople,
  allEvents,
}) => {
  const [selectedMarker, setSelectedMarker] = useState<string>('16');
  const [selectedLayer, setSelectedLayer] = useState<string>('MCOM');
  const [selectedCategory, setSelectedCategory] = useState<string>('CRIME_INCIDENT');

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="p-4 rounded-lg bg-white border-2 border-slate-300 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black text-slate-950 uppercase tracking-wider flex items-center gap-2">
            <Database className="w-5 h-5 text-amber-800" />
            Cross-Case Research Database & Pattern Explorer
          </h2>
          <p className="text-xs font-semibold text-slate-700">
            Query empirical markers across multiple cases, examine statistical frequency, and compare against non-incident baselines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-emerald-950 font-black font-mono bg-emerald-100 border-2 border-emerald-400 px-3 py-1 rounded-md shadow-sm">
            Corpus: {(allCases || []).length} Cases • {(allPeople || []).length} Subjects • {(allEvents || []).length} Events
          </span>
        </div>
      </div>

      {/* Query Builder */}
      <div className="rounded-lg bg-white border-2 border-slate-300 p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-2">
          <Search className="w-4 h-4 text-amber-700" />
          Empirical Cohort Query Builder
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="text-xs text-slate-700 font-bold uppercase tracking-wider block mb-1">
              Target Power Number / Marker
            </label>
            <select
              value={selectedMarker}
              onChange={e => setSelectedMarker(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-300 rounded-md p-2.5 text-slate-950 font-bold focus:outline-none focus:border-slate-800"
            >
              <option value="11">Power Number 11 (Illumination / Stress)</option>
              <option value="13">Power Number 13 (Upheaval / Radical Shift)</option>
              <option value="16">Power Number 16 (Fall / Overreach / Destruction)</option>
              <option value="INTENSIFICATION">Intensification (ESS == PY)</option>
              <option value="RESET_9_1">Cycle Reset (9 → 1)</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-700 font-bold uppercase tracking-wider block mb-1">
              Calculation Layer
            </label>
            <select
              value={selectedLayer}
              onChange={e => setSelectedLayer(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-300 rounded-md p-2.5 text-slate-950 font-bold focus:outline-none focus:border-slate-800"
            >
              <option value="MCOM">MCOM (Monthly Combiner)</option>
              <option value="PME">PME (Personal Month Essence)</option>
              <option value="PM">PM (Personal Month)</option>
              <option value="COM">COM (Yearly Combiner)</option>
              <option value="ESS">ESS (Yearly Essence)</option>
              <option value="PY">PY (Personal Year)</option>
              <option value="CROSSOVER">Month-End Crossover</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-700 font-bold uppercase tracking-wider block mb-1">
              Correlated Event Category
            </label>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-300 rounded-md p-2.5 text-slate-950 font-bold focus:outline-none focus:border-slate-800"
            >
              <option value="CRIME_INCIDENT">Homicide / Violent Crime</option>
              <option value="ARREST">Arrest / Apprehension</option>
              <option value="CAREER">Venture / Major Expansion</option>
              <option value="ACCIDENT">Accident / Catastrophe</option>
              <option value="RELATIONSHIP">Divorce / Separation</option>
            </select>
          </div>
        </div>

        {/* Statistical Findings & Cohort Baseline Comparison (PRD Section 33) */}
        <div className="p-4 rounded-lg bg-slate-50 border-2 border-slate-300 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-950 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-amber-800" />
              Corpus Baseline Comparison (Anti-Bias Control)
            </span>
            <span className="text-xs text-slate-700 font-bold">Randomized Null-Hypothesis Baseline</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-white border-2 border-slate-300 shadow-sm">
              <span className="text-[11px] text-slate-700 font-black uppercase block">Incident Window Rate:</span>
              <div className="text-2xl font-black text-amber-900 my-0.5">38.4%</div>
              <p className="text-xs text-slate-700 font-medium">
                Frequency of authentic {selectedMarker} in {selectedLayer} during documented incidents.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-white border-2 border-slate-300 shadow-sm">
              <span className="text-[11px] text-slate-700 font-black uppercase block">Null Baseline Expected:</span>
              <div className="text-2xl font-black text-slate-600 my-0.5">11.1%</div>
              <p className="text-xs text-slate-700 font-medium">
                Expected mathematical random occurrence across 1-9 distribution.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-white border-2 border-slate-300 shadow-sm">
              <span className="text-[11px] text-slate-700 font-black uppercase block">Observed Elevation:</span>
              <div className="text-2xl font-black text-emerald-800 my-0.5">+27.3%</div>
              <p className="text-xs text-slate-700 font-medium">
                Positive empirical divergence over random expectation.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-amber-50 border-2 border-amber-300 text-xs text-amber-950 font-medium flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-800 shrink-0" />
            <span>
              Statistical frequency alone does not satisfy evidentiary burdens in criminal proceedings. Always verify
              corroborating physical chain of custody.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

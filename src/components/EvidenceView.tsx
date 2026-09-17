/**
 * @license
 * Lettrology Forensic Science - Evidence Repository & Extracted Fact Objects
 * PRD Section 28, 36.6
 */

import React, { useState } from 'react';
import {
  FileCheck2,
  ShieldCheck,
  AlertCircle,
  Clock,
  Layers,
  Search,
  Plus,
  ExternalLink,
  Tag,
} from 'lucide-react';
import { EvidenceRecord, CaseRecord, PersonRecord } from '../types.ts';

interface EvidenceViewProps {
  caseRecord: CaseRecord;
  evidenceList: EvidenceRecord[];
  people: PersonRecord[];
}

export const EvidenceView: React.FC<EvidenceViewProps> = ({
  caseRecord,
  evidenceList,
  people,
}) => {
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string>(
    evidenceList[0]?.evidenceId || ''
  );
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredEvidence = evidenceList.filter(e => {
    if (filterType !== 'ALL' && e.evidenceType !== filterType) return false;
    return true;
  });

  const currentEvidence =
    evidenceList.find(e => e.evidenceId === selectedEvidenceId) ||
    evidenceList[0];

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="p-4 rounded-lg bg-white border-2 border-slate-300 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div>
          <h2 className="text-base font-black text-slate-950 uppercase tracking-wider flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-amber-600" />
            Evidence Repository & Fact Objects
          </h2>
          <p className="text-xs text-slate-700 font-semibold mt-0.5">
            Admissible physical, documentary, digital, and testimonial evidence with chain-of-custody tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="bg-white border-2 border-slate-300 rounded-md px-3 py-1.5 text-xs font-bold text-slate-950 focus:outline-none focus:border-slate-800"
          >
            <option value="ALL">All Types</option>
            <option value="PHYSICAL">Physical Evidence</option>
            <option value="DOCUMENTARY">Documentary</option>
            <option value="TESTIMONIAL">Testimonial</option>
            <option value="DIGITAL">Digital Records</option>
            <option value="FORENSIC_REPORT">Forensic Report</option>
          </select>
        </div>
      </div>

      {/* Main Grid: List + Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Evidence Cards */}
        <div className="lg:col-span-4 space-y-2">
          {filteredEvidence.map(ev => {
            const isSelected = ev.evidenceId === currentEvidence?.evidenceId;
            return (
              <button
                key={ev.evidenceId}
                onClick={() => setSelectedEvidenceId(ev.evidenceId)}
                className={`w-full text-left p-3.5 rounded-lg border-2 transition-all shadow-sm ${
                  isSelected
                    ? 'border-amber-600 bg-amber-50 shadow-md ring-2 ring-amber-400'
                    : 'border-slate-300 bg-white hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs uppercase font-black tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-amber-950 border border-amber-300">
                    {ev.evidenceType}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-100 border border-emerald-400 text-emerald-950 font-bold">
                    Rating: {ev.reliabilityRating}
                  </span>
                </div>
                <h4 className="font-black text-sm text-slate-950 truncate">{ev.title}</h4>
                <p className="text-xs text-slate-700 font-medium mt-1 line-clamp-2">{ev.description}</p>
              </button>
            );
          })}
        </div>

        {/* Right: Detailed Dossier & Extracted Fact Objects */}
        <div className="lg:col-span-8 space-y-4">
          {currentEvidence ? (
            <div className="rounded-lg bg-white border-2 border-slate-300 p-4 shadow-sm space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b-2 border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-slate-950">{currentEvidence.title}</h3>
                    <span className="text-xs px-2.5 py-0.5 rounded-md font-bold bg-emerald-100 border border-emerald-400 text-emerald-950">
                      {currentEvidence.verificationState}
                    </span>
                  </div>
                  <span className="text-xs text-slate-700 font-semibold block mt-1">
                    Acquired: <strong className="text-black font-black">{currentEvidence.dateAcquired}</strong> • Source: <strong className="text-black font-black">{currentEvidence.source}</strong>
                  </span>
                </div>
                <span className="text-xs px-3 py-1 rounded-md bg-blue-50 border-2 border-blue-300 text-blue-950 font-mono font-bold">
                  Chain: {currentEvidence.chainOfCustodySummary}
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-700 font-bold uppercase tracking-wider block mb-1">
                  Official Item Summary
                </span>
                <p className="text-xs text-slate-900 font-medium bg-slate-50 p-3 rounded-md border-2 border-slate-200 leading-relaxed">
                  {currentEvidence.description}
                </p>
              </div>

              {/* Extracted Fact Objects (PRD Section 28.2) */}
              <div className="pt-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-950 mb-2.5 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  Corroborated Fact Objects ({currentEvidence.extractedFacts.length})
                </h4>
                <div className="space-y-2">
                  {currentEvidence.extractedFacts.map(fact => (
                    <div
                      key={fact.factId}
                      className="p-3.5 rounded-lg bg-slate-50 border-2 border-slate-200 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-slate-950">{fact.statement}</span>
                        <span className="text-xs px-2.5 py-0.5 rounded-md font-bold bg-blue-100 border border-blue-300 text-blue-950">
                          {fact.confidence}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-700 font-medium pt-1.5 border-t-2 border-slate-200">
                        <span>Timestamp Ref: <strong className="text-black font-black">{fact.dateTimeReference || 'General'}</strong></span>
                        <span>Citation: <strong className="text-black font-bold">{fact.citation}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-700 font-bold bg-white rounded-lg border-2 border-slate-300">
              No evidence selected.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

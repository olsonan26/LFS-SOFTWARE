/**
 * @license
 * Lettrology Forensic Science - Case Management & Overview Dashboard
 * PRD Section 8, 36.1
 */

import React, { useState } from 'react';
import {
  FolderKanban,
  Users,
  Calendar,
  FileCheck2,
  Clock,
  MapPin,
  ShieldCheck,
  Plus,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { CaseRecord, PersonRecord, EventRecord, EvidenceRecord } from '../types.ts';
import { CURRENT_ENGINE_VERSION } from '../core/lettrology-engine/methodologyVersion.ts';

interface CaseOverviewViewProps {
  cases: CaseRecord[];
  activeCase: CaseRecord;
  onSelectCase: (c: CaseRecord) => void;
  people: PersonRecord[];
  events: EventRecord[];
  evidenceList: EvidenceRecord[];
  onOpenNewCaseModal: () => void;
  onNavigateTab: (tab: any) => void;
}

export const CaseOverviewView: React.FC<CaseOverviewViewProps> = ({
  cases,
  activeCase,
  onSelectCase,
  people,
  events,
  evidenceList,
  onOpenNewCaseModal,
  onNavigateTab,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredCases = cases.filter(c => {
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="p-4 rounded-lg bg-white border-2 border-slate-300 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black text-slate-950 uppercase tracking-wider flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-amber-700" />
            Case Dossier & Investigation Management
          </h2>
          <p className="text-xs text-slate-700 font-medium">
            Manage forensic criminology cases, benchmark validation files, and active investigative inquiries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 p-1 rounded-md border-2 border-slate-300 text-xs">
            {['ALL', 'ACTIVE', 'COLD_CASE', 'CLOSED'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded font-bold uppercase tracking-wider transition-colors ${
                  statusFilter === st
                    ? 'bg-slate-950 text-white shadow-sm'
                    : 'text-slate-700 hover:text-black hover:bg-slate-200'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>

          <button
            onClick={onOpenNewCaseModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-slate-950 hover:bg-slate-800 text-xs text-white font-bold transition-colors uppercase tracking-wider shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Case
          </button>
        </div>
      </div>

      {/* Main Grid: Case Selector (Left) & Active Case Dashboard (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: All Cases Cards */}
        <div className="lg:col-span-5 space-y-3">
          {filteredCases.map(c => {
            const isSelected = c.caseId === activeCase.caseId;
            return (
              <button
                key={c.caseId}
                onClick={() => onSelectCase(c)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all shadow-sm ${
                  isSelected
                    ? 'border-amber-600 bg-amber-50/60 ring-2 ring-amber-300'
                    : 'border-slate-300 bg-white hover:border-slate-500 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] uppercase font-black tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-950 border border-slate-300">
                    {c.caseNumber}
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 border border-emerald-400 text-emerald-950 uppercase">
                    {c.status}
                  </span>
                </div>
                <h3 className="text-sm font-black text-slate-950 mb-1">{c.title}</h3>
                <p className="text-xs text-slate-700 line-clamp-2 mb-2 font-medium">{c.summary}</p>
                <div className="flex items-center justify-between text-xs text-slate-600 font-semibold pt-2 border-t border-slate-200">
                  <span>Lead: <strong className="text-slate-900">{c.leadInvestigator}</strong></span>
                  <span className="text-amber-900 font-bold flex items-center gap-1">
                    Select <ChevronRight className="w-4 h-4 text-amber-700" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Active Case Detailed Command Center */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-lg bg-white border-2 border-slate-300 p-5 shadow-sm space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b-2 border-slate-200">
              <div>
                <span className="text-[11px] font-black uppercase tracking-widest text-amber-800">
                  Active Case File • {activeCase.caseNumber}
                </span>
                <h2 className="text-xl font-black text-slate-950 mt-0.5">{activeCase.title}</h2>
                <div className="flex items-center gap-3 text-xs text-slate-700 font-medium mt-1">
                  <span>Lead: <strong className="text-slate-950">{activeCase.leadInvestigator}</strong></span>
                  <span>•</span>
                  <span>Privacy: <strong className="text-slate-950">{activeCase.privacyLevel}</strong></span>
                  <span>•</span>
                  <span className="font-mono font-bold text-amber-800">{CURRENT_ENGINE_VERSION}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigateTab('CHART')}
                  className="px-3 py-1.5 rounded-md bg-amber-100 border-2 border-amber-600 text-xs text-amber-950 font-black hover:bg-amber-200 transition-colors uppercase tracking-wider shadow-sm"
                >
                  Open Time-Map
                </button>
              </div>
            </div>

            {/* Narrative Case Summary */}
            <div>
              <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block mb-1">
                Official Case Briefing & Context
              </span>
              <p className="text-xs text-slate-900 bg-slate-50 p-3.5 rounded-md border-2 border-slate-200 leading-relaxed font-medium">
                {activeCase.summary}
              </p>
            </div>

            {/* Core Incident Provenance */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-md bg-slate-50 border-2 border-slate-200">
                <span className="text-[11px] text-slate-700 font-bold uppercase tracking-wider block mb-1">
                  Primary Incident Window
                </span>
                <div className="font-mono text-slate-950 font-black text-sm">
                  {activeCase.primaryIncidentDate || 'Not specified'}
                </div>
                <span className="text-xs text-slate-700 mt-1 flex items-center gap-1 font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-slate-600" /> {activeCase.incidentLocation || 'Jurisdiction wide'}
                </span>
              </div>

              <div className="p-3.5 rounded-md bg-slate-50 border-2 border-slate-200">
                <span className="text-[11px] text-slate-700 font-bold uppercase tracking-wider block mb-1">
                  Timeline Boundaries
                </span>
                <div className="font-mono text-slate-950 font-black text-sm">
                  {activeCase.timelineStartYear} — {activeCase.timelineEndYear}
                </div>
                <span className="text-xs text-emerald-800 font-bold mt-1 block">
                  Deterministic Model Aligned
                </span>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <button
                onClick={() => onNavigateTab('PEOPLE')}
                className="p-3.5 rounded-md bg-slate-50 border-2 border-slate-200 hover:border-slate-800 hover:bg-slate-100 transition-colors shadow-sm"
              >
                <span className="text-[11px] text-slate-700 font-bold uppercase block">Subjects</span>
                <div className="text-2xl font-black text-slate-950 mt-0.5">{people.length}</div>
                <span className="text-xs text-amber-800 font-bold">View People →</span>
              </button>

              <button
                onClick={() => onNavigateTab('CHRONOLOGY')}
                className="p-3.5 rounded-md bg-slate-50 border-2 border-slate-200 hover:border-slate-800 hover:bg-slate-100 transition-colors shadow-sm"
              >
                <span className="text-[11px] text-slate-700 font-bold uppercase block">Timeline Events</span>
                <div className="text-2xl font-black text-slate-950 mt-0.5">{events.length}</div>
                <span className="text-xs text-slate-900 font-bold">View Events →</span>
              </button>

              <button
                onClick={() => onNavigateTab('EVIDENCE')}
                className="p-3.5 rounded-md bg-slate-50 border-2 border-slate-200 hover:border-slate-800 hover:bg-slate-100 transition-colors shadow-sm"
              >
                <span className="text-[11px] text-slate-700 font-bold uppercase block">Evidence Items</span>
                <div className="text-2xl font-black text-slate-950 mt-0.5">{evidenceList.length}</div>
                <span className="text-xs text-emerald-800 font-bold">View Evidence →</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

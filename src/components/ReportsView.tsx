/**
 * @license
 * Lettrology Forensic Science - Formal Reporting & Export Engine
 * PRD Section 34: Formal Output & Reporting
 * PRD Section 36.11: Reports View
 */

import React, { useState } from 'react';
import {
  Printer,
  FileDown,
  FileText,
  ShieldCheck,
  AlertTriangle,
  Layers,
  Calendar,
  Users,
} from 'lucide-react';
import { CaseRecord, PersonRecord, EventRecord, EvidenceRecord, HypothesisRecord } from '../types.ts';
import { CURRENT_ENGINE_VERSION } from '../core/lettrology-engine/methodologyVersion.ts';

interface ReportsViewProps {
  caseRecord: CaseRecord;
  people: PersonRecord[];
  events: EventRecord[];
  evidenceList: EvidenceRecord[];
  hypotheses: HypothesisRecord[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  caseRecord,
  people,
  events,
  evidenceList,
  hypotheses,
}) => {
  const [reportType, setReportType] = useState<'FULL_DOSSIER' | 'TIME_MAP' | 'CHRONOLOGY' | 'EVIDENCE_INDEX'>('FULL_DOSSIER');

  const handlePrint = () => {
    window.print();
  };

  if (!caseRecord) {
    return (
      <div className="p-8 text-center bg-white border border-slate-200 rounded-lg text-slate-800">
        <p className="text-base font-semibold">No active case selected.</p>
        <p className="text-sm text-slate-600 mt-1">Please select an active case from the Cases tab to generate forensic reports.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Control Header */}
      <div className="p-4 rounded-lg bg-white border-2 border-slate-300 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black text-slate-950 uppercase tracking-wider flex items-center gap-2">
            <Printer className="w-5 h-5 text-amber-800" />
            Forensic Case Reporting & Export Engine
          </h2>
          <p className="text-xs font-semibold text-slate-700">
            Standardized investigative dossiers with calculation provenance, evidentiary indices, and methodology warnings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-md border-2 border-slate-300 text-xs">
            <button
              onClick={() => setReportType('FULL_DOSSIER')}
              className={`px-3 py-1 rounded font-bold uppercase tracking-wider transition-colors ${
                reportType === 'FULL_DOSSIER'
                  ? 'bg-slate-950 text-white shadow-sm'
                  : 'text-slate-700 hover:text-black hover:bg-slate-200'
              }`}
            >
              Full Dossier
            </button>
            <button
              onClick={() => setReportType('TIME_MAP')}
              className={`px-3 py-1 rounded font-bold uppercase tracking-wider transition-colors ${
                reportType === 'TIME_MAP'
                  ? 'bg-slate-950 text-white shadow-sm'
                  : 'text-slate-700 hover:text-black hover:bg-slate-200'
              }`}
            >
              Time-Map Print
            </button>
            <button
              onClick={() => setReportType('CHRONOLOGY')}
              className={`px-3 py-1 rounded font-bold uppercase tracking-wider transition-colors ${
                reportType === 'CHRONOLOGY'
                  ? 'bg-slate-950 text-white shadow-sm'
                  : 'text-slate-700 hover:text-black hover:bg-slate-200'
              }`}
            >
              Chronology
            </button>
            <button
              onClick={() => setReportType('EVIDENCE_INDEX')}
              className={`px-3 py-1 rounded font-bold uppercase tracking-wider transition-colors ${
                reportType === 'EVIDENCE_INDEX'
                  ? 'bg-slate-950 text-white shadow-sm'
                  : 'text-slate-700 hover:text-black hover:bg-slate-200'
              }`}
            >
              Evidence Index
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-100 border-2 border-amber-600 text-xs text-amber-950 font-black hover:bg-amber-200 transition-colors uppercase tracking-wider shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Print Official Report
          </button>
        </div>
      </div>

      {/* Printable Report Document Sheet */}
      <div className="rounded-lg bg-white border-2 border-slate-300 p-8 shadow-sm space-y-6 text-slate-950 max-w-4xl mx-auto">
        {/* Report Official Header */}
        <div className="border-b-2 border-amber-600 pb-4 flex items-start justify-between">
          <div>
            <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-800 block mb-1">
              CONFIDENTIAL INVESTIGATIVE DOSSIER • LAW ENFORCEMENT & RESEARCH
            </span>
            <h1 className="text-xl font-black uppercase tracking-wider text-slate-950">
              {caseRecord.title}
            </h1>
            <p className="text-xs text-slate-700 font-bold mt-1">
              Case Number: <strong className="text-slate-950">{caseRecord.caseNumber}</strong> • Lead: {caseRecord.leadInvestigator}
            </p>
          </div>
          <div className="text-right text-xs">
            <span className="text-xs px-2 py-0.5 rounded-md border-2 border-amber-600 bg-amber-50 text-amber-950 font-black font-mono block mb-1">
              Engine {CURRENT_ENGINE_VERSION}
            </span>
            <span className="text-slate-700 font-bold block">Date: {new Date().toLocaleDateString()}</span>
          </div>
        </div>

        {/* Mandatory Legal & Methodology Disclaimer (PRD Section 34.2) */}
        <div className="p-3.5 rounded-lg bg-amber-50 border-2 border-amber-300 text-xs text-amber-950 leading-relaxed font-medium">
          <strong className="text-amber-900 font-black block mb-0.5 uppercase tracking-wide">
            Legal & Evidentiary Notice:
          </strong>
          This document contains deterministic Lettrology timing research and empirical time-mapping analysis.
          Numerical correlations, Power Numbers (11, 13, 16), and Essences do not establish physical evidence,
          culpability, or legal guilt. All findings are investigative hypotheses subject to independent forensic proof.
        </div>

        {/* Case Profile Overview */}
        <div className="space-y-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-amber-900 border-b-2 border-slate-200 pb-1">
            1. Case Summary & Core Incident
          </h3>
          <p className="text-xs text-slate-900 font-semibold leading-relaxed">
            {caseRecord.summary}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-2">
            <div className="p-2.5 rounded-md bg-slate-50 border-2 border-slate-200">
              <span className="text-[11px] text-slate-700 font-bold block uppercase">Status:</span>
              <span className="font-black text-slate-950">{caseRecord.status}</span>
            </div>
            <div className="p-2.5 rounded-md bg-slate-50 border-2 border-slate-200">
              <span className="text-[11px] text-slate-700 font-bold block uppercase">Privacy:</span>
              <span className="font-black text-slate-950">{caseRecord.privacyLevel}</span>
            </div>
            <div className="p-2.5 rounded-md bg-slate-50 border-2 border-slate-200">
              <span className="text-[11px] text-slate-700 font-bold block uppercase">Primary Incident:</span>
              <span className="font-black text-blue-950">{caseRecord.primaryIncidentDate || 'N/A'}</span>
            </div>
            <div className="p-2.5 rounded-md bg-slate-50 border-2 border-slate-200">
              <span className="text-[11px] text-slate-700 font-bold block uppercase">Location:</span>
              <span className="font-black text-slate-950">{caseRecord.incidentLocation || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Subjects Profile Table */}
        <div className="space-y-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-amber-900 border-b-2 border-slate-200 pb-1">
            2. Case Subjects & Verified Identities ({people.length})
          </h3>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-950 border-b-2 border-slate-300">
                <th className="p-2 font-black">Display Name</th>
                <th className="p-2 font-black">Role</th>
                <th className="p-2 font-black">DOB</th>
                <th className="p-2 font-black">Verified Birth Name</th>
                <th className="p-2 font-black">Verification State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {people.map(p => (
                <tr key={p.personId} className="hover:bg-slate-50">
                  <td className="p-2 font-black text-slate-950">{p.displayName}</td>
                  <td className="p-2 font-bold text-slate-800">{p.roleInCase}</td>
                  <td className="p-2 font-mono font-bold text-blue-950">{p.dob}</td>
                  <td className="p-2 font-bold text-slate-800">{p.verifiedBirthName}</td>
                  <td className="p-2 font-black text-emerald-800">{p.identityVerificationState}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Incident Chronology Table */}
        <div className="space-y-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-amber-900 border-b-2 border-slate-200 pb-1">
            3. Master Chronological Timeline ({events.length} Incidents)
          </h3>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-950 border-b-2 border-slate-300">
                <th className="p-2 font-black">Timestamp</th>
                <th className="p-2 font-black">Category</th>
                <th className="p-2 font-black">Title</th>
                <th className="p-2 font-black">Fact Status</th>
                <th className="p-2 font-black">Reliability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {events.map(e => (
                <tr key={e.eventId} className="hover:bg-slate-50">
                  <td className="p-2 font-mono font-bold text-blue-950">
                    {e.startDate} {e.time ? `@ ${e.time}` : ''}
                  </td>
                  <td className="p-2 font-bold text-slate-700 uppercase text-[11px]">{e.category}</td>
                  <td className="p-2 font-black text-slate-950">{e.title}</td>
                  <td className="p-2 font-black text-emerald-800">{e.factStatus}</td>
                  <td className="p-2 font-bold text-slate-800">{e.sourceReliability}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Hypotheses & Evidence Index */}
        <div className="space-y-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-amber-900 border-b-2 border-slate-200 pb-1">
            4. Investigative Hypotheses & Multi-Meter Evaluation
          </h3>
          <div className="space-y-2">
            {hypotheses.map(h => (
              <div key={h.hypothesisId} className="p-3 rounded-lg bg-slate-50 border-2 border-slate-300 text-xs">
                <div className="flex justify-between font-black mb-1.5 text-slate-950">
                  <span>{h.title}</span>
                  <span className="text-blue-900 uppercase font-black">{h.status}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs pt-1.5 border-t-2 border-slate-200 font-bold">
                  <div>Evidence: <strong className="text-emerald-800 font-black">{h.evidenceCompleteness}%</strong></div>
                  <div>Timeline: <strong className="text-blue-900 font-black">{h.timelineCompatibility}%</strong></div>
                  <div>Lettrology Density: <strong className="text-amber-900 font-black">{h.lettrologyCorrelationDensity}%</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Report Footer */}
        <div className="pt-6 border-t-2 border-slate-200 flex justify-between text-xs text-slate-600 font-bold">
          <span>Generated by Lettrology Forensic Science Platform</span>
          <span>Certified Reproducible Calculation Engine {CURRENT_ENGINE_VERSION}</span>
        </div>
      </div>
    </div>
  );
};

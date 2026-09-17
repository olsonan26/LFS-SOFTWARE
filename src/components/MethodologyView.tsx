/**
 * @license
 * Lettrology Forensic Science - Methodology Engine, Acceptance Tests, & Peter Review Dashboard
 * PRD Section 4, 12, 43 (Acceptance Tests), 44 (Conflict Registry), 45 (Pending Items)
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  FileCode,
  Layers,
  Sparkles,
  Info,
  Clock,
  BookOpen,
} from 'lucide-react';
import {
  CANONICAL_RULES,
  CURRENT_ENGINE_VERSION,
  PENDING_PETER_ITEMS,
  CONFLICT_REGISTRY,
} from '../core/lettrology-engine/methodologyVersion.ts';
import { runAllAcceptanceTests, TestCaseResult } from '../core/lettrology-engine/engineTests.ts';

export const MethodologyView: React.FC = () => {
  const [testResults, setTestResults] = useState<TestCaseResult[]>(() => runAllAcceptanceTests());
  const [activeSubTab, setActiveSubTab] = useState<'TESTS' | 'REGISTRY' | 'CONFLICTS' | 'PENDING'>('TESTS');

  const handleRerunTests = () => {
    const results = runAllAcceptanceTests();
    setTestResults(results);
  };

  const allPassed = testResults.every(t => t.passed);

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="p-4 rounded-lg bg-white border-2 border-slate-300 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black text-slate-950 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
              Methodology Verification & Peter Vaughan Review
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-md bg-emerald-100 border border-emerald-400 text-emerald-950 font-mono font-black">
              {CURRENT_ENGINE_VERSION}
            </span>
          </div>
          <p className="text-xs text-slate-700 font-semibold mt-0.5">
            Authoritative rule provenance, live test suite verification, and active conflict audit log.
          </p>
        </div>

        {/* Sub Navigation */}
        <div className="flex items-center bg-slate-100 p-1 rounded-md border-2 border-slate-300 text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('TESTS')}
            className={`px-3 py-1.5 rounded uppercase tracking-wider transition-colors ${
              activeSubTab === 'TESTS'
                ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                : 'text-slate-800 hover:text-black'
            }`}
          >
            Acceptance Tests ({testResults.filter(t => t.passed).length}/{testResults.length})
          </button>
          <button
            onClick={() => setActiveSubTab('REGISTRY')}
            className={`px-3 py-1.5 rounded uppercase tracking-wider transition-colors ${
              activeSubTab === 'REGISTRY'
                ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                : 'text-slate-800 hover:text-black'
            }`}
          >
            Rule Registry ({CANONICAL_RULES.length})
          </button>
          <button
            onClick={() => setActiveSubTab('CONFLICTS')}
            className={`px-3 py-1.5 rounded uppercase tracking-wider transition-colors ${
              activeSubTab === 'CONFLICTS'
                ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                : 'text-slate-800 hover:text-black'
            }`}
          >
            Conflict Registry ({CONFLICT_REGISTRY.length})
          </button>
          <button
            onClick={() => setActiveSubTab('PENDING')}
            className={`px-3 py-1.5 rounded uppercase tracking-wider transition-colors ${
              activeSubTab === 'PENDING'
                ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                : 'text-slate-800 hover:text-black'
            }`}
          >
            Pending Items ({PENDING_PETER_ITEMS.length})
          </button>
        </div>
      </div>

      {/* SUB-VIEW 1: ACCEPTANCE TEST SUITE (PRD Section 43) */}
      {activeSubTab === 'TESTS' && (
        <div className="rounded-lg bg-white border-2 border-slate-300 p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-slate-200">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-950 flex items-center gap-2">
                <FileCode className="w-4 h-4 text-amber-600" />
                Section 43 Canonical Acceptance Test Suite
              </h3>
              <p className="text-xs text-slate-700 font-semibold">
                Deterministic mathematical checks guaranteeing adherence to documented Lettrology rules.
              </p>
            </div>

            <button
              onClick={handleRerunTests}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-500 border border-amber-600 hover:bg-amber-600 text-xs text-slate-950 font-black transition-colors uppercase tracking-wider shadow-sm"
            >
              <Play className="w-4 h-4" />
              Re-Run Test Suite
            </button>
          </div>

          {/* Test Status Banner */}
          <div
            className={`p-3.5 rounded-lg border-2 flex items-center justify-between text-xs font-bold ${
              allPassed
                ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                : 'bg-red-50 border-red-400 text-red-950'
            }`}
          >
            <div className="flex items-center gap-2">
              {allPassed ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-700" />
              ) : (
                <XCircle className="w-5 h-5 text-red-700" />
              )}
              <span className="font-black text-sm">
                {allPassed
                  ? 'All Canonical Acceptance Tests Verified Green (100% Pass Rate)'
                  : 'Test Failures Detected'}
              </span>
            </div>
            <span className="font-mono text-xs font-bold text-slate-800">
              Engine Version: {CURRENT_ENGINE_VERSION}
            </span>
          </div>

          {/* Test Cards List */}
          <div className="space-y-3">
            {testResults.map(test => (
              <div
                key={test.testId}
                className="p-3.5 rounded-lg bg-slate-50 border-2 border-slate-200 text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-blue-950 px-2 py-0.5 rounded bg-blue-100 border border-blue-300">{test.testId}</span>
                    <span className="font-black text-sm text-slate-950">{test.name}</span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-xs font-black uppercase ${
                      test.passed
                        ? 'bg-emerald-100 text-emerald-950 border border-emerald-400'
                        : 'bg-red-100 text-red-950 border border-red-400'
                    }`}
                  >
                    {test.passed ? 'PASSED' : 'FAILED'}
                  </span>
                </div>
                <p className="text-slate-800 text-xs font-semibold">{test.description}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono pt-2 border-t-2 border-slate-200">
                  <div>
                    <span className="text-slate-600 font-bold">Expected: </span>
                    <span className="text-slate-950 font-black">{test.expected}</span>
                  </div>
                  <div>
                    <span className="text-slate-600 font-bold">Actual: </span>
                    <span className="text-emerald-800 font-black">{test.actual}</span>
                  </div>
                </div>
                {test.notes && (
                  <p className="text-xs text-amber-900 font-bold italic pt-0.5">Note: {test.notes}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: RULE REGISTRY (PRD Section 4) */}
      {activeSubTab === 'REGISTRY' && (
        <div className="rounded-lg bg-white border-2 border-slate-300 p-4 shadow-sm space-y-3">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-950 flex items-center gap-2 pb-2 border-b-2 border-slate-200">
            <BookOpen className="w-4 h-4 text-amber-600" />
            Methodology Rules Registry (Status & Provenance)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-950 border-b-2 border-slate-300 font-black uppercase">
                  <th className="p-3">Rule ID</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Source Module</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Authority</th>
                  <th className="p-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-200">
                {CANONICAL_RULES.map(rule => (
                  <tr key={rule.ruleId} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-black text-blue-950">{rule.ruleId}</td>
                    <td className="p-3 font-black text-slate-950">{rule.name}</td>
                    <td className="p-3 text-slate-800 font-bold">{rule.sourceModule} ({rule.sourceSection})</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-md text-xs font-black ${
                          rule.status.includes('PETER')
                            ? 'bg-emerald-100 text-emerald-950 border border-emerald-400'
                            : rule.isExperimental
                            ? 'bg-amber-100 text-amber-950 border border-amber-400'
                            : 'bg-slate-100 border border-slate-300 text-slate-950'
                        }`}
                      >
                        {rule.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-950 font-black">{rule.approvedBy}</td>
                    <td className="p-3 text-slate-700 font-medium text-xs">{rule.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: CONFLICT REGISTRY (PRD Section 44) */}
      {activeSubTab === 'CONFLICTS' && (
        <div className="rounded-lg bg-white border-2 border-slate-300 p-4 shadow-sm space-y-3">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-950 flex items-center gap-2 pb-2 border-b-2 border-slate-200">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Historical Conflict & Discrepancy Registry (PRD Section 44)
          </h3>
          <div className="space-y-3">
            {CONFLICT_REGISTRY.map(c => (
              <div
                key={c.conflictId}
                className="p-4 rounded-lg bg-slate-50 border-2 border-slate-200 text-xs space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-amber-900 px-2 py-0.5 rounded bg-amber-100 border border-amber-300">{c.conflictId}</span>
                    <span className="font-black text-sm text-slate-950">{c.title}</span>
                  </div>
                  <span className="text-xs px-2.5 py-0.5 rounded-md bg-emerald-100 border border-emerald-400 text-emerald-950 font-black">
                    {c.peterResolutionStatus}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-3 rounded-md bg-white border-2 border-slate-200">
                    <span className="text-slate-700 block text-xs uppercase font-black">Historical Practice:</span>
                    <span className="text-slate-900 mt-1 block leading-relaxed font-medium">{c.historicalPractice}</span>
                  </div>
                  <div className="p-3 rounded-md bg-white border-2 border-slate-200">
                    <span className="text-emerald-950 block text-xs uppercase font-black">Current Canonical Rule:</span>
                    <span className="text-slate-950 mt-1 block leading-relaxed font-bold">{c.currentCanonicalRule}</span>
                  </div>
                </div>
                <div className="text-xs text-slate-800 pt-2 border-t-2 border-slate-200">
                  <span className="text-slate-600 font-bold">Reason: </span>
                  <span className="text-amber-950 font-black">{c.reason}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW 4: PENDING ITEMS (PRD Section 45) */}
      {activeSubTab === 'PENDING' && (
        <div className="rounded-lg bg-white border-2 border-slate-300 p-4 shadow-sm space-y-3">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-950 flex items-center gap-2 pb-2 border-b-2 border-slate-200">
            <Clock className="w-4 h-4 text-blue-700" />
            Pending Peter Certification Inquiries (P1 to P5)
          </h3>
          <div className="space-y-3">
            {PENDING_PETER_ITEMS.map(item => (
              <div
                key={item.id}
                className="p-4 rounded-lg bg-slate-50 border-2 border-slate-200 text-xs space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-blue-950 px-2 py-0.5 rounded bg-blue-100 border border-blue-300">{item.id}</span>
                    <span className="font-black text-sm text-slate-950">{item.title}</span>
                  </div>
                  <span className="text-xs px-2.5 py-0.5 rounded-md bg-amber-100 border border-amber-400 text-amber-950 font-black uppercase">
                    Pending Review
                  </span>
                </div>
                <div className="text-xs text-slate-800 space-y-1 font-medium">
                  <div>
                    <span className="text-slate-600 font-bold">Known Scope: </span>
                    <span className="text-slate-900 font-semibold">{item.knownScope}</span>
                  </div>
                  <div>
                    <span className="text-slate-600 font-bold">Pending Clarification: </span>
                    <span className="text-amber-950 font-bold">{item.pendingClarification}</span>
                  </div>
                </div>
                <div className="text-xs text-slate-800 pt-2 border-t-2 border-slate-200">
                  <span className="text-slate-600 font-bold">Current Software Implementation: </span>
                  <span className="text-slate-950 font-black">{item.currentImplementationStatus}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

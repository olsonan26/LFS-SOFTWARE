/**
 * @license
 * Lettrology Forensic Science - Interactive Tutorial Component
 * Guides new users through core functionalities, methodology, and deterministic time-maps.
 */

import React, { useState } from 'react';
import {
  Compass,
  ChevronRight,
  ChevronLeft,
  X,
  Minimize2,
  Maximize2,
  CheckCircle2,
  Layers,
  FolderKanban,
  Users,
  Crosshair,
  CalendarDays,
  LineChart,
  FileCheck2,
  ShieldCheck,
  EyeOff,
  Sparkles,
  Calculator,
  ArrowRight,
  ExternalLink,
  BookOpen,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';
import { NavTab } from './Header.tsx';
import { calculatePrimaryProfile, PrimaryFixedProfile } from '../core/lettrology-engine/identityCalculations.ts';
import { calculateCalendarYear, calculatePersonalYear } from '../core/lettrology-engine/annualEngine.ts';
import { formatCompound } from '../core/lettrology-engine/compoundTrail.ts';

interface InteractiveTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: NavTab;
  onNavigateTab: (tab: NavTab) => void;
  onSelectPersonForChart?: (personId: string) => void;
}

interface TutorialStep {
  id: string;
  title: string;
  category: string;
  icon: React.ElementType;
  targetTab?: NavTab;
  tabLabel?: string;
  headline: string;
  description: string;
  bulletPoints: { title: string; desc: string }[];
  actionLabel?: string;
  proTip: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome & Core Science',
    category: 'ORIENTATION',
    icon: ShieldCheck,
    headline: 'Deterministic Criminology & Time-Map Research',
    description:
      'Lettrology Forensic Science is a specialized investigative platform that evaluates human cycles, vibrational time-maps, and incident chronologies using strict deterministic arithmetic. Calculations follow recorded Lettrology formulas; interpretations remain separate from evidence.',
    bulletPoints: [
      {
        title: 'Deterministic Arithmetic',
        desc: 'Calculations follow unambiguous mathematical rules with complete preservation of compound numbers (e.g., 32/5, 43/7, 75/12/3).',
      },
      {
        title: 'Power Numbers (11, 13, 16)',
        desc: 'Recognizes pivotal vibrational intensifiers and master numbers (22, 33) without premature reduction.',
      },
      {
        title: 'Evidentiary Separation',
        desc: 'Physical evidence, alibis, and Lettrology correlation density are strictly audited on three independent, unblended scales.',
      },
    ],
    proTip: 'You can minimize this tutorial anytime using the dock button in the top right to freely test the interface while following along.',
  },
  {
    id: 'cases',
    title: 'Case Dossiers & Management',
    category: 'INVESTIGATION',
    icon: FolderKanban,
    targetTab: 'CASES',
    tabLabel: 'Cases Tab',
    headline: 'Managing Criminal Inquiries & Reference Benchmarks',
    description:
      'Every investigation centers around a Case Dossier. Cases record lead investigators, certified incident dates, scene coordinates, linked subjects, and strict privacy classification levels.',
    bulletPoints: [
      {
        title: 'Active Inquiries vs Benchmarks',
        desc: 'Explore active homicide/disappearance cases like "State v. Blackwood" alongside gold-standard reference benchmarks like "The Elon Musk 2025 Benchmark".',
      },
      {
        title: 'Privacy Classifications',
        desc: 'Cases support Private, Assigned Team, De-Identified Research, and Published Public audit modes.',
      },
      {
        title: 'Quick Case Switcher',
        desc: 'Use the dropdown in the top header bar anytime to switch between active cases in a single click.',
      },
    ],
    actionLabel: 'Open Case Dossiers View',
    proTip: 'Click the "+ Add" button in the top navigation bar anytime to initialize a new case file or register a new subject.',
  },
  {
    id: 'people',
    title: 'Subject Identity Repository',
    category: 'IDENTITY',
    icon: Users,
    targetTab: 'PEOPLE',
    tabLabel: 'People Tab',
    headline: 'Certified Birth Records & Six Primary Fixed Numbers',
    description:
      'Accurate Lettrology analysis requires verified full birth legal names (First, Middle, Surname) directly transcribed from vital statistics certificates or legal records. Social nicknames and called names are recorded separately.',
    bulletPoints: [
      {
        title: 'Six Primary Fixed Numbers',
        desc: 'Computes First Name, Full Expression Name, Vowels (Soul Urge), Birth Day, Total Birth Date (Life Path), and Ultimate Goal (Maturity).',
      },
      {
        title: 'Vital Record Provenance',
        desc: 'Every birth date and name includes documentation provenance tags (Certified Birth Certificate, Driver Record, Driver License, etc.).',
      },
      {
        title: 'Direct Chart Integration',
        desc: 'Click "Open chart" on a person’s profile to immediately plot their lifetime vibrational spans.',
      },
    ],
    actionLabel: 'Explore Subject Profiles',
    proTip: 'Look at Julian Blackwood and Elena Vance in the People tab to see how primary fixed vibrations define individual behavioral baselines.',
  },
  {
    id: 'chart',
    title: 'Interactive Time-Map Chart',
    category: 'VIBRATIONAL MAP',
    icon: LineChart,
    targetTab: 'CHART',
    tabLabel: 'Chart Tab',
    headline: 'The Mathematical Heart of Lettrology',
    description:
      'The Time-Map Chart visualizes how letter durations govern personal ages across a subject\'s lifetime. It features 4 dedicated exploration views: Annual Grid, Monthly Breakdown, Daily Precision, and Multi-Person Stack.',
    bulletPoints: [
      {
        title: 'Birthday-Lapse Diagonal',
        desc: 'Reveals the transitional diagonal overlap where letters change at birthdays, capturing dual-influence periods.',
      },
      {
        title: 'Essence (ESS) & Personal Year (PY)',
        desc: 'ESS sums active letter ordinals (A=1..Z=26). PY combines birth date with the calendar year. Together, they combine into the Yearly Combiner (COM = ESS + PY).',
      },
      {
        title: 'Power Numbers Badges',
        desc: 'Power Numbers (11, 13, 16) and Master Numbers (22, 33) are highlighted with gold and crimson indicator badges.',
      },
    ],
    actionLabel: 'View Time-Map Chart',
    proTip: 'Switch to "Stack View" in the Chart workspace to place suspect and victim annual vibrations side-by-side during incident years.',
  },
  {
    id: 'analysis',
    title: 'Forensic Incident Focus',
    category: 'CRIME ANALYSIS',
    icon: Crosshair,
    targetTab: 'ANALYSIS',
    tabLabel: 'Forensic Focus Tab',
    headline: 'Mathematical Audit Trails for Specific Incidents',
    description:
      'Forensic Focus pinpoints specific crime timestamps down to the exact day and hour. It dissects the arithmetic interaction between the subject\'s Personal Month, Monthly Essence (PME), and Day of Birth vibration.',
    bulletPoints: [
      {
        title: 'Complete Arithmetic Audit',
        desc: 'Every reduction displays its raw formula, digit addition step, and compound trail so investigators can verify the math manually.',
      },
      {
        title: 'Canonical vs Experimental Rules',
        desc: 'Rule markings clearly indicate whether a pattern is certified by Peter Vaughan (CANONICAL) or part of exploratory research (EXPERIMENTAL).',
      },
      {
        title: 'Physical Evidence Corroboration',
        desc: 'Cross-examines calculated vibrational alignments against physical evidence items logged for that specific timestamp.',
      },
    ],
    actionLabel: 'Open Forensic Focus',
    proTip: 'Examine the July 14, 2024 Disappearance incident to see how Monthly Combiner 16/7 and Power Number 16 intersect with call tower pings.',
  },
  {
    id: 'chronology',
    title: 'Master Chronology & Evidence',
    category: 'TIMELINE',
    icon: CalendarDays,
    targetTab: 'CHRONOLOGY',
    tabLabel: 'Chronology Tab',
    headline: 'Structured Fact Timeline with Precision Timestamps',
    description:
      'The Chronology organizes all verified events in the case. Each event is classified by incident category, date precision (Exact time to the minute, exact day, approximate season), and corroborating evidence attachments.',
    bulletPoints: [
      {
        title: 'Fact vs Allegation Status',
        desc: 'Events are flagged as Verified Documented, Documented Claim, Witness Statement, or Allegation to maintain courtroom rigor.',
      },
      {
        title: 'Source Reliability Ratings',
        desc: 'Adheres to the standard intelligence grading scale (A: Confirmed, B: Reliable, C: Probable, D: Doubtful, E: Untested).',
      },
      {
        title: 'One-Click Focus Jump',
        desc: 'Click "Analyze in Forensic Focus" next to any chronology item to immediately compute that exact date\'s Lettrology stack.',
      },
    ],
    actionLabel: 'Explore Master Chronology',
    proTip: 'Use the category filter (e.g. Crime / Incident, Legal / Conflict, Financial) to isolate critical sequences in complex investigations.',
  },
  {
    id: 'hypotheses',
    title: 'Hypothesis Sandbox & 3 Meters',
    category: 'INTEGRITY',
    icon: Layers,
    targetTab: 'HYPOTHESES',
    tabLabel: 'Hypotheses Tab',
    headline: 'Strict Unblended Evidentiary Evaluation',
    description:
      'A cardinal rule of forensic science: speculative Lettrology patterns must never artificially inflate or replace physical evidence. The Hypothesis Sandbox models competing case theories using three separate, independent meters.',
    bulletPoints: [
      {
        title: '1. Evidence Completeness Meter',
        desc: 'Measures tangible proof: physical exhibits, CCTV recordings, forensic lab reports, and certified financial transactions.',
      },
      {
        title: '2. Timeline Compatibility Meter',
        desc: 'Evaluates whether the suspect had physical opportunity, alibi consistency, and travel transit plausibility.',
      },
      {
        title: '3. Lettrology Correlation Density',
        desc: 'Quantifies vibrational convergence (Power numbers, combiners, crossover windows) without blending into physical scores.',
      },
    ],
    actionLabel: 'Open Hypothesis Sandbox',
    proTip: 'Review the three competing hypotheses in State v. Blackwood to see how a high Lettrology density score cannot substitute for missing physical proof.',
  },
  {
    id: 'blind',
    title: 'Blind Analysis Protocol',
    category: 'METHODOLOGY',
    icon: EyeOff,
    targetTab: 'BLIND',
    tabLabel: 'Blind Protocol Tab',
    headline: 'Defeating Retrospective Hindsight Bias',
    description:
      'In forensic research, the greatest danger is post-hoc rationalization (fitting numbers after facts are already known). The Blind Protocol enables investigators to conduct prospective forecasts on masked subjects with cryptographic locking.',
    bulletPoints: [
      {
        title: 'De-Identified Masking',
        desc: 'Subject names and known outcome dates are concealed behind pseudonyms (e.g., Subject Alpha, Subject Beta).',
      },
      {
        title: 'Cryptographic SHA-256 Sealing',
        desc: 'Forecast hypotheses and predicted timing windows are timestamped and cryptographically sealed before outcomes occur.',
      },
      {
        title: 'Transparent Unmasking Audit',
        desc: 'Once real-world outcomes transpire or ground-truth evidence is unsealed, predictions are audited for hit/miss accuracy.',
      },
    ],
    actionLabel: 'Inspect Blind Protocol',
    proTip: 'Check the experiment logs in the Blind Analysis tab to see prospective testing in action.',
  },
  {
    id: 'playground',
    title: 'Interactive Engine Sandbox',
    category: 'PRACTICE',
    icon: Calculator,
    headline: 'Test the Deterministic Calculation Engine Live',
    description:
      'Practice with the real calculation engine right here. Enter any legal birth name and date of birth to see how the engine parses letter values, extracts vowels, and reduces compounds into the Six Primary Fixed Numbers and current Personal Year.',
    bulletPoints: [
      {
        title: 'Real-Time Computation',
        desc: 'Powered directly by the core TypeScript Lettrology calculation engine with zero approximations.',
      },
      {
        title: 'Peter Vaughan Canonical Suite',
        desc: 'You can verify your results against certified benchmarks including Elon Musk (2025 ESS 32/5, PY 43/7, COM 75/12/3).',
      },
      {
        title: 'Ready for Real Work',
        desc: 'You are now equipped with full command of the platform\'s forensic and time-mapping capabilities.',
      },
    ],
    proTip: 'Type your own name and date of birth below to see your primary fixed profile and current personal year computed live!',
  },
];

export const InteractiveTutorial: React.FC<InteractiveTutorialProps> = ({
  isOpen,
  onClose,
  activeTab,
  onNavigateTab,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isDocked, setIsDocked] = useState<boolean>(false);

  // Playground State for Step 8
  const [testName, setTestName] = useState<string>('ELON REEVE MUSK');
  const [testDob, setTestDob] = useState<string>('1971-06-28');
  const [testTargetYear, setTestTargetYear] = useState<number>(2025);

  if (!isOpen) return null;

  const currentStep = TUTORIAL_STEPS[currentStepIndex];
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === TUTORIAL_STEPS.length - 1;

  const handleNext = () => {
    if (!isLast) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      const nextStep = TUTORIAL_STEPS[nextIdx];
      if (nextStep.targetTab) {
        onNavigateTab(nextStep.targetTab);
      }
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      const prevStep = TUTORIAL_STEPS[prevIdx];
      if (prevStep.targetTab) {
        onNavigateTab(prevStep.targetTab);
      }
    }
  };

  const handleGoToStep = (index: number) => {
    setCurrentStepIndex(index);
    const step = TUTORIAL_STEPS[index];
    if (step.targetTab) {
      onNavigateTab(step.targetTab);
    }
  };

  // Live calculation for the playground step
  let playgroundProfile: PrimaryFixedProfile | null = null;
  let playgroundPy = null;
  try {
    if (testName.trim() && testDob) {
      playgroundProfile = calculatePrimaryProfile(testName.trim().toUpperCase(), testDob);
      const dobParts = testDob.split('-');
      if (dobParts.length === 3) {
        const bDay = parseInt(dobParts[2], 10);
        const bMonth = parseInt(dobParts[1], 10);
        const cy = calculateCalendarYear(testTargetYear);
        playgroundPy = calculatePersonalYear(bDay, bMonth, cy.root);
      }
    }
  } catch (e) {
    // Graceful fallback for invalid inputs during typing
  }

  // MINIMIZED / DOCKED FLOATING BAR MODE
  if (isDocked) {
    return (
      <aside
        aria-label="Interactive Tutorial Navigation"
        className="fixed bottom-5 right-5 z-50 bg-white border-2 border-amber-600 rounded-lg p-3.5 shadow-2xl max-w-md w-full text-xs text-slate-950 animate-in fade-in slide-in-from-bottom-3"
      >
        <div className="flex items-center justify-between gap-3 mb-2 pb-2 border-b-2 border-slate-200">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-amber-900 font-black block">
                Interactive Tutorial • Step {currentStepIndex + 1} of {TUTORIAL_STEPS.length}
              </span>
              <span className="font-black text-slate-950 truncate block max-w-[220px]">
                {currentStep.title}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsDocked(false)}
              className="p-1.5 text-slate-700 hover:text-black hover:bg-slate-100 rounded-md transition-colors"
              title="Expand Tutorial Guide"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-700 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
              title="Close Tutorial"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-800 font-semibold mb-3 line-clamp-2">
          {currentStep.headline}
        </p>

        <div className="flex items-center justify-between gap-2">
          {currentStep.targetTab && (
            <button
              onClick={() => onNavigateTab(currentStep.targetTab!)}
              className={`px-2.5 py-1 rounded-md text-xs font-bold border-2 flex items-center gap-1 transition-colors ${
                activeTab === currentStep.targetTab
                  ? 'border-emerald-600 bg-emerald-100 text-emerald-950'
                  : 'border-amber-600 bg-amber-50 text-amber-950 hover:bg-amber-100'
              }`}
            >
              {activeTab === currentStep.targetTab ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Currently Viewing {currentStep.tabLabel}
                </>
              ) : (
                <>
                  <ArrowRight className="w-3.5 h-3.5" /> Jump to {currentStep.tabLabel}
                </>
              )}
            </button>
          )}

          <div className="flex items-center gap-1.5 ml-auto">
            <button
              disabled={isFirst}
              onClick={handlePrev}
              className="p-1.5 rounded-md border-2 border-slate-300 bg-slate-100 disabled:opacity-40 hover:border-slate-800 text-slate-900 font-bold"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="px-3 py-1.5 rounded-md bg-amber-500 text-slate-950 font-black hover:bg-amber-600 flex items-center gap-1 text-xs border border-amber-600 shadow-sm"
            >
              {isLast ? 'Complete' : 'Next'} <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    );
  }

  // FULL MODAL INTERACTIVE TUTORIAL VIEW
  const StepIcon = currentStep.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white border-2 border-slate-400 rounded-xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b-2 border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-100 border-2 border-amber-500 flex items-center justify-center text-amber-900 font-black">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-0.5 rounded-md font-black uppercase tracking-wider bg-amber-200 text-amber-950 border border-amber-400">
                  Interactive Guide • Step {currentStepIndex + 1} of {TUTORIAL_STEPS.length}
                </span>
                <span className="text-xs text-slate-700 font-bold uppercase tracking-widest hidden sm:inline">
                  {currentStep.category}
                </span>
              </div>
              <h2 className="text-lg font-black text-slate-950 uppercase tracking-wide mt-0.5">
                {currentStep.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDocked(true)}
              className="px-3 py-1.5 rounded-md text-xs font-bold text-slate-900 border-2 border-slate-300 hover:border-slate-800 hover:bg-slate-100 transition-colors flex items-center gap-1.5 bg-white shadow-sm"
              title="Dock as floating guide to browse app simultaneously"
            >
              <Minimize2 className="w-4 h-4" />
              <span className="hidden sm:inline">Dock Guide</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-slate-600 hover:text-black hover:bg-slate-200 transition-colors"
              title="Close Tutorial"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Navigation Dots */}
        <div className="px-6 py-3 bg-slate-100 border-b-2 border-slate-200 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-2">
            {TUTORIAL_STEPS.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => handleGoToStep(idx)}
                className={`h-2.5 rounded-full transition-all ${
                  idx === currentStepIndex
                    ? 'w-8 bg-amber-600 ring-2 ring-amber-400'
                    : idx < currentStepIndex
                    ? 'w-3 bg-emerald-600 hover:bg-emerald-500'
                    : 'w-2.5 bg-slate-300 hover:bg-slate-400'
                }`}
                title={`${idx + 1}. ${s.title}`}
              />
            ))}
          </div>
          <span className="text-xs text-slate-800 font-black uppercase tracking-wider font-mono">
            {Math.round(((currentStepIndex + 1) / TUTORIAL_STEPS.length) * 100)}% Completed
          </span>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-950">
          {/* Step Hero Banner */}
          <div className="p-4 rounded-lg bg-slate-50 border-2 border-slate-300 flex items-start gap-4">
            <div className="p-3 rounded-lg bg-amber-100 border-2 border-amber-500 text-amber-950 font-black shrink-0">
              <StepIcon className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider flex items-center gap-2">
                {currentStep.headline}
              </h3>
              <p className="text-xs text-slate-800 font-semibold leading-relaxed">
                {currentStep.description}
              </p>
            </div>
          </div>

          {/* Key Bullet Points */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-700" /> Core Operational Takeaways
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {currentStep.bulletPoints.map((bp, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-lg bg-white border-2 border-slate-300 space-y-1.5 hover:border-slate-800 transition-colors shadow-sm"
                >
                  <div className="text-xs font-black text-slate-950 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-600 shrink-0" />
                    {bp.title}
                  </div>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed">
                    {bp.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Live Playground in Step 8 */}
          {currentStep.id === 'playground' && (
            <div className="p-4 rounded-lg bg-slate-50 border-2 border-amber-400 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b-2 border-slate-200 pb-2">
                <div className="flex items-center gap-2 text-xs font-black uppercase text-amber-950">
                  <Calculator className="w-4 h-4 text-amber-700" /> Live Engine Interactive Sandbox
                </div>
                <button
                  onClick={() => {
                    setTestName('ELON REEVE MUSK');
                    setTestDob('1971-06-28');
                    setTestTargetYear(2025);
                  }}
                  className="text-xs text-blue-900 hover:text-blue-950 font-bold flex items-center gap-1 underline"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Load Elon Musk Benchmark
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-xs text-slate-700 font-bold block uppercase mb-1">
                    Full Legal Birth Name
                  </label>
                  <input
                    type="text"
                    value={testName}
                    onChange={e => setTestName(e.target.value)}
                    className="w-full bg-white border-2 border-slate-300 rounded-md px-3 py-2 text-slate-950 font-mono font-bold text-xs focus:outline-none focus:border-slate-800"
                    placeholder="e.g. JOHN ROBERT DOE"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-700 font-bold block uppercase mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={testDob}
                    onChange={e => setTestDob(e.target.value)}
                    className="w-full bg-white border-2 border-slate-300 rounded-md px-3 py-2 text-slate-950 font-mono font-bold text-xs focus:outline-none focus:border-slate-800"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-700 font-bold block uppercase mb-1">
                    Target Calculation Year
                  </label>
                  <input
                    type="number"
                    value={testTargetYear}
                    onChange={e => setTestTargetYear(parseInt(e.target.value, 10) || 2025)}
                    className="w-full bg-white border-2 border-slate-300 rounded-md px-3 py-2 text-slate-950 font-mono font-bold text-xs focus:outline-none focus:border-slate-800"
                  />
                </div>
              </div>

              {playgroundProfile && (
                <div className="space-y-2 pt-1">
                  <span className="text-xs uppercase text-slate-900 font-black block">
                    Calculated primary numbers:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-center">
                    <div className="p-2.5 rounded-lg bg-white border-2 border-slate-300 shadow-sm">
                      <span className="text-[10px] text-slate-700 block uppercase font-bold">1. First Name</span>
                      <span className="text-sm font-black text-amber-900">
                        {formatCompound(playgroundProfile.firstName)}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border-2 border-slate-300 shadow-sm">
                      <span className="text-[10px] text-slate-700 block uppercase font-bold">2. Expression</span>
                      <span className="text-sm font-black text-amber-900">
                        {formatCompound(playgroundProfile.fullName)}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border-2 border-slate-300 shadow-sm">
                      <span className="text-[10px] text-slate-700 block uppercase font-bold">3. Soul Urge</span>
                      <span className="text-sm font-black text-amber-900">
                        {formatCompound(playgroundProfile.vowels)}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border-2 border-slate-300 shadow-sm">
                      <span className="text-[10px] text-slate-700 block uppercase font-bold">4. Birth Day</span>
                      <span className="text-sm font-black text-amber-900">
                        {formatCompound(playgroundProfile.dayOfBirth)}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border-2 border-slate-300 shadow-sm">
                      <span className="text-[10px] text-slate-700 block uppercase font-bold">5. Life Path</span>
                      <span className="text-sm font-black text-amber-900">
                        {formatCompound(playgroundProfile.totalBirthDate)}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border-2 border-slate-300 shadow-sm">
                      <span className="text-[10px] text-slate-700 block uppercase font-bold">6. Ultimate Goal</span>
                      <span className="text-sm font-black text-amber-900">
                        {formatCompound(playgroundProfile.ultimateGoal)}
                      </span>
                    </div>
                  </div>

                  {playgroundPy && (
                    <div className="p-3 rounded-lg bg-white border-2 border-slate-300 flex items-center justify-between text-xs mt-2 shadow-sm font-bold">
                      <span className="text-slate-800">
                        Personal Year (PY) for Calendar Year <strong className="text-black font-black">{testTargetYear}</strong>:
                      </span>
                      <span className="font-black text-amber-950 font-mono px-2.5 py-1 rounded-md bg-amber-100 border border-amber-400">
                        PY {formatCompound(playgroundPy)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Interactive "Try In App" Button if this step targets a view */}
          {currentStep.targetTab && (
            <div className="p-3.5 rounded-lg bg-slate-50 border-2 border-slate-300 flex flex-wrap items-center justify-between gap-3 shadow-sm">
              <div className="text-xs text-slate-800 font-semibold">
                <span>Want to see this view live? Switch directly to the </span>
                <strong className="text-black font-black">{currentStep.tabLabel}</strong>.
              </div>
              <button
                onClick={() => {
                  onNavigateTab(currentStep.targetTab!);
                  setIsDocked(true);
                }}
                className="px-3 py-1.5 rounded-md text-xs font-black bg-amber-100 border-2 border-amber-500 text-amber-950 hover:bg-amber-200 transition-colors flex items-center gap-1.5 uppercase tracking-wider shadow-sm"
              >
                <ExternalLink className="w-4 h-4" /> Open {currentStep.tabLabel} & Dock Guide
              </button>
            </div>
          )}

          {/* Pro-Tip Box */}
          <div className="p-3.5 rounded-lg bg-amber-50 border-2 border-amber-300 text-xs text-amber-950 flex items-start gap-3">
            <BookOpen className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-950 uppercase tracking-wider text-xs block font-black mb-0.5">
                Forensic Practitioner Pro-Tip:
              </strong>
              <span className="font-medium text-slate-800">{currentStep.proTip}</span>
            </div>
          </div>
        </div>

        {/* Footer Navigation Controls */}
        <div className="px-6 py-4 border-t-2 border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            disabled={isFirst}
            onClick={handlePrev}
            className="px-4 py-2 rounded-md text-xs border-2 border-slate-300 bg-white font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:border-slate-800 text-slate-900 transition-colors flex items-center gap-1 shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDocked(true)}
              className="text-xs text-slate-700 font-bold hover:text-black px-3 py-1.5 transition-colors hidden sm:block"
            >
              Dock & Follow Along
            </button>
            <button
              onClick={handleNext}
              className="px-5 py-2 rounded-md text-xs bg-amber-500 text-slate-950 font-black uppercase tracking-wider hover:bg-amber-600 transition-colors flex items-center gap-1.5 shadow-md border border-amber-600"
            >
              {isLast ? (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Complete Tour
                </>
              ) : (
                <>
                  Next Step <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

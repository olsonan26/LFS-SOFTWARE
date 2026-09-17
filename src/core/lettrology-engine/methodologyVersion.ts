/**
 * @license
 * Lettrology Forensic Science - Deterministic Calculation Engine
 * Section 4: Source-of-Truth Hierarchy
 * Section 44: Methodology Conflict Registry
 * Section 45: Open / Pending Peter Items
 */

export const CURRENT_ENGINE_VERSION = 'v1.0.4-canonical';
export const CANONICAL_METHODOLOGY_DATE = '2026-09-01';

export type RuleStatus =
  | 'CANONICAL_PETER_VERIFIED'
  | 'CANONICAL_COURSE_SOURCE'
  | 'APPROVED_IMPLEMENTATION_RULE'
  | 'EXPERIMENTAL_RESEARCH'
  | 'DEPRECATED_LEGACY'
  | 'PENDING_REVIEW';

export interface MethodologyRule {
  ruleId: string;
  name: string;
  status: RuleStatus;
  sourceModule: string;
  sourceSection: string;
  effectiveVersion: string;
  approvedBy: string;
  approvalDate: string;
  notes: string;
  isExperimental: boolean;
}

export interface ConflictRecord {
  conflictId: string;
  title: string;
  historicalPractice: string;
  currentCanonicalRule: string;
  reason: string;
  peterResolutionStatus: 'RESOLVED_CANONICAL' | 'PENDING_PETER';
  effectiveVersion: string;
}

export interface PendingPeterItem {
  id: 'P1' | 'P2' | 'P3' | 'P4' | 'P5';
  title: string;
  knownScope: string;
  pendingClarification: string;
  currentImplementationStatus: string;
}

export const CANONICAL_RULES: MethodologyRule[] = [
  {
    ruleId: 'RULE-LET-001',
    name: 'Letter Duration Base (1-9 Cycle)',
    status: 'CANONICAL_PETER_VERIFIED',
    sourceModule: 'Milestone Two – Module 2',
    sourceSection: 'Adding Names to the Chart',
    effectiveVersion: 'v1.0.0',
    approvedBy: 'Peter Vaughan',
    approvalDate: '2024-03-15',
    notes: 'Letters A..Z assigned repeating 1-9 base values for annual time-map durations.',
    isExperimental: false,
  },
  {
    ruleId: 'RULE-LET-002',
    name: 'Advanced Compound Essence (A=1..Z=26)',
    status: 'CANONICAL_PETER_VERIFIED',
    sourceModule: 'Milestone Two – Module 3',
    sourceSection: 'Advanced Essence Construction',
    effectiveVersion: 'v1.0.0',
    approvedBy: 'Peter Vaughan',
    approvalDate: '2024-03-15',
    notes: 'Upper compound ESS sums full alphabet positions to preserve authentic compounds (e.g. 32/5).',
    isExperimental: false,
  },
  {
    ruleId: 'RULE-LET-003',
    name: 'Personal Year (Day + Month + Reduced CY)',
    status: 'CANONICAL_PETER_VERIFIED',
    sourceModule: 'Milestone Two – Module 3',
    sourceSection: 'Personal Year Formulation',
    effectiveVersion: 'v1.0.0',
    approvedBy: 'Peter Vaughan',
    approvalDate: '2024-03-15',
    notes: 'Birth Day + Birth Month + reduced CY. Preserves compound without reducing Day/Month prematurely.',
    isExperimental: false,
  },
  {
    ruleId: 'RULE-LET-004',
    name: 'Yearly Combiner (Actual Raw ESS + Actual Raw PY)',
    status: 'CANONICAL_PETER_VERIFIED',
    sourceModule: 'Milestone Two – Module 3',
    sourceSection: 'Combiner Integration',
    effectiveVersion: 'v1.0.0',
    approvedBy: 'Peter Vaughan',
    approvalDate: '2024-03-15',
    notes: 'Operands must be the actual raw compound integers, not reconstructed roots.',
    isExperimental: false,
  },
  {
    ruleId: 'RULE-LET-005',
    name: 'Calendar Month Reduced (Oct=1, Nov=2, Dec=3)',
    status: 'CANONICAL_PETER_VERIFIED',
    sourceModule: 'Milestone Two – Module 4',
    sourceSection: 'Monthly Calendar Calculation',
    effectiveVersion: 'v1.0.0',
    approvedBy: 'Peter Vaughan',
    approvalDate: '2024-03-15',
    notes: 'Standard 1..9 cycle where October reduces to 1, November to 2, December to 3.',
    isExperimental: false,
  },
  {
    ruleId: 'RULE-LET-006',
    name: 'PME 11 Compound Carry in MCOM',
    status: 'CANONICAL_PETER_VERIFIED',
    sourceModule: 'Milestone Two – Module 4',
    sourceSection: 'Compound Carry Behavior (Carol Royal Reference)',
    effectiveVersion: 'v1.0.0',
    approvedBy: 'Peter Vaughan',
    approvalDate: '2024-03-15',
    notes: 'If PME is authentically 11, the 11 operand carries directly into MCOM.',
    isExperimental: false,
  },
  {
    ruleId: 'RULE-EXP-001',
    name: 'Forensic Deep Combinations (Month+ESS, ESS+MCOM, PME+MCOM)',
    status: 'EXPERIMENTAL_RESEARCH',
    sourceModule: 'Forensic Research Laboratory',
    sourceSection: 'Hypothetical Cross-Layers',
    effectiveVersion: 'v1.0.4',
    approvedBy: 'Alex Olson (Research Trial)',
    approvalDate: '2026-08-10',
    notes: 'Experimental research correlations only; must display EXPERIMENTAL badge.',
    isExperimental: true,
  },
  {
    ruleId: 'RULE-LEG-001',
    name: 'Daily Triad (Environment / Feel / DCOM)',
    status: 'APPROVED_IMPLEMENTATION_RULE',
    sourceModule: 'Legacy Death Code Engine',
    sourceSection: 'Day Calendar Implementation',
    effectiveVersion: 'v1.0.2',
    approvedBy: 'Pending Final Peter Certification',
    approvalDate: '2026-07-20',
    notes: 'Operational in legacy tool; requires formal Peter certification before canonical elevation.',
    isExperimental: false,
  },
];

export const CONFLICT_REGISTRY: ConflictRecord[] = [
  {
    conflictId: 'CONF-001',
    title: 'Reduced 1-9 ESS vs. Full Ordinal 1-26 ESS',
    historicalPractice:
      'Early training materials contained examples calculating compound ESS from reduced 1-9 letter values.',
    currentCanonicalRule:
      'Advanced manual charts and current authoritative engine sum full ordinal positions (A=1..Z=26) for compound ESS.',
    reason:
      'Preserves the rich compound spectrum (e.g. 32/5, 28/10/1) while lower ESS retains root.',
    peterResolutionStatus: 'RESOLVED_CANONICAL',
    effectiveVersion: 'v1.0.0',
  },
  {
    conflictId: 'CONF-002',
    title: 'PY Formula: Raw Day/Month vs. Pre-reduced Day/Month',
    historicalPractice:
      'Introductory exercises occasionally reduced Day and Month to single digits before adding to CY.',
    currentCanonicalRule:
      'Advanced canonical calculation sums raw Birth Day + raw Birth Month + reduced CY.',
    reason:
      'Prevents loss of authentic compound markers (e.g. 28 + 6 + 9 = 43/7).',
    peterResolutionStatus: 'RESOLVED_CANONICAL',
    effectiveVersion: 'v1.0.0',
  },
];

export const PENDING_PETER_ITEMS: PendingPeterItem[] = [
  {
    id: 'P1',
    title: 'Birthday-Lapse Active Duration',
    knownScope:
      'After the birthday passes, the subject links to next-age ESS while current PY remains active.',
    pendingClarification:
      'Exact duration of the active transitional window (birthday through Dec 31, or specific months).',
    currentImplementationStatus:
      'Calculated and displayed structurally as an active transitional diagonal from the birth date.',
  },
  {
    id: 'P2',
    title: 'Exact Month-Crossover Date Window',
    knownScope:
      'Current PM connects with next month PME during the "last few days" of the month.',
    pendingClarification:
      'Universal cutoff date (e.g. 27th through 1st, or variable based on month length).',
    currentImplementationStatus:
      'Visualized on monthly transition boundary; exact-day window flagged as Pending Peter.',
  },
  {
    id: 'P3',
    title: 'Extra Deep Combinations Classification',
    knownScope:
      'Month + ESS, ESS + MCOM, PME + MCOM evaluated in forensic case research.',
    pendingClarification:
      'Formal methodology rating and canonical vs. experimental designation.',
    currentImplementationStatus:
      'Active only in Forensic Focus mode; prominently badged EXPERIMENTAL.',
  },
  {
    id: 'P4',
    title: 'Complete Compound Carry Table',
    knownScope:
      'PME 11 verified to carry forward into MCOM (Carol Royal case reference).',
    pendingClarification:
      'Whether 13, 16, 22, 33 or other compounds also carry forward unconditionally.',
    currentImplementationStatus:
      'Configured with versioned carry table preserving 11, 22, 33; 13/16 marked pending review.',
  },
  {
    id: 'P5',
    title: 'Daily Model Formal Certification',
    knownScope:
      'Environment = reduced day + PM, Feel = Environment + PME, DCOM = Feel + Environment.',
    pendingClarification:
      'Formal Peter certification as canonical methodology standard.',
    currentImplementationStatus:
      'Labeled "APPROVED LEGACY IMPLEMENTATION – REQUIRES FINAL PETER CERTIFICATION".',
  },
];

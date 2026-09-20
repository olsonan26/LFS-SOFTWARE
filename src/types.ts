/**
 * @license
 * Lettrology Forensic Science - Core Application Entities & Type Definitions
 * PRD Sections 5, 7, 9, 27, 28, 30, 31, 38
 */

export type UserRole =
  | 'Alex – System Owner / Research Director'
  | 'Peter – Methodology Authority'
  | 'Lead Investigator / Advanced Practitioner'
  | 'Researcher'
  | 'Student'
  | 'Viewer / Reviewer';

export interface UserProfile {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  trainingLevel?: 'BASIC' | 'ADVANCED' | 'CERTIFIED_PRACTITIONER';
}

export type CaseStatus = 'ACTIVE' | 'UNDER_REVIEW' | 'ARCHIVED' | 'COLD_CASE' | 'SOLVED';
export type PrivacyLevel = 'PRIVATE' | 'ASSIGNED_TEAM' | 'RESEARCH_DEIDENTIFIED' | 'PUBLISHED';

export interface CaseRecord {
  caseId: string;
  caseNumber: string;
  externalCaseNumber?: string;
  title: string;
  status: CaseStatus;
  primaryIncidentDate: string; // ISO or precision string
  primaryLocation: string;
  leadInvestigator: string;
  privacyLevel: PrivacyLevel;
  calculationEngineVersion: string;
  lastUpdated: string;
  synopsis: string;
  peopleIds: string[];
  primaryIncidentId?: string;
}

export type VerificationState = 'VERIFIED_DOCUMENTED' | 'DOCUMENTED_CLAIM' | 'WITNESS_STATEMENT' | 'ALLEGATION' | 'UNVERIFIED';

export interface IdentityRecord {
  identityId: string;
  personId: string;
  exactNameString: string;
  identityType: 'BIRTH_LEGAL' | 'CALLED_NAME' | 'MARRIED_NAME' | 'ALIAS' | 'ADOPTIVE_NAME';
  sociallyUsedName: string;
  legalStatus: string;
  fromDate?: string;
  toDate?: string;
  verificationStatus: VerificationState;
  notes?: string;
}

export type DossierPerspectiveId =
  | 'initialImpressions'
  | 'personality'
  | 'heartDesire'
  | 'habits'
  | 'naturalSkills'
  | 'ultimateGoal';

export interface DossierTraitSelection {
  elevated: string[];
  shadow: string[];
  updatedAt: string;
  updatedBy?: string;
}

export type DossierTraitSelections = Partial<
  Record<DossierPerspectiveId, DossierTraitSelection>
>;

export interface PersonRecord {
  personId: string;
  displayName: string;
  verifiedBirthName: string;
  dob: string; // YYYY-MM-DD or DD-MM-YYYY
  datePrecision: 'EXACT' | 'APPROXIMATE_YEAR' | 'APPROXIMATE_SEASON' | 'UNKNOWN';
  identityVerificationState: VerificationState;
  sourceForDob: string;
  sourceForName: string;
  roleInCase: 'PRIMARY_SUBJECT' | 'SUSPECT' | 'VICTIM' | 'WITNESS' | 'PERSON_OF_INTEREST' | 'ASSOCIATE' | 'REFERENCE';
  calledName?: {
    given: string;
    surname: string;
  };
  deathDate?: string;
  photoUrl?: string;
  occupation?: string;
  birthLocation?: string;
  notes?: string;
  dossierTraitSelections?: DossierTraitSelections;
  identities: IdentityRecord[];
}

export type EventCategory =
  | 'Relationship'
  | 'Family'
  | 'Career'
  | 'Financial'
  | 'Health'
  | 'Accident / Disruption'
  | 'Home / Location'
  | 'Education'
  | 'Identity / Personal Development'
  | 'Legal / Conflict'
  | 'Loss / Ending'
  | 'Opportunity / Success'
  | 'Crime / Incident';

export interface EventRecord {
  eventId: string;
  caseId: string;
  title: string;
  category: EventCategory;
  subcategory?: string;
  description: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string;
  datePrecision: 'EXACT_DAY' | 'EXACT_TIME' | 'MONTH_YEAR' | 'APPROXIMATE_SEASON' | 'UNKNOWN';
  time?: string;
  location?: string;
  severity?: number; // 1-10
  valence: 'POSITIVE' | 'NEGATIVE' | 'MIXED' | 'NEUTRAL';
  expectedness: 'ANTICIPATED' | 'PARTIAL' | 'UNEXPECTED' | 'UNKNOWN';
  peopleInvolved: string[]; // Person IDs
  evidenceIds: string[];
  factStatus: VerificationState;
  sourceReliability: 'A_CONFIRMED' | 'B_RELIABLE' | 'C_PROBABLE' | 'D_DOUBTFUL' | 'E_UNTESTED';
}

export type EvidenceType =
  | 'COURT_RECORD'
  | 'POLICE_REPORT'
  | 'AUTOPSY_REPORT'
  | 'MEDICAL_RECORD'
  | 'WITNESS_STATEMENT'
  | 'INTERVIEW_TRANSCRIPT'
  | 'PHONE_RECORDS'
  | 'FINANCIAL_DOC'
  | 'PHOTOGRAPH'
  | 'VIDEO_SURVEILLANCE'
  | 'AUDIO_RECORDING'
  | 'GOVERNMENT_RECORD'
  | 'NEWS_ARTICLE'
  | 'FORENSIC_LAB_REPORT';

export interface FactItem {
  factId: string;
  evidenceId: string;
  exactStatement: string;
  citation: string; // e.g. "Page 4, Line 12"
  factStatus: VerificationState;
  humanReviewed: boolean;
  dateExtracted: string;
}

export interface EvidenceRecord {
  evidenceId: string;
  caseId: string;
  title: string;
  evidenceType: EvidenceType;
  sourcePublisher: string;
  publicationDate: string;
  fileReference?: string;
  reliabilityRating: 'A' | 'B' | 'C' | 'D' | 'E';
  verificationStatus: VerificationState;
  relatedPeople: string[];
  relatedEvents: string[];
  extractedFacts: FactItem[];
  analystNotes?: string;
}

export interface DocumentRecord {
  documentId: string;
  caseId: string;
  title: string;
  documentType: string;
  pageCount: number;
  uploadDate: string;
  author: string;
  fileUrl?: string;
  extractedEntities: { entity: string; type: string; page: number }[];
}

export interface MediaRecord {
  mediaId: string;
  caseId: string;
  title: string;
  mediaType: 'PHOTO' | 'VIDEO' | 'AUDIO';
  capturedDate: string;
  timecodeNotes?: string;
  taggedPeople: string[];
  fileUrl: string;
}

export interface HypothesisRecord {
  hypothesisId: string;
  caseId: string;
  title: string;
  description: string;
  status: 'ACTIVE' | 'SUPPORTED' | 'REFUTED' | 'UNDER_REVIEW';
  author: string;
  supportingEvidenceIds: string[];
  contradictingEvidenceIds: string[];
  unresolvedQuestions: string[];
  // Strictly 3 separate evaluation meters per PRD Section 30.1:
  evidenceCompletenessScore: number; // 0..100%
  timelineCompatibilityScore: number; // 0..100%
  lettrologyCorrelationDensityScore: number; // 0..100%
  notes?: string;
}

export interface BlindExperiment {
  experimentId: string;
  caseId: string;
  title: string;
  analystName: string;
  hiddenFields: ('identity' | 'photographs' | 'caseType' | 'knownEvents' | 'outcomes')[];
  predictionHash: string;
  submittedAt: string;
  isRevealed: boolean;
  revealedAt?: string;
  predictions: {
    expectedTransitionYears: number[];
    expectedDifficultyPeriods: string;
    expectedOpportunityPeriods: string;
    analystConfidence: 'HIGH' | 'MEDIUM' | 'EXPLORATORY';
    notes: string;
  };
  outcomeComparison?: {
    hits: string[];
    misses: string[];
    summary: string;
  };
}

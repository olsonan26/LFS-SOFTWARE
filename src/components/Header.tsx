/**
 * @license
 * Lettrology Forensic Science - Global Header & Navigation
 * PRD Section 3, 5, 6
 */

import React from 'react';
import {
  FolderKanban,
  Users,
  Crosshair,
  CalendarDays,
  LineChart,
  FileCheck2,
  FileText,
  Image as ImageIcon,
  HelpCircle,
  Database,
  Printer,
  ShieldCheck,
  EyeOff,
  Search,
  Plus,
  AlertTriangle,
  ChevronDown,
  Compass,
} from 'lucide-react';
import { UserProfile, CaseRecord } from '../types.ts';
import { CURRENT_ENGINE_VERSION } from '../core/lettrology-engine/methodologyVersion.ts';

export type NavTab =
  | 'CASES'
  | 'PEOPLE'
  | 'ANALYSIS'
  | 'CHRONOLOGY'
  | 'CHART'
  | 'EVIDENCE'
  | 'DOCUMENTS'
  | 'MEDIA'
  | 'HYPOTHESES'
  | 'RESEARCH'
  | 'REPORTS'
  | 'METHODOLOGY'
  | 'BLIND';

interface HeaderProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  currentUser: UserProfile;
  allUsers: UserProfile[];
  setCurrentUser: (u: UserProfile) => void;
  activeCase: CaseRecord;
  allCases: CaseRecord[];
  setActiveCase: (c: CaseRecord) => void;
  onOpenNewCaseModal: () => void;
  onOpenNewPersonModal: () => void;
  onOpenNewEventModal: () => void;
  onOpenTutorial: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  fontScale?: 'normal' | 'large' | 'xlarge';
  onSetFontScale?: (scale: 'normal' | 'large' | 'xlarge') => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  allUsers,
  setCurrentUser,
  activeCase,
  allCases,
  setActiveCase,
  onOpenNewCaseModal,
  onOpenNewPersonModal,
  onOpenNewEventModal,
  onOpenTutorial,
  searchQuery,
  setSearchQuery,
  fontScale = 'large',
  onSetFontScale,
}) => {
  const [showCaseDropdown, setShowCaseDropdown] = React.useState(false);
  const [showUserDropdown, setShowUserDropdown] = React.useState(false);
  const [showQuickAddDropdown, setShowQuickAddDropdown] = React.useState(false);

  return (
    <header className="border-b-2 border-slate-300 bg-white sticky top-0 z-40 shadow-sm text-slate-950">
      {/* Top Utility & Brand Bar */}
      <div className="max-w-[1700px] mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Wordmark */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-md border-2 border-amber-600 bg-amber-50 flex items-center justify-center text-amber-900 shadow-sm font-black text-base tracking-wider">
            LFS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black tracking-[0.15em] text-slate-950 uppercase">
                LETTROLOGY FORENSIC SCIENCE
              </h1>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded border border-amber-500 bg-amber-100 text-amber-950 tracking-wider uppercase">
                {CURRENT_ENGINE_VERSION}
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium tracking-wide uppercase">
              Deterministic Criminology & Time-Map Research Platform
            </p>
          </div>
        </div>

        {/* Active Case Selector */}
        <div className="relative">
          <button
            onClick={() => setShowCaseDropdown(!showCaseDropdown)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded border-2 border-slate-300 bg-slate-50 hover:bg-white hover:border-slate-800 transition-colors text-left text-xs shadow-sm"
          >
            <FolderKanban className="w-4 h-4 text-amber-700" />
            <div>
              <span className="text-[10px] text-slate-600 block uppercase font-bold tracking-wider">
                Case: {activeCase.caseNumber}
              </span>
              <span className="font-bold text-slate-950 max-w-[260px] truncate block text-xs">
                {activeCase.title}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-700 ml-1" />
          </button>

          {showCaseDropdown && (
            <div className="absolute top-full left-0 mt-1 w-80 rounded-md border-2 border-slate-300 bg-white shadow-2xl py-1 z-50 text-slate-950">
              <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 bg-slate-50">
                Switch Active Case
              </div>
              {allCases.map(c => (
                <button
                  key={c.caseId}
                  onClick={() => {
                    setActiveCase(c);
                    setShowCaseDropdown(false);
                  }}
                  className={`w-full px-3 py-2 text-left hover:bg-amber-50 text-xs flex flex-col gap-0.5 transition-colors border-b border-slate-100 ${
                    c.caseId === activeCase.caseId ? 'bg-amber-100/60 font-bold border-l-4 border-l-amber-600' : ''
                  }`}
                >
                  <span className="font-bold text-slate-950">{c.title}</span>
                  <span className="text-[11px] text-slate-600">
                    {c.caseNumber} • {c.status}
                  </span>
                </button>
              ))}
              <div className="p-2 border-t border-slate-200 bg-slate-50">
                <button
                  onClick={() => {
                    setShowCaseDropdown(false);
                    onOpenNewCaseModal();
                  }}
                  className="w-full text-center py-1.5 text-xs text-slate-950 font-bold border-2 border-slate-800 hover:bg-slate-900 hover:text-white rounded transition-colors uppercase tracking-wider"
                >
                  + Create New Case
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Global Search & Quick Actions */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search case, person, marker..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded text-xs bg-white border-2 border-slate-300 focus:border-slate-900 text-slate-950 placeholder:text-slate-500 w-48 sm:w-56 focus:w-64 transition-all focus:outline-none font-medium shadow-sm"
            />
          </div>

          {/* Senior Text Size Accessibility Selector */}
          {onSetFontScale && (
            <div className="flex items-center border-2 border-slate-300 rounded bg-slate-100 p-0.5 text-xs">
              <button
                onClick={() => onSetFontScale('normal')}
                className={`px-2 py-0.5 rounded font-bold transition-colors ${
                  fontScale === 'normal' ? 'bg-white text-black shadow-sm' : 'text-slate-600 hover:text-black'
                }`}
                title="Normal text size"
              >
                A
              </button>
              <button
                onClick={() => onSetFontScale('large')}
                className={`px-2 py-0.5 rounded font-bold text-[13px] transition-colors ${
                  fontScale === 'large' ? 'bg-white text-black shadow-sm' : 'text-slate-600 hover:text-black'
                }`}
                title="Large text size (Easier to read)"
              >
                A+
              </button>
              <button
                onClick={() => onSetFontScale('xlarge')}
                className={`px-2 py-0.5 rounded font-bold text-sm transition-colors ${
                  fontScale === 'xlarge' ? 'bg-white text-black shadow-sm' : 'text-slate-600 hover:text-black'
                }`}
                title="Extra Large text size"
              >
                A++
              </button>
            </div>
          )}

          {/* Quick-Add Button */}
          <div className="relative">
            <button
              onClick={() => setShowQuickAddDropdown(!showQuickAddDropdown)}
              className="flex items-center gap-1 px-3 py-1.5 rounded text-xs bg-slate-100 border-2 border-slate-300 hover:border-slate-800 text-slate-900 font-bold transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="tracking-wider uppercase">Add</span>
            </button>
            {showQuickAddDropdown && (
              <div className="absolute right-0 top-full mt-1 w-48 rounded-md border-2 border-slate-300 bg-white shadow-xl py-1 z-50 text-xs font-semibold text-slate-900">
                <button
                  onClick={() => {
                    setShowQuickAddDropdown(false);
                    onOpenNewCaseModal();
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-100"
                >
                  + New Case
                </button>
                <button
                  onClick={() => {
                    setShowQuickAddDropdown(false);
                    onOpenNewPersonModal();
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-100"
                >
                  + New Subject
                </button>
                <button
                  onClick={() => {
                    setShowQuickAddDropdown(false);
                    onOpenNewEventModal();
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-100"
                >
                  + New Chronology Event
                </button>
              </div>
            )}
          </div>

          {/* Interactive Tutorial Button */}
          <button
            onClick={onOpenTutorial}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs bg-amber-100 border-2 border-amber-600 hover:bg-amber-200 text-amber-950 font-bold transition-all shadow-sm group hover:scale-[1.02]"
            title="Start Interactive Guided Tour"
          >
            <Compass className="w-4 h-4 group-hover:rotate-45 transition-transform text-amber-800" />
            <span className="tracking-wider uppercase">Interactive Tutorial</span>
          </button>

          {/* User Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded border-2 border-slate-300 bg-slate-50 hover:border-slate-800 text-xs text-slate-900 font-bold shadow-sm"
            >
              <div className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">
                {currentUser.name[0]}
              </div>
              <div className="text-left hidden sm:block">
                <span className="text-[11px] font-bold text-slate-950 block leading-tight">
                  {currentUser.name}
                </span>
                <span className="text-[9px] text-slate-600 block uppercase tracking-tight font-semibold">
                  {currentUser.role.split('–')[0].trim()}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-600 ml-1" />
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 top-full mt-1 w-64 rounded-md border-2 border-slate-300 bg-white shadow-2xl py-1 z-50">
                <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-slate-700 font-bold border-b border-slate-200 bg-slate-50">
                  Switch Role / Persona (PRD §5)
                </div>
                {allUsers.map(u => (
                  <button
                    key={u.userId}
                    onClick={() => {
                      setCurrentUser(u);
                      setShowUserDropdown(false);
                    }}
                    className={`w-full px-3 py-2 text-left hover:bg-slate-100 text-xs transition-colors border-b border-slate-100 ${
                      u.userId === currentUser.userId
                        ? 'bg-amber-100 text-amber-950 font-bold border-l-4 border-l-amber-600'
                        : 'text-slate-900'
                    }`}
                  >
                    <div className="font-bold">{u.name}</div>
                    <div className="text-[10px] text-slate-600">{u.role}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Global Navigation Bar */}
      <div className="border-t-2 border-slate-200 bg-slate-100">
        <div className="max-w-[1700px] mx-auto px-4 flex items-center justify-between overflow-x-auto no-scrollbar">
          <nav className="flex items-center gap-1 py-1.5 text-xs">
            <button
              onClick={() => setActiveTab('CASES')}
              className={`px-3 py-2 rounded flex items-center gap-1.5 font-bold transition-all uppercase tracking-wider whitespace-nowrap ${
                activeTab === 'CASES'
                  ? 'bg-white text-slate-950 border-b-2 border-slate-950 shadow-sm'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200'
              }`}
            >
              <FolderKanban className="w-4 h-4" />
              Cases
            </button>

            <button
              onClick={() => setActiveTab('PEOPLE')}
              className={`px-3 py-2 rounded flex items-center gap-1.5 font-bold transition-all uppercase tracking-wider whitespace-nowrap ${
                activeTab === 'PEOPLE'
                  ? 'bg-white text-slate-950 border-b-2 border-slate-950 shadow-sm'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              People
            </button>

            <button
              onClick={() => setActiveTab('ANALYSIS')}
              className={`px-3 py-2 rounded flex items-center gap-1.5 font-bold transition-all uppercase tracking-wider whitespace-nowrap ${
                activeTab === 'ANALYSIS'
                  ? 'bg-white text-slate-950 border-b-2 border-slate-950 shadow-sm'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200'
              }`}
            >
              <Crosshair className="w-4 h-4" />
              Analysis
            </button>

            <button
              onClick={() => setActiveTab('CHRONOLOGY')}
              className={`px-3 py-2 rounded flex items-center gap-1.5 font-bold transition-all uppercase tracking-wider whitespace-nowrap ${
                activeTab === 'CHRONOLOGY'
                  ? 'bg-white text-slate-950 border-b-2 border-slate-950 shadow-sm'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              Chronology
            </button>

            <button
              onClick={() => setActiveTab('CHART')}
              className={`px-3 py-2 rounded flex items-center gap-1.5 font-bold transition-all uppercase tracking-wider whitespace-nowrap ${
                activeTab === 'CHART'
                  ? 'bg-white text-amber-950 border-b-2 border-amber-600 shadow-sm ring-1 ring-amber-300'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200'
              }`}
            >
              <LineChart className="w-4 h-4 text-amber-700" />
              <span className="text-slate-950 font-black">Time-Map Chart</span>
            </button>

            <button
              onClick={() => setActiveTab('EVIDENCE')}
              className={`px-3 py-2 rounded flex items-center gap-1.5 font-bold transition-all uppercase tracking-wider whitespace-nowrap ${
                activeTab === 'EVIDENCE'
                  ? 'bg-white text-slate-950 border-b-2 border-slate-950 shadow-sm'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200'
              }`}
            >
              <FileCheck2 className="w-4 h-4" />
              Evidence
            </button>

            <button
              onClick={() => setActiveTab('DOCUMENTS')}
              className={`px-3 py-2 rounded flex items-center gap-1.5 font-bold transition-all uppercase tracking-wider whitespace-nowrap ${
                activeTab === 'DOCUMENTS'
                  ? 'bg-white text-slate-950 border-b-2 border-slate-950 shadow-sm'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              Documents
            </button>

            <button
              onClick={() => setActiveTab('MEDIA')}
              className={`px-3 py-2 rounded flex items-center gap-1.5 font-bold transition-all uppercase tracking-wider whitespace-nowrap ${
                activeTab === 'MEDIA'
                  ? 'bg-white text-slate-950 border-b-2 border-slate-950 shadow-sm'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              Media
            </button>

            <button
              onClick={() => setActiveTab('HYPOTHESES')}
              className={`px-3 py-2 rounded flex items-center gap-1.5 font-bold transition-all uppercase tracking-wider whitespace-nowrap ${
                activeTab === 'HYPOTHESES'
                  ? 'bg-white text-slate-950 border-b-2 border-slate-950 shadow-sm'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              Hypotheses
            </button>

            <button
              onClick={() => setActiveTab('RESEARCH')}
              className={`px-3 py-2 rounded flex items-center gap-1.5 font-bold transition-all uppercase tracking-wider whitespace-nowrap ${
                activeTab === 'RESEARCH'
                  ? 'bg-white text-slate-950 border-b-2 border-slate-950 shadow-sm'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200'
              }`}
            >
              <Database className="w-4 h-4" />
              Research
            </button>

            <button
              onClick={() => setActiveTab('REPORTS')}
              className={`px-3 py-2 rounded flex items-center gap-1.5 font-bold transition-all uppercase tracking-wider whitespace-nowrap ${
                activeTab === 'REPORTS'
                  ? 'bg-white text-slate-950 border-b-2 border-slate-950 shadow-sm'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200'
              }`}
            >
              <Printer className="w-4 h-4" />
              Reports
            </button>

            <button
              onClick={() => setActiveTab('BLIND')}
              className={`px-3 py-2 rounded flex items-center gap-1.5 font-bold transition-all uppercase tracking-wider whitespace-nowrap ${
                activeTab === 'BLIND'
                  ? 'bg-white text-slate-950 border-b-2 border-slate-950 shadow-sm'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200'
              }`}
            >
              <EyeOff className="w-4 h-4" />
              Blind Study
            </button>

            <button
              onClick={() => setActiveTab('METHODOLOGY')}
              className={`px-3 py-2 rounded flex items-center gap-1.5 font-bold transition-all uppercase tracking-wider whitespace-nowrap ${
                activeTab === 'METHODOLOGY'
                  ? 'bg-white text-emerald-950 border-b-2 border-emerald-600 shadow-sm ring-1 ring-emerald-300'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span className="text-emerald-950 font-bold">Methodology & Peer Review</span>
            </button>
          </nav>

          <div className="flex items-center gap-2 py-1">
            <button
              onClick={onOpenTutorial}
              className="flex items-center gap-1.5 text-xs font-bold text-amber-950 hover:bg-amber-200 px-3 py-1 rounded bg-amber-100 border-2 border-amber-500 transition-colors whitespace-nowrap uppercase tracking-wider shadow-sm"
              title="Launch Interactive Step-by-Step Tutorial"
            >
              <Compass className="w-4 h-4 text-amber-800" />
              <span>Interactive Tour</span>
            </button>

            {/* Absolute Rule 7 & 15 Reinforcement Badge */}
            <div className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-50 px-2.5 py-1 rounded border border-amber-300 whitespace-nowrap">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Pattern Research Is Not Forensic Proof</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

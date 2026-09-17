/**
 * @license
 * Lettrology Forensic Science - People & Identity Management
 * PRD Section 9, 13 (Six Primary Fixed Numbers), 14 (Called Name), 36.2
 */

import React, { useState, useMemo } from 'react';
import {
  Users,
  UserCheck,
  ShieldCheck,
  Award,
  Calendar,
  FileText,
  Clock,
  ChevronRight,
  Plus,
  Compass,
  Heart,
  Sparkles,
  Layers,
  LineChart,
} from 'lucide-react';
import { PersonRecord, IdentityRecord, CaseRecord } from '../types.ts';
import { calculatePrimaryProfile, PrimaryFixedProfile } from '../core/lettrology-engine/identityCalculations.ts';
import { formatCompound } from '../core/lettrology-engine/compoundTrail.ts';

interface PeopleViewProps {
  caseRecord: CaseRecord;
  people: PersonRecord[];
  onSelectPersonForChart: (personId: string) => void;
  onOpenNewPersonModal: () => void;
}

export const PeopleView: React.FC<PeopleViewProps> = ({
  caseRecord,
  people,
  onSelectPersonForChart,
  onOpenNewPersonModal,
}) => {
  const [selectedPersonId, setSelectedPersonId] = useState<string>(
    people[0]?.personId || ''
  );
  const [activeRoleFilter, setActiveRoleFilter] = useState<string>('ALL');

  const filteredPeople = useMemo(() => {
    if (activeRoleFilter === 'ALL') return people;
    return people.filter(p => p.roleInCase === activeRoleFilter);
  }, [people, activeRoleFilter]);

  const currentPerson = useMemo(() => {
    return people.find(p => p.personId === selectedPersonId) || people[0];
  }, [people, selectedPersonId]);

  // Compute 6 Primary Fixed Numbers and Called Name
  const fixedProfile: PrimaryFixedProfile | null = useMemo(() => {
    if (!currentPerson) return null;
    return calculatePrimaryProfile(
      currentPerson.verifiedBirthName,
      currentPerson.dob,
      currentPerson.calledName
    );
  }, [currentPerson]);

  if (!currentPerson) {
    return <div className="p-8 text-center text-slate-700 font-bold">No people records available.</div>;
  }

  return (
    <div className="space-y-4">
      {/* Top Header & Role Filter */}
      <div className="p-4 rounded-lg bg-white border-2 border-slate-300 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black text-slate-950 uppercase tracking-wider flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-700" />
            People & Identity Repository
          </h2>
          <p className="text-xs text-slate-700 font-medium">
            Authoritative identity provenance, legal identities, and deterministic fixed Lettrology profiles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Role Filter Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-md border-2 border-slate-300 text-xs">
            {['ALL', 'SUSPECT', 'VICTIM', 'WITNESS', 'REFERENCE'].map(role => (
              <button
                key={role}
                onClick={() => setActiveRoleFilter(role)}
                className={`px-2.5 py-1 rounded font-bold uppercase tracking-wider transition-colors ${
                  activeRoleFilter === role
                    ? 'bg-slate-950 text-white shadow-sm'
                    : 'text-slate-700 hover:text-black hover:bg-slate-200'
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          <button
            onClick={onOpenNewPersonModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-slate-950 hover:bg-slate-800 text-xs text-white font-bold transition-colors uppercase tracking-wider shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Subject
          </button>
        </div>
      </div>

      {/* Main Grid: Person List (Left) & Person Detail + Fixed Numbers (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: People Cards */}
        <div className="lg:col-span-4 space-y-2">
          {filteredPeople.map(p => {
            const isSelected = p.personId === currentPerson.personId;
            return (
              <button
                key={p.personId}
                onClick={() => setSelectedPersonId(p.personId)}
                className={`w-full text-left p-3.5 rounded-lg border-2 transition-all flex items-start justify-between gap-2 shadow-sm ${
                  isSelected
                    ? 'border-amber-600 bg-amber-50/70 ring-2 ring-amber-300'
                    : 'border-slate-300 bg-white hover:border-slate-500 hover:bg-slate-50'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-slate-950">{p.displayName}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-slate-300 bg-slate-100 text-slate-800 uppercase">
                      {p.roleInCase}
                    </span>
                  </div>
                  <div className="text-xs text-slate-700 font-mono font-bold">
                    DOB: {p.dob} • ({p.datePrecision})
                  </div>
                  <div className="text-[11px] text-slate-600 font-medium truncate max-w-[240px]">
                    Legal: {p.verifiedBirthName}
                  </div>
                </div>
                <ChevronRight
                  className={`w-5 h-5 mt-1 transition-colors ${
                    isSelected ? 'text-amber-800' : 'text-slate-400'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Right Column: Person Profile, 6 Fixed Numbers, Identity History */}
        <div className="lg:col-span-8 space-y-4">
          {/* Header Card */}
          <div className="rounded-lg bg-white border-2 border-slate-300 p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b-2 border-slate-200">
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-lg font-black text-slate-950">{currentPerson.displayName}</h3>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-emerald-100 border border-emerald-400 text-emerald-950">
                    {currentPerson.identityVerificationState}
                  </span>
                </div>
                <p className="text-xs text-slate-700 font-medium mt-1">
                  Full Birth Legal Name: <strong className="text-slate-950 font-bold">{currentPerson.verifiedBirthName}</strong>
                </p>
                {currentPerson.calledName && (
                  <p className="text-xs text-amber-900 font-bold mt-1">
                    Socially Used Called Name: {currentPerson.calledName.given} {currentPerson.calledName.surname}
                  </p>
                )}
              </div>

              <button
                onClick={() => onSelectPersonForChart(currentPerson.personId)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-100 border-2 border-amber-600 text-xs text-amber-950 font-black hover:bg-amber-200 transition-colors uppercase tracking-wider shadow-sm"
              >
                <LineChart className="w-4 h-4 text-amber-800" />
                View in Time-Map
              </button>
            </div>

            {/* Factual Provenance Data */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 text-xs">
              <div className="p-3 rounded-md bg-slate-50 border-2 border-slate-200">
                <span className="text-[11px] text-slate-700 font-bold uppercase tracking-wider block mb-0.5">
                  Date of Birth & Source
                </span>
                <span className="font-mono text-slate-950 font-black text-sm">{currentPerson.dob}</span>
                <p className="text-xs text-slate-700 mt-1 leading-snug font-medium">{currentPerson.sourceForDob}</p>
              </div>

              <div className="p-3 rounded-md bg-slate-50 border-2 border-slate-200">
                <span className="text-[11px] text-slate-700 font-bold uppercase tracking-wider block mb-0.5">
                  Name Provenance / Vital Record
                </span>
                <span className="font-black text-slate-950 text-sm">{currentPerson.verifiedBirthName}</span>
                <p className="text-xs text-slate-700 mt-1 leading-snug font-medium">{currentPerson.sourceForName}</p>
              </div>
            </div>
          </div>

          {/* Six Primary Fixed Numbers (PRD Section 13) */}
          {fixedProfile && (
            <div className="rounded-lg bg-white border-2 border-slate-300 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b-2 border-slate-200">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-950 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-700" />
                  Six Primary Fixed Numbers (Canonical Core)
                </h4>
                <span className="text-xs font-bold text-slate-600">Base 1-9 & Full Trail Preserved</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {/* 1. First Name */}
                <div className="p-3.5 rounded-md bg-slate-50 border-2 border-slate-200 space-y-1">
                  <span className="text-[11px] text-slate-700 font-bold uppercase tracking-wider block">
                    1. First Name ({fixedProfile.firstName.spelling})
                  </span>
                  <div className="text-2xl font-black text-slate-950">
                    {formatCompound(fixedProfile.firstName)}
                  </div>
                  <span className="text-xs text-slate-600 font-mono font-bold block">
                    Root: {fixedProfile.firstName.root}
                  </span>
                </div>

                {/* 2. Full Name */}
                <div className="p-3.5 rounded-md bg-slate-50 border-2 border-slate-200 space-y-1">
                  <span className="text-[11px] text-slate-700 font-bold uppercase tracking-wider block">
                    2. Full Birth Name
                  </span>
                  <div className="text-2xl font-black text-slate-950">
                    {formatCompound(fixedProfile.fullName)}
                  </div>
                  <span className="text-xs text-slate-600 font-mono font-bold block">
                    Root: {fixedProfile.fullName.root}
                  </span>
                </div>

                {/* 3. Vowels / Heart's Desire */}
                <div className="p-3.5 rounded-md bg-slate-50 border-2 border-slate-200 space-y-1">
                  <span className="text-[11px] text-slate-700 font-bold uppercase tracking-wider block">
                    3. Vowels / Heart's Desire
                  </span>
                  <div className="text-2xl font-black text-purple-950">
                    {formatCompound(fixedProfile.vowels)}
                  </div>
                  <span className="text-xs text-slate-600 font-mono font-bold block">
                    Root: {fixedProfile.vowels.root}
                  </span>
                </div>

                {/* 4. Day of Birth */}
                <div className="p-3.5 rounded-md bg-slate-50 border-2 border-slate-200 space-y-1">
                  <span className="text-[11px] text-slate-700 font-bold uppercase tracking-wider block">
                    4. Day of Birth (Day {fixedProfile.dayOfBirth.calendarDay})
                  </span>
                  <div className="text-2xl font-black text-blue-950">
                    {formatCompound(fixedProfile.dayOfBirth)}
                  </div>
                  <span className="text-xs text-slate-600 font-mono font-bold block">
                    Root: {fixedProfile.dayOfBirth.root}
                  </span>
                </div>

                {/* 5. Total Birth Date / Birth Force */}
                <div className="p-3.5 rounded-md bg-slate-50 border-2 border-slate-200 space-y-1">
                  <span className="text-[11px] text-slate-700 font-bold uppercase tracking-wider block">
                    5. Total Birth Date / Force
                  </span>
                  <div className="text-2xl font-black text-blue-950">
                    {formatCompound(fixedProfile.totalBirthDate)}
                  </div>
                  <span className="text-xs text-slate-600 font-mono font-bold block">
                    Root: {fixedProfile.totalBirthDate.root}
                  </span>
                </div>

                {/* 6. Ultimate Goal */}
                <div className="p-3.5 rounded-md bg-slate-50 border-2 border-slate-200 space-y-1">
                  <span className="text-[11px] text-slate-700 font-bold uppercase tracking-wider block">
                    6. Ultimate Goal (Full+DOB)
                  </span>
                  <div className="text-2xl font-black text-emerald-950">
                    {formatCompound(fixedProfile.ultimateGoal)}
                  </div>
                  <span className="text-xs text-slate-600 font-mono font-bold block">
                    Root: {fixedProfile.ultimateGoal.root}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Called Name Profile (PRD Section 14) */}
          {fixedProfile?.calledName && (
            <div className="rounded-lg bg-white border-2 border-slate-300 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b-2 border-slate-200">
                <h4 className="text-xs font-black uppercase tracking-wider text-purple-950 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-purple-700" />
                  Called Name Profile (How Others See You • Section 14)
                </h4>
                <span className="text-xs font-bold text-slate-700">
                  {fixedProfile.calledName.calledGivenName} {fixedProfile.calledName.calledSurname}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-md bg-slate-50 border-2 border-slate-200">
                  <span className="text-[11px] text-slate-700 font-bold uppercase tracking-wider block">
                    Given Component
                  </span>
                  <div className="text-lg font-black text-slate-950">
                    {formatCompound(fixedProfile.calledName.givenComponent)}
                  </div>
                </div>

                <div className="p-3 rounded-md bg-slate-50 border-2 border-slate-200">
                  <span className="text-[11px] text-slate-700 font-bold uppercase tracking-wider block">
                    Surname Component
                  </span>
                  <div className="text-lg font-black text-slate-950">
                    {formatCompound(fixedProfile.calledName.surnameComponent)}
                  </div>
                </div>

                <div className="p-3 rounded-md bg-slate-50 border-2 border-slate-200">
                  <span className="text-[11px] text-slate-700 font-bold uppercase tracking-wider block">
                    Combined Called Name
                  </span>
                  <div className="text-lg font-black text-amber-900">
                    {formatCompound(fixedProfile.calledName.combinedCalledName)}
                  </div>
                </div>

                <div className="p-3 rounded-md bg-slate-50 border-2 border-slate-200">
                  <span className="text-[11px] text-slate-700 font-bold uppercase tracking-wider block">
                    Called Ultimate Goal
                  </span>
                  <div className="text-lg font-black text-emerald-950">
                    {formatCompound(fixedProfile.calledName.calledUltimateGoal)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Identity History Records Table (PRD Section 9.2) */}
          <div className="rounded-lg bg-white border-2 border-slate-300 p-5 shadow-sm">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-950 mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-700" />
              Immutable Identity History Records
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-950 font-black border-b-2 border-slate-300">
                    <th className="p-2.5">Type</th>
                    <th className="p-2.5">Exact Name String</th>
                    <th className="p-2.5">Socially Used</th>
                    <th className="p-2.5">Legal Status</th>
                    <th className="p-2.5">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {currentPerson.identities.map(id => (
                    <tr key={id.identityId} className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-slate-900">{id.identityType}</td>
                      <td className="p-2.5 font-mono font-bold text-slate-950">{id.exactNameString}</td>
                      <td className="p-2.5 text-slate-800 font-medium">{id.sociallyUsedName}</td>
                      <td className="p-2.5 text-slate-700">{id.legalStatus}</td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 border border-emerald-400 text-emerald-950">
                          {id.verificationStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

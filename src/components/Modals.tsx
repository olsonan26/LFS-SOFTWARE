/**
 * @license
 * Lettrology Forensic Science - Creation Modals (Case, Person, Event)
 */

import React, { useState } from 'react';
import { X, FolderKanban, Users, CalendarDays } from 'lucide-react';
import { CaseRecord, PersonRecord, EventRecord, EventCategory } from '../types.ts';
import { CURRENT_ENGINE_VERSION } from '../core/lettrology-engine/methodologyVersion.ts';

interface NewCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newCase: CaseRecord) => void;
}

export const NewCaseModal: React.FC<NewCaseModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [caseNumber, setCaseNumber] = useState(`CASE-2025-${Math.floor(100 + Math.random() * 900)}`);
  const [lead, setLead] = useState('Special Investigator Olson');
  const [synopsis, setSynopsis] = useState('');
  const [incidentDate, setIncidentDate] = useState('2025-01-01');
  const [location, setLocation] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newCase: CaseRecord = {
      caseId: `case-${Date.now()}`,
      caseNumber,
      title,
      status: 'ACTIVE',
      leadInvestigator: lead,
      synopsis: synopsis || 'Active forensic inquiry.',
      privacyLevel: 'PRIVATE',
      primaryIncidentDate: incidentDate,
      primaryLocation: location || 'Unspecified',
      calculationEngineVersion: CURRENT_ENGINE_VERSION,
      lastUpdated: new Date().toISOString(),
      peopleIds: [],
    };

    onSubmit(newCase);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white border-2 border-slate-400 rounded-lg max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs text-slate-950">
        <div className="flex items-center justify-between border-b-2 border-slate-200 pb-3">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-950 flex items-center gap-2">
            <FolderKanban className="w-4 h-4 text-amber-600" /> Create New Case File
          </h3>
          <button onClick={onClose} className="text-slate-600 hover:text-black p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs uppercase font-black text-slate-800 block mb-1">Case Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. State v. Mercer or Corporate Advisory"
              className="w-full bg-white border-2 border-slate-300 rounded-md p-2.5 text-slate-950 font-bold placeholder-slate-400 focus:outline-none focus:border-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-xs uppercase font-black text-slate-800 block mb-1">Case Number</label>
              <input
                type="text"
                value={caseNumber}
                onChange={e => setCaseNumber(e.target.value)}
                className="w-full bg-white border-2 border-slate-300 rounded-md p-2.5 text-slate-950 font-bold focus:outline-none focus:border-slate-800"
              />
            </div>
            <div>
              <label className="text-xs uppercase font-black text-slate-800 block mb-1">Lead Investigator</label>
              <input
                type="text"
                value={lead}
                onChange={e => setLead(e.target.value)}
                className="w-full bg-white border-2 border-slate-300 rounded-md p-2.5 text-slate-950 font-bold focus:outline-none focus:border-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-xs uppercase font-black text-slate-800 block mb-1">Incident Date</label>
              <input
                type="date"
                value={incidentDate}
                onChange={e => setIncidentDate(e.target.value)}
                className="w-full bg-white border-2 border-slate-300 rounded-md p-2.5 text-slate-950 font-bold focus:outline-none focus:border-slate-800"
              />
            </div>
            <div>
              <label className="text-xs uppercase font-black text-slate-800 block mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="City, State"
                className="w-full bg-white border-2 border-slate-300 rounded-md p-2.5 text-slate-950 font-bold placeholder-slate-400 focus:outline-none focus:border-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="text-xs uppercase font-black text-slate-800 block mb-1">Synopsis / Objective</label>
            <textarea
              rows={3}
              value={synopsis}
              onChange={e => setSynopsis(e.target.value)}
              placeholder="Case briefing notes..."
              className="w-full bg-white border-2 border-slate-300 rounded-md p-2.5 text-slate-950 font-medium placeholder-slate-400 focus:outline-none focus:border-slate-800"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-slate-100 border border-slate-300 text-slate-800 font-bold hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-md bg-amber-500 border border-amber-600 text-slate-950 font-black uppercase tracking-wider hover:bg-amber-600 shadow-sm"
            >
              Initialize Case
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface NewPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newPerson: PersonRecord) => void;
  caseId: string;
}

export const NewPersonModal: React.FC<NewPersonModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [displayName, setDisplayName] = useState('');
  const [birthName, setBirthName] = useState('');
  const [dob, setDob] = useState('1985-06-15');
  const [role, setRole] = useState<'SUSPECT' | 'VICTIM' | 'WITNESS' | 'REFERENCE'>('SUSPECT');
  const [dobSource, setDobSource] = useState('Official Birth Certificate / Vital Records');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || !birthName.trim() || !dob) return;

    const newPerson: PersonRecord = {
      personId: `person-${Date.now()}`,
      displayName,
      verifiedBirthName: birthName.toUpperCase(),
      dob,
      datePrecision: 'EXACT',
      sourceForDob: dobSource,
      sourceForName: 'Certified vital record',
      identityVerificationState: 'VERIFIED_DOCUMENTED',
      roleInCase: role,
      identities: [
        {
          identityId: `id-${Date.now()}`,
          personId: `person-${Date.now()}`,
          identityType: 'BIRTH_LEGAL',
          exactNameString: birthName.toUpperCase(),
          sociallyUsedName: displayName,
          legalStatus: 'Official Full Legal Birth Name',
          verificationStatus: 'VERIFIED_DOCUMENTED',
        },
      ],
    };

    onSubmit(newPerson);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white border-2 border-slate-400 rounded-lg max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs text-slate-950">
        <div className="flex items-center justify-between border-b-2 border-slate-200 pb-3">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-950 flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-600" /> Add Subject to Case
          </h3>
          <button onClick={onClose} className="text-slate-600 hover:text-black p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs uppercase font-black text-slate-800 block mb-1">Display / Called Name</label>
            <input
              type="text"
              required
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="e.g. John Smith"
              className="w-full bg-white border-2 border-slate-300 rounded-md p-2.5 text-slate-950 font-bold placeholder-slate-400 focus:outline-none focus:border-slate-800"
            />
          </div>

          <div>
            <label className="text-xs uppercase font-black text-slate-800 block mb-1">
              Verified Full Birth Legal Name (PRD Section 9.1 Mandate)
            </label>
            <input
              type="text"
              required
              value={birthName}
              onChange={e => setBirthName(e.target.value)}
              placeholder="e.g. JOHN ROBERT SMITH"
              className="w-full bg-white border-2 border-slate-300 rounded-md p-2.5 text-slate-950 font-bold placeholder-slate-400 focus:outline-none focus:border-slate-800"
            />
            <span className="text-xs text-slate-600 font-semibold block mt-1">
              Must include First, Middle, and Surname as recorded on initial birth certificate.
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-xs uppercase font-black text-slate-800 block mb-1">Date of Birth</label>
              <input
                type="date"
                required
                value={dob}
                onChange={e => setDob(e.target.value)}
                className="w-full bg-white border-2 border-slate-300 rounded-md p-2.5 text-slate-950 font-bold focus:outline-none focus:border-slate-800"
              />
            </div>
            <div>
              <label className="text-xs uppercase font-black text-slate-800 block mb-1">Role in Case</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as any)}
                className="w-full bg-white border-2 border-slate-300 rounded-md p-2.5 text-slate-950 font-bold focus:outline-none focus:border-slate-800"
              >
                <option value="SUSPECT">Suspect</option>
                <option value="VICTIM">Victim</option>
                <option value="WITNESS">Witness</option>
                <option value="REFERENCE">Reference / Benchmark</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs uppercase font-black text-slate-800 block mb-1">DOB Source Provenance</label>
            <input
              type="text"
              value={dobSource}
              onChange={e => setDobSource(e.target.value)}
              className="w-full bg-white border-2 border-slate-300 rounded-md p-2.5 text-slate-950 font-bold focus:outline-none focus:border-slate-800"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-slate-100 border border-slate-300 text-slate-800 font-bold hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-md bg-amber-500 border border-amber-600 text-slate-950 font-black uppercase tracking-wider hover:bg-amber-600 shadow-sm"
            >
              Register Subject
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface NewEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newEvent: EventRecord) => void;
  caseId: string;
  people: PersonRecord[];
}

export const NewEventModal: React.FC<NewEventModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  caseId,
  people,
}) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('2024-07-14');
  const [time, setTime] = useState('23:15');
  const [category, setCategory] = useState<EventCategory>('Crime / Incident');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [selectedPeople] = useState<string[]>([people[0]?.personId || '']);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    const newEv: EventRecord = {
      eventId: `evt-${Date.now()}`,
      caseId,
      title,
      category,
      startDate: date,
      time: time || undefined,
      datePrecision: time ? 'EXACT_TIME' : 'EXACT_DAY',
      description: description || title,
      location: location || undefined,
      valence: 'NEGATIVE',
      expectedness: 'UNEXPECTED',
      factStatus: 'VERIFIED_DOCUMENTED',
      sourceReliability: 'A_CONFIRMED',
      peopleInvolved: selectedPeople,
      evidenceIds: [],
    };

    onSubmit(newEv);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white border-2 border-slate-400 rounded-lg max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs text-slate-950">
        <div className="flex items-center justify-between border-b-2 border-slate-200 pb-3">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-950 flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-amber-600" /> Add Chronology Event
          </h3>
          <button onClick={onClose} className="text-slate-600 hover:text-black p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs uppercase font-black text-slate-800 block mb-1">Event Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Incident Occurred or Key Meeting"
              className="w-full bg-white border-2 border-slate-300 rounded-md p-2.5 text-slate-950 font-bold placeholder-slate-400 focus:outline-none focus:border-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-xs uppercase font-black text-slate-800 block mb-1">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-white border-2 border-slate-300 rounded-md p-2.5 text-slate-950 font-bold focus:outline-none focus:border-slate-800"
              />
            </div>
            <div>
              <label className="text-xs uppercase font-black text-slate-800 block mb-1">Time (Optional)</label>
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full bg-white border-2 border-slate-300 rounded-md p-2.5 text-slate-950 font-bold focus:outline-none focus:border-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-xs uppercase font-black text-slate-800 block mb-1">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as EventCategory)}
                className="w-full bg-white border-2 border-slate-300 rounded-md p-2.5 text-slate-950 font-bold focus:outline-none focus:border-slate-800"
              >
                <option value="Crime / Incident">Crime / Incident</option>
                <option value="Relationship">Relationship</option>
                <option value="Career">Career / Venture</option>
                <option value="Legal / Conflict">Legal / Conflict</option>
                <option value="Accident / Disruption">Accident / Disruption</option>
                <option value="Health">Health</option>
                <option value="Financial">Financial</option>
              </select>
            </div>
            <div>
              <label className="text-xs uppercase font-black text-slate-800 block mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Scene Address or City"
                className="w-full bg-white border-2 border-slate-300 rounded-md p-2.5 text-slate-950 font-bold placeholder-slate-400 focus:outline-none focus:border-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="text-xs uppercase font-black text-slate-800 block mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Factual summary of what transpired..."
              className="w-full bg-white border-2 border-slate-300 rounded-md p-2.5 text-slate-950 font-medium placeholder-slate-400 focus:outline-none focus:border-slate-800"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-slate-100 border border-slate-300 text-slate-800 font-bold hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-md bg-amber-500 border border-amber-600 text-slate-950 font-black uppercase tracking-wider hover:bg-amber-600 shadow-sm"
            >
              Record Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

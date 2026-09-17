/**
 * @license
 * Lettrology Forensic Science - Creation Modals (Case, Person, Event)
 */

import { useDialogFocus } from './useDialogFocus';
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
  const [caseNumber, setCaseNumber] = useState(`CASE-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  const [lead, setLead] = useState('Special Investigator Olson');
  const [synopsis, setSynopsis] = useState('');
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().slice(0, 10));
  const [location, setLocation] = useState('');

  const dialogRef = useDialogFocus(isOpen, onClose);
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
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Add record" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="modal-panel bg-white border-2 border-slate-400 rounded-lg max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs text-slate-950">
        <div className="flex items-center justify-between border-b-2 border-slate-200 pb-3">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-950 flex items-center gap-2">
            <FolderKanban className="w-4 h-4 text-amber-600" /> Create New Case File
          </h3>
          <button aria-label="Close form" onClick={onClose} className="text-slate-600 hover:text-black p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label htmlFor="record-field-1" className="text-xs uppercase font-black text-slate-800 block mb-1">Case Title</label>
            <input id="record-field-1"
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
              <label htmlFor="record-field-2" className="text-xs uppercase font-black text-slate-800 block mb-1">Case Number</label>
              <input id="record-field-2"
                type="text"
                value={caseNumber}
                onChange={e => setCaseNumber(e.target.value)}
                className="w-full bg-white border-2 border-slate-300 rounded-md p-2.5 text-slate-950 font-bold focus:outline-none focus:border-slate-800"
              />
            </div>
            <div>
              <label htmlFor="record-field-3" className="text-xs uppercase font-black text-slate-800 block mb-1">Lead Investigator</label>
              <input id="record-field-3"
                type="text"
                value={lead}
                onChange={e => setLead(e.target.value)}
                className="w-full bg-white border-2 border-slate-300 rounded-md p-2.5 text-slate-950 font-bold focus:outline-none focus:border-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label htmlFor="record-field-4" className="text-xs uppercase font-black text-slate-800 block mb-1">Incident Date</label>
              <input id="record-field-4"
                type="date"
                value={incidentDate}
                onChange={e => setIncidentDate(e.target.value)}
                className="w-full bg-white border-2 border-slate-300 rounded-md p-2.5 text-slate-950 font-bold focus:outline-none focus:border-slate-800"
              />
            </div>
            <div>
              <label htmlFor="record-field-5" className="text-xs uppercase font-black text-slate-800 block mb-1">Location</label>
              <input id="record-field-5"
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="City, State"
                className="w-full bg-white border-2 border-slate-300 rounded-md p-2.5 text-slate-950 font-bold placeholder-slate-400 focus:outline-none focus:border-slate-800"
              />
            </div>
          </div>

          <div>
            <label htmlFor="record-field-6" className="text-xs uppercase font-black text-slate-800 block mb-1">Synopsis / Objective</label>
            <textarea id="record-field-6"
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
  const [dob, setDob] = useState('');
  const [role, setRole] = useState<'SUSPECT' | 'VICTIM' | 'WITNESS' | 'REFERENCE'>('SUSPECT');
  const [dobSource, setDobSource] = useState('');

  const dialogRef = useDialogFocus(isOpen, onClose);
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || !birthName.trim() || !dob) return;

    const personId = `person-${Date.now()}`;
    const newPerson: PersonRecord = {
      personId,
      displayName,
      verifiedBirthName: birthName.toUpperCase(),
      dob,
      datePrecision: 'EXACT',
      sourceForDob: dobSource || 'Source not provided',
      sourceForName: 'User-entered; source review pending',
      identityVerificationState: 'UNVERIFIED',
      roleInCase: role,
      identities: [
        {
          identityId: `id-${Date.now()}`,
          personId,
          identityType: 'BIRTH_LEGAL',
          exactNameString: birthName.toUpperCase(),
          sociallyUsedName: displayName,
          legalStatus: 'Official Full Legal Birth Name',
          verificationStatus: 'UNVERIFIED',
        },
      ],
    };

    onSubmit(newPerson);
    onClose();
  };

  return (
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Add record" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="modal-panel bg-white border-2 border-slate-400 rounded-lg max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs text-slate-950">
        <div className="flex items-center justify-between border-b-2 border-slate-200 pb-3">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-950 flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-600" /> Add Subject to Case
          </h3>
          <button aria-label="Close form" onClick={onClose} className="text-slate-600 hover:text-black p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label htmlFor="record-field-7" className="text-xs uppercase font-black text-slate-800 block mb-1">Display / Called Name</label>
            <input id="record-field-7"
              type="text"
              required
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="e.g. John Smith"
              className="w-full bg-white border-2 border-slate-300 rounded-md p-2.5 text-slate-950 font-bold placeholder-slate-400 focus:outline-none focus:border-slate-800"
            />
          </div>

          <div>
            <label htmlFor="record-field-8" className="text-xs uppercase font-black text-slate-800 block mb-1">
              Full birth name
            </label>
            <input id="record-field-8"
              type="text"
              required
              value={birthName}
              onChange={e => setBirthName(e.target.value)}
              placeholder="e.g. JOHN ROBERT SMITH"
              className="w-full bg-white border-2 border-slate-300 rounded-md p-2.5 text-slate-950 font-bold placeholder-slate-400 focus:outline-none focus:border-slate-800"
            />
            <span className="text-xs text-slate-600 font-semibold block mt-1">
              Include first, middle, and last names as recorded on the birth certificate.
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label htmlFor="record-field-9" className="text-xs uppercase font-black text-slate-800 block mb-1">Date of Birth</label>
              <input id="record-field-9"
                type="date"
                required
                value={dob}
                onChange={e => setDob(e.target.value)}
                className="w-full bg-white border-2 border-slate-300 rounded-md p-2.5 text-slate-950 font-bold focus:outline-none focus:border-slate-800"
              />
            </div>
            <div>
              <label htmlFor="record-field-10" className="text-xs uppercase font-black text-slate-800 block mb-1">Role in Case</label>
              <select id="record-field-10"
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
            <label htmlFor="record-field-11" className="text-xs uppercase font-black text-slate-800 block mb-1">Birth date source</label>
            <input id="record-field-11"
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
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState('');
  const [category, setCategory] = useState<EventCategory>('Crime / Incident');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);

  const dialogRef = useDialogFocus(isOpen, onClose);
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
      factStatus: 'UNVERIFIED',
      sourceReliability: 'E_UNTESTED',
      peopleInvolved: selectedPeople.filter(id => people.some(p => p.personId === id)),
      evidenceIds: [],
    };

    onSubmit(newEv);
    onClose();
  };

  return (
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Add record" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="modal-panel bg-white border-2 border-slate-400 rounded-lg max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs text-slate-950">
        <div className="flex items-center justify-between border-b-2 border-slate-200 pb-3">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-950 flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-amber-600" /> Add Chronology Event
          </h3>
          <button aria-label="Close form" onClick={onClose} className="text-slate-600 hover:text-black p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label htmlFor="record-field-12" className="text-xs uppercase font-black text-slate-800 block mb-1">Event Title</label>
            <input id="record-field-12"
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
              <label htmlFor="record-field-13" className="text-xs uppercase font-black text-slate-800 block mb-1">Date</label>
              <input id="record-field-13"
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-white border-2 border-slate-300 rounded-md p-2.5 text-slate-950 font-bold focus:outline-none focus:border-slate-800"
              />
            </div>
            <div>
              <label htmlFor="record-field-14" className="text-xs uppercase font-black text-slate-800 block mb-1">Time (Optional)</label>
              <input id="record-field-14"
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full bg-white border-2 border-slate-300 rounded-md p-2.5 text-slate-950 font-bold focus:outline-none focus:border-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label htmlFor="record-field-15" className="text-xs uppercase font-black text-slate-800 block mb-1">Category</label>
              <select id="record-field-15"
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
              <label htmlFor="record-field-16" className="text-xs uppercase font-black text-slate-800 block mb-1">Location</label>
              <input id="record-field-16"
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Scene Address or City"
                className="w-full bg-white border-2 border-slate-300 rounded-md p-2.5 text-slate-950 font-bold placeholder-slate-400 focus:outline-none focus:border-slate-800"
              />
            </div>
          </div>

          <div>
            <label htmlFor="record-field-17" className="text-xs uppercase font-black text-slate-800 block mb-1">Description</label>
            <textarea id="record-field-17"
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Factual summary of what transpired..."
              className="w-full bg-white border-2 border-slate-300 rounded-md p-2.5 text-slate-950 font-medium placeholder-slate-400 focus:outline-none focus:border-slate-800"
            />
          </div>

          <fieldset className="event-people"><legend>People involved</legend>{people.map(person => <label key={person.personId}><input type="checkbox" checked={selectedPeople.includes(person.personId)} onChange={e => setSelectedPeople(prev => e.target.checked ? [...prev, person.personId] : prev.filter(id => id !== person.personId))}/>{person.displayName}</label>)}</fieldset>
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

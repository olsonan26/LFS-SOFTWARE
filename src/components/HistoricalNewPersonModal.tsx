import React, { useMemo, useState } from 'react';
import { CalendarDays, History, Users, X } from 'lucide-react';
import type { PersonRecord } from '../types.ts';
import {
  daysInHistoricalMonth,
  formatHistoricalDate,
  isValidHistoricalDate,
  serializeHistoricalDate,
  type HistoricalEra,
} from '../core/historicalDate.ts';
import { useDialogFocus } from './useDialogFocus.ts';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newPerson: PersonRecord) => void;
  caseId: string;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const HistoricalNewPersonModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [displayName, setDisplayName] = useState('');
  const [birthName, setBirthName] = useState('');
  const [birthYear, setBirthYear] = useState(String(new Date().getFullYear()));
  const [birthMonth, setBirthMonth] = useState('1');
  const [birthDay, setBirthDay] = useState('1');
  const [era, setEra] = useState<HistoricalEra>('CE');
  const [role, setRole] = useState<'SUSPECT' | 'VICTIM' | 'WITNESS' | 'REFERENCE'>('SUSPECT');
  const [dobSource, setDobSource] = useState('');
  const [error, setError] = useState('');

  const dialogRef = useDialogFocus(isOpen, onClose);
  const year = Number.parseInt(birthYear, 10);
  const month = Number.parseInt(birthMonth, 10);
  const day = Number.parseInt(birthDay, 10);
  const maxDay = Number.isFinite(year) && year > 0 && month >= 1 && month <= 12
    ? daysInHistoricalMonth(year, month)
    : 31;

  const preview = useMemo(() => {
    if (!isValidHistoricalDate(year, month, day)) return '';
    return formatHistoricalDate(serializeHistoricalDate(year, month, day, era));
  }, [year, month, day, era]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!displayName.trim() || !birthName.trim()) {
      setError('Name fields are required.');
      return;
    }
    if (!isValidHistoricalDate(year, month, day)) {
      setError('Enter a valid historical birth date. Years begin at 1; there is no year 0.');
      return;
    }

    const dob = serializeHistoricalDate(year, month, day, era);
    const personId = `person-${Date.now()}`;
    const newPerson: PersonRecord = {
      personId,
      displayName: displayName.trim(),
      verifiedBirthName: birthName.trim().toUpperCase(),
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
          exactNameString: birthName.trim().toUpperCase(),
          sociallyUsedName: displayName.trim(),
          legalStatus: 'Official Full Legal Birth Name',
          verificationStatus: 'UNVERIFIED',
        },
      ],
    };

    onSubmit(newPerson);
    onClose();
  };

  return (
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Add person" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="modal-panel bg-white border-2 border-slate-400 rounded-lg max-w-2xl w-full p-6 shadow-2xl space-y-4 text-xs text-slate-950">
        <div className="flex items-center justify-between border-b-2 border-slate-200 pb-3">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-950 flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-600" /> Add Person to Case
            </h3>
            <p className="mt-1 text-slate-600 font-semibold">Modern and historical births are supported from 9999 BC through 9999 AD.</p>
          </div>
          <button aria-label="Close form" onClick={onClose} className="text-slate-600 hover:text-black p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label htmlFor="historical-display-name" className="text-xs uppercase font-black text-slate-800 block mb-1">Display / Called Name</label>
              <input id="historical-display-name" type="text" required value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="e.g. Julius Caesar" className="w-full bg-white border-2 border-slate-300 rounded-md p-2.5 text-slate-950 font-bold placeholder-slate-400 focus:outline-none focus:border-slate-800" />
            </div>
            <div>
              <label htmlFor="historical-birth-name" className="text-xs uppercase font-black text-slate-800 block mb-1">Full Birth Name</label>
              <input id="historical-birth-name" type="text" required value={birthName} onChange={e => setBirthName(e.target.value)} placeholder="Name used for the chart" className="w-full bg-white border-2 border-slate-300 rounded-md p-2.5 text-slate-950 font-bold placeholder-slate-400 focus:outline-none focus:border-slate-800" />
            </div>
          </div>

          <section className="rounded-lg border-2 border-amber-300 bg-amber-50/60 p-4">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h4 className="font-black uppercase tracking-wider text-slate-950 flex items-center gap-2"><History className="w-4 h-4 text-amber-700" /> Historical Birth Date</h4>
                <p className="mt-1 text-slate-700 font-semibold">Choose BC / BCE for ancient dates or AD / CE for modern dates. The chart skips directly from 1 BC to 1 AD.</p>
              </div>
              <CalendarDays className="w-5 h-5 text-amber-700 shrink-0" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              <div>
                <label htmlFor="historical-year" className="text-xs uppercase font-black text-slate-800 block mb-1">Year</label>
                <input id="historical-year" type="number" inputMode="numeric" min={1} max={9999} required value={birthYear} onChange={e => setBirthYear(e.target.value)} className="w-full bg-white border-2 border-slate-300 rounded-md p-2.5 text-slate-950 font-bold focus:outline-none focus:border-slate-800" />
              </div>
              <div>
                <label htmlFor="historical-era" className="text-xs uppercase font-black text-slate-800 block mb-1">Era</label>
                <select id="historical-era" value={era} onChange={e => setEra(e.target.value as HistoricalEra)} className="w-full bg-white border-2 border-slate-300 rounded-md p-2.5 text-slate-950 font-bold focus:outline-none focus:border-slate-800">
                  <option value="CE">AD / CE</option>
                  <option value="BCE">BC / BCE</option>
                </select>
              </div>
              <div>
                <label htmlFor="historical-month" className="text-xs uppercase font-black text-slate-800 block mb-1">Month</label>
                <select id="historical-month" value={birthMonth} onChange={e => setBirthMonth(e.target.value)} className="w-full bg-white border-2 border-slate-300 rounded-md p-2.5 text-slate-950 font-bold focus:outline-none focus:border-slate-800">
                  {MONTHS.map((name, index) => <option key={name} value={index + 1}>{name}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="historical-day" className="text-xs uppercase font-black text-slate-800 block mb-1">Day</label>
                <input id="historical-day" type="number" inputMode="numeric" min={1} max={maxDay} required value={birthDay} onChange={e => setBirthDay(e.target.value)} className="w-full bg-white border-2 border-slate-300 rounded-md p-2.5 text-slate-950 font-bold focus:outline-none focus:border-slate-800" />
              </div>
            </div>

            <div className="mt-3 rounded-md border border-amber-300 bg-white px-3 py-2 text-slate-800">
              <strong className="uppercase tracking-wider text-[11px]">Calendar preview</strong>
              <div className="mt-1 text-sm font-black text-slate-950">{preview || 'Enter a valid date'}</div>
              <div className="mt-1 text-[11px] font-semibold text-slate-600">Historical counting rule: 5 BC + 10 years = 6 AD. No year 0 is shown or counted as a calendar year.</div>
            </div>
          </section>

          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label htmlFor="historical-role" className="text-xs uppercase font-black text-slate-800 block mb-1">Role in Case</label>
              <select id="historical-role" value={role} onChange={e => setRole(e.target.value as typeof role)} className="w-full bg-white border-2 border-slate-300 rounded-md p-2.5 text-slate-950 font-bold focus:outline-none focus:border-slate-800">
                <option value="SUSPECT">Suspect</option>
                <option value="VICTIM">Victim</option>
                <option value="WITNESS">Witness</option>
                <option value="REFERENCE">Reference / Benchmark</option>
              </select>
            </div>
            <div>
              <label htmlFor="historical-source" className="text-xs uppercase font-black text-slate-800 block mb-1">Birth Date Source</label>
              <input id="historical-source" type="text" value={dobSource} onChange={e => setDobSource(e.target.value)} placeholder="Archive, biography, birth record, etc." className="w-full bg-white border-2 border-slate-300 rounded-md p-2.5 text-slate-950 font-bold placeholder-slate-400 focus:outline-none focus:border-slate-800" />
            </div>
          </div>

          {error && <div role="alert" className="rounded-md border-2 border-red-300 bg-red-50 p-3 font-bold text-red-900">{error}</div>}

          <div className="pt-2 flex justify-end gap-2.5">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-slate-100 border border-slate-300 text-slate-800 font-bold hover:bg-slate-200">Cancel</button>
            <button type="submit" className="px-5 py-2 rounded-md bg-amber-500 border border-amber-600 text-slate-950 font-black uppercase tracking-wider hover:bg-amber-600 shadow-sm">Register Person</button>
          </div>
        </form>
      </div>
    </div>
  );
};

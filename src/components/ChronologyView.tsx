/**
 * @license
 * Lettrology Forensic Science - Chronology & Master Timeline
 * PRD Section 27, 36.4
 */

import React, { useState, useMemo } from 'react';
import {
  CalendarDays,
  Filter,
  Plus,
  Crosshair,
  MapPin,
  Clock,
  FileCheck2,
  AlertCircle,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { EventRecord, PersonRecord, CaseRecord, EvidenceRecord } from '../types.ts';

interface ChronologyViewProps {
  caseRecord: CaseRecord;
  events: EventRecord[];
  people: PersonRecord[];
  evidenceList: EvidenceRecord[];
  onSelectEventForFocus: (event: EventRecord) => void;
  onOpenNewEventModal: () => void;
}

export const ChronologyView: React.FC<ChronologyViewProps> = ({
  caseRecord,
  events,
  people,
  evidenceList,
  onSelectEventForFocus,
  onOpenNewEventModal,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [personFilter, setPersonFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Sorted events chronologically
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      const dateA = a.startDate + (a.time || '00:00');
      const dateB = b.startDate + (b.time || '00:00');
      return dateA.localeCompare(dateB);
    });
  }, [events]);

  const filteredEvents = useMemo(() => {
    return sortedEvents.filter(e => {
      if (categoryFilter !== 'ALL' && e.category !== categoryFilter) return false;
      if (personFilter !== 'ALL' && !e.peopleInvolved.includes(personFilter)) return false;
      if (statusFilter !== 'ALL' && e.factStatus !== statusFilter) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchTitle = e.title.toLowerCase().includes(q);
        const matchDesc = e.description.toLowerCase().includes(q);
        const matchLoc = e.location?.toLowerCase().includes(q) || false;
        if (!matchTitle && !matchDesc && !matchLoc) return false;
      }
      return true;
    });
  }, [sortedEvents, categoryFilter, personFilter, statusFilter, searchTerm]);

  return (
    <div className="space-y-4">
      {/* Top Header & Filtering */}
      <div className="p-4 rounded-lg bg-white border-2 border-slate-300 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div>
          <h2 className="text-base font-black text-slate-950 uppercase tracking-wider flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-amber-600" />
            Master Chronology & Incident Log
          </h2>
          <p className="text-xs text-slate-700 font-semibold mt-0.5">
            Verifiable chronological timeline with date-precision tags, source citations, and direct Forensic Focus linkage.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="bg-white border-2 border-slate-300 rounded-md px-3 py-1.5 text-xs font-bold text-slate-950 focus:outline-none focus:border-slate-800"
          >
            <option value="ALL">All Categories</option>
            <option value="CRIME_INCIDENT">Crime / Incident</option>
            <option value="RELATIONSHIP">Relationship</option>
            <option value="CAREER">Career / Venture</option>
            <option value="LEGAL">Legal / Court</option>
            <option value="ACCIDENT">Accident</option>
            <option value="HEALTH">Health</option>
            <option value="DISAPPEARANCE">Disappearance</option>
            <option value="DEATH">Death / Homicide</option>
          </select>

          {/* Person Filter */}
          <select
            value={personFilter}
            onChange={e => setPersonFilter(e.target.value)}
            className="bg-white border-2 border-slate-300 rounded-md px-3 py-1.5 text-xs font-bold text-slate-950 focus:outline-none focus:border-slate-800"
          >
            <option value="ALL">All Subjects</option>
            {people.map(p => (
              <option key={p.personId} value={p.personId}>
                {p.displayName}
              </option>
            ))}
          </select>

          {/* Quick Search */}
          <input
            type="text"
            placeholder="Filter timeline..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-white border-2 border-slate-300 rounded-md px-3 py-1.5 text-xs font-bold text-slate-950 placeholder-slate-400 focus:outline-none focus:border-slate-800 w-40"
          />

          <button
            onClick={onOpenNewEventModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-500 border border-amber-600 hover:bg-amber-600 text-xs text-slate-950 font-black transition-colors uppercase tracking-wider shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Event
          </button>
        </div>
      </div>

      {/* Events List / Timeline Stream */}
      <div className="space-y-3">
        {filteredEvents.map((evt, idx) => {
          const involvedSubjects = people.filter(p => evt.peopleInvolved.includes(p.personId));
          const linkedEv = evidenceList.filter(ev => evt.evidenceIds.includes(ev.evidenceId));

          return (
            <div
              key={evt.eventId}
              className="p-4 rounded-lg bg-white border-2 border-slate-300 hover:border-slate-800 transition-colors shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b-2 border-slate-200">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-black px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-950 border border-blue-300">
                      {evt.startDate} {evt.time ? `@ ${evt.time}` : ''}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-md uppercase font-black bg-slate-100 text-slate-800 border border-slate-300">
                      {evt.category}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-md uppercase font-black bg-emerald-100 border border-emerald-400 text-emerald-950">
                      {evt.factStatus}
                    </span>
                    <span className="text-xs text-slate-700 font-bold">
                      Precision: {evt.datePrecision}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-slate-950">{evt.title}</h3>
                </div>

                {/* Direct Forensic Focus Action Button */}
                <button
                  onClick={() => onSelectEventForFocus(evt)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-100 border-2 border-red-500 hover:bg-red-200 text-xs text-red-950 font-black transition-colors uppercase tracking-wider shadow-sm"
                  title="Compute exact transparent numerical timing breakdown for this event"
                >
                  <Crosshair className="w-4 h-4 text-red-700" />
                  Forensic Focus
                </button>
              </div>

              {/* Event Description & Details */}
              <div className="pt-3 space-y-2.5 text-xs text-slate-900">
                <p className="leading-relaxed font-medium">{evt.description}</p>

                <div className="flex flex-wrap items-center gap-4 text-slate-700 font-bold pt-2 border-t-2 border-slate-200">
                  {evt.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-600" />
                      {evt.location}
                    </span>
                  )}
                  <span>
                    Source: <strong className="text-black font-black">{evt.sourceReliability}</strong>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-700 uppercase font-black">Subjects:</span>
                    {involvedSubjects.map(s => (
                      <span
                        key={s.personId}
                        className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-950 font-bold border border-slate-300"
                      >
                        {s.displayName}
                      </span>
                    ))}
                  </div>

                  {linkedEv.length > 0 && (
                    <div className="flex items-center gap-1 text-xs font-black text-amber-900">
                      <FileCheck2 className="w-3.5 h-3.5" />
                      <span>{linkedEv.length} Evidence Attachment(s)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredEvents.length === 0 && (
          <div className="p-8 text-center text-slate-700 font-bold bg-white rounded-lg border-2 border-slate-300">
            No timeline events match the selected filters.
          </div>
        )}
      </div>
    </div>
  );
};

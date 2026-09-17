/**
 * @license
 * Lettrology Forensic Science - Documents & Media Workspace
 * PRD Section 29, 36.7, 36.8
 */

import React, { useState } from 'react';
import {
  FileText,
  Image as ImageIcon,
  Tag,
  Search,
  ExternalLink,
  Calendar,
  Users,
  Eye,
} from 'lucide-react';
import { CaseRecord, PersonRecord } from '../types.ts';

interface DocumentsMediaViewProps {
  caseRecord: CaseRecord;
  people: PersonRecord[];
  mode: 'DOCUMENTS' | 'MEDIA';
}

export const DocumentsMediaView: React.FC<DocumentsMediaViewProps> = ({
  caseRecord,
  people,
  mode,
}) => {
  // Sample seed documents & media
  const documents = [
    {
      docId: 'doc-001',
      title: 'State v. Blackwood - Initial Arrest & Probable Cause Affidavit',
      date: '2024-07-16',
      type: 'AFFIDAVIT',
      author: 'Det. Sarah Vance, Major Crimes Division',
      excerpt:
        'Affiant responded to the scene at 4400 Whispering Pines Lane. Subject Marcus Vance Blackwood was located with firearm matching caliber recovered from decedent Jonathan Vance.',
      entities: ['Marcus Vance Blackwood', 'Jonathan Vance', 'Det. Sarah Vance'],
      tags: ['Probable Cause', 'Ballistics', 'Miranda'],
    },
    {
      docId: 'doc-002',
      title: 'Medical Examiner Autopsy Protocol #ME-2024-8891',
      date: '2024-07-15',
      type: 'AUTOPSY',
      author: 'Dr. Katherine Reynolds, Chief Medical Examiner',
      excerpt:
        'Gunshot wound to thorax with extensive pericardial laceration. Time of death estimated between 22:30 and 23:45 hours on July 14, 2024.',
      entities: ['Jonathan Vance', 'Dr. Katherine Reynolds'],
      tags: ['Autopsy', 'Time of Death', 'Toxicology'],
    },
    {
      docId: 'doc-003',
      title: 'Cellular Tower Extraction & Location Analysis Report',
      date: '2024-07-18',
      type: 'DIGITAL_FORENSICS',
      author: 'Cyber & Technical Services Section',
      excerpt:
        'Handset registered to Marcus Blackwood pinged Tower 14-B (0.8 miles from residence) at 23:12 hours on July 14, 2024.',
      entities: ['Marcus Vance Blackwood'],
      tags: ['Cell Tower', 'Geolocation', 'CDR'],
    },
  ];

  const mediaItems = [
    {
      mediaId: 'med-001',
      title: 'Driveway CCTV Frame - Vehicle Entry',
      timestamp: '2024-07-14 22:58:14',
      type: 'SURVEILLANCE_IMAGE',
      source: 'Neighbor Ring Camera (4404 Whispering Pines)',
      notes: 'Dark sedan matching 2018 Ford Fusion entering driveway.',
      subjects: ['Marcus Vance Blackwood'],
    },
    {
      mediaId: 'med-002',
      title: 'Recovered Weapon - Glock 19 Serial #W98102',
      timestamp: '2024-07-16 04:15:00',
      type: 'EVIDENCE_PHOTO',
      source: 'CSI Scene Photo #42',
      notes: 'Recovered from master bedroom closet in locked container.',
      subjects: ['Marcus Vance Blackwood'],
    },
  ];

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-lg bg-white border-2 border-slate-300 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div>
          <h2 className="text-base font-black text-slate-950 uppercase tracking-wider flex items-center gap-2">
            {mode === 'DOCUMENTS' ? (
              <>
                <FileText className="w-5 h-5 text-amber-600" />
                Document Briefings & Investigative Reports
              </>
            ) : (
              <>
                <ImageIcon className="w-5 h-5 text-amber-600" />
                Media & Surveillance Asset Catalog
              </>
            )}
          </h2>
          <p className="text-xs text-slate-700 font-semibold mt-0.5">
            Authoritative investigative source records with entity recognition and cross-case tagging.
          </p>
        </div>
      </div>

      {mode === 'DOCUMENTS' ? (
        <div className="space-y-3">
          {documents.map(doc => (
            <div
              key={doc.docId}
              className="p-4 rounded-lg bg-white border-2 border-slate-300 space-y-2.5 text-xs shadow-sm"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-0.5 rounded-md uppercase font-black bg-amber-100 text-amber-950 border border-amber-300">
                    {doc.type}
                  </span>
                  <h3 className="font-black text-sm text-slate-950">{doc.title}</h3>
                </div>
                <span className="text-slate-800 font-mono font-bold text-xs">{doc.date}</span>
              </div>

              <p className="text-slate-700 text-xs font-semibold">Author: <strong className="text-slate-950">{doc.author}</strong></p>

              <div className="p-3.5 rounded-md bg-slate-50 border-2 border-slate-200 text-slate-900 leading-relaxed font-mono text-xs">
                "{doc.excerpt}"
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t-2 border-slate-200">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs text-slate-700 uppercase font-black">Entities:</span>
                  {doc.entities.map(e => (
                    <span key={e} className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-950 font-bold text-xs">
                      {e}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {doc.tags.map(t => (
                    <span key={t} className="px-2 py-0.5 rounded-md bg-emerald-100 border border-emerald-300 text-emerald-950 font-bold text-xs">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mediaItems.map(item => (
            <div
              key={item.mediaId}
              className="rounded-lg bg-white border-2 border-slate-300 p-4 space-y-3 text-xs shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs px-2.5 py-0.5 rounded-md uppercase font-black bg-amber-100 text-amber-950 border border-amber-300">
                  {item.type}
                </span>
                <span className="font-mono text-blue-950 font-black text-xs">{item.timestamp}</span>
              </div>

              {/* Media Preview Box */}
              <div className="h-40 rounded-lg bg-slate-100 border-2 border-slate-200 flex flex-col items-center justify-center text-slate-700 gap-2 p-4 text-center">
                <ImageIcon className="w-8 h-8 text-slate-500" />
                <span className="text-xs text-slate-950 font-black">{item.title}</span>
                <span className="text-[10px] text-slate-600 uppercase tracking-wider font-bold">
                  Verified Forensic Visual Asset
                </span>
              </div>

              <p className="text-slate-900 leading-snug font-medium">{item.notes}</p>
              <div className="text-xs text-slate-700 pt-2 border-t-2 border-slate-200 flex justify-between font-semibold">
                <span>Source: <strong className="text-black">{item.source}</strong></span>
                <span>Linked: <strong className="text-black">{item.subjects.join(', ')}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

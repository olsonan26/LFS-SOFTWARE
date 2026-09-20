import React from "react";
import { Printer, X } from "lucide-react";
import type { DossierProfileReport } from "../types";
import { useDialogFocus } from "./useDialogFocus";
import "./PersonProfileReport.css";

interface Props {
  open: boolean;
  personName: string;
  report: DossierProfileReport | null;
  onClose: () => void;
}

export function PersonProfileReportModal({
  open,
  personName,
  report,
  onClose,
}: Props) {
  const dialogRef = useDialogFocus(open, onClose);
  if (!open || !report) return null;

  const generated = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(report.generatedAt));

  return (
    <div
      className="profile-report-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <article
        className="profile-report-paper"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-report-title"
      >
        <button
          type="button"
          className="profile-report-close no-print"
          onClick={onClose}
          aria-label="Close generated profile report"
        >
          <X size={24} />
        </button>

        <header className="profile-report-header">
          <div>
            <p className="profile-report-eyebrow">Lettrology™ Profile Report</p>
            <h1 id="profile-report-title">{report.title}</h1>
            <p className="profile-report-person">{personName}</p>
          </div>
          <dl>
            <div>
              <dt>Generated</dt>
              <dd>{generated}</dd>
            </div>
            <div>
              <dt>Model</dt>
              <dd>{report.model}</dd>
            </div>
            <div>
              <dt>Skill</dt>
              <dd>{report.skillVersion}</dd>
            </div>
            {report.generatedBy && (
              <div>
                <dt>Prepared by</dt>
                <dd>{report.generatedBy}</dd>
              </div>
            )}
          </dl>
        </header>

        <section className="profile-report-executive">
          <h2>Executive Summary</h2>
          <p>{report.executiveSummary}</p>
        </section>

        <div className="profile-report-sections">
          {report.sections.map((section, index) => (
            <section key={`${section.heading}-${index}`}>
              <h2>{section.heading}</h2>
              {section.paragraphs.map((paragraph, paragraphIndex) => (
                <p key={paragraphIndex}>{paragraph}</p>
              ))}
            </section>
          ))}
        </div>

        <section className="profile-report-analyst-summary">
          <h2>Analyst Summary</h2>
          <ul>
            {report.analystSummary.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="profile-report-limitations">
          <h2>Interpretive Note</h2>
          <p>{report.limitations}</p>
        </section>

        <footer className="profile-report-footer">
          <span>Lettrology™ · People · Patterns · Purpose</span>
          <div className="profile-report-actions no-print">
            <button type="button" onClick={() => window.print()}>
              <Printer size={17} />
              Print Report
            </button>
            <button type="button" onClick={onClose}>
              <X size={17} />
              Close
            </button>
          </div>
        </footer>
      </article>
    </div>
  );
}

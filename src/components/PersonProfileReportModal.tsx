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

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function printProfileReport(
  personName: string,
  report: DossierProfileReport,
  generated: string,
) {
  const printWindow = window.open("", "_blank", "width=980,height=900");
  if (!printWindow) {
    window.alert("Your browser blocked the print window. Please allow pop-ups for LFS and try again.");
    return;
  }

  const sections = report.sections
    .map(
      (section) => `
        <section class="report-section">
          <h2>${escapeHtml(section.heading)}</h2>
          ${section.paragraphs
            .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
            .join("")}
        </section>`,
    )
    .join("");

  const analystSummary = report.analystSummary
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");

  const preparedBy = report.generatedBy
    ? `<div><dt>Prepared by</dt><dd>${escapeHtml(report.generatedBy)}</dd></div>`
    : "";

  printWindow.document.open();
  printWindow.document.write(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(report.title)} — ${escapeHtml(personName)}</title>
  <style>
    @page {
      size: Letter portrait;
      margin: 0.52in 0.58in 0.55in;
    }

    * {
      box-sizing: border-box;
    }

    html,
    body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      color: #213654;
    }

    body {
      font-family: Georgia, "Times New Roman", serif;
      font-size: 10.5pt;
      line-height: 1.48;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .report {
      width: 100%;
      max-width: 7.34in;
      margin: 0 auto;
    }

    .brand-line {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      margin-bottom: 14px;
      padding-bottom: 9px;
      border-bottom: 2px solid #a67b2f;
      color: #17345e;
      font-family: Georgia, "Times New Roman", serif;
      letter-spacing: 0.07em;
      text-transform: uppercase;
    }

    .brand-line strong {
      font-size: 13pt;
      letter-spacing: 0.12em;
    }

    .brand-line span {
      color: #79591f;
      font-size: 7.5pt;
    }

    .report-header {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 2.15in;
      gap: 0.26in;
      align-items: start;
      padding-bottom: 16px;
      border-bottom: 1px solid #b9aa8d;
    }

    .eyebrow {
      margin: 0 0 5px;
      color: #8a6626;
      font-size: 7.5pt;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }

    h1 {
      margin: 0;
      color: #13284a;
      font-size: 22pt;
      font-weight: 500;
      line-height: 1.08;
    }

    .person-name {
      margin: 6px 0 0;
      color: #273a56;
      font-size: 13pt;
      font-weight: 700;
    }

    dl {
      display: grid;
      gap: 5px;
      margin: 0;
      padding: 9px 10px;
      border: 1px solid #c7baa1;
      background: #faf7ef;
    }

    dl div {
      display: grid;
      grid-template-columns: 0.72in 1fr;
      gap: 6px;
    }

    dt,
    dd {
      margin: 0;
    }

    dt {
      color: #52637d;
      font-size: 6.3pt;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    dd {
      color: #20375d;
      font-size: 7.4pt;
      line-height: 1.25;
      overflow-wrap: anywhere;
    }

    .executive {
      margin-top: 18px;
      padding: 14px 16px;
      border-left: 3px solid #a67b2f;
      background: #faf7ef;
      break-inside: avoid-page;
    }

    h2 {
      margin: 0 0 7px;
      color: #17345e;
      font-size: 12.5pt;
      font-weight: 700;
      break-after: avoid-page;
    }

    p {
      margin: 0 0 9px;
      orphans: 3;
      widows: 3;
    }

    .executive p:last-child,
    .report-section p:last-child,
    .interpretive-note p:last-child {
      margin-bottom: 0;
    }

    .report-section {
      margin-top: 18px;
    }

    .report-section h2 {
      padding-bottom: 4px;
      border-bottom: 1px solid #d5cab5;
    }

    .analyst-summary {
      margin-top: 20px;
      padding: 13px 15px;
      border: 1px solid #c9b995;
      background: #fcfaf4;
      break-inside: avoid-page;
    }

    .analyst-summary ul {
      margin: 0;
      padding-left: 19px;
    }

    .analyst-summary li {
      margin-bottom: 5px;
    }

    .interpretive-note {
      margin-top: 18px;
      padding: 11px 13px;
      border: 1px solid #d0c4ad;
      background: #fbf8f1;
      color: #56647a;
      font-size: 8.8pt;
      break-inside: avoid-page;
    }

    .interpretive-note h2 {
      font-size: 10.5pt;
    }

    .footer {
      display: flex;
      justify-content: space-between;
      gap: 18px;
      margin-top: 20px;
      padding-top: 8px;
      border-top: 1px solid #b9aa8d;
      color: #425975;
      font-size: 7pt;
      letter-spacing: 0.06em;
    }

    @media screen {
      body {
        padding: 30px;
        background: #e8e6df;
      }

      .report {
        padding: 0.52in 0.58in 0.55in;
        background: #fffdf8;
        box-shadow: 0 16px 48px rgba(0, 0, 0, 0.18);
      }
    }

    @media print {
      body {
        background: #fff !important;
      }

      .report {
        max-width: none;
        margin: 0;
      }
    }
  </style>
</head>
<body>
  <main class="report">
    <div class="brand-line">
      <strong>Lettrology™</strong>
      <span>People · Patterns · Purpose</span>
    </div>

    <header class="report-header">
      <div>
        <p class="eyebrow">Integrated Person Profile Report</p>
        <h1>${escapeHtml(report.title)}</h1>
        <p class="person-name">${escapeHtml(personName)}</p>
      </div>
      <dl>
        <div><dt>Generated</dt><dd>${escapeHtml(generated)}</dd></div>
        <div><dt>Model</dt><dd>${escapeHtml(report.model)}</dd></div>
        <div><dt>Skill</dt><dd>${escapeHtml(report.skillVersion)}</dd></div>
        ${preparedBy}
      </dl>
    </header>

    <section class="executive">
      <h2>Executive Summary</h2>
      <p>${escapeHtml(report.executiveSummary)}</p>
    </section>

    ${sections}

    <section class="analyst-summary">
      <h2>Analyst Summary</h2>
      <ul>${analystSummary}</ul>
    </section>

    <section class="interpretive-note">
      <h2>Interpretive Note</h2>
      <p>${escapeHtml(report.limitations)}</p>
    </section>

    <footer class="footer">
      <span>Lettrology™ Profile Report</span>
      <span>${escapeHtml(personName)}</span>
    </footer>
  </main>
</body>
</html>`);
  printWindow.document.close();

  const triggerPrint = () => {
    printWindow.focus();
    printWindow.print();
  };

  if (printWindow.document.readyState === "complete") {
    window.setTimeout(triggerPrint, 150);
  } else {
    printWindow.addEventListener("load", () => window.setTimeout(triggerPrint, 150), {
      once: true,
    });
  }
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
            <button
              type="button"
              onClick={() => printProfileReport(personName, report, generated)}
            >
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

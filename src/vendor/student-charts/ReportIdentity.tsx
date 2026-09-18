import type { CSSProperties } from "react";
import type { Report } from "./numerology";
function spacedSequence(value: string): string {
  return value.split("").join(" ");
}

function NameNumberStack({ report }: { report: Report }) {
  const letterGroups = report.fullLetters.trim().split(/\s+/);
  const partTotals = report.fullLettersTotalPart.trim().split(/\s+/);
  const style = {
    gridTemplateColumns: `repeat(${letterGroups.length}, max-content) max-content`,
  } as CSSProperties;

  return (
    <div className="name-number-stack" style={style} aria-label="Name numbers and centered reductions">
      {letterGroups.map((value, index) => (
        <code key={`letters-${index}`} style={{ gridColumn: index + 1, gridRow: 1 }}>{value}</code>
      ))}
      <code className="name-grand-total" style={{ gridColumn: letterGroups.length + 1, gridRow: 1 }}>{report.fullLettersTotal}</code>
      {partTotals.map((value, index) => (
        <code className="name-part-total" key={`total-${index}`} style={{ gridColumn: index + 1, gridRow: 2 }}>{value}</code>
      ))}
    </div>
  );
}


export function ReportIdentity({report}:{report:Report}) { return <div className="student-report-identity"><header className="student-report-masthead"><div><h2>Lettrology Timeline</h2><p>Complete chart report · <time>{new Date().toLocaleDateString("en-GB")}</time></p></div><div><span>Ultimate Goal</span><strong>UG: {report.ultimateGoal}</strong></div></header>      <section className="print-report-summary" aria-label="Chart identity and birth calculations">
        <div className="print-summary-identity">
          <code>{report.hdc}  {report.hdcTotal}</code>
          <code>{report.fullName.toUpperCase()}</code>
          <NameNumberStack report={report} />
        </div>
        <div className="print-summary-pmei" aria-label="PMEI"><span className="report-field-label">PMEI</span>
          {report.pmei.map((value, index) => <code key={index}>{["P", "M", "E", "I"][index]} {value}</code>)}
        </div>
        <div className="print-summary-birth"><span className="report-field-label">Birthday (day / month / year)</span>
          <code>{report.dob}</code>
          <code>{report.birthForce}</code>
        </div>
        <div className="print-summary-pincha">
          <code>P: {spacedSequence(report.pin)}</code>
          <code>C: {spacedSequence(report.cha)}</code>
        </div>
        <div className="print-summary-seasons">
          <code>Age : {report.age}</code>
          {report.seasons.map((season) => <code key={season}>{season}</code>)}
        </div>
      </section>
</div>; }

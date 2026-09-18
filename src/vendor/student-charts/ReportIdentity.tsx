import type { CSSProperties } from "react";
import { full, calcString, type Report } from "./numerology";
import { reductionTrail } from "./compounds";
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
        <code title={report.names[index]?.split("").map(letter => `${letter}: ${full(letter)}`).join(" · ")} key={`letters-${index}`} style={{ gridColumn: index + 1, gridRow: 1 }}>{value}</code>
      ))}
      <code className="name-grand-total" style={{ gridColumn: letterGroups.length + 1, gridRow: 1 }}>{report.fullLettersTotal}</code>
      {partTotals.map((value, index) => (
        <code title={full(letterGroups[index])} className="name-part-total" key={`total-${index}`} style={{ gridColumn: index + 1, gridRow: 2 }}>{value}</code>
      ))}
    </div>
  );
}


export function ReportIdentity({report}:{report:Report}) {
 const [day, month, year] = report.dob.split('/').map(part => calcString(part));
 const p1 = calcString(String(day + month)), p2 = calcString(String(day + year));
 const pinnacleTitles = [month + day, day + year, p1 + p2, month + year].map(reductionTrail).join(' · ');
 return <div className="student-report-identity"><header className="student-report-masthead"><div><h2>Lettrology Timeline</h2><p>Complete chart report · <time>{new Date().toLocaleDateString("en-GB")}</time></p></div><div><span>Ultimate Goal</span><strong>UG: {report.ultimateGoal}</strong></div></header>      <section className="print-report-summary" aria-label="Chart identity and birth calculations">
        <div className="print-summary-identity">
          <code title={`Heart’s desire: ${report.hdcTotal}`}>{report.hdc}  {report.hdcTotal}</code>
          <code>{report.fullName.toUpperCase()}</code>
          <NameNumberStack report={report} />
        </div>
        <div className="print-summary-pmei" aria-label="PMEI"><span className="report-field-label">PMEI</span>
          {report.pmei.map((value, index) => <code key={index} title={`Count total: ${reductionTrail(value.split("=")[0].trim().split(/\s+/).reduce((sum, n) => sum + Number(n), 0))}`}>{["P", "M", "E", "I"][index]} {value}</code>)}
        </div>
        <div className="print-summary-birth"><span className="report-field-label">Birthday (day / month / year)</span>
          <code>{report.dob}</code>
          <code title={`Birth date: ${full(report.dob)}; day: ${full(report.dob.split("/")[0])}; month: ${full(report.dob.split("/")[1])}; year: ${full(report.dob.split("/")[2])}`}>{report.birthForce}</code>
        </div>
        <div className="print-summary-pincha">
          <code title={`Pinnacles: ${pinnacleTitles}`}>P: {spacedSequence(report.pin)}</code>
          <code title={`Challenges: |${month} − ${day}|; |${day} − ${year}|; difference of first two challenges; |${month} − ${year}|`}>C: {spacedSequence(report.cha)}</code>
        </div>
        <div className="print-summary-seasons">
          <code>Age : {report.age}</code>
          {report.seasons.map((season) => <code key={season}>{season}</code>)}
        </div>
      </section>
</div>; }

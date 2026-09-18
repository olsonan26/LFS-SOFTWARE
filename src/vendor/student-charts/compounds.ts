import { calcString, Report } from './numerology';

// Explain the source chart's actual operations without changing its digits.
export function reductionTrail(total: number): string {
  const values = [total];
  while (total > 9) {
    total = String(total).split('').reduce((sum, digit) => sum + Number(digit), 0);
    values.push(total);
  }
  return values.join('/');
}
export function yearTrails(report: Report, age: number): Record<string, string> {
  const set = report.getYearSet(age, 1);
  const ess = age === 0 ? 0 : set.names.reduce((sum, name) => sum + calcString(name), 0);
  return {
    ESS: reductionTrail(ess),
    PY: reductionTrail(calcString(report.dob) + age),
    CY: reductionTrail(calcString(report.dob.split('/')[2]) + age),
    COM: age === 0 ? 'Not applicable at birth' : reductionTrail(Number(set.essence) + Number(set.personalYear)),
  };
}
export function monthTrails(report: Report, age: number, month: number): Record<string, string> {
  if (age < 0) return {};
  const year = yearTrails(report, age);
  const set = report.getMonthSet(age);
  const i = month - 1;
  return {
    ESS: year.ESS, PY: year.PY,
    PM: reductionTrail(Number(set.personalYear[i]) + Number('123456789123'[i])),
    PME: reductionTrail(Number(set.personalMonth[i]) + Number(set.essence[i])),
    MCOM: reductionTrail(Number(set.personalMonthEssence[i]) + Number(set.personalMonth[i])),
  };
}

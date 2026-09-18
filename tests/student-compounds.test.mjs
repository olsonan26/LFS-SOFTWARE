import test from 'node:test';
import assert from 'node:assert/strict';
import { Report } from '../src/vendor/student-charts/numerology.ts';
import { yearTrails, monthTrails, reductionTrail } from '../src/vendor/student-charts/compounds.ts';
test('hover trails end in the exact source chart digit across years and months', () => {
 for (const name of ['JULIAN VANCE BLACKWOOD','ALEXANDER JOSHUA OLSON','ROMAN PETER VAUGHAN']) {
  const report = new Report(name, '14/04/1982', 2026);
  for (const age of [0,1,9,42,80,119,150]) {
   const years = report.getYearSet(age,1), trails = yearTrails(report,age);
   for (const [label,key] of [['ESS','essence'],['PY','personalYear'],['CY','calendarYear'],['COM','combined']]) {
    if (age === 0 && label === 'COM') continue;
    assert.equal(trails[label].split('/').at(-1), years[key], `${name} ${age} ${label}`);
   }
   const months = report.getMonthSet(age);
   for(let month=1;month<=12;month++) {
    const values=monthTrails(report,age,month);
    for(const [label,key] of [['ESS','essence'],['PY','personalYear'],['PM','personalMonth'],['PME','personalMonthEssence'],['MCOM','combined']])
     assert.equal(values[label].split('/').at(-1),months[key][month-1]);
   }
  }
 }
 assert.equal(reductionTrail(84),'84/12/3');
});

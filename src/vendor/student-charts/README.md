# Student timeline source

Ported from https://github.com/olsonan26/Chartcreation-for-students at commit `7d12ffb23397b9f8ab0dbafb7a41072b9f2fc63a`.

`numerology.ts` is a byte-for-byte copy of `lib/numerology.ts`. `Timeline.tsx` copies the PrintCharacterRow, ageMarker, PrintYearSection and PrintMonthSection renderers from app/page.tsx. The only renderer additions are optional cell annotation classes/tooltips and exports. Branding and the unrelated source application are not imported.

Source row order, character sequences, age markers, 30/80-year annual widths, 36-month structure and row colors are preserved. The wrapper uses the existing site's controls, adjustable readable font sizing and light chart paper to retain exact source colors in either theme.

Existing forensic calculations remain separate and unchanged. They can differ from the student Report calculations, including age alignment and retained compounds. An outlined timeline cell indicates a forensic pattern for that date; its tooltip and the pattern panel show the original forensic compound. We do not reconstruct compounds from the source's reduced digits.

Daily and Compare People continue using their original renderers and engines.

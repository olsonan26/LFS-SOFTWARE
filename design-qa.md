# Calm investigation workspace — design review

## Outcome
Visual review passed for the inspected home, case, people, chart and timeline layouts. Functional review remains partial: new-person submission requires a manual native-date-input check before merging. This branch is a review draft, not a production release.

## Direction and reference comparison
Compared the supplied investigation-hub reference with the rendered implementation side by side. Retained navy, restrained gold, Cinzel Medium and a persistent workspace sidebar. Deliberately replaced many competing picture cards, badges and counters with one featured case and a readable investigation list. This follows the user's later priority: less clutter and comfortable reading for older users. Reference case facts and photographs were not imported into the sample dataset.

## Implemented
- Home-first navigation; secondary tools grouped under More tools.
- Case trail with expandable branches and selected-record details.
- Person profiles, psychology and connections with progressive disclosure.
- Readable timeline, evidence, documents and media lists with contextual inspectors.
- Persistent reading preferences: three type sizes and dark/light themes.
- Larger controls, visible keyboard focus, modal focus containment, reduced motion and responsive navigation.
- Existing chart calculations retained; fewer years initially and optional event overlays.
- Correct case filtering and actual model bindings; sample research statistics explicitly identified.

## Verification
- Production build and TypeScript check pass.
- Six existing calculation acceptance tests pass; calculation engine files unchanged.
- Browser checked home search, case selection, person profile, chart year navigation and monthly mode, event overlay, timeline category filter, incident filter and context details.
- Browser checked light theme and 23px root text; no page horizontal overflow in that inspected desktop state.
- Inspected 390px layout; opened navigation and selected People successfully.
- New-case creation and empty-case isolation passed.
- New-person submission remains unverified: native date entry through browser automation did not reliably update the field. Required validation prevented submission. Verify using a normal keyboard/calendar before merging.

## Limits
The existing application uses seeded/in-memory case data. This change adds no server persistence, document ingestion, diagnostic psychology claims or fabricated case connections. Cinzel is retained throughout as requested; testing with actual older readers is still needed to establish reading comfort. Dense chart data remains horizontally scrollable. This review does not claim a complete accessibility audit.

## Evidence
See docs/design/hub.png and docs/design/reference-comparison.jpg for the desktop implementation and reference comparison.

# Annual and Monthly student-chart port — September 18, 2026

Final result: passed for this chart change.

Reference: Chartcreation-for-students commit 7d12ffb23397b9f8ab0dbafb7a41072b9f2fc63a. Rendered its original chart functions locally using the same Julian Blackwood fixture, date and year as the destination, and visually inspected both charts. Browser DOM comparison confirmed all Annual focus and Monthly character rows and computed RGB colors equal the source.

Preserved source row/column order, two dotted rows, right-side labels, split age markers, current-age star, three monthly year bands and center-year border. Intentional adaptations: larger readable monospace figures, existing navy/gold controls, neutral light chart paper, original forensic pattern annotations and selected-month outline. Source calculation module is byte-identical. Daily and Compare renderer blocks are byte-identical to the pre-change main branch; their engines are untouched.

Verified year slider arrow navigation, direct year entry to 2140, December-to-January forward rollover, incident reset, and selected-month marking. At a 390px embedded viewport the chart scroll region measured 302px wide with 760px scrollable content, retaining the full source layout. Browser automation timed out during a subsequent mobile selector read; no claim of an exhaustive mobile interaction audit.

Three source calculation fixture tests and six existing forensic acceptance tests pass. TypeScript and production build pass. Existing forensic compounds intentionally remain a separate date-based annotation layer because their calculations differ from the source student chart; both are explicitly labeled.

# Complete chart report
Final result: passed for the full-report addition.

The default Full chart now includes the source Report's full name, vowel/name-number stacks, UG, PMEI, explicit birthday, birth-force calculations, P/C values and seasons. Annual focus, Monthly and Extended Cycles render together in source order, with existing annotations intact. Browser verified all three chart sections present simultaneously, 76 highlighted cells for the sample, no page overflow and working year slider. Inspected the full identity section visually.

Print Chart switches Annual/Monthly views to the complete report before opening print. Print CSS removes controls, releases timeline minimum widths, prevents splitting chart panels, and overrides the previous global black/white print rule to preserve source print colors and highlights. A temporary browser harness applied the compiled print rules for visual inspection; verified zero minimum width on Extended Cycles, no horizontal page overflow, correct print RGB values and retained pink pattern backgrounds. Actual printer pagination was not tested. The temporary harness is removed.

TypeScript and production build pass; existing source calculation fixtures pass. Daily and Compare behavior remains unchanged.


## Unified chart sheet — September 18, 2026
- Matched source report placement: name/PMEI left, birthday center, P/C right, seasons across, then annual, monthly and extended cycles on one continuous paper sheet.
- Added ages above monthly year blocks, inline year/age sliders, fit-sheet and enlarged reading views.
- Preserved vendor calculation file, displayed values, source colors and forensic pattern annotations. Hover titles now explain source reduction trails independently of forensic compounds.
- Browser checked complete sheet fits in one viewport after selecting Fit complete sheet, year slider updates 2024 to 2025 and ages 42/43/44, and compound titles appear in rendered cells.
- Print stylesheet harness: 200 × 277 mm sheet, body height 1047 CSS px, no panel overflow, all four report sections present. A4 portrait with 5 mm margins. Native printer pagination was not exercised.
- TypeScript, production build and four source/compound tests passed; reduction trails checked against displayed digits across three names, seven ages, and all months. Daily and Compare rendering untouched.

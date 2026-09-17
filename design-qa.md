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

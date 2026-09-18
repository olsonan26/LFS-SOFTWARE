# About This Person — Person Dossier

## Status

Canonical UI specification for the Lettrology **About This Person** experience.

The supplied 8.5 × 11 reference artwork is the visual authority. The production implementation must recreate the composition natively in React/CSS and must never use the artwork itself as a runtime background.

## Product intent

Opening **About This Person** should feel like opening a premium investigative personnel file: archival, readable, tactile and precise. The experience is a Lettrology report, not a generic dashboard and not a psychological diagnosis.

## Required structure

1. Lettrology brand header
2. Person portrait / silhouette placeholder
3. PERSON DOSSIER title
4. Full display name, DOB, age when the birth date is exact, and location when recorded
5. Profile metadata and Lettrology Confidential stamp
6. Concise narrative summary
7. Six Core Perspectives in a 3 × 2 desktop grid
8. Elevated Expression and Shadow Expression split inside every perspective
9. At A Glance strip
10. Export / Print Report and Close controls
11. Physical right-side folder tabs: Overview, Patterns, Insights, Notes

## Six Core Perspectives

The names and sources are fixed unless the methodology authority explicitly changes them.

| # | Perspective | Source |
|---|---|---|
| 1 | Initial Impressions | First Name |
| 2 | Personality Description | Full Birth Name |
| 3 | Heart’s Desire | Vowels |
| 4 | Habits & Tendencies | Day of Birth |
| 5 | Natural Skills & Talents | Total Birth Date |
| 6 | Ultimate Goal | Total Name + DOB |

The UI reads these values from the deterministic Lettrology calculation engine. It must not recalculate the methodology independently.

## Interpretation integrity

Narrative meanings live in `src/data/personDossierInterpretations.ts`.

The interpretation registry supports:

1. exact compound trail, for example `29/11/2`
2. detected power/root pair, for example `11/2`
3. final root fallback, for example `2`

Only approved Lettrology wording should be entered. When wording is missing, the UI deliberately shows a calculation-only fallback instead of inventing personality claims.

This separation is intentional:

`Person data → Calculation engine → Six fixed results → Canonical interpretation registry → Person Dossier UI`

## Visual system

- Primary typeface: Cinzel Medium for headings, labels, tabs and major controls
- Paper: warm ivory / cream
- Ink: dark navy / charcoal
- Accent: antique brass / muted gold
- Elevated expression: muted forensic green
- Shadow expression: muted evidence red
- Minimal border radius
- Thin archival rules
- Subtle paper grain produced with CSS
- Layered manila folder sheets behind the report
- No glassmorphism, neon, giant SaaS cards or futuristic effects

## Interaction

- Opened from the selected person profile
- Background application darkens and softens
- Focus is trapped inside the dossier
- `Escape`, top-right X and Close button dismiss it
- Clicking the backdrop dismisses it
- Export / Print invokes the browser print flow
- Overview tab is active in v1; other tabs are visual placeholders for future functionality

## Responsive behavior

### Desktop
Preserve the reference composition as closely as possible: 3 × 2 perspective grid and full archival dossier treatment.

### Tablet
Preserve document styling while allowing vertical scrolling. Perspective cards may become 2 columns.

### Mobile
Use a single-column reading order. Do not shrink text to preserve the desktop grid.

## Print behavior

Target US Letter portrait: **8.5 × 11 inches**.

Print mode hides application navigation, backdrop controls, tabs and close actions. The dossier remains the only visible content and preserves colors/borders using print color adjustment.

## Accessibility

- `role="dialog"` and `aria-modal="true"`
- visible focus states
- keyboard focus trap
- Escape closes
- actual photos receive alt text
- missing photographs use a non-deceptive silhouette placeholder
- exact age is shown only when DOB precision is exact
- missing location is omitted rather than invented

## Acceptance checklist

- [ ] About This Person opens from a selected person profile
- [ ] Visual silhouette matches the 8.5 × 11 canonical reference
- [ ] Six perspectives map to the deterministic calculation engine
- [ ] Compound trails are visible
- [ ] Elevated / Shadow columns are present for all six positions
- [ ] No hard-coded sample person is present
- [ ] No fabricated personal data is displayed
- [ ] No fabricated Lettrology interpretation is generated
- [ ] Portrait uses the real `photoUrl` or a silhouette placeholder
- [ ] Desktop, tablet and mobile layouts remain readable
- [ ] Print output targets Letter portrait
- [ ] Focus trap, Escape, X and Close interactions work
- [ ] The word “Numerology” does not appear in this feature

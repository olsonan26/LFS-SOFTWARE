import type { CompoundValue } from "../core/lettrology-engine/compoundTrail";

/**
 * Canonical narrative content for the About This Person dossier.
 *
 * IMPORTANT: This file intentionally ships without invented Lettrology meanings.
 * Add only Peter/Alex-approved language here. The dossier UI will show a transparent
 * calculation-only fallback whenever a canonical interpretation is unavailable.
 */

export type CorePerspectiveId =
  | "initialImpressions"
  | "personality"
  | "heartDesire"
  | "habits"
  | "naturalSkills"
  | "ultimateGoal";

export interface DossierExpression {
  summary: string;
  traits: string[];
}

export interface DossierInterpretation {
  elevated: DossierExpression;
  shadow: DossierExpression;
  communication?: string[];
  motivations?: string[];
  descriptor?: string;
}

export type DossierInterpretationRegistry = Partial<
  Record<CorePerspectiveId, Record<string, DossierInterpretation>>
>;

/**
 * Lookup keys can be authored at three levels, in this order:
 *  1. exact compound trail, e.g. "29/11/2"
 *  2. detected power/root pair, e.g. "11/2"
 *  3. final root, e.g. "2"
 *
 * This lets the methodology preserve compound-specific meaning without losing
 * a root-level fallback.
 */
export const PERSON_DOSSIER_INTERPRETATIONS: DossierInterpretationRegistry = {};

export function getDossierInterpretation(
  perspective: CorePerspectiveId,
  value: CompoundValue,
): DossierInterpretation | undefined {
  const library = PERSON_DOSSIER_INTERPRETATIONS[perspective];
  if (!library) return undefined;

  const exactTrail = value.trail.join("/");
  const powerPair = value.powerNumber
    ? `${value.powerNumber}/${value.root}`
    : undefined;

  return (
    library[exactTrail] ||
    (powerPair ? library[powerPair] : undefined) ||
    library[String(value.root)]
  );
}

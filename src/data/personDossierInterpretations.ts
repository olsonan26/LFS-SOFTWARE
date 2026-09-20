import type { CompoundValue } from "../core/lettrology-engine/compoundTrail";

/**
 * Narrative content for the About This Person dossier.
 *
 * Supabase is the source of truth for the approved 1–9 root descriptions across
 * the six fixed Lettrology positions. The in-memory registry is intentionally
 * empty at boot and is populated from the database when the dossier opens.
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

interface SupabaseInterpretationRow {
  perspective_id: CorePerspectiveId;
  root_number: number;
  elevated: DossierExpression;
  shadow: DossierExpression;
}

const DEFAULT_SUPABASE_URL = "https://frejicmqhsenqmdmqmfe.supabase.co";
const DEFAULT_SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_evdIHrK_2Kw-1DpJjYgkYg_9sBv5W09";

const SUPABASE_URL =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) || DEFAULT_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ||
  DEFAULT_SUPABASE_PUBLISHABLE_KEY;

/**
 * Optional local fallback registry. Keep this empty unless a vetted offline
 * fallback is deliberately added. Supabase remains the canonical content store.
 */
export const PERSON_DOSSIER_INTERPRETATIONS: DossierInterpretationRegistry = {};

let cachedRegistry: DossierInterpretationRegistry | null = null;
let pendingRegistry: Promise<DossierInterpretationRegistry> | null = null;

function isPerspectiveId(value: unknown): value is CorePerspectiveId {
  return [
    "initialImpressions",
    "personality",
    "heartDesire",
    "habits",
    "naturalSkills",
    "ultimateGoal",
  ].includes(String(value));
}

function normalizeExpression(value: unknown): DossierExpression | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as { summary?: unknown; traits?: unknown };
  if (typeof candidate.summary !== "string" || !Array.isArray(candidate.traits)) {
    return null;
  }
  const traits = candidate.traits.filter(
    (item): item is string => typeof item === "string" && item.trim().length > 0,
  );
  return { summary: candidate.summary, traits };
}

export async function loadDossierInterpretationRegistry(): Promise<DossierInterpretationRegistry> {
  if (cachedRegistry) return cachedRegistry;
  if (pendingRegistry) return pendingRegistry;

  pendingRegistry = (async () => {
    const endpoint = new URL(
      "/rest/v1/person_dossier_interpretations",
      SUPABASE_URL,
    );
    endpoint.searchParams.set(
      "select",
      "perspective_id,root_number,elevated,shadow,status",
    );
    endpoint.searchParams.set("status", "eq.active");
    endpoint.searchParams.set("order", "perspective_id.asc,root_number.asc");

    const response = await fetch(endpoint.toString(), {
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Unable to load dossier interpretations (${response.status}).`);
    }

    const rows = (await response.json()) as SupabaseInterpretationRow[];
    const registry: DossierInterpretationRegistry = {};

    for (const row of rows) {
      if (!isPerspectiveId(row.perspective_id)) continue;
      if (!Number.isInteger(row.root_number) || row.root_number < 1 || row.root_number > 9) {
        continue;
      }

      const elevated = normalizeExpression(row.elevated);
      const shadow = normalizeExpression(row.shadow);
      if (!elevated || !shadow) continue;

      registry[row.perspective_id] ||= {};
      registry[row.perspective_id]![String(row.root_number)] = {
        elevated,
        shadow,
      };
    }

    cachedRegistry = registry;
    return registry;
  })();

  try {
    return await pendingRegistry;
  } finally {
    pendingRegistry = null;
  }
}

/**
 * Lookup keys can be authored at three levels, in this order:
 *  1. exact compound trail, e.g. "29/11/2"
 *  2. detected power/root pair, e.g. "11/2"
 *  3. final root, e.g. "2"
 *
 * The Supabase seed currently contains root-level 1–9 descriptions. This lookup
 * keeps the engine ready for future compound-specific entries without changing
 * the dossier component.
 */
export function getDossierInterpretation(
  perspective: CorePerspectiveId,
  value: CompoundValue,
  registry: DossierInterpretationRegistry = PERSON_DOSSIER_INTERPRETATIONS,
): DossierInterpretation | undefined {
  const library = registry[perspective];
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

import type {
  DossierPerspectiveId,
  DossierReportSection,
} from "../types";
import {
  ensureCloudSession,
  getStoredCloudSession,
} from "./cloudWorkspace";

const DEFAULT_SUPABASE_URL = "https://frejicmqhsenqmdmqmfe.supabase.co";
const DEFAULT_SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_evdIHrK_2Kw-1DpJjYgkYg_9sBv5W09";

const SUPABASE_URL =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) || DEFAULT_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ||
  DEFAULT_SUPABASE_PUBLISHABLE_KEY;

export interface ProfileReportPerspectiveInput {
  id: DossierPerspectiveId;
  title: string;
  source: string;
  calculation: string;
  elevated: string[];
  shadow: string[];
}

export interface ProfileReportGenerationInput {
  person: {
    displayName: string;
    roleInCase: string;
  };
  perspectives: ProfileReportPerspectiveInput[];
}

export interface ProfileReportGenerationResult {
  title: string;
  executiveSummary: string;
  sections: DossierReportSection[];
  analystSummary: string[];
  limitations: string;
  model: string;
  skillVersion: string;
}

export async function generateProfileReport(
  input: ProfileReportGenerationInput,
): Promise<ProfileReportGenerationResult> {
  const stored = getStoredCloudSession();
  const session = await ensureCloudSession(stored);
  if (!session) {
    throw new Error(
      "Sign in to the Shared Cloud workspace before generating an AI profile report.",
    );
  }

  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/generate-profile-report`,
    {
      method: "POST",
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
  );

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      data?.error ||
        data?.message ||
        `Profile report generation failed (${response.status}).`,
    );
  }

  return data as ProfileReportGenerationResult;
}

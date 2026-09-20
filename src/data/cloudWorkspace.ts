import type {
  CaseRecord,
  EvidenceRecord,
  EventRecord,
  HypothesisRecord,
  PersonRecord,
} from "../types";

const DEFAULT_SUPABASE_URL = "https://frejicmqhsenqmdmqmfe.supabase.co";
const DEFAULT_SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_evdIHrK_2Kw-1DpJjYgkYg_9sBv5W09";

const SUPABASE_URL =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) || DEFAULT_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ||
  DEFAULT_SUPABASE_PUBLISHABLE_KEY;

const SESSION_KEY = "lfs_cloud_session_v1";

export type SharedRecordType =
  | "case"
  | "person"
  | "event"
  | "evidence"
  | "hypothesis";

export interface CloudUser {
  id: string;
  email: string;
}

export interface CloudSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: CloudUser;
}

export interface SharedRecord {
  record_type: SharedRecordType;
  record_id: string;
  payload:
    | CaseRecord
    | PersonRecord
    | EventRecord
    | EvidenceRecord
    | HypothesisRecord;
  updated_at: string;
}

export interface CloudCollaborator {
  email: string;
  role: "owner" | "editor";
  created_at: string;
}

function saveSession(session: CloudSession | null) {
  if (typeof window === "undefined") return;
  if (!session) {
    window.localStorage.removeItem(SESSION_KEY);
    return;
  }
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function normalizeAuthResponse(data: any): CloudSession | null {
  const accessToken = data?.access_token;
  const refreshToken = data?.refresh_token;
  const user = data?.user;
  if (!accessToken || !refreshToken || !user?.id || !user?.email) return null;

  const expiresAt =
    typeof data.expires_at === "number"
      ? data.expires_at * 1000
      : Date.now() + Number(data.expires_in || 3600) * 1000;

  return {
    accessToken,
    refreshToken,
    expiresAt,
    user: { id: user.id, email: String(user.email).toLowerCase() },
  };
}

async function authRequest(path: string, body: Record<string, unknown>) {
  const response = await fetch(`${SUPABASE_URL}${path}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.msg || data?.message || data?.error_description || `Authentication failed (${response.status}).`);
  }
  return data;
}

export async function signInCloud(email: string, password: string): Promise<CloudSession> {
  const data = await authRequest("/auth/v1/token?grant_type=password", {
    email: email.trim().toLowerCase(),
    password,
  });
  const session = normalizeAuthResponse(data);
  if (!session) throw new Error("Supabase did not return a usable session.");
  saveSession(session);
  return session;
}

export async function signUpCloud(
  email: string,
  password: string,
): Promise<{ session: CloudSession | null; confirmationRequired: boolean }> {
  const data = await authRequest("/auth/v1/signup", {
    email: email.trim().toLowerCase(),
    password,
  });
  const session = normalizeAuthResponse(data);
  if (session) saveSession(session);
  return { session, confirmationRequired: !session };
}

export async function sendPasswordReset(email: string): Promise<void> {
  await authRequest("/auth/v1/recover", {
    email: email.trim().toLowerCase(),
  });
}

export function signOutCloud() {
  saveSession(null);
}

export function getStoredCloudSession(): CloudSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CloudSession;
    if (!parsed?.accessToken || !parsed?.refreshToken || !parsed?.user?.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function ensureCloudSession(
  session: CloudSession | null,
): Promise<CloudSession | null> {
  if (!session) return null;
  if (session.expiresAt - Date.now() > 90_000) return session;

  try {
    const data = await authRequest("/auth/v1/token?grant_type=refresh_token", {
      refresh_token: session.refreshToken,
    });
    const refreshed = normalizeAuthResponse(data);
    if (!refreshed) throw new Error("Unable to refresh session.");
    saveSession(refreshed);
    return refreshed;
  } catch {
    saveSession(null);
    return null;
  }
}

async function restRequest<T>(
  session: CloudSession,
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const validSession = await ensureCloudSession(session);
  if (!validSession) throw new Error("Cloud session expired. Sign in again.");

  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${validSession.accessToken}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data?.message || data?.details || `Cloud request failed (${response.status}).`);
  }

  if (response.status === 204) return undefined as T;
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export async function loadSharedRecords(session: CloudSession): Promise<SharedRecord[]> {
  return restRequest<SharedRecord[]>(
    session,
    "lfs_records?select=record_type,record_id,payload,updated_at&order=updated_at.asc",
  );
}

export async function upsertSharedRecord(
  session: CloudSession,
  recordType: SharedRecordType,
  recordId: string,
  payload: SharedRecord["payload"],
): Promise<void> {
  await restRequest<void>(
    session,
    "lfs_records?on_conflict=record_type,record_id",
    {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({
        record_type: recordType,
        record_id: recordId,
        payload,
      }),
    },
  );
}

export async function listCollaborators(
  session: CloudSession,
): Promise<CloudCollaborator[]> {
  return restRequest<CloudCollaborator[]>(
    session,
    "lfs_collaborators?select=email,role,created_at&order=created_at.asc",
  );
}

export async function addCollaborator(
  session: CloudSession,
  email: string,
): Promise<void> {
  await restRequest<void>(session, "lfs_collaborators", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      role: "editor",
      added_by: session.user.id,
    }),
  });
}

export async function removeCollaborator(
  session: CloudSession,
  email: string,
): Promise<void> {
  const encoded = encodeURIComponent(email.trim().toLowerCase());
  await restRequest<void>(session, `lfs_collaborators?email=eq.${encoded}`, {
    method: "DELETE",
    headers: { Prefer: "return=minimal" },
  });
}

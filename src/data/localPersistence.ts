export const LFS_STORAGE_KEYS = {
  cases: "lfs_cases_v1",
  people: "lfs_people_v1",
  events: "lfs_events_v1",
  evidence: "lfs_evidence_v1",
  hypotheses: "lfs_hypotheses_v1",
  activeCaseId: "lfs_active_case_id_v1",
  currentUserId: "lfs_current_user_id_v1",
} as const;

export function loadStoredValue<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveStoredValue<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Unable to persist ${key}.`, error);
  }
}

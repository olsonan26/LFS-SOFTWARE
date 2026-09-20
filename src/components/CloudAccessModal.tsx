import React, { useEffect, useState } from "react";
import { Cloud, RefreshCw, ShieldCheck, UserPlus, X } from "lucide-react";
import {
  addCollaborator,
  listCollaborators,
  removeCollaborator,
  sendPasswordReset,
  signInCloud,
  signOutCloud,
  signUpCloud,
  type CloudCollaborator,
  type CloudSession,
} from "../data/cloudWorkspace";
import { useDialogFocus } from "./useDialogFocus";

interface Props {
  open: boolean;
  onClose: () => void;
  session: CloudSession | null;
  cloudStatus: "signed-out" | "connecting" | "synced" | "denied" | "error";
  lastSyncedAt?: string;
  onSessionChange: (session: CloudSession | null) => void;
  onSyncNow: () => Promise<void>;
}

export function CloudAccessModal({
  open,
  onClose,
  session,
  cloudStatus,
  lastSyncedAt,
  onSessionChange,
  onSyncNow,
}: Props) {
  const dialogRef = useDialogFocus(open, onClose);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [collaboratorEmail, setCollaboratorEmail] = useState("");
  const [collaborators, setCollaborators] = useState<CloudCollaborator[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const currentCollaborator = collaborators.find(
    (item) => item.email === session?.user.email,
  );
  const isOwner = currentCollaborator?.role === "owner";

  useEffect(() => {
    if (!open || !session) return;
    setBusy(true);
    listCollaborators(session)
      .then((rows) => {
        setCollaborators(rows);
        setMessage("");
      })
      .catch((error) => setMessage(error instanceof Error ? error.message : String(error)))
      .finally(() => setBusy(false));
  }, [open, session]);

  if (!open) return null;

  const handleAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      if (mode === "signin") {
        const next = await signInCloud(email, password);
        onSessionChange(next);
        setPassword("");
      } else {
        const result = await signUpCloud(email, password);
        if (result.session) {
          onSessionChange(result.session);
          setPassword("");
        } else {
          setMessage("Account created. Confirm the email from Supabase, then sign in here.");
          setMode("signin");
          setPassword("");
        }
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  };

  const refreshCollaborators = async () => {
    if (!session) return;
    const rows = await listCollaborators(session);
    setCollaborators(rows);
  };

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Shared workspace"
      className="fixed inset-0 z-[1500] flex items-center justify-center bg-black/65 backdrop-blur-sm p-4"
    >
      <div className="modal-panel w-full max-w-xl rounded-lg border-2 border-slate-400 bg-white p-6 text-slate-950 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-4 border-b-2 border-slate-200 pb-3">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider">
              <Cloud className="h-5 w-5 text-amber-600" /> Shared LFS Workspace
            </h3>
            <p className="mt-1 text-xs font-semibold text-slate-600">
              Cases, people and checked dossier traits can sync between approved collaborators.
            </p>
          </div>
          <button aria-label="Close shared workspace" onClick={onClose} className="p-1 text-slate-600 hover:text-black">
            <X className="h-5 w-5" />
          </button>
        </div>

        {!session ? (
          <>
            <div className="segmented mb-4">
              <button aria-pressed={mode === "signin"} onClick={() => setMode("signin")}>Sign in</button>
              <button aria-pressed={mode === "signup"} onClick={() => setMode("signup")}>Create account</button>
            </div>
            <form onSubmit={handleAuth} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-black uppercase">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-md border-2 border-slate-300 bg-white p-2.5 font-semibold"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-black uppercase">Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-md border-2 border-slate-300 bg-white p-2.5 font-semibold"
                />
              </div>
              {message && <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-xs font-semibold">{message}</div>}
              <div className="flex items-center justify-between gap-3 pt-1">
                {mode === "signin" ? (
                  <button
                    type="button"
                    className="text-button"
                    onClick={async () => {
                      if (!email.trim()) {
                        setMessage("Enter your email first.");
                        return;
                      }
                      try {
                        await sendPasswordReset(email);
                        setMessage("Password reset email sent.");
                      } catch (error) {
                        setMessage(error instanceof Error ? error.message : String(error));
                      }
                    }}
                  >
                    Forgot password
                  </button>
                ) : <span />}
                <button disabled={busy} type="submit" className="primary-button">
                  {busy ? "Working…" : mode === "signin" ? "Sign in to shared workspace" : "Create account"}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="space-y-4">
            <section className="rounded-lg border-2 border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 font-black">
                    <ShieldCheck className="h-5 w-5 text-emerald-700" />
                    {session.user.email}
                  </div>
                  <p className="mt-1 text-xs font-semibold text-slate-600">
                    Status: {cloudStatus === "synced" ? "Shared workspace connected" : cloudStatus === "denied" ? "Signed in, but this email is not an approved collaborator" : cloudStatus === "connecting" ? "Syncing…" : "Cloud connection needs attention"}
                  </p>
                  {lastSyncedAt && <p className="mt-1 text-[11px] text-slate-500">Last synced {lastSyncedAt}</p>}
                </div>
                <button
                  className="secondary-button"
                  disabled={busy || cloudStatus === "denied"}
                  onClick={async () => {
                    setBusy(true);
                    try {
                      await onSyncNow();
                      await refreshCollaborators();
                    } catch (error) {
                      setMessage(error instanceof Error ? error.message : String(error));
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  <RefreshCw size={17} /> Sync now
                </button>
              </div>
            </section>

            {message && <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-xs font-semibold">{message}</div>}

            {cloudStatus !== "denied" && (
              <section>
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider">Approved collaborators</h4>
                  <span className="text-xs font-semibold text-slate-500">{collaborators.length}</span>
                </div>
                <div className="space-y-2">
                  {collaborators.map((item) => (
                    <div key={item.email} className="flex items-center justify-between gap-3 rounded-md border border-slate-200 p-2.5">
                      <div>
                        <strong className="text-xs">{item.email}</strong>
                        <div className="text-[11px] uppercase tracking-wider text-slate-500">{item.role}</div>
                      </div>
                      {isOwner && item.role !== "owner" && (
                        <button
                          className="text-button"
                          onClick={async () => {
                            setBusy(true);
                            try {
                              await removeCollaborator(session, item.email);
                              await refreshCollaborators();
                            } catch (error) {
                              setMessage(error instanceof Error ? error.message : String(error));
                            } finally {
                              setBusy(false);
                            }
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {isOwner && (
              <form
                className="rounded-lg border-2 border-amber-200 bg-amber-50/60 p-4"
                onSubmit={async (event) => {
                  event.preventDefault();
                  if (!collaboratorEmail.trim()) return;
                  setBusy(true);
                  setMessage("");
                  try {
                    await addCollaborator(session, collaboratorEmail);
                    setCollaboratorEmail("");
                    await refreshCollaborators();
                    setMessage("Collaborator approved. They can create/sign in with that email and see the shared workspace.");
                  } catch (error) {
                    setMessage(error instanceof Error ? error.message : String(error));
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider">
                  <UserPlus size={17} /> Add Peter or another collaborator
                </h4>
                <p className="mt-1 text-xs text-slate-600">Enter the exact email they will use to sign in.</p>
                <div className="mt-3 flex gap-2">
                  <input
                    type="email"
                    required
                    value={collaboratorEmail}
                    onChange={(event) => setCollaboratorEmail(event.target.value)}
                    placeholder="person@example.com"
                    className="min-w-0 flex-1 rounded-md border-2 border-slate-300 bg-white p-2.5 text-xs font-semibold"
                  />
                  <button disabled={busy} type="submit" className="secondary-button">Approve</button>
                </div>
              </form>
            )}

            <div className="flex justify-end">
              <button
                className="text-button"
                onClick={() => {
                  signOutCloud();
                  onSessionChange(null);
                  setCollaborators([]);
                  setMessage("");
                }}
              >
                Sign out of shared workspace
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

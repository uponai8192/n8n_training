"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type InviteData = {
  id: string;
  email: string;
  token: string;
  used: boolean;
  createdAt: string;
  expiresAt: string;
};

export function InvitesClient({ invites: initialInvites }: { invites: InviteData[] }) {
  const router = useRouter();
  const [invites, setInvites] = useState(initialInvites);
  const [email, setEmail] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCreating(true);

    const res = await fetch("/api/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to create invite.");
      setCreating(false);
      return;
    }

    setInvites([data, ...invites]);
    setEmail("");
    setCreating(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/invites?id=${id}`, { method: "DELETE" });
    setInvites(invites.filter((i) => i.id !== id));
    router.refresh();
  }

  function getInviteUrl(token: string) {
    return `${window.location.origin}/register?token=${token}`;
  }

  function handleCopy(id: string, token: string) {
    navigator.clipboard.writeText(getInviteUrl(token));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const activeInvites = invites.filter((i) => !i.used && new Date() < new Date(i.expiresAt));
  const usedInvites = invites.filter((i) => i.used);
  const expiredInvites = invites.filter((i) => !i.used && new Date() >= new Date(i.expiresAt));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Partner Invites</h1>
        <p className="text-slate-400 mt-1">
          Generate invite links to share with partners. Links expire after 7 days.
        </p>
      </div>

      {/* Create invite */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
        <h2 className="text-base font-semibold text-white mb-4">Create New Invite</h2>
        <form onSubmit={handleCreate} className="flex gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="partner@example.com"
            className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm transition"
          />
          <button
            type="submit"
            disabled={creating}
            className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition whitespace-nowrap"
          >
            {creating ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Generate Link
              </>
            )}
          </button>
        </form>
        {error && (
          <p className="mt-2 text-sm text-red-400">{error}</p>
        )}
      </div>

      {/* Active invites */}
      {activeInvites.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
            Active ({activeInvites.length})
          </h3>
          <div className="space-y-3">
            {activeInvites.map((invite) => (
              <div key={invite.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-white">{invite.email}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Expires {new Date(invite.expiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(invite.id, invite.token)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition ${
                        copiedId === invite.id
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : "bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600"
                      }`}
                    >
                      {copiedId === invite.id ? (
                        <>
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Copied!
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copy Link
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(invite.id)}
                      className="p-1.5 text-slate-600 hover:text-red-400 rounded-lg transition"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                {/* Show the invite URL */}
                <div className="mt-3 flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-2">
                  <code className="text-xs text-slate-400 flex-1 truncate font-mono">
                    {typeof window !== "undefined" ? getInviteUrl(invite.token) : `[URL]/register?token=${invite.token}`}
                  </code>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Used invites */}
      {usedInvites.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Used ({usedInvites.length})
          </h3>
          <div className="space-y-2">
            {usedInvites.map((invite) => (
              <div key={invite.id} className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-800/50 rounded-lg opacity-60">
                <div>
                  <p className="text-sm text-slate-400">{invite.email}</p>
                  <p className="text-xs text-slate-600">
                    Used on {new Date(invite.expiresAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-xs bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  Accepted
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expired invites */}
      {expiredInvites.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-3">
            Expired ({expiredInvites.length})
          </h3>
          <div className="space-y-2">
            {expiredInvites.map((invite) => (
              <div key={invite.id} className="flex items-center justify-between p-3 bg-slate-900/30 border border-slate-800/30 rounded-lg opacity-50">
                <div>
                  <p className="text-sm text-slate-500">{invite.email}</p>
                  <p className="text-xs text-slate-600">
                    Expired {new Date(invite.expiresAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(invite.id)}
                  className="text-xs text-slate-700 hover:text-red-500 transition"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {invites.length === 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
          <svg className="w-8 h-8 text-slate-700 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p className="text-slate-500 text-sm">No invites yet. Create your first one above.</p>
        </div>
      )}
    </div>
  );
}

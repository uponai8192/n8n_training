"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import Link from "next/link";

type UserData = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  completedCount: number;
  totalExercises: number;
  completionPercent: number;
  completions: {
    exerciseId: string;
    exerciseTitle: string;
    exerciseDifficulty: string;
    exerciseOrder: number;
    exerciseSlug: string;
    completedAt: string;
  }[];
  incompleteExercises: {
    id: string;
    title: string;
    slug: string;
    order: number;
    difficulty: string;
  }[];
};

export function PartnersClient({
  users,
  currentUserId,
}: {
  users: UserData[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  );

  async function handleDelete(id: string) {
    if (!confirm("Remove this user? Their progress will be deleted.")) return;
    setDeleting(id);
    const res = await fetch(`/api/admin/partners?id=${id}`, { method: "DELETE" });
    setDeleting(null);
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Failed to delete user.");
      return;
    }
    if (selectedUser?.id === id) setSelectedUser(null);
    router.refresh();
  }

  async function handleRoleChange(id: string, role: string) {
    setUpdatingRole(id);
    const res = await fetch("/api/admin/partners", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, role }),
    });
    setUpdatingRole(null);

    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Failed to update role.");
      return;
    }

    if (selectedUser?.id === id) {
      setSelectedUser({ ...selectedUser, role });
    }
    router.refresh();
  }

  function roleBadge(role: string) {
    return role === "ADMIN"
      ? "bg-purple-500/10 border-purple-500/20 text-purple-300"
      : "bg-blue-500/10 border-blue-500/20 text-blue-300";
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-slate-400 mt-1">{users.length} users in the portal</p>
        </div>
        <Link
          href="/admin/invites"
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Invite User
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
        />
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* User list */}
        <div className="lg:col-span-2 space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
              <p className="text-slate-500 text-sm">No users found.</p>
            </div>
          ) : (
            filtered.map((user) => (
              <button
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selectedUser?.id === user.id
                    ? "bg-slate-800 border-orange-500/40"
                    : "bg-slate-900 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-orange-400">{user.name[0].toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white truncate">{user.name}</p>
                      <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border ${roleBadge(user.role)}`}>
                        {user.role}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                  <span className="text-sm font-bold text-white flex-shrink-0">{user.completionPercent}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      user.completionPercent === 100
                        ? "bg-emerald-500"
                        : "bg-gradient-to-r from-orange-500 to-orange-400"
                    }`}
                    style={{ width: `${user.completionPercent}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1.5">
                  {user.completedCount}/{user.totalExercises} exercises
                </p>
              </button>
            ))
          )}
        </div>

        {/* User detail */}
        <div className="lg:col-span-3">
          {!selectedUser ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center h-full flex items-center justify-center">
              <div>
                <svg className="w-8 h-8 text-slate-700 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <p className="text-slate-500 text-sm">Select a user to view details</p>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              {/* Header */}
              <div className="p-5 border-b border-slate-800">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                      <span className="text-lg font-bold text-orange-400">{selectedUser.name[0].toUpperCase()}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white">{selectedUser.name}</h3>
                        <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border ${roleBadge(selectedUser.role)}`}>
                          {selectedUser.role}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400">{selectedUser.email}</p>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Joined {new Date(selectedUser.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={selectedUser.role}
                      onChange={(e) => handleRoleChange(selectedUser.id, e.target.value)}
                      disabled={updatingRole === selectedUser.id || (selectedUser.id === currentUserId && selectedUser.role === "ADMIN")}
                      className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-60"
                    >
                      <option value="PARTNER">Partner</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                    <button
                      onClick={() => handleDelete(selectedUser.id)}
                      disabled={deleting === selectedUser.id || selectedUser.id === currentUserId}
                      className="text-xs text-slate-600 hover:text-red-400 disabled:opacity-50 transition"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-slate-500">Progress</span>
                    <span className="text-sm font-bold text-white">
                      {selectedUser.completionPercent}% ({selectedUser.completedCount}/{selectedUser.totalExercises})
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        selectedUser.completionPercent === 100
                          ? "bg-emerald-500"
                          : "bg-gradient-to-r from-orange-500 to-orange-400"
                      }`}
                      style={{ width: `${selectedUser.completionPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Completed */}
              <div className="p-5">
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Completed ({selectedUser.completions.length})
                </h4>
                {selectedUser.completions.length === 0 ? (
                  <p className="text-xs text-slate-600">No exercises completed yet.</p>
                ) : (
                  <div className="space-y-2 mb-5">
                    {selectedUser.completions.map((c) => (
                      <div key={c.exerciseId} className="flex items-center gap-3 p-2.5 bg-emerald-500/5 border border-emerald-500/15 rounded-lg">
                        <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-300 truncate">{c.exerciseTitle}</p>
                          <p className="text-xs text-slate-600">
                            {new Date(c.completedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <DifficultyBadge difficulty={c.exerciseDifficulty} />
                      </div>
                    ))}
                  </div>
                )}

                {selectedUser.incompleteExercises.length > 0 && (
                  <>
                    <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Remaining ({selectedUser.incompleteExercises.length})
                    </h4>
                    <div className="space-y-2">
                      {selectedUser.incompleteExercises.map((e) => (
                        <div key={e.id} className="flex items-center gap-3 p-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg">
                          <span className="text-xs text-slate-600 w-4 text-right flex-shrink-0">{e.order}</span>
                          <p className="text-xs text-slate-400 flex-1 truncate">{e.title.replace(/Exercise \d+: /, "")}</p>
                          <DifficultyBadge difficulty={e.difficulty} />
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

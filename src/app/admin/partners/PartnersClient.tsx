"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import Link from "next/link";

type PartnerData = {
  id: string;
  name: string;
  email: string;
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

export function PartnersClient({ partners }: { partners: PartnerData[] }) {
  const router = useRouter();
  const [selectedPartner, setSelectedPartner] = useState<PartnerData | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = partners.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase())
  );

  async function handleDelete(id: string) {
    if (!confirm("Remove this partner? Their progress will be deleted.")) return;
    setDeleting(id);
    await fetch(`/api/admin/partners?id=${id}`, { method: "DELETE" });
    setDeleting(null);
    if (selectedPartner?.id === id) setSelectedPartner(null);
    router.refresh();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Partners</h1>
          <p className="text-slate-400 mt-1">{partners.length} partners enrolled</p>
        </div>
        <Link
          href="/admin/invites"
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Invite Partner
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search partners..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
        />
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Partner list */}
        <div className="lg:col-span-2 space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
              <p className="text-slate-500 text-sm">No partners found.</p>
            </div>
          ) : (
            filtered.map((partner) => (
              <button
                key={partner.id}
                onClick={() => setSelectedPartner(partner)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selectedPartner?.id === partner.id
                    ? "bg-slate-800 border-orange-500/40"
                    : "bg-slate-900 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-orange-400">{partner.name[0].toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{partner.name}</p>
                    <p className="text-xs text-slate-500 truncate">{partner.email}</p>
                  </div>
                  <span className="text-sm font-bold text-white flex-shrink-0">{partner.completionPercent}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      partner.completionPercent === 100
                        ? "bg-emerald-500"
                        : "bg-gradient-to-r from-orange-500 to-orange-400"
                    }`}
                    style={{ width: `${partner.completionPercent}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1.5">
                  {partner.completedCount}/{partner.totalExercises} exercises
                </p>
              </button>
            ))
          )}
        </div>

        {/* Partner detail */}
        <div className="lg:col-span-3">
          {!selectedPartner ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center h-full flex items-center justify-center">
              <div>
                <svg className="w-8 h-8 text-slate-700 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <p className="text-slate-500 text-sm">Select a partner to view details</p>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              {/* Header */}
              <div className="p-5 border-b border-slate-800">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                      <span className="text-lg font-bold text-orange-400">{selectedPartner.name[0].toUpperCase()}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{selectedPartner.name}</h3>
                      <p className="text-sm text-slate-400">{selectedPartner.email}</p>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Joined {new Date(selectedPartner.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(selectedPartner.id)}
                    disabled={deleting === selectedPartner.id}
                    className="text-xs text-slate-600 hover:text-red-400 transition"
                  >
                    Remove
                  </button>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-slate-500">Progress</span>
                    <span className="text-sm font-bold text-white">
                      {selectedPartner.completionPercent}% ({selectedPartner.completedCount}/{selectedPartner.totalExercises})
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        selectedPartner.completionPercent === 100
                          ? "bg-emerald-500"
                          : "bg-gradient-to-r from-orange-500 to-orange-400"
                      }`}
                      style={{ width: `${selectedPartner.completionPercent}%` }}
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
                  Completed ({selectedPartner.completions.length})
                </h4>
                {selectedPartner.completions.length === 0 ? (
                  <p className="text-xs text-slate-600">No exercises completed yet.</p>
                ) : (
                  <div className="space-y-2 mb-5">
                    {selectedPartner.completions.map((c) => (
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

                {selectedPartner.incompleteExercises.length > 0 && (
                  <>
                    <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Remaining ({selectedPartner.incompleteExercises.length})
                    </h4>
                    <div className="space-y-2">
                      {selectedPartner.incompleteExercises.map((e) => (
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

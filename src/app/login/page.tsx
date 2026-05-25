"use client";

import { useState, FormEvent, Suspense } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Mode = "magic" | "password";
type MagicState = "idle" | "sent" | "loading";

function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("magic");

  // Magic link state
  const [magicEmail, setMagicEmail] = useState("");
  const [magicState, setMagicState] = useState<MagicState>("idle");
  const [devLink, setDevLink] = useState<string | null>(null);
  const [magicError, setMagicError] = useState("");

  // Password state
  const [pwEmail, setPwEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  async function handleMagicSubmit(e: FormEvent) {
    e.preventDefault();
    setMagicError("");
    setMagicState("loading");

    const res = await fetch("/api/auth/magic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: magicEmail }),
    });
    const data = await res.json();

    if (!res.ok) {
      setMagicError(data.error ?? "Failed to send magic link.");
      setMagicState("idle");
      return;
    }

    if (data.devLink) setDevLink(data.devLink);
    setMagicState("sent");
  }

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    setPwError("");
    setPwLoading(true);

    const result = await signIn("credentials", {
      email: pwEmail.toLowerCase(),
      password,
      redirect: false,
    });

    if (result?.error) {
      setPwError("Invalid email or password.");
      setPwLoading(false);
      return;
    }

    const session = await getSession();
    router.push(session?.user.role === "ADMIN" ? "/admin" : "/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-500 mb-4">
            <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">N8N + UponAI</h1>
          <p className="text-slate-400 mt-1">Exercise Platform</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl">

          {/* ── MAGIC LINK MODE ── */}
          {mode === "magic" && (
            <>
              {magicState !== "sent" ? (
                <>
                  <h2 className="text-xl font-semibold text-white mb-1">Sign in</h2>
                  <p className="text-sm text-slate-400 mb-6">We&apos;ll send you a one-click sign-in link. No password needed.</p>

                  <form onSubmit={handleMagicSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Email address</label>
                      <input
                        type="email"
                        value={magicEmail}
                        onChange={(e) => setMagicEmail(e.target.value)}
                        required
                        autoFocus
                        className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                        placeholder="you@example.com"
                      />
                    </div>

                    {magicError && (
                      <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
                        <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm text-red-400">{magicError}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={magicState === "loading"}
                      className="w-full py-2.5 px-4 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white font-semibold rounded-lg transition focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                    >
                      {magicState === "loading" ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Sending…
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Send Magic Link
                        </span>
                      )}
                    </button>
                  </form>
                </>
              ) : (
                /* Sent confirmation */
                <div className="text-center py-2">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/20 mb-4">
                    <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-white mb-2">Check your email</h2>
                  <p className="text-sm text-slate-400 mb-1">
                    We sent a sign-in link to
                  </p>
                  <p className="text-sm font-medium text-white mb-5">{magicEmail}</p>
                  <p className="text-xs text-slate-500 mb-2">Link expires in 60 minutes. Check your spam folder if you don&apos;t see it.</p>
                  <p className="text-xs text-amber-400 mb-6">If you requested more than one link, only the newest email will work.</p>

                  {/* Dev mode: show the link directly */}
                  {devLink && (
                    <div className="bg-slate-900 border border-orange-500/30 rounded-xl p-4 mb-4 text-left">
                      <p className="text-xs text-orange-400 font-medium mb-2">Dev mode — click to sign in:</p>
                      <Link
                        href={devLink}
                        className="text-xs text-orange-300 hover:text-orange-200 break-all underline underline-offset-2"
                      >
                        {devLink}
                      </Link>
                    </div>
                  )}

                  <button
                    onClick={() => { setMagicState("idle"); setDevLink(null); setMagicError(""); }}
                    className="text-sm text-slate-400 hover:text-slate-300 transition"
                  >
                    Use a different email
                  </button>
                </div>
              )}

              <div className="mt-6 pt-5 border-t border-slate-700 text-center">
                <button
                  onClick={() => setMode("password")}
                  className="text-xs text-slate-500 hover:text-slate-400 transition"
                >
                  Admin? Sign in with password →
                </button>
              </div>
            </>
          )}

          {/* ── PASSWORD MODE ── */}
          {mode === "password" && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() => setMode("magic")}
                  className="p-1.5 text-slate-500 hover:text-slate-300 rounded-lg transition"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h2 className="text-xl font-semibold text-white">Admin sign in</h2>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Email address</label>
                  <input
                    type="email"
                    value={pwEmail}
                    onChange={(e) => setPwEmail(e.target.value)}
                    required
                    autoFocus
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                    placeholder="admin@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                    placeholder="••••••••"
                  />
                </div>

                {pwError && (
                  <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
                    <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-red-400">{pwError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={pwLoading}
                  className="w-full py-2.5 px-4 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white font-semibold rounded-lg transition focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                >
                  {pwLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Signing in…
                    </span>
                  ) : "Sign in"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

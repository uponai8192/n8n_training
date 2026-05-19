"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isAdmin = session?.user.role === "ADMIN";

  const navLinks = isAdmin
    ? [
        { href: "/admin", label: "Dashboard" },
        { href: "/admin/partners", label: "Partners" },
        { href: "/admin/invites", label: "Invites" },
        { href: "/admin/exercises", label: "Exercises" },
      ]
    : [
        { href: "/dashboard", label: "Exercises" },
        { href: "/dashboard/progress", label: "My Progress" },
      ];

  return (
    <nav className="bg-slate-900 border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={isAdmin ? "/admin" : "/dashboard"} className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center flex-shrink-0">
              <svg className="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-bold text-white text-sm hidden sm:block">N8N + RetellAI</span>
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  pathname === link.href || pathname.startsWith(link.href + "/")
                    ? "bg-slate-700 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* User menu */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                <span className="text-xs font-bold text-orange-400">
                  {session?.user.name?.[0]?.toUpperCase()}
                </span>
              </div>
              <div className="text-right hidden md:block">
                <p className="text-xs font-medium text-white leading-none">{session?.user.name}</p>
                <p className="text-xs text-slate-500 leading-none mt-0.5">
                  {isAdmin ? "Admin" : "Partner"}
                </p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white border border-slate-700 hover:border-slate-600 rounded-lg transition"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

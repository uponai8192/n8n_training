const CONFIG = {
  BEGINNER: { label: "Beginner", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  INTERMEDIATE: { label: "Intermediate", className: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  ADVANCED: { label: "Advanced", className: "bg-orange-500/15 text-orange-400 border-orange-500/30" },
  EXPERT: { label: "Expert", className: "bg-red-500/15 text-red-400 border-red-500/30" },
};

export function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const config = CONFIG[difficulty as keyof typeof CONFIG] ?? CONFIG.BEGINNER;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}>
      {config.label}
    </span>
  );
}

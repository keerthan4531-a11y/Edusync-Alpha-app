import { LiquidGlassCard } from "@/components/ui/liquid-glass-card"

interface MatchCriteria {
  label: string
  score: number
  status: "perfect" | "good" | "needs-work"
}

const CRITERIA: MatchCriteria[] = [
  { label: "Technical Skills (React, Next.js, Node.js)", score: 95, status: "perfect" },
  { label: "Communication Score (Stage 1 Modules)", score: 90, status: "perfect" },
  { label: "Data Structures & Algorithms (Stage 2)", score: 80, status: "good" },
  { label: "Real-world Project Experience (Stage 3)", score: 85, status: "good" },
  { label: "ATS Resume Match (Resume Scorer)", score: 75, status: "needs-work" }
]

export function JobMatcher() {
  const averageScore = Math.round(CRITERIA.reduce((acc, curr) => acc + curr.score, 0) / CRITERIA.length)

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-[22px] font-semibold text-foreground flex items-center gap-2">
          <i className="fas fa-robot text-stage4 w-5 h-5"></i>
          Smart Job Matcher
        </h2>
        <p className="text-[15px] text-zinc-500 dark:text-gray-400 mt-1">AI alignment matching your course achievements against actual recruiter postings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Match Circle Card */}
        <LiquidGlassCard className="p-6 md:col-span-1 flex flex-col items-center justify-center text-center" accentColor="#f59e0b">
          <h3 className="text-[15px] font-semibold text-zinc-500 dark:text-gray-400 uppercase tracking-wider mb-6">Overall Fit</h3>
          
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* SVG Circle indicator */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="64"
                className="stroke-black/5 dark:stroke-white/5 fill-transparent"
                strokeWidth="10"
              />
              <circle
                cx="72"
                cy="72"
                r="64"
                className="stroke-amber-500 fill-transparent transition-all duration-1000 ease-out"
                strokeWidth="10"
                strokeDasharray={`${2 * Math.PI * 64}`}
                strokeDashoffset={`${2 * Math.PI * 64 * (1 - averageScore / 100)}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute text-[34px] font-bold text-foreground drop-shadow-sm">
              {averageScore}%
            </div>
          </div>
          <p className="text-[13px] text-zinc-500 dark:text-gray-400 mt-6 font-medium">Excellent match for Frontend & Full-Stack roles!</p>
        </LiquidGlassCard>

        {/* Detailed Breakdown */}
        <LiquidGlassCard className="p-6 md:col-span-2 space-y-5" accentColor="#3b82f6">
          <h3 className="text-[17px] font-semibold text-foreground">AI Fit Breakdown</h3>
          
          <div className="space-y-4">
            {CRITERIA.map((crit, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-foreground text-[14px]">{crit.label}</span>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${
                      crit.status === "perfect" 
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                        : crit.status === "good"
                        ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                        : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                    }`}>
                      {crit.score}%
                    </span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden border border-black/5 dark:border-white/5 shadow-inner">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${
                      crit.status === "perfect" ? "bg-emerald-500" : crit.status === "good" ? "bg-blue-500" : "bg-amber-500"
                    }`}
                    style={{ width: `${crit.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </LiquidGlassCard>
      </div>
    </div>
  )
}

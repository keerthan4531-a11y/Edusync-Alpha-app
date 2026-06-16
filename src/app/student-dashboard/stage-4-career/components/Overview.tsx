import { LiquidGlassCard } from "@/components/ui/liquid-glass-card"
// No Lucide imports needed since font-awesome is used for icons.

interface OverviewProps {
  onTabChange: (tabId: string) => void
  stats?: {
    interviewsCount: number
    avgInterviewScore: number
    projectCount: number
    portfolioViews: number
    jobMatchesCount: number
    avgMatchScore: number
  }
}

export function Overview({ onTabChange, stats = {
  interviewsCount: 2,
  avgInterviewScore: 84,
  projectCount: 3,
  portfolioViews: 142,
  jobMatchesCount: 8,
  avgMatchScore: 92
} }: OverviewProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-[22px] font-semibold text-foreground tracking-tight mb-2">Career Readiness Overview</h2>
        <p className="text-[15px] text-zinc-500 dark:text-gray-400">
          Track your preparation metrics across different career modules and launch your job application process.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Mock Interviews Card */}
        <LiquidGlassCard className="p-6 flex flex-col justify-between" accentColor="#8b5cf6">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-[20px] text-purple-400">
                <i className="fas fa-microphone-alt"></i>
              </div>
              <div>
                <h3 className="text-[17px] font-semibold text-foreground">AI Mock Interviews</h3>
                <p className="text-[13px] text-zinc-500 dark:text-gray-400">Practice with Inixa AI Analysis</p>
              </div>
            </div>
            <div className="flex gap-4 p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 mb-6">
              <div className="flex-1 text-center border-r border-black/10 dark:border-white/10">
                <div className="text-[28px] font-semibold text-purple-400">{stats.interviewsCount}</div>
                <div className="text-[12px] text-zinc-500 dark:text-gray-500 font-medium">Interviews Done</div>
              </div>
              <div className="flex-1 text-center">
                <div className="text-[28px] font-semibold text-purple-400">{stats.avgInterviewScore}%</div>
                <div className="text-[12px] text-zinc-500 dark:text-gray-500 font-medium">Avg Score</div>
              </div>
            </div>
          </div>
          <button
            onClick={() => onTabChange("mock-interview")}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 rounded-xl transition-all shadow-[0_4px_12px_rgba(139,92,246,0.3)] hover:-translate-y-0.5 active:translate-y-0 text-sm flex items-center justify-center gap-2"
          >
            <i className="fas fa-play text-xs"></i> Start Interview
          </button>
        </LiquidGlassCard>

        {/* Live Portfolio Card */}
        <LiquidGlassCard className="p-6 flex flex-col justify-between" accentColor="#10b981">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[20px] text-emerald-400">
                <i className="fas fa-globe"></i>
              </div>
              <div>
                <h3 className="text-[17px] font-semibold text-foreground">Live Portfolio</h3>
                <p className="text-[13px] text-zinc-500 dark:text-gray-400">Showcase your verified projects</p>
              </div>
            </div>
            <div className="flex gap-4 p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 mb-6">
              <div className="flex-1 text-center border-r border-black/10 dark:border-white/10">
                <div className="text-[28px] font-semibold text-emerald-400">{stats.projectCount}</div>
                <div className="text-[12px] text-zinc-500 dark:text-gray-500 font-medium">Projects</div>
              </div>
              <div className="flex-1 text-center">
                <div className="text-[28px] font-semibold text-emerald-400">{stats.portfolioViews}</div>
                <div className="text-[12px] text-zinc-500 dark:text-gray-500 font-medium">Portfolio Views</div>
              </div>
            </div>
          </div>
          <button
            onClick={() => onTabChange("portfolio")}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl transition-all shadow-[0_4px_12px_rgba(16,185,129,0.3)] hover:-translate-y-0.5 active:translate-y-0 text-sm flex items-center justify-center gap-2"
          >
            <i className="fas fa-eye text-xs"></i> View Portfolio
          </button>
        </LiquidGlassCard>

        {/* Smart Job Matcher Card */}
        <LiquidGlassCard className="p-6 flex flex-col justify-between" accentColor="#f59e0b">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[20px] text-amber-400">
                <i className="fas fa-robot"></i>
              </div>
              <div>
                <h3 className="text-[17px] font-semibold text-foreground">Smart Job Matcher</h3>
                <p className="text-[13px] text-zinc-500 dark:text-gray-400">Skills-based algorithm ranking</p>
              </div>
            </div>
            <div className="flex gap-4 p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 mb-6">
              <div className="flex-1 text-center border-r border-black/10 dark:border-white/10">
                <div className="text-[28px] font-semibold text-amber-400">{stats.jobMatchesCount}</div>
                <div className="text-[12px] text-zinc-500 dark:text-gray-500 font-medium">Job Matches</div>
              </div>
              <div className="flex-1 text-center">
                <div className="text-[28px] font-semibold text-amber-400">{stats.avgMatchScore}%</div>
                <div className="text-[12px] text-zinc-500 dark:text-gray-500 font-medium">Match Score</div>
              </div>
            </div>
          </div>
          <button
            onClick={() => onTabChange("job-matcher")}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-xl transition-all shadow-[0_4px_12px_rgba(245,158,11,0.3)] hover:-translate-y-0.5 active:translate-y-0 text-sm flex items-center justify-center gap-2"
          >
            <i className="fas fa-briefcase text-xs"></i> Find Jobs
          </button>
        </LiquidGlassCard>
      </div>
    </div>
  )
}

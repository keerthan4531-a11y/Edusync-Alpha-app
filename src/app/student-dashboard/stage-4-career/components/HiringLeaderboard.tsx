import { LiquidGlassCard } from "@/components/ui/liquid-glass-card"

interface LeaderboardEntry {
  rank: number
  name: string
  score: number
  mockScore: number
  projects: number
  status: "Placed" | "Interviewing" | "Open to Work"
}



import { useState } from "react"

export function HiringLeaderboard() {
  const [data, setData] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  import("react").then((React) => {
    React.useEffect(() => {
      fetch("/api/ai/generate-leaderboard")
        .then(res => res.json())
        .then(resData => {
          if (Array.isArray(resData)) {
            setData(resData)
          }
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }, [])
  })

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-[22px] font-semibold text-foreground flex items-center gap-2">
          <i className="fas fa-trophy text-stage4 w-5 h-5"></i>
          Hiring Leaderboard
        </h2>
        <p className="text-[15px] text-zinc-500 dark:text-gray-400 mt-1">Real-time cohort standings showing placement readiness metrics.</p>
      </div>

      <LiquidGlassCard className="p-0 overflow-hidden shadow-xl" accentColor="#f59e0b">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 text-[12px] font-bold text-zinc-500 dark:text-gray-400 uppercase tracking-wider">
                <th className="py-4 px-6 text-center w-16">Rank</th>
                <th className="py-4 px-6">Candidate</th>
                <th className="py-4 px-6 text-center">Mock Score</th>
                <th className="py-4 px-6 text-center">Projects</th>
                <th className="py-4 px-6 text-center">Placement Score</th>
                <th className="py-4 px-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5 text-[15px]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="w-6 h-6 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-zinc-500">AI is fetching the latest cohort standings...</p>
                  </td>
                </tr>
              ) : data.map((student, idx) => {
                const isUser = student.name.includes("(You)")
                return (
                  <tr 
                    key={idx} 
                    className={`transition-colors hover:bg-black/5 dark:hover:bg-white/5 ${
                      isUser ? "bg-amber-500/5 font-semibold" : ""
                    }`}
                  >
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-[13px] font-bold ${
                        student.rank === 1 
                          ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-md shadow-yellow-500/25" 
                          : student.rank === 2
                          ? "bg-gradient-to-r from-zinc-300 to-zinc-400 text-white shadow-md shadow-zinc-400/25"
                          : student.rank === 3
                          ? "bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md shadow-amber-700/25"
                          : "bg-black/5 dark:bg-white/10 text-foreground"
                      }`}>
                        {student.rank}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="text-foreground">{student.name}</span>
                        {isUser && (
                          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] uppercase font-bold tracking-wide">
                            You
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center text-zinc-600 dark:text-gray-300 font-semibold">{student.mockScore}%</td>
                    <td className="py-4 px-6 text-center text-zinc-600 dark:text-gray-300 font-semibold">{student.projects}</td>
                    <td className="py-4 px-6 text-center text-stage4 font-bold">{student.score} pts</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${
                        student.status === "Placed"
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          : student.status === "Interviewing"
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          : "bg-zinc-500/10 text-zinc-500 dark:text-gray-400 border-zinc-500/20"
                      }`}>
                        {student.status}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </LiquidGlassCard>
    </div>
  )
}

import React from "react"
import { Trophy, Flame, Star, Coins, GitCommit } from "lucide-react"
import { ProfileData } from "@/types/profile"
import { GlassProgressBar } from "../ui/GlassProgressBar"

interface AchievementsTabProps {
  profile: ProfileData | null
}

export function AchievementsTab({ profile }: AchievementsTabProps) {
  const stats = [
    {
      title: "Learning Streak",
      icon: Flame,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      gradient: "from-orange-500 to-amber-400",
      current: profile?.currentStreak || 0,
      goal: 30,
      labelCurrent: "Current",
      labelGoal: "Goal (days)",
      desc: `${profile?.currentStreak || 0} days streak`
    },
    {
      title: "Average Score",
      icon: Star,
      color: "text-primary",
      bgColor: "bg-primary/10",
      gradient: "from-primary to-purple-400",
      current: 85, // Hardcoded or calculated from stats later
      goal: 100,
      labelCurrent: "Current %",
      labelGoal: "Target",
      desc: "85% average score across modules"
    },
    {
      title: "Total Credits",
      icon: Coins,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      gradient: "from-yellow-500 to-amber-300",
      current: profile?.coins || 0,
      goal: 5000,
      labelCurrent: "Earned",
      labelGoal: "Goal",
      desc: `${profile?.coins || 0} credits earned`
    },
    {
      title: "Code Contributions",
      icon: GitCommit,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      gradient: "from-emerald-500 to-teal-400",
      current: 24, // Hardcoded for demo
      goal: 100,
      labelCurrent: "Commits",
      labelGoal: "Milestone",
      desc: "24 contributions this month"
    }
  ]

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-yellow-500/10 text-yellow-500 rounded-xl">
          <Trophy className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Learning Statistics</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="glass-panel p-6 rounded-[2rem] space-y-6 hover:shadow-[var(--glass-shadow-hover)] transition-all duration-300 group">
            <div className="flex items-start gap-4">
              <div className={`p-4 rounded-2xl ${stat.bgColor} ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground">{stat.title}</h3>
                <p className="text-sm text-muted-foreground">{stat.desc}</p>
              </div>
            </div>

            <GlassProgressBar 
              current={stat.current}
              goal={stat.goal}
              labelCurrent={stat.labelCurrent}
              labelGoal={stat.labelGoal}
              fillGradient={stat.gradient}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

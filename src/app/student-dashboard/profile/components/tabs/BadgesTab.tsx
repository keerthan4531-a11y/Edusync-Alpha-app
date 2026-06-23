import React from "react"
import { Award, Lock, Flame, Zap, Code, Mic, Users } from "lucide-react"
import { ProfileData, Badge } from "@/types/profile"

interface BadgesTabProps {
  profile: ProfileData | null
}

export function BadgesTab({ profile }: BadgesTabProps) {
  const earnedBadges = profile?.badges?.filter(b => b.earned) || []
  
  // Example locked badges (normally from API)
  const availableBadges = [
    { name: '7-Day Streak', icon: Flame, desc: 'Login for 7 consecutive days' },
    { name: 'Challenge Master', icon: Zap, desc: 'Complete 50 challenges' },
    { name: 'Code Ninja', icon: Code, desc: 'Solve 100 coding problems' },
    { name: 'Voice Virtuoso', icon: Mic, desc: 'Score 90+ in 10 voice challenges' },
    { name: 'Team Player', icon: Users, desc: 'Collaborate on 3 group projects' }
  ].filter(ab => !earnedBadges.find(eb => eb.name === ab.name)) // Don't show if earned

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Recently"
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Earned Badges */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-yellow-500/10 text-yellow-500 rounded-xl shadow-[0_0_15px_rgba(234,179,8,0.2)]">
            <Award className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Earned Badges</h2>
        </div>

        {earnedBadges.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {earnedBadges.map(badge => (
              <div key={badge.id} className="glass-panel p-6 rounded-[2rem] flex flex-col items-center text-center group hover:-translate-y-1 hover:shadow-[var(--glass-shadow-hover)] transition-all duration-300">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-600 p-[2px] mb-4 shadow-lg group-hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-shadow">
                  <div className="w-full h-full bg-background rounded-2xl flex items-center justify-center">
                    <Award className="w-8 h-8 text-yellow-500" />
                  </div>
                </div>
                <h3 className="font-bold text-foreground mb-1">{badge.name}</h3>
                <p className="text-xs text-muted-foreground mb-3">{badge.description}</p>
                <div className="mt-auto pt-3 border-t border-[var(--glass-border-subtle)] w-full text-[10px] uppercase tracking-wider font-semibold text-emerald-500">
                  Earned: {formatDate(badge.earnedAt)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel p-8 rounded-[2rem] flex flex-col items-center justify-center text-center border-dashed border-2 border-[var(--glass-border)]">
            <Award className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">You haven't earned any badges yet.<br/>Start completing challenges to earn your first one!</p>
          </div>
        )}
      </section>

      {/* Locked Badges */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-muted text-muted-foreground rounded-xl">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Available Badges</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {availableBadges.map((badge, idx) => (
            <div key={idx} className="bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] p-6 rounded-[2rem] flex flex-col items-center text-center opacity-60 hover:opacity-100 transition-opacity duration-300 filter grayscale hover:grayscale-0">
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-3">
                <badge.icon className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="font-bold text-foreground text-sm mb-1">{badge.name}</h3>
              <p className="text-[10px] text-muted-foreground mb-3">{badge.desc}</p>
              <div className="mt-auto pt-2 w-full text-[10px] uppercase tracking-wider font-semibold text-muted-foreground flex justify-center items-center gap-1">
                <Lock className="w-3 h-3" /> Locked
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}

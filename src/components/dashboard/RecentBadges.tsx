import { db } from "@/lib/db"
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card"
import { Award, Medal } from "lucide-react"
import { BadgeIcon } from "./BadgeIcon"

export async function RecentBadges({ userId }: { userId: string }) {
  const userBadges = await db.userBadge.findMany({
    where: { userId },
    include: { badge: true },
    orderBy: { earnedAt: 'desc' },
    take: 5
  })

  return (
    <LiquidGlassCard className="p-6" accentColor="#3b82f6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-blue-500/15 rounded-xl border border-blue-500/20 shadow-[0_0_16px_rgba(59,130,246,0.15)] backdrop-blur-sm">
          <Award className="w-5 h-5 text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
        </div>
        <h2 className="text-xl font-bold text-foreground tracking-tight">Recent Badges</h2>
      </div>

      {userBadges.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center bg-[var(--glass-bg)] rounded-2xl border border-[var(--glass-border-subtle)] backdrop-blur-sm">
          <Medal className="w-10 h-10 text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground font-medium">No badges yet.</p>
          <p className="text-xs text-muted-foreground/70 mt-1">Complete challenges to earn your first badge!</p>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          {userBadges.map((ub) => (
            <div 
              key={ub.id} 
              className="glass-panel flex-shrink-0 w-28 flex flex-col items-center gap-3 p-4 rounded-2xl transition-all duration-300 group cursor-default"
            >
              <div className="w-14 h-14 rounded-full bg-[var(--glass-bg-hover)] flex items-center justify-center border border-[var(--glass-border)] shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),0_4px_16px_rgba(0,0,0,0.1)] group-hover:scale-110 transition-transform duration-300 overflow-hidden relative">
                <div className="glass-noise" />
                <BadgeIcon iconUrl={ub.badge.iconUrl} name={ub.badge.name} />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground leading-tight">{ub.badge.name}</p>
                <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-semibold">
                  {new Date(ub.earnedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </LiquidGlassCard>
  )
}

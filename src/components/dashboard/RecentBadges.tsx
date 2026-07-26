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
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 rounded-lg neu-raised-sm dark:bg-blue-500/20 dark:border dark:border-blue-500/30 dark:shadow-none dark:shadow-[inset_0_0_10px_rgba(59,130,246,0.2)]">
          <Award className="w-5 h-5 text-blue-600 dark:text-blue-400 drop-shadow-none dark:drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
        </div>
        <h2 className="text-xl font-bold text-foreground dark:text-white tracking-tight">Recent Badges</h2>
      </div>

      {userBadges.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center rounded-xl neu-inset dark:bg-black/20 dark:border dark:border-white/5">
          <Medal className="w-10 h-10 text-muted-foreground dark:text-gray-600 mb-3" />
          <p className="text-foreground dark:text-gray-400 font-medium">No badges yet.</p>
          <p className="text-xs text-muted-foreground dark:text-gray-500 mt-1">Complete challenges to earn your first badge!</p>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          {userBadges.map((ub) => (
            <div 
              key={ub.id} 
              className="flex-shrink-0 w-28 flex flex-col items-center gap-3 p-4 rounded-2xl neu-flat dark:bg-black/20 dark:border dark:border-white/5 dark:shadow-none hover:scale-105 dark:hover:bg-white/5 transition-all duration-300 group cursor-default"
            >
              <div className="w-14 h-14 rounded-full flex items-center justify-center overflow-hidden neu-raised-sm dark:bg-white/10 dark:border dark:border-white/20 dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_4px_10px_rgba(0,0,0,0.3)] group-hover:scale-110 transition-transform duration-300">
                <BadgeIcon iconUrl={ub.badge.iconUrl} name={ub.badge.name} />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground dark:text-gray-200 leading-tight">{ub.badge.name}</p>
                <p className="text-[10px] text-muted-foreground dark:text-gray-500 mt-1 uppercase tracking-wider font-semibold">
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

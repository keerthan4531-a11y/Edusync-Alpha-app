import { db } from "@/lib/db"
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card"
import { Award, Medal } from "lucide-react"

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
        <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30 shadow-[inset_0_0_10px_rgba(59,130,246,0.2)]">
          <Award className="w-5 h-5 text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">Recent Badges</h2>
      </div>

      {userBadges.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center bg-black/20 rounded-xl border border-white/5">
          <Medal className="w-10 h-10 text-gray-600 mb-3" />
          <p className="text-gray-400 font-medium">No badges yet.</p>
          <p className="text-xs text-gray-500 mt-1">Complete challenges to earn your first badge!</p>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          {userBadges.map((ub) => (
            <div 
              key={ub.id} 
              className="flex-shrink-0 w-28 flex flex-col items-center gap-3 p-4 bg-black/20 rounded-2xl border border-white/5 hover:bg-white/5 transition-colors group cursor-default"
            >
              <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_4px_10px_rgba(0,0,0,0.3)] group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl drop-shadow-md">{ub.badge.iconUrl}</span>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-200 leading-tight">{ub.badge.name}</p>
                <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider font-semibold">
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

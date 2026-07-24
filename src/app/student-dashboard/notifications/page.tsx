"use client"

import { useRouter } from "next/navigation"
import { ChevronLeft, Bell, Star, Zap, Shield, Trophy, CheckCircle2 } from "lucide-react"

const notifications = [
  {
    id: 1,
    title: "Daily Challenges Refreshed!",
    message: "Your new AI-curated challenges for today are ready. Complete them to earn up to 100 XP.",
    time: "2 hours ago",
    icon: Zap,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    isNew: true,
  },
  {
    id: 2,
    title: "Level Up: Stage 1 Master",
    message: "Congratulations! You've successfully completed the Communication stage with excellent accuracy.",
    time: "Yesterday",
    icon: Trophy,
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
    isNew: true,
  },
  {
    id: 3,
    title: "New Badge Earned",
    message: "You earned the 'Speed Demon' badge for completing 3 challenges in under 5 minutes.",
    time: "3 days ago",
    icon: Shield,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    isNew: false,
  },
  {
    id: 4,
    title: "Profile Updated",
    message: "Your academic and demographic details have been successfully saved.",
    time: "1 week ago",
    icon: CheckCircle2,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    isNew: false,
  }
]

export default function NotificationsPage() {
  const router = useRouter()

  return (
    <div className="flex flex-col min-h-screen bg-transparent animate-in fade-in zoom-in-95 duration-300 px-4 md:px-8 max-w-4xl mx-auto py-6">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/70 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-white/90 dark:hover:bg-white/10 transition-colors shadow-sm backdrop-blur-xl"
            aria-label="Go back"
          >
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
              <Bell className="w-5 h-5 text-indigo-500" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Notifications</h1>
          </div>
        </div>
        
        <button className="text-sm font-semibold text-indigo-500 hover:text-indigo-600 transition-colors">
          Mark all as read
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.map((notif) => {
          const Icon = notif.icon
          return (
            <div 
              key={notif.id}
              className={`relative flex items-start gap-4 p-5 md:p-6 rounded-[24px] bg-white/70 dark:bg-white/5 border border-black/10 dark:border-white/10 shadow-lg backdrop-blur-xl transition-all hover:scale-[1.01] hover:bg-white/80 dark:hover:bg-white/10 ${notif.isNew ? 'ring-1 ring-indigo-500/30' : ''}`}
            >
              {notif.isNew && (
                <div className="absolute top-6 right-6 w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
              )}
              <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center ${notif.bg} ${notif.border} border`}>
                <Icon className={`w-6 h-6 ${notif.color}`} />
              </div>
              <div className="flex-1 pt-1">
                <h3 className="text-base md:text-lg font-bold text-foreground mb-1 pr-6">{notif.title}</h3>
                <p className="text-sm text-zinc-500 dark:text-gray-400 leading-relaxed mb-3">
                  {notif.message}
                </p>
                <span className="text-xs font-semibold text-zinc-400 dark:text-gray-500 uppercase tracking-wider">
                  {notif.time}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty State / End of list */}
      <div className="mt-8 text-center text-sm font-medium text-zinc-400 dark:text-gray-500">
        You are all caught up!
      </div>
      
    </div>
  )
}

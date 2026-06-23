import React from "react"
import { History, Target, Code, FileText, CheckCircle2 } from "lucide-react"
import { ProfileData } from "@/types/profile"

interface ActivityTabProps {
  profile: ProfileData | null
}

export function ActivityTab({ profile }: ActivityTabProps) {
  const activities = profile?.activities || []

  const formatTime = (dateString?: string) => {
    if (!dateString) return 'Just now'
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`
    if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'assignment': return FileText
      case 'communication': return Target
      case 'coding': return Code
      default: return CheckCircle2
    }
  }

  const getColor = (type: string) => {
    switch (type) {
      case 'assignment': return "text-blue-500 bg-blue-500/10 border-blue-500/20"
      case 'communication': return "text-purple-500 bg-purple-500/10 border-purple-500/20"
      case 'coding': return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
      default: return "text-primary bg-primary/10 border-primary/20"
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 bg-indigo-500/10 text-indigo-500 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.2)]">
          <History className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Recent Activity</h2>
      </div>

      <div className="glass-panel p-6 md:p-8 rounded-[2rem] relative">
        {activities.length > 0 ? (
          <div className="relative border-l-2 border-[var(--glass-border-subtle)] ml-4 md:ml-6 space-y-8 pb-4">
            {activities.map((activity, idx) => {
              const Icon = getIcon(activity.type)
              const colorClasses = getColor(activity.type)

              return (
                <div key={activity.id} className="relative pl-8 md:pl-10 group">
                  {/* Timeline Dot */}
                  <div className={`absolute -left-[17px] top-0.5 w-8 h-8 rounded-full border-2 flex items-center justify-center bg-background shadow-lg group-hover:scale-110 transition-transform ${colorClasses}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>

                  {/* Content */}
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                      {formatTime(activity.createdAt)}
                    </span>
                    <h3 className="font-bold text-foreground text-base leading-tight">
                      {activity.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 bg-[var(--glass-bg)] p-3 rounded-xl border border-[var(--glass-border-subtle)]">
                      {activity.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-[var(--glass-bg)] rounded-full flex items-center justify-center mb-4">
              <History className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <h3 className="font-bold text-lg mb-1">No recent activity</h3>
            <p className="text-muted-foreground text-sm max-w-sm">Complete challenges, assignments, or daily tasks to see your activity timeline here.</p>
          </div>
        )}
      </div>
    </div>
  )
}

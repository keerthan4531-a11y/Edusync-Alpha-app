import { LiquidGlassCard } from "@/components/ui/liquid-glass-card"
import { BarChart, Users, TrendingUp, Award } from "lucide-react"

export default function HodDashboardPage() {
  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">HOD Dashboard</h1>
        <p className="text-muted-foreground mt-1">Department-wide analytics and faculty directory.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Dept. Average XP", value: "8,450", icon: BarChart, accent: "#8b5cf6", color: "text-stage1" },
          { label: "Total Faculty", value: "24", icon: Users, accent: "#3b82f6", color: "text-stage2" },
          { label: "Growth Rate", value: "+12%", icon: TrendingUp, accent: "#10b981", color: "text-stage3" },
          { label: "Top Performers", value: "18", icon: Award, accent: "#f59e0b", color: "text-stage4" },
        ].map((stat) => (
          <LiquidGlassCard key={stat.label} className="p-6" accentColor={stat.accent}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="tracking-tight text-xs font-semibold text-muted-foreground uppercase tracking-widest">{stat.label}</h3>
              <div className={`p-2 rounded-xl glass-panel`}>
                <stat.icon className={`w-4 h-4 ${stat.color} drop-shadow-[0_0_6px_currentColor] relative z-10`} />
              </div>
            </div>
            <div className="text-3xl font-bold text-foreground">{stat.value}</div>
          </LiquidGlassCard>
        ))}
      </div>
    </div>
  )
}

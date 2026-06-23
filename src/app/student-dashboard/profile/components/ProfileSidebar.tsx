import { 
  UserCircle, GraduationCap, Code, Trophy, 
  Award, History, Shield, Settings 
} from "lucide-react"

interface ProfileSidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export function ProfileSidebar({ activeTab, setActiveTab }: ProfileSidebarProps) {
  const menuItems = [
    { id: "personal-info", label: "Personal Info", icon: UserCircle },
    { id: "education", label: "Education", icon: GraduationCap },
    { id: "skills", label: "Skills & Interests", icon: Code },
    { id: "achievements", label: "Achievements", icon: Trophy },
    { id: "badges", label: "Badges", icon: Award },
    { id: "activity", label: "Activity", icon: History },
    { id: "security", label: "Security", icon: Shield },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  return (
    <aside className="w-full md:w-64 shrink-0 flex flex-col md:pr-6 mb-6 md:mb-0 relative">
      {/* Decorative vertical line for desktop */}
      <div className="hidden md:block absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[var(--glass-border)] to-transparent" />
      
      <ul className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible pb-4 md:pb-0 scrollbar-hide snap-x">
        {menuItems.map((item) => (
          <li key={item.id} className="shrink-0 snap-start">
            <button
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-5 py-3.5 w-full rounded-2xl transition-all duration-300 font-medium text-sm whitespace-nowrap outline-none
                ${activeTab === item.id 
                  ? 'glass-card-premium text-foreground shadow-[0_4px_20px_rgba(139,92,246,0.15)] md:translate-x-2 border-primary/20' 
                  : 'text-muted-foreground hover:bg-[var(--glass-bg-hover)] border border-transparent hover:border-[var(--glass-border-subtle)] hover:text-foreground'
                }`}
            >
              <item.icon 
                className={`w-5 h-5 transition-all duration-300 
                  ${activeTab === item.id ? 'text-primary scale-110 drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]' : ''}
                `} 
              />
              <span>{item.label}</span>
              
              {/* Active Indicator Dot */}
              {activeTab === item.id && (
                <div className="hidden md:block ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
              )}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  )
}

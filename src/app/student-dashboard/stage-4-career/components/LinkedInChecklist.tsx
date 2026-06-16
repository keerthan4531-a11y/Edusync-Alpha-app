"use client";

import { useState } from "react";
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card";
import { Check } from "lucide-react";

interface ChecklistItem {
  id: string
  title: string
  desc: string
  points: number
}

const ITEMS: ChecklistItem[] = [
  { id: "1", title: "Optimize Professional Headline", desc: "Use key terms matching target roles (e.g., Full-Stack Engineer, React/Node.js).", points: 15 },
  { id: "2", title: "Write a Compelling About Section", desc: "Detail your EduSync course progression, projects, and personal achievements.", points: 20 },
  { id: "3", title: "Highlight Verified Skills", desc: "Add skills verified by Stage 2 and Stage 3 (React, Data Structures).", points: 15 },
  { id: "4", title: "Customize Profile URL", desc: "Clean up your public link (e.g., linkedin.com/in/yourname) for resumes.", points: 10 },
  { id: "5", title: "Add Project Links & Media", desc: "Attach links to your public portfolio and GitHub project repositories.", points: 25 },
  { id: "6", title: "Request Professional Recommendations", desc: "Ask peers or course guides to endorse your project collaborations.", points: 15 }
]

export function LinkedInChecklist() {
  const [checkedItems, setCheckedItems] = useState<string[]>(["1", "3", "4"]) // Pre-check some for beauty

  const handleToggle = (id: string) => {
    if (checkedItems.includes(id)) {
      setCheckedItems(checkedItems.filter(i => i !== id))
    } else {
      setCheckedItems([...checkedItems, id])
    }
  }

  const totalPoints = ITEMS.reduce((acc, curr) => acc + curr.points, 0)
  const earnedPoints = ITEMS.filter(item => checkedItems.includes(item.id)).reduce((acc, curr) => acc + curr.points, 0)
  const percentComplete = Math.round((earnedPoints / totalPoints) * 100)

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-[22px] font-semibold text-foreground flex items-center gap-2">
            <i className="fab fa-linkedin text-stage4 w-5 h-5"></i>
            LinkedIn Optimization
          </h2>
          <p className="text-[15px] text-zinc-500 dark:text-gray-400 mt-1">Audit and optimize your professional brand for external hiring managers.</p>
        </div>

        <div className="px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-xs font-semibold shadow-sm flex items-center gap-2 shrink-0">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          {percentComplete}% Completed
        </div>
      </div>

      {/* Progress Header Card */}
      <LiquidGlassCard className="p-6 space-y-3" accentColor="#f59e0b">
        <div className="flex justify-between items-center text-sm font-semibold text-foreground">
          <span>Optimization Score</span>
          <span>{earnedPoints} / {totalPoints} Points</span>
        </div>
        <div className="w-full h-3 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden border border-black/5 dark:border-white/5 shadow-inner">
          <div 
            className="h-full bg-amber-500 transition-all duration-500 ease-out rounded-full"
            style={{ width: `${percentComplete}%` }}
          />
        </div>
      </LiquidGlassCard>

      {/* Checklist List */}
      <div className="space-y-4">
        {ITEMS.map(item => {
          const isChecked = checkedItems.includes(item.id)
          return (
            <LiquidGlassCard 
              key={item.id} 
              onClick={() => handleToggle(item.id)}
              className={`p-4 flex items-start gap-4 border cursor-pointer hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-300 ${
                isChecked ? "border-emerald-500/20 bg-emerald-500/[0.03]" : ""
              }`}
            >
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                isChecked 
                  ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20" 
                  : "border-zinc-400 dark:border-gray-600 hover:border-foreground"
              } shrink-0 mt-0.5`}>
                {isChecked && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex justify-between gap-4">
                  <h4 className={`text-[15px] font-semibold text-foreground transition-all ${isChecked ? "line-through text-zinc-400 dark:text-gray-500" : ""}`}>
                    {item.title}
                  </h4>
                  <span className="text-[12px] font-semibold text-stage4 shrink-0 bg-stage4/10 px-2 py-0.5 rounded-lg border border-stage4/20">
                    +{item.points} XP
                  </span>
                </div>
                <p className={`text-[13px] text-zinc-500 dark:text-gray-400 leading-normal ${isChecked ? "text-zinc-400/80 dark:text-gray-500/80" : ""}`}>
                  {item.desc}
                </p>
              </div>
            </LiquidGlassCard>
          )
        })}
      </div>
    </div>
  )
}

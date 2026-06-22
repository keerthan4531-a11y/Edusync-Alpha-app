"use client"

import React from "react"

interface SkillPathConnectorProps {
  progresses: any[]
}

export function SkillPathConnector({ progresses }: SkillPathConnectorProps) {
  return (
    <div className="absolute left-14 top-16 bottom-16 w-[3px] bg-white/5 pointer-events-none hidden sm:block z-0">
      {/* Dynamic colored segments that light up depending on stage completion */}
      {progresses.map((p, idx) => {
        if (idx === progresses.length - 1) return null
        
        // Connectors light up when the current stage is completed, or when the next stage is already active/completed
        const nextStage = progresses[idx + 1]
        const isPathCompleted = p.status === "COMPLETED" && (nextStage.status === "ACTIVE" || nextStage.status === "COMPLETED")
        const isPathActive = p.status === "ACTIVE" || (p.status === "COMPLETED" && nextStage.status === "PENDING")
        
        // Height of each segment (3 segments connecting 4 stages)
        const segmentHeight = `${100 / (progresses.length - 1)}%`
        const topOffset = `${(idx * 100) / (progresses.length - 1)}%`

        let strokeColor = "bg-white/10"
        let glowShadow = "none"
        let pulseClass = ""

        if (isPathCompleted) {
          strokeColor = "bg-gradient-to-b from-emerald-500 to-teal-500"
          glowShadow = "0 0 10px rgba(16, 185, 129, 0.6), 0 0 20px rgba(16, 185, 129, 0.3)"
        } else if (isPathActive) {
          strokeColor = "bg-gradient-to-b from-violet-500 via-indigo-500 to-cyan-500"
          glowShadow = "0 0 12px rgba(139, 92, 246, 0.7), 0 0 24px rgba(99, 102, 241, 0.4)"
          pulseClass = "animate-pulse"
        }

        return (
          <div
            key={p.id}
            className={`absolute left-0 w-full transition-all duration-1000 ${strokeColor} ${pulseClass}`}
            style={{
              top: topOffset,
              height: segmentHeight,
              boxShadow: glowShadow,
            }}
          />
        )
      })}
    </div>
  )
}

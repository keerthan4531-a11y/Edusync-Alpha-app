import React from "react"
import { Code, Heart, Target, AlertTriangle } from "lucide-react"
import { ProfileData } from "@/types/profile"
import { ChipInput } from "../ui/ChipInput"

interface SkillsTabProps {
  profile: ProfileData | null
  updateProfile: (updates: Partial<ProfileData>) => Promise<{ success: boolean; error?: string }>
}

export function SkillsTab({ profile, updateProfile }: SkillsTabProps) {
  // Use a debounced or immediate update pattern for chips
  // Since we have updateProfile available, we'll save immediately when chips change
  
  const handleUpdate = (field: string, newTags: string[]) => {
    updateProfile({ [field]: newTags })
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl">
          <Code className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Skills & Interests</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Technical Skills */}
        <div className="glass-panel p-6 rounded-[2rem] space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
            <Code className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Technical Skills
            </h3>
            <p className="text-sm text-muted-foreground mb-6">Languages, frameworks, and tools you know</p>
            <ChipInput 
              tags={profile?.skills || []} 
              setTags={(tags) => handleUpdate("skills", tags)} 
              placeholder="e.g. Python, React, Next.js"
            />
          </div>
        </div>

        {/* Career Goals */}
        <div className="glass-panel p-6 rounded-[2rem] space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
            <Target className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Career Goals
            </h3>
            <p className="text-sm text-muted-foreground mb-6">What roles are you aiming for?</p>
            <ChipInput 
              tags={profile?.careerGoals || []} 
              setTags={(tags) => handleUpdate("careerGoals", tags)} 
              placeholder="e.g. Full Stack Developer"
            />
          </div>
        </div>

        {/* Interests & Hobbies */}
        <div className="glass-panel p-6 rounded-[2rem] space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
            <Heart className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-pink-500"></span>
              Interests & Hobbies
            </h3>
            <p className="text-sm text-muted-foreground mb-6">What do you do for fun?</p>
            <ChipInput 
              tags={profile?.interests || []} 
              setTags={(tags) => handleUpdate("interests", tags)} 
              placeholder="e.g. Open Source, Game Dev"
            />
          </div>
        </div>

        {/* Weak Areas */}
        <div className="glass-panel p-6 rounded-[2rem] space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
            <AlertTriangle className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Areas for Improvement
            </h3>
            <p className="text-sm text-muted-foreground mb-6">What do you want to learn next?</p>
            <ChipInput 
              tags={profile?.weakAreas || []} 
              setTags={(tags) => handleUpdate("weakAreas", tags)} 
              placeholder="e.g. System Design, DSA"
            />
          </div>
        </div>

      </div>
    </div>
  )
}

"use client"
 
import { useState } from "react"
import { Award, Medal, Flame } from "lucide-react"
 
interface BadgeIconProps {
  iconUrl: string | null
  name: string
}
 
export function BadgeIcon({ iconUrl, name }: BadgeIconProps) {
  const [error, setError] = useState(false)
 
  if (!iconUrl) {
    return <Award className="w-7 h-7 text-indigo-400" />
  }
 
  const isImagePath = iconUrl.startsWith("/") || iconUrl.startsWith("http")
 
  if (isImagePath && !error) {
    return (
      <img
        src={iconUrl}
        alt={name}
        className="w-10 h-10 object-contain"
        onError={() => setError(true)}
      />
    )
  }
 
  // Fallback icon selection based on badge name
  const nameLower = name.toLowerCase()
  if (nameLower.includes("first") || nameLower.includes("submission")) {
    return <Medal className="w-8 h-8 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
  }
  if (nameLower.includes("streak") || nameLower.includes("day")) {
    return <Flame className="w-8 h-8 text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
  }
  if (nameLower.includes("stage") || nameLower.includes("starter")) {
    return <Award className="w-8 h-8 text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
  }
 
  return <Award className="w-8 h-8 text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]" />
}

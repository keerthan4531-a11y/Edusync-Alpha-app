"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

export function TypewriterEffect({ 
  text, 
  delay = 20, 
  className,
  onComplete 
}: { 
  text: string, 
  delay?: number, 
  className?: string,
  onComplete?: () => void 
}) {
  const [currentText, setCurrentText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)

  // Reset when text changes
  useEffect(() => {
    setCurrentText("")
    setCurrentIndex(0)
  }, [text])

  useEffect(() => {
    if (!text) return;
    
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setCurrentText(prevText => prevText + text[currentIndex])
        setCurrentIndex(prevIndex => prevIndex + 1)
      }, delay)
      return () => clearTimeout(timeout)
    } else if (onComplete) {
      onComplete()
    }
  }, [currentIndex, delay, text, onComplete])

  return (
    <span className={cn("inline-block", className)}>
      {currentText}
      {currentIndex < (text?.length || 0) && (
        <span className="inline-block w-1.5 h-[0.8em] ml-1 bg-indigo-500 animate-pulse align-middle" />
      )}
    </span>
  )
}

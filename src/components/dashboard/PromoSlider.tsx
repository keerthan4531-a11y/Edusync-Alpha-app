"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"

const slides = [
  {
    id: 1,
    title: "AI Communication Mastery",
    subtitle: "Stage 1: Ace your spoken English with AI",
    buttonText: "Start Practice",
    link: "/student-dashboard/stage-1-communication",
    image: "/images/slider-ai.png",
    bgClass: "from-indigo-900/40 to-purple-900/40 border-indigo-500/20"
  },
  {
    id: 2,
    title: "Technical Interview Prep",
    subtitle: "Stage 2 & 3: Master Coding & Aptitude",
    buttonText: "Solve Challenges",
    link: "/student-dashboard/stages",
    image: "/images/slider-tech.png",
    bgClass: "from-teal-900/40 to-emerald-900/40 border-teal-500/20"
  },
  {
    id: 3,
    title: "Capstone Project Guidance",
    subtitle: "Stage 4: Build your final portfolio",
    buttonText: "Explore Projects",
    link: "/student-dashboard/stages",
    image: "/images/slider-capstone.png",
    bgClass: "from-rose-900/40 to-orange-900/40 border-rose-500/20"
  }
]

export function PromoSlider() {
  const router = useRouter()
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000) // Auto-slide every 5 seconds
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative w-full overflow-hidden rounded-[32px] mb-2 shadow-2xl">
      <div 
        className="flex transition-transform duration-700 ease-in-out" 
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide) => (
          <div key={slide.id} className="min-w-full flex-shrink-0">
            <div className={cn(
              "flex flex-row items-center justify-between p-6 md:p-12 h-[200px] md:h-[250px]",
              "bg-gradient-to-br border backdrop-blur-3xl",
              slide.bgClass
            )}>
              {/* Text Content */}
              <div className="flex flex-col items-start gap-2 md:gap-4 z-10 w-3/5 text-left">
                <h2 className="text-xl md:text-4xl font-extrabold tracking-tight text-white drop-shadow-md leading-tight">
                  {slide.title}
                </h2>
                <p className="text-gray-300 font-medium text-sm md:text-base">
                  {slide.subtitle}
                </p>
                <Button 
                  onClick={() => router.push(slide.link)}
                  className="mt-1 md:mt-2 rounded-full bg-white text-black hover:bg-gray-200 font-bold px-4 py-4 md:px-6 md:py-5 shadow-lg group transition-all text-xs md:text-sm h-8 md:h-10"
                >
                  {slide.buttonText}
                  <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>

              {/* Image Content */}
              <div className="w-2/5 flex justify-end relative h-full items-center">
                <img 
                  src={slide.image} 
                  alt={slide.title} 
                  className="absolute right-0 top-1/2 -translate-y-1/2 h-[120%] object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500 mix-blend-screen opacity-90" 
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              currentSlide === idx ? "w-6 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" : "bg-white/40 hover:bg-white/60"
            )}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

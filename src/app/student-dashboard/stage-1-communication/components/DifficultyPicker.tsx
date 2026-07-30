"use client";

import { ChevronLeft, Zap, Shield, Flame } from "lucide-react";

export type Difficulty = "EASY" | "MEDIUM" | "HARD";

export const DIFFICULTY_OPTIONS = [
  {
    id: "EASY" as Difficulty,
    label: "Easy",
    points: 10,
    icon: Zap,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    desc: "Perfect for warm-up",
  },
  {
    id: "MEDIUM" as Difficulty,
    label: "Medium",
    points: 30,
    icon: Shield,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    desc: "A good challenge",
  },
  {
    id: "HARD" as Difficulty,
    label: "Hard",
    points: 50,
    icon: Flame,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    desc: "Push your limits",
  },
];

interface DifficultyPickerProps {
  title: string;
  onSelect: (diff: Difficulty) => void;
  onBack: () => void;
}

export function DifficultyPicker({ title, onSelect, onBack }: DifficultyPickerProps) {
  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={onBack}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition-colors shadow-sm"
          aria-label="Go back"
        >
          <ChevronLeft className="w-6 h-6 text-foreground" />
        </button>
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h1>
          <p className="text-xs font-semibold text-gray-700 dark:text-zinc-300">Choose your difficulty</p>
        </div>
      </div>

      {/* Difficulty cards */}
      <div className="flex flex-col gap-4">
        {DIFFICULTY_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          return (
            <button
              key={opt.id}
              onClick={() => onSelect(opt.id)}
              className="group relative flex items-center gap-5 p-5 rounded-[1.5rem] neu-button dark:bg-white/5 dark:border dark:border-white/10 transition-all duration-300 text-left w-full hover:border-blue-500/30"
            >
              <div className="w-14 h-14 flex-shrink-0 rounded-2xl flex items-center justify-center neu-inset-sm bg-blue-500/10 border border-blue-500/20">
                <Icon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">{opt.label}</span>
                </div>
                <p className="text-sm font-semibold text-gray-700 dark:text-zinc-300">{opt.desc}</p>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className="text-2xl font-black text-blue-600 dark:text-blue-400">+{opt.points}</span>
                <span className="text-[10px] text-gray-700 dark:text-zinc-300 uppercase tracking-wider font-bold">Points</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Tip */}
      <div className="mt-8 p-5 rounded-2xl neu-inset dark:bg-white/5 dark:border dark:border-white/10 text-center">
        <p className="text-xs font-semibold text-gray-800 dark:text-zinc-200">
          💡 Complete all 3 difficulties today to earn <span className="text-blue-600 dark:text-blue-400 font-bold">50–100 XP</span> based on your performance
        </p>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card";
import { Zap, Shield, Flame, CheckCircle2, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface DailyStatus {
  easy: { done: boolean; score: number };
  medium: { done: boolean; score: number };
  hard: { done: boolean; score: number };
  xpAwarded: number;
  allComplete: boolean;
}

const DIFFICULTY_CONFIG = [
  { key: "easy" as const, label: "Easy", points: 10, icon: Zap, color: "text-green-400", bg: "bg-green-400/10", border: "border-green-400/20", fill: "bg-green-400" },
  { key: "medium" as const, label: "Medium", points: 30, icon: Shield, color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20", fill: "bg-yellow-400" },
  { key: "hard" as const, label: "Hard", points: 50, icon: Flame, color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20", fill: "bg-red-400" },
];

export function DailyChallengesWidget() {
  const router = useRouter();
  const [status, setStatus] = useState<DailyStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/student/daily-challenges")
      .then((r) => r.json())
      .then((data) => {
        setStatus(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const doneCount = status ? [status.easy.done, status.medium.done, status.hard.done].filter(Boolean).length : 0;
  const progressPct = (doneCount / 3) * 100;

  return (
    <LiquidGlassCard className="p-6" accentColor="#6366f1">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
            <Flame className="w-5 h-5 text-indigo-400" />
          </div>
          <h2 className="text-lg font-bold text-foreground tracking-tight">Daily Challenges</h2>
        </div>
        {status?.allComplete && (
          <span className="text-xs font-bold text-green-400 bg-green-400/10 px-3 py-1 rounded-full border border-green-400/20">
            +{status.xpAwarded} XP Earned!
          </span>
        )}
        {!status?.allComplete && !loading && (
          <span className="text-xs text-zinc-400 dark:text-gray-500 bg-black/5 dark:bg-white/5 px-3 py-1 rounded-full border border-black/10 dark:border-white/10">
            {doneCount}/3 done
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 rounded-full bg-black/10 dark:bg-white/5 mb-5 overflow-hidden">
        <div
          className="h-full bg-indigo-500 rounded-full transition-all duration-700"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Challenge rows */}
      <div className="space-y-2.5">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-white/5 border border-white/5 animate-pulse" />
          ))
        ) : (
          DIFFICULTY_CONFIG.map(({ key, label, points, icon: Icon, color, bg, border, fill }) => {
            const isDone = status?.[key]?.done ?? false;
            return (
              <button
                key={key}
                onClick={() => !isDone && router.push("/student-dashboard/stage-1-communication")}
                disabled={isDone}
                className={`w-full flex items-center gap-4 p-3.5 rounded-xl border transition-all duration-200 text-left ${
                  isDone
                    ? "bg-black/5 dark:bg-white/3 border-black/5 dark:border-white/5 opacity-70"
                    : `${bg} ${border} hover:opacity-90 active:scale-[0.99] cursor-pointer`
                }`}
              >
                <div className={`w-9 h-9 flex-shrink-0 rounded-lg flex items-center justify-center ${isDone ? "bg-green-400/10 border border-green-400/20" : `${bg} border ${border}`}`}>
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  ) : (
                    <Icon className={`w-5 h-5 ${color}`} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${isDone ? "text-zinc-400 dark:text-gray-500 line-through" : "text-foreground"}`}>
                      {label} Challenge
                    </span>
                  </div>
                  <span className="text-xs text-zinc-500 dark:text-gray-400">
                    {isDone ? "Completed ✓" : `+${points} points on completion`}
                  </span>
                </div>
                {!isDone && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className={`text-sm font-bold ${color}`}>+{points}</span>
                    <ChevronRight className="w-4 h-4 text-zinc-400" />
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* XP info */}
      {!status?.allComplete && (
        <p className="text-xs text-zinc-500 dark:text-gray-500 text-center mt-4">
          Complete all 3 to earn <span className="text-indigo-400 font-bold">50–100 XP</span> based on performance
        </p>
      )}
      {status?.allComplete && (
        <p className="text-xs text-green-400 text-center mt-4 font-medium">
          🎉 All challenges complete! Come back tomorrow for more.
        </p>
      )}
    </LiquidGlassCard>
  );
}

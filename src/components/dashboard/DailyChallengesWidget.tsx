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
  { key: "easy" as const, label: "Easy", points: 10, icon: Zap, color: "text-green-500 dark:text-green-400", bg: "bg-green-500/10 dark:bg-green-400/10", border: "border-green-500/20 dark:border-green-400/20", fill: "bg-green-500 dark:bg-green-400" },
  { key: "medium" as const, label: "Medium", points: 30, icon: Shield, color: "text-amber-500 dark:text-yellow-400", bg: "bg-amber-500/10 dark:bg-yellow-400/10", border: "border-amber-500/20 dark:border-yellow-400/20", fill: "bg-amber-500 dark:bg-yellow-400" },
  { key: "hard" as const, label: "Hard", points: 50, icon: Flame, color: "text-red-500 dark:text-red-400", bg: "bg-red-500/10 dark:bg-red-400/10", border: "border-red-500/20 dark:border-red-400/20", fill: "bg-red-500 dark:bg-red-400" },
];

export function DailyChallengesWidget() {
  const router = useRouter();
  const [status, setStatus] = useState<DailyStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/student/daily-challenges")
      .then((r) => {
        if (!r.ok) return null;
        return r.json();
      })
      .then((data) => {
        if (data && data.easy) {
          setStatus(data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const doneCount = status?.easy
    ? [status.easy?.done, status.medium?.done, status.hard?.done].filter(Boolean).length
    : 0;
  const progressPct = (doneCount / 3) * 100;

  return (
    <LiquidGlassCard className="p-6" accentColor="#6366f1">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg neu-raised-sm dark:bg-indigo-500/20 dark:border dark:border-indigo-500/30 dark:shadow-none">
            <Flame className="w-5 h-5 text-primary dark:text-indigo-400" />
          </div>
          <h2 className="text-lg font-bold text-foreground tracking-tight">Daily Challenges</h2>
        </div>
        {status?.allComplete && (
          <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-500/10 dark:bg-green-400/10 px-3 py-1 rounded-full border border-green-500/20 dark:border-green-400/20">
            +{status?.xpAwarded || 0} XP Earned!
          </span>
        )}
        {!status?.allComplete && !loading && (
          <span className="text-xs text-muted-foreground bg-black/5 dark:bg-white/5 px-3 py-1 rounded-full border border-black/10 dark:border-white/10">
            {doneCount}/3 done
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 rounded-full mb-5 overflow-hidden neu-progress-track">
        <div
          className="h-full bg-primary dark:bg-indigo-500 rounded-full transition-all duration-700"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Challenge rows */}
      <div className="space-y-2.5">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-14 rounded-xl animate-pulse neu-flat dark:bg-white/5 dark:shadow-none" />
          ))
        ) : (
          DIFFICULTY_CONFIG.map(({ key, label, points, icon: Icon, color, bg, border, fill }) => {
            const isDone = status?.[key]?.done ?? false;
            return (
              <button
                key={key}
                onClick={() => !isDone && router.push("/student-dashboard/stage-1-communication")}
                disabled={isDone}
                className={`w-full flex items-center gap-4 p-3.5 rounded-xl transition-all duration-200 text-left ${
                  isDone
                    ? "neu-inset-sm dark:bg-white/3 dark:border dark:border-white/5 opacity-70"
                    : `neu-flat dark:${bg} dark:${border} dark:shadow-none hover:scale-[1.01] active:scale-[0.99] cursor-pointer`
                }`}
              >
                <div className={`w-9 h-9 flex-shrink-0 rounded-lg flex items-center justify-center ${isDone ? "neu-inset-sm dark:bg-green-400/10 dark:border dark:border-green-400/20" : `neu-raised-sm dark:${bg} dark:border dark:${border} dark:shadow-none`}`}>
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 dark:text-green-400" />
                  ) : (
                    <Icon className={`w-5 h-5 ${color}`} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${isDone ? "text-muted-foreground line-through" : "text-foreground"}`}>
                      {label} Challenge
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {isDone ? "Completed ✓" : `+${points} points on completion`}
                  </span>
                </div>
                {!isDone && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className={`text-sm font-bold ${color}`}>+{points}</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* XP info */}
      {!status?.allComplete && (
        <p className="text-xs text-muted-foreground text-center mt-4">
          Complete all 3 to earn <span className="text-primary dark:text-indigo-400 font-bold">50–100 XP</span> based on performance
        </p>
      )}
      {status?.allComplete && (
        <p className="text-xs text-green-600 dark:text-green-400 text-center mt-4 font-medium">
          🎉 All challenges complete! Come back tomorrow for more.
        </p>
      )}
    </LiquidGlassCard>
  );
}

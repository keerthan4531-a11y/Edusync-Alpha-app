"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card";

export type ChallengeSkeletonVariant =
  | "listening-mcq"
  | "listening-fill"
  | "listening-go"
  | "reading"
  | "writing-tutor"
  | "writing-image"
  | "writing-filter"
  | "speaking-speak-it"
  | "speaking-listen-speak"
  | "speaking-analyzer"
  | "default";

interface ChallengeSkeletonProps {
  variant?: ChallengeSkeletonVariant;
}

export function ChallengeSkeleton({ variant = "default" }: ChallengeSkeletonProps) {
  // 1. Listening - Words Fill In
  if (variant === "listening-fill") {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <LiquidGlassCard className="p-8 md:p-12 flex flex-col items-center justify-center border-indigo-500/20 max-w-xl mx-auto w-full" accentColor="#6366f1">
          <Skeleton className="h-8 w-48 mb-8 rounded-xl" />
          <div className="flex flex-col items-center justify-center w-full my-2">
            <Skeleton className="h-24 w-24 md:h-28 md:w-28 rounded-full mb-5" />
            <Skeleton className="h-4 w-44 rounded-md" />
          </div>
        </LiquidGlassCard>
      </div>
    );
  }

  // 2. Listening - Listen & Go
  if (variant === "listening-go") {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <LiquidGlassCard className="p-8 md:p-12 flex flex-col items-center justify-center border-indigo-500/20 max-w-xl mx-auto w-full" accentColor="#6366f1">
          <Skeleton className="h-8 w-48 mb-8 rounded-xl" />
          <div className="flex flex-col items-center justify-center w-full my-2">
            <Skeleton className="h-24 w-24 md:h-28 md:w-28 rounded-full mb-5" />
            <Skeleton className="h-4 w-44 rounded-md" />
          </div>
        </LiquidGlassCard>
      </div>
    );
  }

  // 3. Reading - Read & Answer
  if (variant === "reading") {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <LiquidGlassCard className="p-6 border-indigo-500/20 relative" accentColor="#6366f1">
          {/* Timer Skeleton */}
          <div className="absolute top-4 right-6">
            <Skeleton className="h-10 w-24 rounded-full" />
          </div>
          
          <Skeleton className="h-7 w-48 mb-6 mt-4 md:mt-0 rounded-xl" />
          <div className="space-y-3 py-2 mb-8">
            <Skeleton className="h-4 w-full rounded-lg" />
            <Skeleton className="h-4 w-[95%] rounded-lg" />
            <Skeleton className="h-4 w-[90%] rounded-lg" />
            <Skeleton className="h-4 w-[85%] rounded-lg" />
            <Skeleton className="h-4 w-[60%] rounded-lg" />
          </div>

          {/* Button Skeleton */}
          <Skeleton className="h-12 w-48 rounded-xl" />
        </LiquidGlassCard>
      </div>
    );
  }

  // 4. Writing - Write In (Tutor)
  if (variant === "writing-tutor") {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <LiquidGlassCard className="p-6 border-indigo-500/20" accentColor="#6366f1">
          <Skeleton className="h-7 w-36 mb-4 rounded-xl" />
          <Skeleton className="h-4 w-full rounded-lg mb-2" />
          <Skeleton className="h-4 w-3/4 rounded-lg" />
        </LiquidGlassCard>

        <div className="w-full mt-2 space-y-4">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-14 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  // 5. Writing - Write About (Image)
  if (variant === "writing-image") {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <LiquidGlassCard className="p-6 border-indigo-500/20" accentColor="#6366f1">
          <Skeleton className="h-7 w-40 mb-4 rounded-xl" />
          {/* Image Placeholder Skeleton */}
          <Skeleton className="h-64 w-full rounded-2xl mb-4" />
        </LiquidGlassCard>

        <div className="w-full mt-2 space-y-4">
          <Skeleton className="h-44 w-full rounded-2xl" />
          <Skeleton className="h-14 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  // 6. Writing - Write Out (Filter Rewrite)
  if (variant === "writing-filter") {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <LiquidGlassCard className="p-6 border-indigo-500/20" accentColor="#6366f1">
          <Skeleton className="h-7 w-36 mb-4 rounded-xl" />
          <Skeleton className="h-4 w-3/4 mb-6 rounded-md" />

          {/* Original Sentence Box Skeleton */}
          <div className="p-5 bg-black/5 dark:bg-white/5 rounded-2xl space-y-2 mb-6">
            <Skeleton className="h-3 w-28 rounded-md mb-2" />
            <Skeleton className="h-5 w-full rounded-lg" />
          </div>

          {/* Banned Word Pills Skeleton */}
          <div className="space-y-2 mb-4">
            <Skeleton className="h-3 w-36 rounded-md mb-2" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20 rounded-lg" />
              <Skeleton className="h-8 w-24 rounded-lg" />
              <Skeleton className="h-8 w-20 rounded-lg" />
            </div>
          </div>
        </LiquidGlassCard>

        <div className="w-full mt-2 space-y-4">
          <Skeleton className="h-44 w-full rounded-2xl" />
          <Skeleton className="h-14 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  // 7. Speaking - Speak It
  if (variant === "speaking-speak-it") {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <LiquidGlassCard className="p-6" accentColor="#6366f1">
          <Skeleton className="h-7 w-32 mb-4 rounded-xl" />
          <div className="p-6 bg-black/5 dark:bg-white/5 rounded-2xl min-h-[120px] flex items-center justify-center">
            <Skeleton className="h-6 w-3/4 rounded-lg" />
          </div>
        </LiquidGlassCard>

        <div className="flex flex-col items-center pt-2 space-y-4">
          <Skeleton className="w-28 h-28 rounded-full shadow-lg" />
          <Skeleton className="h-4 w-40 rounded-md" />
          <Skeleton className="h-14 w-full rounded-2xl mt-4" />
        </div>
      </div>
    );
  }

  // 8. Speaking - Listen & Speak (Shadowing)
  if (variant === "speaking-listen-speak") {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <LiquidGlassCard className="p-6" accentColor="#6366f1">
          <Skeleton className="h-7 w-44 mb-4 rounded-xl" />
          <div className="flex justify-center">
            <Skeleton className="h-10 w-28 rounded-xl" />
          </div>
        </LiquidGlassCard>

        <div className="flex flex-col items-center pt-2 space-y-4">
          <Skeleton className="w-28 h-28 rounded-full shadow-lg" />
          <Skeleton className="h-4 w-52 rounded-md" />
          <Skeleton className="h-14 w-full rounded-2xl mt-4" />
        </div>
      </div>
    );
  }

  // 9. Speaking - Practice Speaking (Analyzer)
  if (variant === "speaking-analyzer") {
    return (
      <div className="space-y-6 max-w-xl mx-auto animate-in fade-in duration-300">
        <LiquidGlassCard className="p-6" accentColor="#6366f1">
          <Skeleton className="h-6 w-44 mb-2 rounded-lg" />
          <Skeleton className="h-4 w-full mb-6 rounded-md" />

          {/* Canvas Box Skeleton */}
          <Skeleton className="h-32 w-full rounded-2xl mb-6" />

          <div className="flex flex-col items-center space-y-4">
            <Skeleton className="w-20 h-20 rounded-full" />
            <Skeleton className="h-4 w-48 rounded-md" />
          </div>
        </LiquidGlassCard>
      </div>
    );
  }

  // Default / MCQ Skeleton (Listening MCQ, etc.)
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <LiquidGlassCard className="p-8 md:p-12 flex flex-col items-center justify-center border-indigo-500/20 max-w-xl mx-auto w-full" accentColor="#6366f1">
        <Skeleton className="h-8 w-48 mb-8 rounded-xl" />
        <div className="flex flex-col items-center justify-center w-full my-2">
          <Skeleton className="h-24 w-24 md:h-28 md:w-28 rounded-full mb-5" />
          <Skeleton className="h-4 w-44 rounded-md" />
        </div>
      </LiquidGlassCard>
    </div>
  );
}

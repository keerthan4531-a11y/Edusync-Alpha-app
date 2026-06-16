"use client";

import { useState, useEffect } from "react";
import { Layers, X, ArrowLeft, ArrowRight, Volume2, Flag, CheckCircle2, XCircle } from "lucide-react";

export interface FlashcardWord {
  word: string;
  meaning: string;
  tamil?: string;
  example?: string;
  seen?: number;
  correct?: number;
  flagged?: boolean;
}

interface AdvancedFlashcardsProps {
  words: FlashcardWord[];
  onClose: () => void;
  onUpdateWord: (originalWord: string, updates: Partial<FlashcardWord>) => void;
  speakWord: (word: string) => void;
}

export function AdvancedFlashcards({ words, onClose, onUpdateWord, speakWord }: AdvancedFlashcardsProps) {
  const [studyMode, setStudyMode] = useState<"all" | "flagged" | "unlearned" | "learned">("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  // Filter words based on mode
  const filteredWords = words.filter((w) => {
    if (studyMode === "all") return true;
    if (studyMode === "flagged") return w.flagged === true;
    
    const mastery = (w.correct || 0) / Math.max(w.seen || 1, 1);
    if (studyMode === "unlearned") return mastery < 0.75;
    if (studyMode === "learned") return mastery >= 0.75;
    return true;
  });

  const currentWord = filteredWords[currentIndex];

  useEffect(() => {
    // Reset state when mode changes
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowFeedback(false);
  }, [studyMode]);

  useEffect(() => {
    // Show feedback buttons after flip animation completes
    let timeout: NodeJS.Timeout;
    if (isFlipped) {
      timeout = setTimeout(() => setShowFeedback(true), 400);
    } else {
      setShowFeedback(false);
    }
    return () => clearTimeout(timeout);
  }, [isFlipped]);

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % (filteredWords.length || 1));
    }, 200);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + filteredWords.length) % (filteredWords.length || 1));
    }, 200);
  };

  const handleToggleFlag = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentWord) {
      onUpdateWord(currentWord.word, { flagged: !currentWord.flagged });
    }
  };

  const handleFeedback = (isCorrect: boolean) => {
    if (!currentWord) return;
    
    const newSeen = (currentWord.seen || 0) + 1;
    const newCorrect = (currentWord.correct || 0) + (isCorrect ? 1 : 0);
    
    onUpdateWord(currentWord.word, {
      seen: newSeen,
      correct: newCorrect
    });

    // Auto advance
    setIsFlipped(false);
    setTimeout(() => {
      if (currentIndex < filteredWords.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else if (studyMode !== "all") {
        // If we reached the end of a filtered list, we might want to reset or stay
        setCurrentIndex(0);
      }
    }, 300);
  };

  if (!words || words.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[1000] bg-black/40 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center text-foreground bg-white/80 dark:bg-black/80 p-4 rounded-2xl border border-black/10 dark:border-white/10 shadow-lg">
          <h2 className="text-[17px] font-semibold flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Advanced Flashcards
          </h2>
          <div className="flex items-center gap-3">
            <select
              value={studyMode}
              onChange={(e) => setStudyMode(e.target.value as any)}
              className="bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 text-foreground text-[13px] rounded-lg px-2 py-1.5 focus:outline-none"
            >
              <option value="all">Study All</option>
              <option value="flagged">Flagged Only</option>
              <option value="unlearned">Not Mastered</option>
              <option value="learned">Mastered</option>
            </select>
            <button 
              onClick={onClose}
              className="p-1.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {filteredWords.length > 0 ? (
          <div className="space-y-4">
            {/* 3D card wrapper */}
            <div 
              onClick={() => setIsFlipped(!isFlipped)}
              className="w-full h-[320px] cursor-pointer"
              style={{ perspective: "1000px" }}
            >
              <div 
                className="relative w-full h-full duration-500 rounded-3xl"
                style={{ 
                  transformStyle: "preserve-3d",
                  transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)"
                }}
              >
                {/* Front */}
                <div 
                  className="absolute inset-0 bg-white dark:bg-[#18181b] border border-black/10 dark:border-white/10 backdrop-blur-xl rounded-3xl p-8 flex flex-col justify-between items-center text-center shadow-2xl"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <div className="w-full flex justify-between">
                    <span className="text-[11px] text-zinc-500 font-bold bg-black/5 dark:bg-white/5 px-2 py-1 rounded">
                      Mastery: {currentWord.seen ? Math.round(((currentWord.correct||0) / currentWord.seen) * 100) : 0}%
                    </span>
                    <button 
                      onClick={handleToggleFlag}
                      className={`p-1.5 rounded-full transition-colors ${currentWord.flagged ? 'text-red-500 bg-red-500/10' : 'text-zinc-400 hover:text-red-400 hover:bg-black/5'}`}
                    >
                      <Flag className="w-4 h-4" fill={currentWord.flagged ? "currentColor" : "none"} />
                    </button>
                  </div>
                  <div>
                    <h1 className="text-[38px] font-extrabold text-foreground capitalize">
                      {currentWord.word}
                    </h1>
                    <p className="text-zinc-500 dark:text-gray-500 text-[13px] mt-2 font-mono">Tap to flip</p>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); speakWord(currentWord.word); }}
                    className="p-3 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-colors"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Back */}
                <div 
                  className="absolute inset-0 bg-gradient-to-br from-blue-50/90 to-indigo-50/90 dark:from-[#1e1b4b] dark:to-[#312e81] border border-blue-200 dark:border-blue-800/50 backdrop-blur-xl rounded-3xl p-8 flex flex-col justify-between text-left shadow-2xl overflow-y-auto"
                  style={{ 
                    backfaceVisibility: "hidden", 
                    transform: "rotateY(180deg)" 
                  }}
                >
                  <div className="space-y-4">
                    <div>
                      <span className="text-[11px] text-blue-700 dark:text-blue-300 font-bold block mb-1 uppercase tracking-wider">Meaning</span>
                      <p className="text-foreground text-[17px] leading-relaxed font-medium">
                        {currentWord.meaning}
                      </p>
                    </div>
                    {currentWord.tamil && (
                      <div>
                        <span className="text-[11px] text-blue-700 dark:text-blue-300 font-bold block mb-1 uppercase tracking-wider">Tamil Translation</span>
                        <p className="text-zinc-700 dark:text-gray-300 text-[15px] italic">{currentWord.tamil}</p>
                      </div>
                    )}
                    {currentWord.example && (
                      <div className="pt-3 border-t border-black/10 dark:border-white/10">
                        <span className="text-[11px] text-blue-700 dark:text-blue-300 font-bold block mb-1 uppercase tracking-wider">Example</span>
                        <p className="text-zinc-600 dark:text-gray-400 text-[14px] italic">
                          "{currentWord.example}"
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="text-center text-[11px] text-blue-600/50 dark:text-blue-300/50 font-semibold pt-3 select-none">
                    Did you know it?
                  </div>
                </div>
              </div>
            </div>

            {/* Feedback & Navigation Panel */}
            <div className="flex flex-col gap-3">
              {/* Feedback Buttons - Only show when flipped */}
              {isFlipped && (
                <div className={`flex gap-3 transition-all duration-300 ${showFeedback ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  <button 
                    onClick={() => handleFeedback(false)}
                    className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-red-500/20"
                  >
                    <XCircle className="w-5 h-5" /> I didn't know
                  </button>
                  <button 
                    onClick={() => handleFeedback(true)}
                    className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-green-500/20"
                  >
                    <CheckCircle2 className="w-5 h-5" /> I knew this
                  </button>
                </div>
              )}

              {/* Standard Navigation */}
              <div className="flex justify-between items-center text-foreground bg-white/80 dark:bg-black/80 border border-black/10 dark:border-white/10 px-5 py-3 rounded-2xl shadow-lg">
                <button 
                  onClick={handlePrev}
                  className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                
                <span className="text-[13px] font-semibold text-zinc-500 dark:text-gray-400">
                  Card {currentIndex + 1} of {filteredWords.length}
                </span>

                <button 
                  onClick={handleNext}
                  className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-colors"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 bg-white/80 dark:bg-black/80 border border-black/10 dark:border-white/10 rounded-3xl text-center shadow-2xl">
            <Layers className="w-12 h-12 text-zinc-400 mx-auto mb-4 opacity-50" />
            <h3 className="text-[17px] font-semibold text-foreground mb-1">No cards to study</h3>
            <p className="text-[13px] text-zinc-500">There are no flashcards available for the current study mode.</p>
          </div>
        )}
      </div>
    </div>
  );
}

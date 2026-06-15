"use client";

import { useState, useEffect, useRef } from "react";
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card";
import { 
  Book, 
  Search, 
  Volume2, 
  Edit, 
  Trash2, 
  Plus, 
  Layers, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  ArrowLeft, 
  X, 
  RotateCcw, 
  Home, 
  HelpCircle,
  Sparkles,
  BookOpen,
  Award
} from "lucide-react";

interface SavedWord {
  word: string;
  meaning: string;
  tamil: string;
  example: string;
  notes?: string;
  category: string;
  dateAdded: string;
  mastered: boolean;
}

export function VocabularyModule() {
  const [activeSubTab, setActiveSubTab] = useState<"daily-word" | "dictionary" | "quiz">("daily-word");
  
  // Daily Word State
  const [dailyWords, setDailyWords] = useState<any[]>([]);
  const [currentDailyWordIndex, setCurrentDailyWordIndex] = useState(0);
  const [loadingDaily, setLoadingDaily] = useState(true);

  // Dictionary State
  const [myWords, setMyWords] = useState<SavedWord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  
  // Word Form fields
  const [formWord, setFormWord] = useState("");
  const [formMeaning, setFormMeaning] = useState("");
  const [formTamil, setFormTamil] = useState("");
  const [formExample, setFormExample] = useState("");
  const [formNotes, setFormNotes] = useState("");

  // Flashcards State
  const [isFlashcardsOpen, setIsFlashcardsOpen] = useState(false);
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Quizzes State
  const [quizActive, setQuizActive] = useState(false);
  const [quizType, setQuizType] = useState<"meaning" | "fill" | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [fillAnswer, setFillAnswer] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [bonusEarned, setBonusEarned] = useState(false);

  // Fetch initial daily words
  useEffect(() => {
    async function fetchDailyWords() {
      try {
        setLoadingDaily(true);
        const res = await fetch("/api/communication/vocabulary/daily");
        if (res.ok) {
          const data = await res.json();
          // We can use the meaning quizzes as today's vocabulary daily list
          if (data.meaning_quizzes && data.meaning_quizzes.length > 0) {
            setDailyWords(data.meaning_quizzes);
          }
        }
      } catch (err) {
        console.error("Failed to fetch daily words", err);
      } finally {
        setLoadingDaily(false);
      }
    }
    fetchDailyWords();
  }, []);

  // Load My Words from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("myWords");
    if (saved) {
      try {
        setMyWords(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse myWords from localStorage", e);
      }
    }
  }, []);

  // Save My Words helper
  const saveMyWordsToStorage = (updatedWords: SavedWord[]) => {
    setMyWords(updatedWords);
    localStorage.setItem("myWords", JSON.stringify(updatedWords));
  };

  // Play word pronunciation
  const speakWord = (word: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = "en-US";
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Add or Update custom word
  const handleSaveWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formWord.trim() || !formMeaning.trim() || !formTamil.trim()) {
      alert("Please fill in Word, Meaning, and Tamil translation fields.");
      return;
    }

    const wordData: SavedWord = {
      word: formWord.trim(),
      meaning: formMeaning.trim(),
      tamil: formTamil.trim(),
      example: formExample.trim(),
      notes: formNotes.trim(),
      category: "my-words",
      dateAdded: new Date().toISOString(),
      mastered: false
    };

    let updated: SavedWord[];
    if (editingIndex !== null) {
      updated = [...myWords];
      updated[editingIndex] = wordData;
    } else {
      updated = [wordData, ...myWords];
    }

    saveMyWordsToStorage(updated);
    handleCloseModal();
  };

  const handleOpenAddModal = () => {
    setEditingIndex(null);
    setFormWord("");
    setFormMeaning("");
    setFormTamil("");
    setFormExample("");
    setFormNotes("");
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (idx: number) => {
    const w = myWords[idx];
    setEditingIndex(idx);
    setFormWord(w.word);
    setFormMeaning(w.meaning);
    setFormTamil(w.tamil);
    setFormExample(w.example || "");
    setFormNotes(w.notes || "");
    setIsAddModalOpen(true);
  };

  const handleDeleteWord = (idx: number) => {
    if (confirm("Are you sure you want to delete this word from your dictionary?")) {
      const updated = myWords.filter((_, i) => i !== idx);
      saveMyWordsToStorage(updated);
    }
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingIndex(null);
  };

  // Save current daily word to dictionary
  const handleSaveDailyWord = (wordObj: any) => {
    if (myWords.some(w => w.word.toLowerCase() === wordObj.word.toLowerCase())) {
      alert("This word is already saved in your personal dictionary.");
      return;
    }
    const newWord: SavedWord = {
      word: wordObj.word,
      meaning: wordObj.meaning,
      tamil: wordObj.tamil || "",
      example: wordObj.example || "",
      notes: "Saved from daily word list",
      category: "my-words",
      dateAdded: new Date().toISOString(),
      mastered: false
    };
    saveMyWordsToStorage([newWord, ...myWords]);
    alert(`"${wordObj.word}" has been saved to your dictionary!`);
  };

  // Flashcards navigation
  const nextFlashcard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setFlashcardIndex((prev) => (prev + 1) % (myWords.length > 0 ? myWords.length : 1));
    }, 200);
  };

  const prevFlashcard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setFlashcardIndex((prev) => (prev - 1 + myWords.length) % (myWords.length > 0 ? myWords.length : 1));
    }, 200);
  };

  // Quiz launcher
  const handleStartQuiz = async (type: "meaning" | "fill") => {
    setIsLoadingQuiz(true);
    setQuizType(type);
    setCurrentQuizIndex(0);
    setQuizScore(0);
    setSelectedAnswerIndex(null);
    setFillAnswer("");
    setIsSubmitted(false);
    setQuizFinished(false);
    setBonusEarned(false);

    try {
      const res = await fetch("/api/communication/vocabulary/daily");
      if (res.ok) {
        const data = await res.json();
        const questions = type === "meaning" ? data.meaning_quizzes : data.fill_quizzes;
        if (questions && questions.length > 0) {
          setQuizQuestions(questions);
          setQuizActive(true);
        } else {
          alert("No quiz questions available for this type today.");
        }
      } else {
        alert("Failed to load daily quizzes from server.");
      }
    } catch (e) {
      console.error(e);
      alert("Network error. Please try again.");
    } finally {
      setIsLoadingQuiz(false);
    }
  };

  // Submit MCQ Answer
  const handleSelectMCQ = (idx: number) => {
    if (isSubmitted) return;
    setSelectedAnswerIndex(idx);
  };

  const handleConfirmMCQ = () => {
    if (selectedAnswerIndex === null || isSubmitted) return;
    const currentQ = quizQuestions[currentQuizIndex];
    const correctIdx = currentQ.correct;
    
    const correct = selectedAnswerIndex === correctIdx;
    setIsCorrect(correct);
    if (correct) setQuizScore(prev => prev + 1);
    setIsSubmitted(true);
  };

  // Submit Fill in the blank
  const handleConfirmFill = () => {
    if (!fillAnswer.trim() || isSubmitted) return;
    const currentQ = quizQuestions[currentQuizIndex];
    const correctAns = currentQ.word.toLowerCase().trim();
    const userAns = fillAnswer.toLowerCase().trim();
    
    // Fuzzy matching similar to prototype
    const correct = userAns === correctAns || correctAns.includes(userAns) && userAns.length >= 3;
    setIsCorrect(correct);
    if (correct) setQuizScore(prev => prev + 1);
    setIsSubmitted(true);
  };

  // Next question or finish quiz
  const handleNextQuizQuestion = async () => {
    if (currentQuizIndex < quizQuestions.length - 1) {
      setCurrentQuizIndex(prev => prev + 1);
      setSelectedAnswerIndex(null);
      setFillAnswer("");
      setIsSubmitted(false);
    } else {
      // Quiz Finished! Save activity to backend
      setQuizActive(false);
      setQuizFinished(true);
      const finalPercentage = Math.round((quizScore / quizQuestions.length) * 100);
      
      try {
        const res = await fetch("/api/communication/vocabulary/record", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quizType: quizType,
            score: finalPercentage
          })
        });
        if (res.ok) {
          const result = await res.json();
          if (result.both_complete) {
            setBonusEarned(true);
          }
        }
      } catch (err) {
        console.error("Failed to save quiz score", err);
      }
    }
  };

  // Filter dictionary words
  const filteredWords = myWords.filter(
    (w) =>
      w.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.meaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.tamil.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeDailyWord = dailyWords[currentDailyWordIndex];

  return (
    <div className="space-y-6">
      {/* Sub tabs selector */}
      <div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-2xl w-fit">
        <button
          onClick={() => { setActiveSubTab("daily-word"); setQuizActive(false); setQuizFinished(false); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeSubTab === "daily-word"
              ? "bg-white/10 text-white shadow-md"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Sparkles className="w-4 h-4 text-purple-400" />
          Word of the Day
        </button>
        <button
          onClick={() => { setActiveSubTab("dictionary"); setQuizActive(false); setQuizFinished(false); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeSubTab === "dictionary"
              ? "bg-white/10 text-white shadow-md"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Book className="w-4 h-4 text-blue-400" />
          My Word List ({myWords.length})
        </button>
        <button
          onClick={() => { setActiveSubTab("quiz"); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeSubTab === "quiz"
              ? "bg-white/10 text-white shadow-md"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <HelpCircle className="w-4 h-4 text-green-400" />
          Interactive Quizzes
        </button>
      </div>

      {/* RENDER VIEW: DAILY WORD */}
      {activeSubTab === "daily-word" && (
        <div className="space-y-6">
          <LiquidGlassCard className="p-6 md:p-8" accentColor="#a78bfa">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-purple-400 flex items-center gap-2">
                <Sparkles className="w-5 h-5" /> Today's Word Stream
              </h2>
              <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-300 rounded-full text-xs font-semibold">
                Word {currentDailyWordIndex + 1} of {dailyWords.length || 0}
              </span>
            </div>

            {loadingDaily ? (
              <div className="py-16 text-center text-gray-400">Loading daily vocabulary...</div>
            ) : activeDailyWord ? (
              <div className="text-center space-y-6">
                <div>
                  <h1 className="text-5xl font-extrabold text-white tracking-tight capitalize select-all">
                    {activeDailyWord.word}
                  </h1>
                  <p className="text-gray-400 text-lg mt-2 font-mono">
                    {activeDailyWord.pronunciation || "/.../"}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-3xl mx-auto">
                  <div className="p-5 bg-white/5 rounded-2xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                    <span className="text-xs text-purple-400 font-semibold block mb-1">Meaning (பொருள்)</span>
                    <p className="text-white text-base leading-relaxed">{activeDailyWord.meaning}</p>
                    {activeDailyWord.tamil && (
                      <p className="text-purple-300 italic text-sm mt-2">{activeDailyWord.tamil}</p>
                    )}
                  </div>
                  <div className="p-5 bg-white/5 rounded-2xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                    <span className="text-xs text-purple-400 font-semibold block mb-1">Example usage</span>
                    <p className="text-gray-300 text-base italic leading-relaxed">
                      "{activeDailyWord.example}"
                    </p>
                  </div>
                </div>

                <div className="flex justify-center items-center gap-3 pt-4">
                  <button
                    onClick={() => speakWord(activeDailyWord.word)}
                    className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-white transition-colors"
                    title="Listen Pronunciation"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleSaveDailyWord(activeDailyWord)}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-purple-900/20"
                  >
                    Save to My Word List
                  </button>
                  <button
                    onClick={() => setCurrentDailyWordIndex((prev) => (prev + 1) % dailyWords.length)}
                    className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-white transition-colors"
                    title="Next word"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-gray-400">
                No daily vocabulary words available.
              </div>
            )}
          </LiquidGlassCard>
        </div>
      )}

      {/* RENDER VIEW: DICTIONARY */}
      {activeSubTab === "dictionary" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
            {/* Search input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search word, meaning, or translation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleOpenAddModal}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md"
              >
                <Plus className="w-4 h-4" /> Add Word
              </button>
              <button
                disabled={myWords.length === 0}
                onClick={() => { setFlashcardIndex(0); setIsFlipped(false); setIsFlashcardsOpen(true); }}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl text-sm font-semibold hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Layers className="w-4 h-4 text-blue-400" /> Study Flashcards
              </button>
            </div>
          </div>

          {/* Words list */}
          {filteredWords.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredWords.map((word, idx) => (
                <LiquidGlassCard key={idx} className="p-5 hover:-translate-y-1" accentColor="#3b82f6">
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-white capitalize">{word.word}</h3>
                      {word.notes && <p className="text-xs text-gray-500 mt-0.5">{word.notes}</p>}
                    </div>
                    
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => speakWord(word.word)}
                        className="p-2 bg-white/5 border border-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-colors"
                        title="Pronounce"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(idx)}
                        className="p-2 bg-white/5 border border-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteWord(idx)}
                        className="p-2 bg-white/5 border border-white/5 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block">Meaning</span>
                      <p className="text-gray-200">{word.meaning}</p>
                    </div>
                    {word.tamil && (
                      <div>
                        <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block">Tamil Meaning</span>
                        <p className="text-blue-300 italic">{word.tamil}</p>
                      </div>
                    )}
                    {word.example && (
                      <div className="pt-2 border-t border-white/5">
                        <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block">Example</span>
                        <p className="text-gray-400 italic font-light">"{word.example}"</p>
                      </div>
                    )}
                  </div>
                </LiquidGlassCard>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center text-gray-400 bg-white/5 border border-white/10 rounded-2xl">
              <BookOpen className="w-10 h-10 mx-auto text-gray-600 mb-3" />
              {searchQuery ? "No matching words found." : "No words saved yet. Click 'Add Word' to start building your glossary!"}
            </div>
          )}
        </div>
      )}

      {/* RENDER VIEW: QUIZ MAIN MENU */}
      {activeSubTab === "quiz" && !quizActive && !quizFinished && (
        <div className="max-w-2xl mx-auto space-y-6">
          <LiquidGlassCard className="p-6 md:p-8" accentColor="#10b981">
            <h2 className="text-xl font-bold text-green-400 mb-2 flex items-center gap-2">
              <HelpCircle className="w-5 h-5" /> Quiz Arena
            </h2>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Complete today's daily meaning quiz and fill-in-the-blank challenge to earn credits and boost your learning streak.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 bg-white/5 border border-white/10 rounded-2xl space-y-4 hover:border-green-500/30 transition-all flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" /> Meaning Quiz
                  </h3>
                  <p className="text-sm text-gray-400">
                    Test your understanding of vocabulary definitions. Select the correct option.
                  </p>
                </div>
                <button
                  disabled={isLoadingQuiz}
                  onClick={() => handleStartQuiz("meaning")}
                  className="w-full py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-green-950/20"
                >
                  {isLoadingQuiz ? "Loading..." : "Start Meaning Quiz"}
                </button>
              </div>

              <div className="p-5 bg-white/5 border border-white/10 rounded-2xl space-y-4 hover:border-green-500/30 transition-all flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Edit className="w-4 h-4 text-blue-400" /> Fill in the Blanks
                  </h3>
                  <p className="text-sm text-gray-400">
                    Complete context sentences using the appropriate vocabulary word.
                  </p>
                </div>
                <button
                  disabled={isLoadingQuiz}
                  onClick={() => handleStartQuiz("fill")}
                  className="w-full py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-green-950/20"
                >
                  {isLoadingQuiz ? "Loading..." : "Start Fill in Blanks"}
                </button>
              </div>
            </div>
          </LiquidGlassCard>
        </div>
      )}

      {/* RENDER VIEW: ACTIVE QUIZ */}
      {quizActive && quizQuestions.length > 0 && (
        <div className="max-w-2xl mx-auto space-y-6">
          <LiquidGlassCard className="p-6 md:p-8" accentColor="#10b981">
            {/* Quiz progress */}
            <div className="flex justify-between items-center mb-4 text-sm">
              <span className="text-gray-400">
                Question <span className="font-semibold text-white">{currentQuizIndex + 1}/{quizQuestions.length}</span>
              </span>
              <span className="text-gray-400">
                Score: <span className="font-semibold text-green-400">{Math.round((quizScore / (currentQuizIndex || 1)) * 100)}%</span>
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-white/5 border border-white/5 rounded-full overflow-hidden mb-6">
              <div 
                className="h-full bg-green-500 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuizIndex) / quizQuestions.length) * 100}%` }}
              />
            </div>

            {/* Question Card */}
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl mb-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
              {quizType === "meaning" ? (
                <div>
                  <span className="text-xs text-green-400 font-semibold block mb-1">What is the correct meaning of:</span>
                  <h3 className="text-2xl font-bold text-white capitalize">"{quizQuestions[currentQuizIndex].word}"</h3>
                </div>
              ) : (
                <div>
                  <span className="text-xs text-green-400 font-semibold block mb-1">Complete the sentence:</span>
                  <p className="text-lg text-white font-medium leading-relaxed">
                    {quizQuestions[currentQuizIndex].sentence.replace("______", "_____")}
                  </p>
                  <p className="text-xs text-gray-500 italic mt-2">Hint: {quizQuestions[currentQuizIndex].hint}</p>
                </div>
              )}
            </div>

            {/* Answer Controls */}
            {quizType === "meaning" ? (
              <div className="grid grid-cols-1 gap-3">
                {quizQuestions[currentQuizIndex].options.map((option: string, idx: number) => {
                  let optionStyle = "border-white/10 hover:bg-white/10 text-white";
                  if (isSubmitted) {
                    if (idx === quizQuestions[currentQuizIndex].correct) {
                      optionStyle = "bg-green-500/20 border-green-500 text-green-300 pointer-events-none";
                    } else if (idx === selectedAnswerIndex) {
                      optionStyle = "bg-red-500/20 border-red-500 text-red-300 pointer-events-none";
                    } else {
                      optionStyle = "border-white/5 text-gray-500 pointer-events-none opacity-40";
                    }
                  } else if (selectedAnswerIndex === idx) {
                    optionStyle = "bg-blue-600/20 border-blue-500 text-blue-300";
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectMCQ(idx)}
                      disabled={isSubmitted}
                      className={`w-full p-4 border rounded-xl text-left text-sm font-medium transition-all ${optionStyle}`}
                    >
                      <span className="inline-block w-6 h-6 rounded-full text-center leading-6 text-xs font-bold bg-white/10 text-gray-300 mr-3">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      {option}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Type your answer..."
                  disabled={isSubmitted}
                  value={fillAnswer}
                  onChange={(e) => setFillAnswer(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleConfirmFill(); }}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500 disabled:opacity-50 transition-colors"
                />
              </div>
            )}

            {/* Confirm Submit button */}
            {!isSubmitted && (
              <button
                onClick={quizType === "meaning" ? handleConfirmMCQ : handleConfirmFill}
                disabled={quizType === "meaning" ? selectedAnswerIndex === null : !fillAnswer.trim()}
                className="w-full mt-6 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-all shadow-lg"
              >
                Submit Answer
              </button>
            )}

            {/* Answer Feedbacks */}
            {isSubmitted && (
              <div className="mt-6 space-y-4 animate-in fade-in duration-300">
                <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                  isCorrect 
                    ? "bg-green-500/10 border-green-500/20 text-green-300"
                    : "bg-red-500/10 border-red-500/20 text-red-300"
                }`}>
                  {isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4 className="font-bold text-sm">{isCorrect ? "Excellent!" : "Not quite right"}</h4>
                    <p className="text-xs text-gray-300 mt-1">
                      {isCorrect 
                        ? "You identified the correct vocabulary word choice." 
                        : `The correct answer was: "${quizQuestions[currentQuizIndex].word}".`}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleNextQuizQuestion}
                  className="w-full py-3 bg-white/10 border border-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                >
                  {currentQuizIndex < quizQuestions.length - 1 ? (
                    <>Next Question <ArrowRight className="w-4 h-4" /></>
                  ) : (
                    <>Finish & See Results <Award className="w-4 h-4 text-yellow-400" /></>
                  )}
                </button>
              </div>
            )}
          </LiquidGlassCard>
        </div>
      )}

      {/* RENDER VIEW: QUIZ COMPLETED RESULTS */}
      {quizFinished && (
        <div className="max-w-md mx-auto">
          <LiquidGlassCard className="p-8 text-center" accentColor="#10b981">
            <div className="w-16 h-16 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-6 text-green-400 font-bold text-2xl">
              100%
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">Quiz Finished!</h2>
            <p className="text-gray-400 text-sm mb-6">
              You scored <span className="text-white font-semibold">{quizScore}/{quizQuestions.length}</span> correct answers. 
              Awarded <span className="text-green-400 font-semibold">+25 XP</span>.
            </p>

            {bonusEarned && (
              <div className="p-4 bg-green-500/10 border border-green-500/25 rounded-2xl text-green-300 font-medium text-sm flex items-center justify-center gap-2 mb-6 animate-pulse">
                <Sparkles className="w-4 h-4" /> Today's Challenge Bonus Earned (+50 XP / +5 Coins!)
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => handleStartQuiz(quizType || "meaning")}
                className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Try Again
              </button>
              <button
                onClick={() => setQuizFinished(false)}
                className="flex-1 py-2.5 bg-white/5 border border-white/10 text-white text-sm font-semibold rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" /> End Arena
              </button>
            </div>
          </LiquidGlassCard>
        </div>
      )}

      {/* 3D FLASHCARDS PANEL MODAL */}
      {isFlashcardsOpen && (
        <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg space-y-6">
            <div className="flex justify-between items-center text-white">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-400" /> Vocabulary Flashcards
              </h2>
              <button 
                onClick={() => setIsFlashcardsOpen(false)}
                className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {myWords.length > 0 ? (
              <div className="space-y-6">
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
                      className="absolute inset-0 bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-8 flex flex-col justify-between items-center text-center shadow-2xl"
                      style={{ backfaceVisibility: "hidden" }}
                    >
                      <div className="opacity-0" />
                      <div>
                        <h1 className="text-4xl font-extrabold text-blue-400 capitalize">
                          {myWords[flashcardIndex].word}
                        </h1>
                        <p className="text-gray-500 text-sm mt-2 font-mono">Click to flip card</p>
                      </div>
                      <div className="text-xs text-gray-500 uppercase tracking-widest font-semibold flex items-center gap-1">
                        <Volume2 className="w-3.5 h-3.5" /> Pronunciation guide active
                      </div>
                    </div>

                    {/* Back */}
                    <div 
                      className="absolute inset-0 bg-gradient-to-br from-blue-950/20 to-indigo-950/20 border border-white/15 backdrop-blur-xl rounded-3xl p-8 flex flex-col justify-between text-left shadow-2xl overflow-y-auto"
                      style={{ 
                        backfaceVisibility: "hidden", 
                        transform: "rotateY(180deg)" 
                      }}
                    >
                      <div className="space-y-4">
                        <div>
                          <span className="text-xs text-blue-400 font-bold block mb-1">Meaning</span>
                          <p className="text-white text-base leading-relaxed">
                            {myWords[flashcardIndex].meaning}
                          </p>
                        </div>
                        {myWords[flashcardIndex].tamil && (
                          <div>
                            <span className="text-xs text-blue-400 font-bold block mb-1">Tamil translation</span>
                            <p className="text-gray-300 text-sm italic">{myWords[flashcardIndex].tamil}</p>
                          </div>
                        )}
                        {myWords[flashcardIndex].example && (
                          <div className="pt-3 border-t border-white/10">
                            <span className="text-xs text-blue-400 font-bold block mb-1">Example context</span>
                            <p className="text-gray-400 text-sm italic">
                              "{myWords[flashcardIndex].example}"
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="text-center text-xs text-gray-500 font-semibold pt-3 select-none">
                        Click card to show term
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation panel */}
                <div className="flex justify-between items-center text-white bg-white/5 border border-white/10 px-5 py-3 rounded-2xl">
                  <button 
                    onClick={prevFlashcard}
                    className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  
                  <span className="text-sm font-semibold text-gray-400">
                    Card {flashcardIndex + 1} of {myWords.length}
                  </span>

                  <button 
                    onClick={nextFlashcard}
                    className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* ADD / EDIT CUSTOM WORD MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <LiquidGlassCard className="w-full max-w-md p-6" accentColor="#3b82f6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Book className="w-5 h-5 text-blue-400" />
                {editingIndex !== null ? "Modify Word Info" : "Add Vocabulary Word"}
              </h3>
              <button 
                onClick={handleCloseModal}
                className="p-1.5 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveWord} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Vocabulary Word (ஆங்கில வார்த்தை) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. eloquent"
                  value={formWord}
                  onChange={(e) => setFormWord(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  English Meaning (பொருள் விளக்கம்) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. fluent or persuasive in speaking"
                  value={formMeaning}
                  onChange={(e) => setFormMeaning(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Tamil Translation (தமிழ் அர்த்தம்) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. சொல்லாற்றல் மிக்க"
                  value={formTamil}
                  onChange={(e) => setFormTamil(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Example Sentence (உதாரண வாக்கியம்)
                </label>
                <textarea
                  placeholder="e.g. He gave an eloquent presentation."
                  value={formExample}
                  onChange={(e) => setFormExample(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors h-20 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Short Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. adj. used for speaking"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="flex gap-2 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-md"
                >
                  {editingIndex !== null ? "Update Word" : "Save Word"}
                </button>
              </div>
            </form>
          </LiquidGlassCard>
        </div>
      )}
    </div>
  );
}

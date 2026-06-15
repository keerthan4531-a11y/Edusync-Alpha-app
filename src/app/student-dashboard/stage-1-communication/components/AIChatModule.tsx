"use client";

import { useState, useEffect, useRef } from "react";
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card";
import { 
  Bot, 
  Send, 
  Mic, 
  MicOff, 
  Trash2, 
  Sparkles, 
  MessageSquare, 
  User, 
  Loader2,
  AlertCircle,
  HelpCircle
} from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: Date;
}

export function AIChatModule() {
  const [activeMode, setActiveMode] = useState<"general" | "conversation" | "grammar" | "pronunciation">("general");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Set initial welcome message based on mode
  useEffect(() => {
    let welcome = "";
    if (activeMode === "general") {
      welcome = "Hello! I am your AI English Learning partner. You can ask me general questions about vocabulary, request study tips, or just practice your writing skills.";
    } else if (activeMode === "conversation") {
      welcome = "Hi! Let's practice general English conversation. How was your day? Tell me about what you did, and we can chat!";
    } else if (activeMode === "grammar") {
      welcome = "I'm in Strict Grammar check mode. Send me any English sentence (even with mistakes like 'I has two brother'), and I will analyze, correct, and explain the rules.";
    } else if (activeMode === "pronunciation") {
      welcome = "Pronunciation training active. Send me words or phrases, and I'll break down their IPA spelling phonetics and give clear speaking tips.";
    }

    setMessages([
      {
        id: "welcome",
        role: "model",
        content: welcome,
        timestamp: new Date()
      }
    ]);
  }, [activeMode]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  // Speech Recognition configuration
  const startSpeechRecognition = () => {
    setError(null);
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      setError("Speech recognition is not supported in this browser. Please type your message.");
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        if (text) {
          setInputVal((prev) => (prev + " " + text).trim());
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
        setError(`Microphone issue: ${event.error}`);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (e: any) {
      setError("Failed to start voice recognition: " + e.message);
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopSpeechRecognition();
    } else {
      startSpeechRecognition();
    }
  };

  // Send message to Next.js API
  const handleSendMessage = async () => {
    const trimmedInput = inputVal.trim();
    if (!trimmedInput || isThinking) return;

    // Create user message
    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: "user",
      content: trimmedInput,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");
    setIsThinking(true);
    setError(null);

    try {
      // Structure request payload matching Gemini Chat requirements
      const payload = {
        message: trimmedInput,
        mode: activeMode,
        history: messages.map(m => ({
          role: m.role,
          content: m.content
        }))
      };

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch response from AI tutor.");
      }

      const aiMsg: ChatMessage = {
        id: Math.random().toString(),
        role: "model",
        content: data.response || "No response received.",
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsThinking(false);
    }
  };

  const clearChat = () => {
    if (confirm("Are you sure you want to clear the conversation?")) {
      setMessages([]);
      setError(null);
    }
  };

  const insertSuggestion = (text: string) => {
    setInputVal(text);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Mode Selector */}
      <div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-2xl w-fit flex-wrap">
        <button
          onClick={() => setActiveMode("general")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
            activeMode === "general"
              ? "bg-purple-600 text-white shadow-md"
              : "text-gray-400 hover:text-white"
          }`}
        >
          General
        </button>
        <button
          onClick={() => setActiveMode("conversation")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
            activeMode === "conversation"
              ? "bg-purple-600 text-white shadow-md"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Conversation
        </button>
        <button
          onClick={() => setActiveMode("grammar")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
            activeMode === "grammar"
              ? "bg-purple-600 text-white shadow-md"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Grammar Check
        </button>
        <button
          onClick={() => setActiveMode("pronunciation")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
            activeMode === "pronunciation"
              ? "bg-purple-600 text-white shadow-md"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Pronunciation
        </button>
      </div>

      <LiquidGlassCard className="flex flex-col h-[550px] relative border-white/10" accentColor="#8b5cf6">
        {/* Chat Header */}
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-tight capitalize">
                {activeMode} Learning Partner
              </h3>
              <p className="text-xs text-green-400 flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-ping" />
                Active and online
              </p>
            </div>
          </div>

          <button
            onClick={clearChat}
            disabled={messages.length <= 1}
            className="p-2 text-gray-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Clear conversation"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 max-w-[85%] ${
                msg.role === "user" ? "ml-auto flex-row-reverse" : ""
              }`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold border ${
                msg.role === "user" 
                  ? "bg-blue-600/20 border-blue-500/30 text-blue-300"
                  : "bg-purple-600/20 border-purple-500/30 text-purple-300"
              }`}>
                {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Text Bubble */}
              <div className={`p-4 rounded-2xl text-sm leading-relaxed border shadow-md ${
                msg.role === "user"
                  ? "bg-blue-600/10 border-blue-500/20 text-white rounded-tr-none"
                  : "bg-white/5 border-white/10 text-gray-200 rounded-tl-none"
              }`}>
                {/* Parse simple bold tags manually to match prototype */}
                <p 
                  className="whitespace-pre-wrap font-light"
                  dangerouslySetInnerHTML={{
                    __html: msg.content
                      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                      .replace(/\n/g, "<br/>")
                  }}
                />
                <span className="block text-[10px] text-gray-500 text-right mt-2">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="flex items-start gap-3 max-w-[80%]">
              <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-sm rounded-tl-none text-gray-400 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                <span>AI Teacher is thinking...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 flex items-center gap-2 max-w-md mx-auto">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/10 bg-white/5 space-y-3">
          {/* Quick suggestions */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs text-gray-400 select-none">
            <span className="flex-shrink-0 text-purple-400 font-semibold flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" /> Suggestion:
            </span>
            {activeMode === "grammar" && (
              <button 
                onClick={() => insertSuggestion("I has two brother")}
                className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors flex-shrink-0"
              >
                "I has two brother"
              </button>
            )}
            {activeMode === "conversation" && (
              <button 
                onClick={() => insertSuggestion("What are your favorite hobbies?")}
                className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors flex-shrink-0"
              >
                "What are your hobbies?"
              </button>
            )}
            {activeMode === "pronunciation" && (
              <button 
                onClick={() => insertSuggestion("How do I say thorough?")}
                className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors flex-shrink-0"
              >
                "How do I say thorough?"
              </button>
            )}
            <button 
              onClick={() => insertSuggestion("Tell me a brief English learning tip.")}
              className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors flex-shrink-0"
            >
              "General tip"
            </button>
          </div>

          {/* Typing form */}
          <div className="flex gap-2">
            <button
              onClick={toggleRecording}
              className={`p-3 border rounded-xl transition-all ${
                isRecording 
                  ? "bg-red-500/20 border-red-500 text-red-400 hover:bg-red-500/30"
                  : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
              }`}
              title={isRecording ? "Stop voice transcription" : "Voice message"}
            >
              {isRecording ? <MicOff className="w-5 h-5 animate-pulse" /> : <Mic className="w-5 h-5" />}
            </button>
            
            <input
              type="text"
              placeholder={isRecording ? "Listening to your voice..." : "Type your message here..."}
              value={inputVal}
              disabled={isRecording}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSendMessage();
                }
              }}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 disabled:opacity-50 transition-colors"
            />

            <button
              onClick={handleSendMessage}
              disabled={!inputVal.trim() || isThinking || isRecording}
              className="p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl disabled:opacity-45 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-900/30"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </LiquidGlassCard>
    </div>
  );
}

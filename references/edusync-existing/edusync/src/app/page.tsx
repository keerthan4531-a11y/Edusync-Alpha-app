"use client";
import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import "./landing.css";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export default function Home() {
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([
    {
      role: "ai",
      text: "Hello! I'm your EduSync assistant. How can I help you explore our platform today?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatDisplayRef = useRef<HTMLDivElement>(null);
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      const reveals = document.querySelectorAll(".reveal");
      for (let i = 0; i < reveals.length; i++) {
        const windowHeight = window.innerHeight;
        const elementTop = reveals[i].getBoundingClientRect().top;
        const elementVisible = 150;
        if (elementTop < windowHeight - elementVisible) {
          reveals[i].classList.add("active");
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (chatDisplayRef.current) {
      chatDisplayRef.current.scrollTop = chatDisplayRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const sendMessage = async () => {
    const message = inputValue.trim();
    if (!message) return;

    setMessages((prev) => [...prev, { role: "user", text: message }]);
    setInputValue("");
    setIsTyping(true);

    try {
      const systemPrompt =
        "You are a helpful education assistant for EduSync. Provide concise, friendly answers about education and learning English.";
      const lastMessages = conversationHistory
        .map((m) => m.role + ": " + m.content)
        .join("\n");

      let aiText = "I'm here to help you learn!";
      if (typeof window !== "undefined" && (window as any).puter?.ai?.chat) {
        const response = await (window as any).puter.ai.chat(
          `${systemPrompt}\n\nPrevious context:\n${lastMessages}\n\nUser: ${message}`,
          { model: "gpt-4o", stream: false }
        );

        if (typeof response === "string") aiText = response;
        else if (response?.message?.content?.[0]?.text)
          aiText = response.message.content[0].text;
        else if (response?.text) aiText = response.text;
      } else {
        aiText = "Assistant is currently offline or Puter.js is missing.";
      }

      setMessages((prev) => [...prev, { role: "ai", text: aiText }]);
      setConversationHistory((prev) => {
        let newHistory = [
          ...prev,
          { role: "user", content: message } as Message,
          { role: "assistant", content: aiText } as Message,
        ];
        if (newHistory.length > 6) newHistory = newHistory.slice(-6);
        return newHistory;
      });
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "Service is currently busy. Please try again in a moment.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <>
      <header style={{ padding: scrolled ? "10px 5%" : "15px 5%" }}>
        <nav className="glass">
          <Link href="#" className="logo">
            <i className="fas fa-graduation-cap"></i>
            EduSync
          </Link>
          <ul className="nav-links">
            <li>
              <a href="#prepare">
                <i className="fas fa-book-open"></i> Learn
              </a>
            </li>
            <li>
              <a href="#compete">
                <i className="fas fa-trophy"></i> Compete
              </a>
            </li>
            <li>
              <a href="#jobs">
                <i className="fas fa-briefcase"></i> Jobs
              </a>
            </li>
            <li>
              <a href="#leaderboard">
                <i className="fas fa-chart-line"></i> Leaderboard
              </a>
            </li>
            <li>
              <Link href="/login" className="login-btn">
                Log In
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <i className="fas fa-bolt" style={{ color: "var(--accent)" }}></i>{" "}
            Boost Your Career
          </div>
          <h1>
            Learn <span>English.</span>
            <br />
            Win Competitions.
            <br />
            Get <span>Hired.</span>
          </h1>
          <p>
            Master communication skills through AI roleplay, compete in global challenges, and unlock premium job opportunities with your verified skills.
          </p>
          <div className="hero-buttons">
            <Link href="/login" className="btn-primary">
              Start Preparation <i className="fas fa-rocket"></i>
            </Link>
            <a href="#compete" className="btn-secondary">
              View Opportunities <i className="fas fa-briefcase"></i>
            </a>
          </div>
        </div>
        <div className="hero-image">
          <div className="glass-card-preview">
            <div className="preview-header">
              <div className="preview-icon">
                <i className="fas fa-robot"></i>
              </div>
              <div>
                <h3
                  style={{
                    color: "var(--text-main)",
                    fontSize: "18px",
                    marginBottom: "2px",
                  }}
                >
                  AI Teaching Assistant
                </h3>
                <p
                  style={{
                    color: "var(--secondary)",
                    fontSize: "12px",
                    fontWeight: 600,
                  }}
                >
                  <i
                    className="fas fa-circle"
                    style={{ fontSize: "8px", marginRight: "5px" }}
                  ></i>{" "}
                  Online & Ready
                </p>
              </div>
            </div>
            <div id="chat-display" ref={chatDisplayRef}>
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`chat-message ${msg.role}-message`}
                >
                  {msg.text}
                </div>
              ))}
            </div>
            <div
              id="typing-status"
              className="typing-indicator"
              style={{ display: isTyping ? "block" : "none" }}
            >
              Assistant is thinking...
            </div>
            <div className="chat-input-container">
              <input
                type="text"
                id="ai-chat-input"
                placeholder="Ask me about EduSync..."
                autoComplete="off"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
              />
              <button
                id="send-ai-chat"
                className="send-btn"
                onClick={sendMessage}
              >
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="stats-strip">
        <div className="stats-container">
          <div className="stat-item">
            <span className="stat-number">100+</span>
            <span className="stat-label">Active Contests</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">5,000+</span>
            <span className="stat-label">Active Students</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">50+</span>
            <span className="stat-label">Corporate Partners</span>
          </div>
        </div>
      </div>

      <section id="prepare" className="prepare-section reveal">
        <div className="section-header">
          <div className="hero-badge">The Prepare Section</div>
          <h2>Our Core AI Features</h2>
          <p>
            Build your communication confidence with our specialized AI-powered labs designed for modern professionals.
          </p>
        </div>
        <div className="prepare-grid">
          <div className="prepare-card reveal">
            <div className="prepare-icon">
              <i className="fas fa-comments-dollar"></i>
            </div>
            <h3>AI Roleplay Room</h3>
            <p>
              Practice dummy interviews with custom AI personas. Get real-time feedback on your answers and body language.
            </p>
          </div>
          <div className="prepare-card reveal">
            <div className="prepare-icon">
              <i className="fas fa-microphone-alt"></i>
            </div>
            <h3>Speech Lab</h3>
            <p>
              Analyze your speaking pace, detect filler words, and improve your tone to deliver powerful presentations.
            </p>
          </div>
          <div className="prepare-card reveal">
            <div className="prepare-icon">
              <i className="fas fa-ghost"></i>
            </div>
            <h3>Shadowing Module</h3>
            <p>
              Improve your fluency and pronunciation by shadowing native speakers with AI-guided corrections.
            </p>
          </div>
        </div>
      </section>

      <section id="compete" className="grid-section reveal">
        <div className="section-header">
          <div className="hero-badge">The Compete & Earn Section</div>
          <h2>Global Opportunities</h2>
          <p>
            Put your skills to the test and get noticed by recruiters through our curated challenges and hackathons.
          </p>
        </div>

        <div className="opportunity-grid">
          {/* Card 1 */}
          <div className="opp-card reveal">
            <div className="opp-banner">
              <div className="opp-logo">
                <i className="fas fa-bullhorn"></i>
              </div>
            </div>
            <div className="opp-content">
              <span className="opp-type">Communication Hackathon</span>
              <h3 className="opp-title">Best Pitcher Contest 2026</h3>
              <p className="opp-organizer">EduSync Global</p>
              <div className="opp-meta">
                <div className="opp-prize">
                  <i className="fas fa-award"></i> ₹50,000
                </div>
                <div className="opp-deadline">
                  <i className="fas fa-clock"></i> 2 Days Left
                </div>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="opp-card reveal">
            <div
              className="opp-banner"
              style={{ background: "linear-gradient(45deg, #10B981, #34D399)" }}
            >
              <div className="opp-logo" style={{ color: "#10B981" }}>
                <i className="fas fa-feather-alt"></i>
              </div>
            </div>
            <div className="opp-content">
              <span className="opp-type">Storytelling</span>
              <h3 className="opp-title">Best Storyteller Challenge</h3>
              <p className="opp-organizer">Creative Lab Inc.</p>
              <div className="opp-meta">
                <div className="opp-prize">
                  <i className="fas fa-award"></i> ₹25,000
                </div>
                <div className="opp-deadline">
                  <i className="fas fa-clock"></i> 5 Days Left
                </div>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="opp-card reveal">
            <div
              className="opp-banner"
              style={{ background: "linear-gradient(45deg, #F59E0B, #FBBF24)" }}
            >
              <div className="opp-logo" style={{ color: "#F59E0B" }}>
                <i className="fas fa-brain"></i>
              </div>
            </div>
            <div className="opp-content">
              <span className="opp-type">AI Quiz</span>
              <h3 className="opp-title">Grammar & Etiquette Pro</h3>
              <p className="opp-organizer">Corporate Partners</p>
              <div className="opp-meta">
                <div className="opp-prize">
                  <i className="fas fa-award"></i> Internship Pass
                </div>
                <div className="opp-deadline">
                  <i className="fas fa-clock"></i> 1 Week Left
                </div>
              </div>
            </div>
          </div>

          {/* Card 4 */}
          <div className="opp-card reveal">
            <div
              className="opp-banner"
              style={{ background: "linear-gradient(45deg, #EC4899, #F472B6)" }}
            >
              <div className="opp-logo" style={{ color: "#EC4899" }}>
                <i className="fas fa-handshake"></i>
              </div>
            </div>
            <div className="opp-content">
              <span className="opp-type">Micro-Internship</span>
              <h3 className="opp-title">Startup Sales Pitcher</h3>
              <p className="opp-organizer">NextScale Ventures</p>
              <div className="opp-meta">
                <div className="opp-prize">
                  <i className="fas fa-award"></i> ₹10,000/Task
                </div>
                <div className="opp-deadline">
                  <i className="fas fa-clock"></i> Open Now
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="jobs"
        className="grid-section reveal"
        style={{ background: "white" }}
      >
        <div className="section-header">
          <div className="hero-badge">The Jobs Section</div>
          <h2>Premium Opportunities</h2>
          <p>
            Directly apply to startups and corporate partners who value effective communication.
          </p>
        </div>

        <div className="opportunity-grid">
          {/* Job 1 */}
          <div className="opp-card reveal">
            <div
              className="opp-banner"
              style={{
                background: "#f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <i
                className="fas fa-briefcase"
                style={{ fontSize: "40px", color: "var(--unstop-blue)" }}
              ></i>
            </div>
            <div className="opp-content">
              <span className="opp-type">Full Time</span>
              <h3 className="opp-title">Sales Executive</h3>
              <p className="opp-organizer">TechFlow Solutions</p>
              <div className="opp-meta">
                <div className="opp-prize">₹6 - 12 LPA</div>
                <div className="opp-deadline">Remote</div>
              </div>
            </div>
          </div>

          {/* Job 2 */}
          <div className="opp-card reveal">
            <div
              className="opp-banner"
              style={{
                background: "#f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <i
                className="fas fa-headset"
                style={{ fontSize: "40px", color: "var(--unstop-blue)" }}
              ></i>
            </div>
            <div className="opp-content">
              <span className="opp-type">Internship</span>
              <h3 className="opp-title">Customer Success Lead</h3>
              <p className="opp-organizer">GrowthHackers</p>
              <div className="opp-meta">
                <div className="opp-prize">₹20,000 / month</div>
                <div className="opp-deadline">Bangalore</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="leaderboard"
        className="prepare-section reveal"
        style={{ background: "var(--unstop-bg)" }}
      >
        <div className="section-header">
          <div className="hero-badge">Global Leaderboard</div>
          <h2>Top Communicators</h2>
          <p>
            See how you rank against peers from across the globe based on your ELQ (English Learning Quotient) score.
          </p>
        </div>

        <div
          className="glass-card-preview"
          style={{ maxWidth: "800px", margin: "0 auto", height: "auto" }}
        >
          <div style={{ padding: "20px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "15px",
                borderBottom: "1px solid #eee",
                fontWeight: 700,
              }}
            >
              <span>Rank</span>
              <span>Student</span>
              <span>ELQ Score</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "15px",
                borderBottom: "1px solid #f9f9f9",
              }}
            >
              <span>
                <i className="fas fa-medal" style={{ color: "gold" }}></i> 1
              </span>
              <span style={{ fontWeight: 600 }}>Adarsh Kumar</span>
              <span style={{ color: "var(--primary)", fontWeight: 700 }}>
                985
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "15px",
                borderBottom: "1px solid #f9f9f9",
              }}
            >
              <span>
                <i className="fas fa-medal" style={{ color: "silver" }}></i> 2
              </span>
              <span style={{ fontWeight: 600 }}>Priya Singh</span>
              <span style={{ color: "var(--primary)", fontWeight: 700 }}>
                972
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "15px",
              }}
            >
              <span>
                <i className="fas fa-medal" style={{ color: "#cd7f32" }}></i> 3
              </span>
              <span style={{ fontWeight: 600 }}>Rahul Verma</span>
              <span style={{ color: "var(--primary)", fontWeight: 700 }}>
                968
              </span>
            </div>
          </div>
          <div
            style={{
              textAlign: "center",
              padding: "20px",
              background: "rgba(0,0,0,0.02)",
            }}
          >
            <Link
              href="/login"
              style={{
                color: "var(--primary)",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              View Full Leaderboard <i className="fas fa-external-link-alt"></i>
            </Link>
          </div>
        </div>
      </section>

      <section className="assessment-banner reveal">
        <div className="assessment-content">
          <h2>Assess Your Skills</h2>
          <p>
            Check your communication score to unlock Premium Opportunities and direct callbacks from our corporate partners.
          </p>
          <Link
            href="/login"
            className="btn-primary"
            style={{
              marginTop: "20px",
              background: "white",
              color: "var(--unstop-blue)",
              boxShadow: "none",
            }}
          >
            Check Your Score <i className="fas fa-check-circle"></i>
          </Link>
        </div>
        <div className="score-circle">
          <div style={{ fontSize: "40px", fontWeight: 800 }}>780</div>
          <div style={{ fontSize: "14px", opacity: 0.8 }}>ELQ SCORE</div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-container">
          <h2>Start your Communication Journey Today</h2>
          <p>
            Don't just learn English. Master it, Compete with it, and get Hired with it.
          </p>
          <div
            style={{
              display: "flex",
              gap: "20px",
              justifyContent: "center",
              marginTop: "20px",
            }}
          >
            <Link href="/login" className="cta-btn">
              Join Now <i className="fas fa-user-plus"></i>
            </Link>
            <a
              href="#compete"
              className="cta-btn"
              style={{
                background: "rgba(255,255,255,0.1)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.3)",
              }}
            >
              Explore Jobs <i className="fas fa-briefcase"></i>
            </a>
          </div>
        </div>
      </section>

      <footer>
        <p>&copy; 2026 EduSync. All rights reserved.</p>
      </footer>
    </>
  );
}

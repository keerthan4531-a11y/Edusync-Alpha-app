"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ===================== Types =====================
interface ModelConfig {
  id: string;
  stage: string;
  role: string;
  feature: string;
  primaryModel: string;
  fallback1: string | null;
  fallback2: string | null;
  fallback3: string | null;
  fallback4: string | null;
  fallback5: string | null;
  isActive: boolean;
}

interface AIModel {
  id: string;
  object: string;
  owned_by?: string;
}

interface RequestLog {
  id: string;
  userId: string;
  stage: string;
  feature: string;
  modelUsed: string;
  responseTime: number;
  success: boolean;
  errorMessage: string | null;
  createdAt: string;
}

interface ModelHealth {
  [modelId: string]: { alive: boolean; latency: number; error?: string };
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  model?: string;
  time?: number;
}

// ===================== Constants =====================
const TABS = [
  { id: "overview", label: "Dashboard", icon: "📊" },
  { id: "config", label: "Model Config", icon: "⚙️" },
  { id: "playground", label: "Playground", icon: "🧪" },
  { id: "logs", label: "Request Logs", icon: "📋" },
  { id: "health", label: "Model Health", icon: "💚" },
  { id: "settings", label: "Settings", icon: "🔧" },
];

const STAGES = ["general", "stage-1", "stage-2", "stage-3", "stage-4"];
const ROLES = ["ALL", "STUDENT", "FACULTY", "HOD"];
const FEATURES = ["chat", "code-review", "writing-grade", "mock-interview", "resume-scorer", "idea-gen"];

// ===================== Main Page =====================
export default function AIAdminPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [models, setModels] = useState<AIModel[]>([]);
  const [configs, setConfigs] = useState<ModelConfig[]>([]);
  const [logs, setLogs] = useState<RequestLog[]>([]);
  const [health, setHealth] = useState<ModelHealth>({});
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch initial data
  useEffect(() => {
    Promise.all([
      fetch("/api/ai-admin/models").then((r) => r.json()),
      fetch("/api/ai-admin/config").then((r) => r.json()),
      fetch("/api/ai-admin/stats").then((r) => r.json()),
    ])
      .then(([modelsData, configData, statsData]) => {
        setModels(modelsData.models || []);
        setConfigs(configData.configs || []);
        setStats(statsData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col min-h-screen text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-white/[0.03] border-b border-white/[0.06]">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-violet-500 to-fuchsia-500 flex items-center justify-center text-lg font-bold shadow-lg shadow-violet-500/20">
              ✦
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent">
                INIXA AI Admin
              </h1>
              <p className="text-xs text-white/40">Model Management & Monitoring</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              System Online
            </div>
            <a
              href="/hod-dashboard"
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 text-sm hover:bg-white/10 hover:text-white transition-all"
            >
              ← Back to Dashboard
            </a>
          </div>
        </div>
      </header>

      <div className="flex flex-1 max-w-[1600px] mx-auto w-full">
        {/* Sidebar */}
        <nav className="w-64 border-r border-white/[0.06] p-4 space-y-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 text-white border border-violet-500/30 shadow-lg shadow-violet-500/5"
                  : "text-white/50 hover:text-white/80 hover:bg-white/5"
              }`}
            >
              <span className="text-base">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {loading && activeTab !== "playground" ? (
                <LoadingState />
              ) : (
                <>
                  {activeTab === "overview" && <OverviewTab stats={stats} configs={configs} />}
                  {activeTab === "config" && (
                    <ConfigTab configs={configs} setConfigs={setConfigs} models={models} />
                  )}
                  {activeTab === "playground" && <PlaygroundTab models={models} />}
                  {activeTab === "logs" && <LogsTab />}
                  {activeTab === "health" && <HealthTab health={health} setHealth={setHealth} />}
                  {activeTab === "settings" && <SettingsTab />}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

// ===================== Loading State =====================
function LoadingState() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
        <p className="text-white/40 text-sm">Loading AI System...</p>
      </div>
    </div>
  );
}

// ===================== Overview Tab =====================
function OverviewTab({ stats, configs }: { stats: any; configs: ModelConfig[] }) {
  const statCards = [
    {
      label: "Total Requests",
      value: stats?.totalRequests || 0,
      icon: "📡",
      gradient: "from-cyan-500 to-blue-600",
    },
    {
      label: "Success Rate",
      value: `${stats?.successRate || 100}%`,
      icon: "✅",
      gradient: "from-emerald-500 to-green-600",
    },
    {
      label: "Avg Response",
      value: `${stats?.avgResponseTime || 0}ms`,
      icon: "⚡",
      gradient: "from-amber-500 to-orange-600",
    },
    {
      label: "Active Configs",
      value: configs.length,
      icon: "⚙️",
      gradient: "from-violet-500 to-fuchsia-600",
    },
  ];

  return (
    <div className="space-y-6">
      <SectionTitle title="Dashboard Overview" subtitle="Real-time AI system monitoring" />

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5"
          >
            <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full bg-gradient-to-br ${card.gradient} opacity-10 blur-xl`} />
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{card.icon}</span>
              <span className="text-xs text-white/40 uppercase tracking-wider">{card.label}</span>
            </div>
            <p className="text-3xl font-bold text-white">{card.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Model Usage Chart (simple bar) */}
      {stats?.modelUsage && Object.keys(stats.modelUsage).length > 0 && (
        <GlassCard title="Model Usage (Recent)">
          <div className="space-y-3">
            {Object.entries(stats.modelUsage)
              .sort(([, a]: any, [, b]: any) => b - a)
              .slice(0, 8)
              .map(([model, count]: any) => {
                const max = Math.max(...Object.values(stats.modelUsage as Record<string, number>));
                const pct = (count / max) * 100;
                return (
                  <div key={model} className="flex items-center gap-3">
                    <span className="text-xs text-white/50 w-40 truncate font-mono">{model}</span>
                    <div className="flex-1 h-6 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="h-full rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600"
                      />
                    </div>
                    <span className="text-xs text-white/40 w-10 text-right">{count}</span>
                  </div>
                );
              })}
          </div>
        </GlassCard>
      )}

      {/* Active Configurations Matrix */}
      <GlassCard title="Active Model Configurations">
        {configs.length === 0 ? (
          <p className="text-white/40 text-sm py-4 text-center">
            No model configurations yet. Go to Model Config tab to set up models.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white/40 text-xs uppercase tracking-wider border-b border-white/5">
                  <th className="text-left py-3 px-3">Stage</th>
                  <th className="text-left py-3 px-3">Role</th>
                  <th className="text-left py-3 px-3">Feature</th>
                  <th className="text-left py-3 px-3">Primary</th>
                  <th className="text-left py-3 px-3">Fallbacks</th>
                  <th className="text-left py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {configs.map((config) => (
                  <tr key={config.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                    <td className="py-3 px-3">{config.stage}</td>
                    <td className="py-3 px-3">{config.role}</td>
                    <td className="py-3 px-3">{config.feature}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-1 rounded-md bg-violet-500/10 text-violet-300 text-xs font-mono">
                        {config.primaryModel}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-xs text-white/30">
                        {[config.fallback1, config.fallback2, config.fallback3, config.fallback4, config.fallback5]
                          .filter(Boolean)
                          .length}{" "}
                        fallbacks
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          config.isActive
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {config.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
}

// ===================== Config Tab =====================
const STAGE_DETAILS = [
  {
    id: "general",
    name: "General / Global Routing",
    description: "System-wide default AI behavior and fallbacks",
    icon: "🌐",
    features: [
      { id: "chat", name: "General AI Chat", description: "Default assistant inside HOD/Faculty dashboards & general chat queries" },
      { id: "idea-gen", name: "AI Idea Generator", description: "Global idea brainstorming helper" },
    ]
  },
  {
    id: "stage-1",
    name: "Stage 1: Communication Skills",
    description: "AI-powered language learning, speaking, and grammar partner",
    icon: "💬",
    features: [
      { id: "chat", name: "Language Practice Chat", description: "Tutors students in grammar checks, pronunciation IPA, and conversational English" },
    ]
  },
  {
    id: "stage-2",
    name: "Stage 2: Technical Skills",
    description: "AI-assisted programming assessments and automated code grading",
    icon: "💻",
    features: [
      { id: "code-review", name: "Code Reviewer", description: "Performs security scans, complexity checks, and styling feedback on student files" },
    ]
  },
  {
    id: "stage-3",
    name: "Stage 3: Project Building",
    description: "AI guidance for software product blueprints and architecture specs",
    icon: "🏗️",
    features: [
      { id: "idea-gen", name: "Architecture & Blueprints", description: "Suggests project stack configurations and system architecture blueprints" },
    ]
  },
  {
    id: "stage-4",
    name: "Stage 4: Career Preparation",
    description: "ATS Resume screening and AI-driven interactive mock interviews",
    icon: "💼",
    features: [
      { id: "resume-scorer", name: "ATS Resume Grader", description: "Scores applicant resumes against keyword optimization and ATS standards" },
      { id: "mock-interview", name: "AI Mock Interviewer", description: "Conducts voice/text roleplay technical interviews and gives scoring metrics" },
    ]
  }
];

function ConfigTab({
  configs,
  setConfigs,
  models,
}: {
  configs: ModelConfig[];
  setConfigs: (c: ModelConfig[]) => void;
  models: AIModel[];
}) {
  const [activeStageId, setActiveStageId] = useState<string>("general");
  const [activeFeatureId, setActiveFeatureId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("ALL");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  
  const [form, setForm] = useState({
    primaryModel: "",
    fallback1: "",
    fallback2: "",
    fallback3: "",
    fallback4: "",
    fallback5: "",
    isActive: true,
  });

  const modelOptions = models.map((m) => m.id);

  // Sync form when activeStageId, activeFeatureId, or selectedRole changes
  useEffect(() => {
    if (!activeFeatureId) return;
    
    const matched = configs.find(
      (c) => c.stage === activeStageId && c.feature === activeFeatureId && c.role === selectedRole
    );
    
    if (matched) {
      setForm({
        primaryModel: matched.primaryModel || "",
        fallback1: matched.fallback1 || "",
        fallback2: matched.fallback2 || "",
        fallback3: matched.fallback3 || "",
        fallback4: matched.fallback4 || "",
        fallback5: matched.fallback5 || "",
        isActive: matched.isActive,
      });
    } else {
      // Default empty form
      setForm({
        primaryModel: "",
        fallback1: "",
        fallback2: "",
        fallback3: "",
        fallback4: "",
        fallback5: "",
        isActive: true,
      });
    }
    setMessage("");
  }, [activeStageId, activeFeatureId, selectedRole, configs]);

  const activeStage = STAGE_DETAILS.find((s) => s.id === activeStageId);

  const handleSave = async () => {
    if (!activeFeatureId) return;
    if (!form.primaryModel) {
      setMessage("❌ Primary model is required");
      return;
    }
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/ai-admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stage: activeStageId,
          role: selectedRole,
          feature: activeFeatureId,
          ...form,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("✅ Configuration saved successfully!");
        // Refresh configs
        const configRes = await fetch("/api/ai-admin/config");
        const configData = await configRes.json();
        setConfigs(configData.configs || []);
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (err: any) {
      setMessage(`❌ Failed: ${err.message}`);
    }
    setSaving(false);
  };

  const getConfigSummary = (stage: string, feature: string, role: string = "ALL") => {
    return configs.find((c) => c.stage === stage && c.feature === feature && c.role === role);
  };

  return (
    <div className="space-y-6">
      <SectionTitle title="Model Config Dashboard" subtitle="Manage Stage & Feature AI Routing, primary and fallback models" />

      {/* 1. STAGES SELECTOR CARDS */}
      <div className="grid grid-cols-5 gap-4">
        {STAGE_DETAILS.map((stage) => {
          const isActive = activeStageId === stage.id;
          const configCount = configs.filter((c) => c.stage === stage.id && c.isActive).length;

          return (
            <motion.button
              key={stage.id}
              onClick={() => {
                setActiveStageId(stage.id);
                setActiveFeatureId(null);
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-4 text-left rounded-2xl transition-all border backdrop-blur-md ${
                isActive
                  ? "bg-gradient-to-b from-violet-600/30 to-fuchsia-600/30 border-violet-500/40 shadow-lg shadow-violet-500/10"
                  : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.12]"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-2xl">{stage.icon}</span>
                {configCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                    {configCount} Active
                  </span>
                )}
              </div>
              <h3 className="font-bold text-sm text-white mb-1">{stage.name}</h3>
              <p className="text-[11px] text-white/40 line-clamp-2 leading-relaxed">{stage.description}</p>
            </motion.button>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* 2. FEATURES LIST (LEFT COLUMN) */}
        <div className="col-span-1 space-y-4">
          <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">
            Features in {activeStage?.name.split(":")[1] || activeStage?.name}
          </h3>

          <div className="space-y-3">
            {activeStage?.features.map((feature) => {
              const isActive = activeFeatureId === feature.id;
              const currentConfig = getConfigSummary(activeStageId, feature.id, selectedRole);
              const fallbackCount = currentConfig
                ? [
                    currentConfig.fallback1,
                    currentConfig.fallback2,
                    currentConfig.fallback3,
                    currentConfig.fallback4,
                    currentConfig.fallback5,
                  ].filter(Boolean).length
                : 0;

              return (
                <button
                  key={feature.id}
                  onClick={() => setActiveFeatureId(feature.id)}
                  className={`w-full p-4 rounded-xl text-left border transition-all ${
                    isActive
                      ? "bg-violet-600/15 border-violet-500/30"
                      : "bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08]"
                  }`}
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <h4 className="font-semibold text-sm text-white">{feature.name}</h4>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        currentConfig?.isActive ? "bg-emerald-400" : "bg-white/20"
                      }`}
                    />
                  </div>
                  <p className="text-xs text-white/40 mb-3 leading-relaxed">{feature.description}</p>
                  
                  {currentConfig ? (
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-white/30 uppercase tracking-wider">Primary:</span>
                        <span className="px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-300 text-[10px] font-mono">
                          {currentConfig.primaryModel}
                        </span>
                      </div>
                      {fallbackCount > 0 && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-white/30 uppercase tracking-wider">Fallbacks:</span>
                          <span className="text-[10px] text-white/60">
                            {fallbackCount} active backup models
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-[10px] text-white/20 italic">No custom config (using default)</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. MODEL CONFIGURATION EDITOR (RIGHT COLUMN) */}
        <div className="col-span-2">
          {activeFeatureId ? (
            <GlassCard title={`Configure Model Assignment`}>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                <div>
                  <h4 className="font-bold text-base text-white">
                    {activeStage?.features.find((f) => f.id === activeFeatureId)?.name}
                  </h4>
                  <p className="text-xs text-white/40 mt-0.5">
                    Configuring Stage: <span className="font-mono text-cyan-300">{activeStageId}</span> | Feature: <span className="font-mono text-cyan-300">{activeFeatureId}</span>
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                  {/* Role Switcher */}
                  <div>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="px-3 py-1 rounded bg-white/5 border border-white/10 text-xs text-white"
                    >
                      {ROLES.map((role) => (
                        <option key={role} value={role} className="bg-gray-900">
                          Role: {role}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Active Toggle */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/40">Active:</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.isActive}
                        onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4 bg-white/10 rounded-full peer peer-checked:bg-emerald-600 transition-all after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-4" />
                    </label>
                  </div>
                </div>
              </div>

              {/* Model Select Inputs */}
              <div className="space-y-4">
                <ModelSelect
                  label="🎯 Primary Model (This model answers requests first)"
                  value={form.primaryModel}
                  onChange={(v) => setForm({ ...form, primaryModel: v })}
                  options={modelOptions}
                  required
                />

                <div className="border-t border-white/5 pt-4">
                  <h5 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">
                    Backup Fallback Models (Used if primary model fails or hits limits)
                  </h5>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <ModelSelect label="Fallback 1" value={form.fallback1} onChange={(v) => setForm({ ...form, fallback1: v })} options={modelOptions} />
                    <ModelSelect label="Fallback 2" value={form.fallback2} onChange={(v) => setForm({ ...form, fallback2: v })} options={modelOptions} />
                    <ModelSelect label="Fallback 3" value={form.fallback3} onChange={(v) => setForm({ ...form, fallback3: v })} options={modelOptions} />
                    <ModelSelect label="Fallback 4" value={form.fallback4} onChange={(v) => setForm({ ...form, fallback4: v })} options={modelOptions} />
                    <div className="col-span-2">
                      <ModelSelect label="Fallback 5" value={form.fallback5} onChange={(v) => setForm({ ...form, fallback5: v })} options={modelOptions} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
                <div>
                  {message && (
                    <p className={`text-xs ${message.startsWith("✅") ? "text-emerald-400" : "text-red-400"}`}>
                      {message}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium text-xs hover:shadow-lg disabled:opacity-50 transition-all"
                >
                  {saving ? "Saving..." : "Save Route Configuration"}
                </button>
              </div>
            </GlassCard>
          ) : (
            <GlassCard className="flex flex-col items-center justify-center h-64 text-center">
              <span className="text-4xl mb-3">⚙️</span>
              <h4 className="font-semibold text-sm text-white/60 mb-1">No Feature Selected</h4>
              <p className="text-xs text-white/30 max-w-[280px]">
                Click on one of the Stage Cards above, then select a feature on the left to configure its routing.
              </p>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}

// ===================== Playground Tab =====================
function PlaygroundTab({ models }: { models: AIModel[] }) {
  const [selectedModel, setSelectedModel] = useState(models[0]?.id || "gemini-2.5-flash");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai-admin/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: selectedModel,
          prompt: input,
          systemPrompt: "You are a helpful AI assistant for an educational platform. Be concise and accurate.",
        }),
      });
      const data = await res.json();

      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: data.response || data.error || "No response",
        model: data.modelUsed,
        time: data.responseTime,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${err.message}`, model: selectedModel },
      ]);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <SectionTitle title="Model Playground" subtitle="Test any AI model before assigning it to a stage" />

      <div className="flex gap-4 h-[calc(100vh-250px)]">
        {/* Model Selector Sidebar */}
        <div className="w-64 overflow-y-auto pr-2">
          <GlassCard title="Select Model">
            <div className="space-y-1 max-h-[500px] overflow-y-auto">
              {models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => setSelectedModel(model.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-all ${
                    selectedModel === model.id
                      ? "bg-violet-600/20 text-violet-300 border border-violet-500/30"
                      : "text-white/50 hover:bg-white/5 hover:text-white/80"
                  }`}
                >
                  <div>{model.id}</div>
                  {model.owned_by && (
                    <div className="text-[10px] text-white/25 mt-0.5">{model.owned_by}</div>
                  )}
                </button>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          <GlassCard title={`Testing: ${selectedModel}`} className="flex-1 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-0">
              {messages.length === 0 && (
                <div className="flex items-center justify-center h-full text-white/20 text-sm">
                  Send a message to test the model...
                </div>
              )}
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${
                      msg.role === "user"
                        ? "bg-violet-600/30 border border-violet-500/20 text-white"
                        : "bg-white/5 border border-white/[0.06] text-white/80"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                    {msg.time !== undefined && (
                      <div className="text-[10px] text-white/30 mt-2">
                        {msg.model} · {msg.time}ms
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/[0.06]">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a test message..."
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/[0.08] text-white text-sm placeholder-white/20 focus:outline-none focus:border-violet-500/40 focus:bg-white/[0.07] transition-all"
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-medium disabled:opacity-40 hover:shadow-lg hover:shadow-violet-500/20 transition-all"
              >
                Send
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

// ===================== Logs Tab =====================
function LogsTab() {
  const [logs, setLogs] = useState<RequestLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/ai-admin/logs?page=${p}&limit=25`);
      const data = await res.json();
      setLogs(data.logs || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLogs(page);
  }, [page, fetchLogs]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionTitle title="Request Logs" subtitle="All AI requests with model, latency, and status" />
        <button
          onClick={() => fetchLogs(page)}
          className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 text-sm hover:bg-white/10 transition-all"
        >
          🔄 Refresh
        </button>
      </div>

      <GlassCard>
        {loading ? (
          <LoadingState />
        ) : logs.length === 0 ? (
          <p className="text-white/40 text-center py-8">No request logs yet.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-white/40 text-xs uppercase tracking-wider border-b border-white/5">
                    <th className="text-left py-3 px-3">Time</th>
                    <th className="text-left py-3 px-3">Stage</th>
                    <th className="text-left py-3 px-3">Feature</th>
                    <th className="text-left py-3 px-3">Model</th>
                    <th className="text-left py-3 px-3">Latency</th>
                    <th className="text-left py-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                      <td className="py-2.5 px-3 text-white/40 text-xs">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-xs">{log.stage}</td>
                      <td className="py-2.5 px-3 text-xs">{log.feature}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded bg-violet-500/10 text-violet-300 text-xs font-mono">
                          {log.modelUsed}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`text-xs ${
                            log.responseTime < 2000
                              ? "text-emerald-400"
                              : log.responseTime < 5000
                              ? "text-amber-400"
                              : "text-red-400"
                          }`}
                        >
                          {log.responseTime}ms
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        {log.success ? (
                          <span className="text-emerald-400 text-xs">✓ Success</span>
                        ) : (
                          <span className="text-red-400 text-xs" title={log.errorMessage || ""}>
                            ✗ Failed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg bg-white/5 text-white/60 text-xs disabled:opacity-30 hover:bg-white/10 transition-all"
              >
                ← Previous
              </button>
              <span className="text-white/30 text-xs">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 rounded-lg bg-white/5 text-white/60 text-xs disabled:opacity-30 hover:bg-white/10 transition-all"
              >
                Next →
              </button>
            </div>
          </>
        )}
      </GlassCard>
    </div>
  );
}

// ===================== Health Tab =====================
function HealthTab({
  health,
  setHealth,
}: {
  health: ModelHealth;
  setHealth: (h: ModelHealth) => void;
}) {
  const [checking, setChecking] = useState(false);
  const [checkedAt, setCheckedAt] = useState<string | null>(null);

  const runHealthCheck = async () => {
    setChecking(true);
    try {
      const res = await fetch("/api/ai-admin/health");
      const data = await res.json();
      setHealth(data.health || {});
      setCheckedAt(data.checkedAt);
    } catch (err) {
      console.error("Health check failed:", err);
    }
    setChecking(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionTitle title="Model Health Monitor" subtitle="Check which models are currently responding" />
        <button
          onClick={runHealthCheck}
          disabled={checking}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 text-white text-sm font-medium disabled:opacity-50 hover:shadow-lg transition-all"
        >
          {checking ? "Checking..." : "🔍 Run Health Check"}
        </button>
      </div>

      {Object.keys(health).length === 0 ? (
        <GlassCard>
          <div className="text-center py-12 text-white/30">
            <p className="text-4xl mb-4">🏥</p>
            <p>Click &quot;Run Health Check&quot; to test all configured models</p>
          </div>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(health).map(([modelId, status]) => (
            <motion.div
              key={modelId}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-4 rounded-xl border transition-all ${
                status.alive
                  ? "bg-emerald-500/5 border-emerald-500/20"
                  : "bg-red-500/5 border-red-500/20"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    status.alive ? "bg-emerald-400 shadow-lg shadow-emerald-400/30" : "bg-red-400 shadow-lg shadow-red-400/30"
                  }`}
                />
                <span className="text-sm font-mono text-white/80">{modelId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-xs ${status.alive ? "text-emerald-400" : "text-red-400"}`}>
                  {status.alive ? "Online" : "Offline"}
                </span>
                <span className="text-xs text-white/30">{status.latency}ms</span>
              </div>
              {status.error && (
                <p className="text-xs text-red-400/60 mt-2 truncate" title={status.error}>
                  {status.error}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {checkedAt && (
        <p className="text-xs text-white/20 text-center">
          Last checked: {new Date(checkedAt).toLocaleString()}
        </p>
      )}
    </div>
  );
}

// ===================== Settings Tab =====================
function SettingsTab() {
  const [settings, setSettings] = useState({
    g4fBaseUrl: "https://g4f.dev",
    autoUpdateEnabled: true,
    proxyEnabled: true,
    customProxies: "",
  });
  const [proxyStatus, setProxyStatus] = useState<any>(null);
  const [updateInfo, setUpdateInfo] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/ai-admin/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.settings) {
          setSettings({
            g4fBaseUrl: data.settings.g4fBaseUrl || "https://g4f.dev",
            autoUpdateEnabled: data.settings.autoUpdateEnabled,
            proxyEnabled: data.settings.proxyEnabled,
            customProxies: data.settings.customProxies || "",
          });
        }
        setProxyStatus(data.proxyStatus);
      })
      .catch(console.error);

    fetch("/api/ai-admin/update-g4f")
      .then((r) => r.json())
      .then((data) => setUpdateInfo(data))
      .catch(console.error);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/ai-admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("✅ Settings saved!");
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (err: any) {
      setMessage(`❌ Failed: ${err.message}`);
    }
    setSaving(false);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch("/api/ai-admin/update-g4f", { method: "POST" });
      const data = await res.json();
      setMessage(data.success ? "✅ Update initiated!" : `❌ ${data.error}`);
    } catch (err: any) {
      setMessage(`❌ Failed: ${err.message}`);
    }
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <div className="space-y-6">
      <SectionTitle title="System Settings" subtitle="Configure AI system, proxy, and auto-update settings" />

      {/* AI Engine Settings */}
      <GlassCard title="AI Engine">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">API Base URL</label>
            <input
              type="text"
              value={settings.g4fBaseUrl}
              onChange={(e) => setSettings({ ...settings, g4fBaseUrl: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/[0.08] text-white text-sm focus:outline-none focus:border-violet-500/40 transition-all"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoUpdateEnabled}
                onChange={(e) => setSettings({ ...settings, autoUpdateEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-white/10 rounded-full peer peer-checked:bg-violet-600 transition-all after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
            </label>
            <span className="text-sm text-white/60">Auto-update AI package</span>
          </div>
        </div>
      </GlassCard>

      {/* Proxy Settings */}
      <GlassCard title="Proxy Settings">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.proxyEnabled}
                onChange={(e) => setSettings({ ...settings, proxyEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-white/10 rounded-full peer peer-checked:bg-emerald-600 transition-all after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
            </label>
            <span className="text-sm text-white/60">Enable proxy IP rotation</span>
          </div>

          {proxyStatus && (
            <div className="flex gap-4 text-xs text-white/40">
              <span>Total Proxies: {proxyStatus.total}</span>
              <span className="text-emerald-400">Alive: {proxyStatus.alive}</span>
              <span className="text-red-400">Dead: {proxyStatus.dead}</span>
            </div>
          )}

          <div>
            <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">
              Custom Proxies (JSON array or comma-separated)
            </label>
            <textarea
              value={settings.customProxies}
              onChange={(e) => setSettings({ ...settings, customProxies: e.target.value })}
              placeholder='["http://proxy1:8080", "http://proxy2:8080"]'
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/[0.08] text-white text-sm font-mono focus:outline-none focus:border-violet-500/40 transition-all resize-none"
            />
          </div>
        </div>
      </GlassCard>

      {/* Update Info */}
      <GlassCard title="Package Update">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-white/60">
              Current Version: <span className="font-mono text-cyan-300">{updateInfo?.currentVersion || "unknown"}</span>
            </p>
            {updateInfo?.hasUpdate && (
              <p className="text-sm text-amber-400">
                Update available: {updateInfo.latestVersion}
              </p>
            )}
            {updateInfo?.lastUpdate && (
              <p className="text-xs text-white/30">
                Last updated: {new Date(updateInfo.lastUpdate).toLocaleString()}
              </p>
            )}
          </div>
          <button
            onClick={handleUpdate}
            className="px-4 py-2 rounded-xl bg-cyan-600/20 border border-cyan-500/20 text-cyan-300 text-sm hover:bg-cyan-600/30 transition-all"
          >
            Check & Update
          </button>
        </div>
      </GlassCard>

      {/* Save Button */}
      {message && (
        <p className={`text-sm ${message.startsWith("✅") ? "text-emerald-400" : "text-red-400"}`}>
          {message}
        </p>
      )}
      <button
        onClick={handleSave}
        disabled={saving}
        className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium disabled:opacity-50 hover:shadow-lg hover:shadow-violet-500/20 transition-all"
      >
        {saving ? "Saving..." : "Save All Settings"}
      </button>
    </div>
  );
}

// ===================== Shared Components =====================
function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-2">
      <h2 className="text-xl font-bold text-white">{title}</h2>
      {subtitle && <p className="text-sm text-white/40 mt-0.5">{subtitle}</p>}
    </div>
  );
}

function GlassCard({
  children,
  title,
  className = "",
}: {
  children: React.ReactNode;
  title?: string;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5 backdrop-blur-sm ${className}`}>
      {title && (
        <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">{title}</h3>
      )}
      {children}
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/[0.08] text-white text-sm focus:outline-none focus:border-violet-500/40 transition-all appearance-none cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-gray-900 text-white">
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function ModelSelect({
  label,
  value,
  onChange,
  options,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs text-white/40 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/[0.08] text-white text-xs font-mono focus:outline-none focus:border-violet-500/40 transition-all appearance-none cursor-pointer"
        required={required}
      >
        <option value="" className="bg-gray-900">
          {required ? "Select model..." : "None"}
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-gray-900">
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

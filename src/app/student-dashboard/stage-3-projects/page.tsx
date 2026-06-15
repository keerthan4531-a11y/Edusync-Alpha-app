"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { ProjectsListView } from "./components/ProjectsListView";
import { NewProjectDialog } from "./components/NewProjectDialog";
import { ProjectWorkspace } from "./components/workspace/ProjectWorkspace";
import { useProject } from "./hooks/useProject";
import Editor from "@monaco-editor/react";
import { 
  Loader2, 
  ArrowLeft, 
  FolderGit2, 
  Users, 
  Calendar, 
  Bot, 
  MessageSquare, 
  Lightbulb, 
  CheckCircle, 
  Play, 
  Save, 
  Plus, 
  Search, 
  Building2, 
  Tag, 
  History, 
  UserPlus, 
  FileText, 
  AlertTriangle, 
  Crown, 
  Send,
  Code2,
  Clock,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GlassCard } from "@/components/ui/glass-card";
import { ProjectDTO, ProjectFileDTO, ProblemStatementDTO, MessageDTO } from "@/types/projects";

type TabId = "projects" | "repos" | "teams" | "ai" | "chat" | "problems" | "code-review";

export default function Stage3ProjectsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<TabId>("projects");
  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Repos tab states
  const [selectedRepoId, setSelectedRepoId] = useState<string | null>(null);
  const [repoDetails, setRepoDetails] = useState<ProjectDTO | null>(null);
  const [repoFiles, setRepoFiles] = useState<ProjectFileDTO[]>([]);
  const [repoActiveFileId, setRepoActiveFileId] = useState<string | null>(null);
  const [repoActiveFileContent, setRepoActiveFileContent] = useState("");
  const [repoActiveFileLanguage, setRepoActiveFileLanguage] = useState("plaintext");
  const [repoLoading, setRepoLoading] = useState(false);
  const [repoEditorSaving, setRepoEditorSaving] = useState(false);
  const [repoExecuting, setRepoExecuting] = useState(false);
  const [repoConsoleOutput, setRepoConsoleOutput] = useState("");
  const [mockCommits, setMockCommits] = useState<any[]>([]);

  // Version History states
  const [showHistory, setShowHistory] = useState(false);
  const [fileVersions, setFileVersions] = useState<any[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<any | null>(null);

  // Teams tab states
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [teamDetails, setTeamDetails] = useState<any>(null);
  const [teamLoading, setTeamLoading] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [memberSearchResults, setMemberSearchResults] = useState<any[]>([]);
  const [memberSearching, setMemberSearching] = useState(false);
  const [memberAddingId, setMemberAddingId] = useState<string | null>(null);
  
  // Discover teams states
  const [discoverGroups, setDiscoverGroups] = useState<any[]>([]);
  const [discoverLoading, setDiscoverLoading] = useState(false);
  const [joiningGroupId, setJoiningGroupId] = useState<string | null>(null);

  // Faculty verification states
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState("");
  const [submittingVerify, setSubmittingVerify] = useState(false);

  // AI assistant tab states
  const [aiMessage, setAiMessage] = useState("");
  const [aiChatHistory, setAiChatHistory] = useState<any[]>([
    { role: "assistant", content: "Hello! I'm Gemma, your AI Code Assistant. Ask me anything about programming concepts, debug suggestions, or project designs!" }
  ]);
  const [aiSending, setAiSending] = useState(false);
  const [ideaInspiration, setIdeaInspiration] = useState("");
  const [suggestedIdeas, setSuggestedIdeas] = useState<string | null>(null);
  const [ideasLoading, setIdeasLoading] = useState(false);

  // Team Chat tab states
  const [chatSelectedProjectId, setChatSelectedProjectId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<MessageDTO[]>([]);
  const [chatInputMessage, setChatInputMessage] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Problem statements tab states
  const [problems, setProblems] = useState<ProblemStatementDTO[]>([]);
  const [problemsLoading, setProblemsLoading] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState<ProblemStatementDTO | null>(null);
  const [linkingProjectId, setLinkingProjectId] = useState("");
  const [linkingLoading, setLinkingLoading] = useState(false);

  // Code review tab states
  const [reviewCode, setReviewCode] = useState("");
  const [reviewLanguage, setReviewLanguage] = useState("python");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewResults, setReviewResults] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDiscoverGroups = async () => {
    setDiscoverLoading(true);
    try {
      const res = await fetch("/api/teams/discover");
      if (res.ok) {
        const data = await res.json();
        setDiscoverGroups(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDiscoverLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchDiscoverGroups();
  }, []);

  // Fetch discoverable groups on tab change
  useEffect(() => {
    if (activeTab === "teams") {
      fetchDiscoverGroups();
    }
  }, [activeTab]);

  // Poll chat messages if selected
  useEffect(() => {
    if (!chatSelectedProjectId) return;
    
    const fetchChatMessages = async () => {
      try {
        const res = await fetch(`/api/projects/${chatSelectedProjectId}/messages`);
        if (res.ok) {
          const data = await res.json();
          setChatMessages(data);
        }
      } catch (err) {
        console.error("Chat polling error", err);
      }
    };

    fetchChatMessages();
    const interval = setInterval(fetchChatMessages, 4000);
    return () => clearInterval(interval);
  }, [chatSelectedProjectId]);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Handle loading repo info
  useEffect(() => {
    if (!selectedRepoId) return;

    const loadRepoInfo = async () => {
      setRepoLoading(true);
      try {
        const res = await fetch(`/api/projects/${selectedRepoId}`);
        if (res.ok) {
          const data = await res.json();
          setRepoDetails(data);
          setRepoFiles(data.files || []);
          
          // Generate realistic mock commits based on files & updates
          const commits = [
            { id: "c1", message: "Initial repository setup & config", author: data.owner?.name || "Developer", date: new Date(data.createdAt).toLocaleString() },
            { id: "c2", message: `Added basic structural files`, author: data.owner?.name || "Developer", date: new Date(new Date(data.createdAt).getTime() + 1000 * 60 * 30).toLocaleString() }
          ];
          if (data.files?.length > 0) {
            commits.push({
              id: "c3",
              message: `Modified ${data.files[0].path} source code`,
              author: data.owner?.name || "Developer",
              date: new Date(data.updatedAt).toLocaleString()
            });
          }
          setMockCommits(commits.reverse());

          if (data.files?.length > 0) {
            handleSelectRepoFile(data.files[0].id, data.files[0].path, data.files[0].language);
          } else {
            setRepoActiveFileId(null);
            setRepoActiveFileContent("");
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setRepoLoading(false);
      }
    };

    loadRepoInfo();
  }, [selectedRepoId]);

  // Fetch Version History logs
  const fetchActiveFileHistory = async () => {
    if (!selectedRepoId || !repoActiveFileId) return;
    setVersionsLoading(true);
    try {
      const res = await fetch(`/api/projects/${selectedRepoId}/files/${repoActiveFileId}/history`);
      if (res.ok) {
        const data = await res.json();
        setFileVersions(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setVersionsLoading(false);
    }
  };

  useEffect(() => {
    if (showHistory) {
      fetchActiveFileHistory();
    }
  }, [showHistory, repoActiveFileId]);

  // Load Faculty List for Verification
  useEffect(() => {
    if (showVerifyModal) {
      fetch("/api/student/search?role=FACULTY")
        .then(res => res.json())
        .then(data => {
          setFacultyList(data);
          if (data.length > 0) setSelectedFacultyId(data[0].id);
        })
        .catch(err => console.error(err));
    }
  }, [showVerifyModal]);

  // Handle loading team info
  useEffect(() => {
    if (!selectedTeamId) return;

    const loadTeamInfo = async () => {
      setTeamLoading(true);
      try {
        const res = await fetch(`/api/projects/${selectedTeamId}`);
        if (res.ok) {
          const data = await res.json();
          setTeamDetails(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setTeamLoading(false);
      }
    };

    loadTeamInfo();
  }, [selectedTeamId]);

  // Handle loading problems
  useEffect(() => {
    if (activeTab === "problems") {
      setProblemsLoading(true);
      fetch("/api/problem-statements")
        .then(res => res.json())
        .then(data => {
          setProblems(data);
          setProblemsLoading(false);
        })
        .catch(err => {
          console.error(err);
          setProblemsLoading(false);
        });
    }
  }, [activeTab]);

  if (!session?.user?.id) return null;

  if (selectedProjectId) {
    return <ProjectWorkspaceContainer projectId={selectedProjectId} onBack={() => { setSelectedProjectId(null); fetchProjects(); }} currentUserId={session.user.id} />;
  }

  // Join discovered group
  const handleJoinGroup = async (teamId: string) => {
    setJoiningGroupId(teamId);
    try {
      const res = await fetch("/api/teams/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId })
      });
      if (res.ok) {
        alert("Successfully joined the collaborative team!");
        fetchDiscoverGroups();
        fetchProjects();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setJoiningGroupId(null);
    }
  };

  // Submit project to faculty for verification review
  const handleSubmitVerification = async () => {
    if (!selectedRepoId || !selectedFacultyId) return;
    setSubmittingVerify(true);
    try {
      const res = await fetch(`/api/projects/${selectedRepoId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ facultyId: selectedFacultyId })
      });
      if (res.ok) {
        alert("Success! Project submitted for faculty verification review.");
        setShowVerifyModal(false);
        setSelectedRepoId(null);
        fetchProjects();
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to submit project.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingVerify(false);
    }
  };

  // Repo file selections
  const handleSelectRepoFile = async (fileId: string, path: string, language: string) => {
    setRepoActiveFileId(fileId);
    setRepoActiveFileLanguage(language);
    setShowHistory(false);
    setSelectedVersion(null);
    try {
      const res = await fetch(`/api/projects/${selectedRepoId}/files/${fileId}`);
      if (res.ok) {
        const data = await res.json();
        setRepoActiveFileContent(data.content || "");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Save active repo file
  const handleSaveRepoFile = async () => {
    if (!selectedRepoId || !repoActiveFileId) return;
    setRepoEditorSaving(true);
    try {
      const res = await fetch(`/api/projects/${selectedRepoId}/files/${repoActiveFileId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: repoActiveFileContent })
      });
      if (res.ok) {
        // Add to commits logs
        setMockCommits(prev => [
          { id: Math.random().toString(), message: `Committed update: saved active file content`, author: session.user.name || "You", date: new Date().toLocaleString() },
          ...prev
        ]);
        if (showHistory) {
          fetchActiveFileHistory();
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRepoEditorSaving(false);
    }
  };

  // Compile and run repo code
  const handleRunRepoCode = async () => {
    if (!repoActiveFileContent) return;
    setRepoExecuting(true);
    setRepoConsoleOutput("Running compiler execution on server...\n");
    
    // Map languages to Judge0 ids
    const langMap: Record<string, number> = {
      python: 71,
      javascript: 63,
      typescript: 74,
      cpp: 54,
      java: 62,
      c: 50,
      go: 60,
      rust: 73
    };
    const languageId = langMap[repoActiveFileLanguage] || 71;

    try {
      const res = await fetch("/api/code/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceCode: repoActiveFileContent,
          languageId: String(languageId),
          testCases: [{ input: "", output: "Execution successful!\nProcess exited with status 0" }]
        })
      });

      const data = await res.json();
      if (data.success && data.results?.length > 0) {
        const mainResult = data.results[0];
        if (mainResult.stderr) {
          setRepoConsoleOutput(`Error Output (stderr):\n${mainResult.stderr}`);
        } else if (mainResult.compile_output) {
          setRepoConsoleOutput(`Compilation Error:\n${mainResult.compile_output}`);
        } else {
          setRepoConsoleOutput(`Console Output:\n${mainResult.stdout || "Execution succeeded with no stdout."}`);
        }
      } else {
        setRepoConsoleOutput(`Error: ${data.message || "Failed to execute code"}`);
      }
    } catch (err: any) {
      setRepoConsoleOutput(`Execution Error: ${err.message}`);
    } finally {
      setRepoExecuting(false);
    }
  };

  // New file in repository tab
  const handleCreateRepoFile = async () => {
    if (!selectedRepoId) return;
    const name = prompt("Enter file name (e.g. index.js):");
    if (!name) return;

    let ext = name.split('.').pop()?.toLowerCase();
    let language = "plaintext";
    if (ext === "py") language = "python";
    else if (ext === "js") language = "javascript";
    else if (ext === "ts") language = "typescript";
    else if (ext === "cpp" || ext === "cc") language = "cpp";
    else if (ext === "c") language = "c";
    else if (ext === "go") language = "go";
    else if (ext === "rs") language = "rust";

    try {
      const res = await fetch(`/api/projects/${selectedRepoId}/files`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: name, content: "", language })
      });
      
      if (res.ok) {
        const newFile = await res.json();
        setRepoFiles(prev => [...prev, newFile]);
        handleSelectRepoFile(newFile.id, newFile.path, newFile.language);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // User search for adding member to team
  const handleSearchMembers = async () => {
    if (memberSearchQuery.length < 2) return;
    setMemberSearching(true);
    try {
      const res = await fetch(`/api/student/search?query=${encodeURIComponent(memberSearchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setMemberSearchResults(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setMemberSearching(false);
    }
  };

  // Add member to selected team
  const handleAddMember = async (userId: string) => {
    if (!selectedTeamId) return;
    setMemberAddingId(userId);
    try {
      const res = await fetch(`/api/projects/${selectedTeamId}/team`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, roleInTeam: "MEMBER" })
      });
      if (res.ok) {
        alert("Member successfully added to team!");
        // Refresh team info
        const freshRes = await fetch(`/api/projects/${selectedTeamId}`);
        if (freshRes.ok) {
          const freshData = await freshRes.json();
          setTeamDetails(freshData);
        }
        setMemberSearchQuery("");
        setMemberSearchResults([]);
      } else {
        const errJson = await res.json();
        alert(errJson.error || "Failed to add member");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setMemberAddingId(null);
    }
  };

  // AI chat send
  const handleSendAIMessage = async () => {
    if (!aiMessage.trim()) return;
    const userText = aiMessage.trim();
    setAiMessage("");
    setAiChatHistory(prev => [...prev, { role: "user", content: userText }]);
    setAiSending(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          history: aiChatHistory,
          mode: "general"
        })
      });
      if (res.ok) {
        const data = await res.json();
        setAiChatHistory(prev => [...prev, { role: "assistant", content: data.response }]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiSending(false);
    }
  };

  // Generate project ideas
  const handleGenerateIdeas = async () => {
    setIdeasLoading(true);
    setSuggestedIdeas(null);
    try {
      const res = await fetch("/api/ai/code-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "idea-gen",
          data: { currentIdea: ideaInspiration }
        })
      });
      if (res.ok) {
        const data = await res.json();
        setSuggestedIdeas(data.response);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIdeasLoading(false);
    }
  };

  // Team chat send
  const handleSendTeamMessage = async () => {
    if (!chatInputMessage.trim() || !chatSelectedProjectId) return;
    const text = chatInputMessage.trim();
    setChatInputMessage("");
    try {
      const res = await fetch(`/api/projects/${chatSelectedProjectId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text })
      });
      if (res.ok) {
        const newMsg = await res.json();
        setChatMessages(prev => [...prev, newMsg]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Problem statement link to project
  const handleLinkProblemToProject = async () => {
    if (!selectedProblem || !linkingProjectId) return;
    setLinkingLoading(true);
    try {
      const res = await fetch(`/api/projects/${linkingProjectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemStatementId: selectedProblem.id })
      });
      if (res.ok) {
        alert("Successfully linked project to problem statement!");
        setSelectedProblem(null);
        setLinkingProjectId("");
        fetchProjects();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLinkingLoading(false);
    }
  };

  // Code review request
  const handleRequestReview = async () => {
    if (!reviewCode.trim()) return;
    setReviewLoading(true);
    setReviewResults(null);
    try {
      const res = await fetch("/api/ai/code-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "code-review",
          data: {
            fileContent: reviewCode,
            language: reviewLanguage,
            fileName: `review_snippet.${reviewLanguage === "python" ? "py" : reviewLanguage === "javascript" ? "js" : "cpp"}`
          }
        })
      });
      if (res.ok) {
        const data = await res.json();
        setReviewResults(data.response);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden text-foreground">
      {/* Top stage info bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 mb-5 border-b border-white/10 shrink-0">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-stage3/20 text-stage3 border border-stage3/30 mb-2">
            <FolderGit2 className="h-3 w-3" />
            Stage 3: Real-world Projects
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-stage3 to-emerald-400 bg-clip-text text-transparent">
            CodeKalam - Collaborative Hub
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Build multi-file engineering challenges, review code, collaborate with groups, and solve SIH milestones.
          </p>
        </div>
        
        {activeTab === "projects" && (
          <NewProjectDialog onProjectCreated={fetchProjects} />
        )}
      </div>

      {/* Tabs list navigation */}
      <div className="flex overflow-x-auto gap-2 border-b border-white/10 pb-3 mb-6 scrollbar-none shrink-0">
        {(["projects", "repos", "teams", "ai", "chat", "problems", "code-review"] as TabId[]).map((tab) => {
          const tabLabels: Record<TabId, string> = {
            projects: "My Projects",
            repos: "Repositories",
            teams: "Teams",
            ai: "AI Assistant",
            chat: "Team Chat",
            problems: "Problem Statements",
            "code-review": "Code Review"
          };
          const tabIcons: Record<TabId, any> = {
            projects: FolderGit2,
            repos: History,
            teams: Users,
            ai: Bot,
            chat: MessageSquare,
            problems: Lightbulb,
            "code-review": CheckCircle
          };
          const Icon = tabIcons[tab];
          const isActive = activeTab === tab;

          return (
            <Button
              key={tab}
              variant={isActive ? "default" : "ghost"}
              className={`flex items-center gap-2 rounded-xl text-sm transition-all py-5 ${
                isActive 
                  ? "bg-stage3 hover:bg-stage3/90 text-stage3-foreground shadow-lg shadow-stage3/20" 
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
              onClick={() => {
                setActiveTab(tab);
                setSelectedRepoId(null);
                setSelectedTeamId(null);
                setSelectedProblem(null);
              }}
            >
              <Icon className="h-4 w-4" />
              <span>{tabLabels[tab]}</span>
              {tab === "projects" && projects.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-black/30 font-bold">
                  {projects.length}
                </span>
              )}
            </Button>
          );
        })}
      </div>

      {/* Main dynamic tabs containers */}
      <div className="flex-1 overflow-y-auto pr-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-stage3" />
            <p>Syncing dashboard content...</p>
          </div>
        ) : (
          <>
            {/* PROJECTS LIST TAB */}
            {activeTab === "projects" && (
              <ProjectsListView projects={projects} onSelectProject={setSelectedProjectId} />
            )}

            {/* REPOSITORIES EXPLORER / COMPILER EDITOR */}
            {activeTab === "repos" && (
              <div className="h-[calc(100vh-16rem)] min-h-[450px]">
                {!selectedRepoId ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((proj) => (
                      <GlassCard 
                        key={proj.id}
                        className="p-5 cursor-pointer hover:border-stage3/40 transition-all group flex flex-col justify-between"
                        onClick={() => setSelectedRepoId(proj.id)}
                      >
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <History className="h-3 w-3" />
                              Repo
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 font-bold border border-emerald-400/20">
                              {proj.status}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold group-hover:text-stage3 transition-colors">{proj.name}</h3>
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{proj.description || "No project description."}</p>
                        </div>
                        <div className="mt-6 pt-4 border-t border-white/5 text-xs text-muted-foreground flex justify-between items-center">
                          <span>Updated: {new Date(proj.updatedAt).toLocaleDateString()}</span>
                          <span className="text-stage3 group-hover:translate-x-1 transition-transform">Browse Code &rarr;</span>
                        </div>
                      </GlassCard>
                    ))}
                    {projects.length === 0 && (
                      <div className="col-span-full text-center py-16 text-muted-foreground">
                        <FolderGit2 className="h-12 w-12 mx-auto mb-3 opacity-40" />
                        <p>No repositories found. Create a project to start coding.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row h-full border border-white/10 rounded-2xl overflow-hidden bg-black/30">
                    {/* Repository sidebar files & details */}
                    <div className="w-full md:w-64 border-r border-white/10 flex flex-col h-[200px] md:h-full bg-black/40">
                      <div className="p-3 border-b border-white/10 flex items-center justify-between shrink-0">
                        <Button variant="ghost" size="sm" className="p-0 text-muted-foreground hover:text-foreground" onClick={() => setSelectedRepoId(null)}>
                          <ArrowLeft className="h-4 w-4 mr-1" /> Back
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs border-white/10 hover:bg-white/5" onClick={handleCreateRepoFile}>
                          <Plus className="h-3 w-3 mr-1" /> File
                        </Button>
                      </div>

                      {repoLoading ? (
                        <div className="flex-1 flex items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-stage3" /></div>
                      ) : (
                        <div className="flex-1 overflow-y-auto p-3 space-y-4">
                          <div>
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Files</h4>
                            <div className="space-y-1">
                              {repoFiles.map(f => (
                                <button
                                  key={f.id}
                                  className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center gap-2 transition-all ${
                                    repoActiveFileId === f.id 
                                      ? "bg-stage3/20 text-stage3 border border-stage3/30" 
                                      : "hover:bg-white/5 text-muted-foreground"
                                  }`}
                                  onClick={() => handleSelectRepoFile(f.id, f.path, f.language)}
                                >
                                  <FileText className="h-3.5 w-3.5" />
                                  <span className="truncate">{f.path}</span>
                                </button>
                              ))}
                              {repoFiles.length === 0 && (
                                <div className="text-[11px] text-muted-foreground p-2 italic">No files in repo. Click File to create one.</div>
                              )}
                            </div>
                          </div>

                          <div className="pt-2 border-t border-white/5">
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Commits History</h4>
                            <div className="space-y-3 pl-1">
                              {mockCommits.map(c => (
                                <div key={c.id} className="relative pl-4 border-l border-white/10 text-[10px] space-y-0.5">
                                  <div className="absolute -left-[4.5px] top-1 h-2 w-2 rounded-full bg-stage3" />
                                  <p className="font-semibold text-foreground line-clamp-1">{c.message}</p>
                                  <p className="text-muted-foreground">{c.author} • {c.date}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Repository main compiler screen */}
                    <div className="flex-1 flex flex-col h-full bg-black/10">
                      {/* Editor Toolbar */}
                      <div className="p-3 border-b border-white/10 bg-black/40 flex flex-wrap items-center justify-between gap-3 shrink-0">
                        <div className="flex items-center gap-2">
                          <select 
                            value={repoActiveFileLanguage} 
                            onChange={(e) => setRepoActiveFileLanguage(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:border-stage3 text-foreground"
                          >
                            <option value="python">Python</option>
                            <option value="javascript">JavaScript</option>
                            <option value="typescript">TypeScript</option>
                            <option value="cpp">C++</option>
                            <option value="java">Java</option>
                            <option value="c">C</option>
                            <option value="go">Go</option>
                            <option value="rust">Rust</option>
                          </select>

                          <Button size="sm" className="bg-stage3 hover:bg-stage3/90 text-stage3-foreground h-8" onClick={handleSaveRepoFile} disabled={repoEditorSaving || !repoActiveFileId}>
                            {repoEditorSaving ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Save className="h-3.5 w-3.5 mr-1" />}
                            Save
                          </Button>

                          <Button size="sm" variant="outline" className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 h-8" onClick={handleRunRepoCode} disabled={repoExecuting || !repoActiveFileId}>
                            {repoExecuting ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Play className="h-3.5 w-3.5 mr-1" />}
                            Run
                          </Button>

                          <Button size="sm" variant="ghost" className="h-8 text-xs border border-white/10 bg-white/5 text-muted-foreground hover:text-foreground" onClick={() => setShowHistory(!showHistory)} disabled={!repoActiveFileId}>
                            <Clock className="h-3.5 w-3.5 mr-1" /> Revisions
                          </Button>
                        </div>

                        <Button size="sm" variant="destructive" className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 h-8" onClick={() => setShowVerifyModal(true)}>
                          <CheckCircle className="h-3.5 w-3.5 mr-1" /> Submit to Faculty
                        </Button>
                      </div>

                      {/* Code Editor and Version History side by side */}
                      <div className="flex-1 flex min-h-[200px] relative">
                        {/* Monaco editor */}
                        <div className="flex-1 relative">
                          {repoActiveFileId ? (
                            <Editor
                              height="100%"
                              language={repoActiveFileLanguage}
                              theme="vs-dark"
                              value={repoActiveFileContent}
                              onChange={(val) => setRepoActiveFileContent(val || "")}
                              options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                lineHeight: 22,
                                padding: { top: 12 },
                                smoothScrolling: true,
                              }}
                            />
                          ) : (
                            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                              Select a repository file from the sidebar to view code.
                            </div>
                          )}
                        </div>

                        {/* File Version History Sidebar */}
                        {showHistory && (
                          <div className="w-64 border-l border-white/10 bg-slate-950/80 p-3 overflow-y-auto space-y-4 absolute right-0 top-0 h-full z-10 backdrop-blur-md">
                            <div className="flex items-center justify-between border-b border-white/5 pb-2">
                              <span className="text-xs font-bold text-stage3 flex items-center gap-1">
                                <Clock className="h-3 w-3" /> History
                              </span>
                              <button className="text-xs text-muted-foreground hover:text-foreground" onClick={() => setShowHistory(false)}>&times;</button>
                            </div>
                            
                            {versionsLoading ? (
                              <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-stage3" /></div>
                            ) : (
                              <div className="space-y-2">
                                {fileVersions.map((v, i) => (
                                  <div 
                                    key={v.id} 
                                    className="p-2 rounded bg-white/5 border border-white/5 hover:border-stage3/30 cursor-pointer text-[10px]"
                                    onClick={() => setSelectedVersion(v)}
                                  >
                                    <p className="font-semibold text-foreground">Version #{fileVersions.length - i}</p>
                                    <p className="text-muted-foreground mt-0.5">By: {v.updatedBy}</p>
                                    <p className="text-muted-foreground">{new Date(v.createdAt).toLocaleTimeString()}</p>
                                  </div>
                                ))}
                                {fileVersions.length === 0 && (
                                  <p className="text-center text-[10px] text-muted-foreground py-4">No revisions logged yet.</p>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Executions Terminal console */}
                      <div className="h-36 border-t border-white/10 bg-black/60 font-mono text-xs p-4 overflow-y-auto shrink-0">
                        <div className="flex items-center justify-between text-muted-foreground border-b border-white/5 pb-2 mb-2">
                          <span className="font-semibold uppercase text-[10px] tracking-wider text-stage3">Terminal Compiler Output</span>
                          <button className="text-[10px] hover:text-foreground" onClick={() => setRepoConsoleOutput("")}>Clear</button>
                        </div>
                        <pre className="whitespace-pre-wrap leading-relaxed text-emerald-400/90">{repoConsoleOutput || "Console ready. Write code and click 'Run' to execute."}</pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TEAMS COLLABORATORS MANAGEMENT */}
            {activeTab === "teams" && (
              <div className="min-h-[400px] space-y-6">
                {!selectedTeamId ? (
                  <div className="space-y-6">
                    {/* Active User Teams */}
                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-stage3 mb-4">My Groups</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((proj) => (
                          <GlassCard 
                            key={proj.id}
                            className="p-5 cursor-pointer hover:border-stage3/40 transition-all flex flex-col justify-between"
                            onClick={() => setSelectedTeamId(proj.id)}
                          >
                            <div>
                              <div className="flex justify-between items-center mb-3">
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  Collaborative Team
                                </span>
                                <Crown className="h-4 w-4 text-amber-500" />
                              </div>
                              <h3 className="text-lg font-bold">{proj.name}</h3>
                              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{proj.description || "No project description."}</p>
                            </div>
                            <div className="mt-6 pt-4 border-t border-white/5 text-xs text-muted-foreground flex justify-between items-center">
                              <span>Owner Account: {proj.ownerId === session.user.id ? "You" : "Other"}</span>
                              <span className="text-stage3 font-semibold">Manage Team &rarr;</span>
                            </div>
                          </GlassCard>
                        ))}
                        {projects.length === 0 && (
                          <div className="col-span-full text-center py-10 text-muted-foreground bg-white/5 rounded-2xl border border-white/10 p-5">
                            <Users className="h-10 w-10 mx-auto mb-2 opacity-40" />
                            <p>No team projects found. Create a project under "My Projects" to start.</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Discover Public Teams */}
                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-primary mb-4">Discover Public Groups</h3>
                      {discoverLoading ? (
                        <div className="flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-stage3" /></div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {discoverGroups.map(p => (
                            <GlassCard key={p.id} className="p-5 flex flex-col justify-between border-dashed border-white/20">
                              <div>
                                <div className="flex justify-between items-center mb-3">
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <ExternalLink className="h-3 w-3" />
                                    Public Group
                                  </span>
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-muted-foreground">
                                    {p.team?.members?.length || 0} members
                                  </span>
                                </div>
                                <h3 className="text-base font-bold">{p.name}</h3>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.description || "Open to collaborations."}</p>
                              </div>

                              <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center">
                                <span className="text-[10px] text-muted-foreground">Owner: {p.owner?.name}</span>
                                <Button 
                                  size="sm"
                                  className="h-7 text-xs bg-stage3 hover:bg-stage3/90 text-stage3-foreground"
                                  onClick={() => handleJoinGroup(p.team?.id)}
                                  disabled={joiningGroupId === p.team?.id}
                                >
                                  {joiningGroupId === p.team?.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Join Team"}
                                </Button>
                              </div>
                            </GlassCard>
                          ))}
                          {discoverGroups.length === 0 && (
                            <p className="text-xs text-muted-foreground p-3 italic">No discoverable public teams found.</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Group details & members list */}
                    <GlassCard className="p-6 lg:col-span-2 space-y-6">
                      <div className="flex items-start justify-between border-b border-white/10 pb-4">
                        <div>
                          <Button variant="ghost" size="sm" className="p-0 text-muted-foreground hover:text-foreground mb-2" onClick={() => setSelectedTeamId(null)}>
                            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Teams
                          </Button>
                          <h2 className="text-2xl font-bold">{teamDetails?.name || "Loading details..."}</h2>
                          <p className="text-sm text-muted-foreground mt-1">{teamDetails?.description || "Collaborative environment."}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" className="bg-stage3 hover:bg-stage3/90 text-stage3-foreground" onClick={() => setSelectedProjectId(selectedTeamId)}>
                            <FolderGit2 className="h-4 w-4 mr-1.5" /> Workspace
                          </Button>
                          <Button size="sm" variant="outline" className="border-white/10 hover:bg-white/5" onClick={() => { setChatSelectedProjectId(selectedTeamId); setActiveTab("chat"); }}>
                            <MessageSquare className="h-4 w-4 mr-1.5" /> Team Chat
                          </Button>
                        </div>
                      </div>

                      {teamLoading ? (
                        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-stage3" /></div>
                      ) : (
                        <div className="space-y-4">
                          <h3 className="text-sm font-semibold uppercase tracking-wider text-stage3">Group Members</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {teamDetails?.team?.members?.map((member: any) => (
                              <div key={member.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                                <div className="h-9 w-9 rounded-full bg-stage3/20 border border-stage3/40 flex items-center justify-center font-bold text-stage3 text-sm relative shrink-0">
                                  {member.user?.name?.charAt(0).toUpperCase() || "?"}
                                  {member.userId === teamDetails.ownerId && (
                                    <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-[2px] shadow-sm">
                                      <Crown className="h-2 w-2 text-white" />
                                    </div>
                                  )}
                                </div>
                                <div className="overflow-hidden">
                                  <p className="font-semibold text-sm truncate">{member.user?.name}</p>
                                  <p className="text-xs text-muted-foreground capitalize">{member.roleInTeam.toLowerCase()}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </GlassCard>

                    {/* Right: Search & add team members */}
                    <GlassCard className="p-6 space-y-6">
                      <h3 className="text-lg font-bold flex items-center gap-2">
                        <UserPlus className="h-5 w-5 text-stage3" />
                        Invite Classmates
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Add colleagues to join your coding team. Only project leaders can invite new members.
                      </p>

                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <Input 
                            value={memberSearchQuery}
                            onChange={(e) => setMemberSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearchMembers()}
                            placeholder="Enter name or email..."
                            className="bg-white/5 border-white/10"
                          />
                          <Button size="icon" className="bg-stage3 hover:bg-stage3/90" onClick={handleSearchMembers} disabled={memberSearching}>
                            {memberSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                          </Button>
                        </div>

                        <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                          {memberSearchResults.map(u => (
                            <div key={u.id} className="flex justify-between items-center p-2 rounded-lg bg-black/20 text-xs border border-white/5">
                              <div>
                                <p className="font-medium text-foreground">{u.name}</p>
                                <p className="text-[10px] text-muted-foreground">{u.email}</p>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-[10px] border-stage3/30 hover:bg-stage3/10 text-stage3"
                                onClick={() => handleAddMember(u.id)}
                                disabled={memberAddingId === u.id || teamDetails?.ownerId !== session.user.id}
                              >
                                {memberAddingId === u.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Invite"}
                              </Button>
                            </div>
                          ))}
                          {memberSearchResults.length === 0 && memberSearchQuery.length >= 2 && !memberSearching && (
                            <p className="text-center text-[11px] text-muted-foreground py-3">No students found.</p>
                          )}
                          {memberSearchQuery.length < 2 && (
                            <p className="text-center text-[10px] text-muted-foreground py-3">Type at least 2 characters to search.</p>
                          )}
                        </div>
                      </div>
                    </GlassCard>
                  </div>
                )}
              </div>
            )}

            {/* AI ASSISTANT CHAT & PROJECT BRAINSTORMER */}
            {activeTab === "ai" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-16rem)] min-h-[450px]">
                {/* Left: General chat with bot */}
                <GlassCard className="p-6 lg:col-span-2 flex flex-col h-full space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2 border-b border-white/10 pb-3 shrink-0">
                    <Bot className="h-5 w-5 text-stage3" />
                    AI Assistant Gemma
                  </h3>

                  <div className="flex-1 overflow-y-auto p-3 bg-black/20 rounded-xl space-y-4">
                    {aiChatHistory.map((chat, index) => {
                      const isUser = chat.role === "user";
                      return (
                        <div key={index} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                          <div className={`p-4 rounded-2xl text-sm max-w-[85%] leading-relaxed ${
                            isUser 
                              ? "bg-stage3 text-stage3-foreground rounded-tr-none shadow-md shadow-stage3/10" 
                              : "bg-white/5 border border-white/10 text-foreground rounded-tl-none whitespace-pre-line"
                          }`}>
                            <p className="text-[10px] opacity-75 font-semibold mb-1 uppercase tracking-wider">{chat.role === "user" ? "You" : "Gemma AI"}</p>
                            {chat.content}
                          </div>
                        </div>
                      );
                    })}
                    {aiSending && (
                      <div className="flex justify-start">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-muted-foreground text-sm rounded-tl-none flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-stage3" />
                          Gemma is thinking...
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <Input
                      value={aiMessage}
                      onChange={(e) => setAiMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendAIMessage()}
                      placeholder="Ask a technical or architectural programming question..."
                      className="bg-white/5 border-white/10"
                      disabled={aiSending}
                    />
                    <Button className="bg-stage3 hover:bg-stage3/90 text-stage3-foreground" onClick={handleSendAIMessage} disabled={aiSending || !aiMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </GlassCard>

                {/* Right: Ideas generator panel */}
                <GlassCard className="p-6 space-y-6 overflow-y-auto">
                  <h3 className="text-lg font-bold flex items-center gap-2 border-b border-white/10 pb-3">
                    <Lightbulb className="h-5 w-5 text-stage3" />
                    Brainstorm Ideas
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Generate software engineering ideas by describing tags, skills, or features you want to focus on.
                  </p>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Inspiration Tags</label>
                      <Input 
                        value={ideaInspiration}
                        onChange={(e) => setIdeaInspiration(e.target.value)}
                        placeholder="e.g. IoT, Rust, agriculture, blockchain..."
                        className="bg-white/5 border-white/10 text-xs"
                      />
                    </div>

                    <Button className="w-full bg-stage3 hover:bg-stage3/90 text-stage3-foreground" onClick={handleGenerateIdeas} disabled={ideasLoading}>
                      {ideasLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Bot className="h-4 w-4 mr-1.5" />}
                      Generate Project Ideas
                    </Button>

                    {suggestedIdeas && (
                      <div className="mt-4 p-4 rounded-xl bg-black/30 border border-white/5 text-xs text-foreground whitespace-pre-line leading-relaxed scrollbar-none">
                        {suggestedIdeas}
                      </div>
                    )}
                  </div>
                </GlassCard>
              </div>
            )}

            {/* REAL-TIME TEAM MESSAGING STREAM */}
            {activeTab === "chat" && (
              <div className="flex flex-col md:flex-row h-[calc(100vh-16rem)] min-h-[450px] border border-white/10 rounded-2xl overflow-hidden bg-black/30">
                {/* Active teams sidebar */}
                <div className="w-full md:w-64 border-r border-white/10 flex flex-col h-[150px] md:h-full bg-black/40">
                  <div className="p-4 border-b border-white/10 font-bold text-sm text-muted-foreground shrink-0 uppercase tracking-wider">
                    My Active Teams
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {projects.map(proj => (
                      <button
                        key={proj.id}
                        className={`w-full text-left px-3 py-3 rounded-xl text-xs flex items-center justify-between transition-all ${
                          chatSelectedProjectId === proj.id 
                            ? "bg-stage3/20 text-stage3 border border-stage3/30" 
                            : "hover:bg-white/5 text-muted-foreground"
                        }`}
                        onClick={() => {
                          setChatSelectedProjectId(proj.id);
                          setChatMessages([]);
                          setChatLoading(true);
                        }}
                      >
                        <div className="overflow-hidden mr-2">
                          <p className="font-semibold truncate text-foreground">{proj.name}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{proj.status}</p>
                        </div>
                        <Users className="h-4 w-4 shrink-0 text-muted-foreground/60" />
                      </button>
                    ))}
                    {projects.length === 0 && (
                      <p className="text-center text-xs text-muted-foreground py-6">No teams active.</p>
                    )}
                  </div>
                </div>

                {/* Team chat window stream */}
                <div className="flex-1 flex flex-col h-full bg-black/10">
                  <div className="p-4 border-b border-white/10 bg-black/40 flex items-center justify-between shrink-0">
                    <h3 className="font-bold text-sm">
                      {chatSelectedProjectId 
                        ? projects.find(p => p.id === chatSelectedProjectId)?.name + " Message Board" 
                        : "Select a Team to Chat"}
                    </h3>
                    {chatSelectedProjectId && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 font-bold border border-emerald-400/20 animate-pulse">
                        Live Sync
                      </span>
                    )}
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {chatSelectedProjectId ? (
                      <>
                        {chatMessages.map(msg => {
                          const isMe = msg.userId === session.user.id;
                          return (
                            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                              <div className={`flex flex-col max-w-[80%] ${isMe ? "items-end" : "items-start"}`}>
                                <span className="text-[10px] text-muted-foreground mb-1 px-1">
                                  {isMe ? "You" : (msg as any).user?.name || "Member"}
                                </span>
                                <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                                  isMe 
                                    ? "bg-stage3 text-stage3-foreground rounded-tr-none shadow-md shadow-stage3/10" 
                                    : "bg-white/5 border border-white/10 text-foreground rounded-tl-none"
                                }`}>
                                  {msg.content}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={chatEndRef} />
                        {chatMessages.length === 0 && (
                          <div className="text-center text-xs text-muted-foreground py-10">No messages yet. Say hello to your team!</div>
                        )}
                      </>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-sm gap-2">
                        <MessageSquare className="h-10 w-10 opacity-30" />
                        Select an active project team from the left list to load conversation logs.
                      </div>
                    )}
                  </div>

                  <div className="p-3 border-t border-white/10 bg-black/40 flex gap-2 shrink-0">
                    <Input
                      value={chatInputMessage}
                      onChange={(e) => setChatInputMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendTeamMessage()}
                      placeholder={chatSelectedProjectId ? "Type a message for team members..." : "Select team first"}
                      disabled={!chatSelectedProjectId}
                      className="bg-white/5 border-white/10"
                    />
                    <Button className="bg-stage3 hover:bg-stage3/90 text-stage3-foreground" onClick={handleSendTeamMessage} disabled={!chatSelectedProjectId || !chatInputMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* PROBLEM STATEMENTS HACKATHON DIALOGS */}
            {activeTab === "problems" && (
              <div className="min-h-[400px]">
                {problemsLoading ? (
                  <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-stage3" /></div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    {problems.map((prob, idx) => (
                      <GlassCard 
                        key={prob.id}
                        className="p-6 cursor-pointer hover:border-stage3/40 transition-all flex flex-col justify-between"
                        onClick={() => setSelectedProblem(prob)}
                      >
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-xs font-bold text-stage3">SIH-2026-00{idx + 1}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/20">
                              Software
                            </span>
                          </div>
                          <h3 className="text-lg font-bold line-clamp-1">{prob.title}</h3>
                          <p className="text-xs text-muted-foreground mt-2 font-semibold">Organization: Ministry of Innovation</p>
                          <p className="text-sm text-muted-foreground mt-3 line-clamp-3 leading-relaxed">{prob.description}</p>
                        </div>
                        <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Tag className="h-3 w-3" /> Hard</span>
                          <span className="text-stage3 font-semibold">View Details &rarr;</span>
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                )}

                {/* Problem Statement Detail slide-up modal overlay */}
                {selectedProblem && (
                  <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
                    <GlassCard className="max-w-2xl w-full p-6 space-y-6 relative max-h-[90vh] overflow-y-auto bg-slate-900/90 border border-white/20">
                      <div className="border-b border-white/10 pb-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-xs text-stage3 font-bold uppercase tracking-wider">Smart India Hackathon</span>
                            <h2 className="text-xl font-bold mt-1 text-foreground">{selectedProblem.title}</h2>
                          </div>
                          <button className="text-muted-foreground hover:text-foreground text-lg" onClick={() => { setSelectedProblem(null); setLinkingProjectId(""); }}>
                            &times;
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase">Problem Statement</h4>
                          <p className="text-sm text-foreground leading-relaxed mt-1">{selectedProblem.description}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t border-b border-white/5 py-4">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-muted-foreground">Difficulty</span>
                            <p className="text-xs font-semibold text-stage3 mt-0.5">Hard</p>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-muted-foreground">Linked Projects</span>
                            <p className="text-xs font-semibold text-foreground mt-0.5">
                              {projects.filter(p => p.problemStatementId === selectedProblem.id).length} Projects
                            </p>
                          </div>
                        </div>

                        {/* Project Linking panel */}
                        <div className="space-y-3 p-4 rounded-xl bg-black/40 border border-white/5">
                          <h4 className="text-xs font-bold text-stage3 uppercase tracking-wider">Link active project to this challenge</h4>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <select
                              value={linkingProjectId}
                              onChange={(e) => setLinkingProjectId(e.target.value)}
                              className="bg-white/5 border border-white/10 rounded-lg text-xs py-2 px-3 focus:outline-none focus:border-stage3 text-foreground flex-1"
                            >
                              <option value="">Select project...</option>
                              {projects
                                .filter(p => p.problemStatementId !== selectedProblem.id)
                                .map(p => (
                                  <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                            <Button 
                              size="sm" 
                              className="bg-stage3 hover:bg-stage3/90 text-stage3-foreground" 
                              onClick={handleLinkProblemToProject}
                              disabled={linkingLoading || !linkingProjectId}
                            >
                              {linkingLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Link"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  </div>
                )}
              </div>
            )}

            {/* AUTOMATED AI CODE REVIEW PANEL */}
            {activeTab === "code-review" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[400px]">
                {/* Left: input pane */}
                <GlassCard className="p-6 space-y-4 flex flex-col justify-between">
                  <div className="space-y-4 flex-1">
                    <h3 className="text-lg font-bold flex items-center gap-2 border-b border-white/10 pb-3">
                      <Code2 className="h-5 w-5 text-stage3" />
                      Paste Code for Review
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Our automated Gemma AI agent inspects your script snippets for security flaws, runtime bottlenecks, and clean conventions.
                    </p>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Programming Language</label>
                      <select 
                        value={reviewLanguage} 
                        onChange={(e) => setReviewLanguage(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg text-xs py-2 px-3 focus:outline-none focus:border-stage3 text-foreground w-full"
                      >
                        <option value="python">Python</option>
                        <option value="javascript">JavaScript</option>
                        <option value="cpp">C++</option>
                        <option value="c">C</option>
                        <option value="java">Java</option>
                      </select>
                    </div>

                    <div className="space-y-2 flex-1">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Source Code Snippet</label>
                      <Textarea 
                        value={reviewCode}
                        onChange={(e) => setReviewCode(e.target.value)}
                        placeholder="def calculate_data(x):\n    print('debugging')\n    return x * 42"
                        className="bg-white/5 border-white/10 text-xs font-mono h-60 w-full"
                      />
                    </div>
                  </div>

                  <Button className="w-full bg-stage3 hover:bg-stage3/90 text-stage3-foreground mt-4 py-6 text-sm font-semibold shadow-lg shadow-stage3/15" onClick={handleRequestReview} disabled={reviewLoading || !reviewCode.trim()}>
                    {reviewLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Bot className="h-4.5 w-4.5 mr-1.5" />}
                    Request AI Review
                  </Button>
                </GlassCard>

                {/* Right: reviews response display */}
                <GlassCard className="p-6 flex flex-col justify-between">
                  <div className="space-y-4 h-full overflow-y-auto">
                    <h3 className="text-lg font-bold flex items-center gap-2 border-b border-white/10 pb-3">
                      <Bot className="h-5 w-5 text-stage3" />
                      AI Review Results
                    </h3>

                    {reviewLoading ? (
                      <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
                        <Loader2 className="h-8 w-8 animate-spin text-stage3" />
                        <p>Analyzing code structure & dependencies...</p>
                      </div>
                    ) : reviewResults ? (
                      <div className="p-4 rounded-xl bg-black/30 border border-white/5 text-xs text-foreground whitespace-pre-line leading-relaxed overflow-y-auto scrollbar-none">
                        {reviewResults}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-2 text-center text-xs">
                        <AlertTriangle className="h-8 w-8 opacity-30" />
                        Submit a code snippet on the left to receive automated quality analysis.
                      </div>
                    )}
                  </div>
                </GlassCard>
              </div>
            )}
          </>
        )}
      </div>

      {/* Copy Version History Viewer Modal */}
      {selectedVersion && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <GlassCard className="max-w-2xl w-full p-6 space-y-6 relative max-h-[90vh] overflow-y-auto bg-slate-950 border border-white/25 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div>
                <h3 className="text-lg font-bold text-stage3 flex items-center gap-2">
                  <Clock className="h-5 w-5" /> Historical Code Revision
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">By: {selectedVersion.updatedBy} • {new Date(selectedVersion.createdAt).toLocaleString()}</p>
              </div>
              <button className="text-muted-foreground hover:text-foreground text-lg" onClick={() => setSelectedVersion(null)}>&times;</button>
            </div>
            
            <div className="h-80 border border-white/10 rounded-xl overflow-hidden bg-black/40">
              <Editor
                height="100%"
                language={repoActiveFileLanguage}
                theme="vs-dark"
                value={selectedVersion.content}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineHeight: 20
                }}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" className="border-white/10 text-foreground" onClick={() => setSelectedVersion(null)}>Close</Button>
              <Button 
                className="bg-stage3 hover:bg-stage3/90 text-stage3-foreground" 
                onClick={() => {
                  setRepoActiveFileContent(selectedVersion.content);
                  setSelectedVersion(null);
                  alert("Restored revision code to the active editor workspace!");
                }}
              >
                Restore to Editor
              </Button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Submit to Faculty Review Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <GlassCard className="max-w-md w-full p-6 space-y-5 relative bg-slate-900 border border-white/20 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <h3 className="text-lg font-bold text-foreground">Submit for Verification Review</h3>
              <button className="text-muted-foreground hover:text-foreground text-lg" onClick={() => setShowVerifyModal(false)}>&times;</button>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Select a faculty evaluator from your department to audit your files. Once submitted, your repository will lock as pending.
            </p>
            
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Faculty Reviewer</label>
              <select 
                value={selectedFacultyId} 
                onChange={(e) => setSelectedFacultyId(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg text-xs py-2.5 px-3 focus:outline-none focus:border-stage3 text-foreground w-full"
              >
                {facultyList.map(f => (
                  <option key={f.id} value={f.id}>{f.name} ({f.email})</option>
                ))}
                {facultyList.length === 0 && (
                  <option value="">No faculty loaded...</option>
                )}
              </select>
            </div>
            
            <div className="flex justify-end gap-2 border-t border-white/10 pt-4 mt-4">
              <Button variant="outline" className="border-white/10 text-foreground" onClick={() => setShowVerifyModal(false)}>Cancel</Button>
              <Button 
                className="bg-stage3 hover:bg-stage3/90 text-stage3-foreground" 
                onClick={handleSubmitVerification}
                disabled={submittingVerify || !selectedFacultyId}
              >
                {submittingVerify ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                Submit Review
              </Button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}

// Separate component for the workspace to use its own hooks cleanly
function ProjectWorkspaceContainer({ projectId, onBack, currentUserId }: { projectId: string, onBack: () => void, currentUserId: string }) {
  const { project, files, team, activeFileId, setActiveFileId, loading, error, addFileLocally } = useProject(projectId);
  const [collabToast, setCollabToast] = useState<string | null>(null);

  // Live Collaborator Simulator
  useEffect(() => {
    if (loading || error || !project) return;

    const collaborators = ["Alex Johnson", "Samantha Lee", "Michael Chen", "Emily Davis"];
    const filePaths = files.length > 0 ? files.map(f => f.path) : ["main.py", "index.js", "App.tsx"];
    
    const runSimulation = () => {
      const randomCollab = collaborators[Math.floor(Math.random() * collaborators.length)];
      const randomPath = filePaths[Math.floor(Math.random() * filePaths.length)];
      const actions = [
        `is editing ${randomPath}...`,
        `saved a draft revision for ${randomPath}`,
        `joined the project workspace`,
        `is reviewing variables structure in ${randomPath}`
      ];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      
      setCollabToast(`${randomCollab} ${randomAction}`);
      
      // Clear toast after 5 seconds
      setTimeout(() => {
        setCollabToast(null);
      }, 5000);
    };

    const interval = setInterval(runSimulation, 25000); // Trigger every 25 seconds
    return () => clearInterval(interval);
  }, [loading, error, project, files]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-stage3" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-400 gap-4">
        <p>{error || "Failed to load project"}</p>
        <Button variant="outline" onClick={onBack}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] relative">
      {/* Collaborative sliding toast banner */}
      {collabToast && (
        <div className="absolute top-4 right-4 z-50 bg-stage3 text-stage3-foreground border border-stage3/30 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-lg shadow-stage3/20 flex items-center gap-2 animate-bounce">
          <Users className="h-4 w-4" />
          <span>{collabToast}</span>
        </div>
      )}

      <div className="flex items-center gap-4 pb-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-white/10">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            {project.name}
            <span className="text-sm font-normal px-2 py-0.5 rounded-full bg-stage3/20 text-stage3 border border-stage3/50">
              {project.status}
            </span>
          </h1>
          {(project as any).problemStatement && (
            <p className="text-xs text-muted-foreground mt-1">Challenge: {(project as any).problemStatement.title}</p>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <ProjectWorkspace 
          project={project}
          files={files}
          team={team}
          activeFileId={activeFileId}
          setActiveFileId={setActiveFileId}
          onFileCreated={addFileLocally}
          currentUserId={currentUserId}
        />
      </div>
    </div>
  );
}

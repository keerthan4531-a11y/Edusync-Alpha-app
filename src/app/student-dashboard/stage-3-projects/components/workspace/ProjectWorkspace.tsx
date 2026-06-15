import { useState, useMemo } from "react";
import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from "@/components/ui/resizable";
import { FileExplorer } from "./FileExplorer";
import { EditorTabs } from "./EditorTabs";
import { WorkspaceEditor } from "./WorkspaceEditor";
import { AIAssistantPanel } from "./AIAssistantPanel";
import { TeamChatPanel } from "./TeamChatPanel";
import { TeamMembersBar } from "./TeamMembersBar";
import { ProjectDTO, ProjectFileDTO } from "@/types/projects";
import { FolderGit2, Code2, Users } from "lucide-react";

interface Props {
  project: ProjectDTO;
  files: ProjectFileDTO[];
  team: any;
  activeFileId: string | null;
  currentUserId: string;
  setActiveFileId: (id: string) => void;
  onFileCreated: (file: ProjectFileDTO) => void;
}

export function ProjectWorkspace({ project, files, team, activeFileId, currentUserId, setActiveFileId, onFileCreated }: Props) {
  const [openFileIds, setOpenFileIds] = useState<string[]>([]);
  const [activePane, setActivePane] = useState<"explorer" | "editor" | "collab">("editor");
  
  // Update open tabs if a new file is active
  useMemo(() => {
    if (activeFileId && !openFileIds.includes(activeFileId)) {
      setOpenFileIds(prev => [...prev, activeFileId]);
    }
  }, [activeFileId, openFileIds]);

  const activeFile = files.find(f => f.id === activeFileId);
  const openFiles = files.filter(f => openFileIds.includes(f.id));

  const handleSelectFile = (id: string) => {
    setActiveFileId(id);
  };

  const handleCloseFile = (id: string) => {
    const newOpenIds = openFileIds.filter(fid => fid !== id);
    setOpenFileIds(newOpenIds);
    if (activeFileId === id) {
      setActiveFileId(newOpenIds.length > 0 ? newOpenIds[newOpenIds.length - 1] : "");
    }
  };

  const handleCreateFile = async () => {
    const name = prompt("Enter file name (e.g. main.py):");
    if (!name) return;
    
    let ext = name.split('.').pop()?.toLowerCase();
    let language = "plaintext";
    if (ext === "py") language = "python";
    if (ext === "js") language = "javascript";
    if (ext === "ts") language = "typescript";

    const res = await fetch(`/api/projects/${project.id}/files`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: name, content: "", language })
    });
    
    if (res.ok) {
      const newFile = await res.json();
      onFileCreated(newFile);
    }
  };

  return (
    <div className="flex flex-col h-full border border-white/10 rounded-xl overflow-hidden bg-black/20">
      <TeamMembersBar team={team} ownerId={project.ownerId} />
      
      {/* Desktop view: Resizable panels side-by-side */}
      <div className="hidden md:flex flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          {/* Left sidebar: File Explorer */}
          <ResizablePanel defaultSize={15} minSize={10} maxSize={30}>
            <FileExplorer 
              files={files} 
              activeFileId={activeFileId} 
              onSelectFile={handleSelectFile} 
              onCreateFile={handleCreateFile} 
            />
          </ResizablePanel>
          
          <ResizableHandle className="w-1 bg-white/10 hover:bg-stage3/50 transition-colors" />

          {/* Center: Code Editor */}
          <ResizablePanel defaultSize={60}>
            <div className="flex flex-col h-full">
              <EditorTabs 
                openFiles={openFiles} 
                activeFileId={activeFileId} 
                onSelectFile={handleSelectFile} 
                onCloseFile={handleCloseFile} 
              />
              <WorkspaceEditor 
                projectId={project.id} 
                fileId={activeFileId} 
                language={activeFile?.language} 
              />
            </div>
          </ResizablePanel>

          <ResizableHandle className="w-1 bg-white/10 hover:bg-stage3/50 transition-colors" />

          {/* Right sidebar: AI & Chat */}
          <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={60}>
                <AIAssistantPanel 
                  activeFileName={activeFile?.path}
                  activeLanguage={activeFile?.language}
                  activeFileContent=""
                />
              </ResizablePanel>
              <ResizableHandle className="h-1 bg-white/10 hover:bg-stage3/50 transition-colors" />
              <ResizablePanel defaultSize={40}>
                <TeamChatPanel projectId={project.id} currentUserId={currentUserId} />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Mobile view: Dynamic panel switching tab-bar */}
      <div className="flex md:hidden flex-col flex-1 overflow-hidden">
        <div className="flex-1 overflow-hidden flex flex-col">
          {activePane === "explorer" && (
            <FileExplorer 
              files={files} 
              activeFileId={activeFileId} 
              onSelectFile={(id) => {
                handleSelectFile(id);
                setActivePane("editor"); // auto-switch to editor when a file is selected
              }} 
              onCreateFile={handleCreateFile} 
            />
          )}
          {activePane === "editor" && (
            <div className="flex flex-col h-full overflow-hidden">
              <EditorTabs 
                openFiles={openFiles} 
                activeFileId={activeFileId} 
                onSelectFile={handleSelectFile} 
                onCloseFile={handleCloseFile} 
              />
              <div className="flex-1 min-h-[300px]">
                <WorkspaceEditor 
                  projectId={project.id} 
                  fileId={activeFileId} 
                  language={activeFile?.language} 
                />
              </div>
            </div>
          )}
          {activePane === "collab" && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto min-h-[200px]">
                <AIAssistantPanel 
                  activeFileName={activeFile?.path}
                  activeLanguage={activeFile?.language}
                  activeFileContent=""
                />
              </div>
              <div className="h-72 border-t border-white/10 shrink-0">
                <TeamChatPanel projectId={project.id} currentUserId={currentUserId} />
              </div>
            </div>
          )}
        </div>
        
        {/* Navigation bottom bar for mobile switching */}
        <div className="flex border-t border-white/10 bg-black/60 shrink-0">
          <button 
            className={`flex-1 py-3 text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
              activePane === "explorer" 
                ? "text-stage3 bg-white/5" 
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            }`}
            onClick={() => setActivePane("explorer")}
          >
            <FolderGit2 className="h-4 w-4" />
            <span>Explorer</span>
          </button>
          <button 
            className={`flex-1 py-3 text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
              activePane === "editor" 
                ? "text-stage3 bg-white/5" 
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            }`}
            onClick={() => setActivePane("editor")}
          >
            <Code2 className="h-4 w-4" />
            <span>Editor</span>
          </button>
          <button 
            className={`flex-1 py-3 text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
              activePane === "collab" 
                ? "text-stage3 bg-white/5" 
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            }`}
            onClick={() => setActivePane("collab")}
          >
            <Users className="h-4 w-4" />
            <span>Collab</span>
          </button>
        </div>
      </div>
    </div>
  );
}

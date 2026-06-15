import { useState, useMemo } from "react";
import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from "@/components/ui/resizable";
import { FileExplorer } from "./FileExplorer";
import { EditorTabs } from "./EditorTabs";
import { WorkspaceEditor } from "./WorkspaceEditor";
import { AIAssistantPanel } from "./AIAssistantPanel";
import { TeamChatPanel } from "./TeamChatPanel";
import { TeamMembersBar } from "./TeamMembersBar";
import { ProjectDTO, ProjectFileDTO } from "@/types/projects";

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
                activeFileContent="" // Need to actually pass content, but we don't store it in the tree. The hook does.
                // We'll pass empty for now since AIAssistantPanel currently mocks anyway, but it's a known limitation
                // For a real app, the `WorkspaceEditor` should bubble up its current content to this parent.
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
  );
}

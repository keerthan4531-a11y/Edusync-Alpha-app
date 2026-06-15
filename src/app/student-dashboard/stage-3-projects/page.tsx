"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { ProjectsListView } from "./components/ProjectsListView";
import { NewProjectDialog } from "./components/NewProjectDialog";
import { ProjectWorkspace } from "./components/workspace/ProjectWorkspace";
import { useProject } from "./hooks/useProject";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectDTO } from "@/types/projects";

export default function Stage3ProjectsPage() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

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

  useEffect(() => {
    fetchProjects();
  }, []);

  if (!session?.user?.id) return null;

  if (selectedProjectId) {
    return <ProjectWorkspaceContainer projectId={selectedProjectId} onBack={() => setSelectedProjectId(null)} currentUserId={session.user.id} />;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stage3">Stage 3: Projects</h1>
          <p className="text-sm text-muted-foreground">Collaborate on multi-file engineering challenges.</p>
        </div>
        <NewProjectDialog onProjectCreated={fetchProjects} />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center flex-1 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-stage3 mb-4" />
          <p>Loading projects...</p>
        </div>
      ) : (
        <ProjectsListView projects={projects} onSelectProject={setSelectedProjectId} />
      )}
    </div>
  );
}

// Separate component for the workspace to use its own hooks cleanly
function ProjectWorkspaceContainer({ projectId, onBack, currentUserId }: { projectId: string, onBack: () => void, currentUserId: string }) {
  const { project, files, team, activeFileId, setActiveFileId, loading, error, addFileLocally } = useProject(projectId);

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
    <div className="flex flex-col h-[calc(100vh-8rem)]">
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

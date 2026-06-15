import { useState, useEffect, useCallback } from "react";
import { ProjectDTO, ProjectFileDTO, TeamDTO } from "@/types/projects";

export function useProject(projectId: string) {
  const [project, setProject] = useState<ProjectDTO | null>(null);
  const [files, setFiles] = useState<ProjectFileDTO[]>([]);
  const [team, setTeam] = useState<TeamDTO | null>(null);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjectData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/projects/${projectId}`);
      if (!res.ok) throw new Error("Failed to fetch project");
      const data = await res.json();
      
      setProject(data);
      setFiles(data.files || []);
      setTeam(data.team || null);
      
      if (data.files?.length > 0 && !activeFileId) {
        setActiveFileId(data.files[0].id);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [projectId, activeFileId]);

  useEffect(() => {
    fetchProjectData();
  }, [fetchProjectData]);

  const addFileLocally = (file: ProjectFileDTO) => {
    setFiles(prev => [...prev, file]);
    setActiveFileId(file.id);
  };

  return {
    project,
    files,
    team,
    activeFileId,
    setActiveFileId,
    loading,
    error,
    addFileLocally,
    refreshProject: fetchProjectData
  };
}

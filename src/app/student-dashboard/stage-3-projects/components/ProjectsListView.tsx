import { ProjectDTO } from "@/types/projects";
import { GlassCard } from "@/components/ui/glass-card";
import { FolderGit2, Users, Calendar } from "lucide-react";

interface Props {
  projects: ProjectDTO[];
  onSelectProject: (id: string) => void;
}

export function ProjectsListView({ projects, onSelectProject }: Props) {
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <FolderGit2 className="h-16 w-16 mb-4 opacity-50" />
        <h3 className="text-xl font-semibold mb-2 text-foreground">No Projects Yet</h3>
        <p>Create a new project to start collaborating with your team.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {projects.map((project: any) => (
        <GlassCard 
          key={project.id} 
          className="p-5 cursor-pointer hover:border-stage3/50 transition-colors"
          onClick={() => onSelectProject(project.id)}
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold">{project.name}</h3>
            <span className={`px-2 py-1 text-xs rounded-full ${project.status === 'ACTIVE' ? 'bg-stage3/20 text-stage3' : 'bg-muted text-muted-foreground'}`}>
              {project.status}
            </span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-6">
            {project.description || "No description provided."}
          </p>
          <div className="flex justify-between items-center text-xs text-muted-foreground pt-4 border-t border-white/10">
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{project.owner?.name || "Owner"}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}

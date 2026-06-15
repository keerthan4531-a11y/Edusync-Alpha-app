import { ProjectFileDTO } from "@/types/projects";
import { FolderGit2, FileCode2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  files: ProjectFileDTO[];
  activeFileId: string | null;
  onSelectFile: (id: string) => void;
  onCreateFile: () => void;
}

export function FileExplorer({ files, activeFileId, onSelectFile, onCreateFile }: Props) {
  return (
    <div className="h-full flex flex-col bg-muted/10 border-r border-white/10">
      <div className="p-4 border-b border-white/10 flex justify-between items-center">
        <div className="flex items-center gap-2 font-semibold">
          <FolderGit2 className="h-4 w-4" />
          <span>Explorer</span>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onCreateFile}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {files.map(file => (
          <div 
            key={file.id}
            onClick={() => onSelectFile(file.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer text-sm mb-1 transition-colors ${
              activeFileId === file.id ? "bg-stage3/20 text-stage3" : "hover:bg-white/5 text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileCode2 className="h-4 w-4 opacity-70" />
            <span className="truncate">{file.path}</span>
          </div>
        ))}
        {files.length === 0 && (
          <div className="text-center text-xs text-muted-foreground p-4">
            No files yet. Create one!
          </div>
        )}
      </div>
    </div>
  );
}

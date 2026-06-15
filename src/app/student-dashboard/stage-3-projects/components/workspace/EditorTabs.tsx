import { ProjectFileDTO } from "@/types/projects";
import { X, FileCode2 } from "lucide-react";

interface Props {
  openFiles: ProjectFileDTO[];
  activeFileId: string | null;
  onSelectFile: (id: string) => void;
  onCloseFile: (id: string) => void;
}

export function EditorTabs({ openFiles, activeFileId, onSelectFile, onCloseFile }: Props) {
  if (openFiles.length === 0) return null;

  return (
    <div className="flex overflow-x-auto bg-black/40 border-b border-white/10 scrollbar-hide">
      {openFiles.map(file => (
        <div
          key={file.id}
          className={`flex items-center gap-2 px-4 py-2 min-w-32 border-r border-white/10 cursor-pointer text-sm transition-colors ${
            activeFileId === file.id ? "bg-white/5 text-foreground border-t-2 border-t-stage3" : "text-muted-foreground hover:bg-white/5"
          }`}
          onClick={() => onSelectFile(file.id)}
        >
          <FileCode2 className="h-3 w-3 opacity-70" />
          <span className="truncate flex-1">{file.path}</span>
          <button 
            className="p-1 rounded-full hover:bg-white/10 opacity-50 hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              onCloseFile(file.id);
            }}
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  );
}

import Editor from "@monaco-editor/react";
import { useFileContent } from "../../hooks/useFileContent";
import { Loader2 } from "lucide-react";

interface Props {
  projectId: string;
  fileId: string | null;
  language?: string;
}

export function WorkspaceEditor({ projectId, fileId, language = "plaintext" }: Props) {
  const { content, updateContent, loading, saving } = useFileContent(projectId, fileId);

  if (!fileId) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground bg-black/20">
        Select a file from the explorer to start editing
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground bg-black/20">
        <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading file...
      </div>
    );
  }

  return (
    <div className="flex-1 relative bg-black/20">
      <div className="absolute top-2 right-4 z-10 text-xs text-muted-foreground bg-black/50 px-2 py-1 rounded">
        {saving ? "Saving..." : "Saved"}
      </div>
      <Editor
        height="100%"
        language={language}
        theme="vs-dark"
        value={content}
        onChange={(val) => updateContent(val || "")}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineHeight: 24,
          padding: { top: 16 },
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          formatOnPaste: true,
        }}
        loading={<div className="flex items-center justify-center h-full text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin" /></div>}
      />
    </div>
  );
}

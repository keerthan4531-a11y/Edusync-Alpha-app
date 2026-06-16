import { useState } from "react";
import { useAIAssistant } from "../../hooks/useAIAssistant";
import { Button } from "@/components/ui/button";
import { Bot, Lightbulb, Code2, Network, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github-dark.css";

interface Props {
  activeFileContent?: string;
  activeLanguage?: string;
  activeFileName?: string;
}

export function AIAssistantPanel({ activeFileContent, activeLanguage, activeFileName }: Props) {
  const { requestAI, loading, response, error } = useAIAssistant();
  const [activeTab, setActiveTab] = useState<"code-review" | "architecture" | "idea-gen">("code-review");

  const handleAIRequest = () => {
    if (activeTab === "code-review") {
      requestAI("code-review", {
        fileContent: activeFileContent || "",
        language: activeLanguage || "plaintext",
        fileName: activeFileName || "unknown"
      });
    } else if (activeTab === "architecture") {
      requestAI("architecture", { projectContext: "Simulated context" });
    } else {
      requestAI("idea-gen", {});
    }
  };

  return (
    <div className="flex flex-col h-full bg-black/40">
      <div className="p-3 border-b border-white/10 flex items-center gap-2">
        <Bot className="h-5 w-5 text-stage3" />
        <span className="font-semibold text-sm">AI Assistant</span>
      </div>

      <div className="flex p-2 gap-1 border-b border-white/10 bg-black/20">
        <Button 
          variant={activeTab === "code-review" ? "secondary" : "ghost"} 
          size="sm" 
          className="flex-1 text-xs"
          onClick={() => setActiveTab("code-review")}
        >
          <Code2 className="h-3 w-3 mr-1" /> Review
        </Button>
        <Button 
          variant={activeTab === "architecture" ? "secondary" : "ghost"} 
          size="sm" 
          className="flex-1 text-xs"
          onClick={() => setActiveTab("architecture")}
        >
          <Network className="h-3 w-3 mr-1" /> Arch
        </Button>
        <Button 
          variant={activeTab === "idea-gen" ? "secondary" : "ghost"} 
          size="sm" 
          className="flex-1 text-xs"
          onClick={() => setActiveTab("idea-gen")}
        >
          <Lightbulb className="h-3 w-3 mr-1" /> Ideas
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground mt-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-stage3" />
            <p className="text-sm">Inixa is thinking...</p>
          </div>
        ) : error ? (
          <div className="text-red-400 text-sm p-3 bg-red-400/10 rounded-md border border-red-400/20">
            {error}
          </div>
        ) : response ? (
          <div className="prose prose-invert prose-sm max-w-none prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10">
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex, rehypeHighlight]}
            >
              {response}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="text-center text-muted-foreground text-sm mt-10">
            Select a mode and click analyze to get AI assistance for your project.
          </div>
        )}
      </ScrollArea>

      <div className="p-3 border-t border-white/10">
        <Button 
          className="w-full bg-stage3 hover:bg-stage3/90" 
          onClick={handleAIRequest}
          disabled={loading || (activeTab === "code-review" && !activeFileContent)}
        >
          {activeTab === "code-review" ? "Review Current File" : 
           activeTab === "architecture" ? "Suggest Architecture" : 
           "Generate Ideas"}
        </Button>
      </div>
    </div>
  );
}

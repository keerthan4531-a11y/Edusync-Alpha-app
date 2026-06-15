import { useState } from "react";
import { useTeamChat } from "../../hooks/useTeamChat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageSquare } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Props {
  projectId: string;
  currentUserId: string;
}

export function TeamChatPanel({ projectId, currentUserId }: Props) {
  const { messages, loading, sendMessage } = useTeamChat(projectId);
  const [content, setContent] = useState("");

  const handleSend = () => {
    if (content.trim()) {
      sendMessage(content.trim());
      setContent("");
    }
  };

  return (
    <div className="flex flex-col h-full bg-black/40">
      <div className="p-3 border-b border-white/10 flex items-center gap-2">
        <MessageSquare className="h-4 w-4" />
        <span className="font-semibold text-sm">Team Chat</span>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        {loading && messages.length === 0 ? (
          <div className="text-center text-xs text-muted-foreground mt-10">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-xs text-muted-foreground mt-10">No messages yet. Say hi!</div>
        ) : (
          <div className="space-y-4">
            {messages.map(msg => {
              const isMe = msg.userId === currentUserId;
              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                  <span className="text-[10px] text-muted-foreground mb-1 px-1">
                    {isMe ? "You" : (msg as any).user?.name || "Member"}
                  </span>
                  <div className={`px-3 py-2 rounded-lg text-sm max-w-[85%] ${
                    isMe ? "bg-stage3 text-stage3-foreground rounded-tr-none" : "bg-white/10 text-foreground rounded-tl-none"
                  }`}>
                    {msg.content}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      <div className="p-3 border-t border-white/10 flex gap-2">
        <Input 
          value={content} 
          onChange={e => setContent(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSend()}
          placeholder="Type a message..." 
          className="bg-white/5 border-white/10 h-9"
        />
        <Button size="icon" className="h-9 w-9 bg-stage3 hover:bg-stage3/90 shrink-0" onClick={handleSend} disabled={!content.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

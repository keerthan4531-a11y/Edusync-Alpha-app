import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ProblemStatementCard } from "./ProblemStatementCard";
import { ProblemStatementDTO } from "@/types/projects";
import { Plus } from "lucide-react";

interface Props {
  onProjectCreated: () => void;
}

export function NewProjectDialog({ onProjectCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [statements, setStatements] = useState<ProblemStatementDTO[]>([]);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedStatementId, setSelectedStatementId] = useState<string>("");

  useEffect(() => {
    if (open && statements.length === 0) {
      fetch("/api/problem-statements")
        .then(res => res.json())
        .then(data => setStatements(data))
        .catch(err => console.error(err));
    }
  }, [open, statements.length]);

  const handleSubmit = async () => {
    if (!name) return;
    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, problemStatementId: selectedStatementId || undefined })
      });
      if (res.ok) {
        setOpen(false);
        onProjectCreated();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-stage3 text-primary-foreground shadow hover:bg-stage3/90 h-9 px-4 py-2">
        <Plus className="h-4 w-4" /> New Project
      </DialogTrigger>
      <DialogContent className="max-w-3xl bg-app-gradient border-white/10 text-foreground">
        <DialogHeader>
          <DialogTitle>Create a New Project</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Project Name</label>
              <Input value={name} onChange={e => setName(e.target.value)} className="bg-white/5 border-white/10" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Description</label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} className="bg-white/5 border-white/10 min-h-[100px]" />
            </div>
          </div>
          <div className="space-y-4">
            <label className="text-sm font-medium block">Select Problem Statement (Optional)</label>
            <div className="h-[200px] overflow-y-auto space-y-3 pr-2">
              {statements.map(stmt => (
                <ProblemStatementCard 
                  key={stmt.id} 
                  statement={stmt} 
                  selected={selectedStatementId === stmt.id}
                  onSelect={setSelectedStatementId} 
                />
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end pt-4">
          <Button onClick={handleSubmit} disabled={!name || loading} className="bg-stage3 hover:bg-stage3/90">
            {loading ? "Creating..." : "Create Project"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { ProblemStatementDTO } from "@/types/projects";

interface Props {
  statement: ProblemStatementDTO;
  onSelect: (id: string) => void;
  selected?: boolean;
}

export function ProblemStatementCard({ statement, onSelect, selected }: Props) {
  return (
    <GlassCard className={`p-4 border ${selected ? 'border-stage3/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'border-white/10'}`}>
      <h3 className="font-bold mb-2">{statement.title}</h3>
      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{statement.description}</p>
      <Button 
        variant={selected ? "default" : "outline"}
        className={selected ? "bg-stage3 hover:bg-stage3/90" : ""}
        onClick={() => onSelect(statement.id)}
      >
        {selected ? "Selected" : "Use this"}
      </Button>
    </GlassCard>
  );
}

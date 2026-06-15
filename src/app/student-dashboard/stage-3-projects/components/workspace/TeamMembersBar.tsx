import { TeamDTO } from "@/types/projects";
import { Users, Crown } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Props {
  team: TeamDTO | null;
  ownerId?: string;
}

export function TeamMembersBar({ team, ownerId }: Props) {
  if (!team) return null;

  return (
    <div className="flex items-center gap-4 px-4 py-2 border-b border-white/10 bg-black/40">
      <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground border-r border-white/10 pr-4">
        <Users className="h-4 w-4" />
        <span>{team.name}</span>
      </div>
      <div className="flex items-center gap-2">
        <TooltipProvider>
          {(team as any).members?.map((member: any) => (
            <Tooltip key={member.id}>
              <TooltipTrigger>
                <div className="relative flex items-center justify-center h-8 w-8 rounded-full bg-stage3/20 border border-stage3/50 text-stage3 text-xs font-bold cursor-help">
                  {member.user?.name?.charAt(0).toUpperCase() || "?"}
                  {member.userId === ownerId && (
                    <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-[2px]">
                      <Crown className="h-2 w-2 text-white" />
                    </div>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-semibold">{member.user?.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{member.roleInTeam.toLowerCase()}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>
    </div>
  );
}

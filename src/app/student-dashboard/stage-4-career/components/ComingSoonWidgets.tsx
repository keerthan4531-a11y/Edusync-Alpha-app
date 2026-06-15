import { GlassCard } from "@/components/ui/glass-card";
import { Briefcase, Users, FileCheck } from "lucide-react";

export function ComingSoonWidgets() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <GlassCard className="p-6 opacity-60">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 rounded-lg bg-stage4/20 text-stage4">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-white">Alumni Directory</h3>
            <p className="text-sm text-zinc-400">Connect with graduates</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-white/10 text-center">
          <span className="text-sm font-medium text-stage4">Coming Soon</span>
        </div>
      </GlassCard>

      <GlassCard className="p-6 opacity-60">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 rounded-lg bg-stage4/20 text-stage4">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-white">LinkedIn Analyzer</h3>
            <p className="text-sm text-zinc-400">Profile completeness check</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-white/10 text-center">
          <span className="text-sm font-medium text-stage4">Coming Soon</span>
        </div>
      </GlassCard>

      <GlassCard className="p-6 opacity-60">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 rounded-lg bg-stage4/20 text-stage4">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-white">Job Applications</h3>
            <p className="text-sm text-zinc-400">Track your applications</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-white/10 text-center">
          <span className="text-sm font-medium text-stage4">Coming Soon</span>
        </div>
      </GlassCard>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Users, Shield, ArrowRight, Zap } from "lucide-react";
import { useStore } from "@/store/useStore";

interface Team {
  id: string;
  name: string;
  problem_statement: string | null;
  is_finalized: boolean;
  leader_id: string;
  member_count: number;
  required_skills?: string[];
}

interface TeamGridProps {
  collegeId: string;
}

export default function TeamGrid({ collegeId }: TeamGridProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, teamId } = useStore();

  useEffect(() => {
    const fetchTeams = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/sih/colleges/${collegeId}/teams`);
        
        let fetchedTeams = res.data as Team[];
        const userSkills = user?.skills || [];
        
        // Sort: Matches first
        fetchedTeams.sort((a, b) => {
          const aMatch = a.required_skills?.some(skill => userSkills.includes(skill)) ? 1 : 0;
          const bMatch = b.required_skills?.some(skill => userSkills.includes(skill)) ? 1 : 0;
          return bMatch - aMatch;
        });
        
        setTeams(fetchedTeams);
      } catch (error) {
        toast.error("Failed to load teams");
      } finally {
        setLoading(false);
      }
    };
    if (collegeId) fetchTeams();
  }, [collegeId, user]);

  const handleRequestJoin = async (targetTeamId: string) => {
    try {
      await api.post(`/teams/${targetTeamId}/requests`);
      toast.success("Join request sent successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to send request");
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-black overflow-y-auto p-8 custom-scrollbar">
      <div className="mb-8 flex items-end justify-between border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-white uppercase">College Teams</h2>
          <p className="text-sm text-zinc-500 uppercase tracking-widest mt-1">Discover & Recruit</p>
        </div>
        <div className="text-xs font-bold text-sky-500 uppercase tracking-widest bg-sky-500/10 px-3 py-1 border border-sky-500/20">
          {teams.length} Active
        </div>
      </div>

      {teams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 border border-zinc-800 border-dashed bg-zinc-950">
          <Shield className="h-10 w-10 text-zinc-600 mb-4" />
          <p className="text-sm text-zinc-500 uppercase tracking-widest font-bold">No teams detected at this node.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {teams.map((team) => {
            const isMyTeam = team.id === teamId;
            const canRequest = !teamId && !team.is_finalized && team.member_count < 6;
            const userSkills = user?.skills || [];
            const isMatch = team.required_skills?.some(skill => userSkills.includes(skill));

            return (
              <div key={team.id} className={`flex flex-col bg-zinc-950 border transition-colors group ${isMatch ? 'border-sky-500/50 hover:border-sky-500' : 'border-zinc-800 hover:border-zinc-600'}`}>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-black text-xl text-white uppercase truncate max-w-[200px]">
                        {team.name}
                      </h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {isMyTeam && <span className="text-[10px] font-bold uppercase tracking-widest text-sky-400 bg-sky-500/10 px-2 py-0.5 border border-sky-500/20">Your Team</span>}
                        {isMatch && !isMyTeam && <span className="text-[10px] font-bold uppercase tracking-widest text-yellow-500 bg-yellow-500/10 px-2 py-0.5 border border-yellow-500/20 flex items-center gap-1"><Zap className="h-3 w-3"/> Match</span>}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-6 border-b border-zinc-800 pb-4">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      {team.member_count} / 6
                    </span>
                    {team.is_finalized ? (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-green-500 bg-green-500/10 px-2 py-0.5 border border-green-500/20">Finalized</span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-sky-500 bg-sky-500/10 px-2 py-0.5 border border-sky-500/20">Recruiting</span>
                    )}
                  </div>
                  
                  {team.problem_statement && (
                    <div className="mb-4">
                      <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest block mb-1">Problem Statement</span>
                      <p className="text-sm text-zinc-300 line-clamp-2">{team.problem_statement}</p>
                    </div>
                  )}

                  {team.required_skills && team.required_skills.length > 0 && (
                    <div className="mt-auto pt-4">
                      <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest block mb-2">Required Protocols</span>
                      <div className="flex flex-wrap gap-2">
                        {team.required_skills.map((skill, idx) => (
                          <span key={idx} className={`text-[10px] font-bold uppercase px-2 py-1 border ${userSkills.includes(skill) ? 'border-yellow-500/30 text-yellow-500 bg-yellow-500/10' : 'border-zinc-800 text-zinc-400 bg-black'}`}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-4 bg-black border-t border-zinc-800 mt-auto">
                  {canRequest ? (
                    <button 
                      onClick={() => handleRequestJoin(team.id)}
                      className={`w-full py-3 text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center ${isMatch ? 'bg-sky-500 hover:bg-sky-400 text-black' : 'bg-white hover:bg-zinc-200 text-black'}`}
                    >
                      Request Join <ArrowRight className="h-4 w-4 ml-2" />
                    </button>
                  ) : (
                    <button 
                      disabled
                      className="w-full py-3 text-xs font-bold uppercase tracking-widest text-zinc-600 border border-zinc-800 cursor-not-allowed"
                    >
                      {isMyTeam ? "Active Member" : team.is_finalized ? "Deployment Finalized" : team.member_count >= 6 ? "Roster Full" : "Access Restricted"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

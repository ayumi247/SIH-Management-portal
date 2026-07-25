"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          Registered Teams
          <Badge variant="secondary" className="bg-white/10 text-zinc-300 ml-2">{teams.length}</Badge>
        </h2>
      </div>

      {teams.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border border-dashed border-white/10 rounded-xl bg-white/5">
          <Shield className="h-10 w-10 text-zinc-500 mb-3" />
          <p className="text-zinc-400">No teams have been formed at this college yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {teams.map((team) => {
            const isMyTeam = team.id === teamId;
            const canRequest = !teamId && !team.is_finalized && team.member_count < 6;
            const userSkills = user?.skills || [];
            const isMatch = team.required_skills?.some(skill => userSkills.includes(skill));

            return (
              <Card key={team.id} className={`bg-zinc-900/60 border-white/10 backdrop-blur-md overflow-hidden transition-all hover:bg-zinc-900/80 hover:border-white/20 group flex flex-col ${isMatch ? 'border-indigo-500/50 shadow-[0_0_15px_rgba(79,70,229,0.1)]' : ''}`}>
                <CardHeader className="p-4 pb-2 border-b border-white/5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-white truncate max-w-[150px]">
                          {team.name}
                        </h3>
                        {isMyTeam && <Badge className="bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border-0 mt-1 mr-2">Your Team</Badge>}
                        {isMatch && !isMyTeam && <Badge className="bg-amber-500/10 text-amber-500 border-0 mt-1"><Zap className="h-3 w-3 mr-1"/> Top Match</Badge>}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 flex-grow">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-zinc-400 flex items-center">
                      <Users className="h-4 w-4 mr-1.5" />
                      {team.member_count} / 6 Members
                    </span>
                    {team.is_finalized ? (
                      <Badge className="bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/10">Finalized</Badge>
                    ) : (
                      <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/10">Recruiting</Badge>
                    )}
                  </div>
                  
                  {team.problem_statement && (
                    <div className="text-sm text-zinc-300 line-clamp-2 mb-3">
                      <span className="text-zinc-500 text-xs uppercase tracking-wider block mb-1">Problem Statement</span>
                      {team.problem_statement}
                    </div>
                  )}

                  {team.required_skills && team.required_skills.length > 0 && (
                    <div className="mt-3">
                      <span className="text-zinc-500 text-xs uppercase tracking-wider block mb-2">Looking for</span>
                      <div className="flex flex-wrap gap-1.5">
                        {team.required_skills.map((skill, idx) => (
                          <Badge key={idx} variant="outline" className={`text-xs ${userSkills.includes(skill) ? 'border-amber-500/30 text-amber-400 bg-amber-500/10' : 'border-white/10 text-zinc-300'}`}>
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="p-4 pt-0 mt-auto">
                  {canRequest ? (
                    <Button 
                      onClick={() => handleRequestJoin(team.id)}
                      className={`w-full text-white transition-all ${isMatch ? 'bg-amber-600 hover:bg-amber-700 shadow-[0_0_15px_rgba(217,119,6,0.3)]' : 'bg-indigo-600 hover:bg-indigo-700 shadow-[0_0_15px_rgba(79,70,229,0.3)]'}`}
                    >
                      Request to Join <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button 
                      variant="ghost" 
                      className="w-full text-zinc-500 cursor-default hover:bg-transparent hover:text-zinc-500 border border-white/5"
                    >
                      {isMyTeam ? "You are a member" : team.is_finalized ? "Team is finalized" : team.member_count >= 6 ? "Team is full" : "Cannot request"}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

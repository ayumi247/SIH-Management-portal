"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useStore } from "@/store/useStore";
import { Loader2, Plus, Trash2, Globe, Link2 } from "lucide-react";

interface Member {
  id: string;
  name: string;
  email: string;
  gender: string;
  is_team_leader: boolean;
}

interface JoinRequest {
  id: string;
  user_id: string;
  requested_by_name: string;
  github_url: string | null;
  linkedin_url: string | null;
  status: string;
  created_at: string;
}

interface Team {
  id: string;
  name: string;
  leader_id: string;
  created_at: string;
  is_recruiting: boolean;
  required_skills: string[] | null;
  problem_statement: string | null;
  members: Member[];
}

export default function MyTeamPage() {
  const { teamId, isLeader, setTeam } = useStore();
  const [team, setTeamData] = useState<Team | null>(null);
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  
  const [newTeamName, setNewTeamName] = useState("");
  const [problemStatement, setProblemStatement] = useState("");
  const [requiredSkills, setRequiredSkills] = useState("");
  const [invitees, setInvitees] = useState<{name: string, email: string, gender: string}[]>([]);

  const fetchTeamData = useCallback(async () => {
    if (!teamId) {
      setLoading(false);
      return;
    }
    try {
      const [teamRes, reqRes] = await Promise.all([
        api.get(`/teams/${teamId}`),
        isLeader ? api.get(`/teams/${teamId}/requests`) : Promise.resolve({ data: [] })
      ]);
      setTeamData(teamRes.data);
      if (isLeader) setRequests(reqRes.data);
    } catch (error) {
      toast.error("Failed to load team data");
    } finally {
      setLoading(false);
    }
  }, [teamId, isLeader]);

  useEffect(() => {
    fetchTeamData();
  }, [fetchTeamData]);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName) return;
    setCreating(true);
    try {
      const payload = {
        name: newTeamName,
        problem_statement: problemStatement || null,
        required_skills: requiredSkills ? requiredSkills.split(",").map(s => s.trim()).filter(Boolean) : [],
        members: invitees
      };
      const res = await api.post("/teams", payload);
      toast.success("Team created successfully!");
      setTeam(res.data.id, true);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to create team");
    } finally {
      setCreating(false);
    }
  };

  const handleAddInvitee = () => {
    if (invitees.length >= 5) return toast.error("Maximum 5 members can be invited");
    setInvitees([...invitees, { name: "", email: "", gender: "Male" }]);
  };

  const handleRemoveInvitee = (index: number) => {
    setInvitees(invitees.filter((_, i) => i !== index));
  };

  const handleUpdateInvitee = (index: number, field: string, value: string) => {
    const updated = [...invitees];
    updated[index] = { ...updated[index], [field]: value };
    setInvitees(updated);
  };

  const handleResolveRequest = async (reqId: string, status: "Accepted" | "Rejected") => {
    try {
      await api.put(`/teams/${teamId}/requests/${reqId}`, { status });
      toast.success(`Request ${status.toLowerCase()}`);
      fetchTeamData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to resolve request");
    }
  };

  const handleToggleRecruiting = async (checked: boolean) => {
    try {
      await api.patch(`/teams/${teamId}/recruiting`, { is_recruiting: checked });
      setTeamData(prev => prev ? {...prev, is_recruiting: checked} : null);
      toast.success(checked ? "Team is now recruiting" : "Team is no longer recruiting");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleKickMember = async (memberId: string) => {
    try {
      await api.delete(`/teams/${teamId}/members/${memberId}`);
      toast.success("Member kicked");
      fetchTeamData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to kick member");
    }
  };

  const handleLeaveTeam = async () => {
    if (!confirm("Are you sure you want to leave this team?")) return;
    try {
      await api.delete(`/teams/${teamId}/members/me`);
      toast.success("You left the team");
      setTeam(null, false);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to leave team");
    }
  };

  const handleDeleteTeam = async () => {
    if (!confirm("Are you sure you want to completely delete this team? This cannot be undone.")) return;
    try {
      await api.delete(`/teams/${teamId}`);
      toast.success("Team deleted");
      setTeam(null, false);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to delete team");
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    );
  }

  // CREATE TEAM STATE
  if (!teamId) {
    return (
      <div className="flex-1 bg-black p-8 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-black tracking-tighter text-white uppercase">Initialize Team</h1>
            <p className="text-sm text-zinc-500 uppercase tracking-widest mt-1">Form a new squad and take command.</p>
          </div>

          <div className="bg-black border border-zinc-800 p-8">
            <form onSubmit={handleCreateTeam} className="space-y-6">
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Team Name *</label>
                <input 
                  required
                  placeholder="e.g. Byte Builders" 
                  className="w-full bg-zinc-950 border border-zinc-800 text-white h-12 px-4 rounded-sm focus:outline-none focus:border-sky-500 transition-colors"
                  value={newTeamName}
                  onChange={e => setNewTeamName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Problem Statement ID</label>
                <input 
                  placeholder="e.g. SIH1234" 
                  className="w-full bg-zinc-950 border border-zinc-800 text-white h-12 px-4 rounded-sm focus:outline-none focus:border-sky-500 transition-colors"
                  value={problemStatement}
                  onChange={e => setProblemStatement(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Required Skills (comma separated)</label>
                <input 
                  placeholder="e.g. React, Python, ML" 
                  className="w-full bg-zinc-950 border border-zinc-800 text-white h-12 px-4 rounded-sm focus:outline-none focus:border-sky-500 transition-colors"
                  value={requiredSkills}
                  onChange={e => setRequiredSkills(e.target.value)}
                />
              </div>

              <div className="pt-8 border-t border-zinc-800">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Invite Roster</h3>
                    <p className="text-xs text-zinc-500 mt-1">Instantly add up to 5 members.</p>
                  </div>
                  <button type="button" onClick={handleAddInvitee} className="px-4 py-2 border border-zinc-800 text-xs font-bold uppercase text-white hover:bg-zinc-900 transition-colors flex items-center">
                    <Plus className="h-4 w-4 mr-2" /> Add
                  </button>
                </div>
                
                <div className="space-y-3">
                  {invitees.map((inv, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row gap-3">
                      <input 
                        placeholder="Name" 
                        required
                        className="flex-1 bg-zinc-950 border border-zinc-800 text-white h-10 px-3 rounded-sm focus:outline-none focus:border-sky-500"
                        value={inv.name}
                        onChange={e => handleUpdateInvitee(idx, 'name', e.target.value)}
                      />
                      <input 
                        placeholder="Email" 
                        type="email"
                        required
                        className="flex-1 bg-zinc-950 border border-zinc-800 text-white h-10 px-3 rounded-sm focus:outline-none focus:border-sky-500"
                        value={inv.email}
                        onChange={e => handleUpdateInvitee(idx, 'email', e.target.value)}
                      />
                      <select 
                        className="w-32 bg-zinc-950 border border-zinc-800 text-white h-10 px-3 rounded-sm focus:outline-none focus:border-sky-500 appearance-none"
                        value={inv.gender}
                        onChange={(e) => handleUpdateInvitee(idx, 'gender', e.target.value)}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                      <button type="button" onClick={() => handleRemoveInvitee(idx)} className="px-3 h-10 border border-zinc-800 text-red-500 hover:bg-zinc-900 flex items-center justify-center transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {invitees.length === 0 && (
                    <div className="text-xs text-zinc-600 uppercase tracking-widest text-center py-6 border border-zinc-800 border-dashed">No external members added</div>
                  )}
                </div>
              </div>

              <button 
                type="submit" 
                disabled={creating} 
                className="w-full h-12 bg-sky-500 hover:bg-sky-400 text-black font-bold uppercase tracking-wider rounded-sm transition-colors flex items-center justify-center mt-8"
              >
                {creating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : "Deploy Team"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // MY TEAM STATE
  return (
    <div className="flex-1 bg-black p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Actions */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-white uppercase">{team?.name}</h1>
            <p className="text-sm text-zinc-500 uppercase tracking-widest mt-2">
              Problem Statement: <span className="text-sky-500">{team?.problem_statement || "UNASSIGNED"}</span>
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {isLeader && (
              <label className="flex items-center gap-3 px-4 py-2 border border-zinc-800 bg-zinc-950 cursor-pointer hover:bg-zinc-900 transition-colors">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Recruiting Status</span>
                <input 
                  type="checkbox"
                  className="w-4 h-4 accent-sky-500 cursor-pointer"
                  checked={team?.is_recruiting} 
                  onChange={(e) => handleToggleRecruiting(e.target.checked)}
                />
              </label>
            )}
            
            {!isLeader && (
              <button onClick={handleLeaveTeam} className="px-6 py-2 border border-red-900/50 bg-red-950/20 text-red-500 text-xs font-bold uppercase tracking-wider hover:bg-red-900/40 transition-colors">
                Leave Team
              </button>
            )}

            {isLeader && (
              <button onClick={handleDeleteTeam} className="px-6 py-2 border border-red-900/50 bg-red-950/20 text-red-500 text-xs font-bold uppercase tracking-wider hover:bg-red-900/40 transition-colors">
                Disband Team
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Members List */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-zinc-800 pb-2">Active Roster</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {team?.members.map(member => (
                <div key={member.id} className="flex items-center justify-between p-4 border border-zinc-800 bg-zinc-950 group">
                  <div className="flex flex-col overflow-hidden">
                    <p className="text-sm font-bold text-white uppercase truncate flex items-center gap-2">
                      {member.name}
                      {member.is_team_leader && <span className="text-[10px] bg-sky-500/20 text-sky-400 px-2 py-0.5 border border-sky-500/30">LEADER</span>}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">{member.email}</p>
                  </div>
                  
                  {isLeader && !member.is_team_leader && (
                    <button 
                      onClick={() => handleKickMember(member.id)} 
                      className="h-8 w-8 border border-zinc-800 text-zinc-500 hover:text-red-500 hover:border-red-500/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"
                      title="Kick Member"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Join Requests */}
          {isLeader && (
            <div className="space-y-6">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-zinc-800 pb-2">Pending Requests</h2>
              <div className="space-y-4">
                {requests.length === 0 ? (
                  <div className="text-xs text-zinc-600 uppercase tracking-widest text-center py-6 border border-zinc-800 border-dashed">
                    No inbound requests
                  </div>
                ) : (
                  requests.map(req => (
                    <div key={req.id} className="p-4 border border-zinc-800 bg-zinc-950 flex flex-col gap-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-bold text-white uppercase">{req.requested_by_name}</p>
                          <div className="flex items-center gap-3 mt-2">
                            {req.github_url && (
                              <a href={req.github_url} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors flex items-center gap-1 text-xs">
                                <Globe className="h-3 w-3" /> GitHub
                              </a>
                            )}
                            {req.linkedin_url && (
                              <a href={req.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors flex items-center gap-1 text-xs">
                                <Link2 className="h-3 w-3" /> LinkedIn
                              </a>
                            )}
                          </div>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 border uppercase font-bold ${req.status === 'Pending' ? 'text-yellow-500 border-yellow-500/20 bg-yellow-500/10' : req.status === 'Accepted' ? 'text-green-500 border-green-500/20 bg-green-500/10' : 'text-red-500 border-red-500/20 bg-red-500/10'}`}>
                          {req.status}
                        </span>
                      </div>

                      {req.status === 'Pending' && (
                        <div className="flex items-center gap-2 pt-4 border-t border-zinc-800">
                          <button 
                            onClick={() => handleResolveRequest(req.id, "Accepted")}
                            className="flex-1 py-1.5 border border-zinc-700 hover:border-green-500 text-zinc-400 hover:text-green-400 text-xs font-bold uppercase transition-colors"
                          >
                            Accept
                          </button>
                          <button 
                            onClick={() => handleResolveRequest(req.id, "Rejected")}
                            className="flex-1 py-1.5 border border-zinc-700 hover:border-red-500 text-zinc-400 hover:text-red-400 text-xs font-bold uppercase transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useStore } from "@/store/useStore";
import { Loader2, Users, Shield, Globe, Link2, Trash2, LogOut, UserMinus, Plus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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

export default function TeamManagementPage() {
  const { user, teamId, isLeader, setTeam } = useStore();
  const [team, setTeamData] = useState<Team | null>(null);
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  
  // Create Form State
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
    try {
      await api.delete(`/teams/${teamId}/members/me`);
      toast.success("You left the team");
      setTeam(null, false);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to leave team");
    }
  };

  const handleDeleteTeam = async () => {
    if (!confirm("Are you sure you want to completely delete this team?")) return;
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
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!teamId) {
    return (
      <div className="flex-1 overflow-y-auto p-6 max-w-3xl mx-auto w-full custom-scrollbar">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Create a Team
          </h2>
          <p className="text-zinc-400">Form a new team and become the Team Leader.</p>
        </div>

        <Card className="bg-zinc-900/60 border-white/10 backdrop-blur-md">
          <form onSubmit={handleCreateTeam}>
            <CardHeader>
              <CardTitle className="text-white">Team Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="teamName" className="text-zinc-300">Team Name *</Label>
                <Input 
                  id="teamName" 
                  required
                  placeholder="e.g. Byte Builders" 
                  className="bg-black/20 border-white/10 text-white"
                  value={newTeamName}
                  onChange={e => setNewTeamName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ps" className="text-zinc-300">Problem Statement ID</Label>
                <Input 
                  id="ps" 
                  placeholder="e.g. SIH1234" 
                  className="bg-black/20 border-white/10 text-white"
                  value={problemStatement}
                  onChange={e => setProblemStatement(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="skills" className="text-zinc-300">Required Skills (comma separated)</Label>
                <Input 
                  id="skills" 
                  placeholder="e.g. React, Python, ML" 
                  className="bg-black/20 border-white/10 text-white"
                  value={requiredSkills}
                  onChange={e => setRequiredSkills(e.target.value)}
                />
              </div>

              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-md font-medium text-white">Invite Members</h3>
                    <p className="text-xs text-zinc-400">Add up to 5 members instantly.</p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddInvitee} className="border-white/10 bg-white/5 text-white hover:bg-white/10">
                    <Plus className="h-4 w-4 mr-1" /> Add Member
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {invitees.map((inv, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row gap-3 p-3 bg-black/20 border border-white/5 rounded-lg relative">
                      <Input 
                        placeholder="Name" 
                        required
                        className="bg-transparent border-white/10 text-white flex-1"
                        value={inv.name}
                        onChange={e => handleUpdateInvitee(idx, 'name', e.target.value)}
                      />
                      <Input 
                        placeholder="Email" 
                        type="email"
                        required
                        className="bg-transparent border-white/10 text-white flex-1"
                        value={inv.email}
                        onChange={e => handleUpdateInvitee(idx, 'email', e.target.value)}
                      />
                      <Select value={inv.gender} onValueChange={(v) => handleUpdateInvitee(idx, 'gender', v as string)}>
                        <SelectTrigger className="w-[120px] bg-transparent border-white/10 text-white">
                          <SelectValue placeholder="Gender" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-white/10 text-white">
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveInvitee(idx)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {invitees.length === 0 && (
                    <div className="text-sm text-zinc-500 italic text-center py-4">No members added yet.</div>
                  )}
                </div>
              </div>

            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={creating} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                {creating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Create Team
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-6xl mx-auto w-full custom-scrollbar">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Team Hub
            <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-400 ml-2 border border-indigo-500/20">{team?.name}</Badge>
          </h2>
          <p className="text-zinc-400 mt-1">Manage your team members and incoming requests.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {isLeader && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-black/20 rounded-lg border border-white/5">
              <Label htmlFor="recruiting" className="text-sm text-zinc-300 cursor-pointer">Recruiting</Label>
              <input 
                type="checkbox"
                id="recruiting" 
                className="w-4 h-4 accent-indigo-500 cursor-pointer"
                checked={team?.is_recruiting} 
                onChange={(e) => handleToggleRecruiting(e.target.checked)}
              />
            </div>
          )}
          {!isLeader && (
            <Button variant="outline" onClick={handleLeaveTeam} className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300">
              <LogOut className="h-4 w-4 mr-2" /> Leave Team
            </Button>
          )}
          {isLeader && (
            <Button variant="outline" onClick={handleDeleteTeam} className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300">
              <Trash2 className="h-4 w-4 mr-2" /> Delete Team
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Members List */}
        <Card className="lg:col-span-2 bg-zinc-900/60 border-white/10 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-xl text-white">Current Roster</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {team?.members.map(member => (
              <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 group">
                <div className="flex items-center overflow-hidden">
                  <Avatar className="h-10 w-10 mr-3 border border-white/10">
                    <AvatarFallback className="bg-indigo-900/50 text-indigo-200">{member.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium text-white truncate">{member.name}</p>
                    <p className="text-xs text-zinc-400">{member.gender}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {member.is_team_leader && <Badge className="bg-amber-500/10 text-amber-500 border-0">Leader</Badge>}
                  {isLeader && !member.is_team_leader && (
                    <Button variant="ghost" size="icon" onClick={() => handleKickMember(member.id)} className="h-8 w-8 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10">
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Join Requests */}
        {isLeader && (
          <Card className="bg-zinc-900/60 border-white/10 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-xl text-white">Join Requests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {requests.length === 0 ? (
                <div className="text-center py-6 text-zinc-500 text-sm">
                  No pending requests
                </div>
              ) : (
                requests.map(req => (
                  <div key={req.id} className="flex flex-col p-4 rounded-lg bg-white/5 border border-white/5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-2 border border-white/10">
                          <AvatarFallback className="bg-indigo-900/50 text-indigo-200 text-xs">{req.requested_by_name.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-white">{req.requested_by_name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {req.github_url && (
                              <a href={req.github_url} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-colors">
                                <Globe className="h-3 w-3" />
                              </a>
                            )}
                            {req.linkedin_url && (
                              <a href={req.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-colors">
                                <Link2 className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className={req.status === 'Pending' ? 'text-yellow-500 border-yellow-500/20' : req.status === 'Accepted' ? 'text-green-500 border-green-500/20' : 'text-red-500 border-red-500/20'}>
                        {req.status}
                      </Badge>
                    </div>

                    {req.status === 'Pending' && (
                      <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                        <Button 
                          size="sm" 
                          onClick={() => handleResolveRequest(req.id, "Accepted")}
                          className="w-full bg-green-600/20 text-green-400 hover:bg-green-600/40 border border-green-500/20"
                        >
                          Accept
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => handleResolveRequest(req.id, "Rejected")}
                          className="w-full bg-red-600/20 text-red-400 hover:bg-red-600/40 border border-red-500/20"
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

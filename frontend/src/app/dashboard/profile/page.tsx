"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    github_url: "",
    linkedin_url: "",
    skills: "",
    study_year: ""
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/auth/me");
        setFormData({
          github_url: res.data.github_url || "",
          linkedin_url: res.data.linkedin_url || "",
          skills: res.data.skills ? res.data.skills.join(", ") : "",
          study_year: res.data.study_year || ""
        });
      } catch (error) {
        console.error("Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        github_url: formData.github_url || null,
        linkedin_url: formData.linkedin_url || null,
        skills: formData.skills ? formData.skills.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
        study_year: formData.study_year ? parseInt(formData.study_year) : null
      };
      await api.put("/auth/profile", payload);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center bg-black">
      <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
    </div>
  );

  return (
    <div className="flex-1 bg-black p-8 overflow-y-auto">
      <div className="max-w-2xl mx-auto space-y-8">
        
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase">Operative Profile</h1>
          <p className="text-sm text-zinc-500 uppercase tracking-widest mt-2">Update your social links and protocols to enhance recruitment.</p>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-2">
              <label htmlFor="github" className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">GitHub Coordinates</label>
              <input 
                id="github" 
                placeholder="https://github.com/yourusername" 
                className="w-full bg-black border border-zinc-800 text-white h-12 px-4 rounded-none focus:outline-none focus:border-sky-500 transition-colors"
                value={formData.github_url}
                onChange={e => setFormData({...formData, github_url: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="linkedin" className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">LinkedIn Coordinates</label>
              <input 
                id="linkedin" 
                placeholder="https://linkedin.com/in/yourusername" 
                className="w-full bg-black border border-zinc-800 text-white h-12 px-4 rounded-none focus:outline-none focus:border-sky-500 transition-colors"
                value={formData.linkedin_url}
                onChange={e => setFormData({...formData, linkedin_url: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="skills" className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Protocols (Comma Separated)</label>
              <input 
                id="skills" 
                placeholder="React, Python, UI/UX" 
                className="w-full bg-black border border-zinc-800 text-white h-12 px-4 rounded-none focus:outline-none focus:border-sky-500 transition-colors"
                value={formData.skills}
                onChange={e => setFormData({...formData, skills: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="year" className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Study Phase (Year)</label>
              <input 
                id="year" 
                type="number"
                min="1"
                max="5"
                placeholder="3" 
                className="w-full bg-black border border-zinc-800 text-white h-12 px-4 rounded-none focus:outline-none focus:border-sky-500 transition-colors"
                value={formData.study_year}
                onChange={e => setFormData({...formData, study_year: e.target.value})}
              />
            </div>
            
            <div className="pt-4">
              <button 
                type="submit" 
                disabled={saving} 
                className="w-full h-12 bg-sky-500 hover:bg-sky-400 text-black text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Commit Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

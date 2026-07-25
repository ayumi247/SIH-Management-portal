"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

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

  if (loading) return <div className="p-8 text-white">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Your Profile</h1>
        <p className="text-zinc-400">Update your social links and skills to help teams find you.</p>
      </div>

      <Card className="bg-zinc-900/60 border-white/10 backdrop-blur-md">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="text-white">Profile Details</CardTitle>
            <CardDescription className="text-zinc-400">These details will be visible to Team Leaders when you request to join.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="github" className="text-zinc-300">GitHub Profile URL</Label>
              <Input 
                id="github" 
                placeholder="https://github.com/yourusername" 
                className="bg-black/20 border-white/10 text-white"
                value={formData.github_url}
                onChange={e => setFormData({...formData, github_url: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="linkedin" className="text-zinc-300">LinkedIn Profile URL</Label>
              <Input 
                id="linkedin" 
                placeholder="https://linkedin.com/in/yourusername" 
                className="bg-black/20 border-white/10 text-white"
                value={formData.linkedin_url}
                onChange={e => setFormData({...formData, linkedin_url: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills" className="text-zinc-300">Skills (comma separated)</Label>
              <Input 
                id="skills" 
                placeholder="React, Python, UI/UX" 
                className="bg-black/20 border-white/10 text-white"
                value={formData.skills}
                onChange={e => setFormData({...formData, skills: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="year" className="text-zinc-300">Year of Study</Label>
              <Input 
                id="year" 
                type="number"
                min="1"
                max="5"
                placeholder="3" 
                className="bg-black/20 border-white/10 text-white"
                value={formData.study_year}
                onChange={e => setFormData({...formData, study_year: e.target.value})}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white w-full">
              {saving ? "Saving..." : "Save Profile"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

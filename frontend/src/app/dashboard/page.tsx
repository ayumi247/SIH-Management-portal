"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Building2 } from "lucide-react";
import TeamGrid from "./components/TeamGrid";
import { toast } from "sonner";

interface College {
  id: string;
  name: string;
  city: string;
  state: string;
}

export default function DashboardPage() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCollegeId, setSelectedCollegeId] = useState<string | null>(null);

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const res = await api.get("/sih/colleges");
        setColleges(res.data);
        if (res.data.length > 0) {
          setSelectedCollegeId(res.data[0].id);
        }
      } catch (error) {
        toast.error("Failed to load colleges");
      }
    };
    fetchColleges();
  }, []);

  const filteredColleges = colleges.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex w-full h-[calc(100vh-4rem)]">
      {/* Sidebar: College List */}
      <aside className="w-80 flex-shrink-0 border-r border-white/5 bg-zinc-950/50 flex flex-col">
        <div className="p-4 border-b border-white/5">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
            <Input 
              placeholder="Search colleges..." 
              className="pl-9 bg-zinc-900 border-white/10 focus-visible:ring-indigo-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {filteredColleges.map((college) => (
            <button
              key={college.id}
              onClick={() => setSelectedCollegeId(college.id)}
              className={`w-full text-left p-3 rounded-lg transition-all duration-200 flex flex-col gap-1
                ${selectedCollegeId === college.id 
                  ? 'bg-indigo-600/10 border border-indigo-500/20 text-white' 
                  : 'hover:bg-zinc-900 border border-transparent text-zinc-400 hover:text-zinc-200'}`}
            >
              <div className="font-medium truncate text-sm flex items-center gap-2">
                <Building2 className="h-4 w-4 shrink-0" />
                {college.name}
              </div>
              <div className="text-xs opacity-70 flex items-center gap-1">
                <MapPin className="h-3 w-3 shrink-0" />
                {college.city}, {college.state}
              </div>
            </button>
          ))}
          {filteredColleges.length === 0 && (
            <div className="text-center p-4 text-sm text-zinc-500">No colleges found.</div>
          )}
        </div>
      </aside>

      {/* Main Content: Team Grid */}
      <section className="flex-1 flex flex-col bg-zinc-950 relative overflow-hidden">
        {/* Subtle background glow for aesthetics */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        
        {selectedCollegeId ? (
          <TeamGrid collegeId={selectedCollegeId} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-zinc-500">
            Select a college to view teams
          </div>
        )}
      </section>
    </div>
  );
}

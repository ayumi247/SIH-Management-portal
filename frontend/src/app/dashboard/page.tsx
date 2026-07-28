"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
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
    <div className="flex w-full h-[calc(100vh-4rem)] bg-black">
      {/* Sidebar: College List */}
      <aside className="w-80 flex-shrink-0 border-r border-zinc-900 bg-black flex flex-col z-10">
        <div className="p-6 border-b border-zinc-900 bg-black">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Node Selection</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input 
              placeholder="Search nodes..." 
              className="w-full bg-zinc-950 border border-zinc-800 text-white text-sm h-10 pl-9 pr-4 focus:outline-none focus:border-sky-500 transition-colors"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar bg-black">
          {filteredColleges.map((college) => (
            <button
              key={college.id}
              onClick={() => setSelectedCollegeId(college.id)}
              className={`w-full text-left p-4 transition-colors flex flex-col gap-2 border
                ${selectedCollegeId === college.id 
                  ? 'bg-sky-500/10 border-sky-500/50 text-white' 
                  : 'bg-zinc-950 border-zinc-900 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200'}`}
            >
              <div className="font-bold uppercase tracking-wider text-xs flex items-center gap-2">
                <Building2 className={`h-4 w-4 shrink-0 ${selectedCollegeId === college.id ? 'text-sky-500' : 'text-zinc-600'}`} />
                <span className="truncate">{college.name}</span>
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest opacity-60 flex items-center gap-2">
                <MapPin className="h-3 w-3 shrink-0" />
                {college.city}, {college.state}
              </div>
            </button>
          ))}
          {filteredColleges.length === 0 && (
            <div className="text-center p-6 text-xs text-zinc-600 uppercase tracking-widest font-bold border border-zinc-900 border-dashed">No nodes found.</div>
          )}
        </div>
      </aside>

      {/* Main Content: Team Grid */}
      <section className="flex-1 flex flex-col bg-black relative">
        {selectedCollegeId ? (
          <TeamGrid collegeId={selectedCollegeId} />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-black">
            <div className="text-xs font-bold text-zinc-600 uppercase tracking-widest border border-zinc-800 p-6">
              AWAITING NODE SELECTION
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

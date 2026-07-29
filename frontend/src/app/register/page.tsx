"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("");
  const [collegeId, setCollegeId] = useState("");
  const [colleges, setColleges] = useState<{id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    api.get("/sih/colleges").then(res => setColleges(res.data)).catch(console.error);
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/register", {
        name, email, password, gender, college_id: collegeId
      });
      toast.success("Account created! Please log in.");
      router.push("/login");
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        toast.error(detail[0].msg || "Validation error");
      } else {
        toast.error(detail || "Failed to register.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-black flex flex-col items-center justify-center p-6 py-12">
      
      <div className="w-full max-w-lg">
        <div className="mb-10 text-left">
          <h1 className="text-4xl font-black tracking-tight text-white mb-2 uppercase">Create Account</h1>
          <p className="text-zinc-500 font-light">Join the SIH Matchmaker network.</p>
        </div>

        <div className="bg-black border border-zinc-800 rounded-sm p-8">
          <form onSubmit={handleRegister} className="space-y-6">
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider" htmlFor="name">Full Name</label>
              <input 
                id="name" 
                type="text" 
                className="w-full bg-zinc-950 border border-zinc-800 text-white h-12 px-4 rounded-sm focus:outline-none focus:border-sky-500 transition-colors"
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider" htmlFor="email">Email Address</label>
              <input 
                id="email" 
                type="email" 
                className="w-full bg-zinc-950 border border-zinc-800 text-white h-12 px-4 rounded-sm focus:outline-none focus:border-sky-500 transition-colors"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Gender</label>
                <select 
                  className="w-full bg-zinc-950 border border-zinc-800 text-white h-12 px-4 rounded-sm focus:outline-none focus:border-sky-500 transition-colors appearance-none"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  required
                >
                  <option value="" disabled>Select</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="O">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">College</label>
                <select 
                  className="w-full bg-zinc-950 border border-zinc-800 text-white h-12 px-4 rounded-sm focus:outline-none focus:border-sky-500 transition-colors appearance-none"
                  value={collegeId}
                  onChange={(e) => setCollegeId(e.target.value)}
                  required
                >
                  <option value="" disabled>Select</option>
                  {colleges.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider" htmlFor="password">Password</label>
              <input 
                id="password" 
                type="password" 
                className="w-full bg-zinc-950 border border-zinc-800 text-white h-12 px-4 rounded-sm focus:outline-none focus:border-sky-500 transition-colors"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required
              />
            </div>

            <button 
              type="submit" 
              className="w-full h-12 bg-sky-500 hover:bg-sky-400 text-black font-bold uppercase tracking-wider rounded-sm transition-colors flex items-center justify-center mt-8" 
              disabled={loading}
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign Up"}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-zinc-500 uppercase tracking-widest">
            Already have an account? <Link href="/login" className="text-sky-500 hover:text-sky-400 font-bold ml-2">Log In</Link>
          </p>
        </div>
      </div>
      
    </div>
  );
}

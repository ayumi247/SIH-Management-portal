"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { api } from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setAuth = useStore(state => state.setAuth);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("username", email);
      formData.append("password", password);
      
      const res = await api.post("/auth/login", formData);
      const token = res.data.access_token;
      
      const meRes = await api.get("/auth/me", { headers: { Authorization: `Bearer ${token}` } });
      setAuth(token, meRes.data);
      
      toast.success("Login successful");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    let apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      if (typeof window !== "undefined" && window.location.hostname !== "localhost") {
        apiUrl = "https://sih-matchmaker-api.onrender.com/api";
      } else {
        apiUrl = "http://localhost:8000/api";
      }
    }
    window.location.href = `${apiUrl}/auth/google/login`;
  };

  return (
    <div className="flex-1 bg-black flex flex-col items-center justify-center p-6">
      
      <div className="w-full max-w-md">
        <div className="mb-10 text-left">
          <h1 className="text-4xl font-black tracking-tight text-white mb-2 uppercase">Authenticate</h1>
          <p className="text-zinc-500 font-light">Access your SIH Matchmaker dashboard.</p>
        </div>

        <div className="bg-black border border-zinc-800 rounded-sm p-8">
          <form onSubmit={handleLogin} className="space-y-6">
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
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider" htmlFor="password">Password</label>
                <Link href="#" className="text-xs text-sky-500 hover:text-sky-400">RESET</Link>
              </div>
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
              className="w-full h-12 bg-sky-500 hover:bg-sky-400 text-black font-bold uppercase tracking-wider rounded-sm transition-colors flex items-center justify-center" 
              disabled={loading}
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign In"}
            </button>
          </form>

          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-black px-4 text-zinc-600 font-bold tracking-wider">Or</span>
            </div>
          </div>

          <button 
            type="button" 
            onClick={handleGoogleLogin} 
            className="mt-8 w-full h-12 bg-zinc-950 border border-zinc-800 hover:bg-zinc-900 text-white font-bold uppercase tracking-wider rounded-sm transition-colors flex items-center justify-center"
          >
            <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-zinc-500 uppercase tracking-widest">
            Don't have an account? <Link href="/register" className="text-sky-500 hover:text-sky-400 font-bold ml-2">Register</Link>
          </p>
        </div>
      </div>
      
    </div>
  );
}

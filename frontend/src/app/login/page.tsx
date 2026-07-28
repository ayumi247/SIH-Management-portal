"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";
import { LogIn, Mail, Lock, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setAuth = useStore((state) => state.setAuth);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("username", email);
      formData.append("password", password);

      const response = await api.post("/auth/token", formData);
      const { access_token } = response.data;
      
      const userRes = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${access_token}` }
      });

      setAuth(access_token, userRes.data);
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to login. Check credentials.");
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
    <div className="min-h-screen flex w-full relative overflow-hidden">
      <div className="hidden lg:flex flex-1 flex-col justify-center items-center relative z-10 p-12 bg-zinc-950 border-r border-zinc-900">
        <div className="max-w-lg space-y-6 text-left">
          <div className="inline-flex items-center rounded-full border border-blue-500 bg-blue-500/10 px-3 py-1 text-sm text-blue-400">
            ✨ SIH 2026 Matchmaker
          </div>
          <h1 className="text-6xl font-extrabold tracking-tight text-white">
            Find Your Perfect <br /> Hackathon Team.
          </h1>
          <p className="text-xl text-zinc-400">
            Connect with brilliant minds across the country. Overcome the College Lock, build diverse teams, and win big.
          </p>
        </div>
      </div>

      {/* Login Form Right Side */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10 bg-zinc-950">
        <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 shadow-none">
          <CardHeader className="space-y-2">
            <CardTitle className="text-3xl font-bold tracking-tight">Welcome back</CardTitle>
            <CardDescription className="text-zinc-400">Enter your credentials to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@college.edu" 
                    className="pl-9 bg-zinc-950/50 border-white/10 focus-visible:ring-indigo-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link href="#" className="text-sm text-blue-500 hover:text-blue-400">Forgot password?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-9 bg-zinc-950/50 border-white/10 focus-visible:ring-indigo-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-all" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <LogIn className="h-4 w-4 mr-2" />}
                Sign In
              </Button>
            </form>
            
            <div className="my-6 flex items-center">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="mx-4 text-xs uppercase text-zinc-500">Or continue with</span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            <Button 
              type="button" 
              variant="outline" 
              className="w-full bg-zinc-900 border-white/10 hover:bg-zinc-800 transition-colors"
              onClick={handleGoogleLogin}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </Button>
          </CardContent>
          <CardFooter className="flex justify-center text-sm text-zinc-400">
            Don't have an account? 
            <Link href="/register" className="ml-1 text-blue-500 hover:text-blue-400 font-medium">Create one</Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

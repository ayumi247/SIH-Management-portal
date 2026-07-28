"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import Link from "next/link";
import { UserPlus, Mail, Lock, User, GraduationCap, Loader2 } from "lucide-react";

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
    // Fetch colleges for dropdown
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
      toast.error(err.response?.data?.detail || "Failed to register.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full relative overflow-hidden">
      {/* Register Form Left Side */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10 bg-zinc-950">
        <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 shadow-none">
          <CardHeader className="space-y-2">
            <CardTitle className="text-3xl font-bold tracking-tight">Create an account</CardTitle>
            <CardDescription className="text-zinc-400">Join the SIH Matchmaker network</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                  <Input 
                    id="name" 
                    placeholder="John Doe" 
                    className="pl-9 bg-zinc-950 border-zinc-800 focus-visible:ring-blue-500"
                    value={name} onChange={(e) => setName(e.target.value)} required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                  <Input 
                    id="email" type="email" placeholder="name@college.edu" 
                    className="pl-9 bg-zinc-950 border-zinc-800 focus-visible:ring-blue-500"
                    value={email} onChange={(e) => setEmail(e.target.value)} required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select onValueChange={(val: string | null) => setGender(val || "")} required>
                    <SelectTrigger className="bg-zinc-950 border-zinc-800 focus:ring-blue-500">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                      <SelectItem value="M">Male</SelectItem>
                      <SelectItem value="F">Female</SelectItem>
                      <SelectItem value="O">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>College</Label>
                  <Select onValueChange={(val: string | null) => setCollegeId(val || "")} required>
                    <SelectTrigger className="bg-zinc-950 border-zinc-800 focus:ring-blue-500">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                      {colleges.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                  <Input 
                    id="password" type="password" placeholder="••••••••" 
                    className="pl-9 bg-zinc-950 border-zinc-800 focus-visible:ring-blue-500"
                    value={password} onChange={(e) => setPassword(e.target.value)} required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-all mt-2" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
                Sign Up
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center text-sm text-zinc-400">
            Already have an account? 
            <Link href="/login" className="ml-1 text-blue-500 hover:text-blue-400 font-medium">Log in</Link>
          </CardFooter>
        </Card>
      </div>

      {/* Aesthetic Right Side */}
      <div className="hidden lg:flex flex-1 flex-col justify-center items-center relative z-10 p-12 bg-zinc-950 border-l border-zinc-900">
        <div className="max-w-lg space-y-6 text-left">
          <div className="inline-flex items-center rounded-full border border-blue-500 bg-blue-500/10 px-3 py-1 text-sm text-blue-400">
            🚀 Accelerate Your Journey
          </div>
          <h1 className="text-6xl font-extrabold tracking-tight text-white">
            Build Something <br /> Incredible.
          </h1>
          <p className="text-xl text-zinc-400">
            Join thousands of students. Form your dream team. Ship your idea at SIH 2026.
          </p>
        </div>
      </div>
    </div>
  );
}

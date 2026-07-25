"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Users, Code, Zap, ArrowRight, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f46e511_1px,transparent_1px),linear-gradient(to_bottom,#4f46e511_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <div className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm font-medium text-indigo-300 mb-8 backdrop-blur-md">
          <Zap className="mr-2 h-4 w-4 text-indigo-400" />
          Smart India Hackathon 2026
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6">
          Find Your Perfect <br className="hidden md:block" />
          <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            Dream Team
          </span>
        </h1>

        <p className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          The ultimate matchmaker for SIH. Browse verified students from your college, lock in your diversity requirements, and chat in real-time.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/register">
            <Button size="lg" className="h-14 px-8 bg-indigo-600 hover:bg-indigo-700 text-white text-lg rounded-full shadow-[0_0_30px_rgba(79,70,229,0.4)] transition-all hover:scale-105">
              Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="h-14 px-8 border-white/20 text-white hover:bg-white/10 hover:text-white text-lg rounded-full transition-all">
              Sign In to Dashboard
            </Button>
          </Link>
        </div>

        {/* Feature row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 text-left border-t border-white/10 pt-16">
          <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5 backdrop-blur-sm">
            <div className="bg-blue-500/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4 border border-blue-500/30">
              <ShieldCheck className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">SIH Constraints Locked</h3>
            <p className="text-zinc-400">Automatically enforces college boundaries and gender diversity requirements for every team.</p>
          </div>
          <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5 backdrop-blur-sm">
            <div className="bg-indigo-500/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4 border border-indigo-500/30">
              <Users className="h-6 w-6 text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">College Matchmaking</h3>
            <p className="text-zinc-400">Discover and recruit the best developers and designers specifically from your own campus.</p>
          </div>
          <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5 backdrop-blur-sm">
            <div className="bg-purple-500/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4 border border-purple-500/30">
              <Code className="h-6 w-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Real-Time Team Hub</h3>
            <p className="text-zinc-400">Accept join requests with instant email notifications and collaborate in live WebSocket chat.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

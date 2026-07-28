"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex-1 bg-black flex flex-col pt-24 pb-16 relative">
      <div className="max-w-7xl mx-auto px-6 w-full flex-1 flex flex-col justify-center">
        
        <div className="max-w-4xl">
          <div className="inline-flex items-center rounded-sm border border-zinc-800 bg-zinc-950 px-4 py-1.5 text-xs font-semibold text-zinc-400 mb-8 uppercase tracking-widest">
            Smart India Hackathon 2026
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-8 leading-[1.1]">
            FIND YOUR <br />
            <span className="text-sky-500">TEAM.</span>
          </h1>

          <p className="text-xl md:text-2xl text-zinc-400 mb-12 max-w-2xl font-light leading-relaxed">
            The definitive platform to discover verified college peers, assemble your team, and build the future. Minimal friction, maximum output.
          </p>

          <div className="flex flex-col sm:flex-row items-start gap-6">
            <Link href="/register">
              <button className="h-14 px-10 bg-sky-500 hover:bg-sky-400 text-black text-lg font-bold rounded-sm transition-colors flex items-center justify-center">
                START BUILDING <ArrowRight className="ml-3 h-5 w-5" />
              </button>
            </Link>
            <Link href="/login">
              <button className="h-14 px-10 border border-zinc-800 bg-black hover:bg-zinc-900 text-white text-lg font-bold rounded-sm transition-colors flex items-center justify-center">
                SIGN IN
              </button>
            </Link>
          </div>
        </div>

        {/* Feature section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-zinc-900 border border-zinc-900 mt-32 rounded-sm overflow-hidden">
          <div className="bg-black p-10 flex flex-col justify-between">
            <div className="w-12 h-12 bg-zinc-950 border border-zinc-800 rounded-sm flex items-center justify-center text-sky-500 font-bold mb-16 text-xl">01</div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">Strict Constraints</h3>
              <p className="text-zinc-500 font-light text-lg">College boundaries and diversity locks enforced automatically at the protocol level.</p>
            </div>
          </div>
          <div className="bg-black p-10 flex flex-col justify-between">
            <div className="w-12 h-12 bg-zinc-950 border border-zinc-800 rounded-sm flex items-center justify-center text-sky-500 font-bold mb-16 text-xl">02</div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">Precision Match</h3>
              <p className="text-zinc-500 font-light text-lg">Filter talent strictly from your own campus. No noise, just relevant developers.</p>
            </div>
          </div>
          <div className="bg-black p-10 flex flex-col justify-between">
            <div className="w-12 h-12 bg-zinc-950 border border-zinc-800 rounded-sm flex items-center justify-center text-sky-500 font-bold mb-16 text-xl">03</div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">Live Hub</h3>
              <p className="text-zinc-500 font-light text-lg">Communicate via instant WebSockets and coordinate your next move in real-time.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

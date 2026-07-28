"use client";

import { useEffect, useState, useRef } from "react";
import { useStore } from "@/store/useStore";
import { Users, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ChatPage() {
  const { token, user, teamId, chatMessages, addChatMessage } = useStore();
  const [message, setMessage] = useState("");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!teamId || !token) return;

    // Connect to WebSocket using standard ws:// for local development
    const wsBaseUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';
    const socket = new WebSocket(`${wsBaseUrl}/api/chat/team/${teamId}?token=${token}`);
    
    socket.onopen = () => setIsConnected(true);
    socket.onclose = () => setIsConnected(false);
    
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      addChatMessage({
        sender_id: data.sender_id,
        sender_name: data.sender_name,
        content: data.content,
        timestamp: data.timestamp
      });
    };

    setWs(socket);

    return () => {
      socket.close();
    };
  }, [teamId, token, addChatMessage]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !ws || !isConnected) return;
    
    ws.send(message);
    setMessage("");
  };

  if (!teamId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-black">
        <AlertCircle className="h-16 w-16 text-zinc-600 mb-6" />
        <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">No Active Team</h2>
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs mb-8">You must join or create a team before accessing the comms link.</p>
        <Link href="/dashboard/my-team">
          <button className="h-12 px-8 bg-white hover:bg-zinc-200 text-black text-xs font-bold uppercase tracking-widest flex items-center justify-center transition-colors">
            Go to My Team
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-black relative">
      
      {/* Chat Header */}
      <div className="h-16 border-b border-zinc-900 bg-black flex items-center px-6 shrink-0 z-10 justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-sky-500/10 p-2 border border-sky-500/20">
            <Users className="h-4 w-4 text-sky-500" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Secure Comms</h2>
            <div className="flex items-center gap-2 mt-0.5 text-[10px] uppercase font-bold tracking-widest text-zinc-500">
              <span className={`w-1.5 h-1.5 rounded-none ${isConnected ? 'bg-sky-500' : 'bg-red-500'}`} />
              {isConnected ? 'Connection Stable' : 'Reconnecting...'}
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar z-10">
        {chatMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-600">
            <div className="border border-zinc-800 border-dashed p-12 text-center flex flex-col items-center">
              <p className="text-xs font-bold uppercase tracking-widest">Comm link established.</p>
              <p className="text-[10px] uppercase tracking-widest mt-2 opacity-50">Awaiting transmission...</p>
            </div>
          </div>
        ) : (
          chatMessages.map((msg, index) => {
            const isMe = msg.sender_id === user?.id;
            return (
              <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex flex-col max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                    {isMe ? 'You' : msg.sender_name}
                  </span>
                  <div className={`px-5 py-3 text-sm font-medium ${
                    isMe 
                      ? 'bg-sky-500 text-black border border-sky-500' 
                      : 'bg-zinc-950 text-zinc-100 border border-zinc-800'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 border-t border-zinc-900 bg-black shrink-0 z-10">
        <form onSubmit={sendMessage} className="max-w-4xl mx-auto flex gap-4">
          <input 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="TYPE MESSAGE..."
            className="flex-1 bg-zinc-950 border border-zinc-800 text-white px-4 h-12 focus:outline-none focus:border-sky-500 font-mono text-sm transition-colors"
            disabled={!isConnected}
          />
          <button 
            type="submit" 
            disabled={!isConnected || !message.trim()}
            className="h-12 px-8 bg-sky-500 hover:bg-sky-400 text-black text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send <ArrowRight className="h-4 w-4 ml-2" />
          </button>
        </form>
      </div>
    </div>
  );
}

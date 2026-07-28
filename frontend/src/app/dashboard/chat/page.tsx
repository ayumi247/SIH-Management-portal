"use client";

import { useEffect, useState, useRef } from "react";
import { useStore } from "@/store/useStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Users, AlertCircle } from "lucide-react";
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
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-zinc-950">
        <AlertCircle className="h-16 w-16 text-zinc-600 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">No Active Team</h2>
        <p className="text-zinc-400 mb-6">You must join or create a team before accessing the chat.</p>
        <Link href="/dashboard/team">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">Go to Team Hub</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f46e511_1px,transparent_1px),linear-gradient(to_bottom,#4f46e511_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      
      {/* Chat Header */}
      <div className="h-16 border-b border-white/5 bg-zinc-900/40 backdrop-blur-md flex items-center px-6 shrink-0 relative z-10">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-500/20 p-2 rounded-lg border border-indigo-500/30">
            <Users className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Team Chat</h2>
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              {isConnected ? 'Live & Connected' : 'Reconnecting...'}
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar relative z-10">
        {chatMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-500">
            <div className="bg-white/5 p-4 rounded-full mb-3">
              <Send className="h-6 w-6 text-zinc-400" />
            </div>
            <p>No messages yet. Say hello to your team!</p>
          </div>
        ) : (
          chatMessages.map((msg, index) => {
            const isMe = msg.sender_id === user?.id;
            return (
              <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-3 max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-indigo-900/50 text-indigo-200 text-xs">
                      {msg.sender_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <span className="text-xs text-zinc-400 mb-1 px-1">{isMe ? 'You' : msg.sender_name}</span>
                    <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-md ${
                      isMe 
                        ? 'bg-indigo-600 text-white rounded-tr-sm' 
                        : 'bg-zinc-800 text-zinc-100 rounded-tl-sm border border-white/5'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/5 bg-zinc-900/60 backdrop-blur-md shrink-0 relative z-10">
        <form onSubmit={sendMessage} className="max-w-4xl mx-auto relative flex items-center">
          <Input 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="w-full bg-zinc-950/80 border-white/10 rounded-full pl-6 pr-14 py-6 text-white focus-visible:ring-indigo-500"
            disabled={!isConnected}
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={!isConnected || !message.trim()}
            className="absolute right-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white h-10 w-10 shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Users, LogOut, MessageSquare, Shield, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";

export function Navbar() {
  const { token, user, logout } = useStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-900 bg-black text-zinc-50 font-sans">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-8 w-8 items-center justify-center bg-sky-500 rounded-sm">
              <Users className="h-5 w-5 text-black" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-sky-400 transition-colors">SIH Matchmaker</span>
          </Link>
        </div>

        {mounted && (
          <div className="flex items-center gap-4">
            {token ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-sky-400 hover:bg-zinc-900 rounded-sm">
                    Dashboard
                  </Button>
                </Link>
                <Link href="/dashboard/my-team">
                  <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-sky-400 hover:bg-zinc-900 rounded-sm">
                    <Shield className="h-4 w-4 mr-2" />
                    My Team
                  </Button>
                </Link>
                <Link href="/dashboard/chat">
                  <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-sky-400 hover:bg-zinc-900 rounded-sm">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Chat
                  </Button>
                </Link>
                
                <DropdownMenu>
                  <DropdownMenuTrigger className="outline-none ml-2">
                    <Avatar className="h-9 w-9 rounded-sm border border-zinc-800 transition-transform hover:border-sky-500">
                      <AvatarFallback className="bg-zinc-900 text-sky-400 rounded-sm">{user?.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-black border-zinc-800 text-zinc-100 rounded-sm">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none text-white">{user?.name}</p>
                        <p className="text-xs leading-none text-zinc-500">{user?.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-zinc-800" />
                    <DropdownMenuItem className="focus:bg-zinc-900 focus:text-sky-400 cursor-pointer rounded-sm" onClick={() => router.push('/dashboard/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="focus:bg-zinc-900 focus:text-sky-400 cursor-pointer rounded-sm" onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="text-zinc-400 hover:text-sky-400 hover:bg-zinc-900 rounded-sm">
                    Log in
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-sky-500 hover:bg-sky-600 text-black rounded-sm font-semibold">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

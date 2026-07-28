"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { api } from "@/lib/api";
import { Loader2, LogOut, MessageSquare, Users, Shield, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { token, user, setAuth, logout } = useStore();
  const router = useRouter();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (!token) {
        router.push("/login");
        return;
      }
      if (!user) {
        try {
          const res = await api.get("/auth/me");
          setAuth(token, res.data);
        } catch (error) {
          toast.error("Session expired");
          logout();
          router.push("/login");
        }
      }
      setIsInitializing(false);
    };
    initAuth();
  }, [token, user, router, setAuth, logout]);

  if (isInitializing) {
    return (
      <div className="flex-1 flex items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="flex-1 flex flex-col bg-black text-zinc-50 font-sans selection:bg-sky-500/30">
      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        {children}
      </main>
    </div>
  );
}

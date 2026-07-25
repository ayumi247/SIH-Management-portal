"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/store/useStore";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

function CallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setAuth } = useStore();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      // Store token. We set user to null temporarily; the Dashboard layout will fetch the user info
      setAuth(token, null as any);
      toast.success("Successfully logged in with Google!");
      router.push("/dashboard");
    } else {
      toast.error("Google authentication failed.");
      router.push("/login");
    }
  }, [searchParams, router, setAuth]);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-indigo-500 mb-4" />
      <h2 className="text-xl font-medium text-white">Completing login...</h2>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950 flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-indigo-500" /></div>}>
      <CallbackContent />
    </Suspense>
  );
}

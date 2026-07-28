import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hackathon Team Matchmaker",
  description: "Find the perfect team for SIH",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.className} antialiased min-h-screen bg-zinc-950 text-zinc-50 selection:bg-blue-500/30 flex flex-col border-t-8 border-b-8 border-blue-600`}
      >
        <main className="flex-grow flex flex-col">
          {children}
        </main>
        <footer className="py-6 text-center text-sm text-zinc-500 border-t border-zinc-900 bg-zinc-950">
          <p>&copy; 2026 SIH Matchmaker. All rights reserved. <a href="/privacy" className="text-blue-500 hover:underline ml-2">Privacy Policy</a></p>
        </footer>
        <Toaster theme="dark" position="top-center" richColors />
      </body>
    </html>
  );
}

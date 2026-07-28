import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

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
        className={`${inter.className} antialiased min-h-screen bg-black text-zinc-50 flex flex-col`}
      >
        <Navbar />
        <main className="flex-grow flex flex-col relative overflow-hidden">
          {children}
        </main>
        <Footer />
        <Toaster theme="dark" position="top-center" richColors />
      </body>
    </html>
  );
}

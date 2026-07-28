import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t border-zinc-900 bg-black text-zinc-500 font-sans mt-auto">
      <div className="max-w-7xl mx-auto py-8 px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col items-center md:items-start">
          <p className="text-sm">&copy; 2026 SIH Matchmaker. All rights reserved.</p>
        </div>
        
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/" className="hover:text-sky-400 transition-colors">Home</Link>
          <Link href="/dashboard/team" className="hover:text-sky-400 transition-colors">Team Build</Link>
          <Link href="/privacy" className="hover:text-sky-400 transition-colors">Privacy Policy</Link>
        </nav>
      </div>
    </footer>
  );
}

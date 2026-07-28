import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="flex-1 bg-black text-zinc-400 py-24 px-6 relative">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-sky-500 hover:text-sky-400 mb-12 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          BACK TO HOME
        </Link>
        
        <h1 className="text-5xl font-black tracking-tighter text-white mb-12 uppercase">Privacy Protocol</h1>
        
        <div className="space-y-12 font-light leading-relaxed">
          <section className="border-t border-zinc-900 pt-8">
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wider">1. Data Collection</h2>
            <p>
              When you register for the SIH Matchmaker, we collect your name, email address, gender, college affiliation, 
              and optional professional links (such as GitHub and LinkedIn). This information is necessary to provide our 
              matchmaking services and enforce hackathon team constraints at the protocol level.
            </p>
          </section>

          <section className="border-t border-zinc-900 pt-8">
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wider">2. Data Utilization</h2>
            <p>
              Your information is used strictly to facilitate team building for the Smart India Hackathon. Your profile 
              details (name, skills, college, and professional links) will be visible to other users from your college 
              to help you find the best team members. We do not sell or share your data with third-party advertisers.
            </p>
          </section>

          <section className="border-t border-zinc-900 pt-8">
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wider">3. Protocol Security</h2>
            <p>
              We implement industry-standard security measures to protect your personal information. Passwords are securely 
              hashed, and communication between your browser and our servers is encrypted using HTTPS.
            </p>
          </section>

          <section className="border-t border-zinc-900 pt-8">
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wider">4. Third-Party Auth</h2>
            <p>
              If you choose to authenticate using Google, we will securely request your email and basic profile information 
              from Google. We only use this to create and manage your Matchmaker account.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

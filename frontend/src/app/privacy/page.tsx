import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="flex-grow bg-zinc-950 text-zinc-50 py-24 px-6 relative z-10">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center text-blue-500 hover:text-blue-400 mb-8 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
        
        <h1 className="text-4xl font-extrabold tracking-tight mb-8">Privacy Policy</h1>
        
        <div className="space-y-8 text-zinc-400 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Information We Collect</h2>
            <p>
              When you register for the SIH Matchmaker, we collect your name, email address, gender, college affiliation, 
              and optional professional links (such as GitHub and LinkedIn). This information is necessary to provide our 
              matchmaking services and enforce hackathon team constraints.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. How We Use Your Information</h2>
            <p>
              Your information is used strictly to facilitate team building for the Smart India Hackathon. Your profile 
              details (name, skills, college, and professional links) will be visible to other users from your college 
              to help you find the best team members. We do not sell or share your data with third-party advertisers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your personal information. Passwords are securely 
              hashed, and communication between your browser and our servers is encrypted using HTTPS.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Third-Party Integrations</h2>
            <p>
              If you choose to authenticate using Google, we will securely request your email and basic profile information 
              from Google. We only use this to create and manage your Matchmaker account.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Contact Us</h2>
            <p>
              If you have any questions or concerns about this Privacy Policy or how your data is handled, please contact 
              the administrative team.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

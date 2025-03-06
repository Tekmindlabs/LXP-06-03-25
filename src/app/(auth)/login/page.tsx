import { Metadata } from "next";
import { LoginForm } from "@/components/ui/organisms/login-form";
import { Logo } from "@/components/ui/logo";

export const metadata: Metadata = {
  title: "Sign In | AIVY Learning Experience Platform",
  description: "Sign in to your AIVY LXP account to access your personalized learning dashboard.",
};

// Force static generation
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

export default function LoginPage() {
  return (
    <div className="w-full">
      <div className="mb-8">
        <Logo showTagline={false} className="mb-6" />
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">
          Welcome back
        </h2>
        <p className="mt-2 text-sm text-medium-gray">
          Sign in to your account to continue your learning journey
        </p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-light-gray animate-in fade-in-50">
        <LoginForm />
      </div>
    </div>
  );
} 
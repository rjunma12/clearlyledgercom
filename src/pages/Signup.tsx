import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Check } from "lucide-react";
import { logError, ErrorTypes } from "@/lib/errorLogger";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState<"google" | "apple" | null>(null);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        toast.error(error.message || "Sign up failed. Please try again.");
        logError({
          errorType: ErrorTypes.AUTH,
          errorMessage: error.message,
          component: 'Signup',
          action: 'signUp',
          metadata: { email }
        });
      } else if (data.user) {
        // Initialize email preferences for the new user
        await supabase.from('email_preferences').insert({
          user_id: data.user.id,
          email: email,
          usage_alerts: true,
          feature_announcements: true,
          marketing: false,
        });
        
        toast.success("Account created successfully!");
        navigate("/dashboard");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown signup error';
      toast.error(message);
      logError({
        errorType: ErrorTypes.AUTH,
        errorMessage: message,
        component: 'Signup',
        action: 'signUp',
        metadata: { email }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: "google" | "apple") => {
    setIsOAuthLoading(provider);
    try {
      const { error } = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: window.location.origin,
      });
      if (error) {
        toast.error(error.message || `Sign up with ${provider} failed`);
        logError({
          errorType: ErrorTypes.AUTH,
          errorMessage: error.message,
          component: 'Signup',
          action: `signUpWith${provider}`,
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : `Unknown ${provider} signup error`;
      toast.error(message);
    } finally {
      setIsOAuthLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              Create your account
            </h1>
            <p className="text-muted-foreground">
              Get 5 free pages per day with a registered account
            </p>
          </div>

          {/* Benefits */}
          <div className="mb-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Check className="w-4 h-4 text-primary" />
                5 pages every 24 hours (vs 1 for anonymous)
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Check className="w-4 h-4 text-primary" />
                Processing history saved
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Check className="w-4 h-4 text-primary" />
                Email support access
              </li>
            </ul>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <p className="text-xs text-muted-foreground">
                Must be at least 6 characters
              </p>
            </div>

            <Button
              type="submit"
              variant="hero"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Free Account"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

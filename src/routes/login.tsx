import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { lang } = useI18n();
  const { user } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) nav({ to: "/chat" });
  }, [user, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: {
            emailRedirectTo: `${window.location.origin}/chat`,
            data: { display_name: name || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success(lang === "bn" ? "অ্যাকাউন্ট তৈরি হয়েছে!" : "Account created!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success(lang === "bn" ? "স্বাগতম!" : "Welcome back!");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Auth failed";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-10">
        <Link to="/" className="mb-8 text-center">
          <div className="font-display text-3xl font-bold text-foreground">আড্ডা</div>
          <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
            {lang === "bn" ? "বিশ্বস্ত সামাজিক জগৎ" : "Trusted social world"}
          </div>
        </Link>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <div className="mb-4 flex rounded-full bg-secondary p-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={`flex-1 rounded-full py-2 transition ${mode === "signin" ? "bg-grad-indigo text-primary-foreground shadow-soft" : "text-muted-foreground"}`}
            >
              {lang === "bn" ? "সাইন ইন" : "Sign in"}
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 rounded-full py-2 transition ${mode === "signup" ? "bg-grad-indigo text-primary-foreground shadow-soft" : "text-muted-foreground"}`}
            >
              {lang === "bn" ? "নতুন একাউন্ট" : "Sign up"}
            </button>
          </div>

          <form onSubmit={submit} className="space-y-3">
            {mode === "signup" && (
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={lang === "bn" ? "আপনার নাম" : "Display name"}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-accent focus:outline-none"
                required
                maxLength={60}
              />
            )}
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-en focus:border-accent focus:outline-none"
              required autoComplete="email"
            />
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder={lang === "bn" ? "পাসওয়ার্ড (অন্তত ৬ অক্ষর)" : "Password (min 6 chars)"}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-accent focus:outline-none"
              required minLength={6}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
            />
            <button
              type="submit" disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-grad-indigo py-2.5 text-sm font-bold text-primary-foreground shadow-glow transition hover:opacity-95 disabled:opacity-60"
            >
              {busy && <Loader2 className="size-4 animate-spin" />}
              {mode === "signup"
                ? (lang === "bn" ? "একাউন্ট তৈরি করুন" : "Create account")
                : (lang === "bn" ? "সাইন ইন করুন" : "Sign in")}
            </button>
          </form>

          <p className="mt-4 text-center text-[11px] text-muted-foreground">
            {lang === "bn"
              ? "সাইন ইন করার পর আপনি অন্য ব্যবহারকারীদের সাথে সরাসরি বার্তা পাঠাতে পারবেন।"
              : "Sign in to send direct messages to other users."}
          </p>
        </div>

        <Link to="/" className="mt-6 text-center text-xs text-muted-foreground hover:text-foreground">
          ← {lang === "bn" ? "হোমে ফিরুন" : "Back to home"}
        </Link>
      </div>
    </div>
  );
}

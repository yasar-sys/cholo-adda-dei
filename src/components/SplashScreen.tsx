import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";

export function SplashScreen() {
  const { lang } = useI18n();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = "adda-splash-seen";
    const alreadySeen = sessionStorage.getItem(key);
    if (alreadySeen) return;
    setVisible(true);
    sessionStorage.setItem(key, "1");
    const timer = window.setTimeout(() => setVisible(false), 1800);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[200] grid place-items-center bg-background px-8 animate-splash-out">
      <div className="text-center">
        <div className="mx-auto grid size-28 place-items-center overflow-hidden rounded-[2rem] border border-border bg-card shadow-glow animate-splash-logo">
          <img src="/logo.png" alt="আড্ডা logo" className="size-full object-cover" />
        </div>
        <h1 className="mt-5 font-display text-3xl font-bold text-foreground">আড্ডা</h1>
        <p className="mt-1 text-xs uppercase tracking-[0.28em] text-muted-foreground">
          {lang === "bn" ? "বাংলার বিশ্বস্ত সামাজিক জগৎ" : "Bangla trusted social"}
        </p>
      </div>
    </div>
  );
}
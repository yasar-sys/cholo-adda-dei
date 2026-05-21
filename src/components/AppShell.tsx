import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { Bell, Home, MessageCircle, PlayCircle, PlusSquare, Search, Shield, User, Globe2, Palette } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useTheme, type AppTheme } from "@/lib/theme";
import { OnlinePill } from "@/components/LiveLayer";
import { cn } from "@/lib/utils";

function LangToggle() {
  const { lang, toggle } = useI18n();
  return (
    <button
      onClick={toggle}
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-secondary"
      aria-label="Toggle language"
    >
      <Globe2 className="size-3.5" />
      <span className={lang === "bn" ? "font-display" : "font-en"}>{lang === "bn" ? "বাংলা" : "EN"}</span>
    </button>
  );
}

const themeSwatches: Record<AppTheme, string> = {
  jamdani: "linear-gradient(135deg, var(--indigo-deep), var(--gold))",
  midnight: "linear-gradient(135deg, oklch(0.16 0.06 260), oklch(0.63 0.18 270))",
  lotus: "linear-gradient(135deg, oklch(0.95 0.05 20), oklch(0.68 0.18 350))",
  meghna: "linear-gradient(135deg, oklch(0.92 0.06 210), oklch(0.55 0.13 205))",
};

function ThemeMenu() {
  const { lang } = useI18n();
  const { theme, setTheme, themeLabels } = useTheme();
  return (
    <div className="group relative">
      <button className="grid size-9 place-items-center rounded-full border border-border bg-card text-foreground hover:bg-secondary" aria-label="theme options">
        <Palette className="size-4" />
      </button>
      <div className="invisible absolute right-0 top-11 z-50 w-44 rounded-2xl border border-border bg-popover p-2 opacity-0 shadow-glow transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
        {(Object.keys(themeLabels) as AppTheme[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTheme(key)}
            className={cn("flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left text-xs font-semibold transition hover:bg-secondary", theme === key && "bg-secondary text-primary")}
          >
            <span className="size-5 rounded-full border border-border" style={{ background: themeSwatches[key] }} />
            <span>{themeLabels[key].emoji} {lang === "bn" ? themeLabels[key].bn : themeLabels[key].en}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function TopBar() {
  const { t, lang } = useI18n();
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-2xl items-center gap-3 px-4">
        <Link to="/feed" className="flex items-center gap-2">
          <div className="grid size-9 place-items-center overflow-hidden rounded-xl bg-grad-indigo shadow-soft">
            <img src="/logo.png" alt="Adda Logo" className="h-full w-full object-cover" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-base font-bold text-foreground">
              {t("appName")}
            </div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              {lang === "bn" ? "বিশ্বস্ত সামাজিক" : "Trusted Social"}
            </div>
          </div>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <OnlinePill />
          <LangToggle />
          <ThemeMenu />
          <button className="grid size-9 place-items-center rounded-full border border-border bg-card text-foreground hover:bg-secondary" aria-label="search">
            <Search className="size-4" />
          </button>
          <button className="relative grid size-9 place-items-center rounded-full border border-border bg-card text-foreground hover:bg-secondary" aria-label="notifications">
            <Bell className="size-4" />
            <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-destructive ring-2 ring-card" />
          </button>
        </div>
      </div>
    </header>
  );
}

const navItems = [
  { to: "/feed" as const,    icon: Home,          key: "nav_feed" as const },
  { to: "/reels" as const,   icon: PlayCircle,    key: "nav_reels" as const },
  { to: "/compose" as const, icon: PlusSquare,    key: "nav_post" as const, center: true },
  { to: "/chat" as const,    icon: MessageCircle, key: "nav_chat" as const },
  { to: "/trust" as const,   icon: Shield,        key: "nav_trust" as const },
];

export function BottomNav() {
  const { t } = useI18n();
  const loc = useLocation();
  return (
    <nav className="sticky bottom-0 z-30 border-t border-border bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-2xl items-stretch justify-around px-2 py-2">
        {navItems.map((it) => {
          const active = loc.pathname === it.to;
          const Icon = it.icon;
          if (it.center) {
            return (
              <Link
                key={it.to}
                to={it.to}
                className="-mt-6 grid size-12 place-items-center rounded-2xl bg-grad-indigo text-primary-foreground shadow-glow transition active:scale-95"
                aria-label={t(it.key)}
              >
                <Icon className="size-5" />
              </Link>
            );
          }
          return (
            <Link
              key={it.to}
              to={it.to}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 rounded-xl px-2 py-1 text-[10px] font-medium transition",
                active ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className={cn("size-5", active && "stroke-[2.4]")} />
              <span>{t(it.key)}</span>
            </Link>
          );
        })}
        <Link
          to="/profile"
          className={cn(
            "flex flex-1 flex-col items-center gap-0.5 rounded-xl px-2 py-1 text-[10px] font-medium transition",
            loc.pathname === "/profile" ? "text-primary" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <User className={cn("size-5", loc.pathname === "/profile" && "stroke-[2.4]")} />
          <span>{t("nav_profile")}</span>
        </Link>
      </div>
    </nav>
  );
}

export function AppShell() {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      {/* decorative jamdani strip */}
      <div className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-32 opacity-[0.04] [mask-image:linear-gradient(to_bottom,black,transparent)]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, var(--gold) 1px, transparent 0)",
          backgroundSize: "18px 18px",
        }}
      />
      <TopBar />
      <main className="mx-auto w-full max-w-2xl flex-1 px-0 pb-2">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}

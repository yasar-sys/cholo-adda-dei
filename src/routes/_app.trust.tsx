import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ShieldCheck, ScanFace, Filter, BarChart3, Gauge, Loader2, Sparkles, ExternalLink } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { analyzeWithAI } from "@/lib/ai-trust.functions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/trust")({
  component: TrustPage,
});

type Kind = "factcheck" | "deepfake" | "misinfo" | "sentiment" | "trustscore";

interface AIResult {
  verdict: string;
  confidence: number;
  reasoning: string;
  sources: { title: string; url?: string }[];
}

function TrustPage() {
  const { t, lang } = useI18n();
  const [kind, setKind] = useState<Kind>("factcheck");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIResult | null>(null);
  const fn = useServerFn(analyzeWithAI);

  const tools: { key: Kind; titleKey: Parameters<typeof t>[0]; descKey: Parameters<typeof t>[0]; Icon: typeof ShieldCheck; grad: string }[] = [
    { key: "factcheck",  titleKey: "ai_factcheck",   descKey: "ai_factcheck_desc",   Icon: ShieldCheck, grad: "bg-grad-indigo" },
    { key: "deepfake",   titleKey: "ai_deepfake",    descKey: "ai_deepfake_desc",    Icon: ScanFace,    grad: "bg-grad-trust" },
    { key: "misinfo",    titleKey: "ai_misinfo",     descKey: "ai_misinfo_desc",     Icon: Filter,      grad: "bg-grad-gold" },
    { key: "sentiment",  titleKey: "ai_sentiment",   descKey: "ai_sentiment_desc",   Icon: BarChart3,   grad: "bg-grad-trust" },
    { key: "trustscore", titleKey: "ai_trust_score", descKey: "ai_trust_score_desc", Icon: Gauge,       grad: "bg-grad-indigo" },
  ];

  const submit = async () => {
    if (text.trim().length < 5) {
      toast.error(lang === "bn" ? "অন্তত ৫ অক্ষর দিন" : "Enter at least 5 characters");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const r = await fn({ data: { kind, text, lang } });
      setResult(r);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const confColor = result ? (result.confidence >= 70 ? "text-trust-high" : result.confidence >= 40 ? "text-trust-mid" : "text-trust-low") : "";

  return (
    <div className="pb-6">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-grad-indigo px-5 py-7 text-primary-foreground">
        <div className="pointer-events-none absolute inset-0 opacity-20" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, var(--gold) 1px, transparent 0)",
          backgroundSize: "14px 14px",
        }} />
        <div className="relative">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold backdrop-blur-md">
            <Sparkles className="size-3.5" /> {lang === "bn" ? "AI চালিত" : "Powered by AI"}
          </div>
          <h1 className="mt-3 font-display text-2xl font-bold text-balance">{t("ai_hub_title")}</h1>
          <p className="mt-2 max-w-md text-sm opacity-90 text-balance">{t("ai_hub_sub")}</p>
        </div>
      </section>

      {/* Tools */}
      <section className="grid grid-cols-2 gap-3 px-4 pt-4 md:grid-cols-5">
        {tools.map((tool) => {
          const active = kind === tool.key;
          return (
            <button
              key={tool.key}
              onClick={() => setKind(tool.key)}
              className={cn(
                "group relative overflow-hidden rounded-2xl border p-3 text-left transition",
                active ? "border-primary bg-card shadow-glow" : "border-border bg-card hover:border-accent/50",
              )}
            >
              <div className={cn("mb-2 grid size-9 place-items-center rounded-xl text-primary-foreground", tool.grad)}>
                <tool.Icon className="size-[18px]" />
              </div>
              <div className="font-display text-[13px] font-bold leading-tight text-foreground">{t(tool.titleKey)}</div>
              <div className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{t(tool.descKey)}</div>
            </button>
          );
        })}
      </section>

      {/* Input */}
      <section className="mt-4 px-4">
        <div className="rounded-2xl border border-border bg-card p-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            placeholder={t("input_placeholder")}
            className="w-full resize-none rounded-xl bg-background p-3 text-sm focus:outline-none"
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">{text.length} / 4000</span>
            <button
              onClick={submit}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-full bg-grad-indigo px-4 py-2 text-xs font-bold text-primary-foreground shadow-soft disabled:opacity-60"
            >
              {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
              {loading ? t("analyzing") : t("analyze")}
            </button>
          </div>
        </div>
      </section>

      {/* Result */}
      <section className="px-4 pt-4">
        {!result && !loading && (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 p-6 text-center text-sm text-muted-foreground">
            {t("result_empty")}
          </div>
        )}

        {result && (
          <div className="space-y-3">
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t("verdict")}</div>
                <div className={cn("font-display text-3xl font-bold", confColor)}>
                  {result.confidence}<span className="text-base text-muted-foreground">/100</span>
                </div>
              </div>
              <p className="mt-2 font-display text-lg font-semibold text-foreground text-balance">{result.verdict}</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className={cn("h-full transition-all",
                  result.confidence >= 70 ? "bg-trust-high" : result.confidence >= 40 ? "bg-trust-mid" : "bg-trust-low")}
                  style={{ width: `${result.confidence}%` }}
                />
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground">{t("confidence")}</div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t("reasoning")}</div>
              <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">{result.reasoning}</p>
            </div>

            {result.sources.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t("sources")}</div>
                <ul className="space-y-2">
                  {result.sources.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <ExternalLink className="mt-0.5 size-3.5 shrink-0 text-accent" />
                      {s.url ? (
                        <a href={s.url} target="_blank" rel="noreferrer" className="text-foreground underline-offset-2 hover:underline">{s.title}</a>
                      ) : (
                        <span className="text-foreground">{s.title}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

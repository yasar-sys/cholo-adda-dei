import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Image, MapPin, Smile, ShieldCheck, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { analyzeWithAI } from "@/lib/ai-trust.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/compose")({
  component: ComposePage,
});

function ComposePage() {
  const { t, lang } = useI18n();
  const nav = useNavigate();
  const [text, setText] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [verdict, setVerdict] = useState<string>("");
  const fn = useServerFn(analyzeWithAI);

  const verify = async () => {
    if (text.trim().length < 5) {
      toast.error(lang === "bn" ? "অন্তত ৫ অক্ষর লিখুন" : "Write at least 5 characters");
      return;
    }
    setVerifying(true);
    try {
      const r = await fn({ data: { kind: "factcheck", text, lang } });
      setScore(r.confidence);
      setVerdict(r.verdict);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="font-display text-lg font-bold text-foreground">
        {lang === "bn" ? "নতুন পোস্ট" : "New post"}
      </h1>
      <p className="text-xs text-muted-foreground">
        {lang === "bn" ? "প্রকাশের আগে AI আপনার দাবি যাচাই করতে পারে।" : "AI can verify your claim before publishing."}
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={7}
        placeholder={t("composer_placeholder")}
        className="mt-4 w-full resize-none rounded-2xl border border-border bg-card p-4 text-[15px] leading-relaxed focus:border-accent focus:outline-none"
      />

      <div className="mt-3 flex items-center gap-2 text-muted-foreground">
        <button className="grid size-10 place-items-center rounded-full border border-border bg-card" aria-label="image"><Image className="size-4" /></button>
        <button className="grid size-10 place-items-center rounded-full border border-border bg-card" aria-label="location"><MapPin className="size-4" /></button>
        <button className="grid size-10 place-items-center rounded-full border border-border bg-card" aria-label="emoji"><Smile className="size-4" /></button>
      </div>

      <div className="mt-5 grid gap-3">
        <button
          onClick={verify}
          disabled={verifying}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-secondary px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted disabled:opacity-60"
        >
          {verifying ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
          {verifying ? t("analyzing") : t("composer_verify")}
        </button>

        {score !== null && (
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="font-display text-sm font-bold">{t("trust_score")}</span>
              <span className="font-display text-2xl font-bold text-primary">{score}<span className="text-base text-muted-foreground">/100</span></span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-grad-trust" style={{ width: `${score}%` }} />
            </div>
            <p className="mt-3 text-sm text-foreground">{verdict}</p>
          </div>
        )}

        <button
          onClick={() => { toast.success(lang === "bn" ? "পোস্ট প্রকাশিত!" : "Post published!"); nav({ to: "/feed" }); }}
          className="rounded-2xl bg-grad-indigo px-4 py-3 text-sm font-bold text-primary-foreground shadow-soft"
        >
          {t("composer_publish")}
        </button>
      </div>
    </div>
  );
}

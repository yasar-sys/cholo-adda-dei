import { useState } from "react";
import { MoreHorizontal, Flag, EyeOff, Info, ShieldAlert, Share2, Bookmark } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { usePosts } from "@/lib/posts";
import { toast } from "sonner";

const reasons = [
  { id: "false",    bn: "ভুল তথ্য / গুজব",        en: "False info / rumor" },
  { id: "spam",     bn: "স্প্যাম বা প্রতারণা",      en: "Spam or scam" },
  { id: "hate",     bn: "ঘৃণা ছড়ানো / হয়রানি",   en: "Hate / harassment" },
  { id: "violence", bn: "সহিংসতা",                en: "Violence" },
  { id: "deepfake", bn: "ডিপফেক / কারচুপি ছবি",   en: "Deepfake / manipulated media" },
  { id: "other",    bn: "অন্য কারণ",              en: "Other" },
];

export function SafetyMenu({ postId, shareText, shareUrl }: { postId: string; shareText?: string; shareUrl?: string }) {
  const { lang } = useI18n();
  const { hidePost, reportPost } = usePosts();
  const [open, setOpen] = useState(false);
  const [reporting, setReporting] = useState(false);

  const share = async () => {
    const url = shareUrl || (typeof window !== "undefined" ? window.location.href : "");
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "আড্ডা", text: shareText, url });
        return;
      } catch { /* user cancelled */ }
    }
    try {
      await navigator.clipboard.writeText(`${shareText || ""} ${url}`.trim());
      toast.success(lang === "bn" ? "লিংক কপি হয়েছে" : "Link copied");
    } catch {
      toast.error(lang === "bn" ? "শেয়ার করা যাচ্ছে না" : "Cannot share");
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-secondary"
        aria-label="more"
      >
        <MoreHorizontal className="size-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3" onClick={() => { setOpen(false); setReporting(false); }}>
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-2 shadow-glow" onClick={(e) => e.stopPropagation()}>
            {!reporting ? (
              <ul className="text-sm">
                <Item Icon={Share2} label={lang === "bn" ? "শেয়ার করুন" : "Share"} onClick={() => { setOpen(false); share(); }} />
                <Item Icon={Bookmark} label={lang === "bn" ? "সংরক্ষণ করুন" : "Save"} onClick={() => { toast.success(lang === "bn" ? "সংরক্ষিত হয়েছে" : "Saved"); setOpen(false); }} />
                <Item Icon={EyeOff} label={lang === "bn" ? "এই পোস্টটি লুকান" : "Hide this post"} onClick={() => { hidePost(postId); toast.success(lang === "bn" ? "পোস্টটি লুকানো হয়েছে" : "Post hidden"); setOpen(false); }} />
                <Item Icon={Info} label={lang === "bn" ? "কেন আমি এটি দেখছি?" : "Why am I seeing this?"} onClick={() => { toast.info(lang === "bn" ? "এই পোস্টটি আপনার ফলো এবং বাংলা সাংস্কৃতিক আগ্রহের ভিত্তিতে দেখানো হচ্ছে।" : "Shown because of who you follow and your Bangla cultural interests."); setOpen(false); }} />
                <Item Icon={ShieldAlert} label={lang === "bn" ? "AI দিয়ে আবার যাচাই" : "Re-check with AI"} onClick={() => { toast.message(lang === "bn" ? "AI স্ক্যান শুরু হয়েছে…" : "AI scan started…"); setOpen(false); }} />
                <Item Icon={Flag} danger label={lang === "bn" ? "রিপোর্ট করুন" : "Report"} onClick={() => setReporting(true)} />
              </ul>
            ) : (
              <div className="p-3">
                <div className="mb-2 font-display text-sm font-bold">
                  {lang === "bn" ? "কেন রিপোর্ট করছেন?" : "Why are you reporting this?"}
                </div>
                <ul className="grid gap-1">
                  {reasons.map((r) => (
                    <li key={r.id}>
                      <button
                        onClick={() => {
                          reportPost(postId, r.id);
                          toast.success(lang === "bn" ? "ধন্যবাদ। আমাদের মডারেশন দল পর্যালোচনা করবে।" : "Thanks. Our moderation team will review.");
                          setOpen(false); setReporting(false);
                        }}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm hover:bg-secondary"
                      >
                        <span>{lang === "bn" ? r.bn : r.en}</span>
                        <Flag className="size-4 text-muted-foreground" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function Item({ Icon, label, onClick, danger }: { Icon: typeof Flag; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <li>
      <button onClick={onClick} className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left hover:bg-secondary ${danger ? "text-destructive" : "text-foreground"}`}>
        <Icon className="size-4" />
        <span className="text-sm font-medium">{label}</span>
      </button>
    </li>
  );
}

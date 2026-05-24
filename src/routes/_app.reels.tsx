import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, MessageCircle, Share2, Music2, Play, Flag, Download, Bookmark } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import sundarbans from "@/assets/post-sundarbans.jpg";
import rickshaw from "@/assets/post-rickshaw.jpg";
import biryani from "@/assets/post-biryani.jpg";

export const Route = createFileRoute("/_app/reels")({
  component: ReelsPage,
});

const reels = [
  { id: 1, img: sundarbans, bn: "সুন্দরবনে এক দিন 🌿", en: "A day in the Sundarbans 🌿", artist: "ভাটিয়ালি · Bhatiali" },
  { id: 2, img: rickshaw,   bn: "ঢাকার রাস্তায় রিকশা-শিল্প 🎨", en: "Rickshaw art on Dhaka streets 🎨", artist: "ফোক ফিউশন" },
  { id: 3, img: biryani,    bn: "এক প্লেট কাচ্চি 🍛",            en: "One plate of kacchi 🍛",            artist: "নিজস্ব অডিও" },
];

async function shareReel(text: string, url: string, lang: "bn" | "en") {
  if (typeof navigator !== "undefined" && navigator.share) {
    try { await navigator.share({ title: "আড্ডা Reel", text, url }); return; } catch { /* cancel */ }
  }
  try {
    await navigator.clipboard.writeText(`${text} ${url}`);
    toast.success(lang === "bn" ? "লিংক কপি হয়েছে" : "Link copied");
  } catch {
    toast.error(lang === "bn" ? "শেয়ার করা যাচ্ছে না" : "Cannot share");
  }
}

function ReelsPage() {
  const { lang } = useI18n();
  const [liked, setLiked] = useState<Record<number, boolean>>({});
  const [saved, setSaved] = useState<Record<number, boolean>>({});

  return (
    <div className="snap-y snap-mandatory space-y-3 px-3 pt-3">
      {reels.map((r) => {
        const caption = lang === "bn" ? r.bn : r.en;
        const url = typeof window !== "undefined" ? `${window.location.origin}/reels#${r.id}` : `/reels#${r.id}`;
        return (
          <article key={r.id} className="relative snap-start overflow-hidden rounded-3xl bg-black shadow-soft">
            <img src={r.img} alt="" loading="lazy" className="aspect-[9/14] w-full object-cover opacity-95" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
            <button className="absolute inset-0 grid place-items-center" aria-label="play">
              <div className="grid size-16 place-items-center rounded-full bg-white/15 backdrop-blur-md ring-1 ring-white/30">
                <Play className="size-7 fill-white text-white" />
              </div>
            </button>
            <div className="absolute bottom-0 left-0 right-14 p-4 text-white">
              <div className="font-display text-base font-semibold">{caption}</div>
              <div className="mt-1 flex items-center gap-1.5 text-xs opacity-90">
                <Music2 className="size-3.5" /> <span>{r.artist}</span>
              </div>
            </div>
            <div className="absolute bottom-4 right-3 flex flex-col items-center gap-3 text-white">
              <ReelAction Icon={Heart} count={liked[r.id] ? "12.4k" : "12.4k"} active={!!liked[r.id]} onClick={() => setLiked((s) => ({ ...s, [r.id]: !s[r.id] }))} />
              <ReelAction Icon={MessageCircle} count="892" onClick={() => toast.info(lang === "bn" ? "মন্তব্য শীঘ্রই আসছে" : "Comments coming soon")} />
              <ReelAction Icon={Share2} count="শেয়ার" onClick={() => shareReel(caption, url, lang)} />
              <ReelAction Icon={Bookmark} count={saved[r.id] ? (lang === "bn" ? "সংরক্ষিত" : "Saved") : (lang === "bn" ? "সংরক্ষণ" : "Save")} active={!!saved[r.id]} onClick={() => { setSaved((s) => ({ ...s, [r.id]: !s[r.id] })); toast.success(lang === "bn" ? "সংরক্ষিত" : "Saved"); }} />
              <ReelAction
                Icon={Download}
                count={lang === "bn" ? "ডাউনলোড" : "Save"}
                onClick={() => {
                  const a = document.createElement("a");
                  a.href = r.img; a.download = `adda-reel-${r.id}.jpg`; a.click();
                }}
              />
              <ReelAction Icon={Flag} count={lang === "bn" ? "রিপোর্ট" : "Report"} onClick={() => toast.success(lang === "bn" ? "রিপোর্ট গৃহীত" : "Report received")} />
            </div>
          </article>
        );
      })}
    </div>
  );
}

function ReelAction({ Icon, count, onClick, active }: { Icon: typeof Heart; count: string; onClick?: () => void; active?: boolean }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-0.5">
      <div className={`grid size-10 place-items-center rounded-full backdrop-blur-md ring-1 ${active ? "bg-destructive/80 ring-destructive/60" : "bg-white/15 ring-white/20"}`}>
        <Icon className={`size-5 ${active ? "fill-white" : ""}`} />
      </div>
      <span className="text-[10px] font-semibold">{count}</span>
    </button>
  );
}

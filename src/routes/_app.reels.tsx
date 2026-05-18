import { createFileRoute } from "@tanstack/react-router";
import { Heart, MessageCircle, Share2, Music2, Play } from "lucide-react";
import { useI18n } from "@/lib/i18n";
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

function ReelsPage() {
  const { lang } = useI18n();
  return (
    <div className="snap-y snap-mandatory space-y-3 px-3 pt-3">
      {reels.map((r) => (
        <article key={r.id} className="relative snap-start overflow-hidden rounded-3xl bg-black shadow-soft">
          <img src={r.img} alt="" loading="lazy" className="aspect-[9/14] w-full object-cover opacity-95" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
          <button className="absolute inset-0 grid place-items-center" aria-label="play">
            <div className="grid size-16 place-items-center rounded-full bg-white/15 backdrop-blur-md ring-1 ring-white/30">
              <Play className="size-7 fill-white text-white" />
            </div>
          </button>
          <div className="absolute bottom-0 left-0 right-12 p-4 text-white">
            <div className="font-display text-base font-semibold">{lang === "bn" ? r.bn : r.en}</div>
            <div className="mt-1 flex items-center gap-1.5 text-xs opacity-90">
              <Music2 className="size-3.5" /> <span>{r.artist}</span>
            </div>
          </div>
          <div className="absolute bottom-4 right-3 flex flex-col items-center gap-4 text-white">
            <ReelAction Icon={Heart} count="12.4k" />
            <ReelAction Icon={MessageCircle} count="892" />
            <ReelAction Icon={Share2} count="3.1k" />
          </div>
        </article>
      ))}
    </div>
  );
}

function ReelAction({ Icon, count }: { Icon: typeof Heart; count: string }) {
  return (
    <button className="flex flex-col items-center gap-0.5">
      <div className="grid size-10 place-items-center rounded-full bg-white/15 backdrop-blur-md ring-1 ring-white/20">
        <Icon className="size-5" />
      </div>
      <span className="text-[10px] font-semibold">{count}</span>
    </button>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { Settings, ShieldCheck, Award, MapPin } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import jamdani from "@/assets/jamdani-pattern.jpg";
import avatar from "@/assets/avatar-1.jpg";
import sundarbans from "@/assets/post-sundarbans.jpg";
import rickshaw from "@/assets/post-rickshaw.jpg";
import biryani from "@/assets/post-biryani.jpg";

export const Route = createFileRoute("/_app/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { lang } = useI18n();
  return (
    <div>
      <div className="relative h-32 overflow-hidden">
        <img src={jamdani} alt="" className="size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/30 via-primary/40 to-background" />
        <button className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-card/80 backdrop-blur-md" aria-label="settings">
          <Settings className="size-4" />
        </button>
      </div>

      <div className="-mt-12 flex items-end gap-4 px-4">
        <img src={avatar} alt="" width={96} height={96} className="size-24 rounded-2xl object-cover ring-4 ring-background" />
        <div className="flex-1 pb-2">
          <div className="flex items-center gap-1.5">
            <h1 className="font-display text-lg font-bold">{lang === "bn" ? "আদিবা রহমান" : "Adiba Rahman"}</h1>
            <ShieldCheck className="size-4 text-trust-high" />
          </div>
          <div className="text-xs text-muted-foreground font-en">@adiba.r</div>
        </div>
      </div>

      <div className="px-4 pt-3">
        <p className="text-sm text-foreground">
          {lang === "bn"
            ? "ঢাকার মানুষ · ছবি তুলি, লিখি, রান্না করি 🌸"
            : "Dhaka-based · I photograph, write, and cook 🌸"}
        </p>
        <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3.5" /> {lang === "bn" ? "ঢাকা, বাংলাদেশ" : "Dhaka, Bangladesh"}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 divide-x divide-border border-y border-border bg-card text-center">
        {[
          { v: "১,২৮৪", l: lang === "bn" ? "পোস্ট" : "Posts" },
          { v: "৪২.১k", l: lang === "bn" ? "ফলোয়ার" : "Followers" },
          { v: "৩১২",   l: lang === "bn" ? "ফলোয়িং" : "Following" },
        ].map((s) => (
          <div key={s.l} className="py-3">
            <div className="font-display text-lg font-bold text-foreground">{s.v}</div>
            <div className="text-[11px] text-muted-foreground">{s.l}</div>
          </div>
        ))}
      </div>

      <div className="px-4 pt-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-grad-gold px-3 py-1.5 text-xs font-bold text-foreground">
          <Award className="size-3.5" />
          {lang === "bn" ? "বিশ্বস্ত অবদানকারী · ৯৩/১০০" : "Trusted contributor · 93/100"}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-1 px-1">
        {[sundarbans, rickshaw, biryani, biryani, sundarbans, rickshaw].map((img, i) => (
          <img key={i} src={img} alt="" loading="lazy" className="aspect-square w-full object-cover" />
        ))}
      </div>
    </div>
  );
}

import { Plus } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { sampleStories } from "@/lib/sample-data";

export function StoriesBar() {
  const { t, lang } = useI18n();
  return (
    <div className="border-b border-border bg-card">
      <div className="flex items-center justify-between px-4 pt-3">
        <h2 className="font-display text-sm font-bold text-foreground">{t("stories")}</h2>
        <span className="text-xs text-muted-foreground">{lang === "bn" ? "সব দেখুন" : "See all"}</span>
      </div>
      <div className="scroll-hide flex gap-3 overflow-x-auto px-4 py-3">
        <button className="flex w-16 shrink-0 flex-col items-center gap-1.5">
          <div className="relative grid size-16 place-items-center rounded-full border-2 border-dashed border-border bg-secondary">
            <Plus className="size-5 text-muted-foreground" />
          </div>
          <span className="truncate text-[10px] text-muted-foreground">{t("your_story")}</span>
        </button>
        {sampleStories.map((s) => (
          <button key={s.id} className="flex w-16 shrink-0 flex-col items-center gap-1.5">
            <div className="rounded-full bg-grad-gold p-[2px]">
              <div className="rounded-full bg-card p-[2px]">
                <img src={s.avatar} alt="" width={56} height={56} loading="lazy" className="size-14 rounded-full object-cover" />
              </div>
            </div>
            <span className="truncate text-[11px] font-medium text-foreground">
              {lang === "bn" ? s.nameBn : s.nameEn}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

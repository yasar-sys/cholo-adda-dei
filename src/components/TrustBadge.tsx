import { CheckCircle2, AlertTriangle, ShieldAlert } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { TrustLevel } from "@/lib/sample-data";

export function TrustBadge({ level, score, compact }: { level: TrustLevel; score: number; compact?: boolean }) {
  const { t } = useI18n();
  const map = {
    verified:   { Icon: CheckCircle2, cls: "badge-trust-high", label: t("trust_verified") },
    suspicious: { Icon: AlertTriangle, cls: "badge-trust-mid",  label: t("trust_suspicious") },
    false:      { Icon: ShieldAlert,   cls: "badge-trust-low",  label: t("trust_false") },
  } as const;
  const { Icon, cls, label } = map[level];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold", cls)}>
      <Icon className="size-3.5" />
      <span>{label}</span>
      {!compact && <span className="opacity-70">· {score}</span>}
    </span>
  );
}

"use client";

import { Globe, Store } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

// Online = guest ordered via website/QR; Offline = entered by staff.
export function ChannelBadge({ channel, className }: { channel: "STAFF" | "ONLINE"; className?: string }) {
  const { t } = useI18n();
  const online = channel === "ONLINE";
  return (
    <Badge
      variant={online ? "info" : "neutral"}
      className={cn("gap-1 font-medium", className)}
    >
      {online ? <Globe aria-hidden /> : <Store aria-hidden />}
      {online ? t("orders.filter.online") : t("orders.filter.offline")}
    </Badge>
  );
}

// Labels come from common.orderType.<TYPE>.
const KNOWN_TYPES = new Set(["DINE_IN", "TAKEAWAY", "DELIVERY", "DRIVE_THRU", "QR_ORDER", "KIOSK", "PHONE"]);

export function TypeBadge({ type, className }: { type: string; className?: string }) {
  const { t } = useI18n();
  return (
    <Badge variant="outline" className={cn("border-border/80 bg-card font-medium text-muted-foreground", className)}>
      {KNOWN_TYPES.has(type) ? t(`common.orderType.${type}`) : type.replace("_", " ")}
    </Badge>
  );
}

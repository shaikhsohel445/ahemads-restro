"use client";

import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

// Online = guest ordered via website/QR; Offline = entered by staff.
export function ChannelBadge({ channel }: { channel: "STAFF" | "ONLINE" }) {
  const { t } = useI18n();
  const online = channel === "ONLINE";
  return (
    <Badge
      variant="secondary"
      className={cn(
        "font-normal",
        online ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground",
      )}
    >
      {online ? t("orders.filter.online") : t("orders.filter.offline")}
    </Badge>
  );
}

// Labels come from common.orderType.<TYPE>.
const KNOWN_TYPES = new Set(["DINE_IN", "TAKEAWAY", "DELIVERY", "DRIVE_THRU", "QR_ORDER", "KIOSK", "PHONE"]);

export function TypeBadge({ type }: { type: string }) {
  const { t } = useI18n();
  return (
    <Badge variant="secondary" className="font-normal">
      {KNOWN_TYPES.has(type) ? t(`common.orderType.${type}`) : type.replace("_", " ")}
    </Badge>
  );
}

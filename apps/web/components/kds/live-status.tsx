"use client";

import { Volume2, VolumeX, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { useNotificationMute } from "@/hooks/use-notification-mute";
import { playNotificationFeedback } from "@/lib/notification-feedback";
import { unlockAudio, useAudioUnlocked } from "@/lib/audio-unlock";
import { useRealtimeState } from "@/lib/realtime-status";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

// Two things a kitchen screen has to be honest about: whether live updates
// are flowing, and whether it is actually allowed to make noise. A browser
// blocks sound until the page is touched, so an untouched screen says so and
// offers one tap to turn it on instead of silently missing every new ticket.

/** Small live/reconnecting pill for the KDS toolbar. */
export function LiveIndicator({ className }: { className?: string }) {
  const { t } = useI18n();
  const state = useRealtimeState();
  const tone = state === "live" ? "success" : state === "offline" ? "warning" : "neutral";
  const label =
    state === "live" ? t("kds.live") : state === "offline" ? t("kds.reconnecting") : t("kds.connecting");
  return (
    <StatusPill tone={tone} pulse={state !== "offline"} className={cn("h-8 px-3 text-[13px]", className)}>
      {label}
    </StatusPill>
  );
}

/** Full-width notice shown only while live updates are paused. */
export function LiveOfflineBanner({ className }: { className?: string }) {
  const { t } = useI18n();
  const state = useRealtimeState();
  if (state !== "offline") return null;
  return (
    <p
      role="status"
      className={cn(
        "flex items-center gap-2 rounded-xl bg-status-warning-soft px-3 py-2 text-sm text-status-warning",
        className,
      )}
    >
      <WifiOff className="size-4 shrink-0" aria-hidden />
      {t("kds.livePaused")}
    </p>
  );
}

/** "Turn on sound" (while the browser still blocks audio) plus the mute toggle. */
export function SoundControls({ className }: { className?: string }) {
  const { t } = useI18n();
  const unlocked = useAudioUnlocked();
  const [muted, toggleMute] = useNotificationMute();

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {!muted && !unlocked && (
        <Button
          type="button"
          className="h-11"
          title={t("kds.enableSound")}
          onClick={() => {
            void unlockAudio().then((ok) => ok && playNotificationFeedback());
          }}
        >
          <Volume2 className="size-4" aria-hidden />
          <span className="max-sm:sr-only">{t("kds.enableSound")}</span>
        </Button>
      )}
      <Button
        type="button"
        variant="outline"
        className={cn("h-11 min-w-11 px-3", muted && "text-muted-foreground")}
        aria-pressed={muted}
        onClick={toggleMute}
        title={t("kds.perDevice")}
      >
        {muted ? <VolumeX className="size-4" aria-hidden /> : <Volume2 className="size-4" aria-hidden />}
        <span className="max-md:sr-only">{muted ? t("kds.soundOff") : t("kds.soundOn")}</span>
      </Button>
    </div>
  );
}

/** Backward-compatible composite: banner, live pill and sound controls. */
export function LiveStatus() {
  return (
    <div className="flex flex-col gap-2">
      <LiveOfflineBanner />
      <div className="flex flex-wrap items-center gap-2">
        <LiveIndicator />
        <SoundControls />
      </div>
    </div>
  );
}

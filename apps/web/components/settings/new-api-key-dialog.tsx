"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n/context";

// Shown exactly once, right after creating a Staff or Integration API key —
// the raw token is never retrievable again after this dialog closes (only
// its masked lastFour is stored/shown from then on), so the copy action
// here is the user's only chance to grab it.
export function NewApiKeyDialog({ token, onClose }: { token: string; onClose: () => void }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    await navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("settings.apiKeys.createdTitle")}</DialogTitle>
          <DialogDescription>
            {t("settings.apiKeys.createdDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 p-3">
          <code dir="ltr" className="flex-1 overflow-x-auto whitespace-nowrap font-mono text-sm text-foreground">{token}</code>
          <Button type="button" size="icon-sm" variant="outline" onClick={onCopy}>
            {copied ? <CheckIcon className="text-primary" /> : <CopyIcon />}
            <span className="sr-only">{t("common.copy")}</span>
          </Button>
        </div>

        <DialogFooter>
          <Button type="button" onClick={onClose}>
            {t("common.done")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

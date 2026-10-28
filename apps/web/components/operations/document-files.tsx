"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Paperclip, X } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api";
import { formatNumber } from "@/lib/format";
import { translate, useI18n } from "@/lib/i18n/context";

export interface DocFile {
  id: string;
  fileName: string;
  mimeType: string;
  size: number;
}

const kb = (n: number) =>
  n >= 1_048_576
    ? translate("operations.files.mb", { n: formatNumber(n / 1_048_576, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) })
    : translate("operations.files.kb", { n: formatNumber(Math.max(1, Math.round(n / 1024))) });

export function DocumentFiles({ branchId, docId, files }: { branchId: string | null; docId: string; files: DocFile[] }) {
  const qc = useQueryClient();
  const { t } = useI18n();
  const ref = useRef<HTMLInputElement>(null);
  const refresh = () => qc.invalidateQueries({ queryKey: ["ops"] });
  const base = `/operations/documents/${docId}/files`;
  const upload = useMutation({
    mutationFn: (f: File) => api.upload(`${base}?branchId=${branchId}`, f),
    onSuccess: () => {
      refresh();
      toast.success(t("operations.files.attached"));
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : t("operations.files.uploadFailed")),
  });
  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`${base}/${id}?branchId=${branchId}`),
    onSuccess: refresh,
  });

  return (
    <div className="flex flex-col gap-2 border-t border-border pt-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">{t("operations.files.attachments")}</p>
        <input
          ref={ref}
          type="file"
          className="sr-only"
          aria-label={t("operations.files.attachAria")}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) {
              if (f.size > 5 * 1024 * 1024) toast.error(t("operations.files.tooLarge"));
              else upload.mutate(f);
            }
            e.target.value = "";
          }}
        />
        <Button size="sm" variant="outline" disabled={upload.isPending} onClick={() => ref.current?.click()}>
          <Paperclip className="me-1.5 h-3.5 w-3.5" /> {upload.isPending ? t("operations.files.uploading") : t("operations.files.attach")}
        </Button>
      </div>
      {files.length === 0 ? (
        <p className="text-xs text-muted-foreground">{t("operations.files.help")}</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {files.map((f) => (
            <li key={f.id} className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-1.5 text-sm">
              <a
                className="truncate text-primary hover:underline"
                href={`/api/v1${base}/${f.id}?branchId=${branchId}`}
                download={f.fileName}
              >
                {f.fileName}
              </a>
              <span className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                {kb(f.size)}
                <button type="button" aria-label={t("operations.files.removeAria", { name: f.fileName })} onClick={() => remove.mutate(f.id)} className="hover:text-destructive">
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

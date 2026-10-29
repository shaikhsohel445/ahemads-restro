"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, Paperclip, X } from "lucide-react";
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
    <div className="flex flex-col gap-3 border-t border-border/70 pt-4">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
          {t("operations.files.attachments")}
          {files.length > 0 && (
            <span className="rounded-full bg-surface-2 px-2 text-xs leading-5 font-normal text-muted-foreground tabular-nums">
              {formatNumber(files.length)}
            </span>
          )}
        </p>
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
          <Paperclip /> {upload.isPending ? t("operations.files.uploading") : t("operations.files.attach")}
        </Button>
      </div>
      {files.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">
          {t("operations.files.help")}
        </p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {files.map((f) => (
            <li key={f.id} className="flex items-center gap-3 rounded-xl border border-border/80 bg-card px-3 py-2 text-sm">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <FileText className="size-4" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <a
                  className="truncate font-medium text-foreground hover:text-primary hover:underline"
                  href={`/api/v1${base}/${f.id}?branchId=${branchId}`}
                  download={f.fileName}
                >
                  <bdi>{f.fileName}</bdi>
                </a>
                <span className="text-xs text-muted-foreground tabular-nums">{kb(f.size)}</span>
              </span>
              <button
                type="button"
                aria-label={t("operations.files.removeAria", { name: f.fileName })}
                onClick={() => remove.mutate(f.id)}
                className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-status-danger-soft hover:text-status-danger"
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

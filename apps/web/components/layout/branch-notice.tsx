"use client";

import { QueryError } from "@/components/ui/query-error";
import { useBranch } from "@/hooks/use-branch";
import { useI18n } from "@/lib/i18n/context";

// Shown only when there is no usable branch: a failed request offers a retry,
// and a loaded-but-empty list says the account has no branch. Nothing while
// the list is still loading.
export function BranchNotice() {
  const { state, error, retry, retrying } = useBranch();
  const { t } = useI18n();
  if (state === "error") {
    return <QueryError error={error} what={t("layout.whatBranches")} onRetry={retry} retrying={retrying} />;
  }
  if (state === "empty") {
    return (
      <p role="alert" className="rounded-lg bg-warning/10 px-3 py-2 text-sm text-warning">
        {t("layout.noBranch")}
      </p>
    );
  }
  return null;
}

"use client";

import { DocList, DocPage, DocSection } from "@/components/marketing/doc-page";
import { inlineCode, linkTo, rich, strong } from "@/components/marketing/rich-text";
import { SOURCE_CODE_URL } from "@/lib/site/config";
import { useI18n } from "@/lib/i18n/context";

export function AccessibilityContent() {
  const { t } = useI18n();
  const tags = { b: strong, code: inlineCode, link: linkTo(SOURCE_CODE_URL, true) };

  return (
    <DocPage title={t("docs.a11y.title")} updated="2026-10-29">
      <DocSection heading={t("docs.a11y.target.heading")}>
        <p>{rich(t("docs.a11y.target.body"), tags)}</p>
        <p>{t("docs.a11y.target.notCertified")}</p>
      </DocSection>

      <DocSection heading={t("docs.a11y.practice.heading")}>
        <DocList
          items={[
            rich(t("docs.a11y.practice.semantic"), tags),
            t("docs.a11y.practice.keyboard"),
            t("docs.a11y.practice.focus"),
            t("docs.a11y.practice.contrast"),
            rich(t("docs.a11y.practice.motion"), tags),
            t("docs.a11y.practice.alt"),
            t("docs.a11y.practice.forms"),
            t("docs.a11y.practice.rtl"),
          ]}
        />
      </DocSection>

      <DocSection heading={t("docs.a11y.testing.heading")}>
        <p>{t("docs.a11y.testing.body")}</p>
        <p>{t("docs.a11y.testing.gap")}</p>
      </DocSection>

      <DocSection heading={t("docs.a11y.gaps.heading")}>
        <DocList
          items={[
            t("docs.a11y.gaps.kds"),
            t("docs.a11y.gaps.rtl"),
            t("docs.a11y.gaps.vpat"),
            t("docs.a11y.gaps.thirdParty"),
          ]}
        />
      </DocSection>

      <DocSection heading={t("docs.a11y.report.heading")}>
        <p>{rich(t("docs.a11y.report.body"), tags)}</p>
      </DocSection>
    </DocPage>
  );
}

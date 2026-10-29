"use client";

import { DocList, DocPage, DocSection } from "@/components/marketing/doc-page";
import { linkTo, rich, strong } from "@/components/marketing/rich-text";
import { useI18n } from "@/lib/i18n/context";

export function ComplianceContent() {
  const { t } = useI18n();
  const tags = { b: strong, zatca: linkTo("https://zatca.gov.sa", true) };

  return (
    <DocPage title={t("docs.compliance.title")} updated="2026-10-29">
      <DocSection heading={t("docs.compliance.disclaimer.heading")}>
        <p>{rich(t("docs.compliance.disclaimer.body"), tags)}</p>
      </DocSection>

      <DocSection heading={t("docs.compliance.vat.heading")}>
        <p>{rich(t("docs.compliance.vat.body"), tags)}</p>
        <DocList
          items={[
            t("docs.compliance.vat.rate"),
            t("docs.compliance.vat.inclusive"),
            t("docs.compliance.vat.perItem"),
            t("docs.compliance.vat.currency"),
          ]}
        />
      </DocSection>

      <DocSection heading={t("docs.compliance.invoice.heading")}>
        <p>{t("docs.compliance.invoice.body")}</p>
        <DocList
          items={[
            t("docs.compliance.invoice.qr.seller"),
            t("docs.compliance.invoice.qr.vatNumber"),
            t("docs.compliance.invoice.qr.timestamp"),
            t("docs.compliance.invoice.qr.total"),
            t("docs.compliance.invoice.qr.vat"),
          ]}
        />
        <p>{rich(t("docs.compliance.invoice.conditions"), tags)}</p>
      </DocSection>

      <DocSection heading={t("docs.compliance.phase2.heading")}>
        <p>{rich(t("docs.compliance.phase2.body"), tags)}</p>
        <DocList
          items={[
            t("docs.compliance.phase2.noXml"),
            t("docs.compliance.phase2.noStamp"),
            t("docs.compliance.phase2.noFatoora"),
          ]}
        />
        <p>{t("docs.compliance.phase2.action")}</p>
      </DocSection>

      <DocSection heading={t("docs.compliance.pdpl.heading")}>
        <p>{rich(t("docs.compliance.pdpl.body"), tags)}</p>
        <p>{t("docs.compliance.pdpl.supports")}</p>
        <DocList
          items={[
            t("docs.compliance.pdpl.edit"),
            t("docs.compliance.pdpl.rbac"),
            t("docs.compliance.pdpl.isolation"),
            t("docs.compliance.pdpl.audit"),
          ]}
        />
        <p>{t("docs.compliance.pdpl.notProvided")}</p>
        <p>{t("docs.compliance.pdpl.hosting")}</p>
      </DocSection>

      <DocSection heading={t("docs.compliance.otherRegimes.heading")}>
        <p>{t("docs.compliance.otherRegimes.body")}</p>
      </DocSection>

      <DocSection heading={t("docs.compliance.questions.heading")}>
        <p>{rich(t("docs.compliance.questions.body"), tags)}</p>
      </DocSection>
    </DocPage>
  );
}

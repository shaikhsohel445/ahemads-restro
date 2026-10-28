"use client";

import { DocCode, DocList, DocPage, DocSection } from "@/components/marketing/doc-page";
import { inlineCode, linkTo, rich, strong } from "@/components/marketing/rich-text";
import { useI18n } from "@/lib/i18n/context";

// Code samples are not translated: they are literal requests.
const INTEGRATION_ROUTES = `GET  /locations                                      (scope: locations:read)
GET  /locations/:branchId/menu                       (scope: menu:read)
GET  /locations/:branchId/delivery-quote?pincode=…   (scope: menu:read)
POST /locations/:branchId/orders                     (scope: orders:write)
GET  /locations/:branchId/orders/:id                 (scope: orders:read)
POST /locations/:branchId/reservations               (scope: reservations:write)
GET  /locations/:branchId/reservations/:id           (scope: reservations:read)`;

const ORDER_SAMPLE = `curl -X POST https://your-domain/api/v1/integrations/locations/<branchId>/orders \\
  -H "Authorization: Bearer ordr_ext_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "type": "TAKEAWAY",
    "customerName": "Sara Ahmed",
    "customerPhone": "+966500000000",
    "items": [{ "menuItemId": "...", "quantity": 2 }]
  }'`;

const RESERVATION_SAMPLE = `curl -X POST https://your-domain/api/v1/integrations/locations/<branchId>/reservations \\
  -H "Authorization: Bearer ordr_ext_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "customerName": "Sara Ahmed",
    "phone": "+966500000000",
    "guestCount": 4,
    "reservedAt": "2026-11-05T19:00:00+03:00"
  }'`;

export function ApiDocsContent() {
  const { t } = useI18n();
  const tags = { b: strong, code: inlineCode, mcp: linkTo("https://modelcontextprotocol.io", true) };

  return (
    <DocPage title={t("docs.api.title")} updated="2026-10-29">
      <DocSection heading={t("docs.api.overview.heading")}>
        <p>{rich(t("docs.api.overview.intro"), tags)}</p>
        <DocList
          items={[
            rich(t("docs.api.overview.rest"), tags),
            rich(t("docs.api.overview.mcp"), tags),
            rich(t("docs.api.overview.integration"), tags),
          ]}
        />
      </DocSection>

      <DocSection heading={t("docs.api.reference.heading")}>
        <p>{rich(t("docs.api.reference.body"), { ...tags, swagger: linkTo("/api/docs") })}</p>
        <p>{rich(t("docs.api.reference.availability"), tags)}</p>
        <p>{rich(t("docs.api.reference.cookie"), tags)}</p>
      </DocSection>

      <DocSection heading={t("docs.api.mcp.heading")}>
        <p>{rich(t("docs.api.mcp.body"), tags)}</p>
        <DocList
          items={[
            rich(t("docs.api.mcp.tools.general"), tags),
            rich(t("docs.api.mcp.tools.orders"), tags),
            rich(t("docs.api.mcp.tools.reservations"), tags),
            rich(t("docs.api.mcp.tools.menu"), tags),
            rich(t("docs.api.mcp.tools.tables"), tags),
            rich(t("docs.api.mcp.tools.delivery"), tags),
            rich(t("docs.api.mcp.tools.staff"), tags),
            rich(t("docs.api.mcp.tools.finance"), tags),
          ]}
        />
        <p>{t("docs.api.mcp.limits")}</p>
      </DocSection>

      <DocSection heading={t("docs.api.integration.heading")}>
        <p>{rich(t("docs.api.integration.body"), tags)}</p>
        <DocCode>{INTEGRATION_ROUTES}</DocCode>
        <p>{t("docs.api.integration.orderExample")}</p>
        <DocCode>{ORDER_SAMPLE}</DocCode>
        <p>{t("docs.api.integration.reservationExample")}</p>
        <DocCode>{RESERVATION_SAMPLE}</DocCode>
      </DocSection>

      <DocSection heading={t("docs.api.security.heading")}>
        <DocList
          items={[
            t("docs.api.security.integrationKeys"),
            t("docs.api.security.personalKeys"),
            t("docs.api.security.shownOnce"),
            t("docs.api.security.revoke"),
            t("docs.api.security.audit"),
          ]}
        />
      </DocSection>
    </DocPage>
  );
}

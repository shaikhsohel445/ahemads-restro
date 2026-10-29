"use client";

import { Bell, Building2, Globe, ImagePlus, ReceiptText, Store, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  DEFAULT_REGION,
  RESTAURANT_NAME_MAX_LENGTH,
  TAX_REGIME_PRESETS,
  TAX_REGIMES,
  isSaudiVatNumber,
  type TaxMode,
  type TaxRegime,
} from "@ahemads-restro/types";
import { KioskCard } from "@/components/settings/kiosk-card";
import { PrinterDiagnosticsCard } from "@/components/settings/printer-diagnostics-card";
import {
  SaveBar,
  SettingsBody,
  SettingsCallout,
  SettingsField,
  SettingsGroupTitle,
  SettingsRow,
  SettingsSection,
} from "@/components/settings/settings-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusPill } from "@/components/ui/status-pill";
import { Switch } from "@/components/ui/switch";
import { useBranch } from "@/hooks/use-branch";
import { useNotificationMute } from "@/hooks/use-notification-mute";
import {
  useSettings,
  useUpdateBranchSettings,
  useUpdateRestaurantSettings,
  useUploadRestaurantLogo,
  type BranchSettings,
  type RestaurantSettings,
} from "@/hooks/use-settings";
import { ApiError } from "@/lib/api";
import { useI18n } from "@/lib/i18n/context";

// Currencies offered in the picker. SAR is the default for the Saudi
// edition; a restaurant already on a currency outside this list keeps it
// (it is added to the options at render time).
const CURRENCIES = ["SAR", "AED", "BHD", "KWD", "OMR", "QAR", "EGP", "JOD", "USD", "EUR", "GBP", "INR"];

// Saudi VAT first, then the rest in the shared order.
const ORDERED_TAX_REGIMES: TaxRegime[] = [
  "SA_VAT",
  ...TAX_REGIMES.filter((regime) => regime !== "SA_VAT"),
];

export default function SettingsPage() {
  const { branchId } = useBranch();
  const { data, isLoading } = useSettings(branchId);

  return (
    <>
      {isLoading || !data ? (
        <>
          <Skeleton className="h-[28rem] rounded-2xl" />
          <Skeleton className="h-[28rem] rounded-2xl" />
        </>
      ) : (
        <GeneralSettingsForm
          key={`${data.restaurant.id}-${data.branch.id}`}
          restaurant={data.restaurant}
          branch={data.branch}
          branchId={branchId}
        />
      )}

      {data && <OnlineOrdersCard key={data.branch.id} branchId={branchId} branch={data.branch} />}

      {data && <KioskCard key={`kiosk-${data.branch.id}`} branchId={branchId} branch={data.branch} />}

      <NotificationSettingsCard />

      <PrinterDiagnosticsCard />
    </>
  );
}

function OnlineOrdersCard({
  branchId,
  branch,
}: {
  branchId: string | null;
  branch: { autoConfirmOrders: boolean; autoConfirmReservations: boolean };
}) {
  const { t } = useI18n();
  const update = useUpdateBranchSettings(branchId);
  const save = (dto: { autoConfirmOrders?: boolean; autoConfirmReservations?: boolean }) =>
    update.mutate(dto, {
      onSuccess: () => toast.success(t("common.saved")),
      onError: (err) => toast.error(err instanceof Error ? err.message : t("settings.saveFailed")),
    });

  return (
    <SettingsSection
      id="online"
      icon={Globe}
      title={t("settings.online.title")}
      description={t("settings.online.description")}
    >
      <SettingsBody>
        <SettingsRow
          htmlFor="auto-confirm-orders"
          label={t("settings.online.autoOrders")}
          help={t("settings.online.autoOrdersHelp")}
        >
          <Switch
            id="auto-confirm-orders"
            checked={branch.autoConfirmOrders}
            disabled={update.isPending}
            onCheckedChange={(v) => save({ autoConfirmOrders: v })}
          />
        </SettingsRow>
        <SettingsRow
          htmlFor="auto-confirm-bookings"
          label={t("settings.online.autoBookings")}
          help={t("settings.online.autoBookingsHelp")}
        >
          <Switch
            id="auto-confirm-bookings"
            checked={branch.autoConfirmReservations}
            disabled={update.isPending}
            onCheckedChange={(v) => save({ autoConfirmReservations: v })}
          />
        </SettingsRow>
      </SettingsBody>
    </SettingsSection>
  );
}

function NotificationSettingsCard() {
  const { t } = useI18n();
  const [muted, toggleMuted] = useNotificationMute();

  return (
    <SettingsSection
      id="notifications"
      icon={Bell}
      title={t("settings.notifications.title")}
      description={t("settings.notifications.description")}
    >
      <SettingsBody>
        <SettingsRow
          htmlFor="notification-sound"
          label={t("settings.notifications.sound")}
          help={t("settings.notifications.soundHelp")}
        >
          <Switch id="notification-sound" checked={!muted} onCheckedChange={() => toggleMuted()} />
        </SettingsRow>
      </SettingsBody>
    </SettingsSection>
  );
}

/** Input with a short unit (currency code) on its inline-start side. */
function UnitInput({ unit, ...props }: React.ComponentProps<typeof Input> & { unit: string }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-xs font-medium text-muted-foreground">
        {unit}
      </span>
      <Input {...props} className="ps-12 tabular-nums" />
    </div>
  );
}

function GeneralSettingsForm({
  restaurant,
  branch,
  branchId,
}: {
  restaurant: RestaurantSettings;
  branch: BranchSettings;
  branchId: string | null;
}) {
  const { t } = useI18n();
  const [name, setName] = useState(restaurant.name);
  const [legalName, setLegalName] = useState(restaurant.legalName ?? "");
  const [logoUrl, setLogoUrl] = useState<string | null>(restaurant.logoUrl);
  const [currency, setCurrency] = useState(restaurant.currency || DEFAULT_REGION.currency);
  const [timezone, setTimezone] = useState(restaurant.timezone || DEFAULT_REGION.timezone);
  const [upiVpa, setUpiVpa] = useState(restaurant.upiVpa ?? "");
  const [upiPayeeName, setUpiPayeeName] = useState(restaurant.upiPayeeName ?? "");
  const [loyaltyPointValue, setLoyaltyPointValue] = useState(restaurant.loyaltyPointValue);
  const [loyaltyEarnPerCurrency, setLoyaltyEarnPerCurrency] = useState(
    String(restaurant.loyaltyEarnPerCurrency),
  );
  const logoInputRef = useRef<HTMLInputElement>(null);
  const uploadLogo = useUploadRestaurantLogo();

  const [branchName, setBranchName] = useState(branch.name);
  const [address, setAddress] = useState(branch.address ?? "");
  const [phone, setPhone] = useState(branch.phone ?? "");
  const [gstNumber, setGstNumber] = useState(branch.gstNumber ?? "");
  const [country, setCountry] = useState(branch.country);
  const [taxRegime, setTaxRegime] = useState<TaxRegime>(branch.taxRegime);
  const [taxMode, setTaxMode] = useState<TaxMode>(branch.taxMode);
  const [taxLabel, setTaxLabel] = useState(branch.taxLabel ?? "");
  const [taxId, setTaxId] = useState(branch.taxId ?? "");

  const preset = TAX_REGIME_PRESETS[taxRegime];
  const isSaudiVat = taxRegime === "SA_VAT";
  const vatNumberInvalid = isSaudiVat && taxId.trim() !== "" && !isSaudiVatNumber(taxId);
  const vatNumberValid = isSaudiVat && taxId.trim() !== "" && !vatNumberInvalid;
  const currencyOptions = CURRENCIES.includes(currency) ? CURRENCIES : [currency, ...CURRENCIES];

  const updateRestaurant = useUpdateRestaurantSettings(branchId);
  const updateBranch = useUpdateBranchSettings(branchId);

  const onSubmitRestaurant = (e: React.FormEvent) => {
    e.preventDefault();
    updateRestaurant.mutate(
      {
        name,
        legalName: legalName || undefined,
        logoUrl,
        currency,
        timezone,
        upiVpa: upiVpa.trim() || null,
        upiPayeeName: upiPayeeName.trim() || null,
        loyaltyPointValue: Number(loyaltyPointValue) || 0,
        loyaltyEarnPerCurrency: Number(loyaltyEarnPerCurrency) || 1,
      },
      {
        onSuccess: () => toast.success(t("settings.restaurant.savedToast")),
        onError: (err) => toast.error(err instanceof ApiError ? err.message : t("settings.saveFailed")),
      },
    );
  };

  const onSubmitBranch = (e: React.FormEvent) => {
    e.preventDefault();
    updateBranch.mutate(
      {
        name: branchName,
        address: address || undefined,
        phone: phone || undefined,
        gstNumber: gstNumber || undefined,
        country,
        taxRegime,
        taxMode,
        taxLabel: taxLabel || null,
        taxId: taxId || null,
      },
      {
        onSuccess: () => toast.success(t("settings.branch.savedToast")),
        onError: (err) => toast.error(err instanceof ApiError ? err.message : t("settings.saveFailed")),
      },
    );
  };

  const onRegimeChange = (value: TaxRegime | null) => {
    if (!value) return;
    setTaxRegime(value);
    // Switching regimes resets to that regime's own mode/country by
    // default — a picker that silently kept the old mode would quietly
    // mis-price every item on this branch (see settings.service.ts).
    setTaxMode(TAX_REGIME_PRESETS[value].defaultMode);
    setCountry(TAX_REGIME_PRESETS[value].defaultCountry);
  };

  return (
    <>
      <SettingsSection
        id="restaurant"
        icon={Store}
        title={t("settings.restaurant.title")}
        description={t("settings.restaurant.description")}
      >
        <form onSubmit={onSubmitRestaurant}>
          <SettingsBody>
            <SettingsField label={t("settings.restaurant.logo")} help={t("settings.restaurant.logoHelp")}>
              <div className="flex items-center gap-4">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    uploadLogo.mutate(file, {
                      onSuccess: (res) => setLogoUrl(res.url),
                      onError: (err) =>
                        toast.error(err instanceof ApiError ? err.message : t("settings.restaurant.logoUploadFailed")),
                    });
                  }}
                />
                {logoUrl ? (
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl border border-border/80 bg-surface-2">
                    {/* eslint-disable-next-line @next/next/no-img-element -- uploaded asset served from the backend, not a Next-optimizable remote source */}
                    <img src={logoUrl} alt="" className="size-full object-contain p-1.5" />
                    <button
                      type="button"
                      onClick={() => {
                        setLogoUrl(null);
                        if (logoInputRef.current) logoInputRef.current.value = "";
                      }}
                      className="absolute end-1 top-1 flex size-6 items-center justify-center rounded-full bg-card/90 text-foreground shadow-sm ring-1 ring-border/70 hover:bg-card"
                      aria-label={t("settings.restaurant.removeLogo")}
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={uploadLogo.isPending}
                    className="flex size-20 shrink-0 flex-col items-center justify-center gap-1.5 rounded-2xl border border-dashed border-border bg-surface-2/60 text-muted-foreground transition-colors hover:border-primary hover:bg-accent hover:text-primary disabled:opacity-60"
                  >
                    <ImagePlus className="size-5" />
                    <span className="text-[11px] font-medium">
                      {uploadLogo.isPending ? t("settings.uploading") : t("common.upload")}
                    </span>
                  </button>
                )}
              </div>
            </SettingsField>

            <SettingsField label={t("common.name")} htmlFor="r-name">
              <Input
                id="r-name"
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, RESTAURANT_NAME_MAX_LENGTH))}
                maxLength={RESTAURANT_NAME_MAX_LENGTH}
                required
              />
              <p className="text-end text-xs text-muted-foreground tabular-nums">
                {name.length}/{RESTAURANT_NAME_MAX_LENGTH}
              </p>
            </SettingsField>

            <SettingsField label={t("settings.restaurant.legalName")} htmlFor="r-legal">
              <Input id="r-legal" value={legalName} onChange={(e) => setLegalName(e.target.value)} />
            </SettingsField>

            <SettingsField label={t("settings.restaurant.currency")} htmlFor="r-currency">
              <Select value={currency} onValueChange={(v) => v && setCurrency(v)}>
                <SelectTrigger id="r-currency" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencyOptions.map((code) => (
                    <SelectItem key={code} value={code}>
                      {t(`settings.currency.${code}`) === `settings.currency.${code}`
                        ? code
                        : `${code} — ${t(`settings.currency.${code}`)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SettingsField>

            <SettingsField
              label={t("settings.restaurant.timezone")}
              htmlFor="r-timezone"
              help={t("settings.restaurant.timezoneHelp")}
            >
              <Input
                id="r-timezone"
                dir="ltr"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                placeholder={DEFAULT_REGION.timezone}
                required
              />
            </SettingsField>

            <SettingsGroupTitle title={t("settings.loyalty.title")} description={t("settings.loyalty.description")} />
            <SettingsField label={t("settings.loyalty.earnPer")} htmlFor="r-loyalty-earn">
              <UnitInput
                unit={currency}
                id="r-loyalty-earn"
                type="number"
                min="1"
                step="1"
                value={loyaltyEarnPerCurrency}
                onChange={(e) => setLoyaltyEarnPerCurrency(e.target.value)}
                required
              />
            </SettingsField>
            <SettingsField label={t("settings.loyalty.redeemsFor")} htmlFor="r-loyalty-value">
              <UnitInput
                unit={currency}
                id="r-loyalty-value"
                type="number"
                min="0"
                step="0.01"
                value={loyaltyPointValue}
                onChange={(e) => setLoyaltyPointValue(e.target.value)}
                required
              />
            </SettingsField>

            <SettingsGroupTitle title={t("settings.payments.title")} />
            <SettingsField label={t("settings.upi.id")} htmlFor="r-upi" help={t("settings.upi.help")}>
              <Input
                id="r-upi"
                value={upiVpa}
                onChange={(e) => setUpiVpa(e.target.value)}
                placeholder="yourshop@okbank"
                autoComplete="off"
                dir="ltr"
              />
            </SettingsField>
            <SettingsField label={t("settings.upi.payeeName")} htmlFor="r-upi-name">
              <Input
                id="r-upi-name"
                value={upiPayeeName}
                onChange={(e) => setUpiPayeeName(e.target.value)}
                placeholder={name}
                maxLength={60}
              />
            </SettingsField>
          </SettingsBody>
          <SaveBar hint={t("settings.restaurant.saveHint")}>
            <Button type="submit" disabled={updateRestaurant.isPending}>
              {updateRestaurant.isPending ? t("common.saving") : t("settings.restaurant.save")}
            </Button>
          </SaveBar>
        </form>
      </SettingsSection>

      <SettingsSection
        id="branch"
        icon={Building2}
        title={t("settings.nav.branchTax")}
        description={t("settings.branch.description")}
        actions={
          isSaudiVat ? (
            <StatusPill tone={vatNumberValid ? "success" : vatNumberInvalid ? "warning" : "neutral"}>
              {t("settings.taxRegime.SA_VAT.name")}
            </StatusPill>
          ) : null
        }
      >
        <form onSubmit={onSubmitBranch}>
          <SettingsBody>
            <SettingsGroupTitle title={t("settings.branch.title")} />
            <SettingsField label={t("settings.branch.name")} htmlFor="b-name">
              <Input id="b-name" value={branchName} onChange={(e) => setBranchName(e.target.value)} required />
            </SettingsField>
            <SettingsField label={t("common.address")} htmlFor="b-address">
              <Input id="b-address" value={address} onChange={(e) => setAddress(e.target.value)} />
            </SettingsField>
            <SettingsField label={t("common.phone")} htmlFor="b-phone">
              <Input id="b-phone" dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </SettingsField>
            <SettingsField label={t("settings.branch.gstLegacy")} htmlFor="b-gst">
              <Input id="b-gst" dir="ltr" value={gstNumber} onChange={(e) => setGstNumber(e.target.value)} />
            </SettingsField>

            <SettingsGroupTitle title={t("common.tax")} description={t("settings.tax.description")} />
            <SettingsField
              label={t("settings.tax.regime")}
              htmlFor="b-tax-regime"
              help={t("settings.tax.ratesHint", { rates: t(`settings.taxRegime.${taxRegime}.rates`) })}
            >
              <Select value={taxRegime} onValueChange={onRegimeChange}>
                <SelectTrigger id="b-tax-regime" className="w-full">
                  <SelectValue>
                    {(value: TaxRegime | null) => (value ? t(`settings.taxRegime.${value}.name`) : "")}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {ORDERED_TAX_REGIMES.map((regime) => (
                    <SelectItem key={regime} value={regime}>
                      {t(`settings.taxRegime.${regime}.name`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {preset.zatcaSimplifiedInvoice && (
                <SettingsCallout icon={ReceiptText} tone="gold" className="mt-1 text-xs">
                  <p>{t("settings.tax.zatcaInvoiceNote")}</p>
                  <p>{t("settings.tax.zatcaPhase2Note")}</p>
                </SettingsCallout>
              )}
            </SettingsField>
            <SettingsField label={t("settings.tax.pricesAre")} htmlFor="b-tax-mode">
              <Select value={taxMode} onValueChange={(v) => setTaxMode(v as TaxMode)}>
                <SelectTrigger id="b-tax-mode" className="w-full">
                  <SelectValue>
                    {(value: TaxMode | null) => (value ? t(`settings.taxMode.${value}`) : "")}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INCLUSIVE">{t("settings.taxMode.INCLUSIVE")}</SelectItem>
                  <SelectItem value="EXCLUSIVE">{t("settings.taxMode.EXCLUSIVE")}</SelectItem>
                </SelectContent>
              </Select>
            </SettingsField>
            <SettingsField label={t("settings.branch.countryCode")} htmlFor="b-country">
              <Input
                id="b-country"
                dir="ltr"
                value={country}
                onChange={(e) => setCountry(e.target.value.toUpperCase())}
                maxLength={2}
                className="w-24 font-mono uppercase"
              />
            </SettingsField>
            <SettingsField
              label={t(`settings.taxRegime.${taxRegime}.taxIdLabel`)}
              htmlFor="b-tax-id"
              help={isSaudiVat ? t("settings.tax.vatNumberHelp") : undefined}
              error={vatNumberInvalid ? t("settings.tax.vatNumberInvalid") : undefined}
            >
              <Input
                id="b-tax-id"
                dir="ltr"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                inputMode={isSaudiVat ? "numeric" : undefined}
                maxLength={isSaudiVat ? 15 : undefined}
                placeholder={isSaudiVat ? "3XXXXXXXXXXXXX3" : undefined}
                aria-invalid={vatNumberInvalid || undefined}
                className="font-mono tracking-wide tabular-nums"
              />
            </SettingsField>
            <SettingsField label={t("settings.tax.labelOverride")} htmlFor="b-tax-label">
              <Input
                id="b-tax-label"
                value={taxLabel}
                onChange={(e) => setTaxLabel(e.target.value)}
                placeholder={preset.taxLabel}
              />
            </SettingsField>
          </SettingsBody>
          <SaveBar hint={t("settings.branch.saveHint")}>
            <Button type="submit" disabled={updateBranch.isPending}>
              {updateBranch.isPending ? t("common.saving") : t("settings.branch.save")}
            </Button>
          </SaveBar>
        </form>
      </SettingsSection>
    </>
  );
}

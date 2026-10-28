"use client";

import { ImagePlus, X } from "lucide-react";
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
} from "@nodedr-restaurant/types";
import { KioskCard } from "@/components/settings/kiosk-card";
import { PrinterDiagnosticsCard } from "@/components/settings/printer-diagnostics-card";
import { SettingsTabs } from "@/components/settings/settings-tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
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
  const { t } = useI18n();
  const { branchId } = useBranch();
  const { data, isLoading } = useSettings(branchId);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[32px] font-semibold tracking-tight text-foreground">{t("settings.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("settings.subtitle")}</p>
      </div>

      <SettingsTabs />

      {isLoading || !data ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
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
    </div>
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
    <Card className="flex flex-col gap-4 p-6">
      <div>
        <h2 className="text-[18px] font-medium text-foreground">{t("settings.online.title")}</h2>
        <p className="text-sm text-muted-foreground">{t("settings.online.description")}</p>
      </div>
      <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
        <div className="flex flex-col gap-0.5">
          <Label htmlFor="auto-confirm-orders">{t("settings.online.autoOrders")}</Label>
          <p className="text-xs text-muted-foreground">{t("settings.online.autoOrdersHelp")}</p>
        </div>
        <Switch
          id="auto-confirm-orders"
          checked={branch.autoConfirmOrders}
          disabled={update.isPending}
          onCheckedChange={(v) => save({ autoConfirmOrders: v })}
        />
      </div>
      <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
        <div className="flex flex-col gap-0.5">
          <Label htmlFor="auto-confirm-bookings">{t("settings.online.autoBookings")}</Label>
          <p className="text-xs text-muted-foreground">{t("settings.online.autoBookingsHelp")}</p>
        </div>
        <Switch
          id="auto-confirm-bookings"
          checked={branch.autoConfirmReservations}
          disabled={update.isPending}
          onCheckedChange={(v) => save({ autoConfirmReservations: v })}
        />
      </div>
    </Card>
  );
}

function NotificationSettingsCard() {
  const { t } = useI18n();
  const [muted, toggleMuted] = useNotificationMute();

  return (
    <Card className="flex flex-col gap-4 p-6">
      <div>
        <h2 className="text-[18px] font-medium text-foreground">{t("settings.notifications.title")}</h2>
        <p className="text-sm text-muted-foreground">{t("settings.notifications.description")}</p>
      </div>
      <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
        <div className="flex flex-col gap-0.5">
          <Label htmlFor="notification-sound">{t("settings.notifications.sound")}</Label>
          <p className="text-xs text-muted-foreground">{t("settings.notifications.soundHelp")}</p>
        </div>
        <Switch
          id="notification-sound"
          checked={!muted}
          onCheckedChange={() => toggleMuted()}
        />
      </div>
    </Card>
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
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card className="flex flex-col gap-4 p-6">
        <h2 className="text-[18px] font-medium text-foreground">{t("settings.restaurant.title")}</h2>
        <form onSubmit={onSubmitRestaurant} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>{t("settings.restaurant.logo")}</Label>
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
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-secondary">
                  {/* eslint-disable-next-line @next/next/no-img-element -- uploaded asset served from the backend, not a Next-optimizable remote source */}
                  <img src={logoUrl} alt="" className="h-full w-full object-contain" />
                  <button
                    type="button"
                    onClick={() => {
                      setLogoUrl(null);
                      if (logoInputRef.current) logoInputRef.current.value = "";
                    }}
                    className="absolute end-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-background/80 text-foreground"
                    aria-label={t("settings.restaurant.removeLogo")}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploadLogo.isPending}
                  className="flex h-16 w-16 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary"
                >
                  <ImagePlus className="h-4 w-4" />
                  <span className="text-[10px]">
                    {uploadLogo.isPending ? t("settings.uploading") : t("common.upload")}
                  </span>
                </button>
              )}
              <p className="text-xs text-muted-foreground">
                {t("settings.restaurant.logoHelp")}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="r-name">{t("common.name")}</Label>
            <Input
              id="r-name"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, RESTAURANT_NAME_MAX_LENGTH))}
              maxLength={RESTAURANT_NAME_MAX_LENGTH}
              required
            />
            <p className="text-end text-xs text-muted-foreground">
              {name.length}/{RESTAURANT_NAME_MAX_LENGTH}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="r-legal">{t("settings.restaurant.legalName")}</Label>
            <Input id="r-legal" value={legalName} onChange={(e) => setLegalName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="r-currency">{t("settings.restaurant.currency")}</Label>
              <Select value={currency} onValueChange={(v) => v && setCurrency(v)}>
                <SelectTrigger id="r-currency">
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
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="r-timezone">{t("settings.restaurant.timezone")}</Label>
              <Input
                id="r-timezone"
                dir="ltr"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                placeholder={DEFAULT_REGION.timezone}
                required
              />
              <p className="text-xs text-muted-foreground">{t("settings.restaurant.timezoneHelp")}</p>
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-border pt-4">
            <h3 className="text-sm font-medium text-foreground">{t("settings.loyalty.title")}</h3>
            <p className="text-xs text-muted-foreground">{t("settings.loyalty.description")}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="r-loyalty-earn">{t("settings.loyalty.earnPer")}</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{currency}</span>
                <Input
                  id="r-loyalty-earn"
                  type="number"
                  min="1"
                  step="1"
                  value={loyaltyEarnPerCurrency}
                  onChange={(e) => setLoyaltyEarnPerCurrency(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="r-loyalty-value">{t("settings.loyalty.redeemsFor")}</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{currency}</span>
                <Input
                  id="r-loyalty-value"
                  type="number"
                  min="0"
                  step="0.01"
                  value={loyaltyPointValue}
                  onChange={(e) => setLoyaltyPointValue(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="r-upi">{t("settings.upi.id")}</Label>
              <Input
                id="r-upi"
                value={upiVpa}
                onChange={(e) => setUpiVpa(e.target.value)}
                placeholder="yourshop@okbank"
                autoComplete="off"
                dir="ltr"
              />
              <p className="text-xs text-muted-foreground">
                {t("settings.upi.help")}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="r-upi-name">{t("settings.upi.payeeName")}</Label>
              <Input
                id="r-upi-name"
                value={upiPayeeName}
                onChange={(e) => setUpiPayeeName(e.target.value)}
                placeholder={name}
                maxLength={60}
              />
            </div>
          </div>

          <Button type="submit" disabled={updateRestaurant.isPending} className="self-start">
            {updateRestaurant.isPending ? t("common.saving") : t("settings.restaurant.save")}
          </Button>
        </form>
      </Card>

      <Card className="flex flex-col gap-4 p-6">
        <h2 className="text-[18px] font-medium text-foreground">{t("settings.branch.title")}</h2>
        <form onSubmit={onSubmitBranch} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="b-name">{t("settings.branch.name")}</Label>
            <Input id="b-name" value={branchName} onChange={(e) => setBranchName(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="b-address">{t("common.address")}</Label>
            <Input id="b-address" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="b-phone">{t("common.phone")}</Label>
              <Input id="b-phone" dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="b-gst">{t("settings.branch.gstLegacy")}</Label>
              <Input id="b-gst" dir="ltr" value={gstNumber} onChange={(e) => setGstNumber(e.target.value)} />
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-border pt-4">
            <h3 className="text-sm font-medium text-foreground">{t("common.tax")}</h3>
            <p className="text-xs text-muted-foreground">{t("settings.tax.description")}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="b-tax-regime">{t("settings.tax.regime")}</Label>
              <Select value={taxRegime} onValueChange={onRegimeChange}>
                <SelectTrigger id="b-tax-regime">
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
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="b-tax-mode">{t("settings.tax.pricesAre")}</Label>
              <Select value={taxMode} onValueChange={(v) => setTaxMode(v as TaxMode)}>
                <SelectTrigger id="b-tax-mode">
                  <SelectValue>
                    {(value: TaxMode | null) => (value ? t(`settings.taxMode.${value}`) : "")}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INCLUSIVE">{t("settings.taxMode.INCLUSIVE")}</SelectItem>
                  <SelectItem value="EXCLUSIVE">{t("settings.taxMode.EXCLUSIVE")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {t("settings.tax.ratesHint", { rates: t(`settings.taxRegime.${taxRegime}.rates`) })}
          </p>
          {preset.zatcaSimplifiedInvoice && (
            <div className="flex flex-col gap-1 rounded-lg bg-secondary px-3 py-2 text-xs text-muted-foreground">
              <p>{t("settings.tax.zatcaInvoiceNote")}</p>
              <p>{t("settings.tax.zatcaPhase2Note")}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="b-country">{t("settings.branch.countryCode")}</Label>
              <Input
                id="b-country"
                dir="ltr"
                value={country}
                onChange={(e) => setCountry(e.target.value.toUpperCase())}
                maxLength={2}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="b-tax-id">{t(`settings.taxRegime.${taxRegime}.taxIdLabel`)}</Label>
              <Input
                id="b-tax-id"
                dir="ltr"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                inputMode={isSaudiVat ? "numeric" : undefined}
                maxLength={isSaudiVat ? 15 : undefined}
                placeholder={isSaudiVat ? "3XXXXXXXXXXXXX3" : undefined}
                aria-invalid={vatNumberInvalid || undefined}
              />
              {isSaudiVat && (
                <p className={vatNumberInvalid ? "text-xs text-warning" : "text-xs text-muted-foreground"}>
                  {vatNumberInvalid ? t("settings.tax.vatNumberInvalid") : t("settings.tax.vatNumberHelp")}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="b-tax-label">{t("settings.tax.labelOverride")}</Label>
            <Input
              id="b-tax-label"
              value={taxLabel}
              onChange={(e) => setTaxLabel(e.target.value)}
              placeholder={preset.taxLabel}
            />
          </div>

          <Button type="submit" disabled={updateBranch.isPending} className="self-start">
            {updateBranch.isPending ? t("common.saving") : t("settings.branch.save")}
          </Button>
        </form>
      </Card>
    </div>
  );
}

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterDto } from "@nodedr-restaurant/types";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { useRegister } from "@/hooks/use-auth";
import { ApiError } from "@/lib/api";
import { useI18n } from "@/lib/i18n/context";

export default function SignupPage() {
  const router = useRouter();
  const register = useRegister();
  const prefersReducedMotion = useReducedMotion();
  const { t } = useI18n();
  const {
    register: field,
    handleSubmit,
    getFieldState,
    setValue,
    formState: { errors },
  } = useForm<RegisterDto>({ resolver: zodResolver(registerSchema) });

  // The suggested first-branch name follows the UI language until the user
  // types their own (the saved language only loads after the first render).
  useEffect(() => {
    if (!getFieldState("branchName").isDirty) setValue("branchName", t("auth.signup.branchDefault"));
  }, [t, getFieldState, setValue]);

  const onSubmit = (dto: RegisterDto) => {
    register.mutate(dto, {
      onSuccess: () => router.push("/dashboard"),
      onError: (err) => {
        toast.error(err instanceof ApiError ? err.message : t("errors.generic"));
      },
    });
  };

  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden bg-background px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(50%_50%_at_50%_0%,color-mix(in_oklch,var(--primary),transparent_90%),transparent)]"
      />
      <div className="absolute end-4 top-4">
        <LanguageSwitcher compact />
      </div>
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm"
      >
        <div className="mb-10 flex flex-col items-center gap-2 text-center">
          <Link href="/">
            <Logo size={44} />
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Nodedr OrderRestro
          </h1>
          <p className="text-sm text-muted-foreground">{t("auth.signup.subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="restaurantName">{t("auth.signup.restaurantName")}</Label>
            <Input
              id="restaurantName"
              autoComplete="organization"
              placeholder={t("auth.signup.restaurantNamePlaceholder")}
              {...field("restaurantName")}
            />
            {errors.restaurantName && (
              <p className="text-xs text-destructive">{t("auth.validation.required")}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="branchName">{t("auth.signup.branchName")}</Label>
            <Input
              id="branchName"
              placeholder={t("auth.signup.branchDefault")}
              {...field("branchName")}
            />
            {errors.branchName && (
              <p className="text-xs text-destructive">{t("auth.validation.required")}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="ownerName">{t("auth.signup.ownerName")}</Label>
            <Input
              id="ownerName"
              autoComplete="name"
              placeholder={t("auth.signup.ownerNamePlaceholder")}
              {...field("ownerName")}
            />
            {errors.ownerName && (
              <p className="text-xs text-destructive">{t("auth.validation.required")}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">{t("common.email")}</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@restaurant.com"
              {...field("email")}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{t("auth.validation.email")}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password">{t("auth.password")}</Label>
            <PasswordInput
              id="password"
              
              autoComplete="new-password"
              placeholder={t("auth.signup.passwordPlaceholder")}
              {...field("password")}
            />
            {errors.password && (
              <p className="text-xs text-destructive">{t("auth.validation.password")}</p>
            )}
          </div>

          <Button type="submit" className="mt-2 h-11" disabled={register.isPending}>
            {register.isPending ? t("auth.signup.submitting") : t("auth.signup.submit")}
          </Button>
        </form>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          {t("auth.signup.haveAccount")}{" "}
          <Link href="/login" className="font-medium text-foreground hover:underline">
            {t("auth.login.submit")}
          </Link>
        </p>
      </motion.div>
    </main>
  );
}

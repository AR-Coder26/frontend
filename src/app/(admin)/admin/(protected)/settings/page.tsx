"use client";

import { useEffect, useState } from "react";
import {
  useForm,
  type UseFormRegister,
  type UseFormWatch,
  type FieldErrors,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  getAdminStoreSettings,
  updateStoreSettings,
} from "@/lib/api/storeSettings";
import { changeAdminPassword } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { useAdminAuthStore } from "@/store/adminAuthStore";
import {
  storeSettingsFormSchema,
  type StoreSettingsFormValues,
} from "@/lib/validators/adminSettings";
import {
  adminChangePasswordSchema,
  type AdminChangePasswordFormValues,
} from "@/lib/validators/adminAuth";
import type { StoreSettingsAdmin } from "@/types";

export default function AdminSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<StoreSettingsFormValues>({
    resolver: zodResolver(storeSettingsFormSchema),
  });

  useEffect(() => {
    let cancelled = false;

    function applySettingsToForm(s: StoreSettingsAdmin) {
      reset({
        jazzCash: {
          accountTitle: s.jazzCash.accountTitle ?? "",
          accountNumber: s.jazzCash.accountNumber ?? "",
          instructions: s.jazzCash.instructions ?? "",
          isActive: s.jazzCash.isActive,
        },
        easyPaisa: {
          accountTitle: s.easyPaisa.accountTitle ?? "",
          accountNumber: s.easyPaisa.accountNumber ?? "",
          instructions: s.easyPaisa.instructions ?? "",
          isActive: s.easyPaisa.isActive,
        },
        bankTransfer: {
          bankName: s.bankTransfer.bankName ?? "",
          accountTitle: s.bankTransfer.accountTitle ?? "",
          accountNumber: s.bankTransfer.accountNumber ?? "",
          iban: s.bankTransfer.iban ?? "",
          instructions: s.bankTransfer.instructions ?? "",
          isActive: s.bankTransfer.isActive,
        },
        minOrderValue: s.minOrderValue,
        deliveryFlatRateNonKarachi: s.deliveryFlatRateNonKarachi,
      });
    }

    async function load() {
      setIsLoading(true);
      try {
        const settings = await getAdminStoreSettings();
        if (!cancelled) applySettingsToForm(settings);
      } catch (error) {
        if (!cancelled)
          setLoadError(
            error instanceof ApiError
              ? error.message
              : "Could not load settings.",
          );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [reset]);

  async function onSubmit(values: StoreSettingsFormValues) {
    try {
      const updated = await updateStoreSettings({
        jazzCash: {
          accountTitle: values.jazzCash.accountTitle || "",
          accountNumber: values.jazzCash.accountNumber || "",
          instructions: values.jazzCash.instructions || "",
          isActive: values.jazzCash.isActive,
        },
        easyPaisa: {
          accountTitle: values.easyPaisa.accountTitle || "",
          accountNumber: values.easyPaisa.accountNumber || "",
          instructions: values.easyPaisa.instructions || "",
          isActive: values.easyPaisa.isActive,
        },
        bankTransfer: {
          bankName: values.bankTransfer.bankName || "",
          accountTitle: values.bankTransfer.accountTitle || "",
          accountNumber: values.bankTransfer.accountNumber || "",
          iban: values.bankTransfer.iban || "",
          instructions: values.bankTransfer.instructions || "",
          isActive: values.bankTransfer.isActive,
        },
        minOrderValue: values.minOrderValue,
        deliveryFlatRateNonKarachi: values.deliveryFlatRateNonKarachi,
      });

      reset({
        jazzCash: {
          accountTitle: updated.jazzCash.accountTitle ?? "",
          accountNumber: updated.jazzCash.accountNumber ?? "",
          instructions: updated.jazzCash.instructions ?? "",
          isActive: updated.jazzCash.isActive,
        },
        easyPaisa: {
          accountTitle: updated.easyPaisa.accountTitle ?? "",
          accountNumber: updated.easyPaisa.accountNumber ?? "",
          instructions: updated.easyPaisa.instructions ?? "",
          isActive: updated.easyPaisa.isActive,
        },
        bankTransfer: {
          bankName: updated.bankTransfer.bankName ?? "",
          accountTitle: updated.bankTransfer.accountTitle ?? "",
          accountNumber: updated.bankTransfer.accountNumber ?? "",
          iban: updated.bankTransfer.iban ?? "",
          instructions: updated.bankTransfer.instructions ?? "",
          isActive: updated.bankTransfer.isActive,
        },
        minOrderValue: updated.minOrderValue,
        deliveryFlatRateNonKarachi: updated.deliveryFlatRateNonKarachi,
      });
      toast.success("Settings saved");
    } catch (error) {
      // A 400 here almost always means "isActive:true but a required field is still blank" —
      // the message already names exactly which field, per mergeAndValidateAccount's own
      // per-method requiredFields check (backend PROJECT_STATE §7.12) — shown verbatim.
      toast.error("Could not save settings", {
        description:
          error instanceof ApiError ? error.message : "Please try again.",
      });
    }
  }

  if (isLoading) {
    return (
      <div className="py-16 text-center text-sm text-neutral-500">
        Loading settings…
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="py-16 text-center text-sm text-destructive">
        {loadError}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <AdminPageHeader
        title="Store Settings"
        description="Payment methods, delivery, and minimum order value."
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <JazzCashSection register={register} watch={watch} errors={errors} />
        <EasyPaisaSection register={register} watch={watch} errors={errors} />
        <BankTransferSection
          register={register}
          watch={watch}
          errors={errors}
        />

        <section className="rounded-lg border border-neutral-200 bg-white p-6">
          <h3 className="mb-4 text-sm font-semibold text-neutral-900">
            Delivery & Orders
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="minOrderValue">Minimum Order Value (Rs.)</Label>
              <Input
                id="minOrderValue"
                type="number"
                min="0"
                {...register("minOrderValue")}
                invalid={!!errors.minOrderValue}
              />
              {errors.minOrderValue && (
                <p className="mt-1 text-xs text-destructive">
                  {errors.minOrderValue.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="deliveryFlatRateNonKarachi">
                Delivery Charge Outside Karachi (Rs.)
              </Label>
              <Input
                id="deliveryFlatRateNonKarachi"
                type="number"
                min="0"
                {...register("deliveryFlatRateNonKarachi")}
                invalid={!!errors.deliveryFlatRateNonKarachi}
              />
              <p className="mt-1 text-[11px] text-neutral-400">
                Karachi orders are always free delivery — not editable here.
              </p>
            </div>
          </div>
        </section>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : "Save Settings"}
          </Button>
        </div>
      </form>

      <div className="mt-10 border-t border-neutral-200 pt-8">
        <ChangePasswordSection />
      </div>
    </div>
  );
}

interface PaymentSectionProps {
  register: UseFormRegister<StoreSettingsFormValues>;
  watch: UseFormWatch<StoreSettingsFormValues>;
  errors: FieldErrors<StoreSettingsFormValues>;
}

/** Wallet methods (JazzCash/EasyPaisa) share the same three fields — each still has its own
 *  fully literal register() calls below rather than a generic prefix-built path, so every
 *  call site type-checks exactly against react-hook-form's Path<StoreSettingsFormValues>
 *  with no `as` casts required. */
function JazzCashSection({ register, watch, errors }: PaymentSectionProps) {
  const isActive = watch("jazzCash.isActive");
  const err = errors.jazzCash;
  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-900">JazzCash</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500">
            {isActive ? "Active" : "Inactive"}
          </span>
          <Switch {...register("jazzCash.isActive")} />
        </div>
      </div>
      {err?.isActive && (
        <p className="mb-3 text-xs text-destructive">{err.isActive.message}</p>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="jazzCash.accountTitle">Account Title</Label>
          <Input
            id="jazzCash.accountTitle"
            {...register("jazzCash.accountTitle")}
            invalid={!!err?.accountTitle}
          />
        </div>
        <div>
          <Label htmlFor="jazzCash.accountNumber">Account Number</Label>
          <Input
            id="jazzCash.accountNumber"
            {...register("jazzCash.accountNumber")}
            invalid={!!err?.accountNumber}
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="jazzCash.instructions">
            Instructions for customers (optional)
          </Label>
          <Textarea
            id="jazzCash.instructions"
            rows={2}
            {...register("jazzCash.instructions")}
          />
        </div>
      </div>
    </section>
  );
}

function EasyPaisaSection({ register, watch, errors }: PaymentSectionProps) {
  const isActive = watch("easyPaisa.isActive");
  const err = errors.easyPaisa;
  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-900">EasyPaisa</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500">
            {isActive ? "Active" : "Inactive"}
          </span>
          <Switch {...register("easyPaisa.isActive")} />
        </div>
      </div>
      {err?.isActive && (
        <p className="mb-3 text-xs text-destructive">{err.isActive.message}</p>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="easyPaisa.accountTitle">Account Title</Label>
          <Input
            id="easyPaisa.accountTitle"
            {...register("easyPaisa.accountTitle")}
            invalid={!!err?.accountTitle}
          />
        </div>
        <div>
          <Label htmlFor="easyPaisa.accountNumber">Account Number</Label>
          <Input
            id="easyPaisa.accountNumber"
            {...register("easyPaisa.accountNumber")}
            invalid={!!err?.accountNumber}
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="easyPaisa.instructions">
            Instructions for customers (optional)
          </Label>
          <Textarea
            id="easyPaisa.instructions"
            rows={2}
            {...register("easyPaisa.instructions")}
          />
        </div>
      </div>
    </section>
  );
}

function BankTransferSection({ register, watch, errors }: PaymentSectionProps) {
  const isActive = watch("bankTransfer.isActive");
  const err = errors.bankTransfer;
  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-900">
          Bank Transfer (Meezan Bank)
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500">
            {isActive ? "Active" : "Inactive"}
          </span>
          <Switch {...register("bankTransfer.isActive")} />
        </div>
      </div>
      {err?.isActive && (
        <p className="mb-3 text-xs text-destructive">{err.isActive.message}</p>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="bankTransfer.bankName">Bank Name</Label>
          <Input
            id="bankTransfer.bankName"
            {...register("bankTransfer.bankName")}
            invalid={!!err?.bankName}
          />
        </div>
        <div>
          <Label htmlFor="bankTransfer.accountTitle">Account Title</Label>
          <Input
            id="bankTransfer.accountTitle"
            {...register("bankTransfer.accountTitle")}
            invalid={!!err?.accountTitle}
          />
        </div>
        <div>
          <Label htmlFor="bankTransfer.accountNumber">Account Number</Label>
          <Input
            id="bankTransfer.accountNumber"
            {...register("bankTransfer.accountNumber")}
            invalid={!!err?.accountNumber}
          />
        </div>
        <div>
          <Label htmlFor="bankTransfer.iban">IBAN (optional)</Label>
          <Input
            id="bankTransfer.iban"
            placeholder="PK51MEZN0000300115800701"
            {...register("bankTransfer.iban")}
            invalid={!!err?.iban}
          />
          {err?.iban && (
            <p className="mt-1 text-xs text-destructive">{err.iban.message}</p>
          )}
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="bankTransfer.instructions">
            Instructions for customers (optional)
          </Label>
          <Textarea
            id="bankTransfer.instructions"
            rows={2}
            {...register("bankTransfer.instructions")}
          />
        </div>
      </div>
    </section>
  );
}

function ChangePasswordSection() {
  const router = useRouter();
  const clearAdmin = useAdminAuthStore((state) => state.clearAdmin);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AdminChangePasswordFormValues>({
    resolver: zodResolver(adminChangePasswordSchema),
  });

  async function onSubmit(values: AdminChangePasswordFormValues) {
    try {
      await changeAdminPassword(values);
      // Per lib/api/auth.ts's own doc comment: this clears session cookies server-side on
      // success, and the caller (here) is responsible for redirecting to /admin/login — the
      // server does not do it. Skipping this would leave the UI showing a "logged in" admin
      // shell against a session that's already been invalidated.
      clearAdmin();
      toast.success("Password changed — please log in again.");
      router.push("/admin/login");
    } catch (error) {
      toast.error("Could not change password", {
        description:
          error instanceof ApiError ? error.message : "Please try again.",
      });
      reset(values);
    }
  }

  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-6">
      <h3 className="mb-1 text-sm font-semibold text-neutral-900">
        Change Password
      </h3>
      <p className="mb-4 text-xs text-neutral-500">
        You&apos;ll be signed out and need to log back in afterward.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-sm space-y-4">
        <div>
          <Label htmlFor="currentPassword">Current Password</Label>
          <Input
            id="currentPassword"
            type="password"
            autoComplete="current-password"
            {...register("currentPassword")}
            invalid={!!errors.currentPassword}
          />
          {errors.currentPassword && (
            <p className="mt-1 text-xs text-destructive">
              {errors.currentPassword.message}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="newPassword">New Password</Label>
          <Input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            {...register("newPassword")}
            invalid={!!errors.newPassword}
          />
          {errors.newPassword && (
            <p className="mt-1 text-xs text-destructive">
              {errors.newPassword.message}
            </p>
          )}
        </div>
        <Button type="submit" variant="outline" disabled={isSubmitting}>
          {isSubmitting ? "Changing…" : "Change Password"}
        </Button>
      </form>
    </section>
  );
}

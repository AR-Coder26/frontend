"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff, ShieldAlert, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OtpInput, type OtpInputHandle } from "@/components/auth/OtpInput";
import { HoneypotField } from "@/components/auth/HoneypotField";
import {
  useCountdown,
  formatMinutesSeconds,
  formatLongDuration,
} from "@/hooks/useCountdown";
import { classifyOtpError, getErrorMessage } from "@/lib/otpErrors";
import {
  forgotPasswordAdmin,
  verifyAdminOtp,
  resetAdminPasswordWithOtp,
} from "@/lib/api/auth";
import {
  adminForgotPasswordSchema,
  adminVerifyOtpSchema,
  adminResetPasswordWithOtpSchema,
  type AdminForgotPasswordFormValues,
  type AdminVerifyOtpFormValues,
  type AdminResetPasswordWithOtpFormValues,
} from "@/lib/validators/adminAuth";

type FlowStep = "request" | "verify" | "reset" | "done";

// Mirrors the backend's defaults (backend/src/config/otpPolicy.js) so the UI countdown visually
// matches what the server actually enforces. These are UI-only approximations — the backend
// independently re-checks the real expiry/lock state on every single request regardless of what
// this timer shows client-side, so clock drift can never let anyone bypass anything; it can only
// make the "Resend"/"Try again" buttons appear a few seconds early or late.
const OTP_EXPIRY_MS = 5 * 60 * 1000;
const LOCKOUT_DURATION_MS = 2 * 60 * 60 * 1000;

/**
 * The full Admin Forgot Password / OTP flow: Request Reset -> Enter 6-Digit OTP -> Set New
 * Password, all inside one client component (rather than three separate routes) so the email,
 * OTP-verified resetToken, and countdown state can just live in React state instead of being
 * smuggled through URL params — which would otherwise leak a live reset token into browser
 * history/referrer headers. Mounted at /admin/forgot-password (a sibling of /admin/login, see
 * that page's own layout comment for why it must NOT sit under the (protected) route group).
 */
export function AdminForgotPasswordFlow() {
  const router = useRouter();
  const [step, setStep] = useState<FlowStep>("request");
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [showSlowNotice, setShowSlowNotice] = useState(false);
  const [lockedUntilMs, setLockedUntilMs] = useState<number | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const otpInputRef = useRef<OtpInputHandle>(null);

  // Three independent countdowns, always mounted (Rules of Hooks) but only meaningful once
  // their owning step activates them via `.reset(target)` — see useCountdown.ts's own comment
  // on why the target is a client-computed timestamp rather than a server-pushed one.
  const otpCountdown = useCountdown(Date.now());
  const resetTokenCountdown = useCountdown(Date.now());
  const lockoutCountdown = useCountdown(lockedUntilMs ?? Date.now());

  const requestForm = useForm<AdminForgotPasswordFormValues>({
    resolver: zodResolver(adminForgotPasswordSchema),
    defaultValues: { email: "", honeypot: "" },
  });

  const verifyForm = useForm<AdminVerifyOtpFormValues>({
    resolver: zodResolver(adminVerifyOtpSchema),
    defaultValues: { otp: "", honeypot: "" },
  });

  const resetForm = useForm<AdminResetPasswordWithOtpFormValues>({
    resolver: zodResolver(adminResetPasswordWithOtpSchema),
    defaultValues: { newPassword: "", confirmPassword: "", honeypot: "" },
  });

  /**
   * Wraps an OTP-flow API call with the "tarpitting" UX requirement: failed OTP verifications
   * are deliberately slowed to ~3 seconds server-side (backend/src/utils/tarpit.js) to stall
   * brute-force tools. A bare spinner for 3+ seconds can read as "did this freeze?" — so if the
   * call is still pending past 1.2s, a small reassuring note appears under the button. It
   * disappears the instant the call settles, success or failure either way.
   */
  async function withSlowNotice<T>(fn: () => Promise<T>): Promise<T> {
    const timer = setTimeout(() => setShowSlowNotice(true), 1200);
    try {
      return await fn();
    } finally {
      clearTimeout(timer);
      setShowSlowNotice(false);
    }
  }

  function handleLockout() {
    const target = Date.now() + LOCKOUT_DURATION_MS;
    setLockedUntilMs(target);
    lockoutCountdown.reset(target);
  }

  function handleStartOver() {
    setStep("request");
    setEmail("");
    setResetToken("");
    setLockedUntilMs(null);
    requestForm.reset({ email: "", honeypot: "" });
    verifyForm.reset({ otp: "", honeypot: "" });
    resetForm.reset({ newPassword: "", confirmPassword: "", honeypot: "" });
  }

  // ---- Step 1: request a code ----
  async function onSubmitRequest(values: AdminForgotPasswordFormValues) {
    setIsSubmitting(true);
    try {
      await forgotPasswordAdmin(values);
      setEmail(values.email);
      otpCountdown.reset(Date.now() + OTP_EXPIRY_MS);
      verifyForm.reset({ otp: "", honeypot: "" });
      setStep("verify");
      // Deliberately generic wording, mirroring the backend's own enumeration-safe response —
      // never phrase this based on whether an account was actually found, because the frontend
      // has no such signal to begin with (the backend always 200s here regardless).
      toast.success("Verification code sent", {
        description:
          "If an account with that email exists, a 6-digit code has been sent to it.",
      });
    } catch (error) {
      const kind = classifyOtpError(error);
      if (kind === "rateLimited") {
        toast.error("Too many requests", {
          description:
            "Please wait a few minutes before requesting another code.",
        });
      } else {
        toast.error("Could not send verification code", {
          description: getErrorMessage(error, "Please try again."),
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  // ---- Resend (triggered from inside step 2, reuses the same endpoint as step 1) ----
  async function handleResend() {
    if (!otpCountdown.isExpired || isResending) return;
    setIsResending(true);
    try {
      await forgotPasswordAdmin({ email });
      otpCountdown.reset(Date.now() + OTP_EXPIRY_MS);
      verifyForm.reset({ otp: "", honeypot: "" });
      toast.success("New code sent", {
        description: "Check your email for the new 6-digit code.",
      });
    } catch (error) {
      const kind = classifyOtpError(error);
      if (kind === "rateLimited") {
        toast.error("Too many requests", {
          description:
            "Please wait a few minutes before requesting another code.",
        });
      } else {
        toast.error("Could not resend code", {
          description: getErrorMessage(error, "Please try again."),
        });
      }
    } finally {
      setIsResending(false);
    }
  }

  // ---- Step 2: verify the code ----
  async function onSubmitVerify(values: AdminVerifyOtpFormValues) {
    setIsSubmitting(true);
    try {
      // `email` is merged in from component state here, not the form — see adminVerifyOtpSchema's
      // comment in lib/validators/adminAuth.ts for why it isn't a field the admin re-types.
      const result = await withSlowNotice(() =>
        verifyAdminOtp({ email, ...values }),
      );
      setResetToken(result.resetToken);
      resetTokenCountdown.reset(
        Date.now() + result.expiresInMinutes * 60 * 1000,
      );
      resetForm.reset({ newPassword: "", confirmPassword: "", honeypot: "" });
      setStep("reset");
      toast.success("Code verified", {
        description: "Now set a new password for your account.",
      });
    } catch (error) {
      const kind = classifyOtpError(error);
      if (kind === "lockedOut") {
        // 423 — either this exact attempt triggered the 3rd-strike lockout, or the account was
        // already locked from an earlier session. Either way, replace the whole step with the
        // persistent banner below rather than leaving a dead OTP form on screen.
        handleLockout();
        toast.error("Account locked", {
          description: getErrorMessage(
            error,
            "Too many failed attempts. Please try again later.",
          ),
        });
      } else if (kind === "rateLimited") {
        // 429 — this is the CALLING IP's rate limit (adminAuth.routes.js's verifyOtpLimiter),
        // a shorter, unrelated-to-this-account condition, so it gets a toast, not the lockout banner.
        toast.error("Too many attempts", {
          description:
            "Too many verification attempts from this device. Please wait a few minutes.",
        });
      } else {
        // Wrong or expired code — the backend's message already states exactly how many
        // attempts remain, so it's surfaced verbatim rather than being re-worded here.
        verifyForm.setValue("otp", "");
        otpInputRef.current?.focusFirst();
        toast.error("Verification failed", {
          description: getErrorMessage(error, "Please try again."),
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  // ---- Step 3: set the new password ----
  async function onSubmitReset(values: AdminResetPasswordWithOtpFormValues) {
    setIsSubmitting(true);
    try {
      // `confirmPassword` is frontend-only (client-side match check) — never sent to the API.
      await resetAdminPasswordWithOtp({
        email,
        resetToken,
        newPassword: values.newPassword,
        honeypot: values.honeypot,
      });
      setStep("done");
      toast.success("Password reset", {
        description: "You can now log in with your new password.",
      });
    } catch (error) {
      toast.error("Could not reset password", {
        description: getErrorMessage(
          error,
          "Your verification may have expired — please start over.",
        ),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // ---- Persistent lockout banner — takes over the whole card while an active lock exists ----
  if (lockedUntilMs !== null && !lockoutCountdown.isExpired) {
    return (
      <div className="space-y-4 text-center">
        <ShieldAlert
          className="mx-auto h-10 w-10 text-red-500"
          aria-hidden="true"
        />
        <div>
          <p className="text-sm font-semibold text-neutral-900">
            Account temporarily locked
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            Too many failed verification attempts. For security, this account is
            locked for 2 hours.
          </p>
        </div>
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          Try again in {formatLongDuration(lockoutCountdown.secondsRemaining)}
        </div>
        <Link
          href="/admin/login"
          className="inline-block text-xs text-neutral-500 underline underline-offset-2"
        >
          Back to login
        </Link>
      </div>
    );
  }

  // ---- Step 1 UI: request a code ----
  if (step === "request") {
    return (
      <form
        onSubmit={requestForm.handleSubmit(onSubmitRequest)}
        className="space-y-4"
      >
        <p className="text-sm text-neutral-500">
          Enter your admin email and we&apos;ll send a 6-digit verification code
          to it.
        </p>

        {/* Invisible bot trap — see HoneypotField.tsx. Backend: honeypot.middleware.js on the
            /admin/auth/forgot-password route. */}
        <HoneypotField registration={requestForm.register("honeypot")} />

        <div>
          <label
            htmlFor="fp-email"
            className="text-xs font-semibold uppercase tracking-wide text-neutral-500"
          >
            Email
          </label>
          <input
            id="fp-email"
            type="email"
            autoComplete="username"
            {...requestForm.register("email")}
            className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-900"
          />
          {requestForm.formState.errors.email && (
            <p className="mt-1 text-xs text-red-600">
              {requestForm.formState.errors.email.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="w-full bg-neutral-900 text-white hover:bg-neutral-800"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />{" "}
              Sending code…
            </>
          ) : (
            "Send Verification Code"
          )}
        </Button>

        <Link
          href="/admin/login"
          className="block text-center text-xs text-neutral-500 underline underline-offset-2"
        >
          Back to login
        </Link>
      </form>
    );
  }

  // ---- Step 2 UI: enter the 6-digit code ----
  if (step === "verify") {
    return (
      <form
        onSubmit={verifyForm.handleSubmit(onSubmitVerify)}
        className="space-y-4"
      >
        <p className="text-center text-sm text-neutral-500">
          Enter the 6-digit code sent to{" "}
          <span className="font-medium text-neutral-800">{email}</span>
        </p>

        {/* Backend: honeypot.middleware.js on the /admin/auth/verify-otp route. */}
        <HoneypotField registration={verifyForm.register("honeypot")} />

        <Controller
          control={verifyForm.control}
          name="otp"
          render={({ field }) => (
            <OtpInput
              ref={otpInputRef}
              value={field.value}
              onChange={field.onChange}
              disabled={isSubmitting || otpCountdown.isExpired}
              invalid={Boolean(verifyForm.formState.errors.otp)}
              autoFocus
            />
          )}
        />
        {verifyForm.formState.errors.otp && (
          <p className="text-center text-xs text-red-600">
            {verifyForm.formState.errors.otp.message}
          </p>
        )}

        <div className="text-center text-xs text-neutral-500">
          {otpCountdown.isExpired ? (
            <span className="font-medium text-red-600">Code expired</span>
          ) : (
            <>
              Code expires in{" "}
              {formatMinutesSeconds(otpCountdown.secondsRemaining)}
            </>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting || otpCountdown.isExpired}
          className="w-full bg-neutral-900 text-white hover:bg-neutral-800"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />{" "}
              Verifying…
            </>
          ) : (
            "Verify Code"
          )}
        </Button>
        {/* Non-blocking reassurance during the backend's ~3s tarpit delay on failed attempts —
            see withSlowNotice()'s comment above. Never shown on a fast, successful request. */}
        {showSlowNotice && (
          <p className="text-center text-xs text-neutral-400">
            Checking your code securely, this can take a few seconds…
          </p>
        )}

        {/* Resend is only enabled once the current code has fully expired, per spec — this is
            intentionally stricter than the backend's own 60-second resend cooldown
            (otpPolicy.js's OTP_RESEND_COOLDOWN_MS), which would technically allow an earlier
            resend. Relax this to a 60s useCountdown target instead if that's ever preferred. */}
        <button
          type="button"
          onClick={handleResend}
          disabled={!otpCountdown.isExpired || isResending}
          className="block w-full text-center text-xs text-neutral-500 underline underline-offset-2 disabled:cursor-not-allowed disabled:text-neutral-300 disabled:no-underline"
        >
          {isResending
            ? "Sending new code…"
            : otpCountdown.isExpired
              ? "Resend Code"
              : `Resend available once the code expires (${formatMinutesSeconds(otpCountdown.secondsRemaining)})`}
        </button>

        <button
          type="button"
          onClick={handleStartOver}
          className="block w-full text-center text-xs text-neutral-400 underline underline-offset-2"
        >
          Use a different email
        </button>
      </form>
    );
  }

  // ---- Step 3 UI: set the new password ----
  if (step === "reset") {
    if (resetTokenCountdown.isExpired) {
      return (
        <div className="space-y-3 text-center">
          <p className="text-sm text-red-600">
            Your verification has expired. Please start the process again.
          </p>
          <Button
            type="button"
            onClick={handleStartOver}
            size="lg"
            className="w-full bg-neutral-900 text-white hover:bg-neutral-800"
          >
            Start Over
          </Button>
        </div>
      );
    }

    return (
      <form
        onSubmit={resetForm.handleSubmit(onSubmitReset)}
        className="space-y-4"
      >
        <p className="text-center text-xs text-neutral-500">
          Set a new password. This step expires in{" "}
          {formatMinutesSeconds(resetTokenCountdown.secondsRemaining)}.
        </p>

        {/* Backend: honeypot.middleware.js on the /admin/auth/reset-password route. */}
        <HoneypotField registration={resetForm.register("honeypot")} />

        <div>
          <label
            htmlFor="fp-new-password"
            className="text-xs font-semibold uppercase tracking-wide text-neutral-500"
          >
            New Password
          </label>
          <div className="relative mt-1">
            <input
              id="fp-new-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              {...resetForm.register("newPassword")}
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {resetForm.formState.errors.newPassword && (
            <p className="mt-1 text-xs text-red-600">
              {resetForm.formState.errors.newPassword.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="fp-confirm-password"
            className="text-xs font-semibold uppercase tracking-wide text-neutral-500"
          >
            Confirm Password
          </label>
          <input
            id="fp-confirm-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            {...resetForm.register("confirmPassword")}
            className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-900"
          />
          {resetForm.formState.errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-600">
              {resetForm.formState.errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="w-full bg-neutral-900 text-white hover:bg-neutral-800"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />{" "}
              Resetting…
            </>
          ) : (
            "Reset Password"
          )}
        </Button>
      </form>
    );
  }

  // ---- step === 'done' ----
  return (
    <div className="space-y-4 text-center">
      <CheckCircle2
        className="mx-auto h-10 w-10 text-green-600"
        aria-hidden="true"
      />
      <p className="text-sm font-semibold text-neutral-900">
        Password reset successfully
      </p>
      <p className="text-sm text-neutral-500">
        You can now log in with your new password.
      </p>
      <Button
        type="button"
        onClick={() => router.push("/admin/login")}
        size="lg"
        className="w-full bg-neutral-900 text-white hover:bg-neutral-800"
      >
        Go to Login
      </Button>
    </div>
  );
}
"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/auth-shell";
import {
  apiErrorMessage,
  forgotPassword,
  resetPassword,
  verifyOtp,
} from "@/lib/auth-api";
import {
  forgotPasswordSchema,
  otpSchema,
  resetPasswordSchema,
  type ForgotPasswordValues,
  type OtpValues,
  type ResetPasswordValues,
} from "@/lib/validations";

type Step = "email" | "otp" | "reset";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = React.useState<Step>("email");
  const [email, setEmail] = React.useState("");
  const [resending, setResending] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const emailForm = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const otpForm = useForm<OtpValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  const resetForm = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const onEmailSubmit = async (values: ForgotPasswordValues) => {
    try {
      const message = await forgotPassword(values.email);
      setEmail(values.email);
      toast.success(message);
      setStep("otp");
    } catch (error) {
      toast.error(apiErrorMessage(error, "Couldn't send the reset code."));
    }
  };

  const onOtpSubmit = async (values: OtpValues) => {
    try {
      const result = await verifyOtp(email, values.otp);
      toast.success(result.message || "Code verified.");
      setStep("reset");
    } catch (error) {
      toast.error(apiErrorMessage(error, "Invalid or expired code."));
    }
  };

  const onResetSubmit = async (values: ResetPasswordValues) => {
    try {
      const message = await resetPassword({ email, ...values });
      toast.success(message);
      router.replace("/login");
    } catch (error) {
      toast.error(apiErrorMessage(error, "Couldn't reset the password."));
    }
  };

  const resend = async () => {
    setResending(true);
    try {
      toast.success(await forgotPassword(email));
    } catch (error) {
      toast.error(apiErrorMessage(error, "Couldn't resend the code."));
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthShell>
      {step === "email" && (
        <>
          <h1 className="text-xl font-semibold text-foreground">
            Reset your password
          </h1>
          <p className="mt-1 mb-6 text-sm text-muted-foreground">
            Enter your email and we&apos;ll send you a reset code.
          </p>
          <form
            onSubmit={emailForm.handleSubmit(onEmailSubmit)}
            className="space-y-4"
            noValidate
          >
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@store.com"
                aria-invalid={!!emailForm.formState.errors.email}
                {...emailForm.register("email")}
              />
              {emailForm.formState.errors.email && (
                <p className="text-sm text-destructive">
                  {emailForm.formState.errors.email.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={emailForm.formState.isSubmitting}
            >
              {emailForm.formState.isSubmitting && (
                <Loader2 className="size-4 animate-spin" />
              )}
              {emailForm.formState.isSubmitting ? "Sending…" : "Send reset code"}
            </Button>
          </form>
        </>
      )}

      {step === "otp" && (
        <>
          <h1 className="text-xl font-semibold text-foreground">Enter code</h1>
          <p className="mt-1 mb-6 text-sm text-muted-foreground">
            We sent a 6-digit code to <span className="font-medium">{email}</span>
          </p>
          <form
            onSubmit={otpForm.handleSubmit(onOtpSubmit)}
            className="space-y-4"
            noValidate
          >
            <div className="space-y-1.5">
              <Label htmlFor="otp">Verification code</Label>
              <Input
                id="otp"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="123456"
                className="text-center text-lg tracking-[0.5em]"
                aria-invalid={!!otpForm.formState.errors.otp}
                {...otpForm.register("otp")}
              />
              {otpForm.formState.errors.otp && (
                <p className="text-sm text-destructive">
                  {otpForm.formState.errors.otp.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={otpForm.formState.isSubmitting}
            >
              {otpForm.formState.isSubmitting && (
                <Loader2 className="size-4 animate-spin" />
              )}
              {otpForm.formState.isSubmitting ? "Verifying…" : "Verify code"}
            </Button>
          </form>
          <div className="mt-4 text-right text-sm">
            <button
              type="button"
              onClick={resend}
              disabled={resending}
              className="cursor-pointer font-medium text-[#005bd3] hover:underline disabled:opacity-50"
            >
              {resending ? "Sending…" : "Resend code"}
            </button>
          </div>
        </>
      )}

      {step === "reset" && (
        <>
          <h1 className="text-xl font-semibold text-foreground">
            Choose a new password
          </h1>
          <p className="mt-1 mb-6 text-sm text-muted-foreground">
            Set a new password for <span className="font-medium">{email}</span>
          </p>
          <form
            onSubmit={resetForm.handleSubmit(onResetSubmit)}
            className="space-y-4"
            noValidate
          >
            <div className="space-y-1.5">
              <Label htmlFor="newPassword">New password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  className="pr-10"
                  aria-invalid={!!resetForm.formState.errors.newPassword}
                  {...resetForm.register("newPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 flex w-10 cursor-pointer items-center justify-center text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {resetForm.formState.errors.newPassword && (
                <p className="text-sm text-destructive">
                  {resetForm.formState.errors.newPassword.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Re-enter your new password"
                aria-invalid={!!resetForm.formState.errors.confirmPassword}
                {...resetForm.register("confirmPassword")}
              />
              {resetForm.formState.errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {resetForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={resetForm.formState.isSubmitting}
            >
              {resetForm.formState.isSubmitting && (
                <Loader2 className="size-4 animate-spin" />
              )}
              {resetForm.formState.isSubmitting
                ? "Resetting…"
                : "Reset password"}
            </Button>
          </form>
        </>
      )}

      <div className="mt-4 text-sm">
        <Link
          href="/login"
          className="flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to login
        </Link>
      </div>
    </AuthShell>
  );
}

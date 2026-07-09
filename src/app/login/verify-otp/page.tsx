"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/auth-shell";
import { apiErrorMessage, sendOtp, verifyOtp } from "@/lib/auth-api";
import { otpSchema, type OtpValues } from "@/lib/validations";
import { useAuthStore } from "@/stores/auth-store";

function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const login = useAuthStore((s) => s.login);
  const [resending, setResending] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OtpValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  React.useEffect(() => {
    if (!email) router.replace("/login");
  }, [email, router]);

  const onSubmit = async (values: OtpValues) => {
    try {
      const result = await verifyOtp(email, values.otp);
      if (result.token) {
        login(
          result.user ?? { name: email.split("@")[0], email },
          result.token,
          result.refreshToken
        );
        toast.success(result.message || "Welcome back!");
        router.replace("/");
      } else {
        toast.success(result.message || "Code verified.");
        router.replace("/login");
      }
    } catch (error) {
      toast.error(apiErrorMessage(error, "Invalid or expired code."));
    }
  };

  const resend = async () => {
    setResending(true);
    try {
      const message = await sendOtp(email);
      toast.success(message);
    } catch (error) {
      toast.error(apiErrorMessage(error, "Couldn't resend the code."));
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthShell>
      <h1 className="text-xl font-semibold text-foreground">Enter code</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">
        We sent a 6-digit code to <span className="font-medium">{email}</span>
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="otp">Verification code</Label>
          <Input
            id="otp"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="123456"
            className="text-center text-lg tracking-[0.5em]"
            aria-invalid={!!errors.otp}
            {...register("otp")}
          />
          {errors.otp && (
            <p className="text-sm text-destructive">{errors.otp.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          {isSubmitting ? "Verifying…" : "Verify"}
        </Button>
      </form>

      <div className="mt-4 flex items-center justify-between text-sm">
        <Link
          href="/login"
          className="flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to login
        </Link>
        <button
          type="button"
          onClick={resend}
          disabled={resending}
          className="cursor-pointer font-medium text-[#005bd3] hover:underline disabled:opacity-50"
        >
          {resending ? "Sending…" : "Resend code"}
        </button>
      </div>
    </AuthShell>
  );
}

export default function VerifyOtpPage() {
  return (
    <React.Suspense fallback={null}>
      <VerifyOtpForm />
    </React.Suspense>
  );
}

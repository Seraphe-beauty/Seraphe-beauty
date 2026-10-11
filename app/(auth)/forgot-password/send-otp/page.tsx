"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/components/lib/api";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import logo from "@/components/images/short-logo.png";

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus on the first input on load
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    // Handle pasted numbers or single input
    if (value.length > 1) {
      const pastedValues = value.slice(0, 6).split("");
      for (let i = 0; i < 6; i++) {
        newOtp[i] = pastedValues[i] || "";
      }
      setOtp(newOtp);
      inputRefs.current[Math.min(pastedValues.length, 5)]?.focus();
    } else {
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) {
      toast.error("Please enter the complete 6-digit code.");
      return;
    }

    setSubmitting(true);
    try {
      //   await api.auth.verifyOtp({ email, otp: code });
      toast.success("Account verified successfully! Please sign in.");
      router.push("/signin");
    } catch (err: any) {
      toast.error(
        err.message || "Invalid verification code. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error("Email address missing.");
      return;
    }
    setResending(true);
    try {
      await api.auth.adminForgotPasswordOtp({ email });
      toast.success("Verification code resent to your email.");
    } catch (err: any) {
      toast.error(err.message || "Failed to resend verification code.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className=" pt-4 flex justify-center items-center">
        <Link
          href="/"
          className="shrink-0 flex gap-1 pb-2 items-center transition-opacity hover:opacity-90"
        >
          <Image
            src={logo}
            alt="Seraphé Logo"
            width={50}
            height={50}
            priority
            className="w-10"
          />
          <div className="mt-3">
            <h1 className="text-2xl font-bold">Seraphé</h1>
          </div>
        </Link>
      </div>
      <div className=" flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-sm text-center">
          {/* Phone Illustration Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative w-28 h-28 flex items-center justify-center">
              {/* Outer Smartphone Frame */}
              <div className="w-20 h-28 border-4 border-slate-700 rounded-2xl bg-white flex flex-col justify-between p-1 shadow-sm relative">
                <div className="w-4 h-1 bg-slate-300 rounded-full mx-auto mt-1" />
                <div className="w-3 h-3 border-2 border-slate-600 rounded-full mx-auto mb-1" />

                {/* Floating Chat Bubble Overlay */}
                <div className="absolute -right-5 top-6 bg-primaryBg text-white font-bold text-xs py-1.5 px-3 rounded-xl shadow-md flex items-center gap-0.5">
                  <span>* * * * * *</span>
                  <div className="absolute -left-1 bottom-1 w-2 h-2 bg-primaryBg rotate-45" />
                </div>
              </div>
            </div>
          </div>

          {/* Title */}
          <h2 className="md:text-2xl text-lg font-bold text-secondary mb-1">
            Account Verification
          </h2>
          <p className="text-xs text-darkText font-medium mb-6">
            Enter Verify Code Below
          </p>

          {/* OTP Input Fields */}
          <form onSubmit={handleVerify}>
            <div className="flex justify-between gap-2 mb-6">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    inputRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="md:w-12 md:h-14 w-6 h-8 text-center md:text-xl text-sm font-semibold bg-slate-100 text-secondary border-2 border-transparent rounded-xl focus:border-primaryBg focus:bg-white focus:outline-none transition-all shadow-inner"
                />
              ))}
            </div>

            {/* Verification Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primaryBg hover:bg-sky-500 text-white py-3.5 rounded-xl font-semibold text-sm transition shadow-sm disabled:opacity-50"
            >
              {submitting ? "Verifying..." : "Verify Code"}
            </button>
          </form>

          {/* Resend Link */}
          <div className="mt-6">
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-xs text-slate-500 underline font-medium hover:text-secondary transition disabled:opacity-50"
            >
              {resending ? "Sending..." : "Resend Code"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

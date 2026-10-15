"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/components/lib/api";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    if (value.length > 1) {
      const pasted = value.slice(0, 6).split("");
      for (let i = 0; i < 6; i++) newOtp[i] = pasted[i] || "";
      setOtp(newOtp);
      inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    } else {
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) inputRefs.current[index + 1]?.focus();
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

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) {
      toast.error("Please enter the full 6-digit OTP code.");
      return;
    }

    setSubmitting(true);
    try {
      await api.auth.adminForgotPasswordReset({
        otp: code,
        newPassword,
        oldPassword,
        email,
      });
      toast.success("Password reset successfully. Please sign in.");
      router.push("/signin");
    } catch (err: any) {
      toast.error(err.message || "Failed to reset password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-xl p-8 shadow-md border border-gray-100">
        <h2 className="text-xl font-bold text-center text-gray-800 mb-1">
          Reset Password
        </h2>
        <p className="text-xs text-center text-gray-500 mb-6">
          Enter the code sent to{" "}
          <span className="font-semibold text-gray-700">{email}</span>
        </p>

        <form onSubmit={handleReset} className="space-y-5">
          {/* OTP Input Boxes */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2 text-center">
              Verification Code
            </label>
            <div className="flex justify-between gap-2">
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
                  className="w-11 h-12 text-center text-lg font-semibold bg-gray-50 text-gray-800 border border-gray-200 rounded-md focus:border-primaryText focus:outline-none"
                />
              ))}
            </div>
          </div>

          {/* Old Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Enter Old Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full px-4 py-2 pr-11 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primaryText"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* New Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Enter New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 pr-11 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primaryText"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primaryBg text-white py-2 rounded-md font-semibold hover:bg-primaryText transition disabled:opacity-50"
          >
            {submitting ? "Updating..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

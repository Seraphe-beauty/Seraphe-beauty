"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import logo from "@/components/images/short-logo.png";
import { useRouter } from "next/navigation";
import { api } from "@/components/lib/api";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.auth.adminForgotPasswordOtp({ email });
      toast.success("Reset code sent to your email.");
      router.push(`/forgot-password/reset?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to send reset code.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="max-w-md w-full p-8 rounded-xl shadow-md border border-gray-100 bg-white">
        <div className="flex justify-center items-center">
          <Link href="/" className="shrink-0 flex gap-1 pb-2 items-center">
            <Image
              src={logo}
              alt="Seraphé Logo"
              width={50}
              height={50}
              className="w-10"
            />
            <div className="mt-3">
              <h1 className="text-2xl font-bold">Seraphé</h1>
            </div>
          </Link>
        </div>
        <h2 className="text-base font-medium text-center text-black pt-4 mb-2">
          Forgot Password
        </h2>
        <p className="text-xs text-gray-500 text-center mb-6">
          Enter your email address to receive a password reset code.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primaryText"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primaryBg text-white py-2 rounded-md font-semibold hover:bg-primaryText transition disabled:opacity-50"
          >
            {submitting ? "Sending..." : "Send Reset Code"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-500">
          Remembered your password?{" "}
          <Link
            href="/signin"
            className="text-primaryBg hover:underline font-semibold"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

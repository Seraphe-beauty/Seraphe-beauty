"use client";

import { api } from "@/components/lib/api";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import logo from "@/components/images/short-logo.png";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

interface SignUpProps {
  onAuthSuccess?: () => void;
}

export default function AdminSignUp({ onAuthSuccess }: SignUpProps) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await api.auth.adminSignup({ name, email, password, code });

      if (onAuthSuccess) {
        onAuthSuccess();
      } else {
        router.push("/signin");
      }
    } catch (err: any) {
      setError(err.message || "Account creation was not successful.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full p-8 rounded-xl shadow-md border border-gray-100 bg-white">
        <div className="flex justify-center items-center">
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
        <h2 className="text-base font-bold text-center text-gray-800 mb-6">
          Create Admin Account
        </h2>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md mb-4 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 pr-11 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primaryText"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Code
            </label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primaryBg text-white py-2 rounded-md font-semibold hover:bg-primaryText transition disabled:opacity-50"
          >
            {submitting ? "Registering..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-500">
          Already have an account?{" "}
          <Link
            href="/signin"
            className="text-primaryText hover:underline font-semibold"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

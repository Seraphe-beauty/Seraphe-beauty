"use client";
import { useAuth } from "@/components/context/authContext";
import { api } from "@/components/lib/api";
import Link from "next/link";
import Image from "next/image";
import logo from "@/components/images/short-logo.png";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

interface SignInProps {
  onAuthSuccess: () => void;
}

export default function AdminSignIn({ onAuthSuccess }: SignInProps) {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      const response = await api.auth.adminSignin({
        email,
        password,
      });

      login(response);

      if (onAuthSuccess) {
        onAuthSuccess();
      }

      router.replace("/admin");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || "Invalid email or secret credentials.");
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center  px-4">
      <div className="max-w-md w-full p-8 rounded-xl  shadow-md border border-gray-100">
        <div className="flex  justify-center items-center">
          <Link
            href="/"
            className="shrink-0 flex gap-1 pb-2 items-center  transition-opacity hover:opacity-90"
          >
            <Image
              src={logo}
              alt="Seraphé Logo"
              width={50}
              height={50}
              priority
              className="w-10"
            />
            <div className=" mt-3">
              <h1 className="text-2xl font-bold ">Seraphé</h1>
            </div>
          </Link>
        </div>
        <h2 className="text-base font-bold text-center text-gray-800 mb-6">
          Admin Sign In
        </h2>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md mb-4 font-medium">
            {error}
          </div>
        )}

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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primaryText"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primaryBg text-white py-2 rounded-md font-semibold hover:bg-primaryText transition disabled:opacity-50"
          >
            {submitting ? "Verifying..." : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-500">
          Need a profile setup?{" "}
          <Link href="/signup">
            <button className="text-primaryBg hover:underline font-semibold">
              Register Admin
            </button>
          </Link>
        </p>
      </div>
    </div>
  );
}

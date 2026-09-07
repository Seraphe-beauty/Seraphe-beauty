"use client";

import { api } from "@/components/lib/api";

import React, { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import logo from "@/components/images/short-logo.png";

interface SignUpProps {
  onAuthSuccess: () => void;
  onSwitchToSignIn: () => void;
}

export default function AdminSignUp({
  onAuthSuccess,
  onSwitchToSignIn,
}: SignUpProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await api.auth.adminSignup({
        name,
        email,
        password,
      });

      toast.success("Account created successfully.");

      onSwitchToSignIn();

      if (onAuthSuccess) {
        onAuthSuccess();
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || "Registration denied.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full p-8 rounded-xl shadow-md border border-gray-100">
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
          />
          <div className=" mt-3 hidden lg:block">
            <h1 className="text-2xl font-bold ">Seraphé</h1>
          </div>
        </Link>
        <h2 className="text-xl font-bold text-center text-gray-800 mb-1">
          Create Admin
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
            {submitting ? "Registering..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-500">
          Already have access?{" "}
          <button
            onClick={onSwitchToSignIn}
            className="text-primaryText hover:underline font-semibold"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}

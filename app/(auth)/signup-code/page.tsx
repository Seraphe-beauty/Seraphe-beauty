"use client";

import { useEffect, useState } from "react";
import { api } from "@/components/lib/api";
import type { SignupCodeResponse } from "@/components/types/api";
import { useRouter } from "next/navigation";

export default function SignupCodesPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [signupCode, setSignupCode] = useState<SignupCodeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    try {
      const token = localStorage.getItem("accessToken");
      const storedAdmin = localStorage.getItem("admin");

      if (!token || !storedAdmin) {
        router.replace("/signin");
        return;
      }

      const admin = JSON.parse(storedAdmin);

      if (admin.role !== "SUPER_ADMIN") {
        router.replace("/admin");
        return;
      }

      console.log("Stored admin:", admin);
      console.log("Stored role:", admin.role);

      setAuthorized(true);
    } catch {
      router.replace("/signin");
    }
  }, [router]);

  if (!authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Verifying Access ......
      </div>
    );
  }

  const handleGenerateCode = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setLoading(true);
    setError("");
    setSignupCode(null);
    setCopied(false);

    try {
      const response = await api.auth.adminSignUpCode({
        email: email.trim(),
      });

      setSignupCode(response);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to generate signup code.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (!signupCode) return;

    try {
      await navigator.clipboard.writeText(signupCode.code);
      setCopied(true);
    } catch {
      setError("Unable to copy the code. Please copy it manually.");
    }
  };

  return (
    <main className="mx-auto max-w-2xl p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Signup Codes</h1>
        <p className="mt-2 text-sm text-gray-500">
          Each code expires after 30 minutes.
        </p>
      </div>

      <form
        onSubmit={handleGenerateCode}
        className="space-y-5 rounded-xl border p-6 w-full"
      >
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium">
            New Admin's email
          </label>

          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@example.com"
            required
            className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-black px-4 py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Generating code..." : "Generate signup code"}
        </button>

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
      </form>

      {signupCode && (
        <section
          aria-live="polite"
          className="mt-6 space-y-4 rounded-xl border p-6"
        >
          <div>
            <h2 className="text-lg font-semibold">Signup code generated</h2>
            <p className="mt-1 text-sm text-gray-500">{signupCode.message}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Recipient</p>
            <p className="font-medium">{signupCode.email}</p>
          </div>

          <div>
            <p className="mb-2 text-sm text-gray-500">Signup code</p>

            <div className="flex items-center justify-between gap-3 rounded-lg bg-gray-100 p-4">
              <p className="break-all text-3xl font-bold tracking-widest">
                {signupCode.code}
              </p>

              <button
                type="button"
                onClick={handleCopyCode}
                className="shrink-0 rounded-lg border bg-white px-3 py-2 text-sm font-medium"
              >
                {copied ? "Copied!" : "Copy code"}
              </button>
            </div>
          </div>

          <p className="text-sm text-amber-700">
            Share this code securely with the intended recipient. It expires
            after 30 minutes.
          </p>
        </section>
      )}
    </main>
  );
}

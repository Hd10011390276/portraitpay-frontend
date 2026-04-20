"use client";
/**
 * /verify-email — Email verification page
 * Receives token from URL ?token=xxx
 * Shows success/error and redirects to login
 */
import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/layout/LanguageToggle";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function verify() {
      if (!token) {
        setStatus("error");
        setErrorMsg("Verification link is invalid or expired.");
        return;
      }

      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const json = await res.json();
        if (json.success) {
          setStatus("success");
        } else {
          setStatus("error");
          setErrorMsg(json.error ?? "Verification failed.");
        }
      } catch {
        setStatus("error");
        setErrorMsg("Network error. Please try again.");
      }
    }

    verify();
  }, [token]);

  // Auto-redirect on success
  useEffect(() => {
    if (status === "success") {
      const timer = setTimeout(() => {
        router.push("/login");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-3 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">Verifying your email...</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
        <div className="flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="PortraitPay AI" className="h-8 w-8 rounded-lg" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">PortraitPay AI</span>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-sm">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 text-center">
              <div className="text-5xl mb-4">❌</div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Verification Failed</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">{errorMsg}</p>
              <div className="space-y-3">
                <Link href="/forgot-password" className="block w-full py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors">
                  Request New Link
                </Link>
                <Link href="/login" className="block text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                  ← Back to login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <div className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="PortraitPay AI" className="h-8 w-8 rounded-lg" />
          <span className="text-xl font-bold text-gray-900 dark:text-white">PortraitPay AI</span>
        </Link>
        <div className="flex items-center gap-3">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Email Verified!</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              Your email has been verified. Redirecting to login...
            </p>
            <Link href="/login" className="block w-full py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors">
              Go to Login →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin h-6 w-6 border-2 border-purple-500 border-t-transparent rounded-full" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}

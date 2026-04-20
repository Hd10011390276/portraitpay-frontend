"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/auth/Input";
import { Button } from "@/components/auth/Button";
import { RoleSelector } from "@/components/auth/RoleSelector";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import ThemeToggle from "@/components/ThemeToggle";
import { useLanguage } from "@/context/LanguageContext";

export default function RegisterPage() {
  const router = useRouter();
  const { locale, t } = useLanguage();

  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<string>("USER");
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errs: Record<string, string> = {};

    if (!name.trim()) errs.name = t.register.errors.nameRequired;
    if (!email.trim()) errs.email = t.register.errors.emailRequired;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = t.register.errors.invalidEmail;

    if (!password) errs.password = t.register.errors.passwordRequired;
    else if (password.length < 8) errs.password = t.register.errors.passwordTooShort;
    else if (!/[A-Z]/.test(password)) errs.password = t.register.errors.passwordNeedUppercase;
    else if (!/[0-9]/.test(password)) errs.password = t.register.errors.passwordNeedNumber;

    if (!confirmPassword) errs.confirmPassword = t.register.errors.confirmPasswordRequired;
    else if (password !== confirmPassword) errs.confirmPassword = t.register.errors.passwordsMismatch;

    if (!role) errs.role = t.register.errors.selectRole;

    if (!agreeTerms) errs.terms = t.register.errors.selectRole;

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError("");

    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, phone, password, role }),
      });
      const data = await res.json();

      if (!res.ok) {
        setGlobalError(data.message || t.register.errors.registrationFailed);
        return;
      }

      if (data.data?.accessToken) {
        localStorage.setItem("pp_access_token", data.data.accessToken);
        localStorage.setItem("pp_refresh_token", data.data.refreshToken);
        localStorage.setItem("pp_user", JSON.stringify(data.data.user));
      }

      router.push("/dashboard");
    } catch {
      setGlobalError(t.register.errors.networkError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 py-8 sm:py-12">
      {/* Top bar with theme and language toggles */}
      <div className="fixed top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-2 sm:gap-3 z-50">
        <ThemeToggle />
        <LanguageToggle />
      </div>

      <div className="w-full max-w-md space-y-6 sm:space-y-8">
        {/* Logo / Header */}
        <div className="text-center px-2">
          <Link href="/" className="inline-block">
            <div className="text-3xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2 hover:opacity-80 transition-opacity">
              PortraitPay AI
            </div>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            {t.register.createAccount}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t.register.joinPortraitPay}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <form onSubmit={handleRegister} className="p-4 sm:p-6 space-y-4 sm:space-y-5">
            {globalError && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-red-600 dark:text-red-400">
                {globalError}
              </div>
            )}

            <Input
              label={t.register.fullName}
              type="text"
              placeholder={t.register.enterRealName}
              value={name}
              onChange={(e) => { setName(e.target.value); setErrors((prev) => ({ ...prev, name: "" })); }}
              error={errors.name}
              autoComplete="name"
            />

            <Input
              label={t.register.email}
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors((prev) => ({ ...prev, email: "" })); }}
              error={errors.email}
              autoComplete="email"
            />

            <Input
              label={t.register.phoneOptional}
              type="tel"
              placeholder={t.register.phoneCanAddLater}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
            />

            <Input
              label={t.register.password}
              type="password"
              placeholder={t.register.passwordPlaceholder}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors((prev) => ({ ...prev, password: "" })); }}
              error={errors.password}
              autoComplete="new-password"
            />

            <Input
              label={t.register.confirmPassword}
              type="password"
              placeholder={t.register.reEnterPassword}
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setErrors((prev) => ({ ...prev, confirmPassword: "" })); }}
              error={errors.confirmPassword}
              autoComplete="new-password"
            />

            <RoleSelector
              value={role}
              onChange={(value) => { setRole(value); setErrors((prev) => ({ ...prev, role: "" })); }}
              error={errors.role}
            />

            {/* Terms agreement */}
            <div className="space-y-1">
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="agree-terms"
                  checked={agreeTerms}
                  onChange={(e) => { setAgreeTerms(e.target.checked); setErrors((prev) => ({ ...prev, terms: "" })); }}
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="agree-terms" className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-tight">
                  {t.register.agreeToTerms}
                  <Link href="/terms" className="text-blue-600 dark:text-blue-400 hover:underline mx-1">
                    {t.register.terms}
                  </Link>
                  {t.register.and}
                  <Link href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline mx-1">
                    {t.register.privacy}
                  </Link>
                </label>
              </div>
              {errors.terms && <p className="text-xs text-red-500">{errors.terms}</p>}
            </div>

            <Button type="submit" size="lg" loading={loading} className="w-full">
              {t.register.registerButton}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 px-4">
          {t.register.alreadyHaveAccount}{" "}
          <Link href="/login" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
            {t.register.signInNow}
          </Link>
        </p>
      </div>
    </div>
  );
}

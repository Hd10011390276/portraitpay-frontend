"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/auth/Input";
import { Button } from "@/components/auth/Button";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import ThemeToggle from "@/components/ThemeToggle";
import { useLanguage } from "@/context/LanguageContext";

type Tab = "email" | "phone";

export default function LoginPage() {
  const router = useRouter();
  const { locale, t } = useLanguage();
  const [tab, setTab] = useState<Tab>("email");
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");

  // Email login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailErrors, setEmailErrors] = useState<Record<string, string>>({});

  // Phone login state
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [phoneErrors, setPhoneErrors] = useState<Record<string, string>>({});
  const [otpSent, setOtpSent] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [otpSentTo, setOtpSentTo] = useState("");
  const [otpCode, setOtpCode] = useState(""); // test mode display

  const isZh = locale === "zh-CN";

  const validateEmailForm = () => {
    const errs: Record<string, string> = {};
    if (!email) errs.email = "邮箱不能为空";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "请输入有效的邮箱地址";
    if (!password) errs.password = "密码不能为空";
    setEmailErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validatePhoneForm = () => {
    const errs: Record<string, string> = {};
    if (!/^1[3-9]\d{9}$/.test(phone)) errs.phone = "请输入有效的中国大陆手机号";
    if (!otpSent) errs.phone = "请先发送验证码";
    if (!code || !/^\d{6}$/.test(code)) errs.code = "请输入6位验证码";
    setPhoneErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSendOtp = async () => {
    const errs: Record<string, string> = {};
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      errs.phone = "请输入有效的中国大陆手机号";
      setPhoneErrors(errs);
      return;
    }

    setLoading(true);
    setGlobalError("");
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setGlobalError(data.message || "发送失败");
        return;
      }
      setOtpSent(true);
      setOtpSentTo(phone);
      setOtpCode(data.data?.code || "");
      setOtpCountdown(60);
      const timer = setInterval(() => {
        setOtpCountdown((c) => {
          if (c <= 1) { clearInterval(timer); return 0; }
          return c - 1;
        });
      }, 1000);
    } catch {
      setGlobalError("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError("");

    if (tab === "email") {
      if (!validateEmailForm()) return;
    } else {
      if (!validatePhoneForm()) return;
    }

    setLoading(true);
    try {
      const endpoint = tab === "email" ? "/api/auth/login" : "/api/auth/otp/verify";
      const body =
        tab === "email"
          ? { email, password }
          : { phone, code };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        setGlobalError(data.message || "登录失败");
        return;
      }

      // Store tokens in localStorage for client access
      if (data.data?.accessToken) {
        localStorage.setItem("pp_access_token", data.data.accessToken);
        localStorage.setItem("pp_refresh_token", data.data.refreshToken);
        localStorage.setItem("pp_user", JSON.stringify(data.data.user));
      }

      router.push("/dashboard");
    } catch {
      setGlobalError("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
      {/* Top bar with theme and language toggles */}
      <div className="fixed top-4 right-4 flex items-center gap-3">
        <ThemeToggle />
        <LanguageToggle />
      </div>

      <div className="w-full max-w-md space-y-8">
        {/* Logo / Header */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2 hover:opacity-80 transition-opacity">
              PortraitPay
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isZh ? "欢迎回来" : "Welcome Back"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {isZh ? "登录您的账户以继续" : "Sign in to continue"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {[
              { key: "email", label: isZh ? "邮箱登录" : "Email Login" },
              { key: "phone", label: isZh ? "手机验证码" : "Phone OTP" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => { setTab(t.key as Tab); setGlobalError(""); setEmailErrors({}); setPhoneErrors({}); }}
                className={`flex-1 py-3 text-sm font-medium transition-colors
                  ${tab === t.key
                    ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/20"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="p-6 space-y-5">
            {globalError && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 text-sm text-red-600 dark:text-red-400">
                {globalError}
              </div>
            )}

            {/* ── Email Login ─────────────────────────── */}
            {tab === "email" && (
              <>
                <Input
                  label={isZh ? "邮箱" : "Email"}
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailErrors((prev) => ({ ...prev, email: "" })); }}
                  error={emailErrors.email}
                  autoComplete="email"
                />
                <Input
                  label={isZh ? "密码" : "Password"}
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setEmailErrors((prev) => ({ ...prev, password: "" })); }}
                  error={emailErrors.password}
                  autoComplete="current-password"
                />
                <div className="flex justify-end">
                  <Link href="/forgot-password" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                    {isZh ? "忘记密码？" : "Forgot password?"}
                  </Link>
                </div>
              </>
            )}

            {/* ── Phone Login ─────────────────────────── */}
            {tab === "phone" && (
              <>
                <Input
                  label={isZh ? "手机号" : "Phone"}
                  type="tel"
                  placeholder={isZh ? "请输入中国大陆手机号" : "Enter Chinese mobile number"}
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setPhoneErrors((prev) => ({ ...prev, phone: "" })); setOtpSent(false); }}
                  error={phoneErrors.phone}
                  autoComplete="tel"
                />

                {otpSent && (
                  <>
                    <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg px-4 py-2 text-sm text-green-700 dark:text-green-400">
                      ✅ {isZh ? "验证码已发送至" : "Verification code sent to"} <strong>{otpSentTo}</strong>
                      {process.env.NODE_ENV === "development" && otpCode && (
                        <span className="ml-2 font-mono bg-green-200 dark:bg-green-800 px-1 rounded">
                          {otpCode}
                        </span>
                      )}
                    </div>
                    <Input
                      label={isZh ? "验证码" : "Verification Code"}
                      type="text"
                      placeholder={isZh ? "请输入6位验证码" : "Enter 6-digit code"}
                      maxLength={6}
                      value={code}
                      onChange={(e) => { setCode(e.target.value.replace(/\D/g, "")); setPhoneErrors((prev) => ({ ...prev, code: "" })); }}
                      error={phoneErrors.code}
                      inputMode="numeric"
                    />
                  </>
                )}

                <div className="flex gap-3">
                  {otpSent ? (
                    <Button
                      type="button"
                      variant="secondary"
                      size="md"
                      className="flex-1"
                      disabled={otpCountdown > 0}
                      onClick={handleSendOtp}
                    >
                      {otpCountdown > 0 ? `${otpCountdown}s ${isZh ? "后重发" : "resend"}` : (isZh ? "重新发送" : "Resend")}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="md"
                      className="flex-1"
                      onClick={handleSendOtp}
                      loading={loading}
                    >
                      {isZh ? "发送验证码" : "Send Code"}
                    </Button>
                  )}
                </div>
              </>
            )}

            <Button type="submit" size="lg" loading={loading} className="w-full">
              {isZh ? "登录" : "Sign In"}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          {isZh ? "还没有账户？" : "Don't have an account?"}{" "}
          <Link href="/register" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
            {isZh ? "立即注册" : "Register Now"}
          </Link>
        </p>
      </div>
    </div>
  );
}

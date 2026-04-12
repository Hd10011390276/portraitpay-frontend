"use client";
import { useState } from "react";
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
  const { locale } = useLanguage();
  const isZh = locale === "zh-CN";
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    phone: "",
    role: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (field: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setGlobalError("");
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!form.name.trim()) errs.name = isZh ? "姓名不能为空" : "Name is required";
    if (!form.email) errs.email = isZh ? "邮箱不能为空" : "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = isZh ? "请输入有效的邮箱地址" : "Please enter a valid email";
    if (!form.password) errs.password = isZh ? "密码不能为空" : "Password is required";
    else if (form.password.length < 8) errs.password = isZh ? "密码至少8位" : "Password must be at least 8 characters";
    else {
      if (!/[A-Z]/.test(form.password)) errs.password = isZh ? "密码需包含至少一个大写字母" : "Password must contain at least one uppercase letter";
      else if (!/[0-9]/.test(form.password)) errs.password = isZh ? "密码需包含至少一个数字" : "Password must contain at least one number";
    }
    if (!form.confirmPassword) errs.confirmPassword = isZh ? "请确认密码" : "Please confirm password";
    else if (form.password !== form.confirmPassword) errs.confirmPassword = isZh ? "两次密码不一致" : "Passwords do not match";
    if (!form.role) errs.role = isZh ? "请选择角色" : "Please select a role";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setGlobalError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          confirmPassword: form.confirmPassword,
          name: form.name,
          phone: form.phone || undefined,
          role: form.role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          setErrors((prev) => ({ ...prev, ...data.errors }));
        } else {
          setGlobalError(data.message || (isZh ? "注册失败" : "Registration failed"));
        }
        return;
      }

      if (data.data?.accessToken) {
        localStorage.setItem("pp_access_token", data.data.accessToken);
        localStorage.setItem("pp_refresh_token", data.data.refreshToken);
        localStorage.setItem("pp_user", JSON.stringify(data.data.user));
      }

      router.push("/dashboard");
    } catch {
      setGlobalError(isZh ? "网络错误，请稍后重试" : "Network error, please try again");
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

      <div className="w-full max-w-lg space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2 hover:opacity-80 transition-opacity">
              PortraitPay
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isZh ? "创建账户" : "Create Account"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {isZh ? "加入 PortraitPay，开启数字艺术之旅" : "Join PortraitPay and start your digital art journey"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            {globalError && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 text-sm text-red-600 dark:text-red-400">
                {globalError}
              </div>
            )}

            <Input
              label={isZh ? "姓名" : "Name"}
              type="text"
              placeholder={isZh ? "请输入真实姓名" : "Enter your real name"}
              value={form.name}
              onChange={set("name")}
              error={errors.name}
              autoComplete="name"
            />

            <Input
              label={isZh ? "邮箱" : "Email"}
              type="email"
              placeholder="your@email.com"
              value={form.email}
              onChange={set("email")}
              error={errors.email}
              autoComplete="email"
            />

            <Input
              label={isZh ? "手机号（选填）" : "Phone (Optional)"}
              type="tel"
              placeholder={isZh ? "可后续绑定" : "Can be added later"}
              value={form.phone}
              onChange={set("phone")}
              error={errors.phone}
              autoComplete="tel"
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label={isZh ? "密码" : "Password"}
                type="password"
                placeholder={isZh ? "8位，含大写字母和数字" : "8+ chars with uppercase & number"}
                value={form.password}
                onChange={set("password")}
                error={errors.password}
                autoComplete="new-password"
              />
              <Input
                label={isZh ? "确认密码" : "Confirm Password"}
                type="password"
                placeholder={isZh ? "再次输入密码" : "Re-enter password"}
                value={form.confirmPassword}
                onChange={set("confirmPassword")}
                error={errors.confirmPassword}
                autoComplete="new-password"
              />
            </div>

            <RoleSelector
              value={form.role}
              onChange={(val) => { setForm((prev) => ({ ...prev, role: val })); setErrors((prev) => ({ ...prev, role: "" })); }}
              error={errors.role}
            />

            <Button type="submit" size="lg" loading={loading} className="w-full">
              {isZh ? "注册" : "Register"}
            </Button>
          </form>

          <p className="text-xs text-center text-gray-400 dark:text-gray-500">
            {isZh ? "注册即表示同意" : "By registering, you agree to"}{" "}
            <a href="/terms" className="text-blue-600 dark:text-blue-400 hover:underline">
              {isZh ? "服务条款" : "Terms of Service"}
            </a>{" "}
            {isZh ? "和" : "and"}{" "}
            <a href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">
              {isZh ? "隐私政策" : "Privacy Policy"}
            </a>
          </p>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          {isZh ? "已有账户？" : "Already have an account?"}{" "}
          <Link href="/login" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
            {isZh ? "立即登录" : "Sign In"}
          </Link>
        </p>
      </div>
    </div>
  );
}

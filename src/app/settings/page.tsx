"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useToast, ToastProvider } from "@/components/ui/Toast";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { useLanguage } from "@/context/LanguageContext";

function SettingsContent() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [user, setUser] = useState<{ id: string; email: string; name: string | null; walletAddress?: string | null } | null>(null);
  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [infringementAlerts, setInfringementAlerts] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [bindingWallet, setBindingWallet] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("pp_user");
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }
    // Fetch latest user data from API
    fetch("/api/user")
      .then((r) => r.json())
      .then((j) => {
        if (j.success && j.data.user) {
          setUser(j.data.user);
          setWalletAddress(j.data.user.walletAddress || "");
        }
      })
      .catch(console.error)
      .finally(() => setChecking(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    // TODO: Persist notification preferences once DB migration is applied
    // (emailNotifications, infringementAlerts, marketingEmails)
    await new Promise((r) => setTimeout(r, 800));
    toast({ type: "success", title: t.settings.settingsSaved });
    setSaving(false);
  };

  const handleDeleteAccount = () => {
    const confirmed = window.confirm(t.settings.deleteAccountConfirm || "Are you sure you want to delete your account? This action cannot be undone.");
    if (confirmed) {
      // TODO: Call API to delete account
      toast({ type: "error", title: t.settings.deleteAccountError || "Account deletion requires contacting support" });
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin h-8 w-8 border-2 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <DashboardShell
      title={t.settings.title}
      subtitle={t.settings.subtitle}
    >
      <div className="max-w-3xl">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Notification Settings */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-5">{t.settings.notificationSettings}</h2>
            <div className="space-y-4">
              {[
                {
                  id: "emailNotifications",
                  label: t.settings.emailNotifications,
                  desc: t.settings.emailNotificationsDesc,
                  checked: emailNotifications,
                  onChange: setEmailNotifications,
                },
                {
                  id: "infringementAlerts",
                  label: t.settings.infringementAlerts,
                  desc: t.settings.infringementAlertsDesc,
                  checked: infringementAlerts,
                  onChange: setInfringementAlerts,
                },
                {
                  id: "marketingEmails",
                  label: t.settings.marketingEmails,
                  desc: t.settings.marketingEmailsDesc,
                  checked: marketingEmails,
                  onChange: setMarketingEmails,
                },
              ].map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.desc}</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={item.checked}
                    onClick={() => item.onChange(!item.checked)}
                    className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                      item.checked ? "bg-purple-600" : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        item.checked ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Account Info */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-5">{t.settings.accountInfo}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t.settings.emailAddress}</label>
                <input
                  type="email"
                  id="email"
                  defaultValue={user?.email || ""}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t.settings.displayName}</label>
                <input
                  type="text"
                  id="name"
                  defaultValue={user?.name || ""}
                  placeholder={t.settings.namePlaceholder || "设置您的显示名称"}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Wallet Binding */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">{t.settings.walletBinding}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{t.settings.walletBindingDesc}</p>

            {user?.walletAddress ? (
              <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-xl border border-green-200 dark:border-green-800">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t.settings.walletAddress}</p>
                  <p className="text-sm font-mono text-gray-900 dark:text-white truncate">{user.walletAddress}</p>
                </div>
                <span className="px-2 py-1 text-xs font-medium text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 rounded-full shrink-0">
                  {t.settings.walletBound}
                </span>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <input
                    type="text"
                    id="walletAddress"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder={t.settings.walletAddressPlaceholder}
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-400 mt-1">{t.settings.walletAddressHint}</p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    if (!walletAddress) return;
                    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
                      toast({ type: "error", title: t.settings.invalidWalletAddress });
                      return;
                    }
                    setBindingWallet(true);
                    try {
                      const res = await fetch("/api/user", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ walletAddress }),
                      });
                      const json = await res.json();
                      if (json.success) {
                        setUser((prev) => prev ? { ...prev, walletAddress } : prev);
                        toast({ type: "success", title: t.settings.walletBindSuccess });
                      } else {
                        toast({ type: "error", title: json.error || t.settings.walletBindError });
                      }
                    } catch {
                      toast({ type: "error", title: t.settings.walletBindError });
                    } finally {
                      setBindingWallet(false);
                    }
                  }}
                  disabled={bindingWallet || !walletAddress}
                  className="px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {bindingWallet ? t.settings.saving : t.settings.bindWallet}
                </button>
              </div>
            )}
          </div>

          {/* Danger Zone */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-red-200 dark:border-red-900/50 p-6">
            <h2 className="text-base font-semibold text-red-600 dark:text-red-400 mb-5">{t.settings.dangerZone}</h2>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{t.settings.deleteAccount}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t.settings.deleteAccountDesc}</p>
                </div>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition shrink-0"
                >
                  {t.settings.deleteAccount}
                </button>
              </div>
            </div>
          </div>

          {/* Save */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-purple-600 text-white text-sm font-semibold rounded-xl hover:bg-purple-700 disabled:opacity-60 transition flex items-center gap-2"
            >
              {saving ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  {t.settings.saving}
                </>
              ) : (
                t.settings.saveSettings
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardShell>
  );
}

export default function SettingsPage() {
  return (
    <ToastProvider>
      <SettingsContent />
    </ToastProvider>
  );
}

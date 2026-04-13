"use client";

import { useState } from "react";
import Link from "next/link";
import { useToast, ToastProvider } from "@/components/ui/Toast";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { useLanguage } from "@/context/LanguageContext";

function SettingsContent() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [infringementAlerts, setInfringementAlerts] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    toast({ type: "success", title: "设置已保存" });
    setSaving(false);
  };

  return (
    <DashboardShell
      title="账户设置"
      subtitle="管理您的账户偏好设置和通知"
    >
      <div className="max-w-3xl">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Notification Settings */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-5">通知设置</h2>
            <div className="space-y-4">
              {[
                {
                  id: "emailNotifications",
                  label: "邮件通知",
                  desc: "接收关于账户安全的邮件通知（如异地登录）",
                  checked: emailNotifications,
                  onChange: setEmailNotifications,
                },
                {
                  id: "infringementAlerts",
                  label: "侵权警报",
                  desc: "当我们的 AI 检测到疑似侵权行为时发送通知",
                  checked: infringementAlerts,
                  onChange: setInfringementAlerts,
                },
                {
                  id: "marketingEmails",
                  label: "产品更新与优惠",
                  desc: "接收新功能公告和限时优惠信息",
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
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-5">账户信息</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">邮箱地址</label>
                <input
                  type="email"
                  defaultValue="user@example.com"
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">显示名称</label>
                <input
                  type="text"
                  defaultValue="用户名"
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-red-200 dark:border-red-900/50 p-6">
            <h2 className="text-base font-semibold text-red-600 dark:text-red-400 mb-5">危险区域</h2>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">注销账户</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">永久删除您的账户和所有数据。区块链记录除外。</p>
                </div>
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition shrink-0"
                >
                  注销账户
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
                  保存中...
                </>
              ) : (
                "保存设置"
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

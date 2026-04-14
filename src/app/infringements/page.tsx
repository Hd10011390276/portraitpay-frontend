"use client";

/**
 * Infringement Report Management Page
 * Route: /infringements
 *
 * Lists all infringement reports for the current user.
 * Provides tabs: "My Reports" | "System Alerts" | "Monitor Settings"
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { useLanguage } from "@/context/LanguageContext";

type ReportStatus = "PENDING_REVIEW" | "VALIDATED" | "REJECTED" | "SETTLED" | "LEGAL_ACTION";
type AlertStatus = "PENDING" | "CONFIRMED" | "FALSE_POSITIVE" | "EXPIRED";

export default function InfringementsPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"reports" | "alerts" | "settings">("reports");
  const [reports, setReports] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<any>(null);

  // Config form state
  const [configForm, setConfigForm] = useState({
    enabled: true,
    similarityThreshold: 0.85,
    notifyEmail: true,
    notifySms: false,
    quietHoursStart: "22:00",
    quietHoursEnd: "08:00",
    highPriorityMuteExempt: true,
  });

  useEffect(() => {
    if (activeTab === "reports") fetchReports();
    else if (activeTab === "alerts") fetchAlerts();
    else if (activeTab === "settings") fetchConfig();
  }, [activeTab]);

  async function fetchReports() {
    setLoading(true);
    try {
      const res = await fetch("/api/infringements?limit=50");
      const json = await res.json();
      if (json.success) setReports(json.data);
    } finally {
      setLoading(false);
    }
  }

  async function fetchAlerts() {
    setLoading(true);
    try {
      const res = await fetch("/api/infringements/alerts?limit=50");
      const json = await res.json();
      if (json.success) setAlerts(json.data);
    } finally {
      setLoading(false);
    }
  }

  async function fetchConfig() {
    const res = await fetch("/api/infringements/config");
    const json = await res.json();
    if (json.data) {
      setConfig(json.data);
      setConfigForm({
        enabled: json.data.enabled ?? true,
        similarityThreshold: json.data.similarityThreshold ?? 0.85,
        notifyEmail: json.data.notifyEmail ?? true,
        notifySms: json.data.notifySms ?? false,
        quietHoursStart: json.data.quietHoursStart ?? "22:00",
        quietHoursEnd: json.data.quietHoursEnd ?? "08:00",
        highPriorityMuteExempt: json.data.highPriorityMuteExempt ?? true,
      });
    }
  }

  async function saveConfig(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/infringements/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(configForm),
    });
    const json = await res.json();
    if (json.success) alert(t.infringements.settingsSaved);
  }

  async function confirmAlert(alertId: string, decision: "CONFIRMED" | "FALSE_POSITIVE") {
    const res = await fetch("/api/infringements/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alertId, decision }),
    });
    const json = await res.json();
    if (json.success) {
      fetchAlerts();
    } else {
      alert(json.error ?? "操作失败");
    }
  }

  return (
    <DashboardShell
      title={t.infringements.title}
      subtitle={t.infringements.subtitle}
      action={
        <Link
          href="/report"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + {t.infringements.submitNew}
        </Link>
      }
    >
      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-lg bg-gray-200 dark:bg-gray-800 p-1">
        {[
          { key: "reports", label: t.infringements.myReports },
          { key: "alerts", label: t.infringements.systemAlerts },
          { key: "settings", label: t.infringements.monitorSettings },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition ${
              activeTab === tab.key
                ? "bg-white dark:bg-gray-700 text-blue-700 dark:text-blue-300 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Reports Tab ── */}
      {activeTab === "reports" && (
        <div className="space-y-4">
          {loading ? (
            <p className="text-center text-gray-500 dark:text-gray-400">{t.infringements.loading}</p>
          ) : reports.length === 0 ? (
            <div className="rounded-lg bg-white dark:bg-gray-900 py-16 text-center text-gray-500 dark:text-gray-400">
              {t.infringements.noReports}
              <Link href="/report" className="ml-2 text-blue-600 dark:text-blue-400 underline">{t.infringements.reportNow}</Link>
            </div>
          ) : (
            reports.map((report) => {
              const statusLabel = t.infringements[report.status as ReportStatus] ?? report.status;
              return (
                <Link key={report.id} href={`/infringements/${report.id}`}>
                  <div className="flex items-center justify-between rounded-lg bg-white dark:bg-gray-900 p-5 shadow-sm hover:shadow-md transition border border-gray-100 dark:border-gray-800">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          report.status === "PENDING_REVIEW" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" :
                          report.status === "VALIDATED" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" :
                          report.status === "REJECTED" ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" :
                          report.status === "SETTLED" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" :
                          "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                        }`}>
                          {statusLabel}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">{report.source}</span>
                      </div>
                      <p className="truncate font-medium text-gray-900 dark:text-white">{report.portrait?.title ?? t.portraits.details}</p>
                      <p className="mt-0.5 truncate text-sm text-gray-500 dark:text-gray-400">{report.description}</p>
                      <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                        {new Date(report.createdAt).toLocaleString()} &nbsp;|&nbsp; ID: {report.id.slice(0, 8)}...
                      </p>
                    </div>
                    <div className="ml-4 flex-shrink-0 text-gray-400 dark:text-gray-500">›</div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      )}

      {/* ── Alerts Tab ── */}
      {activeTab === "alerts" && (
        <div className="space-y-4">
          {loading ? (
            <p className="text-center text-gray-500 dark:text-gray-400">{t.infringements.loading}</p>
          ) : alerts.length === 0 ? (
            <div className="rounded-lg bg-white dark:bg-gray-900 py-16 text-center text-gray-500 dark:text-gray-400">
              {t.infringements.noAlerts}
            </div>
          ) : (
            alerts.map((alert) => {
              const statusLabel = t.infringements[alert.status as AlertStatus] ?? alert.status;
              return (
                <div key={alert.id} className="rounded-lg bg-white dark:bg-gray-900 p-5 shadow-sm border border-gray-100 dark:border-gray-800">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          alert.status === "PENDING" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" :
                          alert.status === "CONFIRMED" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" :
                          alert.status === "FALSE_POSITIVE" ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" :
                          "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
                        }`}>
                          {statusLabel}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{alert.sourceName}</span>
                        {alert.similarityScore && (
                          <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                            {t.infringements.similarity} {(alert.similarityScore * 100).toFixed(1)}%
                          </span>
                        )}
                      </div>
                      <p className="font-medium text-gray-900 dark:text-white">{alert.portrait?.title}</p>
                      <a href={alert.sourceUrl} target="_blank" rel="noopener noreferrer"
                        className="mt-0.5 block truncate text-sm text-blue-600 dark:text-blue-400 underline">
                        {alert.sourceUrl}
                      </a>
                      <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                        {new Date(alert.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {alert.status === "PENDING" && (
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => confirmAlert(alert.id, "CONFIRMED")}
                          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                        >
                          {t.infringements.confirmedInfringement}
                        </button>
                        <button
                          onClick={() => confirmAlert(alert.id, "FALSE_POSITIVE")}
                          className="rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          {t.infringements.falsePositive}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── Settings Tab ── */}
      {activeTab === "settings" && (
        <form onSubmit={saveConfig} className="space-y-6 rounded-xl bg-white dark:bg-gray-900 p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t.infringements.monitoringConfig}</h2>

          <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{t.infringements.enableMonitoring}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t.infringements.enableMonitoringDesc}</p>
            </div>
            <input
              type="checkbox"
              checked={configForm.enabled}
              onChange={(e) => setConfigForm((f) => ({ ...f, enabled: e.target.checked }))}
              className="h-5 w-5 rounded"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-900 dark:text-white">
              {t.infringements.similarityThreshold}：{Math.round(configForm.similarityThreshold * 100)}%
            </label>
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">{t.infringements.similarityThresholdDesc}</p>
            <input
              type="range"
              min="0.5"
              max="1.0"
              step="0.01"
              value={configForm.similarityThreshold}
              onChange={(e) => setConfigForm((f) => ({ ...f, similarityThreshold: parseFloat(e.target.value) }))}
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <p className="font-medium text-gray-900 dark:text-white">{t.infringements.notificationChannel}</p>
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={configForm.notifyEmail}
                onChange={(e) => setConfigForm((f) => ({ ...f, notifyEmail: e.target.checked }))}
                className="h-4 w-4" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{t.infringements.emailNotification}</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={configForm.notifySms}
                onChange={(e) => setConfigForm((f) => ({ ...f, notifySms: e.target.checked }))}
                className="h-4 w-4" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{t.infringements.smsNotification}</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t.infringements.quietHoursStart}</label>
              <input type="time" value={configForm.quietHoursStart}
                onChange={(e) => setConfigForm((f) => ({ ...f, quietHoursStart: e.target.value }))}
                className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t.infringements.quietHoursEnd}</label>
              <input type="time" value={configForm.quietHoursEnd}
                onChange={(e) => setConfigForm((f) => ({ ...f, quietHoursEnd: e.target.value }))}
                className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={configForm.highPriorityMuteExempt}
                onChange={(e) => setConfigForm((f) => ({ ...f, highPriorityMuteExempt: e.target.checked }))}
                className="h-4 w-4" />
              <div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{t.infringements.highPriorityExempt}</span>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t.infringements.highPriorityExemptDesc}</p>
              </div>
            </label>
          </div>

          <button type="submit"
            className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700">
            {t.infringements.saveSettings}
          </button>
        </form>
      )}
    </DashboardShell>
  );
}

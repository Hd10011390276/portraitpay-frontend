"use client";

/**
 * Infringement Report Management Page
 * Route: /infringements
 *
 * Lists all infringement reports for the current user.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { useLanguage } from "@/context/LanguageContext";

type ReportStatus = "PENDING_REVIEW" | "VALIDATED" | "REJECTED" | "SETTLED" | "LEGAL_ACTION";

export default function InfringementsPage() {
  const { t } = useLanguage();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

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
                    <p className="truncate font-medium text-gray-900 dark:text-white">{report.portrait?.title ?? t.portraits.detail.details}</p>
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
    </DashboardShell>
  );
}

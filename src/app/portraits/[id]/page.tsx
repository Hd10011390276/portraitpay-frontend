/**
 * /portraits/[id] - Portrait detail page
 * Shows portrait info, blockchain certificate, and action buttons
 */

"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { getIpfsGatewayUrl } from "@/lib/ipfs";
import { useLanguage } from "@/context/LanguageContext";

interface PortraitDetail {
  id: string;
  title: string;
  description?: string | null;
  category: string;
  tags: string[];
  status: string;
  originalImageUrl?: string | null;
  thumbnailUrl?: string | null;
  imageHash?: string | null;
  blockchainTxHash?: string | null;
  blockchainNetwork?: string | null;
  ipfsCid?: string | null;
  certifiedAt?: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    displayName?: string | null;
    walletAddress?: string | null;
    kycStatus: string;
  };
}

export default function PortraitDetailPage() {
  const { t } = useLanguage();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [portrait, setPortrait] = useState<PortraitDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [certifying, setCertifying] = useState(false);
  const [certifyMsg, setCertifyMsg] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`/api/portraits/${id}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setPortrait(j.data);
        else router.push("/portraits");
      })
      .catch(() => router.push("/portraits"))
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleDownloadPortrait = async () => {
    try {
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const req = indexedDB.open("portraitpay-local", 1);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
      const record = await new Promise<{ imageBlob: Blob } | undefined>((resolve, reject) => {
        const tx = db.transaction("portraits", "readonly");
        const store = tx.objectStore("portraits");
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result as { imageBlob: Blob } | undefined);
        req.onerror = () => reject(req.error);
      });
      if (!record?.imageBlob) { alert("未找到本地图片"); return; }
      const url = URL.createObjectURL(record.imageBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${portrait?.title ?? "portrait"}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      alert("照片已保存到下载文件夹");
    } catch { alert("下载失败，请稍后重试"); }
  };

  const handleCertify = async () => {
    if (!confirm(tc.certifyConfirm)) return;

    setCertifying(true);
    setCertifyMsg(tc.certifyStepHash);

    try {
      const steps = [
        tc.certifyStepHash,
        tc.certifyStepUploadMeta,
        tc.certifyStepMint,
        tc.certifyStepConfirm,
      ];

      let stepIdx = 0;
      const interval = setInterval(() => {
        if (stepIdx < steps.length - 1) setCertifyMsg(steps[++stepIdx]);
      }, 3000);

      const res = await fetch(`/api/portraits/${id}/certify`, { method: "POST" });
      clearInterval(interval);

      const json = await res.json();
      if (!json.success) {
        setCertifyMsg(`${tc.certifyFailed}${json.error}`);
        setTimeout(() => setCertifyMsg(""), 5000);
        return;
      }

      setCertifyMsg(`${tc.certifySuccess}${json.data.blockNumber}`);
      setTimeout(() => setCertifyMsg(""), 8000);

      const refreshed = await fetch(`/api/portraits/${id}`).then((r) => r.json());
      if (refreshed.success) setPortrait(refreshed.data);
    } catch (err) {
      setCertifyMsg(tc.certifyNetworkError);
      setTimeout(() => setCertifyMsg(""), 5000);
    } finally {
      setCertifying(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(tc.archiveConfirm)) return;

    setDeleting(true);
    try {
      await fetch(`/api/portraits/${id}`, { method: "DELETE" });
      router.push("/portraits");
    } catch {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin h-10 w-10 border-3 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!portrait) return null;

  const ipfsGatewayUrl = portrait.ipfsCid ? getIpfsGatewayUrl(portrait.ipfsCid) : null;
  const tc = t.portraits.detail; // Define tc early so it's available in handlers

  const hasImage = !!portrait.originalImageUrl;

  return (
    <DashboardShell
      title={portrait.title}
      subtitle={`Status: ${portrait.status}`}
      action={
        <Link href="/portraits" className="text-gray-500 hover:text-gray-700 text-sm">
          ← {tc.back}
        </Link>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">

        {/* LEFT: Image - always square, compact lock placeholder when no image */}
        <div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="relative" style={{ aspectRatio: "1" }}>
              {hasImage ? (
                <img
                  src={portrait.originalImageUrl!}
                  alt={portrait.title}
                  className="w-full h-full object-contain bg-gray-50 dark:bg-gray-800"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                  <div className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                    <span className="text-base">🔒</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">本地存储</p>
                    <button
                      type="button"
                      onClick={handleDownloadPortrait}
                      className="ml-1 px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-md flex items-center gap-0.5 transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      下载
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Details + Blockchain certificate (now alongside details) */}
        <div className="flex flex-col gap-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">{tc.details}</h2>
            <div className="space-y-3 text-sm">
              {portrait.description && (
                <div>
                  <p className="text-gray-500 dark:text-gray-400 mb-1">{tc.description}</p>
                  <p className="text-gray-800 dark:text-gray-200">{portrait.description}</p>
                </div>
              )}
              <div className="flex gap-2">
                <span className="text-gray-500 dark:text-gray-400">{tc.category}</span>
                <span className="text-gray-900 dark:text-white">{portrait.category}</span>
              </div>
              {portrait.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {portrait.tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <span className="text-gray-500 dark:text-gray-400">{tc.visibility}</span>
                <span className={portrait.isPublic ? "text-green-600 dark:text-green-400" : "text-gray-400"}>
                  {portrait.isPublic ? tc.public : tc.private}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-500 dark:text-gray-400">{tc.created}</span>
                <span className="text-gray-900 dark:text-white">
                  {new Date(portrait.createdAt).toLocaleDateString("zh-CN", { timeZone: "Asia/Shanghai" })}
                </span>
              </div>
            </div>
          </div>

          {portrait.blockchainTxHash ? (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-purple-200 dark:border-purple-800 p-5">
              <h3 className="font-semibold text-purple-900 dark:text-purple-300 mb-3 flex items-center gap-2">
                <span>📜</span> {tc.blockchainCertificate}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex gap-2">
                  <span className="text-gray-500 dark:text-gray-400 w-24 shrink-0">{tc.network}</span>
                  <span className="text-gray-900 dark:text-white font-medium">{portrait.blockchainNetwork?.toUpperCase() ?? "Sepolia"}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-gray-500 dark:text-gray-400 w-24 shrink-0">{tc.txHash}</span>
                  <a href={`https://sepolia.etherscan.io/tx/${portrait.blockchainTxHash}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 font-mono text-xs hover:underline break-all">{portrait.blockchainTxHash}</a>
                </div>
                {portrait.ipfsCid && (
                  <div className="flex gap-2">
                    <span className="text-gray-500 dark:text-gray-400 w-24 shrink-0">{tc.ipfsCid}</span>
                    <a href={ipfsGatewayUrl ?? undefined} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 font-mono text-xs hover:underline break-all">{portrait.ipfsCid}</a>
                  </div>
                )}
                {portrait.imageHash && (
                  <div className="flex gap-2">
                    <span className="text-gray-500 dark:text-gray-400 w-24 shrink-0">{tc.imageHash}</span>
                    <span className="text-gray-700 dark:text-gray-300 font-mono text-xs break-all">{portrait.imageHash}</span>
                  </div>
                )}
                {portrait.certifiedAt && (
                  <div className="flex gap-2">
                    <span className="text-gray-500 dark:text-gray-400 w-24 shrink-0">{tc.certifiedAt}</span>
                    <span className="text-gray-900 dark:text-white text-xs">{new Date(portrait.certifiedAt).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 rounded-xl border border-purple-100 dark:border-purple-900/50 p-5">
              <h2 className="font-semibold text-purple-900 dark:text-purple-300 mb-2">{tc.notCertified}</h2>
              <p className="text-sm text-purple-700 dark:text-purple-400 mb-3">{tc.notCertifiedDesc}</p>
              {portrait.imageHash && (
                <div className="mb-3 p-2 bg-white/60 dark:bg-gray-900/60 rounded-lg">
                  <p className="text-xs text-gray-400 mb-0.5">{tc.imageHash}</p>
                  <p className="text-xs font-mono text-gray-600 dark:text-gray-300 break-all">{portrait.imageHash}</p>
                </div>
              )}
              {certifyMsg && (
                <div className="mb-3 p-3 bg-white dark:bg-gray-900 rounded-lg text-sm text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  {certifying && <div className="flex items-center gap-2 mb-1"><div className="animate-spin h-3 w-3 border-2 border-purple-500 border-t-transparent rounded-full" /></div>}
                  {certifyMsg}
                </div>
              )}
              <button onClick={handleCertify} disabled={certifying || !portrait.imageHash} className="w-full px-4 py-2.5 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {certifying ? tc.certifying : tc.certifyOnBlockchain}
              </button>
              {!portrait.imageHash && <p className="text-xs text-center text-purple-500 dark:text-purple-400 mt-2">{tc.imageHashNotAvailable}</p>}
            </div>
          )}

          <div className="flex gap-3">
            <Link href={`/portraits/${id}/edit`} className="flex-1 px-4 py-2 text-center text-sm font-medium bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">{tc.edit}</Link>
            <button onClick={handleDelete} disabled={deleting} className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-50">{deleting ? tc.archiving : tc.archive}</button>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{tc.owner}</p>
            <p className="font-medium text-gray-900 dark:text-white">{portrait.owner.displayName ?? "—"}</p>
            {portrait.owner.walletAddress && <p className="text-xs font-mono text-gray-500 dark:text-gray-400 mt-0.5">{portrait.owner.walletAddress}</p>}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

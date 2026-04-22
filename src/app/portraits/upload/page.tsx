/**
 * /portraits/upload — Portrait upload page
 * Simplified: upload portrait image, save locally, optionally certify on blockchain.
 */

"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import UploadZone from "@/components/portrait/UploadZone";
import ImageCropper from "@/components/portrait/ImageCropper";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { useLanguage } from "@/context/LanguageContext";

type Stage = "form" | "uploading" | "certifying" | "certify_done" | "done";

const DB_NAME = "portraitpay-local";
const DB_VERSION = 1;

// ── IndexedDB helpers ──────────────────────────────────────────────
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("portraits")) {
        db.createObjectStore("portraits", { keyPath: "portraitId" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function savePortraitLocally(portraitId: string, imageBlob: Blob) {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction("portraits", "readwrite");
    const store = tx.objectStore("portraits");
    const req = store.put({ portraitId, imageBlob, savedAt: Date.now() });
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export default function UploadPortraitPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [stage, setStage] = useState<Stage>("form");
  const [croppedFile, setCroppedFile] = useState<File | null>(null);
  const [imageHash, setImageHash] = useState<string | null>(null);
  const [progress, setProgress] = useState("");
  const [certifyResult, setCertifyResult] = useState<{ success: boolean; error?: string; data?: any } | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "general",
    tags: "",
    isPublic: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const computeHash = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  const handleFileSelected = useCallback(async (file: File) => {
    setCroppedFile(file);
    setErrors((prev) => ({ ...prev, image: "" }));
    try {
      const hash = await computeHash(file);
      setImageHash(hash);
    } catch (e) {
      console.error("Hash computation failed:", e);
    }
  }, []);

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = t.upload?.titleRequiredError || "Title is required";
    if (form.title.length > 200) errs.title = "Title too long";
    if (!croppedFile) errs.image = t.upload?.imageRequiredError || "Portrait image is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setStage("uploading");
    setProgress("Creating portrait record...");

    try {
      // Step 1: Create portrait record
      const createRes = await fetch("/api/portraits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description || undefined,
          category: form.category,
          tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
          isPublic: form.isPublic,
          imageHash,
        }),
      });

      const createJson = await createRes.json();
      if (!createJson.success) throw new Error(createJson.error);
      const id = createJson.data.id as string;

      setProgress("Uploading image to storage...");

      // Step 2: Get presigned URL and upload to S3
      const presignedRes = await fetch(`/api/portraits/${id}/upload`);
      if (!presignedRes.ok) throw new Error("Failed to get upload URL");
      const { data: uploadUrls } = await presignedRes.json();

      const s3UploadRes = await fetch(uploadUrls.original.uploadUrl, {
        method: "PUT",
        body: croppedFile,
        headers: { "Content-Type": "image/jpeg" },
      });
      if (!s3UploadRes.ok) throw new Error("S3 upload failed");
      const originalImageUrl = uploadUrls.original.objectUrl;

      // Save locally
      await savePortraitLocally(id, croppedFile!);

      // Register URL with portrait record
      setProgress("Saving...");
      const updateRes = await fetch(`/api/portraits/${id}/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originalImageUrl, imageHash }),
      });
      const updateJson = await updateRes.json();
      if (!updateJson.success) throw new Error(updateJson.error);

      setProgress("Portrait saved! Starting blockchain certification...");
      setStage("certifying");

      // Step 3: Blockchain certify
      let result: { success: boolean; error?: string; data?: any } = { success: false };
      try {
        const certifyRes = await fetch(`/api/portraits/${id}/certify`, { method: "POST" });
        result = await certifyRes.json();
        setCertifyResult(result);
      } catch (certErr) {
        result = { success: false, error: (certErr as Error).message };
        setCertifyResult(result);
      }

      if (result.success) {
        setProgress(`Blockchain certified! Tx: ${result.data?.blockchainTxHash?.slice(0, 10)}...`);
        setStage("certify_done");
      } else {
        setProgress(`Saved. Certification deferred: ${result.error ?? "unknown"}`);
        setStage("certify_done");
      }

      setTimeout(() => router.push("/portraits"), 3000);
    } catch (err) {
      console.error("Upload failed:", err);
      setProgress(`Error: ${(err as Error).message}`);
      setTimeout(() => setStage("form"), 3000);
    }
  };

  if (stage === "certifying" || stage === "certify_done") {
    return (
      <DashboardShell title={t.upload?.title || "上传肖像"} subtitle={t.upload?.subtitle || "上传并认证你的肖像"}>
        <div className="max-w-3xl">
          <div className="text-center py-16">
            <div className="text-6xl mb-4">{stage === "certifying" ? "🔗" : "✅"}</div>
            <h2 className="text-xl font-semibold mb-2">
              {stage === "certifying"
                ? (t.upload?.certifyingBlockchain || "区块链认证中...")
                : (certifyResult?.success
                  ? (t.upload?.certifySuccess || "区块链认证完成！")
                  : (t.upload?.certifyDeferred || "肖像已保存，认证稍后进行"))}
            </h2>
            <p className="text-gray-500">
              {stage === "certifying"
                ? (t.upload?.certifyingDesc || "正在将肖像元数据上传至 IPFS 并写入区块链...")
                : certifyResult?.success
                  ? (t.upload?.certifySuccessDesc || "你的肖像已在区块链上获得认证，永久不可篡改")
                  : (t.upload?.certifyDeferredDesc || "认证失败，请稍后在详情页重试")}
            </p>
            {progress && <p className="mt-4 text-sm text-gray-400 font-mono">{progress}</p>}
            {stage === "certifying" && (
              <div className="mt-6 flex justify-center">
                <div className="animate-spin h-8 w-8 border-2 border-purple-500 border-t-transparent rounded-full" />
              </div>
            )}
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell title={t.upload?.title || "上传肖像"} subtitle={t.upload?.subtitle || "上传并认证你的肖像"}>
      <div className="max-w-3xl">
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">

          {/* Notice */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <p className="text-sm text-blue-700 dark:text-blue-400">
              🔒 <strong>隐私优先：</strong>肖像图像将上传至 S3 存储，SHA-256 哈希用于区块链存证。
            </p>
          </div>

          {/* Portrait Image */}
          <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              📸 {t.upload?.portraitImage || "肖像照片"}
            </h2>
            <UploadZone onFileSelected={handleFileSelected} maxSizeMB={10} />
            {errors.image && <p className="mt-2 text-sm text-red-600">{errors.image}</p>}
            {imageHash && (
              <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-400">SHA-256</p>
                <p className="text-xs font-mono text-gray-600 dark:text-gray-400 break-all">{imageHash}</p>
              </div>
            )}
          </section>

          {/* Form Fields */}
          <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">{t.upload?.details || "详细信息"}</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.upload?.titleLabel || "标题"} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => { setForm((f) => ({ ...f, title: e.target.value })); setErrors((prev) => ({ ...prev, title: "" })); }}
                placeholder={t.upload?.titlePlaceholder || "添加标题..."}
                maxLength={200}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.upload?.descriptionLabel || "描述"}</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder={t.upload?.descriptionPlaceholder || "添加描述..."}
                rows={3}
                maxLength={2000}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.upload?.categoryLabel || "类别"}</label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                <option value="general">{t.upload?.categoryGeneral || "普通"}</option>
                <option value="celebrity">{t.upload?.categoryCelebrity || "名人"}</option>
                <option value="artist">{t.upload?.categoryArtist || "艺术家"}</option>
                <option value="athlete">{t.upload?.categoryAthlete || "运动员"}</option>
                <option value="business">{t.upload?.categoryBusiness || "商务"}</option>
                <option value="political">{t.upload?.categoryPolitical || "政界"}</option>
                <option value="other">{t.upload?.categoryOther || "其他"}</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, isPublic: !f.isPublic }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.isPublic ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${form.isPublic ? "translate-x-6" : "translate-x-1"}`} />
              </button>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.upload?.publicListing || "公开可见"}</p>
                <p className="text-xs text-gray-400">{t.upload?.publicListingDesc || "允许他人查找此肖像"}</p>
              </div>
            </div>
          </section>

          {/* Submit */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <button
              type="submit"
              disabled={stage === "uploading"}
              className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full sm:w-auto">
              {stage === "uploading" ? (t.upload?.uploading || "保存中...") : (t.upload?.createPortrait || "创建肖像")}
            </button>
            {stage === "uploading" && progress && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                <span>{progress}</span>
              </div>
            )}
            <button
              type="button"
              onClick={() => router.push("/portraits")}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
              {t.upload?.cancel || "取消"}
            </button>
          </div>
        </form>
      </div>
    </DashboardShell>
  );
}

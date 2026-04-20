/**
 * /portraits/upload — Portrait upload page
 * Images stored locally in browser IndexedDB.
 * Only SHA-256 hash + metadata go to the server.
 */

"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import UploadZone from "@/components/portrait/UploadZone";
import ImageCropper from "@/components/portrait/ImageCropper";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { useLanguage } from "@/context/LanguageContext";
import { cosineSimilarity, descriptorToArray } from "@/lib/face";

type Stage = "form" | "upload" | "certifying" | "certify_done" | "done";

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

async function savePortraitLocally(portraitId: string, imageBlob: Blob, idCardBlob: Blob | null) {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction("portraits", "readwrite");
    const store = tx.objectStore("portraits");
    const req = store.put({ portraitId, imageBlob, idCardBlob, savedAt: Date.now() });
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function loadPortraitLocal(portraitId: string): Promise<{ imageBlob: Blob; idCardBlob: Blob | null } | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("portraits", "readonly");
    const store = tx.objectStore("portraits");
    const req = store.get(portraitId);
    req.onsuccess = () => resolve(req.result ?? null);
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

  // ID card state
  const [idCardFront, setIdCardFront] = useState<File | null>(null);
  const [idCardBack, setIdCardBack] = useState<File | null>(null);
  const [idCardFrontPreview, setIdCardFrontPreview] = useState<string | null>(null);
  const [idCardBackPreview, setIdCardBackPreview] = useState<string | null>(null);

  // Face matching state
  const [portraitDescriptor, setPortraitDescriptor] = useState<number[] | null>(null);
  const [idCardDescriptor, setIdCardDescriptor] = useState<number[] | null>(null);
  const [faceMatchScore, setFaceMatchScore] = useState<number | null>(null);
  const [faceMatchStatus, setFaceMatchStatus] = useState<"pending" | "matching" | "matched" | "failed">("pending");
  const [faceMatchError, setFaceMatchError] = useState<string | null>(null);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelsReady, setModelsReady] = useState(false);

  // Form fields
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "general",
    tags: "",
    isPublic: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load face-api.js models once
  useEffect(() => {
    const loadModels = async () => {
      if (modelsReady) return;
      setModelsLoading(true);
      try {
        const faceapi = await import("@vladmandic/face-api");
        const MODEL_URL = "/models";
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsReady(true);
      } catch (err) {
        console.error("[FaceMatch] Failed to load models:", err);
      } finally {
        setModelsLoading(false);
      }
    };
    loadModels();
  }, [modelsReady]);

  const extractFaceDescriptor = async (file: File): Promise<number[]> => {
    const faceapi = await import("@vladmandic/face-api");
    const MODEL_URL = "/models";
    const img = await faceapi.bufferToImage(file);
    const detections = await faceapi.detectAllFaces(img, new faceapi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.5 }));
    if (detections.length === 0) throw new Error("No face detected in image");
    const largest = detections.reduce((a, b) => a.box.area > b.box.area ? a : b);
    const withDescriptor = await faceapi.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.5 })).withFaceLandmarks().withFaceDescriptor();
    if (!withDescriptor?.descriptor) throw new Error("Could not extract face descriptor");
    return descriptorToArray(withDescriptor.descriptor);
  };

  const compareFaces = useCallback(async () => {
    if (!croppedFile || !idCardFront || !modelsReady) return;
    setFaceMatchStatus("matching");
    setFaceMatchError(null);
    try {
      const [portraitDesc, idCardDesc] = await Promise.all([
        extractFaceDescriptor(croppedFile),
        extractFaceDescriptor(idCardFront),
      ]);
      setPortraitDescriptor(portraitDesc);
      setIdCardDescriptor(idCardDesc);
      const similarity = cosineSimilarity(portraitDesc, idCardDesc);
      const score = Math.round(similarity * 100);
      setFaceMatchScore(score);
      if (similarity >= 0.6) {
        setFaceMatchStatus("matched");
      } else {
        setFaceMatchStatus("failed");
        setFaceMatchError(t.upload?.faceMatchFailed || `Face match failed: ${score}% similarity (need 60%)`);
      }
    } catch (err) {
      setFaceMatchStatus("failed");
      setFaceMatchError(err instanceof Error ? err.message : "Face comparison failed");
    }
  }, [croppedFile, idCardFront, modelsReady, t]);

  useEffect(() => {
    if (croppedFile && idCardFront && modelsReady) compareFaces();
  }, [croppedFile, idCardFront, modelsReady, compareFaces]);

  const computeHash = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = t.upload?.titleRequiredError || "Title is required";
    if (form.title.length > 200) errs.title = "Title too long";
    if (!croppedFile) errs.image = t.upload?.imageRequiredError || "Portrait image is required";
    if (!idCardFront) errs.idCard = t.upload?.idCardRequiredError || "ID card front is required";
    if (faceMatchStatus === "failed") errs.faceMatch = t.upload?.faceMatchFailed || "Face match failed";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFileSelected = useCallback(async (file: File) => {
    setCroppedFile(file);
    setFaceMatchStatus("pending");
    setFaceMatchScore(null);
    try {
      const hash = await computeHash(file);
      setImageHash(hash);
    } catch (e) {
      console.error("Hash computation failed:", e);
    }
  }, []);

  const handleIdCardFrontChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIdCardFront(file);
      setIdCardFrontPreview(URL.createObjectURL(file));
      setFaceMatchStatus("pending");
      setFaceMatchScore(null);
    }
  };

  const handleIdCardBackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIdCardBack(file);
      setIdCardBackPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // ── Check wallet binding before upload ────────────────────────
    try {
      const meRes = await fetch("/api/user", { credentials: "include" });
      const meJson = await meRes.json();
      if (!meJson.success || !meJson.data?.user?.walletAddress) {
        setErrors({ wallet: t.upload?.walletRequiredError || "请先绑定钱包后再上传肖像" });
        return;
      }
    } catch {
      // If we can't check wallet status, still allow upload but skip auto-certify
      console.warn("[Upload] Could not verify wallet status, proceeding anyway");
    }

    setStage("upload");
    setProgress("Saving portrait record...");

    try {
      // Step 1: Create portrait record with hash (no S3, no image URL)
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

      setProgress("Storing image locally...");

      // Step 2: Save image + ID card to browser IndexedDB
      await savePortraitLocally(id, croppedFile!, idCardFront);

      setProgress("✅ Portrait saved locally!");

      // ── Auto-certify on blockchain ───────────────────────────
      setStage("certifying");
      setProgress(t.upload?.certifyingBlockchain || "🔗 Certifying on blockchain...");

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
        setProgress(
          `${t.upload?.certifySuccess || "✅ Blockchain certified!"} Tx: ${result.data?.blockchainTxHash?.slice(0, 10)}...`
        );
        setStage("certify_done");
      } else {
        // Certification failed but portrait was saved — allow retry from detail page
        setProgress(
          `${t.upload?.certifySkipped || "⚠️ Certification deferred"}: ${result.error ?? "unknown"}`
        );
        setStage("certify_done");
      }

      // Redirect after short delay
      setTimeout(() => router.push("/portraits"), 3000);
    } catch (err) {
      console.error("Upload failed:", err);
      setProgress(`❌ Error: ${(err as Error).message}`);
      setTimeout(() => setStage("form"), 2000);
    }
  };

  return (
    <DashboardShell title={t.upload?.title || "上传肖像"} subtitle={t.upload?.subtitle || "上传并认证你的肖像"}>
      <div className="max-w-3xl">
        {stage === "certifying" || stage === "certify_done" ? (
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
            {progress && (
              <p className="mt-4 text-sm text-gray-400 font-mono">{progress}</p>
            )}
            {stage === "certifying" && (
              <div className="mt-6 flex justify-center">
                <div className="animate-spin h-8 w-8 border-2 border-purple-500 border-t-transparent rounded-full" />
              </div>
            )}
          </div>
        ) : stage === "done" ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-xl font-semibold mb-2">肖像已保存</h2>
            <p className="text-gray-500">你的肖像已加密存储在本地设备</p>
            <p className="text-sm text-gray-400 mt-2">仅 SHA-256 哈希已上链存证</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-8">

            {/* Local storage notice */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <p className="text-sm text-blue-700 dark:text-blue-400">
                🔒 <strong>隐私优先：</strong>肖像仅保存在你的设备本地。我们只存储 SHA-256 哈希用于区块链存证，图像数据永远不会上传到服务器。
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

            {/* ID Card */}
            <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                🪪 {t.upload?.idCardVerification || "身份证验证"}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {t.upload?.idCardTip || "上传身份证正面进行人脸比对验证"}
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t.upload?.idCardFront || "身份证正面"} <span className="text-red-500">*</span>
                  </label>
                  {idCardFrontPreview ? (
                    <div className="relative">
                      <img src={idCardFrontPreview} alt="ID" className="w-full h-40 object-cover rounded-xl border" />
                      <button type="button" onClick={() => { setIdCardFront(null); setIdCardFrontPreview(null); setFaceMatchStatus("pending"); }}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full text-sm hover:bg-red-600">✕</button>
                    </div>
                  ) : (
                    <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-blue-400 transition-colors cursor-pointer group">
                      <input type="file" accept="image/*" onChange={handleIdCardFrontChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      <div className="flex flex-col items-center justify-center py-8">
                        <div className="text-3xl mb-2">🪪</div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t.upload?.clickToUploadID || "点击上传"}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t.upload?.idCardBack || "身份证背面"} <span className="text-xs text-gray-400">(可选)</span>
                  </label>
                  {idCardBackPreview ? (
                    <div className="relative">
                      <img src={idCardBackPreview} alt="ID Back" className="w-full h-40 object-cover rounded-xl border" />
                      <button type="button" onClick={() => { setIdCardBack(null); setIdCardBackPreview(null); }}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full text-sm hover:bg-red-600">✕</button>
                    </div>
                  ) : (
                    <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-blue-400 transition-colors cursor-pointer group">
                      <input type="file" accept="image/*" onChange={handleIdCardBackChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      <div className="flex flex-col items-center justify-center py-8">
                        <div className="text-3xl mb-2">🪪</div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t.upload?.clickToUploadID || "点击上传"}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {errors.idCard && <p className="mt-2 text-sm text-red-600">{errors.idCard}</p>}

              {/* Face match status */}
              <div className="mt-4 p-3 rounded-lg border">
                {modelsLoading && <p className="text-sm text-gray-500">{t.upload?.loadingModels || "加载人脸模型中..."}</p>}
                {!modelsLoading && !croppedFile && !idCardFront && <p className="text-sm text-gray-500">{t.upload?.uploadBothImages || "上传肖像和身份证开始比对"}</p>}
                {!modelsLoading && faceMatchStatus === "pending" && croppedFile && idCardFront && <p className="text-sm text-blue-500">{t.upload?.readyToCompare || "准备比对..."}</p>}
                {!modelsLoading && faceMatchStatus === "matching" && <p className="text-sm text-blue-500 flex items-center gap-2"><div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />{t.upload?.comparingFaces || "比对中..."}</p>}
                {!modelsLoading && faceMatchStatus === "matched" && <p className="text-sm text-green-600">✅ {t.upload?.faceMatchSuccess || "人脸比对成功!"} ({faceMatchScore}%)</p>}
                {!modelsLoading && faceMatchStatus === "failed" && <p className="text-sm text-red-600">❌ {faceMatchError || (t.upload?.faceMatchFailed || "比对失败")} ({faceMatchScore}%)</p>}
              </div>
              {errors.faceMatch && <p className="mt-2 text-sm text-red-600">{errors.faceMatch}</p>}
            </section>

            {/* Metadata */}
            <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4">{t.upload?.details || "详细信息"}</h2>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.upload?.titleRequired || "标题"}</label>
                  <input type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder={t.upload?.titlePlaceholder || "给肖像起个名字"}
                    maxLength={200}
                    className={`w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ${errors.title ? "border-red-300" : "border-gray-200 dark:border-gray-700"}`} />
                  {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.upload?.descriptionLabel || "描述"}</label>
                  <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder={t.upload?.descriptionPlaceholder || "添加描述..."} rows={3} maxLength={2000}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.upload?.categoryLabel || "类别"}</label>
                  <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
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
                  <button type="button" onClick={() => setForm((f) => ({ ...f, isPublic: !f.isPublic }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.isPublic ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${form.isPublic ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.upload?.publicListing || "公开可见"}</p>
                    <p className="text-xs text-gray-400">{t.upload?.publicListingDesc || "允许他人查找此肖像"}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Wallet error */}
            {errors.wallet && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{errors.wallet}</span>
                </p>
                <a href="/wallet" className="mt-2 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">
                  → 绑定钱包
                </a>
              </div>
            )}

            {/* Submit */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <button type="submit" disabled={stage === "upload" || faceMatchStatus === "failed" || faceMatchStatus === "matching"}
                className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full sm:w-auto">
                {stage === "upload" ? (t.upload?.uploading || "保存中...") : (t.upload?.createPortrait || "创建肖像")}
              </button>
              {stage === "upload" && progress && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                  <span>{progress}</span>
                </div>
              )}
              <button type="button" onClick={() => router.push("/portraits")}
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                {t.upload?.cancel || "取消"}
              </button>
            </div>
          </form>
        )}
      </div>
    </DashboardShell>
  );
}
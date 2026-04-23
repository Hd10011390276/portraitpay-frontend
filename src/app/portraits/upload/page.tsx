/**
 * /portraits/upload — Unified Portrait Upload + KYC + Blockchain Cert
 *
 * Flow:
 *  1. Upload portrait photo (with crop)
 *  2. Upload ID card front
 *  3. Enter ID card number
 *  4. Auto-trigger face match (portrait vs ID card photo)
 *  5. On match ≥ 60% → create portrait → upload to S3 → blockchain certify
 *  6. Submit KYC (auto-approved)
 */

"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import UploadZone from "@/components/portrait/UploadZone";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { useLanguage } from "@/context/LanguageContext";
import ImageCropper from "@/components/portrait/ImageCropper";

type Stage = "form" | "uploading" | "certifying" | "certify_done";

const FACE_MATCH_THRESHOLD = 60;

// ── Face-api helpers ───────────────────────────────────────────────
async function loadFaceModels() {
  const faceapi = await import("@vladmandic/face-api");
  const MODEL_URL = "/models";
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  ]);
  return faceapi;
}

async function extractFaceDescriptor(file: File, faceapi: any): Promise<number[]> {
  const img = new window.Image();
  img.src = URL.createObjectURL(file);
  await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });

  const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.5 });
  const detection = await faceapi
    .detectSingleFace(img, options)
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) throw new Error("No face detected in this image");
  URL.revokeObjectURL(img.src);
  return Array.from(detection.descriptor);
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function computeHash(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
}

// ── IndexedDB helpers ─────────────────────────────────────────────
const DB_NAME = "portraitpay-local";
function openDB(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("portraits")) {
        db.createObjectStore("portraits", { keyPath: "portraitId" });
      }
    };
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
}

async function savePortraitLocally(portraitId: string, imageBlob: Blob) {
  const db = await openDB();
  return new Promise<void>((res, rej) => {
    const tx = db.transaction("portraits", "readwrite");
    tx.objectStore("portraits").put({ portraitId, imageBlob, savedAt: Date.now() });
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
}

// ── Component ─────────────────────────────────────────────────────
export default function UploadPortraitPage() {
  const router = useRouter();
  const { t } = useLanguage();

  // ── Stage ─────────────────────────────────────────────────────
  const [stage, setStage] = useState<Stage>("form");
  const [progress, setProgress] = useState("");
  const [certifyResult, setCertifyResult] = useState<{ success: boolean; error?: string; data?: any } | null>(null);

  // ── Portrait ─────────────────────────────────────────────────
  const [croppedFile, setCroppedFile] = useState<File | null>(null);
  const [imageHash, setImageHash] = useState<string | null>(null);

  // ── ID card ──────────────────────────────────────────────────
  const [idCardFront, setIdCardFront] = useState<File | null>(null);
  const [idCardFrontPreview, setIdCardFrontPreview] = useState<string | null>(null);
  const [idCardNumber, setIdCardNumber] = useState("");
  const [idCardNumberHash, setIdCardNumberHash] = useState("");

  // ── Face match ────────────────────────────────────────────────
  const [faceMatchStatus, setFaceMatchStatus] = useState<"idle" | "loading" | "success" | "failed">("idle");
  const [faceMatchScore, setFaceMatchScore] = useState<number | null>(null);
  const [faceMatchError, setFaceMatchError] = useState<string | null>(null);
  const [modelsReady, setModelsReady] = useState(false);

  // ── Form ─────────────────────────────────────────────────────
  const [form, setForm] = useState({ title: "", description: "", category: "general", tags: "", isPublic: false });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Load face-api models once ────────────────────────────────
  useEffect(() => {
    loadFaceModels().then(() => setModelsReady(true)).catch(console.error);
  }, []);

  // ── Compute ID card hash ─────────────────────────────────────
  useEffect(() => {
    if (!idCardNumber) { setIdCardNumberHash(""); return; }
    const encoder = new TextEncoder();
    const data = encoder.encode(idCardNumber);
    crypto.subtle.digest("SHA-256", data).then(buf => {
      setIdCardNumberHash(Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join(""));
    });
  }, [idCardNumber]);

  // ── Auto-trigger face match when ready ───────────────────────
  const runFaceMatch = useCallback(async (portrait: File, idCard: File) => {
    if (!modelsReady) return;
    setFaceMatchStatus("loading");
    setFaceMatchError(null);
    try {
      const faceapi = await loadFaceModels();
      const [portraitDesc, idCardDesc] = await Promise.all([
        extractFaceDescriptor(portrait, faceapi),
        extractFaceDescriptor(idCard, faceapi),
      ]);
      const similarity = cosineSimilarity(portraitDesc, idCardDesc);
      const score = Math.round(similarity * 100);
      setFaceMatchScore(score);
      setFaceMatchStatus(score >= FACE_MATCH_THRESHOLD ? "success" : "failed");
    } catch (err) {
      setFaceMatchStatus("failed");
      setFaceMatchError(err instanceof Error ? err.message : "比对失败");
    }
  }, [modelsReady]);

  useEffect(() => {
    if (idCardFront && croppedFile && modelsReady) {
      runFaceMatch(croppedFile, idCardFront);
    }
  }, [idCardFront, croppedFile, modelsReady, runFaceMatch]);

  // ── Handlers ─────────────────────────────────────────────────
  const handleFileSelected = useCallback(async (file: File) => {
    setCroppedFile(file);
    setErrors(prev => ({ ...prev, image: "" }));
    try {
      setImageHash(await computeHash(file));
    } catch (e) { console.error(e); }
  }, []);

  const handleIdCardFrontChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIdCardFront(file);
    setIdCardFrontPreview(URL.createObjectURL(file));
    setFaceMatchStatus("idle");
    setFaceMatchScore(null);
  }, []);

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = t.upload?.titleRequiredError || "请输入标题";
    if (form.title.length > 200) errs.title = t.upload?.titleLengthError || "标题过长";
    if (!croppedFile) errs.image = t.upload?.imageRequiredError || "请上传肖像照片";
    if (!idCardFront) errs.idCard = t.upload?.idCardRequiredError || "请上传身份证正面";
    if (!idCardNumber.trim()) errs.idCardNumber = t.upload?.idCardNumberError || "请输入身份证号码";
    if (faceMatchStatus !== "success") {
      if (faceMatchStatus === "failed") errs.face = t.upload?.faceMatchRejected?.replace("{score}", String(faceMatchScore ?? 0)) || "人脸比对未通过";
      else if (faceMatchStatus === "loading") errs.face = t.upload?.comparingFaces || "正在比对人脸...";
      else errs.face = t.upload?.uploadBothImages || "请先完成人脸比对";
    }
    if (faceMatchScore !== null && faceMatchScore < FACE_MATCH_THRESHOLD) {
      errs.face = t.upload?.faceMatchRejected?.replace("{score}", String(faceMatchScore)) || `人脸比对未通过（${faceMatchScore}%）`;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!croppedFile || !idCardFront) return;
    // Guard: require successful face match with passing score
    if (faceMatchStatus !== "success" || faceMatchScore === null || faceMatchScore < FACE_MATCH_THRESHOLD) {
      setErrors(prev => ({ ...prev, face: "人脸比对未通过，请重新上传清晰照片" }));
      return;
    }

    setStage("uploading");
    setProgress("创建肖像记录...");

    try {
      // 1. Create portrait record
      const createRes = await fetch("/api/portraits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.title, description: form.description || undefined, category: form.category, tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean), isPublic: form.isPublic, imageHash }),
      });
      const createJson = await createRes.json();
      if (!createJson.success) throw new Error(createJson.error);
      const id = createJson.data.id as string;

      // 2. Upload to S3
      setProgress("上传到存储...");
      const presignedRes = await fetch(`/api/portraits/${id}/upload`);
      if (!presignedRes.ok) throw new Error("Failed to get upload URL");
      const { data: uploadUrls } = await presignedRes.json();

      const s3Res = await fetch(uploadUrls.original.uploadUrl, {
        method: "PUT",
        body: croppedFile,
        headers: { "Content-Type": "image/jpeg" },
      });
      if (!s3Res.ok) throw new Error("S3 upload failed");
      const originalImageUrl = uploadUrls.original.objectUrl;

      await savePortraitLocally(id, croppedFile);

      // 3. Register URL
      setProgress("保存中...");
      const updateRes = await fetch(`/api/portraits/${id}/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originalImageUrl, imageHash }),
      });
      const updateJson = await updateRes.json();
      if (!updateJson.success) throw new Error(updateJson.error);

      // 4. Blockchain certify
      setStage("certifying");
      setProgress("区块链存证中...");
      let result = { success: false, error: "unknown" };
      try {
        const certifyRes = await fetch(`/api/portraits/${id}/certify`, { method: "POST" });
        result = await certifyRes.json();
      } catch (certErr) {
        result = { success: false, error: (certErr as Error).message };
      }
      setCertifyResult(result);

      // 5. Submit KYC (auto-approved in backend)
      if (faceMatchScore !== null) {
        try {
          await fetch("/api/v1/kyc/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              level: 2,
              idCardNumberHash,
              faceMatchScore,
              portraitHash: imageHash,
              documentType: "id_card",
              idCardFrontUrl: idCardFrontPreview,
            }),
          });
        } catch { /* KYC submit best-effort */ }
      }

      if (result.success) {
        setProgress(`${t.upload?.certifySuccess || "区块链认证完成"}！Tx: ${result.data?.blockchainTxHash?.slice(0, 10)}...`);
      } else {
        setProgress(`${t.upload?.certifyDeferred || "肖像已保存，认证稍后进行"}: ${result.error ?? "unknown"}`);
      }
      setStage("certify_done");
      setTimeout(() => router.push("/portraits"), 3000);
    } catch (err) {
      console.error("Upload failed:", err);
      setProgress(`${t.upload?.error || "错误"}: ${(err as Error).message}`);
      setTimeout(() => setStage("form"), 3000);
    }
  };

  // ── Face match status badge ───────────────────────────────────
  const faceMatchBadge = () => {
    if (faceMatchStatus === "idle" || (!idCardFront && !croppedFile)) return null;
    if (faceMatchStatus === "loading") return (
      <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
        <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
        {t.upload?.comparingFaces || "比对人脸中..."}
      </div>
    );
    if (faceMatchStatus === "success") return (
      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
        ✅ {t.upload?.faceMatchPassed?.replace("{score}", String(faceMatchScore)) || `人脸比对通过（${faceMatchScore}%）`}
      </div>
    );
    if (faceMatchStatus === "failed") return (
      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
        ❌ {t.upload?.faceMatchRejected?.replace("{score}", String(faceMatchScore ?? 0)) || `人脸比对未通过（${faceMatchScore}%）`}{faceMatchError ? ` - ${faceMatchError}` : ""}
      </div>
    );
    return null;
  };

  // ── Certifying stage ───────────────────────────────────────────
  if (stage === "certifying" || stage === "certify_done") {
    return (
      <DashboardShell title={t.upload?.title || "上传肖像"} subtitle={t.upload?.subtitle || "上传并认证你的肖像"}>
        <div className="max-w-3xl">
          <div className="text-center py-16">
            <div className="text-6xl mb-4">{stage === "certifying" ? "🔗" : certifyResult?.success ? "✅" : "⚠️"}</div>
            <h2 className="text-xl font-semibold mb-2">
              {stage === "certifying" ? t.upload?.uploading || "上传中..." : certifyResult?.success ? (t.upload?.certifySuccess || "认证完成！") : (t.upload?.certifyDeferred || "已保存")}
            </h2>
            <p className="text-gray-500">{stage === "certifying" ? t.upload?.certifyingBlockchain || "正在区块链认证..." : certifyResult?.success ? (t.upload?.certifySuccessDesc || "你的肖像已在区块链上获得认证") : (t.upload?.certifyDeferredDesc || "认证稍后进行")}</p>
            {progress && <p className="mt-4 text-sm text-gray-400 font-mono">{progress}</p>}
            {stage === "certifying" && <div className="mt-6 flex justify-center"><div className="animate-spin h-8 w-8 border-2 border-purple-500 border-t-transparent rounded-full" /></div>}
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
              🔒 <strong>{t.upload?.uploadTip ? "隐私" : "隐私："}</strong>{t.upload?.uploadTip || "肖像仅上传至 S3 存储，SHA-256 哈希用于区块链存证。身份证用于实名认证（人脸比对），不会泄露真实号码。"}
            </p>
          </div>

          {/* Section 1: Portrait */}
          <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              📸 {t.upload?.portraitImage || "肖像照片"} <span className="text-red-500">*</span>
            </h2>
            <UploadZone
              onFileSelected={handleFileSelected}
              maxSizeMB={10}
              dropzoneText={t.upload?.dropzone || "Drag & drop your portrait"}
              browseText={t.upload?.selectImage || "or click to browse"}
              supportedText={t.upload?.supported || "JPG, PNG, WebP"}
              cropPrompt={t.upload?.cropPrompt || "Crop your portrait"}
              uploadingText={t.upload?.uploading || "Uploading..."}
              imageReadyText={t.upload?.imageReady || "✅ Ready!"}
              imageSizeLabel={t.upload?.imageSize || "Size"}
              replaceText={t.upload?.replaceImage || "Replace"}
            />
            {errors.image && <p className="mt-2 text-sm text-red-600">{errors.image}</p>}
            {imageHash && (
              <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-400">{t.upload?.sha256Label || "SHA-256"}: {imageHash.slice(0, 16)}...</p>
              </div>
            )}
          </section>

          {/* Section 2: ID Card */}
          <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              🪪 {t.upload?.idCardVerification || "身份证认证"} <span className="text-red-500">*</span>
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {t.upload?.idCardTip || "上传身份证正面照进行人脸比对。"}
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {/* ID Card Front */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.upload?.idCardFront || "身份证正面"} <span className="text-red-500">*</span>
                </label>
                {idCardFrontPreview ? (
                  <div className="relative">
                    <img src={idCardFrontPreview} alt="ID" className="w-full h-40 object-cover rounded-xl border" />
                    <button type="button" onClick={() => { setIdCardFront(null); setIdCardFrontPreview(null); setFaceMatchStatus("idle"); }}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full text-sm hover:bg-red-600">✕</button>
                  </div>
                ) : (
                  <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-blue-400 transition-colors cursor-pointer group">
                    <input type="file" accept="image/*" onChange={handleIdCardFrontChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="text-3xl mb-2">🪪</div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t.upload?.clickToUploadID || "点击上传身份证"}</p>
                    </div>
                  </div>
                )}
                {errors.idCard && <p className="text-sm text-red-600">{errors.idCard}</p>}
              </div>

              {/* ID Card Number */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.upload?.idCardNumber || "身份证号码"} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={idCardNumber}
                  onChange={e => setIdCardNumber(e.target.value)}
                  placeholder={t.upload?.idCardNumberPlaceholder || "18位身份证号码"}
                  maxLength={18}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
                {errors.idCardNumber && <p className="text-sm text-red-600">{errors.idCardNumber}</p>}
                {idCardNumberHash && (
                  <p className="text-xs text-gray-400 break-all">{t.upload?.hash || "哈希"}: {idCardNumberHash.slice(0, 12)}...</p>
                )}
              </div>
            </div>

            {/* Face match result */}
            {faceMatchBadge()}
            {errors.face && !faceMatchBadge() && <p className="text-sm text-red-600">{errors.face}</p>}
          </section>

          {/* Section 3: Details */}
          <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-2">{t.upload?.details || "肖像详情"}</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.upload?.titleRequired || "标题"} <span className="text-red-500">*</span>
              </label>
              <input type="text" value={form.title}
                onChange={e => { setForm(f => ({ ...f, title: e.target.value })); setErrors(prev => ({ ...prev, title: "" })); }}
                placeholder={t.upload?.titlePlaceholder || "给肖像起个名字..."} maxLength={200}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.upload?.descriptionLabel || "描述"}</label>
              <textarea value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder={t.upload?.descriptionPlaceholder || "描述一下这幅肖像（可选）"} rows={3} maxLength={2000}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.upload?.categoryLabel || "分类"}</label>
              <select value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
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
              <button type="button" onClick={() => setForm(f => ({ ...f, isPublic: !f.isPublic }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.isPublic ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${form.isPublic ? "translate-x-6" : "translate-x-1"}`} />
              </button>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.upload?.publicVisible || "公开可见"}</p>
                <p className="text-xs text-gray-400">{t.upload?.publicListingDesc || "允许他人查找此肖像"}</p>
              </div>
            </div>
          </section>

          {/* Submit */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <button type="submit" disabled={stage === "uploading" || faceMatchStatus !== "success"}
              className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full sm:w-auto">
              {stage === "uploading" ? (t.upload?.submitting || "保存中...") : faceMatchStatus === "loading" ? (t.upload?.comparingFaces || "比对人脸中...") : faceMatchStatus === "failed" ? (t.upload?.faceMatchRejected?.replace("{score}", String(faceMatchScore ?? 0)) || "人脸比对未通过") : (t.upload?.createPortrait || "创建肖像 + 认证")}
            </button>
            {(stage === "uploading" || faceMatchStatus === "loading") && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                <span>{progress || t.upload?.uploading || "上传中..."}</span>
              </div>
            )}
            <button type="button" onClick={() => router.push("/portraits")}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
              {t.upload?.cancel || "取消"}
            </button>
          </div>

        </form>
      </div>
    </DashboardShell>
  );
}

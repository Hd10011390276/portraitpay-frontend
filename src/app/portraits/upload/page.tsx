/**
 * /portraits/upload — Portrait upload page
 * Supports drag & drop, cropping, face-api.js face detection, and ID card verification
 * Portrait + ID card face matching required for successful upload
 */

"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import UploadZone from "@/components/portrait/UploadZone";
import ImageCropper from "@/components/portrait/ImageCropper";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { useLanguage } from "@/context/LanguageContext";
import { cosineSimilarity, descriptorToArray } from "@/lib/face";

type Stage = "form" | "upload" | "certify" | "done";

export default function UploadPortraitPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [stage, setStage] = useState<Stage>("form");
  const [croppedFile, setCroppedFile] = useState<File | null>(null);
  const [portraitId, setPortraitId] = useState<string | null>(null);
  const [imageHash, setImageHash] = useState<string | null>(null);
  const [progress, setProgress] = useState("");

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
        console.log("[FaceMatch] Models loaded");
      } catch (err) {
        console.error("[FaceMatch] Failed to load models:", err);
      } finally {
        setModelsLoading(false);
      }
    };

    loadModels();
  }, [modelsReady]);

  // Extract face descriptor from an image file
  const extractFaceDescriptor = async (file: File): Promise<number[]> => {
    const faceapi = await import("@vladmandic/face-api");
    const MODEL_URL = "/models";

    const img = await faceapi.bufferToImage(file);
    const detections = await faceapi.detectAllFaces(img, new faceapi.TinyFaceDetectorOptions({
      inputSize: 512,
      scoreThreshold: 0.5,
    }));

    if (detections.length === 0) {
      throw new Error("No face detected in image");
    }

    // Get the largest face
    const largest = detections.reduce((a, b) =>
      a.box.area > b.box.area ? a : b
    );

    // Extract descriptor
    const withDescriptor = await faceapi.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions({
      inputSize: 512,
      scoreThreshold: 0.5,
    })).withFaceLandmarks().withFaceDescriptor();

    if (!withDescriptor?.descriptor) {
      throw new Error("Could not extract face descriptor");
    }

    return descriptorToArray(withDescriptor.descriptor);
  };

  // Compare faces when both portrait and ID card front are available
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

      // Threshold: 60% similarity for a match
      if (similarity >= 0.6) {
        setFaceMatchStatus("matched");
      } else {
        setFaceMatchStatus("failed");
        setFaceMatchError(t.upload.faceMatchFailed || `Face match failed: ${score}% similarity (need 60%)`);
      }
    } catch (err) {
      setFaceMatchStatus("failed");
      setFaceMatchError(err instanceof Error ? err.message : "Face comparison failed");
    }
  }, [croppedFile, idCardFront, modelsReady, t]);

  // Trigger face comparison when both images are available
  useEffect(() => {
    if (croppedFile && idCardFront && modelsReady) {
      compareFaces();
    }
  }, [croppedFile, idCardFront, modelsReady, compareFaces]);

  const computeHash = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = t.upload.titleRequiredError;
    if (form.title.length > 200) errs.title = t.upload.titleLengthError;
    if (!croppedFile) errs.image = t.upload.imageRequiredError;
    if (!idCardFront) errs.idCard = t.upload.idCardRequiredError || "ID card front is required";
    if (faceMatchStatus === "failed") errs.faceMatch = t.upload.faceMatchFailed || "Face match failed";
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

    setStage("upload");
    setProgress("Creating portrait record...");

    try {
      // Step 1: Create portrait draft
      const createRes = await fetch("/api/portraits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description || undefined,
          category: form.category,
          tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
          isPublic: form.isPublic,
        }),
      });

      const createJson = await createRes.json();
      if (!createJson.success) throw new Error(createJson.error);
      const id = createJson.data.id as string;
      setPortraitId(id);
      setProgress("Fetching upload URL...");

      // Step 2: Get presigned S3 URL
      const uploadUrlRes = await fetch(`/api/portraits/${id}/upload`);
      const uploadUrlJson = await uploadUrlRes.json();
      if (!uploadUrlRes.ok) throw new Error(uploadUrlJson.error);

      const { original } = uploadUrlJson.data;

      setProgress("Uploading image to storage...");

      // Step 3: Upload directly to S3
      const s3Res = await fetch(original.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": "image/jpeg" },
        body: croppedFile!,
      });

      if (!s3Res.ok) throw new Error("S3 upload failed");

      setProgress("Registering image with portrait...");

      // Step 4: Register image URL in DB
      const registerRes = await fetch(`/api/portraits/${id}/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalImageUrl: original.objectUrl,
          thumbnailUrl: original.objectUrl,
          imageHash,
        }),
      });

      const registerJson = await registerRes.json();
      if (!registerJson.success) throw new Error(registerJson.error);

      setProgress("Portrait created successfully!");

      // Redirect to manage page
      setTimeout(() => router.push("/portraits"), 1500);
    } catch (err) {
      console.error("Upload failed:", err);
      setProgress(`❌ Error: ${(err as Error).message}`);
      setTimeout(() => setStage("form"), 2000);
    }
  };

  return (
    <DashboardShell
      title={t.upload.title}
      subtitle={t.upload.subtitle}
    >
      <div className="max-w-3xl">
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">

          {/* ── Image Upload ── */}
          <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              📸 {t.upload.portraitImage}
            </h2>

            <UploadZone
              onFileSelected={handleFileSelected}
              maxSizeMB={10}
            />

            {errors.image && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.image}</p>
            )}

            {/* Image hash preview */}
            {imageHash && (
              <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-400 dark:text-gray-500">{t.upload.sha256Label}</p>
                <p className="text-xs font-mono text-gray-600 dark:text-gray-400 break-all mt-0.5">{imageHash}</p>
              </div>
            )}

            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs text-blue-700 dark:text-blue-400">
                {t.upload.uploadTip}
              </p>
            </div>
          </section>

          {/* ── ID Card Verification ── */}
          <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              🪪 {t.upload.idCardVerification || "ID Card Verification"}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {t.upload.idCardTip || "Upload your ID card (front) for face verification. The face in the portrait must match the ID card."}
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* ID Card Front */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.upload.idCardFront || "ID Card Front"} <span className="text-red-500">*</span>
                </label>
                {idCardFrontPreview ? (
                  <div className="relative">
                    <img src={idCardFrontPreview} alt="ID Card Front" className="w-full h-40 object-cover rounded-xl border border-gray-200" />
                    <button
                      type="button"
                      onClick={() => { setIdCardFront(null); setIdCardFrontPreview(null); setFaceMatchStatus("pending"); }}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full text-sm hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleIdCardFrontChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex flex-col items-center justify-center py-8 px-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform">
                        🪪
                      </div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.upload.clickToUploadID || "Click to upload ID"}</p>
                      <p className="text-xs text-gray-400 mt-1">JPG/PNG, max 10MB</p>
                    </div>
                  </div>
                )}
              </div>

              {/* ID Card Back */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.upload.idCardBack || "ID Card Back"} <span className="text-xs text-gray-400">(Optional)</span>
                </label>
                {idCardBackPreview ? (
                  <div className="relative">
                    <img src={idCardBackPreview} alt="ID Card Back" className="w-full h-40 object-cover rounded-xl border border-gray-200" />
                    <button
                      type="button"
                      onClick={() => { setIdCardBack(null); setIdCardBackPreview(null); }}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full text-sm hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleIdCardBackChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex flex-col items-center justify-center py-8 px-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform">
                        🪪
                      </div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.upload.clickToUploadID || "Click to upload ID"}</p>
                      <p className="text-xs text-gray-400 mt-1">JPG/PNG, max 10MB</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {errors.idCard && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.idCard}</p>
            )}

            {/* Face Match Status */}
            <div className="mt-4 p-3 rounded-lg border">
              {modelsLoading && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                  {t.upload.loadingModels || "Loading face detection models..."}
                </div>
              )}

              {!modelsLoading && !croppedFile && !idCardFront && (
                <p className="text-sm text-gray-500">{t.upload.uploadBothImages || "Upload portrait and ID card to verify match"}</p>
              )}

              {!modelsLoading && (croppedFile || idCardFront) && faceMatchStatus === "pending" && (
                <p className="text-sm text-blue-500">{t.upload.readyToCompare || "Ready to compare faces..."}</p>
              )}

              {!modelsLoading && faceMatchStatus === "matching" && (
                <div className="flex items-center gap-2 text-sm text-blue-500">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                  {t.upload.comparingFaces || "Comparing faces..."}
                </div>
              )}

              {!modelsLoading && faceMatchStatus === "matched" && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <span className="text-lg">✅</span>
                  <span>{t.upload.faceMatchSuccess || "Face match successful!"} ({faceMatchScore}%)</span>
                </div>
              )}

              {!modelsLoading && faceMatchStatus === "failed" && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <span className="text-lg">❌</span>
                  <span>{faceMatchError || (t.upload.faceMatchFailed || "Face match failed")} ({faceMatchScore}%)</span>
                </div>
              )}
            </div>

            {errors.faceMatch && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.faceMatch}</p>
            )}
          </section>

          {/* ── Metadata ── */}
          <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              📝 {t.upload.details || 'Portrait Details'}
            </h2>

            <div className="flex flex-col gap-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.upload.titleRequired}
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder={t.upload.titlePlaceholder}
                  maxLength={200}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                    errors.title
                      ? "border-red-300 dark:border-red-700 focus:ring-red-200 dark:focus:ring-red-800"
                      : "border-gray-200 dark:border-gray-700 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-300 dark:focus:border-blue-600"
                  } bg-white dark:bg-gray-900 text-gray-900 dark:text-white`}
                />
                {errors.title && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.title}</p>}
                <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500 text-right">{form.title.length}/200</p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.upload.descriptionLabel}</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder={t.upload.descriptionPlaceholder}
                  rows={3}
                  maxLength={2000}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-300 dark:focus:border-blue-600 resize-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
                <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500 text-right">{form.description.length}/2000</p>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.upload.categoryLabel}</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-300 dark:focus:border-blue-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                >
                  <option value="general">{t.upload.categoryGeneral}</option>
                  <option value="celebrity">{t.upload.categoryCelebrity}</option>
                  <option value="artist">{t.upload.categoryArtist}</option>
                  <option value="athlete">{t.upload.categoryAthlete}</option>
                  <option value="business">{t.upload.categoryBusiness}</option>
                  <option value="political">{t.upload.categoryPolitical}</option>
                  <option value="other">{t.upload.categoryOther}</option>
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.upload.tagsLabel} <span className="text-xs text-gray-400">(comma-separated)</span>
                </label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                  placeholder={t.upload.tagsPlaceholder}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-300 dark:focus:border-blue-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>

              {/* Public toggle */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, isPublic: !f.isPublic }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    form.isPublic ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                      form.isPublic ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.upload.publicListing}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{t.upload.publicListingDesc}</p>
                </div>
              </div>
            </div>
          </section>

          {/* ── Submit ── */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <button
              type="submit"
              disabled={stage === "upload" || faceMatchStatus === "failed" || faceMatchStatus === "matching"}
              className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full sm:w-auto"
            >
              {stage === "upload" ? t.upload.uploading : t.upload.createPortrait}
            </button>

            {stage === "upload" && progress && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                <span>{progress}</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => router.push("/portraits")}
              className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              {t.upload.cancel}
            </button>
          </div>

        </form>
      </div>
    </DashboardShell>
  );
}
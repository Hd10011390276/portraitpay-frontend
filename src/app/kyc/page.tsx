"use client";

import React, { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { useLanguage } from "@/context/LanguageContext";

type KYCStep = 1 | 2 | 3 | 4;

const STEPS = (t: ReturnType<typeof useLanguage>["t"]) => [
  { num: 1, label: t.kyc.step1, icon: "👤" },
  { num: 2, label: t.kyc.step2, icon: "🪪" },
  { num: 3, label: t.kyc.step3, icon: "📸" },
  { num: 4, label: t.kyc.step4, icon: "✅" },
];

export default function KYCPage() {
  const { t } = useLanguage();
  const [user, setUser] = useState<{ id: string; email: string; name: string | null; role: string } | null>(null);
  const [checking, setChecking] = useState(true);
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("pp_user");
    if (!raw) { window.location.href = "/login"; return; }
    try { setUser(JSON.parse(raw)); } catch { window.location.href = "/login"; }
    finally { setChecking(false); }
  }, []);

  const handleFileChange = (side: "front" | "back", file: File) => {
    if (side === "front") {
      setFrontImage(file);
      setFrontPreview(URL.createObjectURL(file));
    } else {
      setBackImage(file);
      setBackPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!frontImage) {
      setSubmitError(t.kyc.frontSide + " is required");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      // Upload images to backend - for now just submit with placeholder URLs
      const res = await fetch("/api/v1/kyc/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level: 2,
          idCardFrontUrl: frontPreview,
          idCardBackUrl: backPreview,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Submission failed");
      }

      setSubmitSuccess(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <DashboardShell
      title={t.kyc.title}
      subtitle={t.kyc.subtitle}
      action={
        <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-700 border border-amber-200 tracking-wide">
          DEMO
        </span>
      }
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Progress header */}
        <KYCProgress currentStep={2} t={t} />

        {/* Main step card — ID document upload */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              📋 {t.kyc.step2Title}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t.kyc.supportedDocs}
            </p>
          </div>

          <div className="p-6 space-y-6">
            {/* ID type selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t.kyc.documentType}</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "id_card", label: "居民身份证", icon: "🪪" },
                  { value: "passport", label: "护照", icon: "🌍" },
                  { value: "hk_pass", label: "港澳通行证", icon: "🛂" },
                  { value: "tw_pass", label: "台湾居民证", icon: "✈️" },
                ].map((opt) => (
                  <button key={opt.value}
                    className="flex items-center gap-3 p-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all text-left">
                    <span className="text-2xl">{opt.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{opt.label}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">支持</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Front / Back upload */}
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Front side */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.kyc.frontSide} <span className="text-red-500">*</span>
                </label>
                {frontPreview ? (
                  <div className="relative">
                    <img src={frontPreview} alt="Front" className="w-full h-48 object-cover rounded-xl border border-gray-200" />
                    <button
                      onClick={() => { setFrontImage(null); setFrontPreview(null); }}
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
                      onChange={(e) => e.target.files?.[0] && handleFileChange("front", e.target.files[0])}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex flex-col items-center justify-center py-8 px-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform">
                        📷
                      </div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.kyc.clickToUpload}</p>
                      <p className="text-xs text-gray-400 mt-1">{t.kyc.maxFileSize}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Back side */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.kyc.backSide}
                </label>
                {backPreview ? (
                  <div className="relative">
                    <img src={backPreview} alt="Back" className="w-full h-48 object-cover rounded-xl border border-gray-200" />
                    <button
                      onClick={() => { setBackImage(null); setBackPreview(null); }}
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
                      onChange={(e) => e.target.files?.[0] && handleFileChange("back", e.target.files[0])}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex flex-col items-center justify-center py-8 px-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform">
                        📷
                      </div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.kyc.clickToUpload}</p>
                      <p className="text-xs text-gray-400 mt-1">{t.kyc.maxFileSize}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-900/50">
              <p className="text-sm text-blue-800 dark:text-blue-300 font-medium mb-2">💡 {t.kyc.photoRequirements}</p>
              <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
                <li>• {t.kyc.clearReadable}</li>
                <li>• {t.kyc.validDoc}</li>
                <li>• {t.kyc.completeImage}</li>
              </ul>
            </div>

            {submitError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {submitError}
              </div>
            )}

            {submitSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                ✅ {t.kyc.submitSuccess || "KYC submitted successfully!"}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSubmit}
                disabled={submitting || !frontImage}
                className="flex-1 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? t.kyc.submitting || "Submitting..." : t.kyc.submitDocs}
              </button>
              <button className="px-4 py-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors text-sm">
                {t.kyc.saveDraft}
              </button>
            </div>
          </div>
        </div>

        {/* Steps overview */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t.kyc.allStepsOverview}</h2>
          </div>
          <div className="p-6 space-y-4">
            {[
              { num: 1, label: t.kyc.step1, status: "completed", desc: t.kyc.idInfo },
              { num: 2, label: t.kyc.step2, status: "active",   desc: t.kyc.uploadDocs },
              { num: 3, label: t.kyc.step3, status: "pending",  desc: t.kyc.faceVerify },
              { num: 4, label: t.kyc.step4, status: "pending",  desc: t.kyc.reviewComplete },
            ].map((step) => (
              <div key={step.num} className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0
                  ${step.status === "completed" ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" :
                    step.status === "active" ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" :
                    "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"}`}>
                  {step.status === "completed" ? "✓" : step.num}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${step.status === "pending" ? "text-gray-400 dark:text-gray-600" : "text-gray-900 dark:text-white"}`}>
                    {step.label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{step.desc}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full
                  ${step.status === "completed" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                    step.status === "active" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                    "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500"}`}>
                  {step.status === "completed" ? t.kyc.completed : step.status === "active" ? t.kyc.inProgress : t.kyc.pending}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

function KYCProgress({ currentStep, t }: { currentStep: KYCStep; t: ReturnType<typeof useLanguage>["t"] }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      {/* Status */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{t.kyc.currentStatus}</p>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
              🔍 {t.kyc.reviewing}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{t.kyc.estimatedTime}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 dark:text-gray-400">{t.kyc.certificationLevel}</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{t.kyc.basicKyc}</p>
        </div>
      </div>

      {/* Steps */}
      <div className="flex items-center">
        {STEPS(t).map((step, i) => {
          const done = step.num < currentStep;
          const active = step.num === currentStep;
          return (
            <React.Fragment key={step.num}>
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all
                  ${done ? "bg-green-500 text-white" :
                    active ? "bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900/40" :
                    "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500"}`}>
                  {done ? "✅" : step.icon}
                </div>
                <p className={`text-xs mt-2 font-medium ${done || active ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-600"}`}>
                  {step.label}
                </p>
              </div>
              {i < STEPS(t).length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 mb-5 ${done ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

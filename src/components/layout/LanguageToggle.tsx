"use client";

import { useLanguage } from "@/context/LanguageContext";

export function LanguageToggle() {
  const { locale, setLocale } = useLanguage();

  return (
    <div className="inline-flex items-center rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <button
        onClick={() => setLocale("en-US")}
        className={`px-3 py-1.5 text-sm font-medium transition-colors ${
          locale === "en-US"
            ? "bg-blue-600 text-white"
            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
        }`}
        title="English"
        aria-label="Switch to English"
      >
        EN
      </button>
      <button
        onClick={() => setLocale("zh-CN")}
        className={`px-3 py-1.5 text-sm font-medium border-l border-gray-200 dark:border-gray-700 transition-colors ${
          locale === "zh-CN"
            ? "bg-blue-600 text-white"
            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
        }`}
        title="中文"
        aria-label="切换到中文"
      >
        中文
      </button>
    </div>
  );
}

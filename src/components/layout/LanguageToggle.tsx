"use client";

import { useLanguage } from "@/context/LanguageContext";

export function LanguageToggle() {
  const { locale, setLocale } = useLanguage();

  const isZh = locale === "zh-CN";

  return (
    <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <button
        onClick={() => setLocale("en-US")}
        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
          locale === "en-US"
            ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        }`}
        title="English"
        aria-label="Switch to English"
        aria-pressed={locale === "en-US"}
      >
        EN
      </button>
      <button
        onClick={() => setLocale("zh-CN")}
        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
          locale === "zh-CN"
            ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        }`}
        title="中文"
        aria-label="切换到中文"
        aria-pressed={locale === "zh-CN"}
      >
        中文
      </button>
    </div>
  );
}

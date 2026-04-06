"use client";

import Link from "next/link";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import ThemeToggle from "@/components/ThemeToggle";
import { useLanguage } from "@/context/LanguageContext";

export default function HomePage() {
  const { t, locale } = useLanguage();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <header className="fixed inset-x-0 top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a href="/" className="flex items-center gap-3">
              <img src="/logo.png" alt="PortraitPay AI" width="32" height="32" className="w-10 h-10 object-contain" />
              <span className="text-base font-bold text-gray-900 dark:text-white select-none">PortraitPay AI</span>
            </a>
            <nav className="hidden md:flex items-center gap-8">
              {[
                { href: "#features", label: t.nav.features },
                { href: "#how-it-works", label: t.nav.howItWorks },
                { href: "#pricing", label: t.nav.pricing },
                { href: "#faq", label: t.nav.faq },
              ].map((item) => (
                <a key={item.label} href={item.href}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <LanguageToggle />
              <Link href="/login"
                className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                {t.nav.signIn}
              </Link>
              <Link href="/register"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                {t.nav.getStarted}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-950 dark:to-purple-950/20 -z-10" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-purple-200 dark:bg-purple-900/10 rounded-full blur-3xl -z-10 opacity-40" />
        <div className="absolute top-40 left-10 w-72 h-72 bg-blue-200 dark:bg-blue-900/10 rounded-full blur-3xl -z-10 opacity-40" />
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
              </span>
              {t.hero.badge}
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white leading-tight tracking-tight whitespace-pre-line">
              {t.hero.headline}
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
              {t.hero.sub}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:-translate-y-0.5">
                {t.hero.cta1}
              </Link>
              <Link href="#how-it-works"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700 hover:-translate-y-0.5">
                {t.hero.cta2}
              </Link>
            </div>
            <div className="flex flex-col items-center gap-3 pt-4">
              <div className="flex -space-x-2">
                {["JD", "MW", "SK", "AL", "RK"].map((initials, i) => (
                  <div key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold border-2 border-white dark:border-gray-950">
                    {initials}
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold text-gray-900 dark:text-white">2,400+</span> {t.hero.socialProof}
              </p>
            </div>
          </div>

          {/* Hero visual */}
          <div className="mt-16 max-w-4xl mx-auto relative">
            <div className="bg-gradient-to-b from-gray-100 to-white dark:from-gray-900 dark:to-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden">
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <div className="flex-1 text-center text-xs text-gray-400">PortraitPay Dashboard</div>
              </div>
              <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: t.heroStats.certified, value: "24" },
                  { label: t.heroStats.totalRevenue, value: locale === "zh-CN" ? "¥12,840" : "$1,760" },
                  { label: t.heroStats.pending, value: "5" },
                  { label: t.heroStats.chainStatus, value: t.heroStats.onChain },
                ].map((stat, i) => (
                  <div key={i} className="bg-white dark:bg-gray-900 rounded-xl p-4 text-center border border-gray-100 dark:border-gray-800">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  </div>
                ))}
              </div>
              <div className="p-6 pt-0 grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center text-3xl">👤</div>
                    <div className="p-3">
                      <p className="text-xs font-medium text-gray-900 dark:text-white truncate">Sample {i}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t.heroStats.certified}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-4 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t.features.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {t.features.sub}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: "🔗", color: "from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20", border: "border-purple-200 dark:border-purple-800", titleKey: "feature1Title", descKey: "feature1Desc" },
              { icon: "🖼️", color: "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20", border: "border-blue-200 dark:border-blue-800", titleKey: "feature2Title", descKey: "feature2Desc" },
              { icon: "📋", color: "from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20", border: "border-green-200 dark:border-green-800", titleKey: "feature3Title", descKey: "feature3Desc" },
              { icon: "💰", color: "from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20", border: "border-yellow-200 dark:border-yellow-800", titleKey: "feature4Title", descKey: "feature4Desc" },
              { icon: "👁️", color: "from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20", border: "border-red-200 dark:border-red-800", titleKey: "feature5Title", descKey: "feature5Desc" },
              { icon: "🔐", color: "from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20", border: "border-indigo-200 dark:border-indigo-800", titleKey: "feature6Title", descKey: "feature6Desc" },
            ].map((feature, i) => (
              <div key={i}
                className={`bg-gradient-to-br ${feature.color} rounded-2xl p-6 border ${feature.border} hover:shadow-lg transition-shadow`}>
                <div className="text-4xl mb-4">{feature.icon}</div>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {t.features[feature.titleKey as keyof typeof t.features] as string}
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mt-2">
                  {t.features[feature.descKey as keyof typeof t.features] as string}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t.howItWorks.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {t.howItWorks.sub}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[t.howItWorks.step1, t.howItWorks.step2, t.howItWorks.step3, t.howItWorks.step4].map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-3xl shadow-sm mb-4">
                  {["📤", "🔍", "🔗", "💎"][i]}
                </div>
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                  0{i+1}
                </span>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 px-4 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t.pricing.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {t.pricing.sub}
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <div className="rounded-2xl p-8 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{t.pricing.freeTitle}</h3>
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{t.pricing.freePrice}<span className="text-lg font-normal text-gray-500">/{t.pricing.freePeriod}</span></div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">{t.pricing.freeDesc}</p>
              <ul className="space-y-2 mb-8">
                <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  {t.pricing.freeLi1}
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  {t.pricing.freeLi2}
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  {t.pricing.freeLi3}
                </li>
              </ul>
              <Link href="/register"
                className="block w-full text-center px-6 py-3 rounded-xl font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-lg">
                {t.nav.getStarted}
              </Link>
            </div>
            <div className="rounded-2xl p-8 bg-gradient-to-b from-purple-50 to-white dark:from-purple-950/40 dark:to-gray-900 border-2 border-purple-500 shadow-lg">
              <span className="inline-block px-3 py-1 text-xs font-semibold bg-purple-600 text-white rounded-full mb-4">{t.pricing.proBadge}</span>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{t.pricing.proTitle}</h3>
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{t.pricing.proPrice}</div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">{t.pricing.proDesc}</p>
              <ul className="space-y-2 mb-8">
                <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <svg className="w-4 h-4 text-purple-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  {t.pricing.proLi1}
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <svg className="w-4 h-4 text-purple-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  {t.pricing.proLi2}
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <svg className="w-4 h-4 text-purple-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  {t.pricing.proLi3}
                </li>
              </ul>
              <Link href="/contact"
                className="block w-full text-center px-6 py-3 rounded-xl font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-all shadow-lg">
                {t.pricing.contactUs}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              {t.faq.title}
            </h2>
          </div>
          <div className="space-y-4">
            {[
              { q: t.faq.q1, a: t.faq.a1 },
              { q: t.faq.q2, a: t.faq.a2 },
              { q: t.faq.q3, a: t.faq.a3 },
              { q: t.faq.q4, a: t.faq.a4 },
              { q: t.faq.q5, a: t.faq.a5 },
            ].map((faq, idx) => (
              <details key={idx} className="group bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <summary className="flex items-center justify-between px-6 py-4 cursor-pointer text-gray-900 dark:text-white font-medium">
                  {faq.q}
                  <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 pb-4 text-gray-600 dark:text-gray-400 text-sm leading-relaxed border-t border-gray-100 dark:border-gray-800 pt-3">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ──────────────────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-10 sm:p-16 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white" />
          </div>
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t.cta.title}</h2>
            <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">{t.cta.sub}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register"
                className="inline-flex items-center justify-center px-8 py-3.5 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors shadow-lg">
                {t.cta.cta1}
              </Link>
              <Link href="/login"
                className="inline-flex items-center justify-center px-8 py-3.5 text-white font-semibold rounded-xl border-2 border-white/30 hover:bg-white/10 transition-colors">
                {t.cta.cta2}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 dark:border-gray-800 py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <a href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="PortraitPay AI" width="28" height="28" className="w-8 h-8 object-contain" />
            <span className="text-gray-500 dark:text-gray-400 text-sm">{t.footer.copyright}</span>
          </a>
          <div className="flex items-center gap-6">
            <Link href="/privacy"
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              {t.footer.privacy}
            </Link>
            <Link href="/terms"
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              {t.footer.terms}
            </Link>
            <Link href="/contact"
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              {t.footer.contact}
            </Link>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-4 pt-6 border-t border-gray-100 dark:border-gray-800">
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
            ⚠️ Beta features are for testing purposes only. Mainnet launch TBD. Blockchain certification is on Ethereum Sepolia <strong>testnet</strong> — not mainnet.
          </p>
        </div>
      </footer>
    </div>
  );
}

/**
 * i18n — Translations dictionary for PortraitPay AI
 * Supports: zh-CN (default), en-US
 */

export type Locale = "zh-CN" | "en-US";

export const locales: Locale[] = ["zh-CN", "en-US"];
export const defaultLocale: Locale = "zh-CN";

export const translations = {
  "zh-CN": {
    // Navigation
    nav: {
      features: "功能特点",
      howItWorks: "如何使用",
      pricing: "价格方案",
      faq: "常见问题",
      signIn: "登录",
      getStarted: "免费开始",
    },
    // Hero
    hero: {
      badge: "Beta · 测试网运行中",
      headline: "你的肖像 你的权利",
      sub: "注册并保护你的肖像权。AI 侵权检测、可定制授权模板、实时收益追踪。",

      cta1: "免费注册 — 立即开始",
      cta2: "了解如何使用",
      socialProof: "已注册艺术家和创作者",
    },
    // Hero stats
    heroStats: {
      certified: "已认证",
      totalRevenue: "总收入",
      pending: "待处理",
      chainStatus: "链上状态",
      onChain: "已上链",
    },
    // Features
    features: {
      title: "保护你肖像权所需的一切",
      sub: "从上传到链上认证，只需几分钟。完全自动化，密码学安全。",
      feature1Title: "区块链存证",
      feature1Desc: "区块链时间戳 + IPFS 存储，确保证书不可篡改。智能合约自动执行授权和分成。",
      feature2Title: "IPFS 存储",
      feature2Desc: "上传肖像，系统自动生成哈希并存储到 IPFS。分布式存储，永不丢失。",
      feature3Title: "智能授权",
      feature3Desc: "可定制的授权模板，支持多种商业场景。灵活调整授权范围和期限。",
      feature4Title: "实时分成",
      feature4Desc: "每次使用肖像获得实时分成。区块链透明记录，无需中间商。",
      feature5Title: "侵权监测",
      feature5Desc: "AI 侵权检测 + 自动取证。7×24小时监控，侵权证据即时固化。",
      feature6Title: "企业 KYC",
      feature6Desc: "企业级 KYC 认证。符合法规要求，支持批量授权管理。",
    },
    // How it works
    howItWorks: {
      title: "从肖像到受保护资产，只需4步",
      sub: "无需加密货币专业知识。我们处理区块链复杂性——你来掌控。",
      step1: "上传肖像",
      step2: "KYC 认证",
      step3: "链上存证",
      step4: "获得收益",
    },
    // Pricing
    pricing: {
      title: "简单透明的定价",
      sub: "免费开始，随成长扩展。无隐藏费用。",
      freeTitle: "免费注册",
      freePrice: "¥0",
      freePeriod: "永久",
      freeDesc: "开始使用肖像权认证，立即免费注册",
      freeLi1: "肖像权链上存证",
      freeLi2: "基础授权模板",
      freeLi3: "KYC 身份认证",
      proTitle: "定制授权方案",
      proBadge: "名人 · 企业",
      proPrice: "定制",
      proDesc: "批量授权管理，专属客服，侵权监测",
      proLi1: "无限肖像权授权",
      proLi2: "AI 侵权实时监测",
      proLi3: "专属客服 + 优先响应",
      contactUs: "联系我们",
    },
    // FAQ
    faq: {
      title: "常见问题",
      q1: "PortraitPay 如何保护我的肖像权？",
      a1: "我们使用区块链技术为你的肖像生成不可篡改的时间戳存证，并结合 IPFS 分布式存储确保证书永久可查。",
      q2: "使用需要加密货币知识吗？",
      a2: "完全不需要。我们处理所有区块链复杂性，你只需普通方式上传和授权。",
      q3: "授权收益如何计算？",
      a3: "每次你的肖像被授权使用，智能合约自动执行分成，收益直接到账，无需中间商。",
      q4: "我的肖像数据安全吗？",
      a4: "安全。我们使用加密存储，原始图片不会公开，只有哈希值和授权记录上链。",
      q5: "如何开始使用？",
      a5: "免费注册，上传肖像，通过 KYC 认证，即可在链上注册你的肖像权。",
    },
    // CTA
    cta: {
      title: "准备好拥有你的肖像权了吗？",
      sub: "今天就加入成千上万的创作者，保护他们在区块链上的图像身份。",
      cta1: "立即免费开始",
      cta2: "登录",
    },
    // Footer
    footer: {
      copyright: "© 2026 PortraitPay AI. 保留所有权利。",
      privacy: "隐私政策",
      terms: "服务条款",
      contact: "联系我们",
    },
    // Meta
    meta: {
      title: "PortraitPay AI — 区块链肖像权保护",
      description:
        "在以太坊上注册你的肖像权。上传、认证、管理肖像授权，带有区块链时间戳和IPFS存储。",
    },
  },

  "en-US": {
    // Navigation
    nav: {
      features: "Features",
      howItWorks: "How it Works",
      pricing: "Pricing",
      faq: "FAQ",
      signIn: "Sign In",
      getStarted: "Get Started Free",
    },
    // Hero
    hero: {
      badge: "Beta · Running on Testnet",
      headline: "Your Portrait Your Rights",
      sub: "Register and protect your portrait rights with AI-powered infringement detection, customizable authorization templates, and real-time earnings tracking.",

      cta1: "Start Free — Register Now",
      cta2: "See How It Works",
      socialProof: "artists and creators registered",
    },
    // Hero stats
    heroStats: {
      certified: "Certified",
      totalRevenue: "Total Revenue",
      pending: "Pending",
      chainStatus: "Chain Status",
      onChain: "On Chain",
    },
    // Features
    features: {
      title: "Everything you need to protect your portrait rights",
      sub: "From upload to on-chain certification in minutes. Fully automated, cryptographically secure.",
      feature1Title: "Blockchain Proof",
      feature1Desc: "Blockchain timestamp + IPFS storage ensures certificates are tamper-proof. Smart contracts auto-execute licensing and revenue share.",
      feature2Title: "IPFS Storage",
      feature2Desc: "Upload your portrait; the system generates a hash and stores it on IPFS. Decentralized storage that never disappears.",
      feature3Title: "Smart Licensing",
      feature3Desc: "Customizable licensing templates for any commercial scenario. Flexibly adjust scope and duration.",
      feature4Title: "Real-Time Revenue",
      feature4Desc: "Earn royalties every time your portrait is used. Transparent blockchain records, no middlemen.",
      feature5Title: "Infringement Monitor",
      feature5Desc: "AI infringement detection + auto evidence collection. 24/7 monitoring with instant evidence preservation.",
      feature6Title: "Enterprise KYC",
      feature6Desc: "Enterprise-grade KYC certification. Regulatory compliant with batch authorization management.",
    },
    // How it works
    howItWorks: {
      title: "From portrait to protected asset in 4 steps",
      sub: "No crypto expertise required. We handle the blockchain complexity — you keep control.",
      step1: "Upload Portrait",
      step2: "KYC Verification",
      step3: "On-Chain Certificate",
      step4: "Earn Revenue",
    },
    // Pricing
    pricing: {
      title: "Simple, transparent pricing",
      sub: "Start free. Scale as you grow. No hidden fees.",
      freeTitle: "Free Registration",
      freePrice: "$0",
      freePeriod: "Forever",
      freeDesc: "Start using portrait rights certification, register free instantly",
      freeLi1: "Portrait rights on-chain certificate",
      freeLi2: "Basic licensing templates",
      freeLi3: "KYC identity verification",
      proTitle: "Custom Licensing Plan",
      proBadge: "Celebrity · Enterprise",
      proPrice: "Custom",
      proDesc: "Batch authorization management, dedicated support, infringement monitoring",
      proLi1: "Unlimited portrait licensing",
      proLi2: "AI real-time infringement monitoring",
      proLi3: "Dedicated support + priority response",
      contactUs: "Contact Us",
    },
    // FAQ
    faq: {
      title: "Frequently Asked Questions",
      q1: "How does PortraitPay protect my portrait rights?",
      a1: "We use blockchain technology to create an immutable timestamp certificate for your portrait, combined with IPFS decentralized storage to ensure certificates remain permanently accessible.",
      q2: "Do I need cryptocurrency knowledge to use it?",
      a2: "Absolutely not. We handle all blockchain complexity — you just upload and license your portrait normally.",
      q3: "How are licensing revenues calculated?",
      a3: "Every time your portrait is licensed for use, the smart contract automatically executes the revenue share and transfers earnings directly to you with no middlemen.",
      q4: "Is my portrait data secure?",
      a4: "Yes. We use encrypted storage — your original image is never made public; only the hash and licensing records go on-chain.",
      q5: "How do I get started?",
      a5: "Register for free, upload your portrait, pass KYC verification, and register your portrait rights on-chain.",
    },
    // CTA
    cta: {
      title: "Ready to own your portrait rights?",
      sub: "Join thousands of creators protecting their image identity on the blockchain today.",
      cta1: "Start Free Today",
      cta2: "Sign In",
    },
    // Footer
    footer: {
      copyright: "© 2026 PortraitPay AI. All rights reserved.",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
      contact: "Contact",
    },
    // Meta
    meta: {
      title: "PortraitPay AI — Portrait Rights on Blockchain",
      description:
        "Register your portrait rights on Ethereum. Upload, certify, and manage portrait authorization with blockchain timestamps and IPFS storage.",
    },
  },
} as const;

export type TranslationKeys = (typeof translations)["zh-CN"];

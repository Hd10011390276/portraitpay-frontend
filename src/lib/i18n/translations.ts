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
      badge: "已在以太坊 Sepolia 测试网上线",
      headline: "你的肖像。\n你的权利。\n上链。",
      sub: "在以太坊区块链上注册你的肖像权，带有不可变时间戳、IPFS 存储和智能合约许可。一次注册，永远拥有。",
      cta1: "免费注册 — 立即开始",
      cta2: "了解如何使用",
      socialProof: "已注册艺术家和创作者",
    },
    // Features
    features: {
      title: "保护你肖像权所需的一切",
      sub: "从上传到链上认证，只需几分钟。完全自动化，密码学安全。",
      items: [
        {
          icon: "🔗",
          title: "区块链认证",
          desc: "在以太坊 Sepolia 上将你的肖像铸造成链上资产。不可变时间戳，防篡改记录。",
          color: "from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20",
          border: "border-purple-200 dark:border-purple-800",
        },
        {
          icon: "🖼️",
          title: "IPFS 存储",
          desc: "你的肖像和元数据存储在 IPFS 上——去中心化、冗余备份、抗审查。",
          color: "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20",
          border: "border-blue-200 dark:border-blue-800",
        },
        {
          icon: "📋",
          title: "智能许可",
          desc: "设定谁可以使用你的肖像、使用期限和价格。智能合约自动执行。",
          color: "from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20",
          border: "border-green-200 dark:border-green-800",
        },
        {
          icon: "💰",
          title: "版税自动收取",
          desc: "肖像被授权时自动获得报酬。每笔交易通过智能合约路由，按比例分成。",
          color: "from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20",
          border: "border-yellow-200 dark:border-yellow-800",
        },
        {
          icon: "👁️",
          title: "侵权检测",
          desc: "AI 驱动的图像扫描 24/7 监控网络上未经授权使用你的认证肖像的行为。",
          color: "from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20",
          border: "border-red-200 dark:border-red-800",
        },
        {
          icon: "🔐",
          title: "KYC 身份认证",
          desc: "为企业级名人、艺术家和公众人物提供身份验证。在链上白名单登记。",
          color: "from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20",
          border: "border-indigo-200 dark:border-indigo-800",
          cta: "申请认证",
          ctaHref: "/kyc",
        },
      ],
    },
    // How it works
    howItWorks: {
      title: "从肖像到受保护资产，只需4步",
      sub: "无需加密货币专业知识。我们处理区块链复杂性——你来掌控。",
      steps: [
        {
          step: "01",
          icon: "📤",
          title: "上传肖像",
          desc: "上传清晰、高分辨率的肖像照片。我们自动检测人脸并为你裁剪。",
        },
        {
          step: "02",
          icon: "🔍",
          title: "完成 KYC",
          desc: "验证你的身份，解锁企业授权功能，提高个人资料信任评分。",
        },
        {
          step: "03",
          icon: "🔗",
          title: "链上认证",
          desc: "一键在以太坊 Sepolia 上铸造。你的肖像哈希、元数据和时间戳被永久记录。",
        },
        {
          step: "04",
          icon: "💎",
          title: "授权获利",
          desc: "设定条款。接受授权请求、收取版税、提取收益——全部在后台完成。",
        },
      ],
    },
    // Pricing
    pricing: {
      title: "简单透明的定价",
      sub: "免费开始，随成长扩展。无隐藏费用。",
      plans: [
        {
          name: "免费版",
          price: "¥0",
          period: "永久",
          desc: "适合刚开始入门的个人创作者",
          features: [
            "5 张肖像上传",
            "基础 KYC（自我声明）",
            "社区支持",
            "标准授权许可",
          ],
          cta: "立即开始",
          highlight: false,
        },
        {
          name: "专业版",
          price: "¥99",
          period: "/ 月",
          desc: "适合专业艺术家和网红",
          features: [
            "无限肖像上传",
            "完整 KYC 认证",
            "优先客户支持",
            "智能合约授权",
            "实时收益看板",
            "IPFS 永久存储",
          ],
          cta: "开始专业版试用",
          highlight: true,
        },
        {
          name: "企业版",
          price: "定制",
          period: "",
          desc: "适合代理机构和娱乐公司",
          features: [
            "专业版全部功能",
            "多艺术家管理",
            "白标证书",
            "专属客户经理",
            "自定义授权条款",
            "API 接口访问",
          ],
          cta: "联系销售",
          highlight: false,
        },
      ],
    },
    // FAQ
    faq: {
      title: "常见问题",
      items: [
        {
          q: "什么是肖像权认证？",
          a: "肖像权认证将你的肖像的存在、作者身份和时间戳记录在以太坊区块链上。这创造了一个不可变的、可作为法律证据的证明，记录了肖像何时以及由谁创建。",
        },
        {
          q: "使用 PortraitPay 需要加密货币吗？",
          a: "不需要。我们处理所有认证的燃气费。你可以绑定中国银行账户或支付宝/微信支付进行提现。无需钱包设置。",
        },
        {
          q: "AI 侵权检测是如何工作的？",
          a: "我们的 AI 使用人脸识别+视觉相似度扫描网站、社交媒体和图片平台。当发现匹配度超过你的阈值时，你会收到警报和证据包。",
        },
        {
          q: "什么是 KYC？为什么需要它？",
          a: "KYC（了解你的客户）验证你的身份以防止欺诈。对于公众人物和名人，需要完整 KYC 才能认证肖像并访问企业授权功能。",
        },
        {
          q: "企业可以批量注册艺术家吗？",
          a: "可以。企业计划包括机构管理后台，可管理多位艺术家、批量上传肖像和团体授权协议。",
        },
      ],
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
      badge: "Now live on Ethereum Sepolia Testnet",
      headline: "Your Portrait.\nYour Rights.\nOn Chain.",
      sub: "Register your portrait rights on the Ethereum blockchain with immutable timestamps, IPFS storage, and smart-contract licensing. Own your image identity — once and for all.",
      cta1: "Start Free — Register Now",
      cta2: "See How It Works",
      socialProof: "artists and creators registered",
    },
    // Features
    features: {
      title: "Everything you need to protect your portrait rights",
      sub: "From upload to on-chain certification in minutes. Fully automated, cryptographically secure.",
      items: [
        {
          icon: "🔗",
          title: "Blockchain Certification",
          desc: "Mint your portrait as an on-chain asset on Ethereum Sepolia. Immutable timestamps, tamper-proof records.",
          color: "from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20",
          border: "border-purple-200 dark:border-purple-800",
        },
        {
          icon: "🖼️",
          title: "IPFS Storage",
          desc: "Your portrait and metadata stored on IPFS — decentralized, redundant, and censorship-resistant forever.",
          color: "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20",
          border: "border-blue-200 dark:border-blue-800",
        },
        {
          icon: "📋",
          title: "Smart Licensing",
          desc: "Define who can use your portrait, for how long, and at what price. Enforced automatically by smart contract.",
          color: "from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20",
          border: "border-green-200 dark:border-green-800",
        },
        {
          icon: "💰",
          title: "Royalty Collection",
          desc: "Earn automatically when your portrait is licensed. Every transaction routed through smart contract with split ratios.",
          color: "from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20",
          border: "border-yellow-200 dark:border-yellow-800",
        },
        {
          icon: "👁️",
          title: "Infringement Detection",
          desc: "AI-powered image scanning monitors the web for unauthorized use of your certified portraits 24/7.",
          color: "from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20",
          border: "border-red-200 dark:border-red-800",
        },
        {
          icon: "🔐",
          title: "KYC Verified Profiles",
          desc: "Enterprise-grade identity verification for celebrities, artists, and public figures. Whitelisted on-chain.",
          color: "from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20",
          border: "border-indigo-200 dark:border-indigo-800",
          cta: "Get Verified",
          ctaHref: "/kyc",
        },
      ],
    },
    // How it works
    howItWorks: {
      title: "From portrait to protected asset in 4 steps",
      sub: "No crypto expertise required. We handle the blockchain complexity — you keep control.",
      steps: [
        {
          step: "01",
          icon: "📤",
          title: "Upload Portrait",
          desc: "Upload a clear, high-resolution portrait. We detect faces automatically and crop for you.",
        },
        {
          step: "02",
          icon: "🔍",
          title: "Complete KYC",
          desc: "Verify your identity to unlock enterprise licensing and increase your profile trust score.",
        },
        {
          step: "03",
          icon: "🔗",
          title: "Certify On-Chain",
          desc: "One click to mint on Ethereum Sepolia. Your portrait hash, metadata, and timestamp permanently recorded.",
        },
        {
          step: "04",
          icon: "💎",
          title: "License & Earn",
          desc: "Set your terms. Accept license requests, collect royalties, withdraw earnings — all from your dashboard.",
        },
      ],
    },
    // Pricing
    pricing: {
      title: "Simple, transparent pricing",
      sub: "Start free. Scale as you grow. No hidden fees.",
      plans: [
        {
          name: "Free",
          price: "¥0",
          period: "forever",
          desc: "For individual creators getting started",
          features: ["5 portrait uploads", "Basic KYC (self-attested)", "Community support", "Standard licensing"],
          cta: "Get Started",
          highlight: false,
        },
        {
          name: "Pro",
          price: "¥99",
          period: "/ month",
          desc: "For professional artists and influencers",
          features: ["Unlimited portraits", "Full KYC verification", "Priority support", "Smart contract licensing", "Real-time earnings dashboard", "IPFS permanent storage"],
          cta: "Start Pro Trial",
          highlight: true,
        },
        {
          name: "Enterprise",
          price: "Custom",
          period: "",
          desc: "For agencies and entertainment companies",
          features: ["Everything in Pro", "Multi-artist management", "White-label certificates", "Dedicated account manager", "Custom licensing terms", "API access"],
          cta: "Contact Sales",
          highlight: false,
        },
      ],
    },
    // FAQ
    faq: {
      title: "Frequently Asked Questions",
      items: [
        {
          q: "What is portrait rights certification?",
          a: "Portrait rights certification records your portrait's existence, authorship, and timestamp on the Ethereum blockchain. This creates an immutable, legally admissible proof of when and by whom the portrait was created.",
        },
        {
          q: "Do I need cryptocurrency to use PortraitPay?",
          a: "No. We handle all gas fees for certification. You can link a Chinese bank account or Alipay/WeChat Pay for withdrawals. No wallet setup required.",
        },
        {
          q: "How does the AI infringement detection work?",
          a: "Our AI scans websites, social media, and stock photo platforms using face recognition + visual similarity. When a match is found above your threshold, you receive an alert and evidence package.",
        },
        {
          q: "What is KYC and why do I need it?",
          a: "KYC (Know Your Customer) verifies your identity to prevent fraud. For public figures and celebrities, full KYC is required to certify portraits and access enterprise licensing features.",
        },
        {
          q: "Can enterprises bulk-register their artists?",
          a: "Yes. Enterprise plans include agency dashboards for managing multiple artists, batch portrait uploads, and group licensing agreements.",
        },
      ],
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

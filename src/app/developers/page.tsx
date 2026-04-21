"use client";

import { useState } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/layout/LanguageToggle";

const IconCode = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
  </svg>
);
const IconKey = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
  </svg>
);
const IconLink = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
);
const IconCheck = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconCopy = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);

function CodeBlock({ code, label }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative group">
      {label && <div className="text-xs font-medium text-gray-500 mb-1.5 px-1">{label}</div>}
      <div className="relative">
        <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 text-sm overflow-x-auto font-mono" style={{ fontSize: "13px", lineHeight: "1.6" }}>
          <code>{code}</code>
        </pre>
        <button
          onClick={copy}
          className="absolute top-2 right-2 p-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 opacity-0 group-hover:opacity-100 transition"
          title="Copy code"
        >
          {copied ? <IconCheck className="w-4 h-4 text-green-400" /> : <IconCopy className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = { GET: "bg-green-100 text-green-700", POST: "bg-blue-100 text-blue-700", PATCH: "bg-yellow-100 text-yellow-700" };
  return <span className={`px-2 py-0.5 rounded text-xs font-bold ${colors[method] || "bg-gray-100 text-gray-600"}`}>{method}</span>;
}

export default function DevelopersPage() {
  const [activeTab, setActiveTab] = useState<"midjourney" | "runway">("midjourney");

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* Header */}
      <header style={{ background: "var(--surface)", borderBottom: "1px solid var(--border-default)", position: "sticky", top: 0, zIndex: 30 }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <img src="/logo.png" alt="PortraitPay AI" style={{ height: "32px", width: "32px", borderRadius: "8px", objectFit: "contain" }} />
            <span style={{ fontSize: "17px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>PortraitPay AI</span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ThemeToggle />
            <LanguageToggle />
          </div>
        </div>
      </header>

      <main style={{ maxWidth: "900px", margin: "0 auto", padding: "48px 24px" }}>
        {/* Page header */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 16px", borderRadius: "9999px", background: "var(--accent-light)", color: "var(--accent-primary)", fontSize: "13px", fontWeight: 600, marginBottom: "16px" }}>
            <IconCode className="w-4 h-4" />
            API Documentation
          </div>
          <h1 style={{ fontSize: "32px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "12px", letterSpacing: "-0.03em" }}>
            AI 平台接入文档
          </h1>
          <p style={{ fontSize: "15px", color: "var(--text-secondary)", maxWidth: "560px", margin: "0 auto", lineHeight: 1.7 }}>
            让您的 AI 创作平台自动获得肖像授权。集成后，每次使用肖像创作都会自动计算版税并完成链上授权。
          </p>
        </div>

        {/* How it works */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "48px" }}>
          {[
            { step: "1", title: "申请 API Key", desc: "在设置页面创建 AI Platform API Key，设置权限范围和限额" },
            { step: "2", title: "集成 API", desc: "在请求时携带 X-API-Key 头，系统自动查询肖像授权状态" },
            { step: "3", title: "自动授权", desc: "系统计算版税，创建链上授权记录，AI 平台直接返回结果" },
          ].map((s) => (
            <div key={s.step} className="card" style={{ padding: "24px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--accent-primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700, marginBottom: "12px" }}>
                {s.step}
              </div>
              <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>{s.title}</h3>
              <p style={{ fontSize: "13px", color: "var(--text-tertiary)", lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>

        {/* API Reference */}
        <div className="card" style={{ padding: "0", marginBottom: "32px", overflow: "hidden" }}>
          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid var(--border-default)" }}>
            {(["midjourney", "runway"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "14px 24px", fontSize: "14px", fontWeight: 500,
                  borderBottom: activeTab === tab ? "2px solid var(--accent-primary)" : "2px solid transparent",
                  color: activeTab === tab ? "var(--accent-primary)" : "var(--text-tertiary)",
                  background: "transparent", cursor: "pointer", transition: "all 0.15s",
                }}
              >
                {tab === "midjourney" ? "Midjourney" : "Runway"}
              </button>
            ))}
          </div>

          <div style={{ padding: "32px" }}>
            {activeTab === "midjourney" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                {/* Auth */}
                <div>
                  <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <IconKey className="w-4 h-4" /> 认证
                  </h3>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "12px" }}>
                    所有请求需要在 Header 中携带 API Key：
                  </p>
                  <CodeBlock code={`X-API-Key: pp_live_your_api_key_here`} label="Header" />
                </div>

                {/* License check */}
                <div>
                  <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <IconCheck className="w-4 h-4" /> 授权查询
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                    <MethodBadge method="GET" />
                    <code style={{ fontSize: "13px", color: "var(--text-primary)", fontFamily: "monospace" }}>/api/v1/ai/midjourney/portrait/:portraitId/license</code>
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "12px" }}>
                    查询指定肖像的授权状态和费用：
                  </p>
                  <CodeBlock
                    code={`curl -X GET "https://portraitpayai.com/api/v1/ai/midjourney/portrait/123/license" \\
  -H "X-API-Key: pp_live_your_key" \\
  -H "Content-Type: application/json"`}
                  />
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "12px", marginBottom: "8px" }}>响应示例：</p>
                  <CodeBlock
                    code={`{
  "success": true,
  "data": {
    "portraitId": "123",
    "isLicensed": true,
    "licenseFee": "50.00",
    "currency": "USD",
    "royaltyRate": "8.5",
    "scopes": ["COMMERCIAL_USE", "EDITORIAL_USE"],
    "territorialScope": "global",
    "licenseId": "lic_abc123",
    "expiresAt": "2027-01-01T00:00:00Z"
  }
}`}
                  />
                </div>

                {/* Generate */}
                <div>
                  <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <IconLink className="w-4 h-4" /> 生成请求
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                    <MethodBadge method="POST" />
                    <code style={{ fontSize: "13px", color: "var(--text-primary)", fontFamily: "monospace" }}>/api/v1/ai/midjourney</code>
                  </div>
                  <CodeBlock
                    code={`curl -X POST "https://portraitpayai.com/api/v1/ai/midjourney" \\
  -H "X-API-Key: pp_live_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "portraitId": "portrait_abc123",
    "prompt": "A stylized portrait in impressionist style",
    "taskType": "imagine",
    "aspectRatio": "1:1",
    "seed": 12345
  }'`}
                  />
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "12px", marginBottom: "8px" }}>响应：</p>
                  <CodeBlock
                    code={`{
  "success": true,
  "data": {
    "requestId": "req_mj_xyz789",
    "status": "PROCESSING",
    "licenseId": "lic_abc123",
    "royaltyCharged": "4.25",
    "currency": "USD",
    "resultUrl": null
  }
}`}
                  />
                </div>

                {/* Error codes */}
                <div>
                  <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "12px" }}>错误代码</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {[
                      { code: "PP-1001", msg: "肖像未授权 — 需要先获取授权", status: "402" },
                      { code: "PP-1002", msg: "授权范围不包含此用途", status: "403" },
                      { code: "PP-1003", msg: "超出使用地区范围", status: "403" },
                      { code: "PP-2001", msg: "API Key 无效或已撤销", status: "401" },
                      { code: "PP-2002", msg: "超出每分钟请求限额", status: "429" },
                    ].map((e) => (
                      <div key={e.code} style={{ display: "flex", gap: "12px", alignItems: "center", fontSize: "13px" }}>
                        <span style={{ fontFamily: "monospace", fontWeight: 600, color: "var(--accent-primary)", minWidth: "80px" }}>{e.code}</span>
                        <span style={{ color: "var(--text-secondary)", flex: 1 }}>{e.msg}</span>
                        <span style={{ color: "var(--text-tertiary)", fontSize: "12px" }}>HTTP {e.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "runway" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                  Runway API 集成方式与 Midjourney 类似。请在 Header 中使用相同的 <code style={{ fontFamily: "monospace", background: "var(--bg-secondary)", padding: "2px 6px", borderRadius: "4px" }}>X-API-Key</code> 认证方式，接入地址为：
                </p>
                <CodeBlock code={`POST https://portraitpayai.com/api/v1/ai/runway`} />
                <p style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>
                  具体参数和响应格式请参考上方 Midjourney 文档，接口设计兼容。
                </p>
              </div>
            )}
          </div>
        </div>

        {/* SDK / Quick start */}
        <div className="card" style={{ padding: "32px", marginBottom: "32px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px" }}>快速开始</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.7 }}>
              第一步：在 <Link href="/api-keys" style={{ color: "var(--accent-primary)", textDecoration: "none", fontWeight: 500 }}>API Keys 管理页面</Link>创建一个 AI Platform API Key
            </p>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.7 }}>
              第二步：在您的 AI Platform 代码中，修改 HTTP 请求，添加 <code style={{ fontFamily: "monospace", fontSize: "13px", background: "var(--bg-secondary)", padding: "2px 6px", borderRadius: "4px" }}>X-API-Key</code> Header
            </p>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.7 }}>
              第三步：PortraitPay 自动处理授权、版税计算和链上存证，您的平台无需任何额外集成费用
            </p>
          </div>
        </div>

        {/* CTA */}
        <div style={{
          background: "linear-gradient(135deg, var(--accent-primary) 0%, #6366f1 100%)",
          borderRadius: "var(--radius-xl)", padding: "32px 40px",
          textAlign: "center", color: "white",
        }}>
          <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>准备好接入了？</h2>
          <p style={{ fontSize: "14px", opacity: 0.85, marginBottom: "24px" }}>获取 API Key，立即开始集成</p>
          <Link href="/api-keys" style={{
            display: "inline-block", padding: "12px 28px",
            background: "white", color: "var(--accent-primary)",
            borderRadius: "10px", fontWeight: 600, fontSize: "14px",
            textDecoration: "none",
          }}>
            管理 API Keys
          </Link>
        </div>
      </main>
    </div>
  );
}

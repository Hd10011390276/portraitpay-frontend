/**
 * /enterprise/contact — 企业入驻咨询页面
 * Redesigned to match home page dark modern aesthetic
 */
"use client";

import { useState } from "react";
import Link from "next/link";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import ThemeToggle from "@/components/ThemeToggle";

// ─── Icons ──────────────────────────────────────────────────────
type IconProps = { className?: string; style?: React.CSSProperties };
const IconBuilding = ({ className, style }: IconProps) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><line x1="8" y1="6" x2="8" y2="6.01"/><line x1="12" y1="6" x2="12" y2="6.01"/><line x1="16" y1="6" x2="16" y1="6.01"/><line x1="8" y1="10" x2="8" y2="10.01"/><line x1="12" y1="10" x2="12" y1="10.01"/><line x1="16" y1="10" x2="16" y1="10.01"/><line x1="8" y1="14" x2="8" y1="14.01"/><line x1="12" y1="14" x2="12" y1="14.01"/><line x1="16" y1="14" x2="16" y1="14.01"/>
  </svg>
);
const IconZap = ({ className, style }: IconProps) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const IconFileText = ({ className, style }: IconProps) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
  </svg>
);
const IconShield = ({ className, style }: IconProps) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const IconScale = ({ className, style }: IconProps) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
    <path d="M12 3v18"/><path d="M5 7H3"/><path d="M5 3H3"/><path d="M19 7h2"/><path d="M19 3h2"/><path d="M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5"/><path d="M12 7a5 5 0 0 0-5 5 5 5 0 0 0 5 5"/>
  </svg>
);
const IconBarChart = ({ className, style }: IconProps) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);
const IconCheck = ({ className, style }: IconProps) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconArrowRight = ({ className, style }: IconProps) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const IconMail = ({ className, style }: IconProps) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
  </svg>
);
const IconUsers = ({ className, style }: IconProps) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IconStar = ({ className, style }: IconProps) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

interface FormData {
  name: string;
  email: string;
  contactPhone: string;
  company: string;
  enterpriseName: string;
  intendedUse: string;
  expectedScale: string;
  message: string;
}

interface FieldError {
  name?: string;
  email?: string;
  enterpriseName?: string;
  intendedUse?: string;
}

const SCALE_OPTIONS = [
  "1-10人", "11-50人", "51-200人", "201-1000人", "1000人以上",
];

const USE_CASES = [
  { value: "marketing", label: "品牌营销与广告" },
  { value: "product", label: "产品包装与设计" },
  { value: "content", label: "内容创作与媒体" },
  { value: "ecommerce", label: "电商与零售" },
  { value: "education", label: "教育培训" },
  { value: "ai_training", label: "AI 模型训练" },
  { value: "other", label: "其他" },
];

export default function EnterpriseContactPage() {
  const [form, setForm] = useState<FormData>({
    name: "", email: "", contactPhone: "", company: "",
    enterpriseName: "", intendedUse: "", expectedScale: "", message: "",
  });
  const [errors, setErrors] = useState<FieldError>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  function validate(): boolean {
    const e: FieldError = {};
    if (!form.name.trim()) e.name = "请填写联系人姓名";
    if (!form.email.trim()) e.email = "请填写邮箱";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "邮箱格式不正确";
    if (!form.enterpriseName.trim()) e.enterpriseName = "请填写企业名称";
    if (!form.intendedUse.trim()) e.intendedUse = "请填写用途说明";
    else if (form.intendedUse.trim().length < 10) e.intendedUse = "请详细描述用途（至少10个字符）";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setServerError("");
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, type: "ENTERPRISE" }),
      });
      const json = await res.json();
      if (json.success) { setSuccess(true); }
      else { setServerError(json.error ?? "提交失败，请稍后重试"); }
    } catch { setServerError("网络错误，请检查网络连接"); }
    finally { setSubmitting(false); }
  }

  function update(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FieldError]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-primary)" }}>
        <div className="card text-center" style={{ maxWidth: "480px", width: "100%", padding: "48px 32px" }}>
          <div style={{
            width: "72px", height: "72px", borderRadius: "var(--radius-full)",
            background: "var(--accent-light)", margin: "0 auto 24px",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <IconBuilding className="w-9 h-9" style={{ color: "var(--accent-primary)" }} />
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>咨询已提交！</h2>
          <p className="mb-8" style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>
            感谢您的企业入驻咨询，我们的商务团队会在 <strong>1-2 个工作日</strong>内与您联系，确认合作细节。
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/" className="btn btn-primary flex items-center justify-center gap-2">
              返回首页 <IconArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/contact" className="btn btn-secondary flex items-center justify-center gap-2">
              普通联系表单
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* ─── Dark glass header (matches home page) ─── */}
      <header style={{
        background: "var(--surface)", borderBottom: "1px solid var(--border-default)",
        position: "sticky", top: 0, zIndex: 30,
      }}>
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

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 24px" }}>
        {/* ─── Hero banner ─── */}
        <div style={{
          background: "linear-gradient(135deg, var(--accent-primary) 0%, #6366f1 100%)",
          borderRadius: "var(--radius-xl)", padding: "40px 48px",
          marginBottom: "40px", color: "white",
          display: "flex", alignItems: "center", gap: "32px",
          flexWrap: "wrap",
        }}>
          <div style={{
            width: "64px", height: "64px", borderRadius: "16px",
            background: "rgba(255,255,255,0.15)", display: "flex",
            alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <IconBuilding className="w-8 h-8" style={{ color: "white" }} />
          </div>
          <div style={{ flex: 1, minWidth: "240px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "8px", letterSpacing: "-0.02em" }}>
              企业批量授权咨询
            </h1>
            <p style={{ fontSize: "14px", opacity: 0.85, lineHeight: 1.7, maxWidth: "560px" }}>
              为您的企业获取官方授权，批量使用肖像数据进行营销、内容创作、AI训练等商业用途。我们的授权团队将根据您的需求提供定制化方案。
            </p>
          </div>
        </div>

        {/* ─── Trust badges ─── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "48px" }}>
          {[
            { icon: <IconZap className="w-5 h-5" />, label: "快速响应", sub: "1-2个工作日联系" },
            { icon: <IconFileText className="w-5 h-5" />, label: "批量授权", sub: "支持大规模商业使用" },
            { icon: <IconShield className="w-5 h-5" />, label: "合规保障", sub: "完整法律授权文件" },
          ].map((s) => (
            <div key={s.label} style={{
              background: "var(--surface)", border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-xl)", padding: "20px 24px",
              display: "flex", alignItems: "center", gap: "16px",
            }}>
              <div style={{
                width: "44px", height: "44px", borderRadius: "12px",
                background: "var(--accent-light)", display: "flex",
                alignItems: "center", justifyContent: "center",
                color: "var(--accent-primary)", flexShrink: 0,
              }}>
                {s.icon}
              </div>
              <div>
                <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)" }}>{s.label}</p>
                <p style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "2px" }}>{s.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ─── Main grid: form + sidebar ─── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "24px", alignItems: "start" }}>
          {/* ─── Form card ─── */}
          <div className="card" style={{ padding: "40px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "32px" }}>
              填写咨询表单
            </h2>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "28px" }}>

              {/* Row: name + email */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "8px" }}>
                    联系人姓名 <span style={{ color: "var(--error)" }}>*</span>
                  </label>
                  <input
                    type="text" value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="张三"
                    style={{
                      width: "100%", padding: "10px 14px", borderRadius: "10px", fontSize: "14px",
                      border: errors.name ? "1px solid var(--error)" : "1px solid var(--border-default)",
                      background: "var(--bg-primary)", color: "var(--text-primary)",
                      outline: "none", transition: "border-color 0.2s",
                    }}
                  />
                  {errors.name && <p style={{ fontSize: "12px", color: "var(--error)", marginTop: "4px" }}>{errors.name}</p>}
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "8px" }}>
                    工作邮箱 <span style={{ color: "var(--error)" }}>*</span>
                  </label>
                  <input
                    type="email" value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="business@company.com"
                    style={{
                      width: "100%", padding: "10px 14px", borderRadius: "10px", fontSize: "14px",
                      border: errors.email ? "1px solid var(--error)" : "1px solid var(--border-default)",
                      background: "var(--bg-primary)", color: "var(--text-primary)",
                      outline: "none", transition: "border-color 0.2s",
                    }}
                  />
                  {errors.email && <p style={{ fontSize: "12px", color: "var(--error)", marginTop: "4px" }}>{errors.email}</p>}
                </div>
              </div>

              {/* Row: phone + dept */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "8px" }}>
                    联系电话 <span style={{ color: "var(--text-tertiary)", fontWeight: 400 }}>(可选)</span>
                  </label>
                  <input
                    type="tel" value={form.contactPhone}
                    onChange={(e) => update("contactPhone", e.target.value)}
                    placeholder="+86 138-0000-0000"
                    style={{
                      width: "100%", padding: "10px 14px", borderRadius: "10px", fontSize: "14px",
                      border: "1px solid var(--border-default)", background: "var(--bg-primary)",
                      color: "var(--text-primary)", outline: "none", transition: "border-color 0.2s",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "8px" }}>
                    部门 / 公司 <span style={{ color: "var(--text-tertiary)", fontWeight: 400 }}>(可选)</span>
                  </label>
                  <input
                    type="text" value={form.company}
                    onChange={(e) => update("company", e.target.value)}
                    placeholder="市场部 / XX公司"
                    style={{
                      width: "100%", padding: "10px 14px", borderRadius: "10px", fontSize: "14px",
                      border: "1px solid var(--border-default)", background: "var(--bg-primary)",
                      color: "var(--text-primary)", outline: "none", transition: "border-color 0.2s",
                    }}
                  />
                </div>
              </div>

              {/* Enterprise name */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "8px" }}>
                  企业名称 <span style={{ color: "var(--error)" }}>*</span>
                </label>
                <input
                  type="text" value={form.enterpriseName}
                  onChange={(e) => update("enterpriseName", e.target.value)}
                  placeholder="请填写公司全称"
                  style={{
                    width: "100%", padding: "10px 14px", borderRadius: "10px", fontSize: "14px",
                    border: errors.enterpriseName ? "1px solid var(--error)" : "1px solid var(--border-default)",
                    background: "var(--bg-primary)", color: "var(--text-primary)",
                    outline: "none", transition: "border-color 0.2s",
                  }}
                />
                {errors.enterpriseName && <p style={{ fontSize: "12px", color: "var(--error)", marginTop: "4px" }}>{errors.enterpriseName}</p>}
              </div>

              {/* Use case */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "8px" }}>
                  用途说明 <span style={{ color: "var(--error)" }}>*</span>
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
                  {USE_CASES.map((uc) => (
                    <button
                      key={uc.value} type="button"
                      onClick={() => update("intendedUse", uc.label)}
                      style={{
                        padding: "6px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 500,
                        border: form.intendedUse === uc.label
                          ? "1px solid var(--accent-primary)"
                          : "1px solid var(--border-default)",
                        background: form.intendedUse === uc.label ? "var(--accent-primary)" : "var(--bg-secondary)",
                        color: form.intendedUse === uc.label ? "white" : "var(--text-secondary)",
                        transition: "all 0.15s",
                      }}
                    >
                      {uc.label}
                    </button>
                  ))}
                </div>
                <textarea
                  value={form.intendedUse}
                  onChange={(e) => update("intendedUse", e.target.value)}
                  placeholder="详细描述您的使用场景，例如：计划用于品牌营销活动，预计覆盖1000万用户..."
                  rows={4}
                  style={{
                    width: "100%", padding: "10px 14px", borderRadius: "10px", fontSize: "14px",
                    border: errors.intendedUse ? "1px solid var(--error)" : "1px solid var(--border-default)",
                    background: "var(--bg-primary)", color: "var(--text-primary)",
                    outline: "none", resize: "vertical", transition: "border-color 0.2s",
                  }}
                />
                {errors.intendedUse && <p style={{ fontSize: "12px", color: "var(--error)", marginTop: "4px" }}>{errors.intendedUse}</p>}
              </div>

              {/* Scale */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "8px" }}>
                  预期规模 <span style={{ color: "var(--text-tertiary)", fontWeight: 400 }}>(可选)</span>
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {SCALE_OPTIONS.map((opt) => (
                    <button
                      key={opt} type="button"
                      onClick={() => update("expectedScale", opt)}
                      style={{
                        padding: "8px 16px", borderRadius: "8px", fontSize: "13px",
                        border: form.expectedScale === opt
                          ? "1px solid var(--accent-primary)"
                          : "1px solid var(--border-default)",
                        background: form.expectedScale === opt ? "var(--accent-primary)" : "var(--bg-secondary)",
                        color: form.expectedScale === opt ? "white" : "var(--text-secondary)",
                        transition: "all 0.15s",
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Additional message */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "8px" }}>
                  补充说明 <span style={{ color: "var(--text-tertiary)", fontWeight: 400 }}>(可选)</span>
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) => update("message", e.target.value)}
                  placeholder="任何其他需求或问题..."
                  rows={3}
                  style={{
                    width: "100%", padding: "10px 14px", borderRadius: "10px", fontSize: "14px",
                    border: "1px solid var(--border-default)", background: "var(--bg-primary)",
                    color: "var(--text-primary)", outline: "none", resize: "vertical", transition: "border-color 0.2s",
                  }}
                />
              </div>

              {serverError && (
                <div style={{
                  padding: "12px 16px", borderRadius: "10px", fontSize: "13px",
                  background: "color-mix(in srgb, var(--error) 10%, transparent)",
                  border: "1px solid var(--error)", color: "var(--error)",
                }}>
                  {serverError}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: "100%", padding: "13px 24px",
                  background: "var(--accent-primary)", color: "white",
                  borderRadius: "10px", fontSize: "15px", fontWeight: 600,
                  border: "none", cursor: submitting ? "not-allowed" : "pointer",
                  opacity: submitting ? 0.6 : 1,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  transition: "opacity 0.15s",
                }}
              >
                {submitting ? (
                  <>
                    <span style={{
                      width: "16px", height: "16px", borderRadius: "50%",
                      border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid white",
                      animation: "spin 0.8s linear infinite", display: "inline-block",
                    }} />
                    提交中...
                  </>
                ) : (
                  <>提交企业入驻咨询 <IconArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>
          </div>

          {/* ─── Sidebar ─── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* What's included */}
            <div className="card" style={{ padding: "28px 24px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "20px" }}>
                企业授权包含
              </h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "14px" }}>
                {[
                  { icon: <IconFileText className="w-4 h-4" />, text: "区块链存证授权协议" },
                  { icon: <IconUsers className="w-4 h-4" />, text: "批量肖像数据使用许可" },
                  { icon: <IconShield className="w-4 h-4" />, text: "完整合规资质文件" },
                  { icon: <IconScale className="w-4 h-4" />, text: "灵活的授权范围定制" },
                  { icon: <IconBarChart className="w-4 h-4" />, text: "使用数据统计面板" },
                  { icon: <IconScale className="w-4 h-4" />, text: "法律顾问支持" },
                ].map((item) => (
                  <li key={item.text} style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "13px", color: "var(--text-secondary)" }}>
                    <span style={{ color: "var(--accent-primary)", flexShrink: 0, display: "flex" }}>{item.icon}</span>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Case studies */}
            <div className="card" style={{ padding: "28px 24px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "20px" }}>
                合作案例
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                  { brand: "某头部电商平台", case: "品牌联名营销，覆盖用户 5000万+", badge: "电商" },
                  { brand: "知名影视公司", case: "艺人肖像授权用于衍生品开发", badge: "影视" },
                  { brand: "头部 AI 创业公司", case: "授权用于模型训练数据集", badge: "AI" },
                ].map((c) => (
                  <div key={c.brand} style={{
                    padding: "14px 16px", borderRadius: "12px",
                    background: "var(--bg-secondary)", border: "1px solid var(--border-default)",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <IconStar className="w-3.5 h-3.5" style={{ color: "var(--accent-primary)", flexShrink: 0 }} />
                      <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{c.brand}</span>
                      <span style={{
                        fontSize: "11px", padding: "2px 8px", borderRadius: "6px",
                        background: "var(--accent-light)", color: "var(--accent-primary)",
                      }}>{c.badge}</span>
                    </div>
                    <p style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>{c.case}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div style={{
              padding: "20px 24px", borderRadius: "var(--radius-xl)",
              background: "color-mix(in srgb, var(--accent-primary) 8%, var(--surface))",
              border: "1px solid color-mix(in srgb, var(--accent-primary) 20%, transparent)",
            }}>
              <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>
                需要紧急联系？
              </p>
              <p style={{ fontSize: "12px", color: "var(--text-tertiary)", marginBottom: "10px" }}>
                如需快速沟通，可直接发送邮件至
              </p>
              <a href="mailto:contact@portraitpayai.com" style={{
                fontSize: "13px", color: "var(--accent-primary)", fontWeight: 500,
                textDecoration: "none", wordBreak: "break-all",
              }}>
                contact@portraitpayai.com
              </a>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

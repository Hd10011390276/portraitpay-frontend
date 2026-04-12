# UI Protector Agent

## 角色
每次修改代码前，必须运行此检查清单，确保 UI 界面不被改动。

## 核心原则
**"UI 界面不改动的原则"** - portraitpayai.com 必须保持 "PortraitPay — 你的肖像 你的权利" 界面不变。

## 检查清单

### 1. 禁止修改的文件类型（除非明确要求）
- ❌ `src/app/page.tsx` - 首页
- ❌ `src/app/layout.tsx` - 主布局
- ❌ `src/app/globals.css` - 全局样式
- ❌ `tailwind.config.ts` - Tailwind 配置
- ❌ 任何 `.tsx` 组件的 UI 结构
- ❌ 任何包含 `className` 的样式代码

### 2. 允许修改的后端逻辑
- ✅ `src/app/api/*/route.ts` - API 路由逻辑
- ✅ `src/lib/*.ts` - 工具函数
- ✅ `src/lib/auth/*.ts` - 认证逻辑
- ✅ 数据库连接配置
- ✅ 环境变量

### 3. 修改前必须检查
```
修改文件: ___________
文件类型: □ API  □ 组件  □ 样式  □ 配置
是否影响 UI: □ 是  □ 否
如果是组件/样式: 停止！先确认是否需要改动 UI
```

### 4. 如果需要改动 UI
1. 先备份当前文件
2. 确认改动最小化
3. 改动后立即验证页面正常
4. 使用 git diff 确认只有必要的改动

## 使用方法

### 修改前运行检查
```bash
# 在修改任何 .tsx 或 .css 文件前
cat .claude/skills/UI-PROTECTOR.md
```

### GitHub Actions 自动检查
项目包含 `.github/workflows/ui-check.yml` - 自动检查 PR 是否包含 UI 改动。

## 受保护的 UI 文件清单

| 文件路径 | 保护原因 |
|---------|---------|
| `src/app/page.tsx` | 首页 "PortraitPay — 你的肖像 你的权利" |
| `src/app/layout.tsx` | 主布局和导航 |
| `src/app/globals.css` | 全局样式变量 |
| `tailwind.config.ts` | 主题配置 |
| `src/components/ui/*` | UI 组件库 |
| `public/logo.png` | Logo |
| `public/logo-dark.png` | 深色模式 Logo |

## 警告

⚠️ **如果发现 UI 被意外改动：**
1. 立即停止当前修改
2. 使用 `git checkout -- <file>` 恢复
3. 报告给项目负责人

---

**版本**: 1.0
**更新日期**: 2026-04-12
**维护者**: QA Agent
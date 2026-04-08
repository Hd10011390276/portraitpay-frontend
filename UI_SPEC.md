# PortraitPay UI Design System — SPEC v1.0

> 基于 Apple 极简主义 + 金融科技清晰感 | 2026-04-08

---

## 1. Visual Theme

**风格方向：** Apple Human Interface Guidelines × Fintech 清晰感
- 大面积留白，内容密度低，呼吸感强
- 字体重量对比鲜明，层次清晰
- 圆角统一 12px（卡片）、8px（按钮）、16px（容器）
- 无渐变背景，纯色优先
- 交互反馈即时、轻盈（150-200ms ease-out）

---

## 2. Color Palette

### Light Mode
```
--bg-primary:       #FFFFFF
--bg-secondary:     #F5F5F7
--bg-tertiary:      #EBEBED
--surface:          #FFFFFF
--surface-elevated:  #FFFFFF

--text-primary:     #1D1D1F
--text-secondary:   #6E6E73
--text-tertiary:    #86868B
--text-inverse:     #FFFFFF

--accent-primary:   #2563EB   /* Primary Blue — 行动点 */
--accent-hover:     #1D4ED8
--accent-light:     #EFF6FF   /* Blue tint */
--accent-violet:    #7C3AED   /* Accent Violet — 特殊强调 */
--accent-violet-light: #F5F3FF

--success:          #059669
--success-light:    #ECFDF5
--warning:          #D97706
--warning-light:    #FFFBEB
--error:            #DC2626
--error-light:      #FEF2F2

--border-default:   #E5E5EA
--border-subtle:    #F2F2F7
--divider:          #E5E5EA
```

### Dark Mode
```
--bg-primary:       #000000
--bg-secondary:     #1C1C1E
--bg-tertiary:      #2C2C2E
--surface:          #1C1C1E
--surface-elevated: #2C2C2E

--text-primary:     #F5F5F7
--text-secondary:   #A1A1A6
--text-tertiary:    #636366
--text-inverse:     #000000

--accent-primary:   #4D9AFF   /* Lighter blue for dark bg */
--accent-hover:     #6BA8FF
--accent-light:     #1E3A5F   /* Dark blue tint */
--accent-violet:    #A78BFA   /* Lighter violet */
--accent-violet-light: #2D1F5E

--success:          #34D399
--success-light:    #064E3B
--warning:          #FBBF24
--warning-light:   #78350F
--error:           #F87171
--error-light:     #7F1D1D

--border-default:   #38383A
--border-subtle:    #2C2C2E
--divider:         #38383A
```

---

## 3. Typography

**Font:** Inter (loaded via next/font/google)

| Token | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| `--text-hero` | 60-72px | 700 (bold) | 1.05 | Hero headline |
| `--text-h1` | 48px | 700 | 1.1 | Page title |
| `--text-h2` | 36px | 600 | 1.2 | Section heading |
| `--text-h3` | 24px | 600 | 1.3 | Card heading |
| `--text-h4` | 18px | 600 | 1.4 | Sub-heading |
| `--text-body-lg` | 18px | 400 | 1.6 | Lead text |
| `--text-body` | 16px | 400 | 1.6 | Body text |
| `--text-body-sm` | 14px | 400 | 1.5 | Secondary text |
| `--text-caption` | 12px | 500 | 1.4 | Label, caption |
| `--text-overline` | 11px | 600 | 1.3 | OVERLINE (uppercase, 0.1em tracking) |

**Letter spacing:** Overline 0.08em tracking; H1-H2 -0.02em

---

## 4. Spacing System

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Icon gap |
| `--space-2` | 8px | Tight spacing |
| `--space-3` | 12px | Component inner |
| `--space-4` | 16px | Default gap |
| `--space-5` | 20px | Card padding |
| `--space-6` | 24px | Section gap |
| `--space-8` | 32px | Large gap |
| `--space-10` | 40px | Section padding |
| `--space-12` | 48px | Major section |
| `--space-16` | 64px | Page section |
| `--space-24` | 96px | Hero spacing |

---

## 5. Layout Grid

**Max Container:** 1200px (centered)
**Grid:** 12-column, 24px gutter
**Breakpoints:**
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px
- Wide: > 1280px

**Section Rhythm:**
- Mobile: 64px vertical padding per section
- Desktop: 96px vertical padding per section
- Hero: 120px top padding

---

## 6. Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 6px | Badges, small elements |
| `--radius-md` | 8px | Buttons, inputs |
| `--radius-lg` | 12px | Cards, panels |
| `--radius-xl` | 16px | Modals, large cards |
| `--radius-2xl` | 24px | Featured cards |
| `--radius-full` | 9999px | Pills, avatars |

---

## 7. Shadow System

### Light Mode
```
--shadow-xs:  0 1px 2px rgba(0,0,0,0.04)
--shadow-sm:  0 2px 8px rgba(0,0,0,0.06)
--shadow-md:  0 4px 16px rgba(0,0,0,0.08)
--shadow-lg:  0 8px 32px rgba(0,0,0,0.10)
--shadow-xl:  0 16px 48px rgba(0,0,0,0.12)
--shadow-inner: inset 0 1px 2px rgba(0,0,0,0.06)
```

### Dark Mode
```
--shadow-xs:  0 1px 2px rgba(0,0,0,0.3)
--shadow-sm:  0 2px 8px rgba(0,0,0,0.4)
--shadow-md:  0 4px 16px rgba(0,0,0,0.5)
--shadow-lg:  0 8px 32px rgba(0,0,0,0.6)
--shadow-xl:  0 16px 48px rgba(0,0,0,0.7)
--shadow-inner: inset 0 1px 2px rgba(0,0,0,0.3)
```

### Elevation Strategy (Dark Mode)
Dark mode 背景更暗，elevation 通过以下方式实现：
- Level 0: 纯 `--bg-primary`
- Level 1: `--bg-secondary` (#1C1C1E)
- Level 2: `--bg-tertiary` (#2C2C2E)
- Level 3: `#3A3A3C` (hardcoded for highest elevation)
- 无需 shadow 区分 elevation，统一用 bg 色阶

---

## 8. Motion & Animation

**原则：** 快速、轻盈、不打断

| Type | Duration | Easing |
|------|----------|--------|
| Instant | 0ms | — |
| Fast | 150ms | ease-out |
| Normal | 200ms | ease-out |
| Slow | 300ms | ease-in-out |
| Page | 400ms | cubic-bezier(0.25, 0.1, 0.25, 1) |

**交互反馈：**
- Hover: 背景色变化 150ms，不做 transform
- Active: scale(0.97) + 150ms
- Focus: ring 2px offset 2px, color `--accent-primary`
- Loading: skeleton shimmer 1.5s infinite
- Page transitions: fade 200ms

---

## 9. Component Specifications

### Buttons

**Primary Button:**
- bg: `--accent-primary`, text: white
- Hover: `--accent-hover`, 150ms
- Active: scale(0.97)
- Padding: 12px 24px
- Border-radius: `--radius-md` (8px)
- Font: 15px / 600

**Secondary Button:**
- bg: `--surface`, border: 1px `--border-default`
- text: `--text-primary`
- Hover: bg `--bg-secondary`, border `--accent-primary`
- Shadow: `--shadow-xs`

**Ghost Button:**
- bg: transparent
- text: `--text-secondary`
- Hover: bg `--bg-secondary`, text `--text-primary`

**Destructive Button:**
- bg: `--error`, text: white
- Hover: #B91C1C (darker red)

### Cards

- bg: `--surface`
- border: 1px `--border-subtle`
- border-radius: `--radius-lg` (12px)
- shadow: `--shadow-sm` (light), none (dark)
- padding: 24px
- hover (if interactive): border `--accent-primary`, `--shadow-md`

### Navigation / Header

- height: 60px (desktop), 56px (mobile)
- bg: rgba(255,255,255,0.8) + backdrop-blur(20px) [light]
- bg: rgba(0,0,0,0.8) + backdrop-blur(20px) [dark]
- border-bottom: 1px `--border-subtle`
- shadow: none
- Logo: left aligned
- Nav items: centered, 14px/500, gap 32px
- CTA buttons: right aligned

### Badges / Tags

- padding: 4px 10px
- border-radius: `--radius-full`
- Font: 12px / 600
- Variants:
  - Default: bg `--bg-secondary`, text `--text-secondary`
  - Success: bg `--success-light`, text `--success`
  - Warning: bg `--warning-light`, text `--warning`
  - Error: bg `--error-light`, text `--error`
  - Accent: bg `--accent-light`, text `--accent-primary`

### Form Inputs

- height: 44px (touch-friendly)
- border: 1px `--border-default`
- border-radius: `--radius-md` (8px)
- bg: `--surface`
- text: `--text-primary`
- placeholder: `--text-tertiary`
- Focus: border `--accent-primary`, ring 3px `rgba(37,99,235,0.15)`
- Padding: 0 16px

### Avatar

- Sizes: 24px (xs), 32px (sm), 40px (md), 48px (lg), 64px (xl)
- border-radius: `--radius-full`
- Fallback: initials on gradient (blue→violet)
- Border: 2px solid `--surface` (to separate from bg)

### Mac Window Style Card (Dashboard Shell)

- border-radius: 12px
- border: 1px `--border-subtle`
- header height: 40px
- traffic lights: 12px circles, colors #FF5F57 / #FEBC2E / #28C840
- bg header: `--bg-secondary`

---

## 10. Do's & Don'ts

### ✅ DO
- 使用 CSS 变量引用所有 design tokens
- 统一使用 Inter 字体，不混用
- 所有 interactive elements 有 hover + active + focus 状态
- 黑暗模式下避免纯黑文字 on 纯黑背景（用 gray-300 on gray-900）
- 按钮文字始终可读（避免浅色文字 on 浅色背景）
- 表单 input height ≥ 44px（touch target）
- 重要操作按钮用 Primary，辅助操作用 Secondary/Ghost

### ❌ DON'T
- 不要在 bg-primary 上直接用 border-default（用 border-subtle）
- 不要混用多种圆角半径
- 不要在 dark mode 用纯黑 #000000 作为卡片背景（用 #1C1C1E）
- 不要用纯色文字 on 渐变背景
- 不要用 box-shadow 作为唯一 elevation 方式（配合 bg 色阶）
- 不要在移动端使用 hover 专属的隐藏内容
- 不要用过小的字体（body < 14px, caption < 12px）
- 不要用纯 black/white，用语义化 token

---

## 11. Responsive Behavior

| Breakpoint | Width | Layout Changes |
|------------|-------|----------------|
| Mobile | < 640px | Single column, hamburger nav, stacked cards |
| Tablet | 640-1024px | 2-column grid, condensed nav |
| Desktop | > 1024px | Full layout, max-width 1200px |
| Wide | > 1280px | Max-width 1200px centered, extra padding |

**Touch targets:** 所有可点击元素 ≥ 44×44px
**Mobile nav:** 汉堡菜单，侧滑 drawer
**Images:** 使用 next/image，始终指定 width/height 或 fill
**Breakpoint utilities:** hidden/mobile:hidden tablet:block 等

---

## 12. Implementation Checklist

### Phase 1: Design Foundation
- [ ] globals.css — 完整 CSS 变量系统 + dark mode
- [ ] layout.tsx — Inter font, 基础 metadata, favicon
- [ ] ThemeToggle — 保持现有逻辑，样式对齐 spec

### Phase 2: Core Layout
- [ ] Header.tsx — 样式更新，对齐 Apple 极简风格
- [ ] page.tsx (Home) — Hero + Features + How It Works + Pricing + CTA
- [ ] /login, /register — 表单样式对齐 spec
- [ ] /dashboard — Mac window style shell

### Phase 3: Key Pages
- [ ] /face-trace — 上传卡片 + 人脸检测结果样式
- [ ] /portraits — 网格布局 + 上传按钮
- [ ] /enterprise/* — 表单 + 结果展示

### Phase 4: Polish
- [ ] 所有 Button 组件统一样式
- [ ] Badge/Tag 组件
- [ ] Toast 通知样式
- [ ] 表单验证 error 状态
- [ ] Loading skeleton 样式

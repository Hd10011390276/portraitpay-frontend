# PortraitPay — 完整开发任务

## 项目信息
- **本地路径**: `/Users/hangdi/.openclaw-portrait/workspace/portraitpay`
- **GitHub**: `github.com/Hd10011390276/portraitpay`
- **Vercel**: `portraitpay` (prj_6FYHbjqW3UebcAxGAwuIk0wXcVpr)
- **数据库**: Railway PostgreSQL (已有 Prisma schema)
- **SMTP**: 腾讯企业邮箱 (contact@portraitpayai.com, smtp.exmail.qq.com:465)
- **环境变量** (Vercel 已配置): SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM, ADMIN_EMAIL

---

## 一、注册登录 + 邮箱验证

### 1.1 注册后发送验证邮件
**文件**: `src/app/api/auth/register/route.ts`

当前注册成功后没有发送验证邮件。需要：
- 生成 6 位数字验证码，存 Prisma `User.verificationCode` + `verificationExpires`
- 发送验证邮件到用户邮箱，包含验证码和验证链接
- 链接格式: `https://portraitpayai.com/verify-email?code=XXXXXX&userId=<userId>`

### 1.2 验证邮箱页面 + API
**新增**: `src/app/verify-email/page.tsx` 和 `src/app/api/auth/verify-email/route.ts`

GET: 显示验证码输入表单
POST: 验证用户输入的 6 位验证码是否匹配且未过期

### 1.3 登录时检查邮箱验证状态
未验证邮箱的用户，显示提示："请先验证邮箱"

### 1.4 忘记密码邮件
**文件**: `src/app/api/auth/forgot-password/route.ts`

当前已有路由，但需要确认 nodemailer 发送重置链接是否正常工作。
重置链接格式: `https://portraitpayai.com/reset-password?token=<jwt>&userId=<userId>`

### 1.5 重置密码页面 + API
**新增**: `src/app/reset-password/page.tsx` 和 `src/app/api/auth/reset-password/route.ts`

---

## 二、肖像上传 + 人脸比对

### 2.1 肖像上传页面完善
**文件**: `src/app/portraits/upload/page.tsx`

当前已有 UI，但需要确保：
- 提交后调用 `/api/portraits` 创建记录
- 实际文件上传到 S3 或本地 `public/uploads/`
- 数据库记录 `portrait.originalImageUrl`

### 2.2 人脸比对 (face-api.js)
**文件**: `src/components/portrait/UploadZone.tsx` 和 `src/lib/face.ts`

当前 `extractFaceDescriptor` 和 `compareFaces` 逻辑已有：
- 人脸特征提取使用 `@vladmandic/face-api`
- 模型文件在 `/public/models/` (需下载放到 public 目录)

模型下载地址:
```
https://github.com/vladmandic/face-api/tree/master/model
```
需下载: tiny_face_detector, face_landmark_68, face_recognition 模型

### 2.3 肖像铸造上链
**新增**: `src/app/portraits/[id]/mint/page.tsx` 和 `src/app/api/portraits/[id]/mint/route.ts`

点击"铸造"按钮后：
1. 生成肖像元数据的 SHA-256 哈希
2. 调用以太坊合约 mint (Sepolia 测试网)
3. 保存合约 txHash 到 Prisma `Portrait`

合约地址 (Sepolia 部署后填入):
```env
NEXT_PUBLIC_CONTRACT_ADDRESS=
SEPOLIA_RPC_URL=
PRIVATE_KEY=  (后端环境变量，不要暴露)
```

### 2.4 肖像列表 + 详情页
**新增**: `src/app/portraits/page.tsx` (列表)
**新增**: `src/app/portraits/[id]/page.tsx` (详情)

---

## 三、IPFS 存储

### 3.1 IPFS 上传
**新增**: `src/lib/ipfs.ts`

使用 Pinata 或 Infura IPFS API:
```env
PINATA_API_KEY=
PINATA_SECRET_API_KEY=
```

上传流程：
1. 图片转 ArrayBuffer
2. 调用 Pinata API 上传
3. 获得 IPFS CID
4. 保存 `ipfs://<CID>` 到 Prisma

---

## 四、区块链合约

### 4.1 部署 PortraitNFT 合约 (Sepolia)
**目录**: `contracts/`

使用 Hardhat 部署到 Sepolia:
```bash
cd contracts
npx hardhat compile
npx hardhat deploy --network sepolia
```

合约功能:
- `mintPortrait(userId, name, imageHash, metadataHash)` → tokenId
- `transferPortrait(tokenId, to)` → 授权转移
- `setLicense(tokenId, price, duration)` → 设定授权条款
- `grantLicense(tokenId, buyer, duration)` → 授权购买

### 4.2 前端调用合约
**新增**: `src/lib/contracts/portraitNft.ts`

使用 ethers.js v6:
```bash
npm install ethers
```

```typescript
// 合约 ABI 和地址从环境变量读取
const contract = new Contract(CONTRACT_ADDRESS, ABI, signer)
```

---

## 五、侵权检测

### 5.1 图像相似度搜索
**新增**: `src/app/api/face/search/route.ts`

使用 CLIP 模型做图像相似度搜索：
```bash
npm install @xenova/transformers
```

流程:
1. 用户上传疑似侵权图片
2. 提取图片 embedding
3. 和数据库中已注册肖像的 embedding 做余弦相似度
4. 返回相似度 > 阈值的所有匹配

### 5.2 侵权监控任务
**新增**: `src/app/api/cron/monitoring/route.ts`

定时任务 (Vercel Cron 或 Railway):
1. 抓取主流图片网站
2. 提取图片 embedding
3. 和数据库匹配
4. 发现侵权 → 发邮件通知 + 创建 Infringement 记录

---

## 六、KYC 认证

### 6.1 KYC 提交页面
**文件**: `src/app/kyc/page.tsx`

用户提交:
- 真实姓名
- 身份证号
- 身份证正面照片
- 证件照 (自拍)
- Face++ 或腾讯云人脸核身 API 验证

### 6.2 KYC API
**新增**: `src/app/api/v1/kyc/submit/route.ts`
**新增**: `src/app/api/v1/kyc/verify/route.ts`

调用腾讯云人脸核身:
```env
TENCENT_FACE_SECRET_ID=
TENCENT_FACE_SECRET_KEY=
```

### 6.3 管理员 KYC 审核
**新增**: `src/app/admin/kyc/page.tsx`

管理员查看用户 KYC 申请，点击通过/拒绝

---

## 七、支付 + 提现

### 7.1 Stripe 集成
**新增**: `src/app/api/v1/payments/initiate/route.ts`

用户选择套餐 → 创建 Stripe Checkout Session
```bash
npm install stripe
```

```env
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

### 7.2 提现功能
**新增**: `src/app/api/v1/withdrawals/route.ts`

用户申请提现 → 管理员审核 → Stripe 转账

### 7.3 收入统计
**新增**: `src/app/api/v1/earnings/summary/route.ts`

返回用户总收入、待结算、已提现金额

---

## 八、联系表单完善

当前已通，SMTP 配置已就绪。如需增强：
- 区分"普通咨询"和"企业入驻"
- 企业入驻表单单独: `/enterprise/contact`
- 提交后自动创建 `Lead` 记录到 Prisma

---

## 九、Seed 数据

当前 `/api/seed` 和 `/api/admin/celebrity-seed` 存在，用于填充测试数据。
需要确保这些种子数据能在 Sepolia 上铸造 NFT。

---

## 十、UI/UX 改进

### 10.1 缺失页面
- `/profile` - 用户资料编辑
- `/settings` - 账号设置
- `/notifications` - 通知中心
- `/earnings` - 收入明细

### 10.2 移动端适配
确保所有页面在手机上显示正常

### 10.3 加载状态
所有 API 请求添加 loading 状态，避免重复提交

---

## 环境变量清单 (Vercel)

```env
# Database
DATABASE_URL=  # Railway PostgreSQL

# Auth
AUTH_SECRET=
AUTH_URL=https://portraitpayai.com

# SMTP (已配置)
SMTP_HOST=smtp.exmail.qq.com
SMTP_PORT=465
SMTP_USER=contact@portraitpayai.com
SMTP_PASS=<授权码>
EMAIL_FROM=contact@portraitpayai.com
ADMIN_EMAIL=admin@portraitpayai.com

# Blockchain (待配置)
NEXT_PUBLIC_CONTRACT_ADDRESS=
SEPOLIA_RPC_URL=
PRIVATE_KEY=  # 后端 secret

# IPFS (待配置)
PINATA_API_KEY=
PINATA_SECRET_API_KEY=

# Stripe (待配置)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# KYC (待配置)
TENCENT_FACE_SECRET_ID=
TENCENT_FACE_SECRET_KEY=
```

---

## 提交规范

每次 commit 请遵循:
```
<type>: <简短描述>

<详细说明>

Closes #<issue>
```

type: feat | fix | chore | docs | refactor | test

所有秘密 (PRIVATE_KEY, STRIPE_SECRET_KEY 等) 只放在 Vercel/Dashboard 环境变量，绝不 commit。

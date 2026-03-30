-- PortraitPay AI — Initial Migration
-- Created: 2026-03-30
-- Generator: Prisma 5.22.0

-- CreateEnum types
CREATE TYPE "UserRole" AS ENUM ('USER', 'ARTIST', 'AGENCY', 'ENTERPRISE', 'CELEBRITY', 'ADMIN', 'VERIFIER');
CREATE TYPE "KYCStatus" AS ENUM ('NOT_STARTED', 'PENDING', 'APPROVED', 'REJECTED', 'EXPIRED');
CREATE TYPE "PortraitStatus" AS ENUM ('DRAFT', 'UNDER_REVIEW', 'ACTIVE', 'SUSPENDED', 'ARCHIVED');
CREATE TYPE "AuthorizationStatus" AS ENUM ('PENDING', 'ACTIVE', 'EXPIRED', 'REVOKED', 'REJECTED');
CREATE TYPE "TransactionType" AS ENUM ('LICENSE_PURCHASE', 'LICENSE_RENEWAL', 'ROYALTY_PAYOUT', 'KYC_REFUND', 'PLATFORM_FEE', 'WITHDRAWAL', 'SETTLEMENT', 'PLATFORM_COMMISSION');
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'DISPUTED');
CREATE TYPE "ReportStatus" AS ENUM ('PENDING_REVIEW', 'VALIDATED', 'REJECTED', 'SETTLED', 'LEGAL_ACTION');
CREATE TYPE "InfringementType" AS ENUM ('UNAUTHORIZED_USE', 'EXPIRED_LICENSE', 'SCOPE_VIOLATION', 'RESALE', 'DEEPFAKE');
CREATE TYPE "CelebrityAppStatus" AS ENUM ('PENDING_REVIEW', 'APPROVED', 'REJECTED');
CREATE TYPE "LicenseType" AS ENUM ('EXCLUSIVE', 'NON_EXCLUSIVE', 'SEMI_EXCLUSIVE', 'EDITORIAL', 'PERSONAL');
CREATE TYPE "AlertStatus" AS ENUM ('PENDING', 'CONFIRMED', 'FALSE_POSITIVE', 'EXPIRED');
CREATE TYPE "NoticeStatus" AS ENUM ('DRAFT', 'SENT', 'RECEIVED', 'ACKNOWLEDGED', 'COMPLIED', 'REJECTED', 'ESCALATED');
CREATE TYPE "NoticeType" AS ENUM ('TAKEDOWN', 'WARNING', 'LEGAL');
CREATE TYPE "EnterpriseStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED');
CREATE TYPE "EntAuthStatus" AS ENUM ('PENDING_PORTRAIT_OWNER', 'PENDING_PLATFORM_REVIEW', 'APPROVED', 'REJECTED', 'REVOKED', 'EXPIRED');
CREATE TYPE "WithdrawalStatus" AS ENUM ('PENDING', 'PROCESSING', 'APPROVED', 'REJECTED', 'COMPLETED', 'FAILED');
CREATE TYPE "SettlementStatus" AS ENUM ('PENDING', 'CALCULATING', 'COMPLETED', 'CANCELLED');
CREATE TYPE "AuditAction" AS ENUM ('WITHDRAWAL_APPROVE', 'WITHDRAWAL_REJECT', 'SETTLEMENT_GENERATE', 'SETTLEMENT_APPROVE', 'USER_BALANCE_ADJUST', 'TRANSACTION_FLAG');
CREATE TYPE "NotificationType" AS ENUM ('SYSTEM', 'AUTHORIZATION', 'EARNING', 'INFRINGEMENT', 'KYC', 'SETTLEMENT', 'WITHDRAWAL');
CREATE TYPE "UserAuditAction" AS ENUM ('LOGIN', 'LOGIN_FAILED', 'LOGOUT', 'OTP_SENT', 'OTP_VERIFIED', 'OTP_FAILED', 'PROFILE_UPDATE', 'PHONE_BIND', 'PHONE_UNBIND', 'WALLET_BIND', 'WALLET_UNBIND', 'KYC_SUBMITTED', 'KYC_APPROVED', 'KYC_REJECTED', 'KYC_EXPIRED', 'PORTRAIT_REGISTERED', 'PORTRAIT_UPDATED', 'PORTRAIT_SUSPENDED', 'PORTRAIT_DELETED', 'AUTH_REQUEST_SENT', 'AUTH_APPROVED', 'AUTH_REJECTED', 'AUTH_REVOKED', 'AUTH_CERTIFICATE_DOWNLOADED', 'EARNINGS_WITHDRAWN', 'EARNINGS_EXPORTED', 'SETTLEMENT_VIEWED', 'NOTIFICATION_SETTINGS_UPDATED', 'MONITOR_CONFIG_UPDATED', 'API_KEY_CREATED', 'API_KEY_DELETED', 'API_KEY_ROTATED');
CREATE TYPE "ApiKeyStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'EXPIRED', 'REVOKED');
CREATE TYPE "AIContentType" AS ENUM ('CHARACTER', 'ARTWORK', 'MUSIC', 'TEXT', 'VIDEO', 'MODEL_3D', 'OTHER');
CREATE TYPE "IPRegistrationStatus" AS ENUM ('DRAFT', 'CERTIFIED', 'ACTIVE', 'REVOKED', 'EXPIRED');
CREATE TYPE "CertificateType" AS ENUM ('OWNERSHIP', 'LICENSE', 'CREATION', 'DERIVATIVE');
CREATE TYPE "ContactType" AS ENUM ('GENERAL', 'ENTERPRISE');
CREATE TYPE "ContactStatus" AS ENUM ('NEW', 'READ', 'PROCESSING', 'REPLIED', 'RESOLVED', 'CLOSED');

-- User
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "phone" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "kycStatus" "KYCStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "kycProviderRef" TEXT,
    "kycVerifiedAt" TIMESTAMP(3),
    "kycExpiredAt" TIMESTAMP(3),
    "walletAddress" TEXT,
    "stripeCustomerId" TEXT,
    "displayName" TEXT,
    "bio" TEXT,
    "otpCode" TEXT,
    "otpExpires" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "name" TEXT,
    "image" TEXT,
    "emailVerified" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email" ASC);
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone" ASC);
CREATE UNIQUE INDEX "User_walletAddress_key" ON "User"("walletAddress" ASC);
CREATE INDEX "User_walletAddress_idx" ON "User"("walletAddress" ASC);
CREATE INDEX "User_kycStatus_idx" ON "User"("kycStatus" ASC);

-- Portrait
CREATE TABLE "Portrait" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'general',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "originalImageUrl" TEXT,
    "thumbnailUrl" TEXT,
    "imageHash" TEXT,
    "blockchainTxHash" TEXT,
    "blockchainNetwork" TEXT DEFAULT 'sepolia',
    "ipfsCid" TEXT,
    "certifiedAt" TIMESTAMP(3),
    "status" "PortraitStatus" NOT NULL DEFAULT 'DRAFT',
    "faceEmbedding" DOUBLE PRECISION[] NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Portrait_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Portrait_imageHash_key" ON "Portrait"("imageHash" ASC);
CREATE UNIQUE INDEX "Portrait_blockchainTxHash_key" ON "Portrait"("blockchainTxHash" ASC);
CREATE INDEX "Portrait_ownerId_idx" ON "Portrait"("ownerId" ASC);
CREATE INDEX "Portrait_status_idx" ON "Portrait"("status" ASC);
CREATE INDEX "Portrait_imageHash_idx" ON "Portrait"("imageHash" ASC);

-- Authorization
CREATE TABLE "Authorization" (
    "id" TEXT NOT NULL,
    "portraitId" TEXT NOT NULL,
    "granterId" TEXT NOT NULL,
    "granteeId" TEXT NOT NULL,
    "licenseType" "LicenseType" NOT NULL,
    "usageScope" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "exclusivity" BOOLEAN NOT NULL DEFAULT false,
    "territorialScope" TEXT NOT NULL DEFAULT 'global',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "licenseFee" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "terms" TEXT NOT NULL,
    "contractHash" TEXT,
    "contractIpfsCid" TEXT,
    "status" "AuthorizationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Authorization_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Authorization_contractHash_key" ON "Authorization"("contractHash" ASC);
CREATE INDEX "Authorization_portraitId_idx" ON "Authorization"("portraitId" ASC);
CREATE INDEX "Authorization_granteeId_idx" ON "Authorization"("granteeId" ASC);
CREATE INDEX "Authorization_status_idx" ON "Authorization"("status" ASC);

-- Transaction
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "authorizationId" TEXT,
    "stripePaymentIntentId" TEXT,
    "stripeInvoiceId" TEXT,
    "royaltyRecipient" TEXT,
    "royaltyPaid" BOOLEAN NOT NULL DEFAULT false,
    "royaltyTxHash" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Transaction_authorizationId_key" ON "Transaction"("authorizationId" ASC);
CREATE UNIQUE INDEX "Transaction_stripePaymentIntentId_key" ON "Transaction"("stripePaymentIntentId" ASC);
CREATE INDEX "Transaction_userId_idx" ON "Transaction"("userId" ASC);
CREATE INDEX "Transaction_status_idx" ON "Transaction"("status" ASC);
CREATE INDEX "Transaction_stripePaymentIntentId_idx" ON "Transaction"("stripePaymentIntentId" ASC);

-- InfringementReport
CREATE TABLE "InfringementReport" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "defendantId" TEXT,
    "portraitId" TEXT NOT NULL,
    "type" "InfringementType" NOT NULL,
    "evidenceUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "evidenceHash" TEXT,
    "originalImageUrl" TEXT,
    "description" TEXT NOT NULL,
    "detectedUrl" TEXT,
    "detectedAt" TIMESTAMP(3),
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "verifierId" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "resolution" TEXT,
    "reportHash" TEXT,
    "reportIpfsCid" TEXT,
    "source" TEXT NOT NULL DEFAULT 'MANUAL',
    "similarityScore" DOUBLE PRECISION,
    "alertId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InfringementReport_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "InfringementReport_reportHash_key" ON "InfringementReport"("reportHash" ASC);
CREATE UNIQUE INDEX "InfringementReport_alertId_key" ON "InfringementReport"("alertId" ASC);
CREATE INDEX "InfringementReport_portraitId_idx" ON "InfringementReport"("portraitId" ASC);
CREATE INDEX "InfringementReport_reporterId_idx" ON "InfringementReport"("reporterId" ASC);
CREATE INDEX "InfringementReport_status_idx" ON "InfringementReport"("status" ASC);
CREATE INDEX "InfringementReport_source_idx" ON "InfringementReport"("source" ASC);

-- InfringementAlert
CREATE TABLE "InfringementAlert" (
    "id" TEXT NOT NULL,
    "portraitId" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "similarityScore" DOUBLE PRECISION NOT NULL,
    "matchedEmbedding" DOUBLE PRECISION[] NOT NULL,
    "screenshotUrl" TEXT,
    "screenshotHash" TEXT,
    "pageTitle" TEXT,
    "pageDescription" TEXT,
    "authorName" TEXT,
    "publishedAt" TIMESTAMP(3),
    "status" "AlertStatus" NOT NULL DEFAULT 'PENDING',
    "ownerId" TEXT,
    "ownerConfirmedAt" TIMESTAMP(3),
    "ownerDecision" TEXT,
    "reportId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InfringementAlert_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "InfringementAlert_reportId_key" ON "InfringementAlert"("reportId" ASC);
CREATE INDEX "InfringementAlert_portraitId_idx" ON "InfringementAlert"("portraitId" ASC);
CREATE INDEX "InfringementAlert_status_idx" ON "InfringementAlert"("status" ASC);
CREATE INDEX "InfringementAlert_sourceName_idx" ON "InfringementAlert"("sourceName" ASC);

-- InfringementMonitorConfig
CREATE TABLE "InfringementMonitorConfig" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "similarityThreshold" DOUBLE PRECISION NOT NULL DEFAULT 0.85,
    "enabledPlatforms" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "excludedPlatforms" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notifyEmail" BOOLEAN NOT NULL DEFAULT true,
    "notifySms" BOOLEAN NOT NULL DEFAULT false,
    "notifyWechat" BOOLEAN NOT NULL DEFAULT false,
    "quietHoursStart" TEXT,
    "quietHoursEnd" TEXT,
    "highPriorityMuteExempt" BOOLEAN NOT NULL DEFAULT true,
    "scanIntervalHours" INT NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InfringementMonitorConfig_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "InfringementMonitorConfig_userId_key" ON "InfringementMonitorConfig"("userId" ASC);

-- InfringementNotice
CREATE TABLE "InfringementNotice" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "type" "NoticeType" NOT NULL DEFAULT 'TAKEDOWN',
    "recipientName" TEXT NOT NULL,
    "recipientEmail" TEXT,
    "recipientPhone" TEXT,
    "recipientAddress" TEXT,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "renderedHtml" TEXT,
    "attachmentUrl" TEXT,
    "channel" TEXT NOT NULL DEFAULT 'EMAIL',
    "status" "NoticeStatus" NOT NULL DEFAULT 'DRAFT',
    "sentAt" TIMESTAMP(3),
    "notarizationId" TEXT,
    "notarizationCert" TEXT,
    "notarizedAt" TIMESTAMP(3),
    "noticeHash" TEXT,
    "noticeIpfsCid" TEXT,
    "responseReceivedAt" TIMESTAMP(3),
    "responseContent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InfringementNotice_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "InfringementNotice_noticeHash_key" ON "InfringementNotice"("noticeHash" ASC);
CREATE INDEX "InfringementNotice_reportId_idx" ON "InfringementNotice"("reportId" ASC);
CREATE INDEX "InfringementNotice_status_idx" ON "InfringementNotice"("status" ASC);

-- EvidencePackage
CREATE TABLE "EvidencePackage" (
    "id" TEXT NOT NULL,
    "reportId" TEXT,
    "alertId" TEXT,
    "evidenceType" TEXT NOT NULL,
    "evidenceUrl" TEXT NOT NULL,
    "evidenceKey" TEXT,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "capturedBy" TEXT NOT NULL DEFAULT 'SYSTEM',
    "contentHash" TEXT NOT NULL,
    "pageUrl" TEXT,
    "pageTitle" TEXT,
    "pageSnapshotUrl" TEXT,
    "ipfsCid" TEXT,
    "notarized" BOOLEAN NOT NULL DEFAULT false,
    "notarizationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EvidencePackage_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "EvidencePackage_reportId_key" ON "EvidencePackage"("reportId" ASC);
CREATE UNIQUE INDEX "EvidencePackage_alertId_key" ON "EvidencePackage"("alertId" ASC);
CREATE UNIQUE INDEX "EvidencePackage_contentHash_key" ON "EvidencePackage"("contentHash" ASC);

-- KYCLog
CREATE TABLE "KYCLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "externalRef" TEXT,
    "action" TEXT NOT NULL,
    "result" JSONB,
    "level" INT,
    "idCardNumber" TEXT,
    "idCardName" TEXT,
    "idCardAddress" TEXT,
    "idCardExpire" TIMESTAMP(3),
    "faceMatchScore" DOUBLE PRECISION,
    "ocrRawData" JSONB,
    "faceRawData" JSONB,
    "rejectReason" TEXT,
    "verifierId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KYCLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "KYCLog_userId_idx" ON "KYCLog"("userId" ASC);

-- CelebrityApplication
CREATE TABLE "CelebrityApplication" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stageName" TEXT NOT NULL,
    "realName" TEXT NOT NULL,
    "idCardNumber" TEXT NOT NULL,
    "idCardFrontUrl" TEXT NOT NULL,
    "idCardBackUrl" TEXT NOT NULL,
    "authLetterUrl" TEXT NOT NULL,
    "authLetterHash" TEXT,
    "notaryCertUrl" TEXT,
    "agencyName" TEXT,
    "agencyContact" TEXT,
    "agencyPhone" TEXT,
    "status" "CelebrityAppStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "reviewerId" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CelebrityApplication_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "CelebrityApplication_userId_idx" ON "CelebrityApplication"("userId" ASC);
CREATE INDEX "CelebrityApplication_status_idx" ON "CelebrityApplication"("status" ASC);

-- License
CREATE TABLE "License" (
    "id" TEXT NOT NULL,
    "authorizationId" TEXT NOT NULL,
    "portraitId" TEXT NOT NULL,
    "licenseeId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "License_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "License_portraitId_idx" ON "License"("portraitId" ASC);
CREATE INDEX "License_licenseeId_idx" ON "License"("licenseeId" ASC);

-- Enterprise
CREATE TABLE "Enterprise" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "unifiedCreditCode" TEXT NOT NULL,
    "legalPersonName" TEXT NOT NULL,
    "legalPersonIdCard" TEXT NOT NULL,
    "registeredCapital" TEXT,
    "establishedDate" TIMESTAMP(3),
    "businessTerm" TEXT,
    "businessScope" TEXT,
    "licenseImageUrl" TEXT NOT NULL,
    "legalPersonIdCardFrontUrl" TEXT,
    "legalPersonIdCardBackUrl" TEXT,
    "contactName" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "status" "EnterpriseStatus" NOT NULL DEFAULT 'PENDING',
    "reviewerId" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "isAgency" BOOLEAN NOT NULL DEFAULT false,
    "agencyLicenseUrl" TEXT,
    "validUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Enterprise_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Enterprise_userId_key" ON "Enterprise"("userId" ASC);
CREATE UNIQUE INDEX "Enterprise_unifiedCreditCode_key" ON "Enterprise"("unifiedCreditCode" ASC);
CREATE INDEX "Enterprise_userId_idx" ON "Enterprise"("userId" ASC);
CREATE INDEX "Enterprise_status_idx" ON "Enterprise"("status" ASC);

-- AgencyArtist
CREATE TABLE "AgencyArtist" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "proxyAgreementUrl" TEXT,
    "proxyStartDate" TIMESTAMP(3),
    "proxyEndDate" TIMESTAMP(3),
    "proxyStatus" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgencyArtist_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "AgencyArtist_agencyId_artistId_key" ON "AgencyArtist"("agencyId" ASC, "artistId" ASC);
CREATE INDEX "AgencyArtist_agencyId_idx" ON "AgencyArtist"("agencyId" ASC);
CREATE INDEX "AgencyArtist_artistId_idx" ON "AgencyArtist"("artistId" ASC);

-- EntAuthApplication
CREATE TABLE "EntAuthApplication" (
    "id" TEXT NOT NULL,
    "enterpriseId" TEXT NOT NULL,
    "portraitId" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "usageScope" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "exclusivity" BOOLEAN NOT NULL DEFAULT false,
    "territorialScope" TEXT NOT NULL DEFAULT 'global',
    "usageDuration" INT NOT NULL,
    "proposedFee" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CNY',
    "status" "EntAuthStatus" NOT NULL DEFAULT 'PENDING_PORTRAIT_OWNER',
    "portraitOwnerConfirmedAt" TIMESTAMP(3),
    "portraitOwnerConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "platformReviewerId" TEXT,
    "platformReviewedAt" TIMESTAMP(3),
    "platformRejectionReason" TEXT,
    "authorizationId" TEXT,
    "contractHash" TEXT,
    "contractIpfsCid" TEXT,
    "certificateNo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EntAuthApplication_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "EntAuthApplication_authorizationId_key" ON "EntAuthApplication"("authorizationId" ASC);
CREATE UNIQUE INDEX "EntAuthApplication_contractHash_key" ON "EntAuthApplication"("contractHash" ASC);
CREATE UNIQUE INDEX "EntAuthApplication_certificateNo_key" ON "EntAuthApplication"("certificateNo" ASC);
CREATE INDEX "EntAuthApplication_enterpriseId_idx" ON "EntAuthApplication"("enterpriseId" ASC);
CREATE INDEX "EntAuthApplication_portraitId_idx" ON "EntAuthApplication"("portraitId" ASC);
CREATE INDEX "EntAuthApplication_status_idx" ON "EntAuthApplication"("status" ASC);

-- AuthorizationCertificate
CREATE TABLE "AuthorizationCertificate" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "authorizationId" TEXT NOT NULL,
    "certificateNo" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "pdfUrl" TEXT,
    "blockchainTxHash" TEXT,
    "blockchainNetwork" TEXT,
    "portraitOwnerSigned" BOOLEAN NOT NULL DEFAULT false,
    "enterpriseSigned" BOOLEAN NOT NULL DEFAULT false,
    "platformSigned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthorizationCertificate_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "AuthorizationCertificate_applicationId_key" ON "AuthorizationCertificate"("applicationId" ASC);
CREATE UNIQUE INDEX "AuthorizationCertificate_authorizationId_key" ON "AuthorizationCertificate"("authorizationId" ASC);
CREATE UNIQUE INDEX "AuthorizationCertificate_certificateNo_key" ON "AuthorizationCertificate"("certificateNo" ASC);
CREATE INDEX "AuthorizationCertificate_certificateNo_idx" ON "AuthorizationCertificate"("certificateNo" ASC);

-- Withdrawal
CREATE TABLE "Withdrawal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CNY',
    "actualAmount" DECIMAL(12,2),
    "exchangeRate" DECIMAL(12,4),
    "bankName" TEXT,
    "bankAccount" TEXT,
    "bankAccountLast4" TEXT,
    "accountHolder" TEXT,
    "status" "WithdrawalStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "processedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "stripeTransferId" TEXT,
    "stripePayoutId" TEXT,
    "settlementId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Withdrawal_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Withdrawal_userId_idx" ON "Withdrawal"("userId" ASC);
CREATE INDEX "Withdrawal_status_idx" ON "Withdrawal"("status" ASC);
CREATE INDEX "Withdrawal_settlementId_idx" ON "Withdrawal"("settlementId" ASC);

-- Settlement
CREATE TABLE "Settlement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "grossRevenue" DECIMAL(12,2) NOT NULL,
    "platformFee" DECIMAL(12,2) NOT NULL,
    "netRevenue" DECIMAL(12,2) NOT NULL,
    "withdrawnAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "pendingAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "availableAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'CNY',
    "status" "SettlementStatus" NOT NULL DEFAULT 'PENDING',
    "breakdown" JSONB,
    "settledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settlement_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Settlement_userId_idx" ON "Settlement"("userId" ASC);
CREATE INDEX "Settlement_status_idx" ON "Settlement"("status" ASC);
CREATE INDEX "Settlement_periodStart_periodEnd_idx" ON "Settlement"("periodStart" ASC, "periodEnd" ASC);

-- AuditLog
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AuditLog_adminId_idx" ON "AuditLog"("adminId" ASC);
CREATE INDEX "AuditLog_targetType_targetId_idx" ON "AuditLog"("targetType" ASC, "targetId" ASC);

-- Notification
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'SYSTEM',
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "data" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "channel" TEXT NOT NULL DEFAULT 'IN_APP',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId" ASC, "isRead" ASC);
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId" ASC, "createdAt" DESC);

-- UserAuditLog
CREATE TABLE "UserAuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" "UserAuditAction" NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "targetType" TEXT,
    "targetId" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "detail" TEXT,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAuditLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "UserAuditLog_userId_createdAt_idx" ON "UserAuditLog"("userId" ASC, "createdAt" DESC);
CREATE INDEX "UserAuditLog_userId_action_idx" ON "UserAuditLog"("userId" ASC, "action" ASC);
CREATE INDEX "UserAuditLog_action_createdAt_idx" ON "UserAuditLog"("action" ASC, "createdAt" DESC);

-- ApiKey
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "keyPrefix" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "ApiKeyStatus" NOT NULL DEFAULT 'ACTIVE',
    "scopes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "rateLimitPerMinute" INT NOT NULL DEFAULT 60,
    "lastUsedAt" TIMESTAMP(3),
    "requestCount" BIGINT NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ApiKey_keyHash_key" ON "ApiKey"("keyHash" ASC);
CREATE INDEX "ApiKey_userId_idx" ON "ApiKey"("userId" ASC);
CREATE INDEX "ApiKey_keyHash_idx" ON "ApiKey"("keyHash" ASC);

-- RateLimitRecord
CREATE TABLE "RateLimitRecord" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "requestCount" INT NOT NULL DEFAULT 1,

    CONSTRAINT "RateLimitRecord_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "RateLimitRecord_identifier_windowStart_key" ON "RateLimitRecord"("identifier" ASC, "windowStart" ASC);
CREATE INDEX "RateLimitRecord_identifier_windowStart_idx" ON "RateLimitRecord"("identifier" ASC, "windowStart" ASC);

-- VerificationToken (NextAuth)
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("identifier", "token")
);
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token" ASC);

-- Account (NextAuth)
CREATE TABLE "Account" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INT,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider" ASC, "providerAccountId" ASC);

-- Session (NextAuth)
CREATE TABLE "Session" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken" ASC);

-- AIContent
CREATE TABLE "AIContent" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "contentType" "AIContentType" NOT NULL DEFAULT 'CHARACTER',
    "generationTool" TEXT NOT NULL,
    "generationPrompt" TEXT,
    "generationDate" TIMESTAMP(3),
    "modelVersion" TEXT,
    "cfgScale" DOUBLE PRECISION,
    "seed" TEXT,
    "sampler" TEXT,
    "originalFileUrl" TEXT,
    "thumbnailUrl" TEXT,
    "fileSize" INT,
    "mimeType" TEXT,
    "contentHash" TEXT,
    "ipfsCid" TEXT,
    "ipfsUrl" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "copyrightNotice" TEXT,
    "licenseScope" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isPublicDomain" BOOLEAN NOT NULL DEFAULT false,
    "thirdPartyRights" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "AIContent_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "AIContent_contentHash_key" ON "AIContent"("contentHash" ASC);
CREATE INDEX "AIContent_ownerId_idx" ON "AIContent"("ownerId" ASC);
CREATE INDEX "AIContent_contentType_idx" ON "AIContent"("contentType" ASC);
CREATE INDEX "AIContent_contentHash_idx" ON "AIContent"("contentHash" ASC);

---- IPRegistration
CREATE TABLE "IPRegistration" (
    "id" TEXT NOT NULL,
    "aiContentId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "certificateNo" TEXT NOT NULL,
    "certificateType" "CertificateType" NOT NULL DEFAULT 'OWNERSHIP',
    "rightsDeclared" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "territorialScope" TEXT NOT NULL DEFAULT 'global',
    "exclusivity" BOOLEAN NOT NULL DEFAULT false,
    "usageDuration" INT,
    "blockchainNetwork" TEXT NOT NULL DEFAULT 'sepolia',
    "blockchainTxHash" TEXT,
    "blockchainBlockNum" INT,
    "contractAddress" TEXT,
    "certificateIpfsCid" TEXT,
    "metadataIpfsCid" TEXT,
    "certifiedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "status" "IPRegistrationStatus" NOT NULL DEFAULT 'DRAFT',
    "originalityDeclaration" TEXT,
    "generationToolConfirm" BOOLEAN NOT NULL DEFAULT false,
    "thirdPartyClearance" BOOLEAN NOT NULL DEFAULT false,
    "thirdPartyRefs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "version" INT NOT NULL DEFAULT 1,
    "previousRegId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "IPRegistration_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "IPRegistration_aiContentId_key" ON "IPRegistration"("aiContentId" ASC);
CREATE UNIQUE INDEX "IPRegistration_certificateNo_key" ON "IPRegistration"("certificateNo" ASC);
CREATE UNIQUE INDEX "IPRegistration_blockchainTxHash_key" ON "IPRegistration"("blockchainTxHash" ASC);
CREATE INDEX "IPRegistration_aiContentId_idx" ON "IPRegistration"("aiContentId" ASC);
CREATE INDEX "IPRegistration_ownerId_idx" ON "IPRegistration"("ownerId" ASC);
CREATE INDEX "IPRegistration_status_idx" ON "IPRegistration"("status" ASC);
CREATE INDEX "IPRegistration_certificateNo_idx" ON "IPRegistration"("certificateNo" ASC);

-- ContactSubmission
CREATE TABLE "ContactSubmission" (
    "id" TEXT NOT NULL,
    "type" "ContactType" NOT NULL DEFAULT 'GENERAL',
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "company" TEXT,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "enterpriseName" TEXT,
    "intendedUse" TEXT,
    "expectedScale" TEXT,
    "contactPhone" TEXT,
    "status" "ContactStatus" NOT NULL DEFAULT 'NEW',
    "adminNotes" TEXT,
    "handledBy" TEXT,
    "handledAt" TIMESTAMP(3),
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "emailSentAt" TIMESTAMP(3),
    "emailError" TEXT,
    "repliedAt" TIMESTAMP(3),
    "repliedMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactSubmission_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ContactSubmission_status_idx" ON "ContactSubmission"("status" ASC);
CREATE INDEX "ContactSubmission_type_idx" ON "ContactSubmission"("type" ASC);
CREATE INDEX "ContactSubmission_createdAt_idx" ON "ContactSubmission"("createdAt" DESC);

-- Foreign Keys
ALTER TABLE "Portrait" ADD CONSTRAINT "Portrait_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Authorization" ADD CONSTRAINT "Authorization_portraitId_fkey" FOREIGN KEY ("portraitId") REFERENCES "Portrait"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Authorization" ADD CONSTRAINT "Authorization_granterId_fkey" FOREIGN KEY ("granterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Authorization" ADD CONSTRAINT "Authorization_granteeId_fkey" FOREIGN KEY ("granteeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_authorizationId_fkey" FOREIGN KEY ("authorizationId") REFERENCES "Authorization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "InfringementReport" ADD CONSTRAINT "InfringementReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InfringementReport" ADD CONSTRAINT "InfringementReport_defendantId_fkey" FOREIGN KEY ("defendantId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "InfringementReport" ADD CONSTRAINT "InfringementReport_portraitId_fkey" FOREIGN KEY ("portraitId") REFERENCES "Portrait"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InfringementAlert" ADD CONSTRAINT "InfringementAlert_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "InfringementReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "InfringementMonitorConfig" ADD CONSTRAINT "InfringementMonitorConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InfringementNotice" ADD CONSTRAINT "InfringementNotice_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "InfringementReport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "EvidencePackage" ADD CONSTRAINT "EvidencePackage_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "InfringementReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EvidencePackage" ADD CONSTRAINT "EvidencePackage_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "InfringementAlert"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "KYCLog" ADD CONSTRAINT "KYCLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CelebrityApplication" ADD CONSTRAINT "CelebrityApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "License" ADD CONSTRAINT "License_authorizationId_fkey" FOREIGN KEY ("authorizationId") REFERENCES "Authorization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "License" ADD CONSTRAINT "License_portraitId_fkey" FOREIGN KEY ("portraitId") REFERENCES "Portrait"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "License" ADD CONSTRAINT "License_licenseeId_fkey" FOREIGN KEY ("licenseeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Enterprise" ADD CONSTRAINT "Enterprise_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AgencyArtist" ADD CONSTRAINT "AgencyArtist_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Enterprise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AgencyArtist" ADD CONSTRAINT "AgencyArtist_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EntAuthApplication" ADD CONSTRAINT "EntAuthApplication_enterpriseId_fkey" FOREIGN KEY ("enterpriseId") REFERENCES "Enterprise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EntAuthApplication" ADD CONSTRAINT "EntAuthApplication_portraitId_fkey" FOREIGN KEY ("portraitId") REFERENCES "Portrait"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EntAuthApplication" ADD CONSTRAINT "EntAuthApplication_authorizationId_fkey" FOREIGN KEY ("authorizationId") REFERENCES "Authorization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AuthorizationCertificate" ADD CONSTRAINT "AuthorizationCertificate_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "EntAuthApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuthorizationCertificate" ADD CONSTRAINT "AuthorizationCertificate_authorizationId_fkey" FOREIGN KEY ("authorizationId") REFERENCES "Authorization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Withdrawal" ADD CONSTRAINT "Withdrawal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Withdrawal" ADD CONSTRAINT "Withdrawal_settlementId_fkey" FOREIGN KEY ("settlementId") REFERENCES "Settlement"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Settlement" ADD CONSTRAINT "Settlement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserAuditLog" ADD CONSTRAINT "UserAuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AIContent" ADD CONSTRAINT "AIContent_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "IPRegistration" ADD CONSTRAINT "IPRegistration_aiContentId_fkey" FOREIGN KEY ("aiContentId") REFERENCES "AIContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "IPRegistration" ADD CONSTRAINT "IPRegistration_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

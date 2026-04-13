/**
 * PortraitPay — Demo Account Seed Script
 *
 * Creates a demo user account with test portrait data and earnings
 * for testing authenticated pages (dashboard, portraits, earnings, etc.)
 *
 * Usage:
 *   npm run seed        # Run the seed script
 *
 * Demo Account Credentials:
 *   Email:    demo@portraitpayai.com
 *   Password: Demo123456
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  log: ["query", "error", "warn"],
});

const DEMO_EMAIL = "demo@portraitpayai.com";
const DEMO_PASSWORD = "Demo123456";
const DEMO_USER_ID = "demo-user-seed-id";

async function main() {
  console.log("🌱 Starting demo account seed...\n");

  // Check if demo user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: DEMO_EMAIL },
  });

  if (existingUser) {
    console.log(`⚠️  Demo user already exists (${DEMO_EMAIL})`);
    console.log("   Deleting existing demo user and recreating...\n");
    await cleanupDemoUser(existingUser.id);
  }

  // Create demo user with hashed password
  console.log("👤 Creating demo user...");
  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 12);

  const demoUser = await prisma.user.create({
    data: {
      id: DEMO_USER_ID,
      email: DEMO_EMAIL,
      passwordHash: hashedPassword,
      name: "Demo User",
      role: "USER",
      kycStatus: "APPROVED",
      kycLevel: 2,
      kycVerifiedAt: new Date(),
      displayName: "Demo User",
      bio: "This is a demo account for testing purposes.",
      walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
      portraitSettings: {
        create: {
          allowLicensing: true,
          allowedScopes: ["FILM", "ANIMATION", "ADVERTISING", "GAMING", "SOCIAL_MEDIA"],
          prohibitedContent: ["ADULT", "POLITICAL", "VIOLENCE"],
          defaultLicenseFee: 100.00,
          defaultTerritorialScope: "global",
        },
      },
    },
  });
  console.log(`   ✓ Created user: ${demoUser.email} (ID: ${demoUser.id})`);

  // Create test portrait data
  console.log("\n🖼️  Creating test portrait data...");

  const portraitData = [
    {
      title: "Portrait of Alice",
      description: "A beautiful portrait of Alice in natural lighting",
      category: "portrait",
      tags: ["portrait", "natural", "lighting"],
      status: "ACTIVE",
      isPublic: true,
      faceEmbedding: Array(512).fill(0).map(() => Math.random() * 2 - 1),
    },
    {
      title: "Urban Street Portrait",
      description: "A modern portrait taken in an urban environment",
      category: "street",
      tags: ["urban", "modern", "street"],
      status: "ACTIVE",
      isPublic: true,
      faceEmbedding: Array(512).fill(0).map(() => Math.random() * 2 - 1),
    },
    {
      title: "Golden Hour Portrait",
      description: "Portrait shot during golden hour with warm tones",
      category: "portrait",
      tags: ["golden", "hour", "warm"],
      status: "ACTIVE",
      isPublic: false,
      faceEmbedding: Array(512).fill(0).map(() => Math.random() * 2 - 1),
    },
    {
      title: "Studio Headshot",
      description: "Professional studio headshot for business use",
      category: "headshot",
      tags: ["studio", "professional", "business"],
      status: "UNDER_REVIEW",
      isPublic: false,
      faceEmbedding: Array(512).fill(0).map(() => Math.random() * 2 - 1),
    },
    {
      title: "Candid Moments",
      description: "A candid portrait capturing natural expressions",
      category: "candid",
      tags: ["candid", "natural", "expressions"],
      status: "DRAFT",
      isPublic: false,
      faceEmbedding: Array(512).fill(0).map(() => Math.random() * 2 - 1),
    },
  ];

  const createdPortraits = [];
  for (const portrait of portraitData) {
    const created = await prisma.portrait.create({
      data: {
        ownerId: demoUser.id,
        ...portrait,
      },
    });
    createdPortraits.push(created);
    console.log(`   ✓ Created portrait: "${created.title}" (Status: ${created.status})`);
  }

  // Create test transactions (earnings)
  console.log("\n💰 Creating test earnings/transactions...");

  const transactionData = [
    {
      type: "LICENSE_PURCHASE",
      status: "COMPLETED",
      amount: 150.00,
      currency: "USD",
      metadata: { licenseType: "NON_EXCLUSIVE", usageScope: "ADVERTISING" },
    },
    {
      type: "LICENSE_PURCHASE",
      status: "COMPLETED",
      amount: 500.00,
      currency: "USD",
      metadata: { licenseType: "EXCLUSIVE", usageScope: "FILM" },
    },
    {
      type: "LICENSE_PURCHASE",
      status: "COMPLETED",
      amount: 75.00,
      currency: "USD",
      metadata: { licenseType: "EDITORIAL", usageScope: "SOCIAL_MEDIA" },
    },
    {
      type: "ROYALTY_PAYOUT",
      status: "COMPLETED",
      amount: 250.00,
      currency: "USD",
      metadata: { quarter: "Q1 2026" },
    },
    {
      type: "SETTLEMENT",
      status: "COMPLETED",
      amount: 1000.00,
      currency: "CNY",
      metadata: { period: "January 2026" },
    },
    {
      type: "LICENSE_PURCHASE",
      status: "PENDING",
      amount: 300.00,
      currency: "USD",
      metadata: { licenseType: "NON_EXCLUSIVE", usageScope: "GAMING" },
    },
  ];

  for (const tx of transactionData) {
    const created = await prisma.transaction.create({
      data: {
        userId: demoUser.id,
        ...tx,
      },
    });
    console.log(`   ✓ Created transaction: ${tx.type} - ${tx.amount} ${tx.currency} (${tx.status})`);
  }

  // Create a settlement record
  const settlement = await prisma.settlement.create({
    data: {
      userId: demoUser.id,
      periodStart: new Date("2026-01-01"),
      periodEnd: new Date("2026-03-31"),
      grossRevenue: 1975.00,
      platformFee: 197.50,
      netRevenue: 1777.50,
      withdrawnAmount: 500.00,
      pendingAmount: 277.50,
      availableAmount: 1000.00,
      currency: "USD",
      status: "COMPLETED",
      settledAt: new Date("2026-04-01"),
      breakdown: {
        licenseSales: 5,
        royaltyPayouts: 1,
        platformCommission: 0.10,
      },
    },
  });
  console.log(`   ✓ Created settlement: ${settlement.netRevenue} USD for Q1 2026`);

  // Create withdrawal history
  console.log("\n💸 Creating withdrawal history...");
  const withdrawalData = [
    {
      amount: 500.00,
      currency: "USD",
      actualAmount: 500.00,
      status: "COMPLETED",
      bankName: "Demo Bank",
      bankAccount: "****1234",
      bankAccountLast4: "1234",
      accountHolder: "Demo User",
      completedAt: new Date("2026-03-15"),
    },
    {
      amount: 200.00,
      currency: "USD",
      actualAmount: 200.00,
      status: "PROCESSING",
      bankName: "Demo Bank",
      bankAccount: "****5678",
      bankAccountLast4: "5678",
      accountHolder: "Demo User",
    },
  ];

  for (const wd of withdrawalData) {
    const created = await prisma.withdrawal.create({
      data: {
        userId: demoUser.id,
        ...wd,
      },
    });
    console.log(`   ✓ Created withdrawal: ${wd.amount} ${wd.currency} (${wd.status})`);
  }

  // Create some infringement monitor config
  console.log("\n🔍 Setting up infringement monitoring...");
  await prisma.infringementMonitorConfig.create({
    data: {
      userId: demoUser.id,
      enabled: true,
      similarityThreshold: 0.85,
      enabledPlatforms: ["twitter", "instagram", "tiktok", "facebook"],
      excludedPlatforms: [],
      notifyEmail: true,
      notifySms: false,
      notifyWechat: false,
      scanIntervalHours: 1,
      highPriorityMuteExempt: true,
    },
  });
  console.log("   ✓ Infringement monitoring configured");

  // Create KYC logs
  console.log("\n📋 Creating KYC history...");
  await prisma.kYCLog.create({
    data: {
      userId: demoUser.id,
      provider: "sumsub",
      externalRef: "demo-kyc-ref-001",
      action: "KYC_APPROVED",
      result: { approved: true, level: 2 },
      level: 2,
      idCardNumber: "**************1234",
      idCardName: "DEMO USER",
      idCardExpire: new Date("2030-12-31"),
      faceMatchScore: 0.95,
      verifiedAt: new Date(),
    },
  });
  console.log("   ✓ KYC log created");

  console.log("\n" + "=".repeat(60));
  console.log("🎉 Demo account seed completed successfully!");
  console.log("=".repeat(60));
  console.log("\n📧 Demo Account Credentials:");
  console.log(`   Email:    ${DEMO_EMAIL}`);
  console.log(`   Password: ${DEMO_PASSWORD}`);
  console.log("\n📊 Test Data Created:");
  console.log(`   • ${createdPortraits.length} portraits (various statuses)`);
  console.log(`   • ${transactionData.length} transactions`);
  console.log(`   • ${withdrawalData.length} withdrawals`);
  console.log(`   • 1 settlement record`);
  console.log(`   • KYC approved at level 2`);
  console.log(`   • Infringement monitoring enabled`);
  console.log("\n🔗 Test URLs:");
  console.log("   /dashboard, /portraits, /portraits/upload");
  console.log("   /earnings, /withdraw, /kyc");
  console.log("   /report, /infringements");
  console.log("\n" + "=".repeat(60));
}

async function cleanupDemoUser(userId: string) {
  // Delete in correct order due to foreign key constraints
  await prisma.infringementMonitorConfig.deleteMany({ where: { userId } });
  await prisma.transaction.deleteMany({ where: { userId } });
  await prisma.portrait.deleteMany({ where: { ownerId: userId } });
  await prisma.withdrawal.deleteMany({ where: { userId } });
  await prisma.settlement.deleteMany({ where: { userId } });
  await prisma.kYCLog.deleteMany({ where: { userId } });
  await prisma.notification.deleteMany({ where: { userId } });
  await prisma.userAuditLog.deleteMany({ where: { userId } });
  await prisma.portraitSettings.deleteMany({ where: { userId } });
  await prisma.user.delete({ where: { id: userId } });
}

main()
  .catch((e) => {
    console.error("❌ Seed failed with error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

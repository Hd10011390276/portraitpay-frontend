/**
 * AI Platform API Key Utilities for PortraitPay
 *
 * Provides functions for:
 * - Generating AI platform API keys with pp_live_ prefix
 * - Hashing API keys (SHA-256) for secure storage
 * - Verifying API keys against stored hashes
 * - Rate limiting based on API key configuration
 */

import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

// API Key format: pp_live_ + 32 bytes base64url encoded
const API_KEY_PREFIX_LIVE = "pp_live_";
const API_KEY_PREFIX_TEST = "pp_test_";
const API_KEY_LENGTH = 32; // 32 bytes of random data

/**
 * Generate a random AI platform API key
 */
export function generateAiPlatformApiKey(testMode = false): string {
  const prefix = testMode ? API_KEY_PREFIX_TEST : API_KEY_PREFIX_LIVE;
  const randomPart = randomBytes(API_KEY_LENGTH).toString("base64url");
  return `${prefix}${randomPart}`;
}

/**
 * Hash an API key using SHA-256
 */
export function hashAiPlatformApiKey(apiKey: string): string {
  return createHash("sha256").update(apiKey).digest("hex");
}

/**
 * Extract the display prefix from an API key (last 6 chars after prefix)
 */
export function getAiPlatformKeyDisplay(apiKey: string): string {
  if (apiKey.startsWith(API_KEY_PREFIX_LIVE)) {
    return `${API_KEY_PREFIX_LIVE}...${apiKey.slice(-6)}`;
  }
  if (apiKey.startsWith(API_KEY_PREFIX_TEST)) {
    return `${API_KEY_PREFIX_TEST}...${apiKey.slice(-6)}`;
  }
  return "...unknown";
}

/**
 * Extract just the prefix for storage
 */
export function getAiPlatformKeyPrefix(apiKey: string): string {
  if (apiKey.startsWith(API_KEY_PREFIX_LIVE)) return API_KEY_PREFIX_LIVE;
  if (apiKey.startsWith(API_KEY_PREFIX_TEST)) return API_KEY_PREFIX_TEST;
  return API_KEY_PREFIX_LIVE;
}

/**
 * Validate API key format
 */
export function isValidAiPlatformApiKeyFormat(apiKey: string): boolean {
  if (!apiKey) return false;
  const isLive = apiKey.startsWith(API_KEY_PREFIX_LIVE);
  const isTest = apiKey.startsWith(API_KEY_PREFIX_TEST);
  if (!isLive && !isTest) return false;
  const randomPart = isLive
    ? apiKey.slice(API_KEY_PREFIX_LIVE.length)
    : apiKey.slice(API_KEY_PREFIX_TEST.length);
  return randomPart.length >= API_KEY_LENGTH;
}

/**
 * Verify an AI platform API key and return the associated record
 */
export async function verifyAiPlatformApiKey(
  apiKey: string
): Promise<{ apiKeyRecord: Awaited<ReturnType<typeof prisma.aiPlatformApiKey.findUnique>>; scopes: string[] } | null> {
  if (!apiKey || !isValidAiPlatformApiKeyFormat(apiKey)) {
    return null;
  }

  const keyHash = hashAiPlatformApiKey(apiKey);

  const record = await prisma.aiPlatformApiKey.findUnique({
    where: { keyHash },
  });

  if (!record) {
    return null;
  }

  if (record.status !== "ACTIVE") {
    return null;
  }

  if (record.expiresAt && new Date() > record.expiresAt) {
    return null;
  }

  // Update last used timestamp and increment request count
  await prisma.aiPlatformApiKey.update({
    where: { id: record.id },
    data: {
      lastUsedAt: new Date(),
      requestCount: { increment: 1 },
    },
  });

  return { apiKeyRecord: record, scopes: record.scopes };
}

/**
 * Check rate limit for an AI platform API key
 */
export async function checkAiPlatformRateLimit(
  apiKeyId: string,
  rateLimitPerMinute: number
): Promise<boolean> {
  const windowStart = new Date();
  windowStart.setSeconds(0, 0);

  const record = await prisma.rateLimitRecord.findUnique({
    where: {
      identifier_windowStart: {
        identifier: `ai_platform:${apiKeyId}`,
        windowStart,
      },
    },
  });

  if (!record) {
    await prisma.rateLimitRecord.create({
      data: {
        identifier: `ai_platform:${apiKeyId}`,
        windowStart,
        requestCount: 1,
      },
    });
    return true;
  }

  if (record.requestCount >= rateLimitPerMinute) {
    return false;
  }

  await prisma.rateLimitRecord.update({
    where: { id: record.id },
    data: { requestCount: { increment: 1 } },
  });

  return true;
}

/**
 * Create a new AI platform API key
 */
export async function createAiPlatformApiKey(
  createdById: string,
  platformName: string,
  scopes: string[] = [],
  note?: string,
  expiresAt?: Date
): Promise<{ record: Awaited<ReturnType<typeof prisma.aiPlatformApiKey.findUnique>>; rawKey: string }> {
  const rawKey = generateAiPlatformApiKey(false);
  const keyHash = hashAiPlatformApiKey(rawKey);
  const prefix = getAiPlatformKeyPrefix(rawKey);

  const record = await prisma.aiPlatformApiKey.create({
    data: {
      platformName,
      keyHash,
      keyPrefix: prefix,
      createdById,
      scopes,
      note,
      expiresAt,
      status: "ACTIVE",
      rateLimitPerMinute: 120,
    },
  });

  return { record, rawKey };
}

/**
 * Revoke an AI platform API key
 */
export async function revokeAiPlatformApiKey(apiKeyId: string): Promise<boolean> {
  const record = await prisma.aiPlatformApiKey.findUnique({
    where: { id: apiKeyId },
  });

  if (!record) {
    return false;
  }

  await prisma.aiPlatformApiKey.update({
    where: { id: apiKeyId },
    data: { status: "REVOKED" },
  });

  return true;
}

/**
 * Suspend an AI platform API key
 */
export async function suspendAiPlatformApiKey(apiKeyId: string): Promise<boolean> {
  const record = await prisma.aiPlatformApiKey.findUnique({
    where: { id: apiKeyId },
  });

  if (!record) {
    return false;
  }

  await prisma.aiPlatformApiKey.update({
    where: { id: apiKeyId },
    data: { status: "SUSPENDED" },
  });

  return true;
}

/**
 * Reactivate a suspended AI platform API key
 */
export async function reactivateAiPlatformApiKey(apiKeyId: string): Promise<boolean> {
  const record = await prisma.aiPlatformApiKey.findUnique({
    where: { id: apiKeyId },
  });

  if (!record) {
    return false;
  }

  await prisma.aiPlatformApiKey.update({
    where: { id: apiKeyId },
    data: { status: "ACTIVE" },
  });

  return true;
}

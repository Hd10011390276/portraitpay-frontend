/**
 * AI Generation Service - Runway & Midjourney Integration
 *
 * This service handles:
 * - Portrait licensing for AI video generation
 * - Royalty calculation and distribution
 * - API routing to Runway/Midjourney
 */

import { prisma } from "@/lib/prisma";
import { ethers } from "ethers";
import { LICENSING_CONTRACT_ABI, SUPPORTED_NETWORKS } from "@/lib/blockchain/abi";

export interface GenerationRequest {
  userId: string;
  portraitId: string;
  platform: "runway" | "midjourney";
  prompt: string;
  style?: string;
  duration?: number; // seconds for video
}

export interface GenerationResponse {
  success: boolean;
  jobId?: string;
  status?: "pending" | "processing" | "completed" | "failed";
  outputUrl?: string;
  error?: string;
}

export interface RoyaltyCalculation {
  totalAmount: number;
  platformFee: number; // 15%
  creatorShare: number; // 85%
  creatorAddress: string;
}

/**
 * Get user's portrait licensing settings
 */
export async function getPortraitLicensing(portraitId: string) {
  const portrait = await prisma.portrait.findUnique({
    where: { id: portraitId },
    include: {
      owner: {
        select: {
          id: true,
          walletAddress: true,
          portraitSettings: true,
        },
      },
    },
  });

  if (!portrait) {
    throw new Error("Portrait not found");
  }

  return portrait;
}

/**
 * Calculate royalty for AI generation usage
 * Platform takes 15%, creator gets 85%
 */
export function calculateRoyalty(totalAmount: number): RoyaltyCalculation {
  const platformFeePercent = 15;
  const platformFee = Math.floor(totalAmount * (platformFeePercent / 100));
  const creatorShare = totalAmount - platformFee;

  return {
    totalAmount,
    platformFee,
    creatorShare,
    creatorAddress: "", // Will be filled from portrait owner
  };
}

/**
 * Check if portrait is licensed for AI generation
 */
export async function isPortraitLicensed(portraitId: string, platform: string): Promise<boolean> {
  const portrait = await getPortraitLicensing(portraitId);

  // Check if licensing is allowed
  if (!portrait.owner.portraitSettings?.allowLicensing) {
    return false;
  }

  // Check allowed scopes (empty = all allowed)
  const allowedScopes = portrait.owner.portraitSettings.allowedScopes || [];
  if (allowedScopes.length > 0 && !allowedScopes.includes("AI_GENERATION")) {
    return false;
  }

  // Check prohibited content
  const prohibited = portrait.owner.portraitSettings.prohibitedContent || [];
  if (prohibited.includes("AI_GENERATION")) {
    return false;
  }

  return true;
}

/**
 * Get licensing fee for a portrait
 */
export async function getLicensingFee(portraitId: string): Promise<number> {
  const portrait = await getPortraitLicensing(portraitId);
  const defaultFee = portrait.owner.portraitSettings?.defaultLicenseFee || 0;

  // Return fee in USD cents (convert Decimal to number)
  return typeof defaultFee === "number" ? defaultFee * 100 : Number(defaultFee) * 100;
}

/**
 * Create on-chain license record
 */
export async function createOnChainLicense(
  portraitId: string,
  licenseeAddress: string,
  fee: number,
  usageScope: string,
  network: keyof typeof SUPPORTED_NETWORKS = "base"
) {
  const config = SUPPORTED_NETWORKS[network];
  if (!config) throw new Error(`Unsupported network: ${network}`);

  const provider = new ethers.JsonRpcProvider(config.rpcUrl);
  const wallet = new ethers.Wallet(process.env.ETH_WALLET_PRIVATE_KEY!, provider);
  const contract = new ethers.Contract(config.contractAddress, LICENSING_CONTRACT_ABI, wallet);

  // Convert fee to wei-like units (assuming USD in cents)
  const feeWei = BigInt(fee);

  try {
    const tx = await contract.createLicense(
      portraitId,
      licenseeAddress,
      feeWei,
      usageScope
    );

    const receipt = await tx.wait(1);

    // Extract license ID from event
    const event = receipt.logs.find(
      (log: any) => log.fragment?.name === "LicenseCreated"
    );

    const licenseId = event?.args?.licenseId?.toString();

    return {
      success: true,
      licenseId,
      txHash: receipt.hash,
    };
  } catch (error) {
    console.error("[AI-Gen] Failed to create on-chain license:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Process royalty payment on-chain
 */
export async function payRoyaltyOnChain(
  portraitId: string,
  amount: number,
  network: keyof typeof SUPPORTED_NETWORKS = "base"
) {
  const config = SUPPORTED_NETWORKS[network];
  if (!config) throw new Error(`Unsupported network: ${network}`);

  const provider = new ethers.JsonRpcProvider(config.rpcUrl);
  const wallet = new ethers.Wallet(process.env.ETH_WALLET_PRIVATE_KEY!, provider);
  const contract = new ethers.Contract(config.contractAddress, LICENSING_CONTRACT_ABI, wallet);

  const amountWei = BigInt(amount);

  try {
    const tx = await contract.payRoyalty(portraitId, amountWei, { value: amountWei });
    const receipt = await tx.wait(1);

    return {
      success: true,
      txHash: receipt.hash,
    };
  } catch (error) {
    console.error("[AI-Gen] Failed to pay royalty:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Create database record for AI generation request
 */
export async function createAIGenerationRecord(
  request: GenerationRequest,
  licenseId: string,
  royalty: RoyaltyCalculation
) {
  return prisma.transaction.create({
    data: {
      userId: request.userId,
      type: "LICENSE_PURCHASE",
      status: "PENDING",
      amount: royalty.totalAmount / 100, // Convert from cents
      currency: "USD",
      metadata: {
        portraitId: request.portraitId,
        platform: request.platform,
        prompt: request.prompt,
        licenseId,
        royalty: {
          platformFee: royalty.platformFee / 100,
          creatorShare: royalty.creatorShare / 100,
        },
      },
    },
  });
}

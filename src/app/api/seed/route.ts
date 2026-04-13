/**
 * Seed API - Initialize demo account for testing
 * Only creates if demo account doesn't exist
 * Protected by a secret key to prevent unauthorized access
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

const DEMO_EMAIL = 'demo@portraitpayai.com';
const DEMO_PASSWORD = 'Demo123456';

export async function POST(request: NextRequest) {
  try {
    // Check authorization
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.SEED_SECRET || 'portraitpay-seed-secret';

    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if demo account already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: DEMO_EMAIL },
    });

    if (existingUser) {
      return NextResponse.json({
        message: 'Demo account already exists',
        email: DEMO_EMAIL,
      });
    }

    // Create demo user
    const hashedPassword = await hash(DEMO_PASSWORD, 12);

    const demoUser = await prisma.user.create({
      data: {
        email: DEMO_EMAIL,
        name: 'Demo User',
        passwordHash: hashedPassword,
        emailVerified: new Date(),
      },
    });

    // Create test portrait
    const portrait = await prisma.portrait.create({
      data: {
        ownerId: demoUser.id,
        name: 'Demo Portrait',
        description: 'This is a demo portrait for testing',
        status: 'ACTIVE',
        allowedUsages: ['FILM', 'ANIMATION', 'ADVERTISING'],
        prohibitedContent: ['ADULT', 'POLITICAL'],
        faceEmbedding: Buffer.from(new Array(512).fill(0).map(() => Math.random() * 2 - 1)),
        imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      },
    });

    // Create test earnings
    await prisma.transaction.createMany({
      data: [
        {
          userId: demoUser.id,
          type: 'LICENSE_PURCHASE',
          amount: 99.99,
          currency: 'USD',
          status: 'COMPLETED',
        },
        {
          userId: demoUser.id,
          type: 'ROYALTY_PAYOUT',
          amount: 250.00,
          currency: 'USD',
          status: 'COMPLETED',
        },
      ],
    });

    // Create KYC record
    await prisma.kYCLog.create({
      data: {
        userId: demoUser.id,
        provider: 'internal',
        externalRef: 'demo-kyc-ref',
        action: 'KYC_APPROVED',
        result: { approved: true, level: 2 },
        level: 2,
        idCardNumber: '**************1234',
        idCardName: 'DEMO USER',
        idCardExpire: new Date('2030-12-31'),
        faceMatchScore: 0.95,
        verifierId: 'system',
      },
    });

    // Enable infringement monitoring
    await prisma.infringementMonitorConfig.create({
      data: {
        userId: demoUser.id,
        enabled: true,
        similarityThreshold: 0.85,
        enabledPlatforms: ['twitter', 'instagram', 'tiktok', 'facebook'],
      },
    });

    return NextResponse.json({
      message: 'Demo account created successfully',
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      userId: demoUser.id,
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Failed to create demo account', details: String(error) },
      { status: 500 }
    );
  }
}

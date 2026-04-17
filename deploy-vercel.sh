#!/bin/bash
# Deploy to Vercel production
# Usage: VERCEL_TOKEN="your-token" ./deploy-vercel.sh
# Or set VERCEL_TOKEN environment variable before running

if [ -z "$VERCEL_TOKEN" ]; then
    echo "Error: VERCEL_TOKEN environment variable is not set"
    echo "Usage: VERCEL_TOKEN='your-token' ./deploy-vercel.sh"
    exit 1
fi

echo "Deploying to Vercel production..."
npx vercel --prod --token $VERCEL_TOKEN

echo "Deployment complete!"
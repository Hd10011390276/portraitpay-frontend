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
npx vercel --prod --force --token $VERCEL_TOKEN

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "Please verify:"
    echo "  1. Logo shows 'PortraitPay AI' (hard refresh: Ctrl+F5)"
    echo "  2. Test contact form at https://portraitpayai.com/contact"
    echo ""
else
    echo ""
    echo "❌ Deployment failed!"
    exit 1
fi
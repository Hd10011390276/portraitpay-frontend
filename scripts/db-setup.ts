/**
 * PortraitPay — Database Setup Script
 * 
 * Run this script AFTER you have configured DATABASE_URL in .env
 * 
 * Usage:
 *   npm run db:setup        # Run migrations
 *   npm run db:push         # Push schema (dev / first time)
 *   npm run db:studio       # Open Prisma Studio
 *   npm run db:migrate      # Production migration
 */

import { execSync } from "child_process";
import { existsSync } from "fs";

const DB_URL = process.env.DATABASE_URL;

if (!DB_URL) {
  console.error("❌  DATABASE_URL is not set. Please configure it in .env first.");
  console.error("   See .env.production.example for reference.");
  process.exit(1);
}

console.log("✅  DATABASE_URL is configured");
console.log(`   URL: ${DB_URL.replace(/\/\/.*:.*@/, "//***:***@")}`);

// Step 1: Validate connection
console.log("\n🔌  Validating database connection...");
try {
  execSync("npx prisma migrate validate", { stdio: "pipe" });
  console.log("✅  Migration state is valid");
} catch (e) {
  // Migration not yet applied — this is fine for first setup
  console.log("ℹ️  No previous migration state found (this is expected on first run)");
}

// Step 2: Run migrations
console.log("\n🚀  Running database migrations...");
try {
  execSync("npx prisma migrate deploy", { stdio: "inherit" });
  console.log("✅  Migrations applied successfully");
} catch (e) {
  console.error("❌  Migration failed. Please check your DATABASE_URL and try again.");
  process.exit(1);
}

// Step 3: Generate Prisma client
console.log("\n📦  Generating Prisma Client...");
try {
  execSync("npx prisma generate", { stdio: "inherit" });
  console.log("✅  Prisma Client generated");
} catch (e) {
  console.error("❌  Prisma generate failed.");
  process.exit(1);
}

console.log("\n🎉  Database setup complete!");
console.log("\nNext steps:");
console.log("  1. Set AUTH_SECRET in Vercel Environment Variables");
console.log("  2. Deploy to Vercel: vercel --prod");
console.log("  3. Monitor at: https://vercel.com/dashboard");

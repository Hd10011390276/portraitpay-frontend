#!/usr/bin/env node
const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const VERCEL_PROJECT_ID = "prj_6FYHbjqW3UebcAxGAwuIk0wXcVpr";
const PAGES = [
  "https://portraitpayai.com/",
  "https://portraitpayai.com/login",
  "https://portraitpayai.com/register",
  "https://portraitpayai.com/contact",
  "https://portraitpayai.com/privacy",
  "https://portraitpayai.com/terms",
  "https://portraitpayai.com/celebrity",
  "https://portraitpayai.com/dashboard",
  "https://portraitpayai.com/portraits",
  "https://portraitpayai.com/portraits/upload",
  "https://portraitpayai.com/kyc",
  "https://portraitpayai.com/settings",
];

async function main() {
  console.log("=== Vercel Deployment ===");
  try {
    const r = await fetch(
      "https://api.vercel.com/v1/deployments?teamId=team_3a84Ago9pVArL5PFYLY0IEp4&projectId=" + VERCEL_PROJECT_ID + "&limit=3",
      { headers: { "Authorization": "Bearer " + VERCEL_TOKEN } }
    );
    const d = await r.json();
    const dep = (d.deployments || [])[0];
    if (dep) {
      console.log("State:", dep.readyState);
      console.log("URL:", dep.url);
      console.log("Date:", new Date(dep.created).toLocaleString());
    }
  } catch (e) { console.log("Error:", e.message); }

  console.log("\n=== Page Checks ===");
  let pass = 0, fail = 0;
  for (const url of PAGES) {
    try {
      const r = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(8000) });
      const name = url.replace("https://portraitpayai.com", "") || "/";
      if (r.ok || r.status === 307 || r.status === 302) {
        if (r.url.includes("_not-found") || r.url.includes("/404")) {
          console.log("[FAIL] " + name + " 404");
          fail++;
        } else {
          console.log("[OK] " + name);
          pass++;
        }
      } else {
        console.log("[FAIL] " + name + " " + r.status);
        fail++;
      }
    } catch (e) { console.log("[FAIL] " + url + " " + e.message); fail++; }
  }
  console.log("\nResult: " + pass + " passed, " + fail + " failed");
  if (fail > 0) process.exit(1);
}

main().catch(console.error);
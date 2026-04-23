const fs = require('fs');
let c = fs.readFileSync('C:/Users/Administrator/.openclaw/workspace/portraitpay/src/app/portraits/upload/page.tsx', 'utf8');

const old = `// ── Face-api helpers ───────────────────────────────────────────────
async function loadFaceModels() {
  const faceapi = await import("@vladmandic/face-api");
  const MODEL_URL = "/models";
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  ]);
  return faceapi;
}

async function extractFaceDescriptor(file: File, faceapi: any): Promise<number[]> {
  const img = new window.Image();
  img.src = URL.createObjectURL(file);
  await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });

  const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.5 });
  const detection = await faceapi
    .detectSingleFace(img, options)
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) throw new Error("No face detected in this image");
  URL.revokeObjectURL(img.src);
  return Array.from(detection.descriptor);
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function computeHash(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
}`;

const nu = `// ── SHA-256 hash (kept for image integrity) ───────────────────────
async function computeHash(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
}`;

if (c.includes(old)) {
  c = c.replace(old, nu);
  console.log('Replaced OK, length:', c.length);
} else {
  console.log('Pattern not found. Checking individual functions...');
  console.log('loadFaceModels:', c.includes('async function loadFaceModels()'));
  console.log('cosineSimilarity:', c.includes('function cosineSimilarity'));
  console.log('computeHash:', c.includes('async function computeHash'));
}

fs.writeFileSync('C:/Users/Administrator/.openclaw/workspace/portraitpay/src/app/portraits/upload/page.tsx', c, 'utf8');

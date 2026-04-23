import re

with open('C:/Users/Administrator/.openclaw/workspace/portraitpay/src/app/portraits/upload/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the face-api helpers block (lines 24-66)
old = '''// ── Face-api helpers ───────────────────────────────────────────────
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
}'''

new = '''// ── SHA-256 hash (kept for image integrity) ───────────────────────
async function computeHash(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
}'''

if old in content:
    content = content.replace(old, new)
    print("Replaced OK, new length:", len(content))
else:
    print("Pattern not found! Trying simpler match...")
    # Try to match just the function signatures
    if 'async function loadFaceModels()' in content:
        print("Found loadFaceModels")
    if 'async function computeHash' in content:
        print("Found computeHash")
    if 'function cosineSimilarity' in content:
        print("Found cosineSimilarity")

with open('C:/Users/Administrator/.openclaw/workspace/portraitpay/src/app/portraits/upload/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

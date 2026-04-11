/**
 * Face utilities — stub implementations for TypeScript compatibility.
 * Real face detection is handled by @vladmandic/face-api on the client side.
 */

export interface FaceEmbeddingResult {
  embedding: number[];
  provider: string;
}

/**
 * Convert a face-api descriptor Float32Array to a plain number array.
 * Used by FaceApiDetector and FaceTraceUploader.
 */
export function descriptorToArray(descriptor: Float32Array): number[] {
  return Array.from(descriptor);
}

/**
 * Compute cosine similarity between two face embedding vectors.
 * Returns a value between -1 and 1 (higher = more similar).
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

/**
 * Extract face embedding using Aliyun API format.
 * Stub: in production this calls the Aliyun face API.
 * Returns an object with the embedding array and provider name.
 */
export async function extractFaceEmbeddingAliyun(_imageBuffer: Buffer): Promise<FaceEmbeddingResult> {
  // Stub: return a zero vector
  const zeros = new Float32Array(512).fill(0);
  return { embedding: Array.from(zeros), provider: "aliyun" };
}

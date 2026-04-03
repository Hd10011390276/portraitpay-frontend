/**
 * Stub for @aliyun-openapi/face-api
 * This module does not exist on npm; functionality is stubbed out.
 * In production, replace with the actual Alibaba Cloud SDK.
 */

export class Configuration {
  constructor(opts: {
    accessKeyId: string;
    accessKeySecret: string;
    region: string;
    endpoint: string;
  }) {
    this.accessKeyId = opts.accessKeyId;
    this.accessKeySecret = opts.accessKeySecret;
    this.region = opts.region;
    this.endpoint = opts.endpoint;
  }
  accessKeyId: string;
  accessKeySecret: string;
  region: string;
  endpoint: string;
}

export class DefaultApi {
  constructor(public config: Configuration) {}

  detectFace(params: { image: string; face_count?: number }): {
    data?: {
      faceList?: Array<{
        feature?: string;
        confidence?: number;
        rect?: { x: number; y: number; w: number; h: number; width: number; height: number };
      }>;
    };
  } {
    // Stub: return fake face detection response
    const fakeFeature = Buffer.from(new Float32Array(512).fill(0.01)).toString("base64");
    return {
      data: {
        faceList: [
          {
            feature: fakeFeature,
            confidence: 0.99,
            rect: { x: 50, y: 50, w: 200, h: 200, width: 200, height: 200 },
          },
        ],
      },
    };
  }
}

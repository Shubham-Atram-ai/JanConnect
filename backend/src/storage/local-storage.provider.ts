import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { StorageProvider, StorageUploadResult } from './storage.provider.interface';

// ─── Local Development Storage Provider ──────────────────────────────────────
// Stores files in ./uploads/ directory for development.
// Replace with Cloudflare R2 / S3-compatible provider in production.

@Injectable()
export class LocalStorageProvider extends StorageProvider {
  private readonly logger = new Logger(LocalStorageProvider.name);
  private readonly baseDir: string;
  private readonly baseUrl: string;

  constructor() {
    super();
    this.baseDir = process.env.LOCAL_STORAGE_PATH || path.join(process.cwd(), '..', 'uploads');
    this.baseUrl = process.env.LOCAL_STORAGE_URL || 'http://localhost:3000/uploads';
    this.ensureDir(this.baseDir);
  }

  async upload(params: {
    buffer: Buffer;
    key: string;
    mimeType: string;
    bucket?: string;
  }): Promise<StorageUploadResult> {
    const bucket = params.bucket || 'janconnect-media';
    const dir = path.join(this.baseDir, bucket, path.dirname(params.key));
    this.ensureDir(dir);

    const filePath = path.join(this.baseDir, bucket, params.key);
    await fs.promises.writeFile(filePath, params.buffer);

    this.logger.log(`Stored file: ${filePath}`);

    return {
      bucket,
      key: params.key,
      url: this.getUrl(bucket, params.key),
      sizeBytes: params.buffer.length,
      mimeType: params.mimeType,
    };
  }

  getUrl(bucket: string, key: string): string {
    return `${this.baseUrl}/${bucket}/${key}`;
  }

  async delete(bucket: string, key: string): Promise<void> {
    const filePath = path.join(this.baseDir, bucket, key);
    try {
      await fs.promises.unlink(filePath);
    } catch (err: unknown) {
      this.logger.warn(`Could not delete ${filePath}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  private ensureDir(dir: string): void {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

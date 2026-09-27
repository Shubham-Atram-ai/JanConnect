export interface StorageUploadResult {
  bucket: string;
  key: string;
  url: string;
  sizeBytes: number;
  mimeType: string;
}

export abstract class StorageProvider {
  abstract upload(params: {
    buffer: Buffer;
    key: string;
    mimeType: string;
    bucket?: string;
  }): Promise<StorageUploadResult>;

  abstract getUrl(bucket: string, key: string): string;

  abstract delete(bucket: string, key: string): Promise<void>;
}

export const STORAGE_PROVIDER = Symbol('STORAGE_PROVIDER');

export type DocumentStatus = 'uploaded' | 'processing' | 'validated' | 'failed' | 'persisted';

export interface UploadRequest {
  filename: string;
  dtype: 'invoice' | 'receipt' | 'contract';
  contentBase64: string;
}

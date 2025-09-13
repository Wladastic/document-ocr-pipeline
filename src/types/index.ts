export type DocumentStatus = 'uploaded' | 'processing' | 'validated' | 'failed';

export interface UploadRequest {
  filename: string;
  dtype: 'invoice' | 'receipt' | 'contract';
  contentBase64: string;
}

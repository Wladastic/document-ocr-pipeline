import type { DocumentStatus } from "../types/index";

export interface DocumentData {
  id: string;
  filename: string;
  dtype: 'invoice' | 'receipt' | 'contract';
  status: DocumentStatus;
  ocrText?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentPersistence {
  createDocument(data: { filename: string; dtype: 'invoice' | 'receipt' | 'contract'; status: DocumentStatus }): Promise<DocumentData>;
  getDocument(id: string): Promise<DocumentData | null>;
  updateDocument(id: string, updates: Partial<Pick<DocumentData, 'status' | 'ocrText' | 'metadata'>>): Promise<void>;
}
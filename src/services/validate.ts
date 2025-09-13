import { z } from "zod";

// It was requested to use zod for validation; keeping schemas here keeps
// runtime validation close to the code that uses it. For larger projects
// you may extract shared types to a `types/` folder and generate typings.

export const InvoiceSchema = z.object({
  sourceLanguage: z.string(),
  ocrConfidence: z.number(),
  processedAt: z.string(),
  invoiceNumber: z.string().min(3),
  customerName: z.string().min(1),
  total: z.number().nonnegative(),
  currency: z.string().length(3),
  invoiceDate: z.string(),
});

export const ReceiptSchema = z.object({
  sourceLanguage: z.string(),
  ocrConfidence: z.number(),
  processedAt: z.string(),
  merchant: z.string(),
  total: z.number().nonnegative(),
  items: z.array(z.object({ name: z.string(), price: z.number().nonnegative() })),
  currency: z.string().length(3),
  receiptDate: z.string(),
});

export const ContractSchema = z.object({
  sourceLanguage: z.string(),
  ocrConfidence: z.number(),
  processedAt: z.string(),
  parties: z.array(z.string()).min(2),
  effectiveDate: z.string(),
  termMonths: z.number().int().positive(),
});

export function validateByType(dtype: 'invoice'|'receipt'|'contract', data: unknown) {
  if (dtype === 'invoice') return InvoiceSchema.parse(data);
  if (dtype === 'receipt') return ReceiptSchema.parse(data);
  return ContractSchema.parse(data);
}

export const UploadSchema = z.object({
  filename: z.string().min(1),
  dtype: z.enum(['invoice', 'receipt', 'contract']),
  contentBase64: z.string().min(1),
});

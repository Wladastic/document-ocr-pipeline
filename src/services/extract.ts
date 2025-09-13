import { OCRResult } from "./ocr";


export function extractMetadata(dtype: 'invoice' | 'receipt' | 'contract', ocr: OCRResult) {
  const now = new Date();
  const base = {
    sourceLanguage: ocr.language,
    ocrConfidence: ocr.confidence,
    processedAt: now.toISOString(),
  };

  if (dtype === 'invoice') {
    return {
      ...base,
      invoiceNumber: `INV-${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}-${Math.floor(Math.random()*10000).toString().padStart(4,'0')}`,
      customerName: "ACME GmbH",
      total: 123.45,
      currency: "EUR",
      invoiceDate: now.toISOString().slice(0,10),
    };
  }
  if (dtype === 'receipt') {
    return {
      ...base,
      merchant: "Kiosk 24/7",
      total: 19.99,
      items: [{ name: "Coffee", price: 2.99 }, { name: "Snack", price: 1.49 }],
      currency: "EUR",
      receiptDate: now.toISOString(),
    };
  }
  return {
    ...base,
    parties: ["Example AG", "Example Person"],
    effectiveDate: now.toISOString().slice(0,10),
    termMonths: 12,
  };
}

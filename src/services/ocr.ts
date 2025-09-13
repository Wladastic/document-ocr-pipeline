export type OCRResult = {
  text: string;
  confidence: number;
  language: string;
};

export function simulateOCR(imageBuffer: Buffer): Promise<OCRResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        text: "This is a simulated OCR result.",
        confidence: 0.98,
        language: "en",
      });
    }, 500);
  });
}

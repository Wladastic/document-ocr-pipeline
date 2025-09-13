
import { persistence } from "../persistence/index";
import { simulateOCR } from "../services/ocr";
import { extractMetadata } from "../services/extract";
import { validateByType } from "../services/validate";
import { ProcessJobData, queue } from "./redis";
import { env } from "../config";


export async function enqueueDocument(data: ProcessJobData): Promise<void> {
  await queue.enqueue(data);
}

// get worker processing timeout from env or default to 5 seconds
const WORKER_TIMEOUT = parseInt(env.WORKER_TIMEOUT || "5000", 10);

export function startWorker(): void {
  console.log("Starting Redis queue worker...");
  
  // Simple polling worker
  const processNextJob = async () => {
    try {
      const job = await queue.dequeue();
      if (job) {
        console.log("Processing job:", job.documentId);
        await processJob(job);
        await queue.markCompleted(job);
        console.log("Job completed:", job.documentId);
      }
    } catch (error) {
      console.error("Job processing failed:", error);
      // Note: job will remain in processing list for manual cleanup if needed
    }

    setTimeout(processNextJob, WORKER_TIMEOUT);
  };

  processNextJob();
}

export async function processJob(data: ProcessJobData) {
  const { documentId, dtype } = data;
  
  try {
    // Set status to processing when worker starts
    await persistence.updateDocument(documentId, { status: "processing" });
    const doc = await persistence.getDocument(documentId);
    if (!doc) throw new Error("Document not found");

    // In this prototype we don't load the actual file; we simulate OCR
    // based on the filename. Replace with a real file read in production.
    const fakeBuffer = Buffer.from(doc.filename);
    const ocr = await simulateOCR(fakeBuffer);
    const extracted = extractMetadata(dtype, ocr);
    
    // Validate the extracted metadata
    const validated = validateByType(dtype, extracted);
    
    // Update to validated status with OCR text and metadata - this is the final success state
    await persistence.updateDocument(documentId, {
      status: "validated",
      ocrText: ocr.text,
      metadata: validated,
    });
    
  } catch (e: any) {
    // Set status to failed if any step fails
    await persistence.updateDocument(documentId, { status: "failed" });
    throw e;
  }
}

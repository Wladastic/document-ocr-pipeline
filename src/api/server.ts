import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { env } from "../config/index";
import { persistence } from "../persistence/index";
import { saveBuffer } from "../storage/index";
import { UploadSchema } from "../services/validate";
import { enqueueDocument, startWorker } from "../queue/queue";

const app = new Hono();

// Simple logging middleware
app.use('*', async (c, next) => {
  console.log(`${c.req.method} ${c.req.path}`);
  await next();
});

app.get("/health", async (c) => c.json({ ok: true }));

app.post("/documents", async (c) => {
  try {
    const body = await c.req.json();
    const parsed = UploadSchema.parse(body);
    const { filename, dtype, contentBase64 } = parsed;
    const buf = Buffer.from(contentBase64, "base64");
    await saveBuffer(filename, buf);

    const created = await persistence.createDocument({
      filename,
      dtype,
      status: "uploaded"
    });

    await enqueueDocument({ documentId: created.id, dtype });

    return c.json({ id: created.id, status: "uploaded" }, 202);
  } catch (err: any) {
    if (err?.issues) {
      return c.json({ error: "Invalid request", details: err.issues }, 400);
    }
    console.error(err);
    return c.json({ error: "Internal error" }, 500);
  }
});

app.get("/documents/:id", async (c) => {
  const id = c.req.param('id');
  const doc = await persistence.getDocument(id);
  if (!doc) return c.json({ error: "Not found" }, 404);
  
  return c.json({ 
    id: doc.id, 
    filename: doc.filename, 
    dtype: doc.dtype, 
    status: doc.status, 
    metadata: doc.metadata, 
    ocrText: doc.ocrText 
  });
});

startWorker();

const port = env.PORT;
console.log(`API listening on ${port}`);
serve({
  fetch: app.fetch,
  port,
});

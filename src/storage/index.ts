import { promises as fs } from "fs";
import path from "path";
import { env } from "../config/index";

export async function ensureStorage() {
  await fs.mkdir(env.STORAGE_DIR, { recursive: true });
}

export async function saveBuffer(filename: string, buf: Buffer): Promise<string> {
  await ensureStorage();
  const p = path.join(env.STORAGE_DIR, filename);
  await fs.writeFile(p, buf);
  return p;
}

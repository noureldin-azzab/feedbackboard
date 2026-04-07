import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

// MIGRATION NOTE: This stores uploads on the local filesystem.
// On Vercel this works only ephemerally (files disappear on redeploy/function restart).
// When migrating to AWS, replace with S3 + presigned URLs.
const UPLOAD_DIR = process.env.UPLOAD_PATH || path.join(process.cwd(), "public/uploads");

export function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

export async function saveUploadedFile(file: File): Promise<string> {
  ensureUploadDir();

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const ext = file.name.split(".").pop() || "bin";
  const filename = `${uuidv4()}.${ext}`;
  const filePath = path.join(UPLOAD_DIR, filename);

  fs.writeFileSync(filePath, buffer);

  // Return a URL relative to APP_URL — assumes the app is at localhost in dev.
  // MIGRATION NOTE: In production on AWS this needs to be an S3 or CDN URL.
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${appUrl}/uploads/${filename}`;
}

export function deleteUploadedFile(imageUrl: string) {
  try {
    const filename = imageUrl.split("/uploads/").pop();
    if (!filename) return;
    const filePath = path.join(UPLOAD_DIR, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    // silently fail — minimal error handling
    console.error("Failed to delete file:", err);
  }
}

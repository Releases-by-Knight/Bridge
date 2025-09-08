import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

// Helper function to calculate checksum
export async function getChecksum(filePath: string, algorithm: "sha256" | "md5" = "sha256"): Promise<string> {
  const buffer = await readFile(filePath);
  const hash = createHash(algorithm);
  hash.update(buffer);
  return hash.digest("hex");
}

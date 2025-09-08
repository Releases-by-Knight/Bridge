import {
  CopyObjectCommand,
  DeleteObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { readFile } from "node:fs/promises";
import { s3Client } from "./clients";
import { basename } from "node:path";
import type { ABI } from "../types/enums";

const bucketName = "app-storage";
const folder = "com.knightshrestha.app_store";

export async function uploadFile(filePath: string, abi: ABI): Promise<string> {
  const fileName = basename(filePath);
  if (!fileName) throw new Error("Invalid file path: missing file name");

  const tempFileName = `${fileName}.tmp`;
  const tempKey = `${folder}/${tempFileName}`;

  const finalFileName = `${abi}.apk`;
  const finalKey = `${folder}/${finalFileName}`;

  const fileBuffer = await readFile(filePath);

  // 1️⃣ Upload temporary file
  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: tempKey,
      Body: fileBuffer,
      ContentLength: fileBuffer.length,
      ACL: "public-read",
    })
  );

  // 2️⃣ Copy temporary file to final key (URL-encode CopySource)
  const copySource = encodeURIComponent(`${bucketName}/${tempKey}`);
  await s3Client.send(
    new CopyObjectCommand({
      Bucket: bucketName,
      CopySource: copySource,
      Key: finalKey,
      ACL: "public-read",
    })
  );

  // 3️⃣ Delete the temporary file
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: tempKey,
    })
  );

  // 4️⃣ Return permanent URL
  return `https://s3.tebi.io/${bucketName}/${finalKey}`;
}

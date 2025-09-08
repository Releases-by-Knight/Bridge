import {
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { readFile } from "node:fs/promises";
import { s3Client } from "./clients";
import { basename } from "node:path";
import type { ABI } from "../types/enums";
import { Constants } from "./env";

const bucketName = Constants.BUCKET_NAME;
const folder = Constants.BUCKET_FOLDER;

export async function uploadFile(filePath: string, abi: ABI): Promise<string> {
  const fileName = basename(filePath);
  if (!fileName) throw new Error("Invalid file path: missing file name");

  const finalFileName = `${abi}.apk`;
  const finalKey = `${folder}/${finalFileName}`;

  const fileBuffer = await readFile(filePath);


  // 1️⃣ Upload file
  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: finalKey,
      Body: fileBuffer,
      ContentLength: fileBuffer.length,
      ACL: "public-read",
    })
  );

  // 4️⃣ Return permanent URL
  return `https://s3.tebi.io/${bucketName}/${finalKey}`;
}

import { mkdir, readdir } from "node:fs/promises";
import { appwriteClient, github } from "./src/clients";
import { join } from "node:path";
import PromisePool from "@supercharge/promise-pool";
import { uploadFile } from "./src/upload_file";
import { ABI } from "./types/enums";
import { TablesDB } from "node-appwrite";
import { env } from "./src/env";
import { getChecksum } from "./src/checksum";

const downloadDir = "apk_files";
await mkdir(downloadDir, { recursive: true });

// Get Files
const release = await github.rest.repos.getLatestRelease({
  owner: "Releases-by-Knight",
  repo: "Android-App-Store",
});



const apkFiles = release.data.assets.filter(asset =>
  asset.name.endsWith(".apk")
).map(asset => ({
  name: asset.name,
  path: join(downloadDir, asset.name),
  downloadUrl: asset.browser_download_url,
  abi: asset.name.includes("arm64-v8a")
    ? ABI.ARM64_V8A
    : asset.name.includes("x86_64")
      ? ABI.X86_64
      : ABI.ARMEABI_V7A,
}));

// Download APKs
await PromisePool.for(apkFiles)
  .withConcurrency(3)
  .handleError(e => {
    console.error(e);
    process.exit(1);
  })
  .onTaskFinished(asset => {
    console.log(`Downloaded ${asset.name} (ABI: ${asset.abi})`);
  })
  .process(async asset => {
    console.time(asset.name)

    const res = await fetch(asset.downloadUrl, {
      headers: { Authorization: `token ${process.env.GITHUB_TOKEN}` },
    });

    if (!res.ok) throw new Error(`Failed to fetch ${asset.name}: ${res.statusText}`);

    const buffer = Buffer.from(await res.arrayBuffer());
    await Bun.write(asset.path, buffer);
    console.timeEnd(asset.name)

  });

// Upload APKs
const { results } = await PromisePool.for(apkFiles)
  .withConcurrency(1)
  .handleError(e => {
    console.error(e);
    process.exit(1);
  })
  .onTaskFinished(asset => {
    console.log(`Uploaded ${asset.name} (ABI: ${asset.abi})`);
  })
  .process(async asset => {
    console.time(asset.name)
    const sha256 = await getChecksum(asset.path, "sha256");
    const resUrl = await uploadFile(asset.path, asset.abi);
    console.timeEnd(asset.name)

    return {
      abi: asset.abi,
      resUrl,
      sha256
    };
  });

const apkInfo: Record<string, { url: string; sha256: string }> = {};
for (const r of results) {
  apkInfo[r.abi] = { url: r.resUrl, sha256: r.sha256 };
}

const tablesDB = new TablesDB(appwriteClient);

const ROW_ID = "68b585c20021dffba015"

await tablesDB.updateRow({
  databaseId: env.APPWRITE_DATABASE_ID,
  tableId: env.APPWRITE_TABLE_ID,
  rowId: ROW_ID,
  data: {
    "version": release.data.tag_name.slice(1),
    "apk_info": apkInfo
  }
})


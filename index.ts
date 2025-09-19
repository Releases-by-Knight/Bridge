import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import PromisePool from "@supercharge/promise-pool";
import { firestoreClient, github } from "./src/clients";
import { uploadFile } from "./src/upload_file";
import { ABI } from "./types/enums";
import { getChecksum } from "./src/checksum";
import { getNptTimestamp } from "./src/getTimestamp";
import { Constants } from "./src/env";
import { Timestamp } from "firebase-admin/firestore";

const downloadDir = "apk_files";

// Helper log with timestamp
const log = (msg: string) => console.log(`[${getNptTimestamp()}] ${msg}`);

async function main() {
  try {
    await mkdir(downloadDir, { recursive: true });
    log("Fetching latest release...");

    // Get latest release
    const release = await github.rest.repos.getLatestRelease({
      owner: "Releases-by-Knight",
      repo: "Android-App-Store",
    });

    // Filter APK files and map metadata
    const apkFiles = release.data.assets
      .filter((asset) => asset.name.endsWith(".apk"))
      .map((asset) => ({
        name: asset.name,
        path: join(downloadDir, asset.name),
        downloadUrl: asset.browser_download_url,
        abi: asset.name.includes("arm64-v8a")
          ? ABI.ARM64_V8A
          : asset.name.includes("x86_64")
            ? ABI.X86_64
            : ABI.ARMEABI_V7A,
      }));

    if (!apkFiles.length) {
      log("No APK files found in release.");
      return;
    }

    log(`Found ${apkFiles.length} APK(s). Starting download...`);

    // Download APKs concurrently
    await PromisePool.for(apkFiles)
      .withConcurrency(3)
      .handleError((err, asset) => {
        console.error(`Failed to download ${asset.name}:`, err);
        process.exit(1);
      })
      .process(async (asset) => {
        console.time(asset.name);
        const res = await fetch(asset.downloadUrl, {
          headers: { Authorization: `token ${process.env.GITHUB_TOKEN}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);
        const buffer = Buffer.from(await res.arrayBuffer());
        await Bun.write(asset.path, buffer);
        console.timeEnd(asset.name);
        log(`Downloaded ${asset.name} (ABI: ${asset.abi})`);
      });

    log("Download completed. Starting upload...");

    // Upload APKs sequentially (or increase concurrency if safe)
    const { results: uploadResults } = await PromisePool.for(apkFiles)
      .withConcurrency(1)
      .handleError((err, asset) => {
        console.error(`Failed to upload ${asset.name}:`, err);
        process.exit(1);
      })
      .process(async (asset) => {
        console.time(asset.name);
        const sha256 = await getChecksum(asset.path, "sha256");
        const downloadUrl = await uploadFile(asset.path, asset.abi);
        console.timeEnd(asset.name);
        log(`Uploaded ${asset.name} (ABI: ${asset.abi})`);
        return { abi: asset.abi, downloadUrl, sha256 };
      });

    log("Updating database...");

    const appId = Constants.packageName;

    // Fetch app info
    const docRef = firestoreClient.collection('app_list').doc(appId);

    const updated_at = Timestamp.now();

    // update download link and version
    await docRef.set({
      "version": release.data.tag_name.slice(1),
      updated_at,
      "downloads": Object.fromEntries(
        uploadResults.map(r => [
          r.abi, {
            updated_at,
            download_url: r.downloadUrl,
            sha256: r.sha256,
          }
        ])
      )
    }, {
      merge: true
    })

    log("Database updated. Task completed.");
  } catch (err) {
    console.error("Script failed:", err);
    process.exit(1);
  }
}

// Run main
await main();

const requiredEnv = [
  "FIREBASE_SERVICE_ACCOUNT",
  "TEBI_ACCESS_ID",
  "TEBI_ACCESS_KEY",
  "GITHUB_TOKEN",
] as const;

for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`Missing required env variable: ${key}`);
    process.exit(1); // stop process immediately
  }
}

// Optional: export a typed env object
export const env = {
  FIREBASE_SERVICE_ACCOUNT: process.env.FIREBASE_SERVICE_ACCOUNT!,
  TEBI_ACCESS_ID: process.env.TEBI_ACCESS_ID!,
  TEBI_ACCESS_KEY: process.env.TEBI_ACCESS_KEY!,
  GITHUB_TOKEN: process.env.GITHUB_TOKEN!,
} as const;

export const Constants = {
  packageName: "com.knightshrestha.app_store",
  BUCKET_NAME: "app-storage",
  BUCKET_FOLDER: "com.knightshrestha.app_store",
}
const requiredEnv = [
  "SUPABASE_URL",
  "SUPABASE_SECRET_KEYS",
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
  SUPABASE_URL: process.env.SUPABASE_URL!,
  SUPABASE_SECRET_KEYS: process.env.SUPABASE_SECRET_KEYS!,
  TEBI_ACCESS_ID: process.env.TEBI_ACCESS_ID!,
  TEBI_ACCESS_KEY: process.env.TEBI_ACCESS_KEY!,
  GITHUB_TOKEN: process.env.GITHUB_TOKEN!,
} as const;

export const Constants = {
  SUPABASE_ID: 1,
  BUCKET_NAME: "app-storage",
  BUCKET_FOLDER: "com.knightshrestha.app_store",
}
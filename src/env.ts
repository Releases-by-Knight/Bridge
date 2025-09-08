const requiredEnv = [
  "APPWRITE_ENDPOINT",
  "APPWRITE_PROJECT_ID",
  "APPWRITE_API_TOKEN",
  "APPWRITE_DATABASE_ID",
  "APPWRITE_TABLE_ID",
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
  APPWRITE_ENDPOINT: process.env.APPWRITE_ENDPOINT!,
  APPWRITE_PROJECT_ID: process.env.APPWRITE_PROJECT_ID!,
  APPWRITE_API_TOKEN: process.env.APPWRITE_API_TOKEN!,
  APPWRITE_DATABASE_ID: process.env.APPWRITE_DATABASE_ID!,
  APPWRITE_TABLE_ID: process.env.APPWRITE_TABLE_ID!,
  TEBI_ACCESS_ID: process.env.TEBI_ACCESS_ID!,
  TEBI_ACCESS_KEY: process.env.TEBI_ACCESS_KEY!,
  GITHUB_TOKEN: process.env.GITHUB_TOKEN!,
} as const;
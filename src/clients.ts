import { createClient } from '@supabase/supabase-js'
import { env } from "./env";
import { S3Client } from "@aws-sdk/client-s3";
import { Octokit } from "@octokit/rest";

const credentials = {
  accessKeyId: env.TEBI_ACCESS_ID,
  secretAccessKey: env.TEBI_ACCESS_KEY
};

// Initialize S3 client
const s3Client = new S3Client({
  endpoint: "https://s3.tebi.io",
  credentials: credentials,
  region: "global",
  forcePathStyle: true, // important for custom endpoints
});

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEYS)

const github = new Octokit({ auth: env.GITHUB_TOKEN })


export { supabase, s3Client, github }
import { Client, TablesDB, Storage } from "node-appwrite";
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

const appwriteClient = new Client();

appwriteClient.setEndpoint(env.APPWRITE_ENDPOINT)
  .setProject(env.APPWRITE_PROJECT_ID)
  .setKey(env.APPWRITE_API_TOKEN);

const github = new Octokit({ auth: env.GITHUB_TOKEN })


export { appwriteClient, s3Client, github }
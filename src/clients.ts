import { env } from "./env";
import { S3Client } from "@aws-sdk/client-s3";
import { Octokit } from "@octokit/rest";
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT!);

initializeApp({
  credential: cert(serviceAccount),
});

const firestoreClient = getFirestore();

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


const github = new Octokit({ auth: env.GITHUB_TOKEN })


export { firestoreClient, s3Client, github }
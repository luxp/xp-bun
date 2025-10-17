import { S3Client } from "bun";
const client = new S3Client({
  accessKeyId: "admin",
  secretAccessKey: "secretpassword",
  bucket: "xp-bucket",
  endpoint: "http://192.168.7.1:9000",
});

export const s3 = client;

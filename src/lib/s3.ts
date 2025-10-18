import { S3Client } from "bun";
import dayjs from "dayjs";

const client = new S3Client({
  accessKeyId: "admin",
  secretAccessKey: "secretpassword",
  bucket: "xp-bucket",
  endpoint: "http://192.168.7.1:9000",
});

export const s3 = client;

function generateS3FilePath(localFilePath: string) {
  const randomStr = Math.random().toString(36).substring(2, 15);
  const fileExtension = localFilePath.split(".").pop();
  return `${dayjs().format("YYYYMMDDHHmmss")}_${randomStr}.${fileExtension}`;
}

export async function uploadFileToS3(params: {
  localFilePath: string;
  s3Folder: string;
  s3FilePath?: string;
}) {
  let { localFilePath, s3FilePath, s3Folder } = params;
  s3FilePath = s3FilePath || generateS3FilePath(localFilePath);
  // 生成唯一的文件名

  const s3Path = `${s3Folder}/${s3FilePath}`;

  try {
    // 使用 S3Client 的 write 方法上传文件
    await s3.write(s3Path, Bun.file(localFilePath), {
      type: Bun.file(localFilePath).type,
    });

    return s3Path;
  } catch (error) {
    console.error("文件上传失败:", error);
    throw new Error("文件上传失败");
  }
}

import { s3 } from "@/lib/s3";

export default async function handler(params: {
  body: FormData;
}): Promise<{ filePath: string }> {
  const file = params.body.get("file") as File;

  if (!file) {
    throw new Error("没有上传文件");
  }

  // 生成唯一的文件名
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 15);
  const fileExtension = file.name.split(".").pop();
  const filePath = `videos/${timestamp}_${randomStr}.${fileExtension}`;

  try {
    // 使用 S3Client 的 write 方法上传文件
    await s3.write(filePath, file, {
      type: file.type,
    });

    // 返回文件访问 URL

    return { filePath };
  } catch (error) {
    console.error("文件上传失败:", error);
    throw new Error("文件上传失败");
  }
}

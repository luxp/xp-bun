import { s3 } from "@/lib/s3";
import { getTempPath } from "@/utils";
import {
  Canvas,
  CanvasRenderingContext2D,
  createCanvas,
  loadImage,
} from "canvas";
import ffmpeg from "fluent-ffmpeg";
import * as fs from "fs";
import * as path from "path";
import { getArgs } from "./utils";
// 移除 worker_threads 和 os 导入，改为单线程执行

// 类型定义
interface WatermarkConfig {
  width: number;
  height: number;
  threshold: number;
}

interface ProgressInfo {
  stage: string;
  progress: number;
}

interface VideoMetadata {
  streams: Array<{
    codec_type?: string;
    width?: number;
    height?: number;
    r_frame_rate?: string;
  }>;
  format: {
    duration?: number;
  };
}

// 移除 worker 相关类型定义

// 水印处理配置
const WATERMARK_CONFIG: WatermarkConfig = {
  width: 120, // 处理区域宽度
  height: 90, // 处理区域高度
  threshold: 40, // 像素亮度阈值
};

// 处理单个帧的函数
async function processFrame(
  framePath: string,
  width: number,
  height: number
): Promise<void> {
  const canvas: Canvas = createCanvas(width, height);
  const ctx: CanvasRenderingContext2D = canvas.getContext("2d");
  const image = await loadImage(framePath);

  // 绘制原始帧
  ctx.drawImage(image, 0, 0);

  // 获取图像数据
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  // 处理右下角区域
  for (let y = height - WATERMARK_CONFIG.height; y < height; y++) {
    for (let x = width - WATERMARK_CONFIG.width; x < width; x++) {
      const index = (y * width + x) * 4;
      const r: number = data[index] || 0;
      const g: number = data[index + 1] || 0;
      const b: number = data[index + 2] || 0;
      const avg: number = (r + g + b) / 3;

      if (avg > WATERMARK_CONFIG.threshold) {
        let rSum = 0,
          gSum = 0,
          bSum = 0;
        let darkCount = 0;

        // 收集周围深色像素
        for (let dy = -3; dy <= 3; dy++) {
          for (let dx = -3; dx <= 3; dx++) {
            if (
              x + dx >= 0 &&
              x + dx < width &&
              y + dy >= 0 &&
              y + dy < height
            ) {
              const neighborIndex: number = ((y + dy) * width + (x + dx)) * 4;
              const nr: number = data[neighborIndex] || 0;
              const ng: number = data[neighborIndex + 1] || 0;
              const nb: number = data[neighborIndex + 2] || 0;
              const navg: number = (nr + ng + nb) / 3;

              if (navg <= WATERMARK_CONFIG.threshold) {
                rSum += nr;
                gSum += ng;
                bSum += nb;
                darkCount++;
              }
            }
          }
        }

        if (darkCount > 0) {
          data[index] = rSum / darkCount;
          data[index + 1] = gSum / darkCount;
          data[index + 2] = bSum / darkCount;
        }
      }
    }
  }

  // 应用高斯模糊
  applyGaussianBlur(
    data,
    width,
    height,
    width - WATERMARK_CONFIG.width,
    height - WATERMARK_CONFIG.height,
    width,
    height
  );

  // 更新画布
  ctx.putImageData(imageData, 0, 0);

  // 保存处理后的帧
  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(framePath, buffer);
}

// 移除 worker 线程处理逻辑

/**
 * 去除视频右下角水印
 * @param videoPath - 输入视频路径
 * @param onProgress - 进度回调函数，参数为进度对象 { stage: string, progress: number }
 * @returns 返回处理后的视频路径
 */
async function removeWatermark(params: {
  s3VideoPath: string;
  outputPath: string;
  onProgress?: (progress: ProgressInfo) => void;
}): Promise<string> {
  let { s3VideoPath, outputPath, onProgress } = params;
  // 检查输入文件是否存在
  console.log(await s3.exists(s3VideoPath));
  if (!(await s3.file(s3VideoPath).exists())) {
    throw new Error("输入视频文件不存在");
  }

  // 使用 s3 下载 videoPath 到本地临时路径
  const localVideoPath = getTempPath(s3VideoPath);

  if (!fs.existsSync(localVideoPath)) {
    const downloadUrl = s3.presign(s3VideoPath, {
      expiresIn: 3600,
    });
    const response = await fetch(downloadUrl);
    const data = await response.arrayBuffer();
    fs.mkdirSync(path.dirname(localVideoPath), { recursive: true });
    fs.writeFileSync(localVideoPath, Buffer.from(data));
  }

  // 后续逻辑应使用 localVideoPath 作为输入
  let videoPath = localVideoPath;

  // 创建临时目录用于存储处理后的帧
  const tempDir = path.join(path.dirname(videoPath), "temp_frames");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  return new Promise<string>((resolve, reject) => {
    // 获取视频信息
    ffmpeg.ffprobe(videoPath, (err: Error | null, metadata: VideoMetadata) => {
      if (err) {
        reject(err);
        return;
      }

      const videoStream = metadata.streams.find(
        (s) => s.codec_type === "video"
      );

      if (
        !videoStream ||
        !videoStream.width ||
        !videoStream.height ||
        !videoStream.r_frame_rate
      ) {
        reject(new Error("未找到有效的视频流"));
        return;
      }

      const width: number = videoStream.width;
      const height: number = videoStream.height;
      const fps: number = eval(videoStream.r_frame_rate);
      const duration: number = metadata.format.duration || 0;

      // 提取视频帧
      ffmpeg(videoPath)
        .outputOptions(["-vf", "fps=" + fps, "-f", "image2"])
        .output(path.join(tempDir, "frame-%d.png"))
        .on("progress", (progress: any) => {
          if (onProgress) {
            onProgress({
              stage: "提取帧",
              progress: (progress.percent || 0) / 100,
            });
          }
        })
        .on("end", async () => {
          try {
            // 处理每一帧
            const frames = fs
              .readdirSync(tempDir)
              .filter(
                (file) => file.startsWith("frame-") && file.endsWith(".png")
              )
              .sort((a, b) => {
                const numA = parseInt(
                  a.replace("frame-", "").replace(".png", "")
                );
                const numB = parseInt(
                  b.replace("frame-", "").replace(".png", "")
                );
                return numA - numB;
              });

            // 单线程处理所有帧
            const framePaths: string[] = frames.map((frame: string) =>
              path.join(tempDir, frame)
            );

            // 逐个处理每一帧
            for (let i = 0; i < framePaths.length; i++) {
              const framePath: string | undefined = framePaths[i];
              if (framePath) {
                await processFrame(framePath, width, height);
              }

              // 更新进度
              if (onProgress) {
                onProgress({
                  stage: "处理帧",
                  progress: (i + 1) / framePaths.length,
                });
              }
            }

            // 将处理后的帧合成为视频
            ffmpeg()
              .input(path.join(tempDir, "frame-%d.png"))
              .inputOptions([`-framerate ${fps}`])
              .input(videoPath)
              .outputOptions([
                "-c:v",
                "libx264",
                "-preset",
                "veryslow",
                "-crf",
                "17",
                "-pix_fmt",
                "yuv420p",
                "-c:a",
                "copy",
                "-map",
                "0:v",
                "-map",
                "1:a",
              ])
              .output(outputPath)
              .on("progress", (progress: any) => {
                if (onProgress) {
                  onProgress({
                    stage: "合成视频",
                    progress: (progress.percent || 0) / 100,
                  });
                }
              })
              .on("end", () => {
                // 清理临时文件
                fs.rmSync(tempDir, { recursive: true, force: true });
                fs.rmSync(localVideoPath);
                resolve(outputPath);
              })
              .on("error", (err: Error) => {
                fs.rmSync(tempDir, { recursive: true, force: true });
                reject(err);
              })
              .run();
          } catch (error) {
            fs.rmSync(tempDir, { recursive: true, force: true });
            reject(error);
          }
        })
        .on("error", (err: Error) => {
          fs.rmSync(tempDir, { recursive: true, force: true });
          reject(err);
        })
        .run();
    });
  });
}

/**
 * 应用高斯模糊
 */
function applyGaussianBlur(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  startX: number,
  startY: number,
  endX: number,
  endY: number
): void {
  const tempData: Uint8ClampedArray = new Uint8ClampedArray(data);
  const radius: number = 12;
  const sigma: number = radius / 3;

  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      let rSum: number = 0,
        gSum: number = 0,
        bSum: number = 0,
        weightSum: number = 0;

      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const nx: number = x + dx;
          const ny: number = y + dy;

          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const weight: number = Math.exp(
              -(dx * dx + dy * dy) / (2 * sigma * sigma)
            );
            const index: number = (ny * width + nx) * 4;

            rSum += (tempData[index] || 0) * weight;
            gSum += (tempData[index + 1] || 0) * weight;
            bSum += (tempData[index + 2] || 0) * weight;
            weightSum += weight;
          }
        }
      }

      const index: number = (y * width + x) * 4;
      data[index] = rSum / weightSum;
      data[index + 1] = gSum / weightSum;
      data[index + 2] = bSum / weightSum;
    }
  }
}

const { s3VideoPath, outputPath } = getArgs();

if (s3VideoPath) {
  await removeWatermark({
    s3VideoPath,
    outputPath,
    onProgress: (progress: ProgressInfo) => {
      console.log(progress.stage, progress.progress);
    },
  });
} else {
  console.error("请提供视频路径");
  process.exit(1);
}

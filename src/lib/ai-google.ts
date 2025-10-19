const API_KEY = "AIzaSyBYl6rbjC9bpNsdwYZHrmz1htCU2LxBsrY";
import fs from "fs";

import { autoRetry } from "@/utils";
import { GoogleGenAI } from "@google/genai";
import path from "path";

const ai = new GoogleGenAI({
  apiKey: API_KEY,
});

export async function generateVideo(params: {
  prompt: string;
  downloadPath: string;
  model?: "veo-3.1-fast-generate-preview";
}) {
  // 下面的 API 巨贵，token 会被重复计算
  return;
  const {
    prompt,
    model = "veo-3.1-fast-generate-preview",
    downloadPath,
  } = params;

  let operation = await ai.models.generateVideos({
    model,
    prompt,
    config: {
      durationSeconds: 8,
    },
  });

  console.log("start polling");
  //   let operation: any = {
  //     name: "models/veo-3.1-fast-generate-preview/operations/1c1viaip0xqx",
  //   };
  // Poll the operation status until the video is ready.
  while (!operation.done) {
    console.log("Waiting for video generation to complete...");
    await new Promise((resolve) => setTimeout(resolve, 10000));
    console.log(JSON.stringify(operation));
    try {
      operation = await ai.operations.getVideosOperation({
        operation: operation,
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  const videoGenerated = operation.response?.generatedVideos?.[0]?.video;

  if (!videoGenerated) {
    throw new Error("No video generated");
  }

  console.log(videoGenerated);

  fs.mkdirSync(path.dirname(downloadPath), { recursive: true });

  await autoRetry(
    async () => {
      // Download the generated video.
      await ai.files.download({
        file: videoGenerated,
        downloadPath,
      });
    },
    5,
    1000
  );

  return downloadPath;
}

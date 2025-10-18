const API_KEY = "AIzaSyBYl6rbjC9bpNsdwYZHrmz1htCU2LxBsrY";

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: API_KEY,
});

export async function generateVideo(params: {
  prompt: string;
  downloadPath: string;
  model?: "veo-3.1-fast-generate-preview";
}) {
  const {
    prompt,
    model = "veo-3.1-fast-generate-preview",
    downloadPath,
  } = params;

  let operation = await ai.models.generateVideos({
    model,
    prompt,
  });

  // Poll the operation status until the video is ready.
  while (!operation.done) {
    console.log("Waiting for video generation to complete...");
    await new Promise((resolve) => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({
      operation: operation,
    });
  }

  if (!operation.response?.generatedVideos?.[0]?.video) {
    throw new Error("No video generated");
  }
  // Download the generated video.
  await ai.files.download({
    file: operation.response.generatedVideos[0].video,
    downloadPath,
  });

  return downloadPath;
}

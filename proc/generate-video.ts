import { generateVideo } from "@/lib/ai-google";
import { getArgs } from "./utils";

const { prompt, downloadPath } = getArgs();

if (prompt && downloadPath) {
  await generateVideo({
    prompt,
    downloadPath,
  });
} else {
  console.error("请提供提示词和下载路径");
  process.exit(1);
}

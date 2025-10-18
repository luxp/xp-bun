import { xpDB } from "@/lib/sqlite";
import { getTempPath } from "@/utils";
import { spawnProc } from "@proc/index";
import * as z from "zod";
import schema from "./schema";

export default async function handler(params: {
  body: z.infer<typeof schema.inputSchema>;
}): Promise<z.infer<typeof schema.outputSchema>> {
  const { prompt, aiModel, videoPath } = params.body;

  const id = Number(
    await xpDB.run(
      `INSERT INTO fireworks (prompt, aiModel, videoPath) VALUES (?, ?, ?)`,
      [prompt, aiModel, videoPath]
    ).lastInsertRowid
  );

  spawnProc("remove-veo", {
    s3VideoPath: videoPath,
    outputPath: getTempPath(`${id}_no_watermark.mp4`),
  }).then(async () => {
    const nowaterMarkS3Path = `${videoPath.replace(
      ".mp4",
      "_no_watermark.mp4"
    )}`;
    await xpDB.run(
      `UPDATE fireworks SET videoPathNoWatermark = ? WHERE id = ?`,
      [nowaterMarkS3Path, id]
    );
  });

  return { id };
}

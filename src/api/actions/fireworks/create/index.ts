import { uploadFileToS3 } from "@/lib/s3";
import { xpDB } from "@/lib/sqlite";
import { getTempPath } from "@/utils";
import { spawnProc } from "@proc/index";
import * as z from "zod";
import schema from "./schema";

export default async function handler(params: {
  body: z.infer<typeof schema.inputSchema>;
}): Promise<z.infer<typeof schema.outputSchema>> {
  const { prompt, aiModel } = params.body;

  const id = Number(
    await xpDB.run(`INSERT INTO fireworks (prompt, aiModel) VALUES (?, ?)`, [
      prompt,
      aiModel,
    ]).lastInsertRowid
  );

  spawnProc("generate-video", {
    prompt,
    downloadPath: getTempPath(`${id}.mp4`),
  }).then(async () => {
    const s3Path = await uploadFileToS3({
      localFilePath: getTempPath(`${id}.mp4`),
      s3Folder: "videos",
    });
    await xpDB.run(`UPDATE fireworks SET videoPath = ? WHERE id = ?`, [
      s3Path,
      id,
    ]);
    const nowaterMarkVideoPath = getTempPath(`${id}_no_watermark.mp4`);
    await spawnProc("remove-veo", {
      s3VideoPath: s3Path,
      outputPath: nowaterMarkVideoPath,
    });

    const nowaterMarkS3Path = `${s3Path.replace(".mp4", "_no_watermark.mp4")}`;
    await uploadFileToS3({
      localFilePath: nowaterMarkVideoPath,
      s3FilePath: nowaterMarkS3Path,
      s3Folder: "videos",
    });
    await xpDB.run(
      `UPDATE fireworks SET videoPathNoWatermark = ? WHERE id = ?`,
      [nowaterMarkS3Path, id]
    );
  });

  return { id };
}

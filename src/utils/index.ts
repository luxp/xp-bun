import path from "path";

export function getTempPath(fileName: string) {
  return path.join(import.meta.dirname, `../../temp/${fileName}`);
}

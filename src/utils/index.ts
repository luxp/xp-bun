import path from "path";

export function getTempPath(fileName: string) {
  return path.join(import.meta.dirname, `../../temp/${fileName}`);
}

export function autoRetry(
  fn: () => Promise<any>,
  maxRetries: number = 3,
  delay: number = 1000
) {
  fn().catch(async (error) => {
    console.error(error);
    if (maxRetries > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
      return autoRetry(fn, maxRetries - 1, delay);
    }
    throw error;
  });
}

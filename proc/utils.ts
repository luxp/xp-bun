import minimist from "minimist";

export function getArgs() {
  return minimist(process.argv.slice(2)) as Record<string, any>;
}

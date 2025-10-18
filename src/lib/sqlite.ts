import { Database } from "bun:sqlite";

export const xpDB = new Database(process.env.XP_SQLITE_DB_PATH);

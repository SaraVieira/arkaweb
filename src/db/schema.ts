import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const scores = sqliteTable("scores", {
  id: integer({ mode: "number" }).primaryKey({
    autoIncrement: true,
  }),
  name: text("name"),
  score: integer("score"),
  duration: integer("duration"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`,
  ),
});

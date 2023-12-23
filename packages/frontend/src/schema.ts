import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const person = sqliteTable("person", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    first_name: text("first_name").notNull(),
    last_name: text("last_name").notNull(),
});

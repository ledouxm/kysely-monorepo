import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { Kyselify } from "drizzle-orm/kysely";

export const personSchema = sqliteTable("person", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    first_name: text("first_name").notNull(),
    last_name: text("last_name").notNull(),
    age: integer("age"),
});
export type Person = Kyselify<typeof personSchema>;

export interface SharedDatabase {
    person: Person;
}

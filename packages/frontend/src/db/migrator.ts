import { Kysely, sql } from "kysely";
import type { SharedDatabase } from "../../../backend/src/schemas";
import { ofetch } from "ofetch";

import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql as drizzleSql } from "drizzle-orm";
import { Kyselify } from "drizzle-orm/kysely";

export class Migrator {
    constructor(public db: Kysely<Database>, public options: MigratorOptions) {}

    async initMigrationTable() {
        const tables = await this.db.introspection.getTables();
        if (tables.some((t) => t.name === "migration")) {
            return;
        }
        return this.db.schema
            .createTable("migration")
            .addColumn("name", "text", (c) => c.primaryKey())
            .addColumn("createdAt", "integer", (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
            .execute();
    }

    async dropDatabase() {
        const tables = await this.db.introspection.getTables();
        for (const table of tables) {
            await this.db.schema.dropTable(table.name).execute();
        }
    }

    async getMigrationsToExecute() {
        const existingMigrations = await this.getExitingMigrations();
        const migrationNames = await this.getRemoteMigrationsList();

        if (existingMigrations.some((em) => !migrationNames.includes(em.name))) {
            console.log("Database has migrations that are not present in the migrations folder");
            await this.dropDatabase();
            await this.migrate();
            return [];
        }

        const missingMigrationNames = migrationNames.filter((name) => {
            return !existingMigrations.some((em) => em.name === name);
        });

        if (missingMigrationNames.length === 0) {
            console.log("No migrations to execute");
        }

        const migrations = await Promise.all(
            missingMigrationNames.map(async (name) => {
                const migration = await this.getMigration(name);
                return { name, blob: migration };
            })
        );

        return migrations.sort((a, b) => a.name.localeCompare(b.name));
    }

    async getExitingMigrations() {
        return this.db.selectFrom("migration").selectAll().execute();
    }

    getRemoteMigrationsList() {
        return ofetch<string[]>(this.options.migrationsFolderUrl);
    }

    getMigration(name: string) {
        return ofetch<Blob>(this.options.migrationsFolderUrl + "/" + name);
    }

    async migrate() {
        await this.initMigrationTable();
        const migrations = await this.getMigrationsToExecute();

        for (const migration of migrations) {
            const sqlContent = await migration.blob.text();
            console.log("applying migration", migration.name);
            await this.db.transaction().execute(async (trx) => {
                await sql.raw(`${sqlContent}`).execute(trx);
                await trx.insertInto("migration").values({ name: migration.name }).execute();
            });
        }

        return migrations;
    }
}

interface MigratorOptions {
    migrationsFolderUrl: string;
}

export const migrationSchema = sqliteTable("migration", {
    name: text("name").primaryKey(),
    createdAt: integer("createdAt", { mode: "timestamp" })
        .notNull()
        .default(drizzleSql`CURRENT_TIMESTAMP`),
});

export type Migration = Kyselify<typeof migrationSchema>;
export interface Database extends SharedDatabase {
    migration: Migration;
}

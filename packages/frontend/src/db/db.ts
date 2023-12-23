import { Kysely } from "kysely";
import { WaSqliteWorkerDialect } from "kysely-wasqlite-worker";
import { Database, Migrator } from "./migrator";

const dialect = new WaSqliteWorkerDialect({
    fileName: "test.db",
});

const db = new Kysely<Database>({ dialect });

const migrator = new Migrator(db, {
    migrationsFolderUrl: `${import.meta.env.VITE_BACKEND_URL}/migrations`,
});

export const testDb = async () => {
    await migrator.migrate();
    return db.selectFrom("migration").selectAll().execute();
};

import { Kysely } from "kysely";
import { WaSqliteWorkerDialect } from "kysely-wasqlite-worker";
import { Database, Migrator } from "./migrator";

const dialect = new WaSqliteWorkerDialect({
    fileName: "test.db",
});

export const db = new Kysely<Database>({ dialect });

export const migrator = new Migrator(db, {
    migrationsFolderUrl: `${import.meta.env.VITE_BACKEND_URL}/migrations`,
});

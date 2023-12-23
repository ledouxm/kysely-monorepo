import { db, migrator } from "./db/db";

const main = async () => {
    await migrator.migrate();

    const tables = await db.introspection.getTables();
    console.log(tables);
};

main();

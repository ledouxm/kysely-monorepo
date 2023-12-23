# Typesafe synchronized SQLite db

The frontend package uses `kysely-wasqlite-worker` (which uses `wa-sqlite`) to store an SQLite database using either OPFS or indexedDb

The backend package uses `drizzle` to generate migrations from schema, and `fastify` to serve them to the frontend

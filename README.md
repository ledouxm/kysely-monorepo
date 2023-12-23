# Typesafe synchronized SQLite db

The frontend package uses `kysely-wasqlite-worker` (which uses `wa-sqlite`) to store an SQLite database using either OPFS or indexedDb

The backend package uses `drizzle` to generate migrations from schema, and `fastify` to serve them to the frontend

-   On load, the frontend fetches migrations list and executes missing ones.
-   If the frontend has migrations whose name is not on the backend migrations list, then it drops every table and executes every migration it finds

import fastify from "fastify";
import dotenv from "dotenv";
dotenv.config();
import path from "path";
import { promises as fs } from "fs";
import { registerViteHmrServerRestart } from "./hmr";
import fastifyStatic from "@fastify/static";
import cors from "@fastify/cors";

const port = Number(process.env.HTTP_PORT || 3000);

const router = fastify();
router.register(cors);
router.get("/", async () => {
    return "Hello world!";
});

const migrationFolder = path.join(process.cwd(), "drizzle");

router.register(fastifyStatic, {
    root: migrationFolder,
    prefix: "/migrations/",
    extensions: ["sql"],
});

router.get("/migrations", async () => {
    const list = await fs.readdir(migrationFolder);
    return list.filter((file) => file.endsWith(".sql")).sort((a, b) => a.localeCompare(b));
});

export const makeRouter = async () => {
    await router.listen({ port });

    registerViteHmrServerRestart(router);
    console.log(`Listening on port ${port}`);
};

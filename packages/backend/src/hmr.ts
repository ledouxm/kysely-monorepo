import { FastifyInstance } from "fastify";

export async function registerViteHmrServerRestart(server: FastifyInstance) {
    const hot = (import.meta as any).hot;
    if (hot) {
        await hot.data.stopping;
        // This is executed on file changed
        let reload = async () => {
            console.info("Performing an HMR reload...");
            await server.close();
        };
        hot.on("vite:beforeFullReload", async () => {
            const stopping = reload();
            reload = () => Promise.resolve();
            if (hot) hot.data.stopping = stopping;
        });
    }
}

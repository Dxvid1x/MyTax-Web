import { defineConfig, loadEnv } from "vite";
import { createLedgerHandler } from "./server/ledgerApi.ts";

export default defineConfig(({ mode }) => {
  const serverEnv = loadEnv(mode, process.cwd(), "");
  const handler = createLedgerHandler({
    env: { ...process.env, ...serverEnv },
  });
  return {
    plugins: [
      {
        name: "mytax-ledger-api",
        configureServer(server) {
          server.middlewares.use("/api/ledger", (req, res) => {
            void handler(req, res);
          });
        },
        configurePreviewServer(server) {
          server.middlewares.use("/api/ledger", (req, res) => {
            void handler(req, res);
          });
        },
      },
    ],
  };
});

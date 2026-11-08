import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import solidPlugin from "vite-plugin-solid";
import { mockReaper } from "./mock/reaper";

// `vite --mode mock` answers REAPER's requests itself (see mock/reaper.ts) instead of proxying them to a running REAPER.
export default defineConfig(({ mode }) => ({
  plugins: [
    solidPlugin(),
    tailwindcss(),
    viteSingleFile(),
    mode === "mock" && mockReaper(),
  ],
  server: {
    host: "0.0.0.0",
    port: 3000,
    proxy:
      mode === "mock"
        ? undefined
        : {
            "/_/": "http://127.0.0.1:8080",
          },
    open: "index.html",
  },
  build: {
    target: "esnext",
  },
}));

import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import solidPlugin from "vite-plugin-solid";

export default defineConfig({
  plugins: [solidPlugin(), viteSingleFile()],
  server: {
    host: "0.0.0.0",
    port: 3000,
    proxy: {
      "/_/": "http://127.0.0.1:8080",
    },
    open: "index.html",
  },
  build: {
    target: "esnext",
  },
});

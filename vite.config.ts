import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
  plugins: [solidPlugin(), viteSingleFile()],
  server: {
    host: "0.0.0.0",
    port: 3000,
    proxy: {
      "/_/": "http://127.0.0.1:8881",
    },
    open: "index.html",
  },
  build: {
    target: "esnext",
  },
});

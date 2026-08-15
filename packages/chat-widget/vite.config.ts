import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "SupportAI",
      formats: ["iife", "es"],
      fileName: (format) => (format === "iife" ? "widget.js" : "widget.mjs"),
    },
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
    minify: true,
    target: "es2020",
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
  // `vite preview` serves dist/ — demo HTML is copied there as index.html post-build
  preview: {
    port: 4173,
    strictPort: true,
  },
});

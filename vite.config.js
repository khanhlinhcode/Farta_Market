import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      api: path.resolve(__dirname, "src/api"),
      assets: path.resolve(__dirname, "src/assets"),
      component: path.resolve(__dirname, "src/component"),
      hooks: path.resolve(__dirname, "src/hooks"),
      pages: path.resolve(__dirname, "src/pages"),
      style: path.resolve(__dirname, "src/style"),
      utils: path.resolve(__dirname, "src/utils"),
    },
  },
  envPrefix: ["VITE_", "REACT_APP_"],
  build: {
    outDir: "build",
    emptyOutDir: true,
  },
  test: {
    globals: true,
    environment: "jsdom",
    exclude: ["node_modules/**", "tests/e2e/**"],
  },
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig(async () => {
  const { visualizer } = await import("rollup-plugin-visualizer");

  return {
    plugins: [
      react(),
      visualizer({
        filename: "stats.html",
        template: "treemap",
        gzipSize: true,
        brotliSize: true,
      }),
    ],
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
      rollupOptions: {
        output: {
          manualChunks(id) {
            const normalizedId = id.replace(/\\/g, "/");

            if (!normalizedId.includes("/node_modules/")) {
              return undefined;
            }

            if (
              normalizedId.includes("/node_modules/react/") ||
              normalizedId.includes("/node_modules/react-dom/") ||
              normalizedId.includes("/node_modules/react-router") ||
              normalizedId.includes("/node_modules/scheduler/")
            ) {
              return "vendor-react";
            }

            if (
              normalizedId.includes("/node_modules/@reduxjs/toolkit/") ||
              normalizedId.includes("/node_modules/react-redux/") ||
              normalizedId.includes("/node_modules/redux/") ||
              normalizedId.includes("/node_modules/reselect/")
            ) {
              return "vendor-redux";
            }

            if (normalizedId.includes("/node_modules/@tanstack/react-query/")) {
              return "vendor-query";
            }

            if (
              normalizedId.includes("/node_modules/i18next/") ||
              normalizedId.includes("/node_modules/i18next-browser-languagedetector/") ||
              normalizedId.includes("/node_modules/react-i18next/")
            ) {
              return "vendor-i18n";
            }

            if (
              normalizedId.includes("/node_modules/axios/") ||
              normalizedId.includes("/node_modules/lodash.debounce/") ||
              normalizedId.includes("/node_modules/dompurify/")
            ) {
              return "vendor-utils";
            }

            if (
              normalizedId.includes("/node_modules/react-hot-toast/") ||
              normalizedId.includes("/node_modules/react-icons/") ||
              normalizedId.includes("/node_modules/react-multi-carousel/") ||
              normalizedId.includes("/node_modules/react-tabs/")
            ) {
              return "vendor-ui";
            }

            return "vendor";
          },
        },
      },
    },
    test: {
      globals: true,
      environment: "jsdom",
      exclude: ["node_modules/**", "tests/e2e/**"],
    },
  };
});

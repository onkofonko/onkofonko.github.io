import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import checker from "vite-plugin-checker";
import compression from "vite-plugin-compression";
import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    babel({
      presets: [reactCompilerPreset()],
    }),
    tailwindcss(),
    checker({
      typescript: {
        tsconfigPath: "./tsconfig.app.json",
      },
      overlay: {
        initialIsOpen: false,
        position: "br",
      },
      terminal: true,
      enableBuild: false,
    }),
    compression({
      algorithm: "brotliCompress",
      ext: ".br",
      threshold: 10240,
    }),
    mode === "analyze" &&
      visualizer({
        open: true,
        gzipSize: true,
        brotliSize: true,
      }),
  ].filter(Boolean),

  build: {
    minify: true,
    cssCodeSplit: true,
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes("motion") && id.includes("node_modules"))
            return "vendor-motion";
          if (id.includes("ogl") && id.includes("node_modules"))
            return "vendor-ogl";
          if (id.includes("react") && id.includes("node_modules"))
            return "vendor-react";
          if (id.includes("lucide-react") && id.includes("node_modules"))
            return "vendor-icons";
          if (id.includes("node_modules")) return "vendor";
        },
      },
    },
  },
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    warmup: {
      clientFiles: ["./src/main.tsx", "./src/App.tsx", "./src/index.css"],
    },
  },
}));

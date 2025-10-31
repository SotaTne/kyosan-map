import path from "path";
import { fileURLToPath } from "url";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    threads: false,
    isolate: true,
    globals: true,
    environment: "node",
    include: ["**/*.spec.ts", "**/*.test.ts"],
    exclude: ["node_modules", "dist", ".next", "coverage"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      exclude: [
        "**/node_modules/**",
        "**/dist/**",
        "**/coverage/**",
        "**/*.d.ts",
      ],
    },
    clearMocks: true,
    restoreMocks: true,
    server: {
      deps: {
        inline: ["@kyosan-map/shared"],
      },
    },
  },
  resolve: {
    alias: {
      "@kyosan-map/shared": path.resolve(__dirname, "../../packages/shared"),
    },
    extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json"],
  },
  json: {
    stringify: false,
  },
});

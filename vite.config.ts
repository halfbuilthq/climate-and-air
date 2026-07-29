import { defineConfig } from "vitest/config";

export default defineConfig({
  publicDir: false,
  build: {
    lib: {
      entry: "src/climate-air-card.ts",
      name: "ClimateAirCard",
      formats: ["es"],
      fileName: () => "climate-air-card.js"
    },
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
    minify: "esbuild",
    rollupOptions: {
      output: {
        inlineDynamicImports: true
      }
    }
  },
  test: {
    include: ["tests/**/*.test.ts"]
  }
});

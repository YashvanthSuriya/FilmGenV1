import type { ESBuildOptions } from "vite"
import { defineConfig } from "vitest/config"

export default defineConfig({
  oxc: false,
  esbuild: {
    jsx: "automatic"
  } as unknown as ESBuildOptions,
  test: {
    environment: "jsdom",
    globals: true,
    include: ["tests/**/*.test.ts"]
  },
  resolve: {
    alias: {
      "@": new URL(".", import.meta.url).pathname
    }
  }
})

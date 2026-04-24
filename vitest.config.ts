import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: [
      "src/**/*.{test,spec}.{ts,tsx}",
      "lib/**/*.{test,spec}.{ts,tsx}",
      "prisma/**/*.{test,spec}.{ts,tsx}",
    ],
    exclude: ["node_modules", ".next", "dist"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/lib": path.resolve(__dirname, "./lib"),
    },
  },
});

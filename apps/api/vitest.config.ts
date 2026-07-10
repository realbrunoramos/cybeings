import { defineConfig } from "vitest/config";

export default defineConfig({
  // The source uses NodeNext-style ".js" extensions in relative imports. Vite
  // does not rewrite ".js" -> ".ts" by default, so strip the extension from
  // relative specifiers and let Vite resolve the real ".ts" file.
  resolve: {
    alias: [{ find: /^(\.{1,2}\/.*)\.js$/, replacement: "$1" }],
  },
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
    setupFiles: ["./test/setup.ts"],
  },
});

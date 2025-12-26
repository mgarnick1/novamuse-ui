import { defineConfig } from 'vitest/config' 
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    sourcemap: true, // enables proper file/line mapping
  },
  preview: {
    port: 5173,
    strictPort: true, // fail instead of picking a random port
  },
  test: {
    globals: true, // Allows describe/it/expect without imports
    environment: "jsdom", // Required for React component testing
    setupFiles: "./src/setupTests.ts", // We'll create this next
    css: true, // Handles Tailwind/CSS Modules in tests
    coverage: {
      provider: "v8", // Or 'istanbul' if you prefer
      reporter: ["text", "html", "lcov"],
      exclude: ["node_modules/", "src/setupTests.ts", "**/*.d.ts"],
    },
  },
});

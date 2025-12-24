import { defineConfig } from "vite";
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
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    cors: false, // Disable Vite's default CORS to avoid conflicts with backend CORS
  },
  optimizeDeps: {
    exclude: ["pyodide"], // Exclude pyodide from Vite's dependency optimization
  },
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  server: {
    // 👇 correct Vite option for SPA routing
    fs: {
      allow: [".."],
    },
  },
  build: {
    outDir: "dist",
  },
  // 👇 This handles React Router routes during dev and after build
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  preview: {
    // for `vite preview` or Cloudflare deployment
    open: true,
  },
});

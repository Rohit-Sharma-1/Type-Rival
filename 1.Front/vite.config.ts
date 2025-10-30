import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

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
      "@": "/src",
    },
  },
  preview: {
    // for `vite preview` or Cloudflare deployment
    open: true,
  },
});

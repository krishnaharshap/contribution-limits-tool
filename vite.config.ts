import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Deployed at https://krishnaharshap.github.io/contribution-limits-tool/,
// so every asset path must resolve under this sub-path, not the domain root.
export default defineConfig({
  base: "/contribution-limits-tool/",
  plugins: [react()],
  // Bind IPv4 loopback explicitly: this host's default binds ::1 only,
  // which Playwright's webServer health check (127.0.0.1) can't reach.
  server: { host: "127.0.0.1" },
  preview: { host: "127.0.0.1" },
});

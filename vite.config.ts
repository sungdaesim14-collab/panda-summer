import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vercel은 도메인 루트('/')에 배포하므로 base 설정이 필요 없다.
export default defineConfig({
  plugins: [react()],
  server: { port: 5180, host: true },
});

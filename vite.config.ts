import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages는 https://<계정>.github.io/<저장소>/ 아래에 올라간다.
// 그래서 배포 빌드에서는 자산 경로 앞에 저장소 이름을 붙여야 한다.
// 로컬 개발(npm run dev)에서는 루트('/')를 쓴다.
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/panda-summer/" : "/",
  plugins: [react()],
  server: { port: 5180, host: true },
}));

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/tokens.css";
import { App } from "./App";
import { registerSupabaseFactory } from "./data/store";
import { SupabaseStore } from "./data/supabaseStore";
import { startAutoUpdate } from "./data/autoUpdate";

// 서버 자격증명(.env)이 있으면 store가 이 팩토리로 Supabase를 켠다.
registerSupabaseFactory((url, key) => new SupabaseStore(url, key));

// 새 배포가 나오면 다음 접속 때 자동으로 최신 버전을 받는다 (캐시 문제 방지)
startAutoUpdate();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

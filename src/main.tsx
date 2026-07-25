import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/tokens.css";
import { App } from "./App";
import { registerSupabaseFactory } from "./data/store";
import { SupabaseStore } from "./data/supabaseStore";

// 서버 자격증명(.env)이 있으면 store가 이 팩토리로 Supabase를 켠다.
registerSupabaseFactory((url, key) => new SupabaseStore(url, key));

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

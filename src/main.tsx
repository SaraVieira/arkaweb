import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Game } from "./Game";
import "./styles.css";

const root = document.getElementById("app");
if (!root) throw new Error("#app not found");

createRoot(root).render(
  <StrictMode>
    <Game />
  </StrictMode>,
);

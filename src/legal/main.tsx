import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../styles/global.css";
import "./legal.css";
import { Datenschutz, Impressum } from "./Legal";

const root = document.getElementById("root")!;
const Page = root.dataset.page === "datenschutz" ? Datenschutz : Impressum;

createRoot(root).render(
  <StrictMode>
    <Page />
  </StrictMode>,
);

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import "./App.css";
import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error(
    'Root element not found. Please check index.html for <div id="root"></div>.'
  );
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
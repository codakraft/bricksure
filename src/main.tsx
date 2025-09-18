import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Provider } from "react-redux";
import { store } from "./store/store";

// Start MSW in development mode when no API URL is set
if (import.meta.env.DEV && !import.meta.env.VITE_API_URL) {
  const { worker } = await import("./mocks/browser");
  worker.start();
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
);

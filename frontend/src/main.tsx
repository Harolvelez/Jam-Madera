import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// 👉 estilos globales de Mantine
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

// 👉 Mantine
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MantineProvider defaultColorScheme="light">
      {/* 🔔 NOTIFICACIONES GLOBALES */}
      <Notifications position="top-right" />

      <App />
    </MantineProvider>
  </React.StrictMode>
);

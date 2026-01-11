import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// 👉 estilos globales de Mantine
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

// 👉 Mantine
import { MantineProvider, createTheme } from "@mantine/core";
import { Notifications } from "@mantine/notifications";

// ✅ Tema global: cambia azul por naranja
const theme = createTheme({
  primaryColor: "orange", // 👈 aquí está el cambio global
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="light">
      {/* 🔔 NOTIFICACIONES GLOBALES */}
      <Notifications position="top-right" />

      <App />
    </MantineProvider>
  </React.StrictMode>
);

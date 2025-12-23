import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";

const IDLE_LIMIT_MINUTES = 10; // ⬅️ cambia aquí el tiempo
const IDLE_LIMIT_MS = IDLE_LIMIT_MINUTES * 60 * 1000;

export default function AuthGuard() {
  const location = useLocation();
  const token = localStorage.getItem("token");

  // ✅ si no hay token => fuera
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // ✅ validar inactividad
  const last = Number(localStorage.getItem("last_activity") || "0");
  const now = Date.now();

  if (!last || now - last > IDLE_LIMIT_MS) {
    // expiró
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("last_activity");
    return <Navigate to="/" replace />;
  }

  // ✅ actualizar "last_activity" al navegar
  useEffect(() => {
    localStorage.setItem("last_activity", Date.now().toString());
  }, [location.pathname]);

  // ✅ actualizar por actividad del usuario (click, teclado, mouse)
  useEffect(() => {
    const touch = () => localStorage.setItem("last_activity", Date.now().toString());

    window.addEventListener("click", touch);
    window.addEventListener("mousemove", touch);
    window.addEventListener("keydown", touch);
    window.addEventListener("scroll", touch);

    return () => {
      window.removeEventListener("click", touch);
      window.removeEventListener("mousemove", touch);
      window.removeEventListener("keydown", touch);
      window.removeEventListener("scroll", touch);
    };
  }, []);

  return <Outlet />;
}

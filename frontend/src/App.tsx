import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

import Login from "./pages/login";
import Dashboard from "./pages/Dashboard";
import DashboardHome from "./pages/DashboardHome";

// Órdenes
import CreateOrderPage from "./pages/orders/CreateOrderPage";
import OrdersListPage from "./pages/orders/OrdersListPage";
import OrderDetailPage from "./pages/orders/OrderDetailPage";
import OrderEditPage from "./pages/orders/OrderEditPage";

// Usuarios
import UsersListPage from "./pages/users/UsersListPage";
import CreateUserPage from "./pages/users/CreateUserPage";
import EditUserPage from "./pages/users/EditUserPage";

// Páginas adicionales
import EstadosOrdenes from "./pages/EstadosOrdenes";
import AuditDashboard from "./pages/AuditDashboard";
import OrdersCalendar from "./components/OrdersCalendar";
import CreateClient from "./pages/CreateClient";

// Utilitarios
import PrintOrderPage from "./pages/print/PrintOrderPage";

// 🔒 Componentes de seguridad (MANTENER ESTOS)
import AuthGuard from "./components/AuthGuard";
import RoleGuard from "./components/RoleGuard";

import { PERMISSIONS } from "./config/permissions";

// Importar estilos de Mantine
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* =====================
            RUTAS PÚBLICAS
        ====================== */}
        <Route path="/" element={<Login />} />
        <Route path="/print/order/:id" element={<PrintOrderPage />} />

        {/* =====================
            RUTAS PRIVADAS
            🔒 PROTEGIDAS POR AuthGuard
        ====================== */}
        <Route element={<AuthGuard />}>
          <Route path="/dashboard" element={<Dashboard />}>
            {/* HOME */}
            <Route index element={<DashboardHome />} />

            {/* =====================
                DASHBOARD/AUDITORÍA
                🔐 Solo Admin, Gerente
            ====================== */}
            <Route element={<RoleGuard allowedRoles={PERMISSIONS.DASHBOARD} />}>
              <Route path="auditoria" element={<AuditDashboard />} />
            </Route>

            {/* =====================
                ÓRDENES
                🔐 Admin, Gerente, Ventas
            ====================== */}
            <Route element={<RoleGuard allowedRoles={PERMISSIONS.ORDERS} />}>
              <Route path="orders" element={<Outlet />}>
                <Route path="OrderList" element={<OrdersListPage />} />
                <Route path="CreateOrder" element={<CreateOrderPage />} />
                <Route path="Detail/:id" element={<OrderDetailPage />} />
                <Route path="edit/:id" element={<OrderEditPage />} />
              </Route>

              {/* Rutas alternativas/compatibilidad */}
              <Route path="ordenes">
                <Route path="crear" element={<CreateOrderPage />} />
              </Route>
            </Route>

            {/* =====================
                ESTADO DE ÓRDENES
                🔐 TODOS los roles
            ====================== */}
            <Route element={<RoleGuard allowedRoles={PERMISSIONS.ORDER_STATUS} />}>
              <Route path="order-status" element={<div>Estado de órdenes</div>} />
              
              {/* Rutas alternativas */}
              <Route path="ordenes">
                <Route path="estados" element={<EstadosOrdenes />} />
                <Route path="calendario" element={<OrdersCalendar />} />
              </Route>
            </Route>

            {/* =====================
                CLIENTES
                🔐 Admin, Gerente, Ventas
            ====================== */}
            <Route element={<RoleGuard allowedRoles={PERMISSIONS.CLIENTS} />}>
              <Route path="clientes" element={<CreateClient />} />
            </Route>

            {/* =====================
                AGENDA Y ALERTAS
                🔐 Admin, Gerente, Ventas
            ====================== */}
            <Route element={<RoleGuard allowedRoles={PERMISSIONS.AGENDA_ALERTS} />}>
              <Route path="agenda" element={<div>Agenda</div>} />
              <Route path="alertas" element={<div>Alertas</div>} />
            </Route>

            {/* =====================
                USUARIOS
                🔐 Solo Admin, Gerente
            ====================== */}
            <Route element={<RoleGuard allowedRoles={PERMISSIONS.USERS} />}>
              <Route path="usuarios" element={<Outlet />}>
                <Route index element={<UsersListPage />} />
                <Route path="crear" element={<CreateUserPage />} />
                <Route path="editar/:id" element={<EditUserPage />} />
              </Route>
            </Route>

          </Route>
        </Route>

        {/* =====================
            RUTA 404 (opcional)
        ====================== */}
        <Route path="*" element={<div>Página no encontrada</div>} />
      </Routes>
    </BrowserRouter>
  );
}
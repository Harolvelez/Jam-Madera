import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

import Login from "./pages/login";
import Dashboard from "./pages/Dashboard";
import DashboardHome from "./pages/DashboardHome";

import CreateOrderPage from "./pages/orders/CreateOrderPage";
import OrdersListPage from "./pages/orders/OrdersListPage";
import OrderDetailPage from "./pages/orders/OrderDetailPage";
import OrderEditPage from "./pages/orders/OrderEditPage";

import UsersListPage from "./pages/users/UsersListPage";
import CreateUserPage from "./pages/users/CreateUserPage";
import EditUserPage from "./pages/users/EditUserPage";

import PrintOrderPage from "./pages/print/PrintOrderPage";

import AuthGuard from "./components/AuthGuard";
import RoleGuard from "./components/RoleGuard";
import { PERMISSIONS } from "./config/permissions";

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
        ====================== */}
        <Route element={<AuthGuard />}>
          <Route path="/dashboard" element={<Dashboard />}>
            {/* HOME */}
            <Route index element={<DashboardHome />} />

            {/* =====================
                ÓRDENES
                Admin, Gerente, Ventas
            ====================== */}
            <Route element={<RoleGuard allowedRoles={PERMISSIONS.ORDERS} />}>
              <Route path="orders" element={<Outlet />}>
                <Route path="OrderList" element={<OrdersListPage />} />
                <Route path="CreateOrder" element={<CreateOrderPage />} />
                <Route path="Detail/:id" element={<OrderDetailPage />} />
                <Route path="edit/:id" element={<OrderEditPage />} />
              </Route>
            </Route>

            {/* =====================
                ESTADO DE ÓRDENES
                TODOS
            ====================== */}
            <Route element={<RoleGuard allowedRoles={PERMISSIONS.ORDER_STATUS} />}>
              <Route path="order-status" element={<div>Estado de órdenes</div>} />
            </Route>

            {/* =====================
                AGENDA Y ALERTAS
                Admin, Gerente, Ventas
            ====================== */}
            <Route element={<RoleGuard allowedRoles={PERMISSIONS.AGENDA_ALERTS} />}>
              <Route path="agenda" element={<div>Agenda</div>} />
              <Route path="alertas" element={<div>Alertas</div>} />
            </Route>

            {/* =====================
                USUARIOS
                Admin, Gerente
            ====================== */}
            <Route element={<RoleGuard allowedRoles={PERMISSIONS.USERS} />}>
              <Route path="usuarios" element={<Outlet />}>
                {/* Lista de usuarios */}
                <Route index element={<UsersListPage />} />

                {/* Crear usuario */}
                <Route path="crear" element={<CreateUserPage />} />

                {/* Editar usuario */}
                <Route path="editar/:id" element={<EditUserPage />} />
              </Route>
            </Route>

          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

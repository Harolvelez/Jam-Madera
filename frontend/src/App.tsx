import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Login from "./pages/login";
import Dashboard from "./pages/Dashboard";
import DashboardHome from "./pages/DashboardHome";
import CreateOrderPage from "./pages/orders/CreateOrderPage";
import OrdersListPage from "./pages/orders/OrdersListPage";
import OrderDetailPage from "./pages/orders/OrderDetailPage";
import OrderEditPage from "./pages/orders/OrderEditPage";
import PrintOrderPage from "./pages/print/PrintOrderPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* LOGIN */}
        <Route path="/" element={<Login />} />

        {/* 🔵 VISTA DE IMPRESIÓN (SIN DASHBOARD) */}
        <Route path="/print/order/:id" element={<PrintOrderPage />} />

        {/* DASHBOARD */}
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<DashboardHome />} />

          <Route path="orders" element={<Outlet />}>
            <Route path="OrderList" element={<OrdersListPage />} />
            <Route path="CreateOrder" element={<CreateOrderPage />} />
            <Route path="Detail/:id" element={<OrderDetailPage />} />
            <Route path="edit/:id" element={<OrderEditPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

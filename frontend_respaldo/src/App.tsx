import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Dashboard from "./pages/Dashboard";
import CreateOrderPage from "./pages/CreateOrderPage";
import EstadosOrdenes from "./pages/EstadosOrdenes";
import AuditDashboard from "./pages/AuditDashboard";
import OrdersCalendar from "./components/OrdersCalendar";
import CreateClient from "./pages/CreateClient";
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Página de login */}
        <Route path="/" element={<Login />} />

        {/* Página Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Crear Orden */}
        <Route path="/dashboard/ordenes/crear" element={<CreateOrderPage />} />
        
        {/* Estado de ordenes */}
        <Route path="/dashboard/ordenes/estados" element={<EstadosOrdenes />} />

        {/* Auditoria */}
        <Route path="/dashboard/auditoria" element={<AuditDashboard />} />

        {/* Calendario */}
        <Route path="/dashboard/ordenes/calendario" element={<OrdersCalendar />} />

        {/* Crear Usuario*/}
        <Route path="/dashboard/clientes" element={<CreateClient />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
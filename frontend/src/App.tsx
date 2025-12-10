import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Dashboard from "./pages/Dashboard";
import CreateOrderPage from "./pages/CreateOrderPage";


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
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;
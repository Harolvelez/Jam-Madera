import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/login";

function App() {
  return (
    <Router>
      <Routes>
        {/* Página de Login */}
        <Route path="/" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;

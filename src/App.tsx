import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Products from "./pages/Products";
import Settings from "./pages/Settings";
import Login from "./pages/Login";

import { useAuthStore } from "./store/useAuthStore";

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
            borderRadius: "8px",
          },
          success: {
            style: {
              background: "#10b981",
            },
          },
          error: {
            style: {
              background: "#ef4444",
            },
          },
        }}
      />

      <Routes>
        <Route
          path="/login"
          element={!isAuthenticated ? <Login /> : <Navigate to="/" />}
        />
        <Route
          path="/"
          element={!isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/orders"
          element={!isAuthenticated ? <Orders /> : <Navigate to="/login" />}
        />
        <Route
          path="/products"
          element={!isAuthenticated ? <Products /> : <Navigate to="/login" />}
        />
        <Route
          path="/settings"
          element={!isAuthenticated ? <Settings /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}

export default App;

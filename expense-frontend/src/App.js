import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ExpenseProvider } from "./context/ExpenseContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AddExpense from "./pages/AddExpense";
import AddIncome from "./pages/AddIncome";
import ExpenseHistory from "./pages/ExpenseHistory";
import Budget from "./pages/Budget";
import Bills from "./pages/Bills";
import Analytics from "./pages/Analytics";
import MonthlyReport from "./pages/MonthlyReport";
import Notifications from "./pages/Notifications";

import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import CategoryManagement from "./pages/admin/CategoryManagement";
import SystemAnalytics from "./pages/admin/SystemAnalytics";

function RootRedirect() {
  const { user } = useAuth();
  if (user) return <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />;
  return <Login />;
}

function App() {
  return (
    <AuthProvider>
      <ExpenseProvider>
        <Router>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/register" element={<Register />} />

            <Route path="/dashboard"      element={<ProtectedRoute role="user"><Dashboard /></ProtectedRoute>} />
            <Route path="/add-expense"    element={<ProtectedRoute role="user"><AddExpense /></ProtectedRoute>} />
            <Route path="/income"         element={<ProtectedRoute role="user"><AddIncome /></ProtectedRoute>} />
            <Route path="/history"        element={<ProtectedRoute role="user"><ExpenseHistory /></ProtectedRoute>} />
            <Route path="/budget"         element={<ProtectedRoute role="user"><Budget /></ProtectedRoute>} />
            <Route path="/bills"          element={<ProtectedRoute role="user"><Bills /></ProtectedRoute>} />
            <Route path="/analytics"      element={<ProtectedRoute role="user"><Analytics /></ProtectedRoute>} />
            <Route path="/monthly-report" element={<ProtectedRoute role="user"><MonthlyReport /></ProtectedRoute>} />
            <Route path="/notifications"  element={<ProtectedRoute role="user"><Notifications /></ProtectedRoute>} />

            <Route path="/admin"            element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/users"      element={<ProtectedRoute role="admin"><UserManagement /></ProtectedRoute>} />
            <Route path="/admin/categories" element={<ProtectedRoute role="admin"><CategoryManagement /></ProtectedRoute>} />
            <Route path="/admin/analytics"  element={<ProtectedRoute role="admin"><SystemAnalytics /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ExpenseProvider>
    </AuthProvider>
  );
}

export default App;
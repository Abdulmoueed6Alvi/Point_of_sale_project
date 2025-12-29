import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import Products from './pages/Products';
import Sales from './pages/Sales';
import NewSale from './pages/NewSale';
import Inventory from './pages/Inventory';
import Invoices from './pages/Invoices';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Employees from './pages/Employees';
import CashierPOS from './pages/CashierPOS';
import Categories from './pages/Categories';
import Layout from './components/Layout';
import './App.css';

// Private route - requires authentication
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return user ? children : <Navigate to="/login" />;
};

// Role-based route protection
const RoleRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!allowedRoles.includes(user?.role)) {
    // Redirect based on role
    if (user?.role === 'cashier') {
      return <Navigate to="/pos" />;
    }
    return <Navigate to="/" />;
  }

  return children;
};

// Home redirect based on role - each role gets their own dashboard
const HomeRedirect = () => {
  const { user } = useAuth();

  if (user?.role === 'cashier') {
    return <Navigate to="/pos" replace />;
  }

  if (user?.role === 'manager') {
    return <ManagerDashboard />;
  }

  // Admin gets the full dashboard
  return <Dashboard />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<HomeRedirect />} />
        <Route path="pos" element={<CashierPOS />} />
        <Route path="products" element={
          <RoleRoute allowedRoles={['admin', 'manager']}>
            <Products />
          </RoleRoute>
        } />
        <Route path="sales" element={<Sales />} />
        <Route path="sales/new" element={<NewSale />} />
        <Route path="inventory" element={
          <RoleRoute allowedRoles={['admin', 'manager']}>
            <Inventory />
          </RoleRoute>
        } />
        <Route path="invoices" element={<Invoices />} />
        <Route path="reports" element={
          <RoleRoute allowedRoles={['admin', 'manager']}>
            <Reports />
          </RoleRoute>
        } />
        <Route path="employees" element={
          <RoleRoute allowedRoles={['admin']}>
            <Employees />
          </RoleRoute>
        } />
        <Route path="categories" element={
          <RoleRoute allowedRoles={['admin', 'manager']}>
            <Categories />
          </RoleRoute>
        } />
        <Route path="settings" element={
          <RoleRoute allowedRoles={['admin', 'manager']}>
            <Settings />
          </RoleRoute>
        } />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;

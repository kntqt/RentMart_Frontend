import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Public Pages
import Landing from './pages/public/Landing';
import Login from './pages/public/Login';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminRenters from './pages/admin/Renters';
import AdminSpaces from './pages/admin/Spaces';
import AdminTransactions from './pages/admin/Transactions';
import AdminReports from './pages/admin/Reports';

// Staff Pages
import StaffDashboard from './pages/staff/Dashboard';
import StaffSpaces from './pages/staff/Spaces';
import StaffBilling from './pages/staff/Billing';
import StaffPayments from './pages/staff/Payments';

// Renter Pages
import RenterDashboard from './pages/renter/Dashboard';
import RenterAvailedSpace from './pages/renter/AvailedSpace';
import RenterSpaces from './pages/renter/Spaces';
import RenterTransactions from './pages/renter/Transactions';

// Shared
import ProfilePage from './pages/shared/ProfilePage';

// Protected Route Guard Wrapper
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center font-bold">
        Loading RentMart CSS Portal...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'staff') return <Navigate to="/staff/dashboard" replace />;
    if (user.role === 'renter') return <Navigate to="/renter/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/renters" element={<ProtectedRoute allowedRoles={['admin']}><AdminRenters /></ProtectedRoute>} />
      <Route path="/admin/spaces" element={<ProtectedRoute allowedRoles={['admin']}><AdminSpaces /></ProtectedRoute>} />
      <Route path="/admin/transactions" element={<ProtectedRoute allowedRoles={['admin']}><AdminTransactions /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><AdminReports /></ProtectedRoute>} />
      <Route path="/admin/profile" element={<ProtectedRoute allowedRoles={['admin']}><ProfilePage /></ProtectedRoute>} />

      {/* Staff Routes */}
      <Route path="/staff/dashboard" element={<ProtectedRoute allowedRoles={['staff']}><StaffDashboard /></ProtectedRoute>} />
      <Route path="/staff/renters" element={<ProtectedRoute allowedRoles={['staff']}><AdminRenters /></ProtectedRoute>} />
      <Route path="/staff/spaces" element={<ProtectedRoute allowedRoles={['staff']}><StaffSpaces /></ProtectedRoute>} />
      <Route path="/staff/payments" element={<ProtectedRoute allowedRoles={['staff']}><StaffPayments /></ProtectedRoute>} />
      <Route path="/staff/billing" element={<ProtectedRoute allowedRoles={['staff']}><StaffBilling /></ProtectedRoute>} />
      <Route path="/staff/profile" element={<ProtectedRoute allowedRoles={['staff']}><ProfilePage /></ProtectedRoute>} />

      {/* Renter Routes */}
      <Route path="/renter/dashboard" element={<ProtectedRoute allowedRoles={['renter']}><RenterDashboard /></ProtectedRoute>} />
      <Route path="/renter/availed_space" element={<ProtectedRoute allowedRoles={['renter']}><RenterAvailedSpace /></ProtectedRoute>} />
      <Route path="/renter/spaces" element={<ProtectedRoute allowedRoles={['renter']}><RenterSpaces /></ProtectedRoute>} />
      <Route path="/renter/transactions" element={<ProtectedRoute allowedRoles={['renter']}><RenterTransactions /></ProtectedRoute>} />
      <Route path="/renter/profile" element={<ProtectedRoute allowedRoles={['renter']}><ProfilePage /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

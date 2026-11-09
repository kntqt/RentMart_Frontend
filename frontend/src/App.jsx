import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Public Pages (Static imports for instant zero-lag navigation)
import Landing from './pages/public/Landing';
import Login from './pages/public/Login';
import Register from './pages/public/Register';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminRenters from './pages/admin/Renters';
import AdminSpaces from './pages/admin/Spaces';
import AdminTransactions from './pages/admin/Transactions';
import AdminReports from './pages/admin/Reports';

// Staff Pages
import StaffDashboard from './pages/staff/Dashboard';
import StaffCreateRenter from './pages/staff/CreateRenter';
import StaffSpaces from './pages/staff/Spaces';
import StaffBilling from './pages/staff/Billing';
import StaffPayments from './pages/staff/Payments';

// Renter Pages
import RenterDashboard from './pages/renter/Dashboard';
import RenterAvailedSpace from './pages/renter/AvailedSpace';
import RenterSpaces from './pages/renter/Spaces';
import RenterTransactions from './pages/renter/Transactions';
import RenterYearlyLease from './pages/renter/YearlyLease';

// Shared
import ProfilePage from './pages/shared/ProfilePage';

// Page Fallback Loading Spinner
const PageLoader = () => (
  <div className="min-h-screen bg-[#FBF6EA] text-[#241C15] flex items-center justify-center font-bold">
    <div className="flex items-center space-x-3">
      <div className="w-6 h-6 border-3 border-[#C1440E] border-t-transparent rounded-full animate-spin"></div>
      <span style={{ fontFamily: "'Archivo Black', sans-serif" }}>Loading RentMart...</span>
    </div>
  </div>
);

// Protected Route Guard Wrapper
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
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
      <Route path="/register" element={<Register />} />

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
      <Route path="/staff/create-renter" element={<ProtectedRoute allowedRoles={['staff']}><StaffCreateRenter /></ProtectedRoute>} />
      <Route path="/staff/spaces" element={<ProtectedRoute allowedRoles={['staff']}><StaffSpaces /></ProtectedRoute>} />
      <Route path="/staff/payments" element={<ProtectedRoute allowedRoles={['staff']}><StaffPayments /></ProtectedRoute>} />
      <Route path="/staff/billing" element={<ProtectedRoute allowedRoles={['staff']}><StaffBilling /></ProtectedRoute>} />
      <Route path="/staff/profile" element={<ProtectedRoute allowedRoles={['staff']}><ProfilePage /></ProtectedRoute>} />

      {/* Renter Routes */}
      <Route path="/renter/dashboard" element={<ProtectedRoute allowedRoles={['renter']}><RenterDashboard /></ProtectedRoute>} />
      <Route path="/renter/availed_space" element={<ProtectedRoute allowedRoles={['renter']}><RenterAvailedSpace /></ProtectedRoute>} />
      <Route path="/renter/yearly-lease" element={<ProtectedRoute allowedRoles={['renter']}><RenterYearlyLease /></ProtectedRoute>} />
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

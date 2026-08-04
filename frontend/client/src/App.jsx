import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Public Pages
const Landing = lazy(() => import('./pages/public/Landing'));
const Login = lazy(() => import('./pages/public/Login'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));
const AdminRenters = lazy(() => import('./pages/admin/Renters'));
const AdminSpaces = lazy(() => import('./pages/admin/Spaces'));
const AdminTransactions = lazy(() => import('./pages/admin/Transactions'));
const AdminReports = lazy(() => import('./pages/admin/Reports'));

// Staff Pages
const StaffDashboard = lazy(() => import('./pages/staff/Dashboard'));
const StaffSpaces = lazy(() => import('./pages/staff/Spaces'));
const StaffBilling = lazy(() => import('./pages/staff/Billing'));
const StaffPayments = lazy(() => import('./pages/staff/Payments'));

// Renter Pages
const RenterDashboard = lazy(() => import('./pages/renter/Dashboard'));
const RenterAvailedSpace = lazy(() => import('./pages/renter/AvailedSpace'));
const RenterSpaces = lazy(() => import('./pages/renter/Spaces'));
const RenterTransactions = lazy(() => import('./pages/renter/Transactions'));

// Shared
const ProfilePage = lazy(() => import('./pages/shared/ProfilePage'));

// Page Fallback Loading Spinner
const PageLoader = () => (
  <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center font-semibold">
    <div className="flex items-center space-x-3">
      <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      <span>Loading page...</span>
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
    <Suspense fallback={<PageLoader />}>
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
    </Suspense>
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

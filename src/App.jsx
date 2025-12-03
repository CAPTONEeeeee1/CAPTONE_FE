import './App.css';
import { Routes, Route, Link } from 'react-router-dom';
import React from 'react';

// Public/Basic Imports
import HomePage from './pages/Home';
import AboutPage from './pages/About';
import ContactPage from './pages/Contact';
import AuthPage from './pages/Auth';
import VerifyOTPPage from './pages/VerifyOTP';

// Auth Routes
import AuthCallback from './pages/AuthCallback'; 
import ForgotPasswordPage from './pages/ForgotPassword'; 
import ResetPasswordPage from './pages/ResetPasswordPage'; 

// Protected/User Imports
import DashboardPage from './pages/Dashboard';
import WorkspacesPage from './pages/WorkSpace';
import ProfilePage from './pages/Profile';
import NotificationsPage from './pages/Notification';
import WorkspacePage from './pages/Workspace-id';
import BoardPage from './pages/BoardPage';
import ReportsPage from './pages/Report';
import ReportDetailPage from './pages/ReportDetail';
import SettingsPage from './pages/Setting';
import CreateWorkspacePage from './pages/CreateWorkspace';
import CreateBoardPage from './pages/CreateBoard';  // SỬA ĐÂY
import EditBoardPage from './pages/EditBoard';
import AcceptInvitationPage from './pages/AcceptInvitation';
import Checkout from './pages/Checkout';

import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicRoute } from './components/PublicRoute';

// ===== ADMIN PAGES =====
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
// import AdminBoardsPage from "./pages/admin/AdminBoardsPage"; 
// import AdminPaymentsPage from "./pages/admin/AdminPaymentsPage";

export default function App() { // Chỉ giữ lại export default này
  return (
    <>
      {/* Thêm Nav bar từ nhánh feature/payment nếu bạn muốn hiển thị nó trên mọi trang */}
      <nav>
        <Link to="/">Home</Link> | <Link to="/checkout">Nâng cấp Premium</Link>
      </nav>

      <Routes>
        
        {/* 1. ADMIN ROUTES */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsersPage />} />
          {/* <Route path="boards" element={<AdminBoardsPage />} /> */}
          {/* <Route path="payments" element={<AdminPaymentsPage />} /> */}
        </Route>

        {/* 2. PUBLIC ROUTES */}
        <Route path="/" element={<PublicRoute><HomePage /></PublicRoute>} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        
        {/* Auth Flow */}
        <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />
        <Route path="/verify-otp" element={<VerifyOTPPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        
        
        {/* 3. PROTECTED ROUTES */}
        
        {/* Tính năng Payment mới */}
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} /> 

        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/workspaces" element={<ProtectedRoute><WorkspacesPage /></ProtectedRoute>} />
        <Route path="/workspaces/create" element={<ProtectedRoute><CreateWorkspacePage /></ProtectedRoute>} />
        <Route path="/workspaces/:id" element={<ProtectedRoute><WorkspacePage /></ProtectedRoute>} />
        <Route path="/workspaces/:id/boards/new" element={<ProtectedRoute><CreateBoardPage /></ProtectedRoute>} />
        <Route path="/workspaces/:id/boards/:boardId/edit" element={<ProtectedRoute><EditBoardPage /></ProtectedRoute>} />
        <Route path="/workspaces/:id/boards/:boardId" element={<ProtectedRoute><BoardPage /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
        <Route path="/reports/:workspaceId" element={<ProtectedRoute><ReportDetailPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/invitations/:invitationId" element={<ProtectedRoute><AcceptInvitationPage /></ProtectedRoute>} />
        
        {/* Fallback Route/Catch-all: Đặt ở cuối cùng */}
        <Route path="*" element={<PublicRoute><HomePage /></PublicRoute>} />

      </Routes>
    </>
  );
}
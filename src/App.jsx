import './App.css';
import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, matchPath } from "react-router-dom";
import { Toaster } from 'sonner';

// ===== Public Pages =====
import HomePage from './pages/Home';
import AboutPage from './pages/About';
import ContactPage from './pages/Contact';
import AuthPage from './pages/Auth';
import VerifyOTPPage from './pages/VerifyOTP';
import AuthCallback from './pages/AuthCallback';
import ForgotPasswordPage from './pages/ForgotPassword';
import ResetPasswordPage from './pages/ResetPasswordPage';

// ===== User Protected Pages =====
import DashboardPage from './pages/Dashboard';
import WorkspacesPage from './pages/WorkSpace';
import WorkspacePage from './pages/Workspace-id';
import ProfilePage from './pages/Profile';
import NotificationsPage from './pages/Notification';
import ReportsPage from './pages/Report';
import ReportDetailPage from './pages/ReportDetail';
import SettingsPage from './pages/Setting';
import CreateWorkspacePage from './pages/CreateWorkspace';
import CreateBoardPage from './pages/CreateBoard';
import EditBoardPage from './pages/EditBoard';
import BoardPage from './pages/BoardPage';
import AcceptInvitationPage from './pages/AcceptInvitation';
import Checkout from './pages/Checkout';
import UpgradePage from './pages/Upgrade';
import PaymentStatusPage from './pages/PaymentStatus';
import TrashPage from './pages/TrashPage';


// ===== Components & Utils =====
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicRoute } from './components/PublicRoute';
import workspaceService from './services/workspaceService';

// ===== ADMIN PAGES =====
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminPaymentsPage from "./pages/admin/AdminPaymentsPage";

export default function App() {
  const location = useLocation();
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState(null);
  const [_isWorkspacePremium, setIsWorkspacePremium] = useState(false);
  const [_loadingWorkspace, setLoadingWorkspace] = useState(true);


  useEffect(() => {
    let extractedWorkspaceId = null;
    const workspacePathPatterns = [
      '/workspaces/:id',
      '/workspaces/:id/boards/new',
      '/workspaces/:id/boards/:boardId/edit',
      '/workspaces/:id/boards/:boardId',
      '/workspaces/:workspaceId/trash',
      '/reports/:workspaceId',
    ];

    for (const pattern of workspacePathPatterns) {
      const match = matchPath({ path: pattern, end: false }, location.pathname);

      if (match?.params?.id) {
        extractedWorkspaceId = match.params.id;
        break;
      }
      if (match?.params?.workspaceId) {
        extractedWorkspaceId = match.params.workspaceId;
        break;
      }
    }

    setCurrentWorkspaceId(extractedWorkspaceId);
    console.log("App.jsx: Extracted Workspace ID:", extractedWorkspaceId);
  }, [location.pathname]);

  // === Kiểm tra gói Premium (giữ lại để dùng logic khác nếu cần) ===
  useEffect(() => {
    let cancelled = false;

    const fetchWorkspaceDetails = async () => {
      if (!currentWorkspaceId) {
        if (!cancelled) {
          setIsWorkspacePremium(false);
          setLoadingWorkspace(false);
        }
        return;
      }

      if (!cancelled) setLoadingWorkspace(true);
      try {
        const response = await workspaceService.getById(currentWorkspaceId);
        const plan = response?.workspace?.plan;
        if (!cancelled) setIsWorkspacePremium(plan === 'PREMIUM');
      } catch (error) {
        console.error("App.jsx: Failed to fetch workspace details:", error);
        if (!cancelled) setIsWorkspacePremium(false);
      } finally {
        if (!cancelled) setLoadingWorkspace(false);
      }
    };

    fetchWorkspaceDetails();
    return () => { cancelled = true; };
  }, [currentWorkspaceId]);

  return (
    <>
      <Toaster richColors position="bottom-right" />

      <Routes>
        {/* ================= ADMIN ROUTES ================= */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="payments" element={<AdminPaymentsPage />} />
        </Route>

        {/* ================= PUBLIC ROUTES ================= */}
        <Route path="/" element={<PublicRoute><HomePage /></PublicRoute>} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />
        <Route path="/verify-otp" element={<VerifyOTPPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/payment-status" element={<PublicRoute><PaymentStatusPage /></PublicRoute>} />

        {/* ================= USER PROTECTED ROUTES ================= */}
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/upgrade" element={<ProtectedRoute><UpgradePage /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/workspaces" element={<ProtectedRoute><WorkspacesPage /></ProtectedRoute>} />
        <Route path="/workspaces/create" element={<ProtectedRoute><CreateWorkspacePage /></ProtectedRoute>} />
        <Route path="/workspaces/:id" element={<ProtectedRoute><WorkspacePage /></ProtectedRoute>} />
        <Route path="/workspaces/:id/boards/new" element={<ProtectedRoute><CreateBoardPage /></ProtectedRoute>} />
        <Route path="/workspaces/:id/boards/:boardId/edit" element={<ProtectedRoute><EditBoardPage /></ProtectedRoute>} />
        <Route path="/workspaces/:id/boards/:boardId" element={<ProtectedRoute><BoardPage /></ProtectedRoute>} />
        <Route path="/workspaces/:workspaceId/trash" element={<ProtectedRoute><TrashPage /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
        <Route path="/reports/:workspaceId" element={<ProtectedRoute><ReportDetailPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/invitations/:invitationId" element={<ProtectedRoute><AcceptInvitationPage /></ProtectedRoute>} />

        {/* ================= FALLBACK ================= */}
        <Route path="*" element={<PublicRoute><HomePage /></PublicRoute>} />
      </Routes>

    </>
  );
}

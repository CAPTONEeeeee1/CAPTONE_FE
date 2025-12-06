import './App.css'
import { Routes, Route, useLocation, matchPath } from "react-router-dom";
import React, { useState, useEffect } from 'react';
import HomePage from './pages/Home';
import AboutPage from './pages/About';
import ContactPage from './pages/Contact';
import AuthPage from './pages/Auth';
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
import CreateBoardPage from './pages/CreateBoard';
import EditBoardPage from './pages/EditBoard';
import AcceptInvitationPage from './pages/AcceptInvitation';
import VerifyOTPPage from './pages/VerifyOTP';
import AuthCallback from './pages/AuthCallback'; 
import ForgotPasswordPage from './pages/ForgotPassword'; 
import ResetPasswordPage from './pages/ResetPasswordPage'; 
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicRoute } from './components/PublicRoute';
import UpgradePage from './pages/Upgrade';
import ChatWidget from './pages/ChatWidget';
import PaymentStatusPage from './pages/PaymentStatus'; // Import PaymentStatusPage
import workspaceService from './services/workspaceService'; // Import workspaceService

// ===== ADMIN PAGES =====
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminPaymentsPage from "./pages/admin/AdminPaymentsPage";

function App() {
  const location = useLocation();
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState(null);
  const [isWorkspacePremium, setIsWorkspacePremium] = useState(false);
  const [loadingWorkspace, setLoadingWorkspace] = useState(true);

  useEffect(() => {
    let extractedWorkspaceId = null;
    const workspacePathPatterns = [
        '/workspaces/:id',
        '/workspaces/:id/boards/new',
        '/workspaces/:id/boards/:boardId/edit',
        '/workspaces/:id/boards/:boardId',
        '/reports/:workspaceId',
    ];

    for (const pattern of workspacePathPatterns) {
        const match = matchPath(pattern, location.pathname);
        if (match && match.params.id) { 
            extractedWorkspaceId = match.params.id;
            break;
        } else if (match && match.params.workspaceId) { 
            extractedWorkspaceId = match.params.workspaceId;
            break;
        }
    }
    setCurrentWorkspaceId(extractedWorkspaceId);
    console.log("App.jsx: Extracted Workspace ID from URL:", extractedWorkspaceId, "Path:", location.pathname); // Added log
  }, [location.pathname]);

  useEffect(() => {
    console.log("App.jsx: currentWorkspaceId changed, value:", currentWorkspaceId); // Added log
    if (currentWorkspaceId) {
      setLoadingWorkspace(true);
      const fetchWorkspaceDetails = async () => {
        console.log("App.jsx: Attempting to fetch workspace details for ID:", currentWorkspaceId); // Added log
        try {
          const response = await workspaceService.getById(currentWorkspaceId);
          console.log("App.jsx: Workspace details fetched:", response); // Added log
          setIsWorkspacePremium(response.workspace.plan === 'PREMIUM'); // Assuming 'plan' field and 'PREMIUM' value
        } catch (error) {
          console.error("App.jsx: Failed to fetch workspace details:", error);
          setIsWorkspacePremium(false); // Assume not premium on error
        } finally {
          setLoadingWorkspace(false);
        }
      };
      fetchWorkspaceDetails();
    } else {
      console.log("App.jsx: currentWorkspaceId is null or undefined, skipping fetch."); // Added log
      setIsWorkspacePremium(false);
      setLoadingWorkspace(false);
    }
  }, [currentWorkspaceId]);

  return (
    <>
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="payments" element={<AdminPaymentsPage />} />
        </Route>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <HomePage />
            </PublicRoute>
          }
        />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route
          path="/auth"
          element={
            <PublicRoute>
              <AuthPage />
            </PublicRoute>
          }
        />
        <Route path="/verify-otp" element={<VerifyOTPPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route
            path="/payment-status"
            element={
                <PublicRoute>
                    <PaymentStatusPage />
                </PublicRoute>
            }
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/workspaces"
          element={
            <ProtectedRoute>
              <WorkspacesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/workspaces/create"
          element={
            <ProtectedRoute>
              <CreateWorkspacePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/workspaces/:id"
          element={
            <ProtectedRoute>
              <WorkspacePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/workspaces/:id/boards/new"
          element={
            <ProtectedRoute>
              <CreateBoardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/workspaces/:id/boards/:boardId/edit"
          element={
            <ProtectedRoute>
              <EditBoardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/workspaces/:id/boards/:boardId"
          element={
            <ProtectedRoute>
              <BoardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/:workspaceId"
          element={
            <ProtectedRoute>
              <ReportDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/invitations/:invitationId"
          element={
            <ProtectedRoute>
              <AcceptInvitationPage />
            </ProtectedRoute>
          }
        />
        <Route
            path="/upgrade"
            element={
                <ProtectedRoute>
                    <UpgradePage />
                </ProtectedRoute>
            }
        />
      </Routes>
      {!loadingWorkspace && currentWorkspaceId && isWorkspacePremium && (
        <ProtectedRoute>
            <ChatWidget workspaceId={currentWorkspaceId} />
        </ProtectedRoute>
      )}
    </>
  )
}

export default App

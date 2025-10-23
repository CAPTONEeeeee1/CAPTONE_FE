import './App.css'
import { Routes, Route } from "react-router-dom";
import React from 'react';
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
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicRoute } from './components/PublicRoute';
// BẮT BUỘC: Import component xử lý token callback
import AuthCallbackPage from './pages/AuthCallback'; 

function App() {
  return (
    <>
      <Routes>
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
        
        {/* === ROUTE XỬ LÝ GOOGLE OAUTH CALLBACK === */}
        {/* Đảm bảo route này không nằm trong PublicRoute hay ProtectedRoute */}
        <Route path="/auth/callback" element={<AuthCallbackPage />} /> 

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
      </Routes>
    </>
  )
}

export default App
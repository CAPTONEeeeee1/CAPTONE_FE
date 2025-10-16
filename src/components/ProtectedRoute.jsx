import React from "react";
import { Navigate } from "react-router-dom";
import authService from "@/lib/authService";

/**
 * Protected Route Component
 */
export function ProtectedRoute({ children }) {
    const isAuthenticated = authService.isAuthenticated();

    if (!isAuthenticated) {
        return <Navigate to="/auth" replace />;
    }
    return children;
}

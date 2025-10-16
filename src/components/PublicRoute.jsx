import React from "react";
import { Navigate } from "react-router-dom";
import authService from "@/lib/authService";

/**
 * Public Route Component
 */
export function PublicRoute({ children }) {
    const isAuthenticated = authService.isAuthenticated();

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }
    return children;
}

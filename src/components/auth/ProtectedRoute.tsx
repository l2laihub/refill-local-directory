import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: string[]; // Roles that are allowed to access this route
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, isLoading, session } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // Show a loading indicator while session is being checked
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading session...</div>
      </div>
    );
  }

  if (!user || !session) {
    // User not logged in, redirect to login page
    // Pass the current location to redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check for role if allowedRoles are specified
  if (allowedRoles && allowedRoles.length > 0) {
    // Assuming user object has app_metadata with a role property
    // This matches the RLS policy: auth.jwt()->'app_metadata'->>'user_role'
    const userRole = user.app_metadata?.user_role as string | undefined; 
    
    if (!userRole || !allowedRoles.includes(userRole)) {
      // User does not have the required role, redirect to a "not authorized" page or home
      // For now, redirecting to home. Consider a dedicated "Unauthorized" page.
      return <Navigate to="/" state={{ from: location }} replace />;
    }
  }

  // User is authenticated and has the required role (if specified)
  return <Outlet />; // Render the child route
};

export default ProtectedRoute;
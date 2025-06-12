import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, Link, Outlet } from 'react-router-dom'; // Added Outlet
import { ShieldCheck, Users, BarChart2, Settings } from 'lucide-react'; // Example icons

const AdminDashboardPage: React.FC = () => {
  const { user, isLoading } = useAuth();

  // Placeholder for admin role check - replace with actual role check from user object/claims
  const isAdmin = user && user.app_metadata && user.app_metadata.user_role === 'admin';

  if (isLoading) {
    return <div className="p-8 text-center">Loading admin dashboard...</div>;
  }

  if (!user || !isAdmin) {
    // If no user is logged in, or user is not an admin, redirect to home or login
    // Consider redirecting to a "not authorized" page for non-admin users
    return <Navigate to="/" replace />; 
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-gray-800">Admin Dashboard</h1>
          <p className="mt-2 text-lg text-gray-600">Manage your RefillLocal application.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Moderation Link */}
          <Link 
            to="/admin/moderate-stores" 
            className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition-shadow duration-200 flex flex-col items-center text-center"
          >
            <ShieldCheck className="w-12 h-12 text-sage-600 mb-3" />
            <h2 className="text-xl font-semibold text-gray-700">Store Moderation</h2>
            <p className="text-sm text-gray-500 mt-1">Review and approve new store submissions.</p>
          </Link>

          {/* Placeholder: User Management */}
          <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center text-center opacity-50 cursor-not-allowed">
            <Users className="w-12 h-12 text-blue-500 mb-3" />
            <h2 className="text-xl font-semibold text-gray-700">User Management</h2>
            <p className="text-sm text-gray-500 mt-1">(Coming Soon)</p>
          </div>
          
          {/* Placeholder: Analytics */}
          <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center text-center opacity-50 cursor-not-allowed">
            <BarChart2 className="w-12 h-12 text-purple-500 mb-3" />
            <h2 className="text-xl font-semibold text-gray-700">Analytics</h2>
            <p className="text-sm text-gray-500 mt-1">(Coming Soon)</p>
          </div>

          {/* Placeholder: Site Settings */}
          <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center text-center opacity-50 cursor-not-allowed">
            <Settings className="w-12 h-12 text-gray-500 mb-3" />
            <h2 className="text-xl font-semibold text-gray-700">Site Settings</h2>
            <p className="text-sm text-gray-500 mt-1">(Coming Soon)</p>
          </div>
          
          {/* Add more admin sections/links here */}
        </div>
        
        {/* Outlet for nested admin routes */}
        <div className="mt-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
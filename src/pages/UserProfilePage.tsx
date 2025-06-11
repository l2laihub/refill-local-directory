import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import Button from '../components/Button';

const UserProfilePage: React.FC = () => {
  const { user, logout, isLoading } = useAuth();

  if (isLoading) {
    return <div className="p-8 text-center">Loading profile...</div>;
  }

  if (!user) {
    // If no user is logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  const handleLogout = async () => {
    try {
      await logout();
      // Navigate to home or login page is handled by AuthContext/useEffect in nav components
    } catch (error) {
      console.error("Error logging out:", error);
      // Handle logout error display if necessary
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Your Profile
        </h1>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Email</p>
            <p className="mt-1 text-lg text-gray-900">{user.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">User ID</p>
            <p className="mt-1 text-sm text-gray-700">{user.id}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Joined</p>
            <p className="mt-1 text-lg text-gray-900">
              {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          {user.last_sign_in_at && (
            <div>
              <p className="text-sm font-medium text-gray-500">Last Sign In</p>
              <p className="mt-1 text-lg text-gray-900">
                {new Date(user.last_sign_in_at).toLocaleString()}
              </p>
            </div>
          )}
          {/* Add more user details here as needed, e.g., from a 'profiles' table */}
        </div>

        <div className="mt-8 border-t pt-6">
          {/* Placeholder for profile editing functionality */}
          {/* <Button className="w-full mb-4 bg-blue-500 hover:bg-blue-600 text-white">
            Edit Profile (Coming Soon)
          </Button> */}
          <Button 
            onClick={handleLogout} 
            className="w-full bg-red-500 hover:bg-red-600 text-white"
            disabled={isLoading}
          >
            {isLoading ? 'Logging out...' : 'Logout'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
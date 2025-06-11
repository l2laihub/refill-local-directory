import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
// import SignupForm from '../components/auth/SignupForm'; // We might not render the form directly here anymore

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // If user is already logged in, redirect from signup page
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // If not logged in, this page might show a message or be styled
  // as a container if we decide to embed SignupForm here for a non-modal route.
  // For now, let's make it minimal. If modals are the primary way,
  // direct navigation to /signup might be less common or could even redirect
  // to the homepage with the signup modal triggered.

  // If we want this page to still be a functional signup page (non-modal):
  // return (
  //   <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
  //     <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
  //       <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10">
  //         <SignupForm />
  //       </div>
  //     </div>
  //   </div>
  // );

  // If this page is just a fallback or for redirection:
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8">
      <p className="text-gray-600">Loading signup...</p>
      {/* Or, if we want to keep it as a full page option:
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10">
          <SignupForm onSwitchToLogin={() => navigate('/login')} />
        </div>
      </div>
      */}
    </div>
  );
};

export default SignupPage;
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // useNavigate might be replaced by onSuccess
import Button from '../Button';
import Input from '../Input';
import { useAuth } from '../../contexts/AuthContext';

interface LoginFormProps {
  onSuccess?: () => void; // Callback for successful login, e.g., to close modal
  onSwitchToSignup?: () => void; // Callback to switch to signup form/modal
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate(); // Keep for now
  const { login, isLoading: authIsLoading } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await login(email, password);
      if (onSuccess) {
        onSuccess();
      }
      // Successful login will trigger onAuthStateChange, which updates user state.
      // App structure (e.g., ProtectedRoute) should handle redirection or content change.
      // No explicit navigate('/') here as it might conflict with modal flows.
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please check your credentials.');
    }
  };

  return (
    <>
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8">
        <h2 className="text-center text-2xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        {onSwitchToSignup && (
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <button
              type="button"
              onClick={onSwitchToSignup}
              className="font-medium text-sage-600 hover:text-sage-500 focus:outline-none"
            >
              create a new account
            </button>
          </p>
        )}
        {!onSwitchToSignup && ( // Fallback if not used in a modal context
            <p className="mt-2 text-center text-sm text-gray-600">
                Or{' '}
                <Link to="/signup" className="font-medium text-sage-600 hover:text-sage-500">
                    create a new account
                </Link>
            </p>
        )}
      </div>

      <form className="space-y-6" onSubmit={handleLogin}>
        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        <div>
          <label htmlFor="email-login" className="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <div className="mt-1">
            <Input
              id="email-login"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password-login" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="mt-1">
            <Input
              id="password-login"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="flex items-center justify-end"> {/* Adjusted: only forgot password link */}
          <div className="text-sm">
            <a href="#" className="font-medium text-sage-600 hover:text-sage-500">
              {/* TODO: Implement password reset */}
              Forgot your password? 
            </a>
          </div>
        </div>

        <div>
          <Button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sage-600 hover:bg-sage-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-500"
            disabled={authIsLoading}
          >
            {authIsLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </div>
      </form>
    </>
  );
};

export default LoginForm;
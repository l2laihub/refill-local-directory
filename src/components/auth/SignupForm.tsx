import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // useNavigate might be replaced by onSuccess
import Button from '../Button';
import Input from '../Input';
import { useAuth } from '../../contexts/AuthContext';

interface SignupFormProps {
  onSuccess?: () => void; // Callback for successful signup, e.g., to close modal
  onSwitchToLogin?: () => void; // Callback to switch to login form/modal
}

const SignupForm: React.FC<SignupFormProps> = ({ onSuccess, onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate(); // Keep for now, might change if fully modal
  const { signup, isLoading: authIsLoading } = useAuth();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await signup(email, password, referralCode || undefined);
      // alert('Signup successful! Please check your email to confirm your account.'); // Consider a less intrusive notification
      if (onSuccess) {
        onSuccess();
      } else {
        // Fallback if not used in a modal context that provides onSuccess
        navigate('/login'); // Or to a "check your email" page
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign up. Please try again.');
    }
  };

  return (
    <>
      {/* The title and "Or sign in" link might be part of the Modal component's title or passed differently */}
      {/* For now, keeping them here for structural similarity */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8">
        <h2 className="text-center text-2xl font-extrabold text-gray-900">
          Create your account
        </h2>
        {onSwitchToLogin && (
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="font-medium text-sage-600 hover:text-sage-500 focus:outline-none"
            >
              sign in to your existing account
            </button>
          </p>
        )}
         {!onSwitchToLogin && ( // Fallback if not used in a modal context
            <p className="mt-2 text-center text-sm text-gray-600">
                Or{' '}
                <Link to="/login" className="font-medium text-sage-600 hover:text-sage-500">
                    sign in to your existing account
                </Link>
            </p>
        )}
      </div>

      <form className="space-y-6" onSubmit={handleSignup}>
        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        <div>
          <label htmlFor="email-signup" className="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <div className="mt-1">
            <Input
              id="email-signup"
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
          <label htmlFor="password-signup" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="mt-1">
            <Input
              id="password-signup"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword-signup" className="block text-sm font-medium text-gray-700">
            Confirm Password
          </label>
          <div className="mt-1">
            <Input
              id="confirmPassword-signup"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full"
              placeholder="••••••••"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="referralCode-signup" className="block text-sm font-medium text-gray-700">
            Referral Code (Optional)
          </label>
          <div className="mt-1">
            <Input
              id="referralCode-signup"
              name="referralCode"
              type="text"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              className="w-full"
              placeholder="Enter referral code"
            />
          </div>
        </div>

        <div>
          <Button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sage-600 hover:bg-sage-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-500"
            disabled={authIsLoading}
          >
            {authIsLoading ? 'Creating account...' : 'Create account'}
          </Button>
        </div>
      </form>
    </>
  );
};

export default SignupForm;
import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { authService } from '../services/auth';

const LoginView = ({ onLogin }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) return;

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      if (isLoginMode) {
        const { data, error } = await authService.signIn(email, password);
        if (error) throw error;
        onLogin(data.user);
      } else {
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          return;
        }
        const { data, error } = await authService.signUp(email, password);
        if (error) throw error;
        onLogin(data.user);
      }
    } catch (err) {
      console.error(err);
      if (err.message === 'Failed to fetch') {
        setError('Connection failed. Supabase keys might be missing or invalid.');
      } else {
        setError(err.message || 'Authentication failed');
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await authService.signInWithGoogle();
      if (error) throw error;
    } catch (err) {
      console.error(err);
      setError(err.message || 'Google login failed');
    }
  };

  return (
    // Changed min-h-screen to h-screen and added overflow-hidden to prevent scrolling
    <div className="h-screen w-full bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-4 font-sans overflow-hidden">

      {/* Main Container - Adjusted spacing for compactness */}
      <div className="w-full max-w-[380px] flex flex-col items-center space-y-4">

        {/* Logo Section - Recreated based on your image */}
        <div className="mb-2">
          <div className="w-20 h-20 rounded-[2rem] relative overflow-hidden shadow-2xl flex items-center justify-center">
            {/* Background: Orange top, Blue bottom diagonal split */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#2d3a82] to-[#ff9d4d] z-0"></div>
            {/* The diagonal wave effect approximation */}
            <div className="absolute bottom-0 left-0 w-full h-full bg-[#2d3a82] origin-bottom-left transform -skew-y-12 translate-y-1/2 opacity-90"></div>

            {/* 3D Clipboard Icon Construction */}
            <div className="relative z-10 drop-shadow-lg transform scale-90">
              <svg width="60" height="70" viewBox="0 0 60 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Clipboard Board (Orange/Peach backing) */}
                <rect x="5" y="5" width="50" height="60" rx="6" fill="#fca56a" />
                <rect x="5" y="5" width="50" height="58" rx="6" fill="#ffb885" />

                {/* Paper */}
                <rect x="10" y="10" width="40" height="50" rx="2" fill="#e5e7eb" />
                <rect x="10" y="10" width="40" height="48" rx="2" fill="white" />

                {/* Blue Clip at top */}
                <path d="M20 2H40C40 2 42 2 42 6V10H18V6C18 2 20 2 20 2Z" fill="#2d3a82" />
                <circle cx="30" cy="6" r="2" fill="#ffb885" />

                {/* Checkmark Circle (Blue) */}
                <circle cx="22" cy="25" r="7" fill="#2d3a82" />
                {/* Checkmark tick */}
                <path d="M19 25L21 27L25 23" stroke="#ffb885" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                {/* Lines (Text) */}
                <rect x="32" y="22" width="12" height="3" rx="1.5" fill="#8aa2bd" />
                <rect x="20" y="35" width="24" height="3" rx="1.5" fill="#8aa2bd" />
                <rect x="20" y="44" width="24" height="3" rx="1.5" fill="#8aa2bd" />

                {/* Bullets */}
                <circle cx="15" cy="36.5" r="1.5" fill="#2d3a82" />
                <circle cx="15" cy="45.5" r="1.5" fill="#2d3a82" />
              </svg>
            </div>
          </div>
        </div>

        {/* Header Text - Reduced margins */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {isLoginMode ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="text-gray-500 text-xs">
            {isLoginMode ? 'Sign in to continue.' : 'Sign up to get started.'}
          </p>
        </div>

        {/* Form Section - Compact spacing */}
        <form onSubmit={handleSubmit} className="w-full space-y-3">

          {/* Email Input */}
          <div className="space-y-1">
            <label className="text-gray-400 text-[10px] pl-1 uppercase tracking-wide font-semibold">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              className="w-full bg-[#161616] border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gray-600 transition-colors placeholder-transparent"
            />
          </div>

          {/* Password Input */}
          <div className="space-y-1">
            <label className="text-gray-400 text-[10px] pl-1 uppercase tracking-wide font-semibold">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className="w-full bg-[#161616] border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gray-600 transition-colors"
              />
              <button
                onClick={togglePasswordVisibility}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                type="button"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm Password (Sign Up only) */}
          {!isLoginMode && (
            <div className="space-y-1 animate-slide-in">
              <label className="text-gray-400 text-[10px] pl-1 uppercase tracking-wide font-semibold">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError('');
                }}
                className="w-full bg-[#161616] border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gray-600 transition-colors"
              />
            </div>
          )}

          {/* Forgot Password Link */}
          {isLoginMode && (
            <div className="flex justify-end">
              <button type="button" className="text-[#2dd4bf] text-[11px] hover:text-[#14b8a6] transition-colors font-medium">
                Forgot Password?
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="text-red-400 text-xs text-center bg-red-500/10 border border-red-500/20 py-2 rounded-lg">
              {error}
            </div>
          )}

          {/* Sign In Button */}
          <button
            type="submit"
            className="w-full bg-[#262626] hover:bg-[#333333] text-gray-400 hover:text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-black/20"
          >
            {isLoginMode ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Divider - Reduced margins */}
        <div className="w-full flex items-center justify-between my-4">
          <div className="h-[1px] bg-[#262626] flex-1"></div>
          <span className="text-[9px] text-gray-600 px-3 tracking-wider font-semibold">OR CONTINUE WITH</span>
          <div className="h-[1px] bg-[#262626] flex-1"></div>
        </div>

        {/* Google Button - Adjusted padding */}
        <button
          onClick={handleGoogleLogin}
          className="w-full bg-[#161616] border border-[#2a2a2a] hover:bg-[#202020] text-white py-3 rounded-xl flex items-center justify-center transition-all duration-200 group"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z"
            />
            <path
              fill="#EA4335"
              d="M12 4.66c1.61 0 3.1.59 4.28 1.74l3.21-3.21C17.5 1.28 14.97 0 12 0 7.7 0 3.99 2.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        </button>

        {/* Footer Links - Compact */}
        <div className="mt-4 text-center flex flex-col items-center gap-3">
          <p className="text-gray-400 text-xs">
            {isLoginMode ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => {
                setIsLoginMode(!isLoginMode);
                setError('');
              }}
              className="text-[#2dd4bf] hover:text-[#14b8a6] transition-colors font-medium ml-1"
            >
              {isLoginMode ? 'Sign Up' : 'Sign In'}
            </button>
          </p>

          <button
            onClick={() => onLogin({ id: 'guest-user-id', email: 'guest@offline' })}
            className="text-gray-600 text-[10px] hover:text-gray-400 transition-colors uppercase tracking-wide"
          >
            Continue Offline
          </button>
        </div>

      </div>
    </div>
  );
}

export default LoginView;

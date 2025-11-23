import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoginView, setIsLoginView] = useState(true);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.endsWith('@nemsu.edu.ph')) {
      setError('Please use your official @nemsu.edu.ph email address.');
      return;
    }

    // Mock Login logic
    const mockUser: User = {
      email,
      name: email.split('@')[0].replace('.', ' '),
      role: UserRole.STUDENT_LEADER,
      organization: 'Supreme Student Council'
    };
    onLogin(mockUser);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Side: Login Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-10 max-w-md w-full mx-auto">
          <h2 className="text-3xl font-serif italic text-center text-gray-900 mb-8">
            Welcome Back!
          </h2>

          {/* Toggle Switch */}
          <div className="flex bg-gray-100 p-1 rounded-lg mb-8">
            <button
              onClick={() => setIsLoginView(true)}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                isLoginView ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLoginView(false)}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                !isLoginView ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition bg-white"
                  placeholder="your.email@nemsu.edu.ph"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition bg-white"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-gray-600">
                <input type="checkbox" className="mr-2 rounded border-gray-300 text-black focus:ring-black" />
                Remember me
              </label>
              <button type="button" className="text-gray-500 hover:text-black hover:underline">
                Forgot password?
              </button>
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3.5 rounded-lg transition uppercase tracking-wide text-sm shadow-lg transform active:scale-95"
            >
              Login
            </button>

            <button
              type="button"
              className="w-full bg-white border border-gray-300 text-gray-700 font-semibold py-3.5 rounded-lg transition flex items-center justify-center gap-2 hover:bg-gray-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  className="text-blue-600"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  className="text-green-600"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26+-.19-.58z"
                  className="text-yellow-500"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  className="text-red-500"
                />
              </svg>
              Continue with Google
            </button>
          </form>
        </div>

        {/* Right Side: Branding */}
        <div className="text-center lg:text-left flex flex-col items-center lg:items-center justify-center p-4">
          <h1 className="text-6xl md:text-7xl font-serif italic text-gray-900 mb-6 drop-shadow-sm">
            SmartDraft
          </h1>
          <p className="text-lg md:text-xl text-gray-600 font-serif max-w-lg leading-relaxed text-center">
            AI-Powered Document Automation System — simplify your workflow, boost productivity, and automate your document generation efficiently.
          </p>
        </div>

      </div>
    </div>
  );
};
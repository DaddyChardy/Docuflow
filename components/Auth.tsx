import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { GraduationCap, Lock, Mail } from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

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
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 to-emerald-700 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-amber-400 h-2 w-full"></div>
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="bg-emerald-100 p-4 rounded-full">
              <GraduationCap className="w-12 h-12 text-emerald-800" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-2">
            NEMSU AI DocuFlow
          </h1>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-8">
            Sign in with your university account
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                School Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
                  placeholder="student@nemsu.edu.ph"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/30 p-2 rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              Access Portal
            </button>
          </form>
          
          <div className="mt-6 text-center text-xs text-gray-400">
            Restricted to North Eastern Mindanao State University personnel only.
          </div>
        </div>
      </div>
    </div>
  );
};

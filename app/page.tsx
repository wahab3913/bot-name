'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, Sparkles, Brain, Zap } from 'lucide-react';

export default function AdminLogin() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        console.log('Login successful');
        router.push('/admin/dashboard');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Floating Icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-20 animate-float animation-delay-1000">
          <Brain className="w-8 h-8 text-purple-300 opacity-60" />
        </div>
        <div className="absolute top-1/3 right-1/4 animate-float-slow">
          <Sparkles className="w-6 h-6 text-indigo-300 opacity-40" />
        </div>
        <div className="absolute bottom-1/3 left-1/4 animate-float animation-delay-3000">
          <Zap className="w-7 h-7 text-pink-300 opacity-50" />
        </div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 bg-[#101238] rounded-3xl flex items-center justify-center mb-6 shadow-2xl relative">
              <div className="absolute inset-0 rounded-3xl bg-[#101238] opacity-75 blur-sm"></div>
              <Brain className="h-10 w-10 text-white relative z-10" />
              <div className="absolute top-2 right-2">
                <Sparkles className="h-4 w-4 text-purple-200 animate-pulse" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">Awaken AI</h1>
            <p className="text-purple-200 text-lg font-medium">
              Unlock the power of intelligent conversations
            </p>
            <p className="text-purple-300 text-sm mt-2">
              Sign in to your admin dashboard
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 relative">
            <div className="absolute inset-0 rounded-3xl bg-white/5"></div>

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              {error && (
                <div className="bg-red-500/20 border border-red-400/30 text-red-100 px-4 py-3 rounded-2xl backdrop-blur-sm">
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-white mb-3"
                >
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-gray-300 transition-colors" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-300 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#101238] focus:border-transparent transition-all hover:bg-white/15"
                    placeholder="admin@awaken.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-white mb-3"
                >
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-gray-300 transition-colors" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="w-full pl-12 pr-14 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-300 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#101238] focus:border-transparent transition-all hover:bg-white/15"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300 transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300 transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#101238] text-white font-bold py-4 px-6 rounded-2xl hover:bg-[#0f1135] focus:outline-none focus:ring-4 focus:ring-[#101238]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl shadow-lg relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full hover:translate-x-full transition-transform duration-1000 opacity-0 hover:opacity-100"></div>
                {loading ? (
                  <div className="flex items-center justify-center relative z-10">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Awakening Intelligence...
                  </div>
                ) : (
                  <span className="relative z-10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Enter the AI Realm
                  </span>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-sm text-purple-300">
              Awaken AI Admin Panel © 2025
            </p>
            <p className="text-xs text-purple-400 mt-1">
              Powered by Sparkix Technologies
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        @keyframes float-slow {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-15px) rotate(10deg);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-3000 {
          animation-delay: 3s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}

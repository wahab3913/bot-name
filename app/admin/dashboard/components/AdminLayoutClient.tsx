'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  LogOut,
  Menu,
  X,
  Brain,
  Sparkles,
  User,
} from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';

interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
}

interface AdminLayoutClientProps {
  children: React.ReactNode;
}

export default function AdminLayoutClient({
  children,
}: AdminLayoutClientProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Fetch user data from server using the HTTP-only cookie
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/admin/profile', {
          method: 'GET',
          credentials: 'include', // Include cookies in request
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          // If profile fetch fails, redirect will be handled by middleware
          console.error('Failed to fetch user profile');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Call logout API to clear HTTP-only cookie
      await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include', // Include cookies in request
      });

      // Redirect to login (middleware will handle the redirect)
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect even if API call fails
      router.push('/');
    } finally {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
      current: pathname === '/admin/dashboard',
    },
    {
      name: 'File Management',
      href: '/admin/dashboard/files',
      icon: FileText,
      current: pathname === '/admin/dashboard/files',
    },
    {
      name: 'Q&A Management',
      href: '/admin/dashboard/qa',
      icon: MessageSquare,
      current: pathname === '/admin/dashboard/qa',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#101238] rounded-2xl flex items-center justify-center mb-4 animate-pulse mx-auto">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <div className="text-lg font-medium text-gray-700">
            Loading dashboard...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/80 backdrop-blur-xl border-r border-white/20 transform transition-transform duration-300 ease-in-out lg:translate-x-0 overflow-y-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-screen">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#101238] rounded-xl flex items-center justify-center">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Awaken AI</h1>
                <p className="text-xs text-gray-500">Admin Panel</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg text-black"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${
                    item.current
                      ? 'bg-[#101238] text-white shadow-lg'
                      : 'text-gray-700 hover:bg-white/60 hover:shadow-md'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon
                    className={`mr-3 h-5 w-5 transition-colors ${
                      item.current
                        ? 'text-white'
                        : 'text-gray-500 group-hover:text-gray-700'
                    }`}
                  />
                  {item.name}
                  {item.current && (
                    <Sparkles className="ml-auto h-4 w-4 text-gray-300" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-gray-200/50">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-[#101238] rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name || user?.username || 'Admin User'}
                </p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            </div>
            <button
              onClick={handleLogoutClick}
              className="w-full flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-xl hover:bg-red-50 hover:text-red-700 transition-colors group"
            >
              <LogOut className="mr-3 h-4 w-4 group-hover:text-red-500" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Top navigation */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-white/20 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-xl text-black mr-2"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    {navigation.find((item) => item.current)?.name ||
                      'Dashboard'}
                  </h1>
                  <p className="text-sm text-gray-500">
                    Manage your AI assistant
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="p-6 lg:p-8 flex-1">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
        title="Sign Out"
        message={`Are you sure you want to sign out? You'll need to log in again to access the admin dashboard.`}
        confirmText="Sign Out"
        cancelText="Cancel"
        type="warning"
        isLoading={isLoggingOut}
      />
    </div>
  );
}

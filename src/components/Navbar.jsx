import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Briefcase, 
  FileText, 
  Sparkles, 
  LogOut, 
  User, 
  PlusCircle, 
  LayoutDashboard 
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isRecruiter, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const navLinkClass = (path) =>
    `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive(path)
        ? 'bg-blue-50 text-blue-700 font-semibold'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                  ResumeMaster
                </span>
                <span className="hidden sm:inline-block ml-1.5 px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-blue-100 text-blue-700 rounded-md">
                  ML AI
                </span>
              </div>
            </Link>

            {/* Navigation links */}
            {isAuthenticated && (
              <div className="hidden md:flex items-center gap-1">
                {isAdmin ? (
                  <Link to="/admin" className={navLinkClass('/admin')}>
                    <LayoutDashboard className="w-4 h-4 text-amber-600" />
                    Admin Panel
                  </Link>
                ) : (
                  <Link to="/dashboard" className={navLinkClass('/dashboard')}>
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                )}
                <Link to="/jobs" className={navLinkClass('/jobs')}>
                  <Briefcase className="w-4 h-4" />
                  Jobs
                </Link>
                {isRecruiter && (
                  <Link to="/jobs/create" className={navLinkClass('/jobs/create')}>
                    <PlusCircle className="w-4 h-4" />
                    Post Job
                  </Link>
                )}
                <Link to="/resumes/upload" className={navLinkClass('/resumes/upload')}>
                  <FileText className="w-4 h-4" />
                  Upload CV
                </Link>
                <Link to="/matching" className={navLinkClass('/matching')}>
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  AI Matching
                </Link>
              </div>
            )}
          </div>

          {/* Right side / User info */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                    {(user?.name || user?.full_name || 'U')[0].toUpperCase()}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-semibold text-slate-800 leading-tight">
                      {user?.name || user?.full_name || 'User'}
                    </p>
                    <span
                      className={`inline-block text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                        user?.role === 'RECRUITER'
                          ? 'bg-purple-100 text-purple-700'
                          : user?.role === 'ADMIN'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {user?.role}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

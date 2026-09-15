import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersAPI, jobsAPI, resumesAPI } from '../services/api';
import { 
  ShieldCheck, 
  Users, 
  Briefcase, 
  FileText, 
  Sparkles, 
  Calendar, 
  Mail, 
  AlertCircle, 
  RefreshCw, 
  CheckCircle2 
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [usersList, setUsersList] = useState([]);
  const [jobsCount, setJobsCount] = useState(0);
  const [resumesCount, setResumesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError('');
      const [usersRes, jobsRes, resumesRes] = await Promise.allSettled([
        usersAPI.getAll(0, 100),
        jobsAPI.getAll(0, 1),
        resumesAPI.getAll(0, 1),
      ]);

      if (usersRes.status === 'fulfilled') {
        setUsersList(usersRes.value.data || []);
      } else {
        throw new Error(usersRes.reason?.response?.data?.detail || 'Failed to load user accounts.');
      }

      if (jobsRes.status === 'fulfilled') {
        setJobsCount(jobsRes.value.data?.length || 0);
      }
      if (resumesRes.status === 'fulfilled') {
        setResumesCount(resumesRes.value.data?.length || 0);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const recruitersCount = usersList.filter((u) => u.role === 'RECRUITER').length;
  const candidatesCount = usersList.filter((u) => u.role === 'CANDIDATE').length;
  const adminsCount = usersList.filter((u) => u.role === 'ADMIN').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-4 border border-white/20">
            <ShieldCheck className="w-4 h-4 text-yellow-200" />
            Master Administrator Panel
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Welcome, Admin {user?.name || user?.full_name || ''}!
          </h1>
          <p className="mt-2 text-amber-100 text-sm max-w-2xl">
            You have full administrative privileges to monitor all system users, manage roles, view recruiter and candidate activity, and verify the Random Forest ML match pipeline.
          </p>
        </div>
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-2xl flex items-center gap-2 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{usersList.length}</div>
            <div className="text-xs text-slate-500 font-medium">Total Registered Users</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-700">{recruitersCount}</div>
            <div className="text-xs text-slate-500 font-medium">Recruiters</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-700">{candidatesCount}</div>
            <div className="text-xs text-slate-500 font-medium">Candidates</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-700">{adminsCount}</div>
            <div className="text-xs text-slate-500 font-medium">System Admins</div>
          </div>
        </div>
      </div>

      {/* Users Management Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-600" />
              All System Users ({usersList.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live records from the backend user authentication database
            </p>
          </div>

          <button
            onClick={fetchAdminData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm">Loading users from database...</p>
          </div>
        ) : usersList.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <p className="text-sm">No registered users found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-6">ID</th>
                  <th className="py-3 px-6">User Name</th>
                  <th className="py-3 px-6">Email Address</th>
                  <th className="py-3 px-6">Assigned Role</th>
                  <th className="py-3 px-6">Created At</th>
                  <th className="py-3 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-mono text-xs text-slate-500">
                      #{u.id}
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-800">
                      {u.name || u.full_name || 'N/A'}
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {u.email}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          u.role === 'ADMIN'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : u.role === 'RECRUITER'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'Active'}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

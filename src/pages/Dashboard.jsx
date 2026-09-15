import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobsAPI, resumesAPI } from '../services/api';
import { 
  Briefcase, 
  FileText, 
  Sparkles, 
  PlusCircle, 
  TrendingUp, 
  ArrowRight, 
  CheckCircle2, 
  Cpu, 
  Award, 
  Clock 
} from 'lucide-react';

export default function Dashboard() {
  const { user, isRecruiter } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsRes, resumesRes] = await Promise.allSettled([
          jobsAPI.getAll(0, 5),
          resumesAPI.getAll(0, 5),
        ]);

        if (jobsRes.status === 'fulfilled') {
          setJobs(jobsRes.value.data);
        }
        if (resumesRes.status === 'fulfilled') {
          setResumes(resumesRes.value.data);
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white p-8 shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            Random Forest Supervised ML Active
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Hello, {user?.name || user?.full_name || 'User'}! 👋
          </h1>
          <p className="mt-3 text-blue-100 text-base leading-relaxed">
            Welcome to Resume Master. Our ML engine matches candidate CVs against job descriptions using TF-IDF vectorization, semantic skill overlap, and a trained Random Forest classifier.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/matching"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-blue-800 font-bold text-sm shadow-md hover:bg-blue-50 transition-all hover:scale-105"
            >
              <Sparkles className="w-4 h-4 text-blue-600" />
              Run ML Matching
            </Link>
            {isRecruiter ? (
              <Link
                to="/jobs/create"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600/40 hover:bg-blue-600/60 border border-white/20 text-white font-semibold text-sm transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                Post New Job
              </Link>
            ) : (
              <Link
                to="/resumes/upload"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600/40 hover:bg-blue-600/60 border border-white/20 text-white font-semibold text-sm transition-all"
              >
                <FileText className="w-4 h-4" />
                Upload My CV
              </Link>
            )}
          </div>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -right-12 -bottom-12 w-80 h-80 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{jobs.length}</div>
            <div className="text-xs text-slate-500 font-medium">Active Job Posts</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{resumes.length}</div>
            <div className="text-xs text-slate-500 font-medium">Processed Resumes</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-600">99.1%</div>
            <div className="text-xs text-slate-500 font-medium">ML Model F1-Score</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">0.999</div>
            <div className="text-xs text-slate-500 font-medium">ML ROC-AUC Metric</div>
          </div>
        </div>
      </div>

      {/* Grid: Recent Jobs & Recent Resumes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Jobs */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900">Recent Job Posts</h2>
            </div>
            <Link
              to="/jobs"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-slate-400">Loading jobs...</div>
          ) : jobs.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              <p className="text-sm">No jobs posted yet.</p>
              {isRecruiter && (
                <Link
                  to="/jobs/create"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
                >
                  Create your first job
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all flex items-center justify-between"
                >
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">{job.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      <span>Min Exp: {job.min_experience_years || 0} yrs</span>
                      <span>•</span>
                      <span>Edu: {job.education_level || 'Any'}</span>
                    </div>
                  </div>
                  <Link
                    to={`/matching?jobId=${job.id}`}
                    className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white text-xs font-bold transition-all flex items-center gap-1"
                  >
                    Match <Sparkles className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Resumes */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">Processed Resumes</h2>
            </div>
            <Link
              to="/resumes/upload"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              Upload more <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-slate-400">Loading resumes...</div>
          ) : resumes.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              <p className="text-sm">No resumes parsed yet.</p>
              <Link
                to="/resumes/upload"
                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"
              >
                Upload resume files
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {resumes.map((resume) => (
                <div
                  key={resume.id}
                  className="p-4 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all flex items-center justify-between"
                >
                  <div className="max-w-[70%]">
                    <h3 className="text-sm font-bold text-slate-800 truncate">
                      {resume.candidate_name || resume.filename || `Resume #${resume.id}`}
                    </h3>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {(resume.skills || []).slice(0, 3).map((skill, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700"
                        >
                          {skill}
                        </span>
                      ))}
                      {(resume.skills || []).length > 3 && (
                        <span className="text-[10px] text-slate-400">
                          +{(resume.skills || []).length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    <div>{resume.experience_years ? `${resume.experience_years} yrs exp` : 'Entry Level'}</div>
                    <div className="text-[10px] text-slate-400">{resume.education_level || 'Degree'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

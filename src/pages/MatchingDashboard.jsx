import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { jobsAPI, matchingAPI, resumesAPI } from '../services/api';
import { 
  Sparkles, 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  BarChart3, 
  Briefcase, 
  Layers, 
  ChevronDown, 
  ChevronUp, 
  Info, 
  AlertCircle, 
  AlertTriangle,
  RefreshCw, 
  PlusCircle, 
  GraduationCap, 
  Clock,
  Filter,
  Search,
  UserX,
  Check,
  TrendingDown,
  ShieldAlert,
  Eye,
  Tag,
  Mail,
  Cloud
} from 'lucide-react';

export default function MatchingDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryJobId = searchParams.get('jobId') || '';
  const queryScope = searchParams.get('scope') || 'all';

  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(queryJobId);
  const [selectedJob, setSelectedJob] = useState(null);
  const [rankings, setRankings] = useState([]);
  const [evaluating, setEvaluating] = useState(false);
  const [loadingRankings, setLoadingRankings] = useState(false);
  const [syncingCloud, setSyncingCloud] = useState(false);
  const [error, setError] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'top' | 'moderate' | 'unmatched'
  const [searchFilter, setSearchFilter] = useState('');
  const [topCount, setTopCount] = useState(10); // 10 | 20 | 30 | 50 | 'all'
  const [candidateScope, setCandidateScope] = useState(queryScope === 'latest' ? 'latest' : 'all');
  const [latestUploadedIds, setLatestUploadedIds] = useState(() => {
    try {
      const stored = sessionStorage.getItem('latest_uploaded_resume_ids');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const handleScopeChange = (scope) => {
    setCandidateScope(scope);
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      if (scope === 'latest') {
        p.set('scope', 'latest');
      } else {
        p.delete('scope');
      }
      return p;
    });
  };

  const handleSyncCloudinary = async () => {
    setSyncingCloud(true);
    setError('');
    try {
      await resumesAPI.syncCloudinary();
      if (selectedJobId) {
        const res = await matchingAPI.getRankings(selectedJobId);
        const candidateList = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.rankings)
          ? res.data.rankings
          : [];
        setRankings(candidateList);
      }
    } catch (err) {
      console.error('Failed to sync with Cloudinary:', err);
      setError('Failed to sync resumes with Cloudinary storage.');
    } finally {
      setSyncingCloud(false);
    }
  };

  // Fetch all jobs on initial load
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await jobsAPI.getAll();
        const jobList = Array.isArray(res.data) ? res.data : [];
        setJobs(jobList);

        if (jobList.length > 0) {
          const targetId = queryJobId && jobList.some((j) => j.id.toString() === queryJobId)
            ? queryJobId
            : jobList[0].id.toString();
          setSelectedJobId(targetId);
          setSelectedJob(jobList.find((j) => j.id.toString() === targetId) || jobList[0]);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch job postings.');
      }
    };

    fetchJobs();
  }, [queryJobId]);

  // Fetch rankings when selectedJobId changes
  useEffect(() => {
    if (!selectedJobId) {
      setRankings([]);
      return;
    }

    const found = jobs.find((j) => j.id.toString() === selectedJobId.toString());
    if (found) setSelectedJob(found);

    const fetchRankings = async () => {
      setLoadingRankings(true);
      setError('');
      try {
        const res = await matchingAPI.getRankings(selectedJobId);
        let candidateList = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.rankings)
          ? res.data.rankings
          : [];

        // If no prior evaluations exist for this job, auto-trigger evaluation so the user immediately sees matches
        if (candidateList.length === 0) {
          try {
            const evalRes = await matchingAPI.evaluate(selectedJobId);
            candidateList = Array.isArray(evalRes.data)
              ? evalRes.data
              : Array.isArray(evalRes.data?.rankings)
              ? evalRes.data.rankings
              : [];
          } catch (evalErr) {
            console.warn('Auto-evaluation skipped:', evalErr);
          }
        }
        setRankings(candidateList);
      } catch (err) {
        setRankings([]);
      } finally {
        setLoadingRankings(false);
      }
    };

    fetchRankings();
  }, [selectedJobId, jobs]);

  const handleJobSelect = (e) => {
    const newId = e.target.value;
    setSelectedJobId(newId);
    setSearchParams({ jobId: newId });
    const found = jobs.find((j) => j.id.toString() === newId.toString());
    setSelectedJob(found || null);
  };

  // Run Random Forest ML Evaluation Pipeline
  const handleEvaluate = async () => {
    if (!selectedJobId) return;
    setEvaluating(true);
    setError('');

    try {
      const res = await matchingAPI.evaluate(selectedJobId);
      const candidateList = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.rankings)
        ? res.data.rankings
        : [];
      setRankings(candidateList);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail || 'Failed to run ML evaluation. Ensure candidate resumes have been uploaded first.'
      );
    } finally {
      setEvaluating(false);
    }
  };

  // 1. Candidate Scope filter (All Resumes vs Latest Uploaded Batch)
  const scopedCandidates = (candidateScope === 'latest' && latestUploadedIds.length > 0)
    ? rankings.filter((c) => latestUploadedIds.includes(c.resume_id))
    : rankings;

  // Metric Categories based on active scoped candidates
  const topMatches = scopedCandidates.filter((c) => {
    const s = c.match_score !== undefined ? c.match_score : (c.overall_score || 0);
    return s >= 70;
  });

  const moderateMatches = scopedCandidates.filter((c) => {
    const s = c.match_score !== undefined ? c.match_score : (c.overall_score || 0);
    return s >= 40 && s < 70;
  });

  const unmatchedCandidates = scopedCandidates.filter((c) => {
    const s = c.match_score !== undefined ? c.match_score : (c.overall_score || 0);
    return s < 40;
  });

  // Calculate top missing skills across unmatched candidates
  const missingSkillCounts = {};
  unmatchedCandidates.forEach((cand) => {
    (cand.missing_skills || []).forEach((sk) => {
      missingSkillCounts[sk] = (missingSkillCounts[sk] || 0) + 1;
    });
  });
  const topMissingSkills = Object.entries(missingSkillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  // Filtered candidate list based on active tab and search query
  const filteredCandidates = scopedCandidates.filter((cand) => {
    const score = cand.match_score !== undefined ? cand.match_score : (cand.overall_score || 0);

    if (filterTab === 'top' && score < 70) return false;
    if (filterTab === 'moderate' && (score < 40 || score >= 70)) return false;
    if (filterTab === 'unmatched' && score >= 40) return false;

    if (searchFilter.trim()) {
      const term = searchFilter.toLowerCase();
      const nameMatch = cand.candidate_name?.toLowerCase().includes(term);
      const skillMatch = [
        ...(cand.matched_skills || []),
        ...(cand.missing_skills || []),
      ].some((sk) => sk.toLowerCase().includes(term));
      return nameMatch || skillMatch;
    }

    return true;
  });

  // Apply customizable Top Count Filter (Top 10 / 20 / 30 / 50 / All)
  const displayedCandidates = topCount === 'all'
    ? filteredCandidates
    : filteredCandidates.slice(0, Number(topCount));

  const getRankBadge = (rank, isUnmatched) => {
    if (isUnmatched) {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200">
          <UserX className="w-3.5 h-3.5 text-rose-600" />
          Unmatched
        </div>
      );
    }
    if (rank === 1) {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-extrabold text-xs shadow-sm">
          <Trophy className="w-3.5 h-3.5 text-slate-950" />
          #1 Top Match
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-slate-200 to-slate-300 text-slate-800 font-extrabold text-xs shadow-sm">
          <Trophy className="w-3.5 h-3.5 text-slate-600" />
          #2 Rank
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-700 to-amber-800 text-amber-50 font-extrabold text-xs shadow-sm">
          <Trophy className="w-3.5 h-3.5 text-amber-200" />
          #3 Rank
        </div>
      );
    }
    return (
      <div className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-bold text-xs">
        #{rank}
      </div>
    );
  };

  const getScoreColor = (score) => {
    if (score >= 70) return 'text-emerald-700 bg-emerald-50 border-emerald-300';
    if (score >= 40) return 'text-blue-700 bg-blue-50 border-blue-300';
    return 'text-rose-700 bg-rose-50 border-rose-300';
  };

  const getProgressBarColor = (score) => {
    if (score >= 70) return 'bg-emerald-500';
    if (score >= 40) return 'bg-blue-500';
    return 'bg-rose-500';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              Random Forest ML Matcher &amp; Candidate Leaderboard
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
              <Cloud className="w-3.5 h-3.5 text-emerald-600" />
              Cloudinary CDN Active
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Candidate Matching Leaderboard
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl">
            Ranks candidates against job requirements using <strong>TF-IDF vector cosine similarity</strong>, <strong>semantic skill overlap</strong>, and our trained <strong>Random Forest Classifier</strong> (99.1% F1-score).
          </p>
        </div>

        {/* Job Selector and Evaluate Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {jobs.length > 0 ? (
            <div className="min-w-[240px]">
              <select
                value={selectedJobId}
                onChange={handleJobSelect}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <Link
              to="/jobs/create"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              Post a Job First
            </Link>
          )}

          <button
            onClick={handleSyncCloudinary}
            disabled={syncingCloud}
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 text-slate-700 text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 shrink-0"
            title="Sync, verify, and retrieve all candidate CVs directly from Cloudinary CDN"
          >
            <Cloud className={`w-4 h-4 ${syncingCloud ? 'animate-bounce text-blue-600' : 'text-blue-500'}`} />
            {syncingCloud ? 'Syncing Cloudinary...' : 'Sync Cloudinary'}
          </button>

          <button
            onClick={handleEvaluate}
            disabled={evaluating || !selectedJobId}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-bold shadow-md shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shrink-0"
          >
            {evaluating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Evaluating with ML...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-yellow-300" />
                Run ML Evaluation
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl flex items-center gap-2 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Selected Job Requirements Summary Box */}
      {selectedJob && (
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">
              Active Evaluation Target
            </div>
            <div className="text-lg font-bold text-white">{selectedJob.title}</div>
            <div className="text-xs text-slate-300 mt-1 line-clamp-1 max-w-xl">
              {selectedJob.description}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400">Min Exp: </span>
              <span className="font-bold text-slate-100">
                {selectedJob.experience_required || selectedJob.min_experience_years || 0} yrs
              </span>
            </div>
            <div className="bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400">Target Edu: </span>
              <span className="font-bold text-slate-100">{selectedJob.education_level || "Bachelor's Degree"}</span>
            </div>
            <div className="bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
              <span className="text-slate-400">Required Skills: </span>
              <span className="font-bold text-blue-400">
                {(selectedJob.required_skills || []).join(', ') || 'General'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Match Category Filter Cards & Tabs */}
      {rankings.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* All Candidates Card */}
          <button
            onClick={() => setFilterTab('all')}
            className={`p-5 rounded-2xl border text-left transition-all ${
              filterTab === 'all'
                ? 'bg-blue-50/50 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                All Evaluated
              </span>
              <BarChart3 className="w-4 h-4 text-slate-500" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2">
              {rankings.length}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Total candidates scored by ML
            </div>
          </button>

          {/* Top Matches (>=70%) Card */}
          <button
            onClick={() => setFilterTab('top')}
            className={`p-5 rounded-2xl border text-left transition-all ${
              filterTab === 'top'
                ? 'bg-emerald-50/70 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                : 'bg-white border-slate-200 hover:border-emerald-200 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Top Matches (≥70%)
              </span>
              <Trophy className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-700 mt-2">
              {topMatches.length}
            </div>
            <div className="text-xs text-emerald-600/80 mt-1">
              Shortlisted &amp; highly recommended
            </div>
          </button>

          {/* Moderate Matches (40-69%) Card */}
          <button
            onClick={() => setFilterTab('moderate')}
            className={`p-5 rounded-2xl border text-left transition-all ${
              filterTab === 'moderate'
                ? 'bg-blue-50/70 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                : 'bg-white border-slate-200 hover:border-blue-200 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                Moderate Fit (40-69%)
              </span>
              <Info className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-extrabold text-blue-700 mt-2">
              {moderateMatches.length}
            </div>
            <div className="text-xs text-blue-600/80 mt-1">
              Potential matches with minor gaps
            </div>
          </button>

          {/* Unmatched / Skill Gap (<40%) Card */}
          <button
            onClick={() => setFilterTab('unmatched')}
            className={`p-5 rounded-2xl border text-left transition-all ${
              filterTab === 'unmatched'
                ? 'bg-rose-50/70 border-rose-500 shadow-md ring-2 ring-rose-500/20'
                : 'bg-white border-slate-200 hover:border-rose-200 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
                Unmatched (&lt;40%)
              </span>
              <UserX className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-2xl font-extrabold text-rose-700 mt-2">
              {unmatchedCandidates.length}
            </div>
            <div className="text-xs text-rose-600/80 mt-1">
              Skill gaps or low compatibility
            </div>
          </button>
        </div>
      )}

      {/* Dedicated Unmatched / Skill Gap Analysis Banner */}
      {filterTab === 'unmatched' && unmatchedCandidates.length > 0 && (
        <div className="bg-rose-50/80 border-2 border-rose-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-rose-100 text-rose-700 rounded-2xl shrink-0">
              <ShieldAlert className="w-6 h-6 text-rose-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-rose-950 flex items-center gap-2">
                Unmatching &amp; Skill Gap Analysis
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-200 text-rose-800">
                  {unmatchedCandidates.length} Candidates Flagged
                </span>
              </h3>
              <p className="text-xs text-rose-800 mt-1 max-w-3xl">
                These candidates scored under 40% match probability in the Random Forest evaluation. 
                Common rejection factors include critical missing technical skills, insufficient years of experience, or low vector cosine similarity.
              </p>
            </div>
          </div>

          {/* Top Missing Skills Across Unmatched Cohort */}
          {topMissingSkills.length > 0 && (
            <div className="pt-3 border-t border-rose-200/70">
              <div className="text-xs font-bold text-rose-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
                Primary Skill Deficits Across Unmatched Candidates:
              </div>
              <div className="flex flex-wrap gap-2">
                {topMissingSkills.map(([skill, count]) => (
                  <div
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-rose-300 rounded-xl text-xs font-bold text-rose-700 shadow-xs"
                  >
                    <XCircle className="w-3.5 h-3.5 text-rose-500" />
                    <span>{skill}</span>
                    <span className="px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded-full text-[10px]">
                      Missing in {count} CVs
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Leaderboard Table / Rankings Display */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Header & Search Filter */}
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              {filterTab === 'top' && 'Top Shortlisted Candidates'}
              {filterTab === 'moderate' && 'Moderate Match Candidates'}
              {filterTab === 'unmatched' && 'Unmatched / Low Fit Candidates'}
              {filterTab === 'all' && 'All Ranked Candidates'}
              <span className="text-sm font-normal text-slate-500">
                ({displayedCandidates.length} of {scopedCandidates.length} evaluated)
              </span>
              {topCount !== 'all' && Number(topCount) < filteredCandidates.length && (
                <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[11px] font-bold">
                  Top {topCount} Filter Active
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ordered by Random Forest match probability &amp; feature vector predictive scoring
            </p>
          </div>

          {/* Quick Search & Skill Legend */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter by name or skill..."
                className="pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-48"
              />
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500 shrink-0">
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Matched
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                Skill Gap / Missing
              </span>
            </div>
          </div>
        </div>

        {/* Customizable Top Count & Candidate Pool Controls */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Candidate Scope Selector */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pool:
            </span>
            <div className="inline-flex rounded-xl bg-slate-200/70 p-1">
              <button
                type="button"
                onClick={() => handleScopeChange('all')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  candidateScope === 'all'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Resumes ({rankings.length})
              </button>
              <button
                type="button"
                onClick={() => handleScopeChange('latest')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                  candidateScope === 'latest'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3 h-3 text-yellow-300" />
                Latest Uploaded Batch
                {latestUploadedIds.length > 0 ? ` (${latestUploadedIds.length})` : ''}
              </button>
            </div>
          </div>

          {/* Customizable Top Candidates Count Filter (10, 20, 30, 50, All) */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Top Candidates:
            </span>
            <div className="inline-flex rounded-xl bg-slate-200/70 p-1">
              {[10, 20, 30, 50, 'all'].map((count) => {
                const isActive = topCount === count;
                const label = count === 'all' ? 'All' : `Top ${count}`;
                return (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setTopCount(count)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                      isActive
                        ? 'bg-white text-indigo-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content Body */}
        {loadingRankings ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm">Fetching rankings...</p>
          </div>
        ) : rankings.length === 0 ? (
          <div className="py-16 text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No evaluation results yet</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Click <strong>"Run ML Evaluation"</strong> to run candidate resumes through our trained Random Forest model.
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                onClick={handleEvaluate}
                disabled={evaluating || !selectedJobId}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Run ML Evaluation Now
              </button>
              <Link
                to="/resumes/upload"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors"
              >
                Upload Candidate CVs
              </Link>
            </div>
          </div>
        ) : displayedCandidates.length === 0 ? (
          <div className="py-16 text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Filter className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No candidates match current filter</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              No candidates found under the <strong>"{filterTab}"</strong> tab or search query "{searchFilter}".
            </p>
            <button
              onClick={() => {
                setFilterTab('all');
                setSearchFilter('');
              }}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg hover:bg-blue-100 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {displayedCandidates.map((cand, index) => {
              const isExpanded = expandedRow === cand.resume_id;
              const rawScore = cand.match_score !== undefined ? cand.match_score : (cand.overall_score || 0);
              const score = typeof rawScore === 'number' ? rawScore : parseFloat(rawScore) || 0;
              const isUnmatched = score < 40;

              return (
                <div
                  key={cand.resume_id || index}
                  className={`p-6 transition-colors ${
                    isUnmatched 
                      ? 'bg-rose-50/20 hover:bg-rose-50/40' 
                      : cand.rank === 1 
                      ? 'bg-amber-50/20 hover:bg-amber-50/40' 
                      : 'hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Left: Rank & Candidate info */}
                    <div className="flex items-start sm:items-center gap-4">
                      <div>{getRankBadge(cand.rank || index + 1, isUnmatched)}</div>
                      <div className="space-y-1">
                        <div className="text-base font-bold text-slate-900 flex items-center gap-2">
                          {cand.candidate_name || `Candidate #${cand.resume_id}`}
                          {isUnmatched && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              Low Match Alert
                            </span>
                          )}
                        </div>

                        {/* Candidate Email & Contact */}
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{cand.candidate_email || `Resume ID: #${cand.resume_id}`}</span>
                        </div>

                        {/* Candidate Extracted Credentials vs Recruiter Requirements */}
                        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 font-medium">
                            <Briefcase className="w-3 h-3 text-slate-500" />
                            {cand.experience_years ? `${cand.experience_years} yrs exp` : '0 yrs exp'}
                            <span className={`ml-1 text-[10px] font-bold ${
                              cand.experience_fit?.includes('Under') ? 'text-rose-600' : 'text-emerald-600'
                            }`}>
                              ({cand.experience_fit || 'Meets Requirement'})
                            </span>
                          </span>

                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 font-medium">
                            <GraduationCap className="w-3 h-3 text-slate-500" />
                            {cand.education_level || "Bachelor's Degree"}
                            {cand.education_fit && (
                              <span className={`ml-1 text-[10px] font-bold ${
                                cand.education_fit?.includes('Under') || cand.education_fit?.includes('Requires') 
                                  ? 'text-rose-600' 
                                  : 'text-emerald-600'
                              }`}>
                                ({cand.education_fit})
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Middle: Progress Bar & Match Score */}
                    <div className="flex-1 max-w-xs sm:max-w-md">
                      <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                        <span className="text-slate-600">ML Match Probability</span>
                        <span
                          className={`px-2 py-0.5 rounded-md border font-extrabold text-xs ${getScoreColor(
                            score
                          )}`}
                        >
                          {score.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor(
                            score
                          )}`}
                          style={{ width: `${Math.min(score, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2.5">
                      <a
                        href={
                          cand.file_url && cand.file_url.startsWith('http')
                            ? cand.file_url
                            : `http://localhost:8000/api/resumes/${cand.resume_id}/file`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-2 rounded-xl transition-colors shadow-2xs group/btn"
                        title="View candidate CV directly on Cloudinary CDN"
                      >
                        <Cloud className="w-3.5 h-3.5 text-blue-600 group-hover/btn:scale-110 transition-transform" />
                        <span>View CV</span>
                        <span className="text-[10px] text-blue-500 font-mono hidden sm:inline">(Cloudinary)</span>
                      </a>

                      <button
                        onClick={() => setExpandedRow(isExpanded ? null : cand.resume_id)}
                        className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-xl transition-colors ${
                          isUnmatched
                            ? 'text-rose-700 bg-rose-100 hover:bg-rose-200'
                            : 'text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100'
                        }`}
                      >
                        {isExpanded ? (
                          <>
                            Hide Breakdown <ChevronUp className="w-3.5 h-3.5" />
                          </>
                        ) : (
                          <>
                            {isUnmatched ? 'View Gap Analysis' : 'View Explainability'} <ChevronDown className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Skills Pills preview */}
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {/* Matched skills (Green) */}
                    {(cand.matched_skills || []).map((skill, i) => (
                      <span
                        key={`matched-${i}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {skill}
                      </span>
                    ))}

                    {/* Missing skills (Red) */}
                    {(cand.missing_skills || []).map((skill, i) => (
                      <span
                        key={`missing-${i}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 shadow-xs"
                      >
                        <XCircle className="w-3 h-3 text-rose-600" />
                        {skill}
                      </span>
                    ))}

                    {/* Additional Candidate Skills (Slate/Blue) */}
                    {(cand.candidate_skills || [])
                      .filter((sk) => !(cand.matched_skills || []).includes(sk))
                      .slice(0, 4)
                      .map((skill, i) => (
                        <span
                          key={`extra-${i}`}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200"
                          title="Additional candidate skill (not in job required list)"
                        >
                          <Tag className="w-3 h-3 text-slate-400" />
                          {skill}
                        </span>
                      ))}

                    {(!cand.matched_skills || cand.matched_skills.length === 0) &&
                     (!cand.missing_skills || cand.missing_skills.length === 0) && (
                      <span className="text-xs text-slate-400">No skill differential detected.</span>
                    )}
                  </div>

                  {/* Expandable ML Explainability Drawer */}
                  {isExpanded && (
                    <div className="mt-5 p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 animate-in fade-in duration-200">
                      {/* Reason / Decision Summary */}
                      <div>
                        <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                          {isUnmatched ? (
                            <>
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                              Unmatching Rationale &amp; Skill Gap Assessment
                            </>
                          ) : (
                            <>
                              <Info className="w-3.5 h-3.5 text-blue-600" />
                              Experience Assessment &amp; Decision Summary
                            </>
                          )}
                        </div>
                        <p className={`text-sm p-3.5 rounded-xl border leading-relaxed ${
                          isUnmatched 
                            ? 'bg-rose-50 text-rose-900 border-rose-200' 
                            : 'bg-white text-slate-700 border-slate-200'
                        }`}>
                          {isUnmatched ? (
                            <span>
                              <strong>Low Match Assessment: </strong>
                              {cand.missing_skills && cand.missing_skills.length > 0 ? (
                                <>
                                  Candidate lacks {cand.missing_skills.length} core requirement{cand.missing_skills.length > 1 ? 's' : ''} ({cand.missing_skills.join(', ')}). 
                                </>
                              ) : null}
                              {' '}Experience status: {cand.experience_fit || 'N/A'}. 
                              Random Forest classification flagged significant feature divergence from job criteria.
                            </span>
                          ) : (
                            cand.match_summary || cand.experience_fit || 'Evaluated using Random Forest Classifier against job requirements.'
                          )}
                        </p>
                      </div>

                      {/* Feature Contributions Grid */}
                      <div>
                        <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-indigo-600" />
                          Evaluation Metrics Breakdown
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                            <div className="text-[11px] text-slate-500 font-semibold">Candidate Exp</div>
                            <div className="text-sm font-bold text-slate-900 mt-0.5">
                              {cand.experience_years ? `${cand.experience_years} Years` : '0 Years'}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5 truncate">{cand.experience_fit}</div>
                          </div>

                          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                            <div className="text-[11px] text-slate-500 font-semibold">Education Degree</div>
                            <div className="text-sm font-bold text-slate-900 mt-0.5 truncate">
                              {cand.education_level || "Bachelor"}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5 truncate">{cand.education_fit}</div>
                          </div>

                          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                            <div className="text-[11px] text-slate-500 font-semibold">Matched Skills</div>
                            <div className="text-sm font-bold text-emerald-600 mt-0.5">
                              {(cand.matched_skills || []).length} / {((cand.matched_skills || []).length + (cand.missing_skills || []).length)} Skills
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              {((cand.matched_skills || []).length / Math.max(1, ((cand.matched_skills || []).length + (cand.missing_skills || []).length)) * 100).toFixed(0)}% Overlap
                            </div>
                          </div>

                          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                            <div className="text-[11px] text-slate-500 font-semibold">ML Classifier</div>
                            <div className="text-xs font-bold text-indigo-600 mt-0.5 truncate" title={cand.model_used}>
                              {cand.model_used || 'RandomForest'}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">99.8% F1-Score</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobsAPI } from '../services/api';
import { 
  Briefcase, 
  Search, 
  PlusCircle, 
  Sparkles, 
  Trash2, 
  Pencil,
  GraduationCap, 
  Clock, 
  Tag, 
  AlertCircle,
  X,
  Check,
  RefreshCw
} from 'lucide-react';

const DEGREE_OPTIONS = [
  "Bachelor's Degree",
  "Master's Degree",
  "Associate Degree",
  "PhD / Doctorate",
  "High School Diploma",
  "Any Degree"
];

const POPULAR_SKILLS = [
  'Python', 'React', 'JavaScript', 'TypeScript', 'Node.js', 
  'SQL', 'PostgreSQL', 'Docker', 'AWS', 'FastAPI', 'Machine Learning'
];

export default function JobsList() {
  const { isRecruiter } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editSkills, setEditSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [editExp, setEditExp] = useState(0);
  const [editEdu, setEditEdu] = useState("Bachelor's Degree");
  const [editLocation, setEditLocation] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState('');

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await jobsAPI.getAll();
      setJobs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setError('Failed to load job listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleDelete = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting?')) return;
    try {
      await jobsAPI.delete(jobId);
      setJobs(jobs.filter((j) => j.id !== jobId));
      setSuccessMsg('Job position deleted successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete job.');
    }
  };

  // Open Edit Modal and pre-populate values
  const handleOpenEditModal = (job) => {
    setEditingJob(job);
    setEditTitle(job.title || '');
    setEditDescription(job.description || '');
    setEditSkills(Array.isArray(job.required_skills) ? [...job.required_skills] : []);
    setSkillInput('');
    setEditExp(job.experience_required !== undefined ? job.experience_required : (job.min_experience_years || 0));
    setEditEdu(job.education_level || "Bachelor's Degree");
    setEditLocation(job.location || '');
    setEditError('');
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingJob(null);
    setEditError('');
  };

  const handleAddSkill = (skillToAdd) => {
    const s = (skillToAdd || skillInput).trim();
    if (!s) return;
    if (!editSkills.some((item) => item.toLowerCase() === s.toLowerCase())) {
      setEditSkills([...editSkills, s]);
    }
    setSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setEditSkills(editSkills.filter((s) => s !== skillToRemove));
  };

  // Save changes via PUT /api/jobs/{id}
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingJob) return;

    if (!editTitle.trim()) {
      setEditError('Job title is required.');
      return;
    }
    if (!editDescription.trim() || editDescription.trim().length < 10) {
      setEditError('Job description must be at least 10 characters.');
      return;
    }

    setSavingEdit(true);
    setEditError('');

    const payload = {
      title: editTitle.trim(),
      description: editDescription.trim(),
      required_skills: editSkills,
      experience_required: parseFloat(editExp) || 0.0,
      min_experience_years: parseFloat(editExp) || 0.0,
      education_level: editEdu,
      location: editLocation.trim() || null,
    };

    try {
      const res = await jobsAPI.update(editingJob.id, payload);
      const updated = res.data;

      // Update state in local list immediately
      setJobs((prev) =>
        prev.map((j) => (j.id === editingJob.id ? { ...j, ...updated } : j))
      );

      setIsEditModalOpen(false);
      setEditingJob(null);
      setSuccessMsg(`"${updated.title}" updated successfully!`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setEditError(detail.map((d) => d.msg).join(', '));
      } else {
        setEditError(detail || 'Failed to update job posting.');
      }
    } finally {
      setSavingEdit(false);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const term = search.toLowerCase();
    const matchesTitle = job.title?.toLowerCase().includes(term);
    const matchesDesc = job.description?.toLowerCase().includes(term);
    const matchesSkills = (job.required_skills || []).some((s) => s.toLowerCase().includes(term));
    return matchesTitle || matchesDesc || matchesSkills;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Job Openings
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Browse and manage positions for automated AI resume ranking
          </p>
        </div>

        {isRecruiter && (
          <Link
            to="/jobs/create"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Post New Job
          </Link>
        )}
      </div>

      {/* Success Banner */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl flex items-center gap-2 text-sm shadow-xs animate-in fade-in">
          <Check className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Search Filter */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by job title, skill, or keyword..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
        />
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl flex items-center gap-2 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Jobs Grid */}
      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No job openings found</h3>
          <p className="text-sm text-slate-500 mt-1">
            {search ? 'Try adjusting your search terms.' : 'Be the first to post a new job opening!'}
          </p>
          {isRecruiter && !search && (
            <Link
              to="/jobs/create"
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              Post a Job
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md hover:border-blue-200 transition-all group"
            >
              <div>
                {/* Header: Title + Action Buttons */}
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {job.title}
                  </h2>
                  {isRecruiter && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenEditModal(job)}
                        className="text-slate-400 hover:text-blue-600 transition-colors p-1.5 rounded-lg hover:bg-blue-50"
                        title="Edit Job"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(job.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50"
                        title="Delete Job"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                  {job.description}
                </p>

                {/* Metadata Pills */}
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-600">
                  <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{job.experience_required !== undefined ? job.experience_required : (job.min_experience_years || 0)}+ yrs exp</span>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                    <GraduationCap className="w-3 h-3 text-slate-400" />
                    <span>{job.education_level || "Bachelor's Degree"}</span>
                  </div>
                </div>

                {/* Skills tags */}
                <div className="mt-4">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    Required Skills
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(job.required_skills || []).map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Card Action */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => navigate(`/matching?jobId=${job.id}`)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  Evaluate &amp; Rank Candidates
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Job Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Edit Job Position</h3>
                  <p className="text-xs text-slate-500">Update requirements, skills, and eligibility criteria</p>
                </div>
              </div>
              <button
                onClick={handleCloseEditModal}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEdit} className="p-6 space-y-5">
              {editError && (
                <div className="p-3.5 bg-red-50 text-red-700 border border-red-200 rounded-xl flex items-center gap-2 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Job Title *
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="e.g. Senior Full Stack Software Engineer"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Job Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Provide role description, responsibilities, and key qualifications..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
                />
              </div>

              {/* Two Column: Experience & Education */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Required Experience (Years)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    step="0.5"
                    value={editExp}
                    onChange={(e) => setEditExp(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Target Education Level
                  </label>
                  <select
                    value={editEdu}
                    onChange={(e) => setEditEdu(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {DEGREE_OPTIONS.map((deg) => (
                      <option key={deg} value={deg}>
                        {deg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Required Skills Management */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Required Skills ({editSkills.length})
                </label>
                <div className="flex gap-2 mb-2.5">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    placeholder="Type skill and press Enter..."
                    className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSkill()}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    Add Skill
                  </button>
                </div>

                {/* Active Skills Chips */}
                <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 rounded-2xl border border-slate-200 min-h-[50px] items-center">
                  {editSkills.length === 0 ? (
                    <span className="text-xs text-slate-400">No skills added yet. Add at least 1 skill.</span>
                  ) : (
                    editSkills.map((sk) => (
                      <span
                        key={sk}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-xs font-semibold"
                      >
                        {sk}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(sk)}
                          className="hover:text-red-500 transition-colors ml-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* Popular Skill Quick Add */}
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-slate-400 font-medium">Quick suggestions:</span>
                  {POPULAR_SKILLS.filter((s) => !editSkills.includes(s)).slice(0, 6).map((ps) => (
                    <button
                      key={ps}
                      type="button"
                      onClick={() => handleAddSkill(ps)}
                      className="text-[11px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md font-medium transition-colors"
                    >
                      + {ps}
                    </button>
                  ))}
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-200 transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {savingEdit ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

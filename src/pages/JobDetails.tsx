import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    Briefcase, MapPin, DollarSign, Calendar, Globe, ExternalLink,
    User, Mail, Phone, Linkedin, ChevronLeft, Save, Edit2,
    CheckCircle, List, Trophy, AlertCircle, FileText, Eye, Trash2, X, Download
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { useJobsStore, useResumeStore } from '../stores'
import { Button, Card, Input } from '../components/ui'
import { supabase } from '../lib/supabase'
import { showToast, toastMessages } from '../utils/toast'
import type { SavedJob, GeneratedDocument } from '../types'
import GeneratedResumePreview from '../components/GeneratedResumePreview'
import CoverLetterPreview from '../components/CoverLetterPreview'
import DocumentPreviewModal from '../components/DocumentPreviewModal'

export default function JobDetails() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { savedJobs, updateJob, removeSavedJob } = useJobsStore()
    const { primaryResume } = useResumeStore()
    const [job, setJob] = useState<SavedJob | null>(null)
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [documents, setDocuments] = useState<GeneratedDocument[]>([])
    const [selectedDoc, setSelectedDoc] = useState<GeneratedDocument | null>(null)
    const [isDeleting, setIsDeleting] = useState<string | null>(null)

    // Form state for editable fields
    const [formData, setFormData] = useState({
        contact_name: '',
        contact_email: '',
        recruiter_phone: '',
        recruiter_linkedin: '',
        company_url: '',
        notes: ''
    })

    // Calculate Match Score
    const matchData = useMemo(() => {
        if (!job || !primaryResume || !primaryResume.extracted_skills) return null;

        const jobSkills = job.skills_required.map(s => s.toLowerCase());
        const resumeSkills = primaryResume.extracted_skills.map(s => s.toLowerCase());

        if (jobSkills.length === 0) return { score: 0, matched: [], missing: [] };

        const matched = job.skills_required.filter(skill =>
            resumeSkills.includes(skill.toLowerCase())
        );

        const missing = job.skills_required.filter(skill =>
            !resumeSkills.includes(skill.toLowerCase())
        );

        const score = Math.round((matched.length / jobSkills.length) * 100);

        return { score, matched, missing };
    }, [job, primaryResume]);

    useEffect(() => {
        if (!id) return;

        const foundJob = savedJobs.find(j => j.id === id)
        if (foundJob) {
            setJob(foundJob)
            setFormData({
                contact_name: foundJob.contact_name || '',
                contact_email: foundJob.contact_email || '',
                recruiter_phone: foundJob.recruiter_phone || '',
                recruiter_linkedin: foundJob.recruiter_linkedin || '',
                company_url: foundJob.company_url || '',
                notes: foundJob.notes || ''
            })
            setLoading(false)
            fetchDocuments(id)
        } else {
            // Fallback fetch from DB if not in store (e.g. direct link)
            fetchJobFromDb(id)
            fetchDocuments(id)
        }
    }, [id, savedJobs])

    const fetchDocuments = async (jobId: string) => {
        try {
            const { data, error } = await supabase
                .from('generated_documents')
                .select('*')
                .eq('job_id', jobId)
                .order('created_at', { ascending: false })

            if (error) throw error
            setDocuments(data || [])
        } catch (error) {
            console.error('Error fetching documents:', error)
        }
    }

    const fetchJobFromDb = async (jobId: string) => {
        try {
            const { data, error } = await supabase
                .from('saved_jobs')
                .select('*')
                .eq('id', jobId)
                .single()

            if (error) throw error
            if (data) {
                setJob(data)
                setFormData({
                    contact_name: data.contact_name || '',
                    contact_email: data.contact_email || '',
                    recruiter_phone: data.recruiter_phone || '',
                    recruiter_linkedin: data.recruiter_linkedin || '',
                    company_url: data.company_url || '',
                    notes: data.notes || ''
                })
            }
        } catch (error) {
            console.error('Error fetching job:', error)
            showToast.error(toastMessages.error.noJobsFound)
            navigate('/jobs')
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        if (!job) return
        setSaving(true)

        const updates = {
            contact_name: formData.contact_name || null,
            contact_email: formData.contact_email || null,
            recruiter_phone: formData.recruiter_phone || null,
            recruiter_linkedin: formData.recruiter_linkedin || null,
            company_url: formData.company_url || null,
            notes: formData.notes || null,
            // Preserve other fields
            updated_at: new Date().toISOString()
        }

        try {
            const { error } = await supabase
                .from('saved_jobs')
                .update(updates)
                .eq('id', job.id)

            if (error) throw error

            const updatedJob = { ...job, ...updates }
            updateJob(updatedJob as SavedJob)
            setJob(updatedJob as SavedJob)
            setEditing(false)
            showToast.success('Job details updated')
        } catch (error) {
            console.error('Error updating job:', error)
            showToast.error('Failed to update job')
        } finally {
            setSaving(false)
        }
    }

    const handleDeleteDocument = async (docId: string) => {
        if (!window.confirm('Are you sure you want to delete this document?')) return

        setIsDeleting(docId)
        try {
            const { error } = await supabase
                .from('generated_documents')
                .delete()
                .eq('id', docId)

            if (error) throw error

            setDocuments(prev => prev.filter(d => d.id !== docId))
            showToast.success('Document deleted')
        } catch (error) {
            console.error('Error deleting document:', error)
            showToast.error('Failed to delete document')
        } finally {
            setIsDeleting(null)
        }
    }

    const handleDeleteJob = async () => {
        if (!job) return;
        const confirmMsg = "Are you sure you want to delete this job? This will also permanently remove all tailored resumes and cover letters associated with it.";
        if (!window.confirm(confirmMsg)) return;

        setSaving(true);
        try {
            // First delete associated documents (safety if no cascade)
            await supabase
                .from('generated_documents')
                .delete()
                .eq('job_id', job.id);

            // Then delete the job
            const { error } = await supabase
                .from('saved_jobs')
                .delete()
                .eq('id', job.id);

            if (error) throw error;

            removeSavedJob(job.id);
            showToast.success('Job and documents deleted successfully');
            navigate('/jobs');
        } catch (error) {
            console.error('Error deleting job:', error);
            showToast.error('Failed to delete job');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center text-white/40">
                Loading job details...
            </div>
        )
    }

    if (!job) return null

    return (
        <div className="animate-fade-in font-['General_Sans',_sans-serif] max-w-5xl mx-auto px-3 md:px-4 lg:px-0 pb-12 md:pb-16">
            {/* Header / Nav - Mobile Optimized */}
            <div className="flex items-center justify-between mb-4 md:mb-6">
                <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="text-white/60 hover:text-white h-9 md:h-10 px-3"
                >
                    <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                    <span className="hidden sm:inline">Back</span>
                </Button>

                <div className="flex gap-2">
                    {!editing ? (
                        <>
                            <Button
                                variant="secondary"
                                onClick={() => setEditing(true)}
                                className="bg-white/5 border border-white/10 text-white h-9 md:h-10 px-3 text-xs md:text-sm"
                            >
                                <Edit2 className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2" />
                                <span className="hidden sm:inline">Edit</span>
                                <span className="sm:hidden">Edit</span>
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={handleDeleteJob}
                                className="bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 h-9 md:h-10 px-3 text-xs md:text-sm"
                            >
                                <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            </Button>
                        </>
                    ) : (
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                onClick={() => setEditing(false)}
                                className="text-white/60 h-9 md:h-10 px-3 text-xs md:text-sm"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                isLoading={saving}
                                className="bg-white text-black hover:bg-white/90 h-9 md:h-10 px-4 text-xs md:text-sm"
                            >
                                <Save className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2" />
                                <span className="hidden sm:inline">Save</span>
                                <span className="sm:hidden">Save</span>
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile: Stack columns, Desktop: 3-column grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-4 md:space-y-6">
                    {/* Job Header Card */}
                    <Card className="border border-white/10 bg-white/5 p-4 md:p-6 backdrop-blur-xl">
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4 mb-4">
                            <div className="flex-1 min-w-0">
                                <h1 className="text-xl md:text-2xl font-semibold text-white mb-2 leading-tight break-words">
                                    {job.title}
                                </h1>
                                <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm text-white/60">
                                    <div className="flex items-center gap-1.5">
                                        <Briefcase className="w-3.5 h-3.5 md:w-4 md:h-4 text-white/40 flex-shrink-0" />
                                        <span className="text-white truncate">{job.company}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 text-white/40 flex-shrink-0" />
                                        <span className="truncate">{job.location}</span>
                                    </div>
                                    {job.posted_at && (
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 text-white/40 flex-shrink-0" />
                                            <span className="whitespace-nowrap">Posted {new Date(job.posted_at).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                <span className={`
                                    px-2.5 py-1 md:px-3 md:py-1 rounded-full text-xs font-medium border whitespace-nowrap
                                    ${job.status === 'applied' ? 'bg-purple-500/10 text-purple-300 border-purple-500/20' :
                                        job.status === 'interviewing' ? 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20' :
                                            job.status === 'offer' ? 'bg-green-500/10 text-green-300 border-green-500/20' :
                                                job.status === 'rejected' ? 'bg-red-500/10 text-red-300 border-red-500/20' :
                                                    'bg-blue-500/10 text-blue-300 border-blue-500/20'}
                                `}>
                                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                                </span>

                                {matchData && (
                                    <div className={`
                                        px-2.5 py-1 md:px-3 md:py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border whitespace-nowrap
                                        ${matchData.score >= 80 ? 'bg-green-500/10 text-green-300 border-green-500/20' :
                                            matchData.score >= 60 ? 'bg-blue-500/10 text-blue-300 border-blue-500/20' :
                                                'bg-white/5 text-white/40 border-white/10'}
                                    `}>
                                        {matchData.score >= 85 && <Trophy className="w-3 h-3" />}
                                        {matchData.score}% Match
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Salary & Type Badges - Mobile Friendly */}
                        <div className="flex flex-wrap gap-2 mb-4 md:mb-6">
                            {(job.salary_min || job.salary_max || job.salary_range) && (
                                <div className="inline-flex items-center px-2.5 py-1.5 md:px-3 md:py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs md:text-sm">
                                    <DollarSign className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2 text-green-400 flex-shrink-0" />
                                    <span className="text-white truncate max-w-[150px] md:max-w-none">
                                        {job.salary_range ||
                                            (job.salary_min && job.salary_max
                                                ? `$${(job.salary_min / 1000).toFixed(0)}k - $${(job.salary_max / 1000).toFixed(0)}k`
                                                : `$${((job.salary_min || 0) / 1000).toFixed(0)}k+`)}
                                    </span>
                                </div>
                            )}
                            {job.job_type && (
                                <div className="inline-flex items-center px-2.5 py-1.5 md:px-3 md:py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs md:text-sm text-white capitalize">
                                    {job.job_type.replace('-', ' ')}
                                </div>
                            )}
                            {job.remote !== undefined && (
                                <div className="inline-flex items-center px-2.5 py-1.5 md:px-3 md:py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs md:text-sm text-white">
                                    {job.remote ? 'Remote' : 'On-site'}
                                </div>
                            )}
                        </div>

                        {/* Quick Actions - Mobile Stacked */}
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 md:pt-6 border-t border-white/5">
                            <Button
                                onClick={() => window.open(job.job_url, '_blank')}
                                className="bg-white text-black hover:bg-white/90 h-10 sm:h-9 text-xs md:text-sm w-full sm:w-auto"
                            >
                                <ExternalLink className="w-3.5 h-3.5 md:w-4 md:h-4 mr-2" />
                                Apply Now
                            </Button>

                            {(formData.company_url || job.company) && (
                                <Button
                                    variant="secondary"
                                    onClick={() => {
                                        const url = formData.company_url || `https://www.google.com/search?q=${encodeURIComponent(job.company)}`;
                                        window.open(url, '_blank');
                                    }}
                                    className="bg-white/5 text-white border-white/10 hover:bg-white/10 h-10 sm:h-9 text-xs md:text-sm w-full sm:w-auto"
                                >
                                    <Globe className="w-3.5 h-3.5 md:w-4 md:h-4 mr-2" />
                                    {formData.company_url ? "Company Website" : "Search Company"}
                                </Button>
                            )}
                        </div>
                    </Card>

                    {/* Job Description */}
                    <Card className="border border-white/10 bg-white/5 p-4 md:p-6 backdrop-blur-xl">
                        <h3 className="text-base md:text-lg font-medium text-white mb-3 md:mb-4 flex items-center gap-2">
                            <List className="w-4 h-4 md:w-5 md:h-5 text-white/50" />
                            Description
                        </h3>
                        <div className="prose prose-invert prose-xs md:prose-sm max-w-none text-white/70">
                            <ReactMarkdown>{job.description}</ReactMarkdown>
                        </div>

                        {job.requirements.length > 0 && (
                            <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-white/5">
                                <h4 className="font-medium text-white mb-2 md:mb-3 text-sm md:text-base">Requirements</h4>
                                <ul className="list-disc list-inside space-y-1 text-xs md:text-sm text-white/70">
                                    {job.requirements.map((req, i) => (
                                        <li key={i} className="break-words">{req}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </Card>

                    {/* Tailored Documents */}
                    <Card className="border border-white/10 bg-white/5 p-4 md:p-6 backdrop-blur-xl">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 mb-3 md:mb-4">
                            <h3 className="text-base md:text-lg font-medium text-white flex items-center gap-2">
                                <FileText className="w-4 h-4 md:w-5 md:h-5 text-white/50" />
                                Tailored Documents
                            </h3>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => navigate('/generate', { state: { jobId: job.id } })}
                                className="bg-white/10 text-white border-white/10 hover:bg-white/20 h-8 md:h-9 px-3 text-xs w-full sm:w-auto"
                            >
                                + Generate New
                            </Button>
                        </div>

                        {documents.length > 0 ? (
                            <div className="grid gap-3 md:gap-4">
                                {documents.map((doc) => (
                                    <div
                                        key={doc.id}
                                        className="flex items-center justify-between p-3 md:p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all group"
                                    >
                                        <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                                            <div className={`p-1.5 md:p-2 rounded-lg flex-shrink-0 ${doc.document_type === 'resume' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>
                                                <FileText className="w-4 h-4 md:w-5 md:h-5" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h4 className="font-medium text-white text-sm md:text-base truncate capitalize">
                                                    {doc.document_type.replace('_', ' ')}
                                                </h4>
                                                <div className="flex items-center gap-1.5 md:gap-2 text-xs text-white/40">
                                                    <span className="whitespace-nowrap">{new Date(doc.created_at).toLocaleDateString()}</span>
                                                    {doc.ats_score && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="text-green-400/80 whitespace-nowrap">{doc.ats_score}% ATS</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
                                            <button
                                                onClick={() => setSelectedDoc(doc)}
                                                className="h-8 w-8 md:h-9 md:w-9 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors border border-white/10"
                                                title="View Document"
                                            >
                                                <Eye className="w-4 h-4 md:w-5 md:h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteDocument(doc.id)}
                                                disabled={!!isDeleting}
                                                className="h-8 w-8 md:h-9 md:w-9 flex items-center justify-center rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors border border-red-500/20 disabled:opacity-50"
                                                title="Delete Document"
                                            >
                                                {isDeleting === doc.id ? (
                                                    <div className="w-3.5 h-3.5 md:w-4 md:h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 md:py-8 bg-white/5 rounded-xl border border-dashed border-white/10">
                                <p className="text-white/30 text-xs md:text-sm px-4">No tailored documents yet.</p>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => navigate('/generate', { state: { jobId: job.id } })}
                                    className="mt-3 md:mt-4 bg-white/10 text-white border-white/10 hover:bg-white/20 h-9 md:h-10 px-4 text-xs w-full sm:w-auto"
                                >
                                    Generate your first resume or cover letter
                                </Button>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Sidebar - Becomes full width on mobile */}
                <div className="space-y-4 md:space-y-6">
                    {/* Recruiter / Contact Info */}
                    <Card className="border border-white/10 bg-white/5 p-4 md:p-6 backdrop-blur-xl">
                        <h3 className="text-base md:text-lg font-medium text-white mb-3 md:mb-4 flex items-center gap-2">
                            <User className="w-4 h-4 md:w-5 md:h-5 text-white/50" />
                            Recruiter & Contact
                        </h3>

                        {editing ? (
                            <div className="space-y-3 md:space-y-4">
                                <Input
                                    label="Contact Name"
                                    icon={<User className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                                    value={formData.contact_name}
                                    onChange={e => setFormData({ ...formData, contact_name: e.target.value })}
                                    placeholder="e.g. Sarah Smith"
                                />
                                <Input
                                    label="Email"
                                    icon={<Mail className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                                    value={formData.contact_email}
                                    onChange={e => setFormData({ ...formData, contact_email: e.target.value })}
                                    placeholder="sarah@company.com"
                                />
                                <Input
                                    label="Phone"
                                    icon={<Phone className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                                    value={formData.recruiter_phone}
                                    onChange={e => setFormData({ ...formData, recruiter_phone: e.target.value })}
                                    placeholder="+1 (555) 000-0000"
                                />
                                <Input
                                    label="LinkedIn URL"
                                    icon={<Linkedin className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                                    value={formData.recruiter_linkedin}
                                    onChange={e => setFormData({ ...formData, recruiter_linkedin: e.target.value })}
                                    placeholder="linkedin.com/in/sarahsmith"
                                />
                                <Input
                                    label="Company Website"
                                    icon={<Globe className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                                    value={formData.company_url}
                                    onChange={e => setFormData({ ...formData, company_url: e.target.value })}
                                    placeholder="https://company.com"
                                />
                            </div>
                        ) : (
                            <div className="space-y-3 md:space-y-4">
                                {(formData.contact_name || formData.contact_email || formData.recruiter_phone || formData.recruiter_linkedin) ? (
                                    <>
                                        {formData.contact_name && (
                                            <div className="flex items-center gap-2 md:gap-3 text-white">
                                                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-xs font-bold">{formData.contact_name.charAt(0)}</span>
                                                </div>
                                                <span className="font-medium text-sm md:text-base truncate">{formData.contact_name}</span>
                                            </div>
                                        )}

                                        {formData.contact_email && (
                                            <a href={`mailto:${formData.contact_email}`} className="flex items-center gap-2 md:gap-3 text-white/60 hover:text-white transition-colors">
                                                <Mail className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                                                <span className="text-xs md:text-sm truncate">{formData.contact_email}</span>
                                            </a>
                                        )}

                                        {formData.recruiter_phone && (
                                            <a href={`tel:${formData.recruiter_phone}`} className="flex items-center gap-2 md:gap-3 text-white/60 hover:text-white transition-colors">
                                                <Phone className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                                                <span className="text-xs md:text-sm truncate">{formData.recruiter_phone}</span>
                                            </a>
                                        )}

                                        {formData.recruiter_linkedin && (
                                            <a href={formData.recruiter_linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 md:gap-3 text-blue-300 hover:text-blue-200 transition-colors">
                                                <Linkedin className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                                                <span className="text-xs md:text-sm">View Profile</span>
                                            </a>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center py-4 md:py-6 text-white/30 text-xs md:text-sm">
                                        <p>No contact info added yet.</p>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setEditing(true)}
                                            className="mt-2 text-white/50 hover:text-white h-8 md:h-9 text-xs"
                                        >
                                            + Add Info
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </Card>

                    {/* Notes */}
                    <Card className="border border-white/10 bg-white/5 p-4 md:p-6 backdrop-blur-xl">
                        <h3 className="text-base md:text-lg font-medium text-white mb-3 md:mb-4 flex items-center gap-2">
                            <Edit2 className="w-4 h-4 md:w-5 md:h-5 text-white/50" />
                            My Notes
                        </h3>

                        {editing ? (
                            <textarea
                                value={formData.notes}
                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                className="w-full h-24 md:h-32 bg-black/20 border border-white/10 rounded-xl p-3 md:p-4 text-xs md:text-sm text-white focus:outline-none focus:border-white/30 resize-none"
                                placeholder="Add your notes specific to this application..."
                            />
                        ) : (
                            <div className="text-xs md:text-sm text-white/70 whitespace-pre-wrap break-words">
                                {formData.notes || (
                                    <span className="text-white/30 italic">No notes added.</span>
                                )}
                            </div>
                        )}
                    </Card>

                    {/* Skills */}
                    <Card className="border border-white/10 bg-white/5 p-4 md:p-6 backdrop-blur-xl">
                        <h3 className="text-base md:text-lg font-medium text-white mb-3 md:mb-4 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-white/50" />
                            Skills Match
                        </h3>
                        <div className="flex flex-wrap gap-1.5 md:gap-2">
                            {job.skills_required.map((skill, i) => {
                                const isMatched = matchData?.matched.includes(skill);
                                return (
                                    <span
                                        key={i}
                                        className={`
                                            px-2.5 py-1 md:px-3 md:py-1.5 rounded-lg text-xs md:text-sm border break-words
                                            ${isMatched
                                                ? 'bg-green-500/10 text-green-300 border-green-500/20'
                                                : 'bg-white/5 border-white/5 text-white/40'}
                                        `}
                                    >
                                        {skill}
                                        {isMatched && <CheckCircle className="w-2.5 h-2.5 md:w-3 md:h-3 inline-block ml-1" />}
                                    </span>
                                )
                            })}
                        </div>
                        {matchData && matchData.missing.length > 0 && (
                            <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-white/5">
                                <h4 className="text-xs md:text-sm font-medium text-white/60 mb-2 flex items-center gap-1.5 md:gap-2">
                                    <AlertCircle className="w-3 h-3 md:w-4 md:h-4 text-yellow-500/50" />
                                    Missing Skills
                                </h4>
                                <div className="flex flex-wrap gap-1.5 md:gap-2">
                                    {matchData.missing.map((skill, i) => (
                                        <span key={i} className="px-2.5 py-1 md:px-3 md:py-1.5 rounded-lg bg-red-500/5 border border-red-500/10 text-red-300/60 text-xs md:text-sm break-words">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            </div>

            {/* Document Preview Modal */}
            <DocumentPreviewModal
                isOpen={!!selectedDoc}
                document={selectedDoc}
                onClose={() => setSelectedDoc(null)}
                jobTitle={job.title}
                companyName={job.company}
                jobId={job.id}
            />
        </div>
    )
}

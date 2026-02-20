import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    User, Mail, Phone, Linkedin, ChevronLeft, Save, Edit2,
    CheckCircle, List, Trophy, AlertCircle, FileText, Eye, Trash2, X
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { useJobsStore, useResumeStore } from '../stores'
import { Button, Card, Input } from '../components/ui'
import { supabase } from '../lib/supabase'
import { showToast } from '../utils/toast'
import type { SavedJob, GeneratedDocument } from '../types'

export default function JobDetails() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { savedJobs, updateJob } = useJobsStore()
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

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center text-white/40">
                Loading job details...
            </div>
        )
    }

    if (!job) return null

    return (
        <div className="animate-fade-in font-['General_Sans',_sans-serif] max-w-5xl mx-auto pb-12">
            {/* Header / Nav */}
            <div className="flex items-center justify-between mb-6">
                <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="text-white/60 hover:text-white"
                >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>

                <div className="flex gap-2">
                    {!editing ? (
                        <Button
                            variant="secondary"
                            onClick={() => setEditing(true)}
                            className="bg-white/5 border border-white/10 text-white"
                        >
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit Details
                        </Button>
                    ) : (
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                onClick={() => setEditing(false)}
                                className="text-white/60"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                isLoading={saving}
                                className="bg-white text-black hover:bg-white/90"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Job Header Card */}
                    <Card className="border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div>
                                <h1 className="text-2xl font-semibold text-white mb-2 leading-tight">
                                    {job.title}
                                </h1>
                                <div className="flex flex-wrap items-center gap-4 text-white/60 text-sm">
                                    <div className="flex items-center gap-1.5">
                                        <Briefcase className="w-4 h-4 text-white/40" />
                                        <span className="text-white">{job.company}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="w-4 h-4 text-white/40" />
                                        <span>{job.location}</span>
                                    </div>
                                    {job.posted_at && (
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-4 h-4 text-white/40" />
                                            <span>Posted {new Date(job.posted_at).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                                <span className={`
                                    px-3 py-1 rounded-full text-xs font-medium border
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
                                        px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border
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

                        {/* Salary & Type Badges */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            {(job.salary_min || job.salary_max || job.salary_range) && (
                                <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-sm">
                                    <DollarSign className="w-4 h-4 mr-2 text-green-400" />
                                    <span className="text-white">
                                        {job.salary_range ||
                                            (job.salary_min && job.salary_max
                                                ? `$${(job.salary_min / 1000).toFixed(0)}k - $${(job.salary_max / 1000).toFixed(0)}k`
                                                : `$${((job.salary_min || 0) / 1000).toFixed(0)}k+`)}
                                    </span>
                                </div>
                            )}
                            {job.job_type && (
                                <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-sm text-white capitalize">
                                    {job.job_type.replace('-', ' ')}
                                </div>
                            )}
                            {job.remote !== undefined && (
                                <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-sm text-white">
                                    {job.remote ? 'Remote' : 'On-site'}
                                </div>
                            )}
                        </div>

                        {/* Quick Actions */}
                        <div className="flex flex-wrap gap-3 pt-6 border-t border-white/5">
                            <Button
                                onClick={() => window.open(job.job_url, '_blank')}
                                className="bg-white text-black hover:bg-white/90"
                            >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Apply Now
                            </Button>

                            {(formData.company_url || job.company) && (
                                <Button
                                    variant="secondary"
                                    onClick={() => {
                                        const url = formData.company_url || `https://www.google.com/search?q=${encodeURIComponent(job.company)}`;
                                        window.open(url, '_blank');
                                    }}
                                    className="bg-white/5 text-white border-white/10 hover:bg-white/10"
                                >
                                    <Globe className="w-4 h-4 mr-2" />
                                    {formData.company_url ? "Company Website" : "Search Company"}
                                </Button>
                            )}
                        </div>
                    </Card>

                    {/* Job Description */}
                    <Card className="border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                            <List className="w-5 h-5 text-white/50" />
                            Description
                        </h3>
                        <div className="prose prose-invert prose-sm max-w-none text-white/70">
                            <ReactMarkdown>{job.description}</ReactMarkdown>
                        </div>

                        {job.requirements.length > 0 && (
                            <div className="mt-6 pt-6 border-t border-white/5">
                                <h4 className="font-medium text-white mb-3">Requirements</h4>
                                <ul className="list-disc list-inside space-y-1 text-white/70 text-sm">
                                    {job.requirements.map((req, i) => (
                                        <li key={i}>{req}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </Card>

                    {/* Tailored Documents */}
                    <Card className="border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-white flex items-center gap-2">
                                <FileText className="w-5 h-5 text-white/50" />
                                Tailored Documents
                            </h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate('/generator', { state: { jobId: job.id } })}
                                className="text-white/60 hover:text-white"
                            >
                                + Generate New
                            </Button>
                        </div>

                        {documents.length > 0 ? (
                            <div className="grid gap-4">
                                {documents.map((doc) => (
                                    <div
                                        key={doc.id}
                                        className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${doc.document_type === 'resume' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-white capitalize">
                                                    {doc.document_type.replace('_', ' ')}
                                                </h4>
                                                <div className="flex items-center gap-2 text-xs text-white/40">
                                                    <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                                                    {doc.ats_score && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="text-green-400/80">{doc.ats_score}% ATS Score</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setSelectedDoc(doc)}
                                                className="h-8 w-8 p-0 text-white/60 hover:text-white hover:bg-white/10"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteDocument(doc.id)}
                                                isLoading={isDeleting === doc.id}
                                                className="h-8 w-8 p-0 text-red-400/60 hover:text-red-400 hover:bg-red-400/10"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-white/5 rounded-xl border border-dashed border-white/10">
                                <p className="text-white/30 text-sm">No tailored documents yet.</p>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => navigate('/generator', { state: { jobId: job.id } })}
                                    className="mt-2 text-white/50 hover:text-white"
                                >
                                    Generate your first resume or cover letter
                                </Button>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Recruiter / Contact Info */}
                    <Card className="border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-white/50" />
                            Recruiter & Contact
                        </h3>

                        {editing ? (
                            <div className="space-y-4">
                                <Input
                                    label="Contact Name"
                                    icon={<User className="w-4 h-4" />}
                                    value={formData.contact_name}
                                    onChange={e => setFormData({ ...formData, contact_name: e.target.value })}
                                    placeholder="e.g. Sarah Smith"
                                />
                                <Input
                                    label="Email"
                                    icon={<Mail className="w-4 h-4" />}
                                    value={formData.contact_email}
                                    onChange={e => setFormData({ ...formData, contact_email: e.target.value })}
                                    placeholder="sarah@company.com"
                                />
                                <Input
                                    label="Phone"
                                    icon={<Phone className="w-4 h-4" />}
                                    value={formData.recruiter_phone}
                                    onChange={e => setFormData({ ...formData, recruiter_phone: e.target.value })}
                                    placeholder="+1 (555) 000-0000"
                                />
                                <Input
                                    label="LinkedIn URL"
                                    icon={<Linkedin className="w-4 h-4" />}
                                    value={formData.recruiter_linkedin}
                                    onChange={e => setFormData({ ...formData, recruiter_linkedin: e.target.value })}
                                    placeholder="linkedin.com/in/sarahsmith"
                                />
                                <Input
                                    label="Company Website"
                                    icon={<Globe className="w-4 h-4" />}
                                    value={formData.company_url}
                                    onChange={e => setFormData({ ...formData, company_url: e.target.value })}
                                    placeholder="https://company.com"
                                />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {(formData.contact_name || formData.contact_email || formData.recruiter_phone || formData.recruiter_linkedin) ? (
                                    <>
                                        {formData.contact_name && (
                                            <div className="flex items-center gap-3 text-white">
                                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                                    <span className="text-xs font-bold">{formData.contact_name.charAt(0)}</span>
                                                </div>
                                                <span className="font-medium">{formData.contact_name}</span>
                                            </div>
                                        )}

                                        {formData.contact_email && (
                                            <a href={`mailto:${formData.contact_email}`} className="flex items-center gap-3 text-white/60 hover:text-white transition-colors">
                                                <Mail className="w-4 h-4" />
                                                <span className="text-sm">{formData.contact_email}</span>
                                            </a>
                                        )}

                                        {formData.recruiter_phone && (
                                            <a href={`tel:${formData.recruiter_phone}`} className="flex items-center gap-3 text-white/60 hover:text-white transition-colors">
                                                <Phone className="w-4 h-4" />
                                                <span className="text-sm">{formData.recruiter_phone}</span>
                                            </a>
                                        )}

                                        {formData.recruiter_linkedin && (
                                            <a href={formData.recruiter_linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-blue-300 hover:text-blue-200 transition-colors">
                                                <Linkedin className="w-4 h-4" />
                                                <span className="text-sm">View Profile</span>
                                            </a>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center py-6 text-white/30 text-sm">
                                        <p>No contact info added yet.</p>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setEditing(true)}
                                            className="mt-2 text-white/50 hover:text-white"
                                        >
                                            + Add Info
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </Card>

                    {/* Notes */}
                    <Card className="border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                            <Edit2 className="w-5 h-5 text-white/50" />
                            My Notes
                        </h3>

                        {editing ? (
                            <textarea
                                value={formData.notes}
                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                className="w-full h-32 bg-black/20 border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-white/30 resize-none"
                                placeholder="Add your notes specific to this application..."
                            />
                        ) : (
                            <div className="text-white/70 text-sm whitespace-pre-wrap">
                                {formData.notes || (
                                    <span className="text-white/30 italic">No notes added.</span>
                                )}
                            </div>
                        )}
                    </Card>

                    {/* Skills */}
                    <Card className="border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-white/50" />
                            Skills Match
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {job.skills_required.map((skill, i) => {
                                const isMatched = matchData?.matched.includes(skill);
                                return (
                                    <span
                                        key={i}
                                        className={`
                                            px-3 py-1.5 rounded-lg text-sm border
                                            ${isMatched
                                                ? 'bg-green-500/10 text-green-300 border-green-500/20'
                                                : 'bg-white/5 border-white/5 text-white/40'}
                                        `}
                                    >
                                        {skill}
                                        {isMatched && <CheckCircle className="w-3 h-3 inline-block ml-1.5" />}
                                    </span>
                                )
                            })}
                        </div>
                        {matchData && matchData.missing.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-white/5">
                                <h4 className="text-sm font-medium text-white/60 mb-2 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-yellow-500/50" />
                                    Missing Skills
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {matchData.missing.map((skill, i) => (
                                        <span key={i} className="px-3 py-1.5 rounded-lg bg-red-500/5 border border-red-500/10 text-red-300/60 text-sm">
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
            {selectedDoc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b border-white/10">
                            <div>
                                <h3 className="text-xl font-semibold text-white capitalize">
                                    {selectedDoc.document_type.replace('_', ' ')}
                                </h3>
                                <p className="text-sm text-white/40">Generated on {new Date(selectedDoc.created_at).toLocaleString()}</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedDoc(null)}
                                className="h-10 w-10 p-0 rounded-full hover:bg-white/10 text-white/60 hover:text-white"
                            >
                                <X className="w-6 h-6" />
                            </Button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 prose prose-invert max-w-none prose-sm">
                            <div className="bg-white/5 rounded-xl p-6 border border-white/5 whitespace-pre-wrap font-mono text-white/80 leading-relaxed text-sm">
                                {selectedDoc.content}
                            </div>
                        </div>
                        <div className="p-6 border-t border-white/10 flex justify-end gap-3">
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    navigator.clipboard.writeText(selectedDoc.content)
                                    showToast.success('Content copied to clipboard')
                                }}
                                className="bg-white/5 text-white border-white/10"
                            >
                                Copy Content
                            </Button>
                            <Button
                                onClick={() => setSelectedDoc(null)}
                                className="bg-white text-black hover:bg-white/90"
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

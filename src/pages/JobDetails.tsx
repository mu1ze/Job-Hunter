import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    Briefcase, MapPin, DollarSign, Calendar, Globe, ExternalLink,
    User, Mail, Phone, Linkedin, ChevronLeft, Save, Edit2, Share2,
    CheckCircle, List
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { useJobsStore } from '../stores'
import { Button, Card, Input } from '../components/ui'
import { supabase } from '../lib/supabase'
import { showToast } from '../utils/toast'
import type { SavedJob } from '../types'

export default function JobDetails() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { savedJobs, updateJob } = useJobsStore()
    const [job, setJob] = useState<SavedJob | null>(null)
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState(false)
    const [saving, setSaving] = useState(false)

    // Form state for editable fields
    const [formData, setFormData] = useState({
        contact_name: '',
        contact_email: '',
        recruiter_phone: '',
        recruiter_linkedin: '',
        company_url: '',
        notes: ''
    })

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
        } else {
            // Fallback fetch from DB if not in store (e.g. direct link)
            fetchJobFromDb(id)
        }
    }, [id, savedJobs])

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
            showToast.error('Job not found')
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
                            {job.skills_required.map((skill, i) => (
                                <span key={i} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-sm text-white/80">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}

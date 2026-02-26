import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent, useDroppable, useDraggable } from '@dnd-kit/core'
import {
    Calendar,
    DollarSign,
    MapPin,
    Clock,
    TrendingUp,
    FileText,
    Target,
    Award,
    Briefcase,
    ExternalLink,
    CheckCircle,
    Circle,
    Trash2,
    Lightbulb,
    ChevronUp,
    ChevronDown,
    BookOpen,
    Plus,
    Check
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { Card, EmptyColumn } from '../components/ui'
import { useJobsStore, useUserStore } from '../stores'
import { useCareerStore } from '../stores/career'
import { supabase } from '../lib/supabase'
import { showToast } from '../utils/toast'
import type { SavedJob } from '../types'

type ApplicationStatus = 'saved' | 'applied' | 'interviewing' | 'offer' | 'rejected'

interface KanbanColumn {
    id: ApplicationStatus
    title: string
    color: string
    icon: React.ReactNode
}

const columns: KanbanColumn[] = [
    { id: 'saved', title: 'Saved', color: 'bg-blue-500/10 border-blue-500/20 text-blue-300', icon: <Target className="w-4 h-4" /> },
    { id: 'applied', title: 'Applied', color: 'bg-purple-500/10 border-purple-500/20 text-purple-300', icon: <FileText className="w-4 h-4" /> },
    { id: 'interviewing', title: 'Interviewing', color: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-300', icon: <Calendar className="w-4 h-4" /> },
    { id: 'offer', title: 'Offer', color: 'bg-green-500/10 border-green-500/20 text-green-300', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'rejected', title: 'Rejected', color: 'bg-red-500/10 border-red-500/20 text-red-300', icon: <Clock className="w-4 h-4" /> },
]

export default function CareerTracker() {
    const { savedJobs, setSavedJobs } = useJobsStore()
    const { items: careerItems, fetchItems: fetchCareerItems, deleteItem: deleteCareerItem, addItem: addCareerItem, updateItemStatus, analyses, fetchAnalyses } = useCareerStore()
    const { profile } = useUserStore()

    // UI State
    const [activeTab, setActiveTab] = useState<'applications' | 'development' | 'analysis'>('applications')
    const [expandedAnalysisId, setExpandedAnalysisId] = useState<string | null>(null)

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    )

    useEffect(() => {
        if (profile) {
            fetchSavedJobs()
            fetchCareerItems(profile.id)
            fetchAnalyses(profile.id)
        }
    }, [profile])

    const fetchSavedJobs = async () => {
        if (!profile) return

        const { data, error } = await supabase
            .from('saved_jobs')
            .select('*')
            .eq('user_id', profile.id)
            .order('created_at', { ascending: false })

        if (!error && data) {
            setSavedJobs(data)
        }
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event

        if (!over || active.id === over.id) return

        const jobId = active.id as string
        const newStatus = over.id as ApplicationStatus
        const job = savedJobs.find(j => j.id === jobId)

        if (!job) return

        // Optimistic update
        const updatedJobs = savedJobs.map(j =>
            j.id === jobId ? { ...j, status: newStatus } : j
        )
        setSavedJobs(updatedJobs)

        // Determine which date field to update
        const dateField =
            newStatus === 'applied' ? 'applied_date' :
                newStatus === 'interviewing' ? 'interview_date' :
                    newStatus === 'offer' ? 'offer_date' :
                        newStatus === 'rejected' ? 'rejected_date' : null

        const updates: any = { status: newStatus }
        if (dateField) {
            updates[dateField] = new Date().toISOString()
        }

        // Update in database
        const { error } = await supabase
            .from('saved_jobs')
            .update(updates)
            .eq('id', jobId)

        if (error) {
            // Rollback on error
            setSavedJobs(savedJobs)
            showToast.error(`Failed to update status`)
            console.error('Error updating status:', error)
        } else {
            showToast.success(`Moved to ${columns.find(c => c.id === newStatus)?.title}!`)
            fetchSavedJobs()
        }
    }

    const jobsByStatus = useMemo(() => {
        return columns.reduce((acc, column) => {
            acc[column.id] = savedJobs.filter(job => job.status === column.id)
            return acc
        }, {} as Record<ApplicationStatus, SavedJob[]>)
    }, [savedJobs])

    const stats = useMemo(() => {
        return {
            total: savedJobs.length,
            saved: jobsByStatus.saved?.length || 0,
            applied: jobsByStatus.applied?.length || 0,
            interviewing: jobsByStatus.interviewing?.length || 0,
            offers: jobsByStatus.offer?.length || 0,
            rejected: jobsByStatus.rejected?.length || 0,
            responseRate: savedJobs.length > 0
                ? Math.round(((jobsByStatus.interviewing?.length || 0) + (jobsByStatus.offer?.length || 0)) / savedJobs.length * 100)
                : 0
        }
    }, [jobsByStatus, savedJobs])

    // Career Items Grouping
    const savedRoles = careerItems.filter(i => i.type === 'role')
    const savedCerts = careerItems.filter(i => i.type === 'certification')

    const toggleCertStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'completed' ? 'in_progress' : 'completed'
        await updateItemStatus(id, newStatus)
        showToast.success(newStatus === 'completed' ? 'Certification marked as completed!' : 'Status updated')
    }

    const handleSaveRole = async (role: string) => {
        if (!profile) return
        await addCareerItem({
            user_id: profile.id,
            type: 'role',
            title: role,
            status: 'saved'
        })
        showToast.success('Role saved')
    }

    const handleSaveCert = async (title: string, url: string) => {
        if (!profile) return
        await addCareerItem({
            user_id: profile.id,
            type: 'certification',
            title: title,
            url: url,
            status: 'saved'
        })
        showToast.success("Certification saved")
    }

    // Helper to extract links from markdown
    const extractLinks = (markdown: string) => {
        const regex = /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g;
        const links = [];
        let match;
        while ((match = regex.exec(markdown)) !== null) {
            links.push({ title: match[1], url: match[2] });
        }
        return links;
    }

    // Check if query param tab exists
    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search)
        const tab = searchParams.get('tab')
        if (tab === 'analysis') setActiveTab('analysis')
    }, [])

    return (
        <div className="animate-fade-in font-['General_Sans',_sans-serif]">
            {/* Header */}
            <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="font-medium text-3xl text-white mb-2 tracking-tight">Career Tracker</h1>
                    <p className="text-white/60">
                        Manage your job applications and career development goals
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
                    <button
                        onClick={() => setActiveTab('applications')}
                        className={`
                            px-4 py-2 rounded-xl text-sm font-medium transition-all
                            ${activeTab === 'applications'
                                ? 'bg-white text-black shadow-lg shadow-white/10'
                                : 'text-white/60 hover:text-white hover:bg-white/5'}
                        `}
                    >
                        Job Applications
                    </button>
                    <button
                        onClick={() => setActiveTab('development')}
                        className={`
                            px-4 py-2 rounded-xl text-sm font-medium transition-all
                            ${activeTab === 'development'
                                ? 'bg-white text-black shadow-lg shadow-white/10'
                                : 'text-white/60 hover:text-white hover:bg-white/5'}
                        `}
                    >
                        Career Development
                    </button>
                    <button
                        onClick={() => setActiveTab('analysis')}
                        className={`
                            px-4 py-2 rounded-xl text-sm font-medium transition-all
                            ${activeTab === 'analysis'
                                ? 'bg-white text-black shadow-lg shadow-white/10'
                                : 'text-white/60 hover:text-white hover:bg-white/5'}
                        `}
                    >
                        Analysis History
                    </button>
                </div>
            </div>

            {/* Content Switcher */}
            {activeTab === 'applications' && (
                <>
                    {/* Stats Summary */}
                    <Card className="mb-6 border border-white/10 bg-white/5 backdrop-blur-sm">
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                            <div className="text-center">
                                <p className="text-2xl font-medium text-white">{stats.total}</p>
                                <p className="text-xs text-white/50 uppercase tracking-wider mt-1">Total</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-medium text-blue-300">{stats.saved}</p>
                                <p className="text-xs text-white/50 uppercase tracking-wider mt-1">Saved</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-medium text-purple-300">{stats.applied}</p>
                                <p className="text-xs text-white/50 uppercase tracking-wider mt-1">Applied</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-medium text-yellow-300">{stats.interviewing}</p>
                                <p className="text-xs text-white/50 uppercase tracking-wider mt-1">Inteview</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-medium text-green-300">{stats.offers}</p>
                                <p className="text-xs text-white/50 uppercase tracking-wider mt-1">Offers</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-medium text-red-300">{stats.rejected}</p>
                                <p className="text-xs text-white/50 uppercase tracking-wider mt-1">Rejected</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-medium text-white/90">{stats.responseRate}%</p>
                                <p className="text-xs text-white/50 uppercase tracking-wider mt-1">Response</p>
                            </div>
                        </div>
                    </Card>

                    {/* Kanban Board */}
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {columns.map(column => (
                                <KanbanColumn
                                    key={column.id}
                                    column={column}
                                    jobs={jobsByStatus[column.id] || []}
                                />
                            ))}
                        </div>
                    </DndContext>
                </>
            )} {activeTab === 'development' && (
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Target Roles Column */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Target className="w-5 h-5 text-green-400" />
                            <h2 className="text-lg font-medium text-white">Target Roles</h2>
                        </div>

                        {savedRoles.length === 0 ? (
                            <div className="p-8 border-2 border-dashed border-white/10 bg-white/5 rounded-2xl text-center text-white/40">
                                <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p>No target roles saved yet.</p>
                                <p className="text-xs mt-1">Visit Resume Manager to analyze and save roles.</p>
                            </div>
                        ) : (
                            savedRoles.map(role => (
                                <Card key={role.id} className="p-4 flex items-center justify-between group border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                            <Briefcase className="w-5 h-5 text-white/70" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-white">{role.title}</h3>
                                            <p className="text-xs text-white/40">
                                                Added {new Date(role.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <a
                                            href={`/jobs?q=${encodeURIComponent(role.title)}`}
                                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                                            title="Search Jobs"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                        <button
                                            onClick={() => deleteCareerItem(role.id)}
                                            className="p-2 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors"
                                            title="Remove"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>

                    {/* Certifications Column */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Award className="w-5 h-5 text-purple-400" />
                            <h2 className="text-lg font-medium text-white">Certifications & Learning</h2>
                        </div>

                        {savedCerts.length === 0 ? (
                            <div className="p-8 border-2 border-dashed border-white/10 bg-white/5 rounded-2xl text-center text-white/40">
                                <Award className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p>No certifications saved yet.</p>
                                <p className="text-xs mt-1">Visit Resume Manager to get recommendations.</p>
                            </div>
                        ) : (
                            savedCerts.map(cert => (
                                <Card key={cert.id} className="p-4 flex items-start gap-3 group relative overflow-hidden border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                                    {/* Status Strip for Completed */}
                                    <div className={`absolute left-0 top-0 bottom-0 w-1 transition-colors ${cert.status === 'completed' ? 'bg-green-500' : 'bg-transparent'}`} />

                                    <button
                                        onClick={() => toggleCertStatus(cert.id, cert.status)}
                                        className={`mt-1 shrink-0 transition-colors ${cert.status === 'completed' ? 'text-green-500' : 'text-white/20 hover:text-white/60'}`}
                                        title={cert.status === 'completed' ? "Mark as in progress" : "Mark as completed"}
                                    >
                                        {cert.status === 'completed' ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                                    </button>

                                    <div className="flex-1 min-w-0">
                                        <h3 className={`font-medium transition-colors ${cert.status === 'completed' ? 'text-white/40 line-through' : 'text-white'}`}>
                                            {cert.title}
                                        </h3>
                                        {cert.url && (
                                            <a
                                                href={cert.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-xs text-blue-300/80 hover:text-blue-300 flex items-center gap-1 mt-1 truncate"
                                            >
                                                View Course <ExternalLink className="w-3 h-3" />
                                            </a>
                                        )}
                                        <p className="text-xs text-white/40 mt-2">
                                            Added {new Date(cert.created_at).toLocaleDateString()}
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => deleteCareerItem(cert.id)}
                                        className="absolute top-4 right-4 p-2 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                        title="Remove"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            )} {activeTab === 'analysis' && (
                <div className="space-y-6">
                    {analyses.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-white/10 bg-white/5 rounded-2xl">
                            <Lightbulb className="w-12 h-12 text-white/20 mx-auto mb-4" />
                            <h3 className="text-xl font-medium text-white mb-2">No Career Analysis Yet</h3>
                            <p className="text-white/60 mb-6">
                                Upload your resume and get AI-powered career insights.
                            </p>
                            <a
                                href="/resume"
                                className="inline-flex items-center px-6 py-2 rounded-full bg-white text-black hover:bg-white/90 font-medium transition-colors"
                            >
                                Go to Resume Manager
                            </a>
                        </div>
                    ) : (
                        analyses.map((analysis) => {
                            const isExpanded = expandedAnalysisId === analysis.id || (expandedAnalysisId === null && analysis === analyses[0]);
                            const date = new Date(analysis.created_at).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            });

                            return (
                                <Card key={analysis.id} className="overflow-hidden border border-white/10 bg-white/5">
                                    <div
                                        className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                                        onClick={() => setExpandedAnalysisId(isExpanded ? null : analysis.id)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-bold border border-white/5">
                                                {analysis.analysis_data.analysis.readiness_score || '?'}
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-white">Career Analysis</h3>
                                                <p className="text-sm text-white/40">{date}</p>
                                            </div>
                                        </div>
                                        {isExpanded ? <ChevronUp className="w-5 h-5 text-white/40" /> : <ChevronDown className="w-5 h-5 text-white/40" />}
                                    </div>

                                    {isExpanded && (
                                        <div className="border-t border-white/10 p-6 animate-fade-in grid md:grid-cols-2 gap-8 bg-black/20">
                                            {/* Left Column: Strategic Plan */}
                                            <div className="space-y-6">
                                                {/* Score */}
                                                <div>
                                                    <div className="flex justify-between text-sm mb-2 text-white/60">
                                                        <span>Market Readiness</span>
                                                        <span className="text-white font-bold">{analysis.analysis_data.analysis.readiness_score}/100</span>
                                                    </div>
                                                    <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                                                        <div
                                                            className="bg-white h-full rounded-full"
                                                            style={{ width: `${analysis.analysis_data.analysis.readiness_score}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Recommended Roles */}
                                                <div>
                                                    <h4 className="flex items-center gap-2 text-white font-medium mb-3">
                                                        <Target className="w-4 h-4 text-green-400" />
                                                        Recommended Roles
                                                    </h4>
                                                    <div className="space-y-2">
                                                        {analysis.analysis_data.analysis.recommended_roles?.map((role, i) => {
                                                            const isSaved = careerItems.some(item => item.type === 'role' && item.title === role);
                                                            return (
                                                                <div key={i} className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/5">
                                                                    <span className="text-white/80">{role}</span>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            !isSaved && handleSaveRole(role);
                                                                        }}
                                                                        disabled={isSaved}
                                                                        className={`p-1.5 rounded-md transition-colors ${isSaved
                                                                            ? 'text-green-400 cursor-default'
                                                                            : 'text-white/40 hover:text-white hover:bg-white/10'
                                                                            }`}
                                                                        title="Save Role"
                                                                    >
                                                                        {isSaved ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                                                    </button>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                </div>

                                                {/* Skill Gaps */}
                                                <div>
                                                    <h4 className="flex items-center gap-2 text-white font-medium mb-3">
                                                        <TrendingUp className="w-4 h-4 text-red-400" />
                                                        Skill Gaps
                                                    </h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {analysis.analysis_data.analysis.skill_gaps?.map((skill, i) => (
                                                            <span key={i} className="px-2 py-1 rounded-md bg-red-500/10 text-red-300 border border-red-500/20 text-xs">
                                                                {skill}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right Column: Market Insights */}
                                            <div className="space-y-4">
                                                <h4 className="flex items-center gap-2 text-white font-medium">
                                                    <BookOpen className="w-4 h-4 text-blue-300" />
                                                    Market Insights & Resources
                                                </h4>
                                                <div className="prose prose-invert prose-sm max-w-none bg-white/5 p-4 rounded-xl border border-white/5 text-white/80">
                                                    <ReactMarkdown>{analysis.analysis_data.marketInsights}</ReactMarkdown>
                                                </div>

                                                {/* Extracted Links */}
                                                {extractLinks(analysis.analysis_data.marketInsights).length > 0 && (
                                                    <div className="pt-4 border-t border-white/10">
                                                        <h5 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Detected Resources</h5>
                                                        <div className="space-y-2">
                                                            {extractLinks(analysis.analysis_data.marketInsights).map((link, i) => {
                                                                const isSaved = careerItems.some(item => item.type === 'certification' && (item.url === link.url || item.title === link.title));
                                                                return (
                                                                    <div key={i} className="flex items-center justify-between p-2 rounded bg-white/5">
                                                                        <div className="truncate mr-2">
                                                                            <div className="text-sm text-white truncate">{link.title}</div>
                                                                            <div className="text-xs text-blue-300/80 truncate">{link.url}</div>
                                                                        </div>
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                !isSaved && handleSaveCert(link.title, link.url);
                                                                            }}
                                                                            disabled={isSaved}
                                                                            className={`p-1.5 rounded-md transition-colors ${isSaved
                                                                                ? 'text-green-400 cursor-default'
                                                                                : 'text-white/40 hover:text-white hover:bg-white/10'
                                                                                }`}
                                                                        >
                                                                            {isSaved ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                                                        </button>
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            )
                        })
                    )}
                </div>
            )}
        </div>
    )
}

function KanbanColumn({ column, jobs }: {
    column: KanbanColumn
    jobs: SavedJob[]
}) {
    const { setNodeRef } = useDroppable({ id: column.id })

    return (
        <div ref={setNodeRef} className="flex flex-col h-full">
            <div className={`${column.color} border rounded-2xl p-4 mb-4`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-medium">
                        {column.icon}
                        <h3 className="font-medium text-inherit">{column.title}</h3>
                    </div>
                    <span className="text-xs font-medium text-inherit opacity-70 bg-black/20 px-2 py-0.5 rounded-full">
                        {jobs.length}
                    </span>
                </div>
            </div>

            <div className="space-y-3 flex-1">
                {jobs.length === 0 ? (
                    <EmptyColumn 
                        title="No jobs yet" 
                        description="Drag jobs here"
                    />
                ) : (
                    jobs.map(job => (
                        <JobCard
                            key={job.id}
                            job={job}
                        />
                    ))
                )}
            </div>
        </div>
    )
}

function JobCard({ job }: {
    job: SavedJob
}) {
    const navigate = useNavigate()
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: job.id,
    })

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab',
    } : undefined

    const dateApplied = job.applied_date
        ? new Date(job.applied_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : null

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            onClick={() => navigate(`/jobs/${job.id}`)}
        >
            <Card hover className="cursor-pointer border border-white/10 bg-white/5 h-full">
                <div className="space-y-2">
                    <h4 className="font-medium text-white text-sm line-clamp-2 leading-tight">{job.title}</h4>
                    <p className="text-white/50 text-xs">{job.company}</p>

                    <div className="flex items-center gap-2 text-xs text-white/40">
                        {job.location && (
                            <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {job.location.split(',')[0]}
                            </span>
                        )}
                        {job.salary_range && (
                            <span className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                {job.salary_range.split('-')[0].trim()}
                            </span>
                        )}
                    </div>

                    {dateApplied && (
                        <div className="flex items-center gap-1 text-xs text-white/30 pt-1 border-t border-white/5 mt-2">
                            <Calendar className="w-3 h-3" />
                            Applied: {dateApplied}
                        </div>
                    )}
                </div>
            </Card>
        </div>
    )
}

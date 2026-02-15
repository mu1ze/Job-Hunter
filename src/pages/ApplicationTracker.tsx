import { useEffect, useMemo, useState } from 'react'
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
import { Card } from '../components/ui'
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
    { id: 'saved', title: 'Saved', color: 'bg-blue-500/20 border-blue-500/30', icon: <Target className="w-5 h-5" /> },
    { id: 'applied', title: 'Applied', color: 'bg-purple-500/20 border-purple-500/30', icon: <FileText className="w-5 h-5" /> },
    { id: 'interviewing', title: 'Interviewing', color: 'bg-yellow-500/20 border-yellow-500/30', icon: <Calendar className="w-5 h-5" /> },
    { id: 'offer', title: 'Offer', color: 'bg-green-500/20 border-green-500/30', icon: <TrendingUp className="w-5 h-5" /> },
    { id: 'rejected', title: 'Rejected', color: 'bg-red-500/20 border-red-500/30', icon: <Clock className="w-5 h-5" /> },
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
        <div className="animate-fade-in">
            {/* Header */}
            <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="font-display text-3xl font-bold text-white mb-2">Career Tracker</h1>
                    <p className="text-surface-400">
                        Manage your job applications and career development goals
                    </p>
                </div>
                
                {/* Tabs */}
                <div className="flex bg-surface-800 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab('applications')}
                        className={`
                            px-4 py-2 rounded-lg text-sm font-medium transition-all
                            ${activeTab === 'applications' 
                                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' 
                                : 'text-surface-400 hover:text-white hover:bg-surface-700'}
                        `}
                    >
                        Job Applications
                    </button>
                    <button
                        onClick={() => setActiveTab('development')}
                        className={`
                            px-4 py-2 rounded-lg text-sm font-medium transition-all
                            ${activeTab === 'development' 
                                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' 
                                : 'text-surface-400 hover:text-white hover:bg-surface-700'}
                        `}
                    >
                        Career Development
                    </button>
                    <button
                        onClick={() => setActiveTab('analysis')}
                        className={`
                            px-4 py-2 rounded-lg text-sm font-medium transition-all
                            ${activeTab === 'analysis' 
                                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' 
                                : 'text-surface-400 hover:text-white hover:bg-surface-700'}
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
                    <Card className="mb-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-white">{stats.total}</p>
                                <p className="text-sm text-surface-400">Total Jobs</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-blue-400">{stats.saved}</p>
                                <p className="text-sm text-surface-400">Saved</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-purple-400">{stats.applied}</p>
                                <p className="text-sm text-surface-400">Applied</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-yellow-400">{stats.interviewing}</p>
                                <p className="text-sm text-surface-400">Interviewing</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-green-400">{stats.offers}</p>
                                <p className="text-sm text-surface-400">Offers</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-red-400">{stats.rejected}</p>
                                <p className="text-sm text-surface-400">Rejected</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-accent-400">{stats.responseRate}%</p>
                                <p className="text-sm text-surface-400">Response Rate</p>
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
                            <h2 className="text-lg font-bold text-white">Target Roles</h2>
                        </div>
                        
                        {savedRoles.length === 0 ? (
                            <div className="p-8 border-2 border-dashed border-surface-700 rounded-xl text-center text-surface-500">
                                <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p>No target roles saved yet.</p>
                                <p className="text-xs mt-1">Visit Resume Manager to analyze and save roles.</p>
                            </div>
                        ) : (
                            savedRoles.map(role => (
                                <Card key={role.id} className="p-4 flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                                            <Briefcase className="w-5 h-5 text-green-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white">{role.title}</h3>
                                            <p className="text-xs text-surface-400">
                                                Added {new Date(role.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <a 
                                            href={`/jobs?q=${encodeURIComponent(role.title)}`}
                                            className="p-2 rounded-lg bg-surface-700 hover:bg-surface-600 text-surface-300 hover:text-white transition-colors"
                                            title="Search Jobs"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                        <button 
                                            onClick={() => deleteCareerItem(role.id)}
                                            className="p-2 rounded-lg hover:bg-red-500/20 text-surface-400 hover:text-red-400 transition-colors"
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
                            <h2 className="text-lg font-bold text-white">Certifications & Learning</h2>
                        </div>

                        {savedCerts.length === 0 ? (
                            <div className="p-8 border-2 border-dashed border-surface-700 rounded-xl text-center text-surface-500">
                                <Award className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p>No certifications saved yet.</p>
                                <p className="text-xs mt-1">Visit Resume Manager to get recommendations.</p>
                            </div>
                        ) : (
                            savedCerts.map(cert => (
                                <Card key={cert.id} className="p-4 flex items-start gap-3 group relative overflow-hidden">
                                     {/* Status Strip for Completed */}
                                    <div className={`absolute left-0 top-0 bottom-0 w-1 transition-colors ${cert.status === 'completed' ? 'bg-green-500' : 'bg-transparent'}`} />

                                    <button 
                                        onClick={() => toggleCertStatus(cert.id, cert.status)}
                                        className={`mt-1 shrink-0 transition-colors ${cert.status === 'completed' ? 'text-green-500' : 'text-surface-600 hover:text-surface-400'}`}
                                        title={cert.status === 'completed' ? "Mark as in progress" : "Mark as completed"}
                                    >
                                        {cert.status === 'completed' ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                                    </button>
                                    
                                    <div className="flex-1 min-w-0">
                                        <h3 className={`font-bold transition-colors ${cert.status === 'completed' ? 'text-surface-400 line-through' : 'text-white'}`}>
                                            {cert.title}
                                        </h3>
                                        {cert.url && (
                                            <a 
                                                href={cert.url} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1 mt-1 truncate"
                                            >
                                                View Course <ExternalLink className="w-3 h-3" />
                                            </a>
                                        )}
                                        <p className="text-xs text-surface-500 mt-2">
                                            Added {new Date(cert.created_at).toLocaleDateString()}
                                        </p>
                                    </div>

                                    <button 
                                        onClick={() => deleteCareerItem(cert.id)}
                                        className="absolute top-4 right-4 p-2 rounded-lg hover:bg-red-500/20 text-surface-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
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
                        <div className="text-center py-12 border-2 border-dashed border-surface-700 rounded-xl">
                            <Lightbulb className="w-12 h-12 text-surface-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">No Career Analysis Yet</h3>
                            <p className="text-surface-400 mb-6">
                                Upload your resume and get AI-powered career insights.
                            </p>
                            <a 
                                href="/resume"
                                className="inline-flex items-center px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-medium transition-colors"
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
                                <Card key={analysis.id} className="overflow-hidden">
                                    <div 
                                        className="p-4 flex items-center justify-between cursor-pointer hover:bg-surface-800/50 transition-colors"
                                        onClick={() => setExpandedAnalysisId(isExpanded ? null : analysis.id)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400 font-bold">
                                                {analysis.analysis_data.analysis.readiness_score || '?'}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white">Career Analysis</h3>
                                                <p className="text-sm text-surface-400">{date}</p>
                                            </div>
                                        </div>
                                        {isExpanded ? <ChevronUp className="w-5 h-5 text-surface-400" /> : <ChevronDown className="w-5 h-5 text-surface-400" />}
                                    </div>

                                    {isExpanded && (
                                        <div className="border-t border-surface-700 p-6 animate-fade-in grid md:grid-cols-2 gap-8">
                                            {/* Left Column: Strategic Plan */}
                                            <div className="space-y-6">
                                                {/* Score */}
                                                <div>
                                                    <div className="flex justify-between text-sm mb-2 text-surface-300">
                                                        <span>Market Readiness</span>
                                                        <span className="text-primary-400 font-bold">{analysis.analysis_data.analysis.readiness_score}/100</span>
                                                    </div>
                                                    <div className="w-full bg-surface-700 h-2 rounded-full overflow-hidden">
                                                        <div 
                                                            className="bg-primary-500 h-full rounded-full"
                                                            style={{ width: `${analysis.analysis_data.analysis.readiness_score}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Recommended Roles */}
                                                <div>
                                                    <h4 className="flex items-center gap-2 text-white font-semibold mb-3">
                                                        <Target className="w-4 h-4 text-green-400" />
                                                        Recommended Roles
                                                    </h4>
                                                    <div className="space-y-2">
                                                        {analysis.analysis_data.analysis.recommended_roles?.map((role, i) => {
                                                            const isSaved = careerItems.some(item => item.type === 'role' && item.title === role);
                                                            return (
                                                                <div key={i} className="flex items-center justify-between bg-surface-800 p-3 rounded-lg">
                                                                    <span className="text-surface-200">{role}</span>
                                                                    <button 
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            !isSaved && handleSaveRole(role);
                                                                        }}
                                                                        disabled={isSaved}
                                                                        className={`p-1.5 rounded-md transition-colors ${
                                                                            isSaved 
                                                                            ? 'text-green-400 cursor-default' 
                                                                            : 'text-surface-400 hover:text-primary-400 hover:bg-surface-700'
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
                                                    <h4 className="flex items-center gap-2 text-white font-semibold mb-3">
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
                                                <h4 className="flex items-center gap-2 text-white font-semibold">
                                                    <BookOpen className="w-4 h-4 text-blue-400" />
                                                    Market Insights & Resources
                                                </h4>
                                                <div className="prose prose-invert prose-sm max-w-none bg-surface-800/30 p-4 rounded-lg border border-surface-700">
                                                    <ReactMarkdown>{analysis.analysis_data.marketInsights}</ReactMarkdown>
                                                </div>

                                                {/* Extracted Links */}
                                                {extractLinks(analysis.analysis_data.marketInsights).length > 0 && (
                                                    <div className="pt-4 border-t border-surface-700">
                                                        <h5 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">Detected Resources</h5>
                                                        <div className="space-y-2">
                                                            {extractLinks(analysis.analysis_data.marketInsights).map((link, i) => {
                                                                const isSaved = careerItems.some(item => item.type === 'certification' && (item.url === link.url || item.title === link.title));
                                                                return (
                                                                    <div key={i} className="flex items-center justify-between p-2 rounded bg-surface-800/50">
                                                                        <div className="truncate mr-2">
                                                                            <div className="text-sm text-white truncate">{link.title}</div>
                                                                            <div className="text-xs text-primary-400 truncate">{link.url}</div>
                                                                        </div>
                                                                        <button 
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                !isSaved && handleSaveCert(link.title, link.url);
                                                                            }}
                                                                            disabled={isSaved}
                                                                            className={`p-1.5 rounded-md transition-colors ${
                                                                                isSaved 
                                                                                ? 'text-green-400 cursor-default' 
                                                                                : 'text-surface-400 hover:text-white hover:bg-surface-700'
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
            <div className={`${column.color} border-2 rounded-xl p-3 mb-3`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {column.icon}
                        <h3 className="font-semibold text-white">{column.title}</h3>
                    </div>
                    <span className="text-sm font-medium text-surface-300">
                        {jobs.length}
                    </span>
                </div>
            </div>

            <div className="space-y-3 flex-1">
                {jobs.length === 0 ? (
                    <div className="text-center py-8 text-surface-500 text-sm">
                        No jobs yet
                    </div>
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
        >
            <Card hover className="cursor-pointer">
                <div className="space-y-2">
                    <h4 className="font-semibold text-white text-sm line-clamp-2">{job.title}</h4>
                    <p className="text-surface-400 text-xs">{job.company}</p>

                    <div className="flex items-center gap-2 text-xs text-surface-500">
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
                        <div className="flex items-center gap-1 text-xs text-surface-500">
                            <Calendar className="w-3 h-3" />
                            {dateApplied}
                        </div>
                    )}
                </div>
            </Card>
        </div>
    )
}

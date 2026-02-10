import { useEffect, useMemo } from 'react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import {
    Calendar,
    DollarSign,
    MapPin,
    Clock,
    TrendingUp,
    FileText,
    Target
} from 'lucide-react'
import { Card } from '../components/ui'
import { useJobsStore, useUserStore } from '../stores'
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

export default function ApplicationTracker() {
    const { savedJobs, setSavedJobs } = useJobsStore()
    const { profile } = useUserStore()

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
        }
    }, [profile])

    const fetchSavedJobs = async () => {
        if (!profile) return

        const { data, error } = await supabase
            .from('saved_jobs')
            .select('*')
            .eq('user_id', profile.id)
            .order('saved_at', { ascending: false })

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
            // Refresh to get updated dates
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

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="mb-6">
                <h1 className="font-display text-3xl font-bold text-white mb-2">Application Tracker</h1>
                <p className="text-surface-400">
                    Manage your job applications through every stage
                </p>
            </div>

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

// Droppable zone wrapper
import { useDroppable } from '@dnd-kit/core'
import { useDraggable } from '@dnd-kit/core'

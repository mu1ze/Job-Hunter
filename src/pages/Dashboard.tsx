import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
    Search,
    FileText,
    Sparkles,
    TrendingUp,
    Briefcase,
    Clock,
    Target,
    ArrowRight,
    Upload
} from 'lucide-react'
import { Button, Card, EmptyState } from '../components/ui'
import { StatsSkeleton } from '../components/Skeleton'
import { useUserStore, useJobsStore, useResumeStore } from '../stores'
import { supabase } from '../lib/supabase'

const quickActions = [
    {
        icon: Search,
        label: 'Search Jobs',
        description: 'Find your next opportunity',
        path: '/jobs',
    },
    {
        icon: FileText,
        label: 'Upload Resume',
        description: 'Parse and analyze your CV',
        path: '/resume',
    },
    {
        icon: Sparkles,
        label: 'Generate Cover Letter',
        description: 'AI-tailored applications',
        path: '/generate',
    },
]

export default function Dashboard() {
    const { profile, preferences, fetchUserData } = useUserStore()
    const { savedJobs, setSavedJobs } = useJobsStore()
    const { primaryResume, setResumes } = useResumeStore()
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const initDashboard = async () => {
            setIsLoading(true)
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                // Fetch user profile and prefs
                await fetchUserData(user.id)

                // Fetch saved jobs
                const { data: jobs } = await supabase
                    .from('saved_jobs')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })

                if (jobs) setSavedJobs(jobs)

                // Fetch resumes
                const { data: resumes } = await supabase
                    .from('resumes')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })

                if (resumes) setResumes(resumes)
            }
            setIsLoading(false)
        }

        initDashboard()
    }, [])

    const stats = [
        { label: 'Saved Jobs', value: savedJobs.length, icon: Briefcase },
        { label: 'Applied', value: savedJobs.filter(j => j.status === 'applied').length, icon: Clock },
        { label: 'Interviews', value: savedJobs.filter(j => j.status === 'interviewing').length, icon: Target },
        { label: 'Skills Matched', value: primaryResume?.extracted_skills?.length || 0, icon: TrendingUp },
    ]

    return (
        <div className="space-y-6 md:space-y-8 animate-fade-in font-['General_Sans',_sans-serif]">
            {/* Welcome Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="min-w-0">
                    <h1 className="font-medium text-2xl md:text-3xl text-white mb-2 tracking-tight">
                        Welcome back, {profile?.full_name?.split(' ')[0] || 'there'}! 👋
                    </h1>
                    <p className="text-white/60 text-sm md:text-base truncate">
                        {preferences?.target_roles?.length
                            ? `Looking for ${preferences.target_roles.slice(0, 2).join(', ')}${preferences.target_roles.length > 2 ? ' and more' : ''} roles`
                            : 'Set up your job preferences to get started'
                        }
                    </p>
                </div>
                <Link to="/jobs" className="shrink-0">
                    <Button className="group rounded-full bg-white text-black hover:bg-white/90 w-full sm:w-auto text-sm md:text-base">
                        <Search className="w-4 h-4 mr-2" />
                        Find New Jobs
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </Link>
            </div>

            {/* Stats Grid */}
            {isLoading ? (
                <StatsSkeleton />
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    {stats.map((stat) => {
                        const Icon = stat.icon
                        return (
                            <Card key={stat.label} className="relative overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm">
                                <div className="flex items-start justify-between">
                                    <div className="min-w-0">
                                        <p className="text-white/50 text-xs md:text-sm mb-1 uppercase tracking-wider truncate">{stat.label}</p>
                                        <p className="font-medium text-2xl md:text-3xl text-white">{stat.value}</p>
                                    </div>
                                    <div className={`p-1.5 md:p-2 rounded-lg bg-white/5 text-white/80 shrink-0`}>
                                        <Icon className="w-4 h-4 md:w-5 md:h-5" />
                                    </div>
                                </div>
                            </Card>
                        )
                    })}
                </div>
            )}

            {/* Quick Actions */}
            <div>
                <h2 className="font-medium text-lg md:text-xl text-white mb-4 md:mb-6">Quick Actions</h2>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                    {quickActions.map((action) => {
                        const Icon = action.icon
                        return (
                            <Link key={action.path} to={action.path}>
                                <Card hover className="h-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all">
                                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center mb-4 md:mb-6`}>
                                        <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                                    </div>
                                    <h3 className="font-medium text-base md:text-lg text-white mb-1 md:mb-2">
                                        {action.label}
                                    </h3>
                                    <p className="text-white/50 text-sm leading-relaxed">
                                        {action.description}
                                    </p>
                                </Card>
                            </Link>
                        )
                    })}
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                {/* Resume Status */}
                <Card className="border border-white/10 bg-white/5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 md:mb-6">
                        <h3 className="font-medium text-lg text-white">Resume Status</h3>
                        <Link to="/resume">
                            <Button variant="ghost" size="sm" className="text-white/60 hover:text-white w-full sm:w-auto justify-center">
                                Manage <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                        </Link>
                    </div>

                    {primaryResume ? (
                        <div className="space-y-4 md:space-y-6">
                            <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-2xl bg-white/5 border border-white/5">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                                    <FileText className="w-5 h-5 md:w-6 md:h-6 text-white" />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-medium text-white truncate">{primaryResume.original_filename}</p>
                                    <p className="text-sm text-white/50">
                                        {primaryResume.extracted_skills?.length} skills extracted
                                    </p>
                                </div>
                            </div>

                            {primaryResume.extracted_skills && (
                                <div>
                                    <p className="text-sm text-white/50 mb-3 uppercase tracking-wider">Top Skills</p>
                                    <div className="flex flex-wrap gap-2">
                                        {primaryResume.extracted_skills.slice(0, 6).map((skill) => (
                                            <span
                                                key={skill}
                                                className="px-2.5 md:px-3 py-1 md:py-1.5 rounded-full bg-white/5 border border-white/10 text-white/80 text-xs md:text-sm"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                        {primaryResume.extracted_skills.length > 6 && (
                                            <span className="px-2.5 md:px-3 py-1 md:py-1.5 rounded-full bg-white/10 text-white/60 text-xs md:text-sm">
                                                +{primaryResume.extracted_skills.length - 6} more
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <EmptyState
                            icon={<Upload className="w-8 h-8 text-white/40" />}
                            title="No resume uploaded yet"
                            description="Upload your resume to get AI-powered insights and tailored job recommendations."
                            action={{
                                label: 'Upload Resume',
                                href: '/resume'
                            }}
                        />
                    )}
                </Card>

                {/* Saved Jobs */}
                <Card className="border border-white/10 bg-white/5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 md:mb-6">
                        <h3 className="font-medium text-lg text-white">Recent Saved Jobs</h3>
                        <Link to="/jobs">
                            <Button variant="ghost" size="sm" className="text-white/60 hover:text-white w-full sm:w-auto justify-center">
                                View All <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                        </Link>
                    </div>

                    {savedJobs.length > 0 ? (
                        <div className="space-y-2 md:space-y-3">
                            {savedJobs.slice(0, 4).map((job) => (
                                <Link
                                    key={job.id}
                                    to={`/jobs/${job.id}`}
                                    className="block"
                                >
                                    <div
                                        className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                                    >
                                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-white/10 flex items-center justify-center text-white font-semibold border border-white/10 shrink-0">
                                            {job.company[0]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-white text-sm md:text-base truncate">{job.title}</p>
                                            <p className="text-xs md:text-sm text-white/50 truncate">{job.company}</p>
                                        </div>
                                        <span className={`
                        px-2 md:px-3 py-1 rounded-full text-xs font-medium capitalize border border-white/5 shrink-0
                        ${job.status === 'saved' ? 'bg-blue-500/10 text-blue-300' : ''}
                        ${job.status === 'applied' ? 'bg-purple-500/10 text-purple-300' : ''}
                        ${job.status === 'interviewing' ? 'bg-green-500/10 text-green-300' : ''}
                        ${job.status === 'offer' ? 'bg-yellow-500/10 text-yellow-300' : ''}
                        ${job.status === 'rejected' ? 'bg-red-500/10 text-red-300' : ''}
                      `}>
                                            {job.status}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            icon={<Briefcase className="w-8 h-8 text-white/40" />}
                            title="No saved jobs yet"
                            description="Start your job search and save positions that interest you."
                            action={{
                                label: 'Start Searching',
                                href: '/jobs'
                            }}
                        />
                    )}
                </Card>
            </div>

            {/* AI Generation CTA */}
            <Card className="relative overflow-hidden border border-white/10 bg-white/5">
                <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-transparent opacity-50" />
                <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6 p-2">
                    <div className="flex items-center gap-4 md:gap-6">
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center shadow-lg shadow-white/5 shrink-0">
                            <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-white" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-medium text-lg md:text-xl text-white mb-1 md:mb-2">
                                Ready to create tailored applications?
                            </h3>
                            <p className="text-white/60 text-sm md:text-base">
                                Use AI to generate resumes and cover letters optimized for each job
                            </p>
                        </div>
                    </div>
                    <Link to="/generate" className="shrink-0">
                        <Button size="lg" className="group rounded-full bg-white text-black hover:bg-white/90 border-0 w-full md:w-auto text-sm md:text-base">
                            Generate Now
                            <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </div>
            </Card>
        </div>
    )
}

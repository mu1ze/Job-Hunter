import { useEffect } from 'react'
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
    Plus
} from 'lucide-react'
import { Button, Card } from '../components/ui'
import { useUserStore, useJobsStore, useResumeStore } from '../stores'
import { supabase } from '../lib/supabase'

const quickActions = [
    {
        icon: Search,
        label: 'Search Jobs',
        description: 'Find your next opportunity',
        path: '/jobs',
        gradient: 'from-blue-500 to-cyan-500'
    },
    {
        icon: FileText,
        label: 'Upload Resume',
        description: 'Parse and analyze your CV',
        path: '/resume',
        gradient: 'from-purple-500 to-pink-500'
    },
    {
        icon: Sparkles,
        label: 'Generate Cover Letter',
        description: 'AI-tailored applications',
        path: '/generate',
        gradient: 'from-orange-500 to-red-500'
    },
]

export default function Dashboard() {
    const { profile, preferences, fetchUserData } = useUserStore()
    const { savedJobs, setSavedJobs } = useJobsStore()
    const { primaryResume, setResumes } = useResumeStore()

    useEffect(() => {
        const initDashboard = async () => {
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
        }

        initDashboard()
    }, [])

    const stats = [
        { label: 'Saved Jobs', value: savedJobs.length, icon: Briefcase, color: 'text-blue-400' },
        { label: 'Applied', value: savedJobs.filter(j => j.status === 'applied').length, icon: Clock, color: 'text-purple-400' },
        { label: 'Interviews', value: savedJobs.filter(j => j.status === 'interviewing').length, icon: Target, color: 'text-green-400' },
        { label: 'Skills Matched', value: primaryResume?.extracted_skills?.length || 0, icon: TrendingUp, color: 'text-orange-400' },
    ]

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="font-display text-3xl font-bold text-white mb-2">
                        Welcome back, {profile?.full_name?.split(' ')[0] || 'there'}! 👋
                    </h1>
                    <p className="text-surface-400">
                        {preferences?.target_roles?.length
                            ? `Looking for ${preferences.target_roles.slice(0, 2).join(', ')}${preferences.target_roles.length > 2 ? ' and more' : ''} roles`
                            : 'Set up your job preferences to get started'
                        }
                    </p>
                </div>
                <Link to="/jobs">
                    <Button className="group">
                        <Search className="w-4 h-4 mr-2" />
                        Find New Jobs
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => {
                    const Icon = stat.icon
                    return (
                        <Card key={stat.label} className="relative overflow-hidden">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-surface-400 text-sm mb-1">{stat.label}</p>
                                    <p className="font-display text-3xl font-bold text-white">{stat.value}</p>
                                </div>
                                <div className={`p-2 rounded-lg bg-surface-800 ${stat.color}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                            </div>
                        </Card>
                    )
                })}
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="font-display text-xl font-semibold text-white mb-4">Quick Actions</h2>
                <div className="grid md:grid-cols-3 gap-4">
                    {quickActions.map((action) => {
                        const Icon = action.icon
                        return (
                            <Link key={action.path} to={action.path}>
                                <Card hover className="h-full">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="font-display text-lg font-semibold text-white mb-1">
                                        {action.label}
                                    </h3>
                                    <p className="text-surface-400 text-sm">
                                        {action.description}
                                    </p>
                                </Card>
                            </Link>
                        )
                    })}
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Resume Status */}
                <Card>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-display text-lg font-semibold text-white">Resume Status</h3>
                        <Link to="/resume">
                            <Button variant="ghost" size="sm">
                                Manage <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                        </Link>
                    </div>

                    {primaryResume ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-accent-500/20 flex items-center justify-center">
                                    <FileText className="w-6 h-6 text-accent-400" />
                                </div>
                                <div>
                                    <p className="font-medium text-white">{primaryResume.original_filename}</p>
                                    <p className="text-sm text-surface-400">
                                        {primaryResume.extracted_skills?.length} skills extracted
                                    </p>
                                </div>
                            </div>

                            {primaryResume.extracted_skills && (
                                <div>
                                    <p className="text-sm text-surface-400 mb-2">Top Skills</p>
                                    <div className="flex flex-wrap gap-2">
                                        {primaryResume.extracted_skills.slice(0, 6).map((skill) => (
                                            <span
                                                key={skill}
                                                className="px-3 py-1 rounded-lg bg-surface-800 text-surface-300 text-sm"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                        {primaryResume.extracted_skills.length > 6 && (
                                            <span className="px-3 py-1 rounded-lg bg-primary-500/20 text-primary-400 text-sm">
                                                +{primaryResume.extracted_skills.length - 6} more
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 rounded-2xl bg-surface-800 flex items-center justify-center mx-auto mb-4">
                                <Plus className="w-8 h-8 text-surface-500" />
                            </div>
                            <p className="text-surface-400 mb-4">No resume uploaded yet</p>
                            <Link to="/resume">
                                <Button variant="outline">Upload Resume</Button>
                            </Link>
                        </div>
                    )}
                </Card>

                {/* Saved Jobs */}
                <Card>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-display text-lg font-semibold text-white">Recent Saved Jobs</h3>
                        <Link to="/jobs">
                            <Button variant="ghost" size="sm">
                                View All <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                        </Link>
                    </div>

                    {savedJobs.length > 0 ? (
                        <div className="space-y-3">
                            {savedJobs.slice(0, 4).map((job) => (
                                <div
                                    key={job.id}
                                    className="flex items-center gap-4 p-3 rounded-xl bg-surface-800/50 hover:bg-surface-800 transition-colors"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-surface-700 flex items-center justify-center text-white font-semibold">
                                        {job.company[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-white truncate">{job.title}</p>
                                        <p className="text-sm text-surface-400 truncate">{job.company}</p>
                                    </div>
                                    <span className={`
                    px-2 py-1 rounded-lg text-xs font-medium capitalize
                    ${job.status === 'saved' ? 'bg-blue-500/20 text-blue-400' : ''}
                    ${job.status === 'applied' ? 'bg-purple-500/20 text-purple-400' : ''}
                    ${job.status === 'interviewing' ? 'bg-green-500/20 text-green-400' : ''}
                    ${job.status === 'offer' ? 'bg-yellow-500/20 text-yellow-400' : ''}
                    ${job.status === 'rejected' ? 'bg-red-500/20 text-red-400' : ''}
                  `}>
                                        {job.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 rounded-2xl bg-surface-800 flex items-center justify-center mx-auto mb-4">
                                <Briefcase className="w-8 h-8 text-surface-500" />
                            </div>
                            <p className="text-surface-400 mb-4">No saved jobs yet</p>
                            <Link to="/jobs">
                                <Button variant="outline">Start Searching</Button>
                            </Link>
                        </div>
                    )}
                </Card>
            </div>

            {/* AI Generation CTA */}
            <Card className="relative overflow-hidden border-primary-500/20">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 via-transparent to-accent-500/10" />
                <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center shadow-glow">
                            <Sparkles className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h3 className="font-display text-xl font-semibold text-white">
                                Ready to create tailored applications?
                            </h3>
                            <p className="text-surface-400">
                                Use AI to generate resumes and cover letters optimized for each job
                            </p>
                        </div>
                    </div>
                    <Link to="/generate">
                        <Button size="lg" className="group shrink-0">
                            Generate Now
                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </div>
            </Card>
        </div>
    )
}

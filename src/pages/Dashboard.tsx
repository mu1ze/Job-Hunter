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
        { label: 'Saved Jobs', value: savedJobs.length, icon: Briefcase },
        { label: 'Applied', value: savedJobs.filter(j => j.status === 'applied').length, icon: Clock },
        { label: 'Interviews', value: savedJobs.filter(j => j.status === 'interviewing').length, icon: Target },
        { label: 'Skills Matched', value: primaryResume?.extracted_skills?.length || 0, icon: TrendingUp },
    ]

    return (
        <div className="space-y-8 animate-fade-in font-['General_Sans',_sans-serif]">
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="font-medium text-3xl text-white mb-2 tracking-tight">
                        Welcome back, {profile?.full_name?.split(' ')[0] || 'there'}! 👋
                    </h1>
                    <p className="text-white/60">
                        {preferences?.target_roles?.length
                            ? `Looking for ${preferences.target_roles.slice(0, 2).join(', ')}${preferences.target_roles.length > 2 ? ' and more' : ''} roles`
                            : 'Set up your job preferences to get started'
                        }
                    </p>
                </div>
                <Link to="/jobs">
                    <Button className="group rounded-full bg-white text-black hover:bg-white/90">
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
                        <Card key={stat.label} className="relative overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-white/50 text-sm mb-1 uppercase tracking-wider">{stat.label}</p>
                                    <p className="font-medium text-3xl text-white">{stat.value}</p>
                                </div>
                                <div className={`p-2 rounded-lg bg-white/5 text-white/80`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                            </div>
                        </Card>
                    )
                })}
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="font-medium text-xl text-white mb-6">Quick Actions</h2>
                <div className="grid md:grid-cols-3 gap-6">
                    {quickActions.map((action) => {
                        const Icon = action.icon
                        return (
                            <Link key={action.path} to={action.path}>
                                <Card hover className="h-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all">
                                    <div className={`w-12 h-12 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center mb-6`}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="font-medium text-lg text-white mb-2">
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
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Resume Status */}
                <Card className="border border-white/10 bg-white/5">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-medium text-lg text-white">Resume Status</h3>
                        <Link to="/resume">
                            <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
                                Manage <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                        </Link>
                    </div>

                    {primaryResume ? (
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                                    <FileText className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="font-medium text-white">{primaryResume.original_filename}</p>
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
                                                className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/80 text-sm"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                        {primaryResume.extracted_skills.length > 6 && (
                                            <span className="px-3 py-1.5 rounded-full bg-white/10 text-white/60 text-sm">
                                                +{primaryResume.extracted_skills.length - 6} more
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-6 border border-white/10">
                                <Plus className="w-8 h-8 text-white/40" />
                            </div>
                            <p className="text-white/60 mb-6">No resume uploaded yet</p>
                            <Link to="/resume">
                                <Button variant="outline" className="rounded-full">Upload Resume</Button>
                            </Link>
                        </div>
                    )}
                </Card>

                {/* Saved Jobs */}
                <Card className="border border-white/10 bg-white/5">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-medium text-lg text-white">Recent Saved Jobs</h3>
                        <Link to="/jobs">
                            <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
                                View All <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                        </Link>
                    </div>

                    {savedJobs.length > 0 ? (
                        <div className="space-y-3">
                            {savedJobs.slice(0, 4).map((job) => (
                                <Link
                                    key={job.id}
                                    to={`/jobs/${job.id}`}
                                    className="block"
                                >
                                    <div
                                        className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white font-semibold border border-white/10">
                                            {job.company[0]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-white truncate">{job.title}</p>
                                            <p className="text-sm text-white/50 truncate">{job.company}</p>
                                        </div>
                                        <span className={`
                        px-3 py-1 rounded-full text-xs font-medium capitalize border border-white/5
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
                        <div className="text-center py-12">
                            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-6 border border-white/10">
                                <Briefcase className="w-8 h-8 text-white/40" />
                            </div>
                            <p className="text-white/60 mb-6">No saved jobs yet</p>
                            <Link to="/jobs">
                                <Button variant="outline" className="rounded-full">Start Searching</Button>
                            </Link>
                        </div>
                    )}
                </Card>
            </div>

            {/* AI Generation CTA */}
            <Card className="relative overflow-hidden border border-white/10 bg-white/5">
                <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-transparent opacity-50" />
                <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6 p-2">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center shadow-lg shadow-white/5">
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h3 className="font-medium text-xl text-white mb-2">
                                Ready to create tailored applications?
                            </h3>
                            <p className="text-white/60">
                                Use AI to generate resumes and cover letters optimized for each job
                            </p>
                        </div>
                    </div>
                    <Link to="/generate">
                        <Button size="lg" className="group shrink-0 rounded-full bg-white text-black hover:bg-white/90 border-0">
                            Generate Now
                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </div>
            </Card>
        </div>
    )
}

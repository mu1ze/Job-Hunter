import { useMemo } from 'react'
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import {
    TrendingUp,
    Target,
    Calendar,
    DollarSign,
    Briefcase,
    Award
} from 'lucide-react'
import { Card } from '../components/ui'
import { useJobsStore } from '../stores'

export default function Analytics() {
    const { savedJobs } = useJobsStore()

    // Calculate key metrics
    const metrics = useMemo(() => {
        const total = savedJobs.length
        const applied = savedJobs.filter(j => ['applied', 'interviewing', 'offer'].includes(j.status)).length
        const interviewing = savedJobs.filter(j => j.status === 'interviewing').length
        const offers = savedJobs.filter(j => j.status === 'offer').length
        const rejected = savedJobs.filter(j => j.status === 'rejected').length

        const responseRate = applied > 0 ? Math.round((interviewing + offers) / applied * 100) : 0
        const successRate = applied > 0 ? Math.round(offers / applied * 100) : 0

        // Calculate average days to interview
        const interviewJobs = savedJobs.filter(j => j.applied_date && j.interview_date)
        const avgDaysToInterview = interviewJobs.length > 0
            ? Math.round(interviewJobs.reduce((sum, job) => {
                const applied = new Date(job.applied_date!).getTime()
                const interview = new Date(job.interview_date!).getTime()
                return sum + (interview - applied) / (1000 * 60 * 60 * 24)
            }, 0) / interviewJobs.length)
            : 0

        return {
            total,
            applied,
            interviewing,
            offers,
            rejected,
            responseRate,
            successRate,
            avgDaysToInterview
        }
    }, [savedJobs])

    // Applications over time (last 8 weeks)
    const applicationsOverTime = useMemo(() => {
        const weeks: Record<string, number> = {}
        const now = new Date()

        // Initialize last 8 weeks
        for (let i = 7; i >= 0; i--) {
            const date = new Date(now)
            date.setDate(date.getDate() - (i * 7))
            const weekKey = `Week ${8 - i}`
            weeks[weekKey] = 0
        }

        savedJobs.forEach(job => {
            if (!job.applied_date) return
            const appliedDate = new Date(job.applied_date)
            const diffTime = now.getTime() - appliedDate.getTime()
            const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7))

            if (diffWeeks >= 0 && diffWeeks < 8) {
                const weekKey = `Week ${8 - diffWeeks}`
                if (weeks[weekKey] !== undefined) {
                    weeks[weekKey]++
                }
            }
        })

        return Object.entries(weeks).map(([name, count]) => ({ name, count }))
    }, [savedJobs])

    // Status breakdown
    const statusBreakdown = useMemo(() => {
        return [
            { name: 'Saved', value: savedJobs.filter(j => j.status === 'saved').length, color: '#60a5fa' }, // Blue
            { name: 'Applied', value: savedJobs.filter(j => j.status === 'applied').length, color: '#a78bfa' }, // Purple
            { name: 'Interviewing', value: metrics.interviewing, color: '#fcd34d' }, // Yellow
            { name: 'Offer', value: metrics.offers, color: '#34d399' }, // Green
            { name: 'Rejected', value: metrics.rejected, color: '#f87171' }, // Red
        ].filter(item => item.value > 0)
    }, [savedJobs, metrics])

    // Salary insights
    const salaryData = useMemo(() => {
        const ranges: Record<string, number> = {
            '0-50k': 0,
            '50-75k': 0,
            '75-100k': 0,
            '100-150k': 0,
            '150k+': 0
        }

        savedJobs.forEach(job => {
            if (!job.salary_min) return
            const salary = job.salary_min

            if (salary < 50000) ranges['0-50k']++
            else if (salary < 75000) ranges['50-75k']++
            else if (salary < 100000) ranges['75-100k']++
            else if (salary < 150000) ranges['100-150k']++
            else ranges['150k+']++
        })

        return Object.entries(ranges)
            .map(([range, count]) => ({ range, count }))
            .filter(item => item.count > 0)
    }, [savedJobs])

    // Top companies
    const topCompanies = useMemo(() => {
        const companyCounts: Record<string, number> = {}
        savedJobs.forEach(job => {
            companyCounts[job.company] = (companyCounts[job.company] || 0) + 1
        })

        return Object.entries(companyCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([company, count]) => ({ company, count }))
    }, [savedJobs])

    return (
        <div className="animate-fade-in space-y-6 font-['General_Sans',_sans-serif]">
            {/* Header */}
            <div>
                <h1 className="font-medium text-3xl text-white mb-2 tracking-tight">Analytics Dashboard</h1>
                <p className="text-white/60">
                    Insights into your job search journey
                </p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard
                    icon={<Briefcase className="w-5 h-5 text-white" />}
                    label="Total Applications"
                    value={metrics.total.toString()}
                    color="bg-blue-500/20"
                />
                <MetricCard
                    icon={<Target className="w-5 h-5 text-white" />}
                    label="Response Rate"
                    value={`${metrics.responseRate}%`}
                    color="bg-purple-500/20"
                />
                <MetricCard
                    icon={<Calendar className="w-5 h-5 text-white" />}
                    label="Avg. Days to Interview"
                    value={metrics.avgDaysToInterview > 0 ? metrics.avgDaysToInterview.toString() : 'N/A'}
                    color="bg-yellow-500/20"
                />
                <MetricCard
                    icon={<Award className="w-5 h-5 text-white" />}
                    label="Success Rate"
                    value={`${metrics.successRate}%`}
                    color="bg-green-500/20"
                />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Applications Over Time */}
                <Card className="border border-white/10 bg-white/5">
                    <h3 className="font-medium text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-white/60" />
                        Applications Over Time
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={applicationsOverTime}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                            <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" tickLine={false} axisLine={false} />
                            <YAxis stroke="rgba(255,255,255,0.4)" tickLine={false} axisLine={false} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#000000',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px',
                                    color: '#fff'
                                }}
                            />
                            <Line type="monotone" dataKey="count" stroke="#ffffff" strokeWidth={2} dot={{ r: 4, fill: '#000', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>

                {/* Status Breakdown */}
                <Card className="border border-white/10 bg-white/5">
                    <h3 className="font-medium text-white mb-4">Status Breakdown</h3>
                    {statusBreakdown.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={statusBreakdown}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={(entry) => `${entry.name}: ${entry.value}`}
                                    outerRadius={80}
                                    dataKey="value"
                                    stroke="rgba(0,0,0,0.5)"
                                    strokeWidth={2}
                                >
                                    {statusBreakdown.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#000000',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '12px',
                                        color: '#fff'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-center py-20 text-white/20 text-sm border-2 border-dashed border-white/5 rounded-2xl">
                            No application data yet
                        </div>
                    )}
                </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Salary Distribution */}
                <Card className="border border-white/10 bg-white/5">
                    <h3 className="font-medium text-white mb-4 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-white/60" />
                        Salary Distribution
                    </h3>
                    {salaryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={salaryData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                <XAxis dataKey="range" stroke="rgba(255,255,255,0.4)" tickLine={false} axisLine={false} />
                                <YAxis stroke="rgba(255,255,255,0.4)" tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#000000',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '12px',
                                        color: '#fff'
                                    }}
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                />
                                <Bar dataKey="count" fill="#ffffff" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-center py-20 text-white/20 text-sm border-2 border-dashed border-white/5 rounded-2xl">
                            No salary data available
                        </div>
                    )}
                </Card>

                {/* Top Companies */}
                <Card className="border border-white/10 bg-white/5">
                    <h3 className="font-medium text-white mb-4">Top Companies</h3>
                    {topCompanies.length > 0 ? (
                        <div className="space-y-3">
                            {topCompanies.map((item, index) => (
                                <div key={item.company} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                    <div className="flex items-center gap-4">
                                        <span className="font-bold text-white/20 text-xl w-6">#{index + 1}</span>
                                        <span className="text-white font-medium">{item.company}</span>
                                    </div>
                                    <span className="text-white/60 text-sm bg-white/5 px-2 py-1 rounded-md">{item.count} apps</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 text-white/20 text-sm border-2 border-dashed border-white/5 rounded-2xl">
                            No company data yet
                        </div>
                    )}
                </Card>
            </div>
        </div>
    )
}

function MetricCard({ icon, label, value, color }: {
    icon: React.ReactNode
    label: string
    value: string
    color: string
}) {
    return (
        <Card className="border border-white/10 bg-white/5 backdrop-blur-sm">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-white/60 mb-1">{label}</p>
                    <p className="text-3xl font-medium text-white tracking-tight">{value}</p>
                </div>
                <div className={`p-3 rounded-xl ${color} border border-white/5`}>
                    {icon}
                </div>
            </div>
        </Card>
    )
}

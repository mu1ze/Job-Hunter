import { useState, useMemo, useEffect } from 'react'
import {
    Search,
    MapPin,
    Briefcase,
    DollarSign,
    Clock,
    ExternalLink,
    Bookmark,
    BookmarkCheck,
    Filter,
    X,
    Globe,
    Sparkles,
    Trophy,
    BrainCircuit,
    Loader2,
    Settings
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { Button, Input, Card } from '../components/ui'
import { useJobsStore, useUserStore, useResumeStore } from '../stores'
import { adzunaService } from '../services/adzuna'
import { perplexityService } from '../services/perplexity'
import { supabase } from '../lib/supabase'
import type { JobSearchFilters, JobListing, SavedJob } from '../types'
import { showToast, toastMessages } from '../utils/toast'

export default function JobSearch() {
    const [filters, setFilters] = useState<JobSearchFilters>({
        query: '',
        location: '',
        radius: 50,
        remote_only: false,
        sort_by: 'relevance',
        country: 'us'
    })
    const [showFilters, setShowFilters] = useState(false)
    const [jobsList, setJobsList] = useState<JobListing[]>([])
    const [totalResults, setTotalResults] = useState(0)
    const [selectedJob, setSelectedJob] = useState<JobListing | null>(null)
    const [isSearching, setIsSearching] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const { profile, preferences } = useUserStore()

    // Apply global filters if toggled
    useEffect(() => {
        if (preferences?.use_global_filters) {
            setFilters(prev => ({
                ...prev,
                salary_min: preferences.salary_min || prev.salary_min,
                location: preferences.location || prev.location,
                remote_only: preferences.remote_preference === 'remote' ? true : prev.remote_only
            }))
        }
    }, [preferences])

    // Research State
    const [isResearching, setIsResearching] = useState(false)
    const [researchResult, setResearchResult] = useState<string | null>(null)
    const [showResearchModal, setShowResearchModal] = useState(false)

    const resultsPerPage = 20

    const { savedJobs, addSavedJob, removeSavedJob, setSearching } = useJobsStore()
    const { primaryResume } = useResumeStore()

    const countries = [
        { code: 'us', name: 'United States' },
        { code: 'ca', name: 'Canada' },
        { code: 'gb', name: 'United Kingdom' },
        { code: 'au', name: 'Australia' },
        { code: 'in', name: 'India' },
        { code: 'sg', name: 'Singapore' },
        { code: 'ng', name: 'Nigeria' },
        { code: 'za', name: 'South Africa' },
        { code: 'nz', name: 'New Zealand' },
        { code: 'fr', name: 'France' },
        { code: 'de', name: 'Germany' },
        { code: 'nl', name: 'Netherlands' },
        { code: 'pl', name: 'Poland' },
    ]

    // Compatibility score for each job
    const [matchScores, setMatchScores] = useState<Record<string, number>>({})

    const handleAIDeepSearch = async () => {
        if (!primaryResume) {
            showToast.error("Please upload a resume first to use AI Deep Match.")
            return
        }

        setIsSearching(true)
        setSearching(true)
        setMatchScores({})
        setSelectedJob(null)

        try {
            const { results, count, queries_used } = await adzunaService.deepSearchJobs(
                filters,
                `
                Summary: ${primaryResume.summary || ''}
                
                Skills: ${primaryResume.extracted_skills?.join(', ') || ''}
                
                Experience:
                ${primaryResume.work_experience?.map(exp => `
                    ${exp.title} at ${exp.company}
                    ${exp.description}
                    ${exp.achievements?.join('\n')}
                `).join('\n') || ''}
                `,
                preferences
            )

            setJobsList(results)
            setTotalResults(count)
            setCurrentPage(1)

            const newScores: Record<string, number> = {}
            results.forEach(job => {
                if (job.__match_score) {
                    newScores[job.id] = job.__match_score
                }
            })
            setMatchScores(newScores)

            if (queries_used && queries_used.length > 0) {
                showToast.success(`Deep search complete! Used ${queries_used.length} smart queries.`)
            } else {
                showToast.success("Deep search complete!")
            }

        } catch (error) {
            console.error("Deep search error:", error)
            showToast.error(toastMessages.error.aiBusy)
        } finally {
            setIsSearching(false)
            setSearching(false)
        }
    }

    const handleCompanyResearch = async () => {
        if (!selectedJob) return

        setIsResearching(true)
        setResearchResult(null)
        setShowResearchModal(true)

        try {
            const result = await perplexityService.researchCompany(selectedJob.company, selectedJob.title)
            setResearchResult(result.content)
        } catch (error) {
            showToast.error(toastMessages.error.aiBusy)
            setShowResearchModal(false)
            console.error('Research error:', error)
        } finally {
            setIsResearching(false)
        }
    }

    // Caching helper
    const getCacheKey = (searchFilters: JobSearchFilters) => {
        return `job-search:${JSON.stringify(searchFilters)}`
    }

    const handleSearch = async (searchFilters = filters, useCache = true) => {
        setIsSearching(true)
        setSearching(true)

        try {
            const cacheKey = getCacheKey(searchFilters)
            const cached = useCache ? localStorage.getItem(cacheKey) : null

            if (cached) {
                const cachedData = JSON.parse(cached)
                if (Date.now() - cachedData.timestamp < 5 * 60 * 1000) {
                    setJobsList(cachedData.results)
                    setTotalResults(cachedData.count)
                    if (cachedData.results.length === 0) {
                        showToast.error(toastMessages.error.noJobsFound)
                    }
                    setIsSearching(false)
                    setSearching(false)
                    return
                }
            }

            const { results, count } = await adzunaService.searchJobs(searchFilters)
            setJobsList(results)
            setTotalResults(count)
            setCurrentPage(1)

            if (results.length === 0) {
                showToast.error(toastMessages.error.noJobsFound)
            }

            localStorage.setItem(cacheKey, JSON.stringify({
                results,
                count,
                timestamp: Date.now()
            }))
        } catch (error: any) {
            console.error('Search failed:', error)
            showToast.error(toastMessages.error.networkError)
        } finally {
            setIsSearching(false)
            setSearching(false)
        }
    }

    const isJobSaved = (jobId: string) => {
        return savedJobs.some(j => j.external_job_id === jobId || j.id === jobId)
    }

    const toggleSaveJob = async (job: JobListing) => {
        if (!profile) return

        const isSaved = isJobSaved(job.id)

        if (isSaved) {
            const savedJob = savedJobs.find(j => j.external_job_id === job.external_job_id || j.id === job.id)
            if (savedJob) {
                removeSavedJob(savedJob.id)

                const { error } = await supabase
                    .from('saved_jobs')
                    .delete()
                    .eq('id', savedJob.id)

                if (error) {
                    addSavedJob(savedJob)
                    showToast.error(toastMessages.job.removeFailed)
                    console.error('Failed to unsave job:', error)
                } else {
                    showToast.success(toastMessages.job.removed)
                }
            }
        } else {
            // Check for job limit
            if (savedJobs.length >= 100) {
                showToast.error('You can only save up to 100 jobs. Please remove some to save more.')
                return
            }

            const optimisticJob: SavedJob = {
                id: `temp-${Date.now()}`,
                user_id: profile.id,
                external_job_id: job.id,
                title: job.title,
                company: job.company,
                location: job.location,
                salary_range: job.salary_range,
                job_url: job.job_url,
                description: job.description,
                requirements: job.requirements,
                skills_required: job.skills_required,
                posted_at: job.posted_at,
                created_at: new Date().toISOString(),
                status: 'saved',
                notes: null,
                source: job.source || 'adzuna',
            }

            addSavedJob(optimisticJob)

            const { data, error } = await supabase
                .from('saved_jobs')
                .insert([
                    {
                        user_id: profile.id,
                        external_job_id: job.id,
                        title: job.title,
                        company: job.company,
                        location: job.location,
                        salary_range: job.salary_range,
                        job_url: job.job_url,
                        description: job.description,
                        requirements: job.requirements,
                        skills_required: job.skills_required,
                        posted_at: job.posted_at,
                    }
                ])
                .select()
                .maybeSingle()

            if (error) {
                removeSavedJob(optimisticJob.id)
                showToast.error(toastMessages.job.saveFailed)
                console.error('Failed to save job:', error)
            } else if (data) {
                removeSavedJob(optimisticJob.id)
                addSavedJob(data)
                showToast.success(toastMessages.job.saved)
            }
        }
    }

    const paginatedJobs = useMemo(() => {
        const start = (currentPage - 1) * resultsPerPage
        const end = start + resultsPerPage
        return jobsList.slice(start, end)
    }, [jobsList, currentPage])

    const totalPages = Math.ceil(jobsList.length / resultsPerPage)

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        const now = new Date()
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

        if (diffDays === 0) return 'Today'
        if (diffDays === 1) return 'Yesterday'
        if (diffDays < 7) return `${diffDays} days ago`
        return date.toLocaleDateString()
    }

    return (
        <div className="animate-fade-in relative font-['General_Sans',_sans-serif]">
            {/* Research Modal */}
            {showResearchModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <Card className="w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl border border-white/10 bg-black/90">
                        <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-4">
                            <h3 className="text-xl font-medium text-white flex items-center gap-2">
                                <BrainCircuit className="w-6 h-6 text-white" />
                                Deep Research: {selectedJob?.company}
                            </h3>
                            <button
                                onClick={() => setShowResearchModal(false)}
                                className="text-white/40 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            {isResearching ? (
                                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                    <Loader2 className="w-12 h-12 text-white animate-spin" />
                                    <p className="text-white/60 animate-pulse">Analyzing company culture, news, and red flags...</p>
                                </div>
                            ) : researchResult ? (
                                <div className="prose prose-invert prose-sm max-w-none text-white/80">
                                    <ReactMarkdown>{researchResult}</ReactMarkdown>
                                </div>
                            ) : (
                                <div className="text-center py-12 text-white/40">
                                    Failed to load research. Please try again or check your API key.
                                </div>
                            )}
                        </div>

                        <div className="mt-4 pt-4 border-t border-white/10 flex justify-end">
                            <Button variant="secondary" onClick={() => setShowResearchModal(false)}>
                                Close
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* Search Header */}
            <div className="mb-8">
                <h1 className="font-medium text-3xl text-white mb-2 tracking-tight">Find Your Next Role</h1>
                <p className="text-white/60">
                    Search across multiple job boards to find the perfect opportunity
                </p>
            </div>

            {/* Search Bar */}
            <Card className="mb-8 border border-white/10 bg-white/5">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="w-full md:w-48 shrink-0">
                        <div className="relative">
                            <select
                                className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-white/30 appearance-none cursor-pointer hover:bg-white/10 transition-colors"
                                value={filters.country}
                                onChange={(e) => setFilters({ ...filters, country: e.target.value })}
                            >
                                {countries.map(c => (
                                    <option key={c.code} value={c.code} className="bg-black text-white">{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="flex-1">
                        <Input
                            placeholder="Job title, keywords, or company"
                            icon={<Search className="w-5 h-5" />}
                            value={filters.query}
                            onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <div className="flex-1">
                        <Input
                            placeholder="City, state, or remote"
                            icon={<MapPin className="w-5 h-5" />}
                            value={filters.location}
                            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <div className="flex gap-2 items-center">
                        {preferences?.use_global_filters && (
                            <div className="hidden lg:flex items-center px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-[10px] text-white font-medium uppercase tracking-widest whitespace-nowrap">
                                <Settings className="w-3 h-3 mr-2 text-white/60" />
                                Global Filters Active
                            </div>
                        )}
                        <Button
                            variant="secondary"
                            onClick={() => setShowFilters(!showFilters)}
                            className="shrink-0"
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            Filters
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleAIDeepSearch}
                            isLoading={isSearching}
                            className="shrink-0 group"
                        >
                            <Sparkles className="w-4 h-4 mr-2 group-hover:animate-pulse" />
                            AI Deep Match
                        </Button>
                        <Button onClick={() => handleSearch()} isLoading={isSearching} className="shrink-0 rounded-full">
                            <Search className="w-4 h-4 mr-2" />
                            Search
                        </Button>
                    </div>
                </div>

                {/* Expanded Filters */}
                {showFilters && (
                    <div className="mt-6 pt-6 border-t border-white/10 grid md:grid-cols-4 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-white/60 mb-2">Salary Min</label>
                            <Input
                                type="number"
                                placeholder="$50,000"
                                icon={<DollarSign className="w-5 h-5" />}
                                value={filters.salary_min || ''}
                                onChange={(e) => setFilters({ ...filters, salary_min: parseInt(e.target.value) || undefined })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white/60 mb-2">Radius (miles)</label>
                            <Input
                                type="number"
                                placeholder="50"
                                value={filters.radius}
                                onChange={(e) => setFilters({ ...filters, radius: parseInt(e.target.value) || 50 })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white/60 mb-2">Sort By</label>
                            <select
                                className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-white/30 appearance-none cursor-pointer hover:bg-white/10 transition-colors"
                                value={filters.sort_by}
                                onChange={(e) => setFilters({ ...filters, sort_by: e.target.value as JobSearchFilters['sort_by'] })}
                            >
                                <option value="relevance" className="bg-black">Relevance</option>
                                <option value="date" className="bg-black">Most Recent</option>
                                <option value="salary" className="bg-black">Highest Salary</option>
                            </select>
                        </div>
                        <div className="flex items-end h-[50px] pb-3">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${filters.remote_only ? 'bg-white border-white' : 'border-white/30 group-hover:border-white/50'}`}>
                                    {filters.remote_only && <X className="w-3 h-3 text-black" />} {/* Use Check or simplified active state */}
                                    <input
                                        type="checkbox"
                                        checked={filters.remote_only}
                                        onChange={(e) => setFilters({ ...filters, remote_only: e.target.checked })}
                                        className="hidden"
                                    />
                                </div>
                                <span className="text-white/80 group-hover:text-white transition-colors">Remote Only</span>
                            </label>
                        </div>
                    </div>
                )}

                {/* Quick Filters from Preferences */}
                {preferences?.target_roles && preferences.target_roles.length > 0 && (
                    <div className="mt-6 flex flex-wrap gap-2">
                        <span className="text-sm text-white/40 py-1">Quick search:</span>
                        {preferences.target_roles.slice(0, 4).map((role) => (
                            <button
                                key={role}
                                onClick={() => {
                                    setFilters({ ...filters, query: role })
                                    handleSearch()
                                }}
                                className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-white/60 text-sm hover:bg-white/10 hover:text-white transition-colors"
                            >
                                {role}
                            </button>
                        ))}
                    </div>
                )}
            </Card>

            {/* Results Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Job List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-white/40">
                            Showing <span className="text-white font-medium">{jobsList.length}</span> of <span className="text-white font-medium">{totalResults}</span> jobs found
                        </p>
                    </div>

                    {jobsList.length > 0 ? (
                        <>
                            {paginatedJobs.map((job) => (
                                <Card
                                    key={job.id}
                                    hover
                                    className={`cursor-pointer bg-white/5 border border-white/10 hover:bg-white/10 transition-all ${selectedJob?.id === job.id ? 'border-white/40 ring-1 ring-white/10' : ''}`}
                                    onClick={() => setSelectedJob(job)}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/5 flex items-center justify-center text-white font-bold text-lg shrink-0">
                                            {job.company[0]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <h3 className="font-medium text-white text-lg">{job.title}</h3>
                                                    <p className="text-white/50">{job.company}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {matchScores[job.id] !== undefined && (
                                                        <div className="flex flex-col items-end">
                                                            <div className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${matchScores[job.id] >= 80 ? 'bg-green-500/10 text-green-300 border border-green-500/20' :
                                                                matchScores[job.id] >= 60 ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20' :
                                                                    'bg-white/5 text-white/40 border border-white/5'
                                                                }`}>
                                                                {matchScores[job.id] >= 85 && <Trophy className="w-3 h-3" />}
                                                                {matchScores[job.id]}% Match
                                                            </div>
                                                        </div>
                                                    )}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            toggleSaveJob(job)
                                                        }}
                                                        className={`p-2 rounded-lg transition-colors ${isJobSaved(job.id)
                                                            ? 'bg-white text-black hover:bg-white/90'
                                                            : 'bg-white/5 text-white/40 hover:text-white hover:bg-white/10'
                                                            }`}
                                                    >
                                                        {isJobSaved(job.id) ? (
                                                            <BookmarkCheck className="w-5 h-5" />
                                                        ) : (
                                                            <Bookmark className="w-5 h-5" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-3 mt-4 text-sm">
                                                <span className="flex items-center gap-1 text-white/50">
                                                    <MapPin className="w-4 h-4" />
                                                    {job.location}
                                                </span>
                                                {job.salary_range && (
                                                    <span className="flex items-center gap-1 text-white/70">
                                                        <DollarSign className="w-4 h-4" />
                                                        {job.salary_range}
                                                    </span>
                                                )}
                                                {job.remote && (
                                                    <span className="flex items-center gap-1 text-green-300/80">
                                                        <Globe className="w-4 h-4" />
                                                        Remote
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1 text-white/30">
                                                    <Clock className="w-4 h-4" />
                                                    {formatDate(job.posted_at)}
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap gap-2 mt-4">
                                                {job.skills_required.slice(0, 4).map((skill) => (
                                                    <span
                                                        key={skill}
                                                        className="px-2 py-1 rounded-md bg-white/5 border border-white/5 text-white/60 text-xs"
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                                {job.skills_required.length > 4 && (
                                                    <span className="px-2 py-1 rounded-md bg-white/5 text-white/40 text-xs">
                                                        +{job.skills_required.length - 4}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-8">
                                    <Button
                                        variant="secondary"
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="px-4"
                                    >
                                        Previous
                                    </Button>
                                    <div className="flex items-center gap-2">
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            let pageNum: number
                                            if (totalPages <= 5) {
                                                pageNum = i + 1
                                            } else if (currentPage <= 3) {
                                                pageNum = i + 1
                                            } else if (currentPage >= totalPages - 2) {
                                                pageNum = totalPages - 4 + i
                                            } else {
                                                pageNum = currentPage - 2 + i
                                            }
                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => setCurrentPage(pageNum)}
                                                    className={`w-10 h-10 rounded-xl font-medium transition-all ${currentPage === pageNum
                                                        ? 'bg-white text-black shadow-lg shadow-white/20'
                                                        : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                                                        }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            )
                                        })}
                                    </div>
                                    <Button
                                        variant="secondary"
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="px-4"
                                    >
                                        Next
                                    </Button>
                                </div>
                            )}
                        </>
                    ) : (
                        <Card className="text-center py-20 bg-white/5 border border-white/10">
                            {isSearching ? (
                                <div className="space-y-6">
                                    <div className="w-12 h-12 border-4 border-white/10 border-t-white rounded-full animate-spin mx-auto" />
                                    <p className="text-white/60">Searching live jobs...</p>
                                </div>
                            ) : (
                                <>
                                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-6">
                                        <Search className="w-8 h-8 text-white/20" />
                                    </div>
                                    <p className="text-white/60">No jobs found. Try adjusting your search filters.</p>
                                </>
                            )}
                        </Card>
                    )}
                </div>

                {/* Job Detail Panel */}
                <div className="lg:col-span-1">
                    {selectedJob ? (
                        <Card className="sticky top-24 max-h-[calc(100vh-8rem)] flex flex-col !p-0 overflow-hidden border border-white/10 bg-white/5">
                            {/* Fixed Header */}
                            <div className="p-6 pb-4 border-b border-white/10 shrink-0 bg-black/50 backdrop-blur-xl z-10">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-medium text-lg text-white/50 uppercase tracking-wider">Job Details</h3>
                                    <button
                                        onClick={() => setSelectedJob(null)}
                                        className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white lg:hidden"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h4 className="font-semibold text-white text-xl line-clamp-2 leading-tight mb-1">{selectedJob.title}</h4>
                                        <p className="text-white/60">{selectedJob.company}</p>
                                    </div>
                                    {matchScores[selectedJob.id] !== undefined && (
                                        <div className={`px-3 py-1.5 rounded-xl text-sm font-bold flex items-center gap-1.5 shrink-0 ${matchScores[selectedJob.id] >= 80 ? 'bg-green-500/10 text-green-300 border border-green-500/20' :
                                            matchScores[selectedJob.id] >= 60 ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20' :
                                                'bg-white/5 text-white/40 border border-white/5'
                                            }`}>
                                            {matchScores[selectedJob.id] >= 85 && <Trophy className="w-4 h-4" />}
                                            {matchScores[selectedJob.id]}% Match
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Scrollable Content */}
                            <div className="p-6 overflow-y-auto flex-1 space-y-8 custom-scrollbar">
                                <div className="flex flex-wrap gap-2">
                                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70 text-sm">
                                        <MapPin className="w-4 h-4" />
                                        {selectedJob.location}
                                    </span>
                                    {selectedJob.remote && (
                                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-300 text-sm">
                                            <Globe className="w-4 h-4" />
                                            Remote
                                        </span>
                                    )}
                                    {selectedJob.salary_range && (
                                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/10 text-white text-sm">
                                            <DollarSign className="w-4 h-4" />
                                            {selectedJob.salary_range}
                                        </span>
                                    )}
                                </div>

                                <div>
                                    <h5 className="font-medium text-white mb-4 flex items-center gap-2">
                                        <BrainCircuit className="w-4 h-4 text-white/60" />
                                        Required Skills
                                    </h5>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedJob.skills_required.map((skill) => (
                                            <span
                                                key={skill}
                                                className="px-3 py-1.5 rounded-lg bg-white/5 text-white/80 text-sm border border-white/10"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h5 className="font-medium text-white mb-4">Description</h5>
                                    <div className="text-white/70 text-sm leading-relaxed space-y-4 whitespace-pre-wrap">
                                        {selectedJob.description}
                                    </div>
                                </div>
                            </div>

                            {/* Fixed Footer */}
                            <div className="p-6 pt-6 border-t border-white/10 shrink-0 bg-black/50 backdrop-blur-xl z-10">
                                <div className="grid grid-cols-2 gap-4">
                                    <Button
                                        onClick={() => toggleSaveJob(selectedJob)}
                                        variant={isJobSaved(selectedJob.id) ? 'secondary' : 'outline'}
                                        className={`w-full ${isJobSaved(selectedJob.id) ? 'bg-white text-black hover:bg-white/90' : ''}`}
                                    >
                                        {isJobSaved(selectedJob.id) ? (
                                            <>
                                                <BookmarkCheck className="w-4 h-4 mr-2" />
                                                Saved
                                            </>
                                        ) : (
                                            <>
                                                <Bookmark className="w-4 h-4 mr-2" />
                                                Save
                                            </>
                                        )}
                                    </Button>
                                    <a
                                        href={selectedJob.job_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full"
                                    >
                                        <Button className="w-full bg-white text-black hover:bg-white/90 shadow-lg shadow-white/10 border-0 rounded-full">
                                            Apply
                                            <ExternalLink className="w-4 h-4 ml-2" />
                                        </Button>
                                    </a>
                                </div>
                                <div className="mt-4">
                                    <Button
                                        variant="ghost"
                                        onClick={handleCompanyResearch}
                                        className="w-full text-white/50 hover:text-white"
                                    >
                                        <BrainCircuit className="w-4 h-4 mr-2" />
                                        Research Company with AI
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ) : (
                        <Card className="sticky top-24 border border-white/10 bg-white/5 flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                                <Briefcase className="w-8 h-8 text-white/20" />
                            </div>
                            <h3 className="text-xl font-medium text-white mb-2">Select a job</h3>
                            <p className="text-white/50 max-w-xs mx-auto">
                                Click on a job from the list to view full details, requirements, and apply.
                            </p>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}

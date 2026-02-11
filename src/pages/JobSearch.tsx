import { useState, useMemo } from 'react'
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
    Trophy
} from 'lucide-react'
import { Button, Input, Card } from '../components/ui'
import { useJobsStore, useUserStore, useResumeStore } from '../stores'
import { adzunaService } from '../services/adzuna'
import { supabase } from '../lib/supabase'
import type { JobSearchFilters, JobListing, SavedJob } from '../types'
import { showToast, toastMessages } from '../utils/toast'

// Live job search implementation replacing mock data

export default function JobSearch() {
    const [filters, setFilters] = useState<JobSearchFilters>({
        query: '',
        location: '',
        radius: 50,
        remote_only: false,
        sort_by: 'relevance',
    })
    const [showFilters, setShowFilters] = useState(false)
    const [jobsList, setJobsList] = useState<JobListing[]>([])
    const [totalResults, setTotalResults] = useState(0)
    const [selectedJob, setSelectedJob] = useState<JobListing | null>(null)
    const [isSearching, setIsSearching] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const resultsPerPage = 20

    const { savedJobs, addSavedJob, removeSavedJob, setSearching } = useJobsStore()
    const { profile, preferences } = useUserStore()
    const { primaryResume } = useResumeStore()

    // Compatibility score for each job
    const [matchScores, setMatchScores] = useState<Record<string, number>>({})

    const calculateCompatibility = (job: JobListing, resume: any) => {
        if (!resume) return 0

        let score = 0
        const jobText = (job.title + " " + job.description).toLowerCase()

        // 1. Skill Match (50%) - Check keyword overlap
        const skills = resume.extracted_skills || []
        if (skills.length > 0) {
            let matchedSkills = 0
            skills.forEach((skill: string) => {
                if (jobText.includes(skill.toLowerCase())) matchedSkills++
            })
            score += (matchedSkills / skills.length) * 50
        }

        // 2. Title Match (30%) - Check if job title matches previous roles
        const previousTitles = resume.work_experience?.map((exp: any) => exp.title.toLowerCase()) || []
        const currentTitle = job.title.toLowerCase()
        let titleMatch = 0
        previousTitles.forEach((prev: string) => {
            if (currentTitle.includes(prev) || prev.includes(currentTitle)) titleMatch = 1
        })
        score += titleMatch * 30

        // 3. Keyword Match (20%) - Extra points for common industry terms in summary
        const summary = (resume.summary || "").toLowerCase()
        const keywords = summary.split(' ').filter((w: string) => w.length > 4)
        let keywordHits = 0
        keywords.slice(0, 10).forEach((kw: string) => {
            if (jobText.includes(kw)) keywordHits++
        })
        score += Math.min(20, keywordHits * 2)

        return Math.round(score)
    }

    const handleAIDeepSearch = async () => {
        if (!primaryResume) {
            showToast.error("Please upload a resume first to use AI Deep Match.")
            return
        }

        setIsSearching(true)
        setSearching(true)
        setMatchScores({})

        try {
            // Construct a deep query based on resume
            const topSkills = (primaryResume.extracted_skills || []).slice(0, 3).join(" ")
            const recentRole = primaryResume.work_experience?.[0]?.title || ""
            const aiQuery = `${recentRole} ${topSkills}`.trim()

            const searchFilters: JobSearchFilters = {
                ...filters,
                query: aiQuery,
                sort_by: 'relevance'
            }

            const { results, count } = await adzunaService.searchJobs(searchFilters)

            // Calculate scores for all results
            const scores: Record<string, number> = {}
            results.forEach(job => {
                scores[job.id] = calculateCompatibility(job, primaryResume)
            })

            // Sort results by compatibility DESC
            const sortedResults = [...results].sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0))

            setJobsList(sortedResults)
            setTotalResults(count)
            setMatchScores(scores)
            setCurrentPage(1)

            showToast.success(`Found ${results.length} matches optimized for your profile!`)
        } catch (error: any) {
            showToast.error("Deep search failed. Try again.")
        } finally {
            setIsSearching(false)
            setSearching(false)
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
            // Check cache first
            const cacheKey = getCacheKey(searchFilters)
            const cached = useCache ? localStorage.getItem(cacheKey) : null

            if (cached) {
                const cachedData = JSON.parse(cached)
                // Only use cache if less than 5 minutes old
                if (Date.now() - cachedData.timestamp < 5 * 60 * 1000) {
                    setJobsList(cachedData.results)
                    setTotalResults(cachedData.count)
                    setIsSearching(false)
                    setSearching(false)
                    return
                }
            }

            // Fetch from API
            const { results, count } = await adzunaService.searchJobs(searchFilters)
            setJobsList(results)
            setTotalResults(count)
            setCurrentPage(1)

            // Cache results
            localStorage.setItem(cacheKey, JSON.stringify({
                results,
                count,
                timestamp: Date.now()
            }))
        } catch (error: any) {
            console.error('Search failed:', error)
            showToast.error(error.message || 'Failed to fetch jobs. Please try again.')
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

        // Optimistic UI update
        const isSaved = isJobSaved(job.id)

        if (isSaved) {
            const savedJob = savedJobs.find(j => j.external_job_id === job.external_job_id || j.id === job.id)
            if (savedJob) {
                // Remove from UI immediately
                removeSavedJob(savedJob.id)

                // Then sync with server
                const { error } = await supabase
                    .from('saved_jobs')
                    .delete()
                    .eq('id', savedJob.id)

                // Rollback on error
                if (error) {
                    addSavedJob(savedJob)
                    showToast.error(toastMessages.job.removeFailed)
                    console.error('Failed to unsave job:', error)
                } else {
                    showToast.success(toastMessages.job.removed)
                }
            }
        } else {
            // Create optimistic job object
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
                saved_at: new Date().toISOString(),
                status: 'saved',
                notes: null,
                source: job.source || 'adzuna',
            }

            // Add to UI immediately
            addSavedJob(optimisticJob)

            // Then sync with server
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
                // Rollback on error
                removeSavedJob(optimisticJob.id)
                showToast.error(toastMessages.job.saveFailed)
                console.error('Failed to save job:', error)
            } else if (data) {
                // Replace temp ID with real ID
                removeSavedJob(optimisticJob.id)
                addSavedJob(data)
                showToast.success(toastMessages.job.saved)
            }
        }
    }

    // Paginated results
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
        <div className="animate-fade-in">
            {/* Search Header */}
            <div className="mb-6">
                <h1 className="font-display text-3xl font-bold text-white mb-2">Find Your Next Role</h1>
                <p className="text-surface-400">
                    Search across multiple job boards to find the perfect opportunity
                </p>
            </div>

            {/* Search Bar */}
            <Card className="mb-6">
                <div className="flex flex-col md:flex-row gap-4">
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
                    <div className="flex gap-2">
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
                            className="shrink-0 border-primary-500/50 hover:border-primary-500 text-primary-400 group"
                        >
                            <Sparkles className="w-4 h-4 mr-2 group-hover:animate-pulse" />
                            AI Deep Match
                        </Button>
                        <Button onClick={() => handleSearch()} isLoading={isSearching} className="shrink-0">
                            <Search className="w-4 h-4 mr-2" />
                            Search
                        </Button>
                    </div>
                </div>

                {/* Expanded Filters */}
                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-surface-700 grid md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-surface-300 mb-2">Salary Min</label>
                            <Input
                                type="number"
                                placeholder="$50,000"
                                icon={<DollarSign className="w-5 h-5" />}
                                value={filters.salary_min || ''}
                                onChange={(e) => setFilters({ ...filters, salary_min: parseInt(e.target.value) || undefined })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-surface-300 mb-2">Radius (miles)</label>
                            <Input
                                type="number"
                                placeholder="50"
                                value={filters.radius}
                                onChange={(e) => setFilters({ ...filters, radius: parseInt(e.target.value) || 50 })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-surface-300 mb-2">Sort By</label>
                            <select
                                className="w-full px-4 py-2.5 rounded-xl bg-surface-800/50 border border-surface-700 text-surface-100 focus:outline-none focus:border-primary-500"
                                value={filters.sort_by}
                                onChange={(e) => setFilters({ ...filters, sort_by: e.target.value as JobSearchFilters['sort_by'] })}
                            >
                                <option value="relevance">Relevance</option>
                                <option value="date">Most Recent</option>
                                <option value="salary">Highest Salary</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={filters.remote_only}
                                    onChange={(e) => setFilters({ ...filters, remote_only: e.target.checked })}
                                    className="w-4 h-4 rounded bg-surface-800 border-surface-600 text-primary-500 focus:ring-primary-500"
                                />
                                <span className="text-surface-300">Remote Only</span>
                            </label>
                        </div>
                    </div>
                )}

                {/* Quick Filters from Preferences */}
                {preferences?.target_roles && preferences.target_roles.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        <span className="text-sm text-surface-500">Quick search:</span>
                        {preferences.target_roles.slice(0, 4).map((role) => (
                            <button
                                key={role}
                                onClick={() => {
                                    setFilters({ ...filters, query: role })
                                    handleSearch()
                                }}
                                className="px-3 py-1 rounded-lg bg-primary-500/20 text-primary-400 text-sm hover:bg-primary-500/30 transition-colors"
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
                        <p className="text-surface-400">
                            Showing <span className="text-white font-medium">{jobsList.length}</span> of <span className="text-white font-medium">{totalResults}</span> jobs found
                        </p>
                    </div>

                    {jobsList.length > 0 ? (
                        <>
                            {paginatedJobs.map((job) => (
                                <Card
                                    key={job.id}
                                    hover
                                    className={`cursor-pointer ${selectedJob?.id === job.id ? 'border-primary-500' : ''}`}
                                    onClick={() => setSelectedJob(job)}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-surface-700 flex items-center justify-center text-white font-bold text-lg shrink-0">
                                            {job.company[0]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <h3 className="font-semibold text-white text-lg">{job.title}</h3>
                                                    <p className="text-surface-400">{job.company}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {matchScores[job.id] !== undefined && (
                                                        <div className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${matchScores[job.id] >= 80 ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                                            matchScores[job.id] >= 60 ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                                                                'bg-surface-800 text-surface-400'
                                                            }`}>
                                                            {matchScores[job.id] >= 85 && <Trophy className="w-3 h-3" />}
                                                            {matchScores[job.id]}% Match
                                                        </div>
                                                    )}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            toggleSaveJob(job)
                                                        }}
                                                        className={`p-2 rounded-lg transition-colors ${isJobSaved(job.id)
                                                            ? 'bg-primary-500/20 text-primary-400'
                                                            : 'bg-surface-800 text-surface-400 hover:text-white'
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

                                            <div className="flex flex-wrap items-center gap-3 mt-3 text-sm">
                                                <span className="flex items-center gap-1 text-surface-400">
                                                    <MapPin className="w-4 h-4" />
                                                    {job.location}
                                                </span>
                                                {job.salary_range && (
                                                    <span className="flex items-center gap-1 text-accent-400">
                                                        <DollarSign className="w-4 h-4" />
                                                        {job.salary_range}
                                                    </span>
                                                )}
                                                {job.remote && (
                                                    <span className="flex items-center gap-1 text-green-400">
                                                        <Globe className="w-4 h-4" />
                                                        Remote
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1 text-surface-500">
                                                    <Clock className="w-4 h-4" />
                                                    {formatDate(job.posted_at)}
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap gap-2 mt-3">
                                                {job.skills_required.slice(0, 4).map((skill) => (
                                                    <span
                                                        key={skill}
                                                        className="px-2 py-1 rounded-md bg-surface-800 text-surface-300 text-xs"
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                                {job.skills_required.length > 4 && (
                                                    <span className="px-2 py-1 rounded-md bg-surface-800 text-surface-500 text-xs">
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
                                <div className="flex items-center justify-center gap-2 mt-6">
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
                                                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${currentPage === pageNum
                                                        ? 'bg-primary-500 text-white'
                                                        : 'bg-surface-800 text-surface-400 hover:text-white'
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
                        <Card className="text-center py-20">
                            {isSearching ? (
                                <div className="space-y-4">
                                    <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto" />
                                    <p className="text-surface-400">Searching live jobs...</p>
                                </div>
                            ) : (
                                <>
                                    <Search className="w-12 h-12 text-surface-600 mx-auto mb-4" />
                                    <p className="text-surface-400">No jobs found. Try adjusting your search filters.</p>
                                </>
                            )}
                        </Card>
                    )}
                </div>

                {/* Job Detail Panel */}
                <div className="lg:col-span-1">
                    {selectedJob ? (
                        <Card className="sticky top-24">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-display text-lg font-semibold text-white">Job Details</h3>
                                <button
                                    onClick={() => setSelectedJob(null)}
                                    className="p-1 rounded-lg hover:bg-surface-800 text-surface-400 lg:hidden"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h4 className="font-semibold text-white text-xl">{selectedJob.title}</h4>
                                        <p className="text-surface-400">{selectedJob.company}</p>
                                    </div>
                                    {matchScores[selectedJob.id] !== undefined && (
                                        <div className={`px-3 py-1.5 rounded-xl text-sm font-bold flex items-center gap-1.5 shrink-0 ${matchScores[selectedJob.id] >= 80 ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                                matchScores[selectedJob.id] >= 60 ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                                                    'bg-surface-800 text-surface-400 border border-surface-700'
                                            }`}>
                                            {matchScores[selectedJob.id] >= 85 && <Trophy className="w-4 h-4" />}
                                            {matchScores[selectedJob.id]}% Match
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-surface-800 text-surface-300 text-sm">
                                        <MapPin className="w-4 h-4" />
                                        {selectedJob.location}
                                    </span>
                                    {selectedJob.remote && (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-green-500/20 text-green-400 text-sm">
                                            <Globe className="w-4 h-4" />
                                            Remote
                                        </span>
                                    )}
                                </div>

                                {selectedJob.salary_range && (
                                    <div className="flex items-center gap-2 text-accent-400">
                                        <DollarSign className="w-5 h-5" />
                                        <span className="font-semibold">{selectedJob.salary_range}</span>
                                    </div>
                                )}

                                <div>
                                    <h5 className="font-medium text-surface-200 mb-2">Required Skills</h5>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedJob.skills_required.map((skill) => (
                                            <span
                                                key={skill}
                                                className="px-3 py-1 rounded-lg bg-primary-500/20 text-primary-400 text-sm"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h5 className="font-medium text-surface-200 mb-2">Description</h5>
                                    <p className="text-surface-400 text-sm leading-relaxed">
                                        {selectedJob.description}
                                    </p>
                                </div>

                                <div className="flex gap-3 pt-4 border-t border-surface-700">
                                    <Button
                                        onClick={() => toggleSaveJob(selectedJob)}
                                        variant={isJobSaved(selectedJob.id) ? 'secondary' : 'outline'}
                                        className="flex-1"
                                    >
                                        {isJobSaved(selectedJob.id) ? (
                                            <>
                                                <BookmarkCheck className="w-4 h-4 mr-2" />
                                                Saved
                                            </>
                                        ) : (
                                            <>
                                                <Bookmark className="w-4 h-4 mr-2" />
                                                Save Job
                                            </>
                                        )}
                                    </Button>
                                    <a href={selectedJob.job_url} target="_blank" rel="noopener noreferrer" className="flex-1">
                                        <Button className="w-full">
                                            Apply
                                            <ExternalLink className="w-4 h-4 ml-2" />
                                        </Button>
                                    </a>
                                </div>
                            </div>
                        </Card>
                    ) : (
                        <Card className="text-center py-12">
                            <Briefcase className="w-12 h-12 text-surface-600 mx-auto mb-4" />
                            <p className="text-surface-400">Select a job to view details</p>
                        </Card>
                    )}


                </div>
            </div>
        </div>
    )
}

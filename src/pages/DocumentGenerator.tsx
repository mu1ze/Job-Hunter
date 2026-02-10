import { useState } from 'react'
import {
    Sparkles,
    FileText,
    Download,
    Copy,
    CheckCircle,
    AlertTriangle,
    Target,
    RefreshCcw,
    ChevronDown,
    Mail
} from 'lucide-react'
import { Button, Card } from '../components/ui'
import { useJobsStore, useResumeStore } from '../stores'
import { supabase } from '../lib/supabase'
import { showToast, toastMessages } from '../utils/toast'
import { useKeyboardShortcuts, commonShortcuts } from '../hooks/useKeyboardShortcuts'

type DocumentType = 'resume' | 'cover_letter'

export default function DocumentGenerator() {
    const [selectedJobId, setSelectedJobId] = useState<string>('')
    const [documentType, setDocumentType] = useState<DocumentType>('resume')
    const [isGenerating, setIsGenerating] = useState(false)
    const [generatedContent, setGeneratedContent] = useState<string | null>(null)
    const [atsScore, setAtsScore] = useState<number | null>(null)
    const [matchedKeywords, setMatchedKeywords] = useState<string[]>([])
    const [missingKeywords, setMissingKeywords] = useState<string[]>([])
    const [copied, setCopied] = useState(false)

    const { savedJobs } = useJobsStore()
    const { primaryResume } = useResumeStore()

    // Keyboard shortcuts
    useKeyboardShortcuts([
        commonShortcuts.save(() => {
            if (selectedJobId && !isGenerating) {
                handleGenerate()
            }
        }),
        commonShortcuts.escape(() => {
            setSelectedJobId('')
            setGeneratedContent(null)
        }),
    ])

    const handleGenerate = async () => {
        if (!selectedJobId) {
            alert('Please select a job first')
            return
        }

        if (!primaryResume) {
            alert('Please upload a resume first')
            return
        }

        setIsGenerating(true)
        setGeneratedContent(null)
        setAtsScore(null)

        try {
            const selectedJob = savedJobs.find(j => j.id === selectedJobId)
            if (!selectedJob) throw new Error('Job not found')

            // 1. Call AI to generate document
            const { data: generatedDoc, error: genError } = await supabase.functions.invoke('generate-document', {
                body: {
                    resumeData: primaryResume.parsed_data || primaryResume,
                    jobDescription: selectedJob.description,
                    documentType
                }
            })

            if (genError) throw genError
            setGeneratedContent(generatedDoc.content)

            // 2. Calculate ATS score
            const { data: atsData, error: atsError } = await supabase.functions.invoke('calculate-ats-score', {
                body: {
                    resumeData: primaryResume.parsed_data || primaryResume,
                    jobDescription: selectedJob.description
                }
            })

            if (atsError) {
                console.warn('ATS calculation failed:', atsError)
            } else {
                setAtsScore(atsData.ats_score)
                setMatchedKeywords(atsData.matched_keywords || [])
                setMissingKeywords(atsData.missing_keywords || [])
            }
        } catch (error: any) {
            console.error('Generation failed:', error)
            showToast.error(toastMessages.document.generationFailed)
        } finally {
            setIsGenerating(false)
        }
    }

    const handleCopy = () => {
        if (generatedContent) {
            navigator.clipboard.writeText(generatedContent)
            showToast.success(toastMessages.document.copied)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const handleDownload = () => {
        if (generatedContent) {
            const blob = new Blob([generatedContent], { type: 'text/plain' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = documentType === 'resume' ? 'tailored_resume.txt' : 'cover_letter.txt'
            a.click()
            URL.revokeObjectURL(url)
        }
    }

    const selectedJob = savedJobs.find(j => j.id === selectedJobId)

    return (
        <div className="animate-fade-in">
            <div className="mb-6">
                <h1 className="font-display text-3xl font-bold text-white mb-2">AI Document Generator</h1>
                <p className="text-surface-400">
                    Generate tailored resumes and cover letters optimized for ATS systems
                </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Configuration Panel */}
                <div className="lg:col-span-1 space-y-4">
                    {/* Document Type */}
                    <Card>
                        <h3 className="font-display text-lg font-semibold text-white mb-4">Document Type</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setDocumentType('resume')}
                                className={`
                  flex flex-col items-center gap-2 p-4 rounded-xl border transition-all
                  ${documentType === 'resume'
                                        ? 'bg-primary-500/20 border-primary-500 text-white'
                                        : 'bg-surface-800/50 border-surface-700 text-surface-400 hover:border-surface-600'
                                    }
                `}
                            >
                                <FileText className={`w-6 h-6 ${documentType === 'resume' ? 'text-primary-400' : ''}`} />
                                <span className="text-sm font-medium">Resume</span>
                            </button>
                            <button
                                onClick={() => setDocumentType('cover_letter')}
                                className={`
                  flex flex-col items-center gap-2 p-4 rounded-xl border transition-all
                  ${documentType === 'cover_letter'
                                        ? 'bg-primary-500/20 border-primary-500 text-white'
                                        : 'bg-surface-800/50 border-surface-700 text-surface-400 hover:border-surface-600'
                                    }
                `}
                            >
                                <Mail className={`w-6 h-6 ${documentType === 'cover_letter' ? 'text-primary-400' : ''}`} />
                                <span className="text-sm font-medium">Cover Letter</span>
                            </button>
                        </div>
                    </Card>

                    {/* Job Selection */}
                    <Card>
                        <h3 className="font-display text-lg font-semibold text-white mb-4">Target Job</h3>
                        {savedJobs.length > 0 ? (
                            <div className="relative">
                                <select
                                    value={selectedJobId}
                                    onChange={(e) => setSelectedJobId(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-surface-800/50 border border-surface-700 text-surface-100 focus:outline-none focus:border-primary-500 appearance-none cursor-pointer"
                                >
                                    <option value="">Select a saved job...</option>
                                    {savedJobs.map((job) => (
                                        <option key={job.id} value={job.id}>
                                            {job.title} at {job.company}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400 pointer-events-none" />
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-surface-400 text-sm mb-3">No saved jobs yet</p>
                                <Button variant="outline" size="sm" onClick={() => window.location.href = '/jobs'}>
                                    Find Jobs First
                                </Button>
                            </div>
                        )}

                        {selectedJob && (
                            <div className="mt-4 p-3 rounded-xl bg-surface-800/50 border border-surface-700">
                                <h4 className="font-medium text-white">{selectedJob.title}</h4>
                                <p className="text-surface-400 text-sm">{selectedJob.company}</p>
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                    {selectedJob.skills_required.slice(0, 5).map((skill) => (
                                        <span key={skill} className="px-2 py-0.5 rounded bg-surface-700 text-surface-300 text-xs">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </Card>

                    {/* Resume Source */}
                    <Card>
                        <h3 className="font-display text-lg font-semibold text-white mb-4">Source Resume</h3>
                        {primaryResume ? (
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-accent-500/10 border border-accent-500/20">
                                <FileText className="w-5 h-5 text-accent-400" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">
                                        {primaryResume.original_filename}
                                    </p>
                                    <p className="text-xs text-surface-400">
                                        {primaryResume.extracted_skills.length} skills detected
                                    </p>
                                </div>
                                <CheckCircle className="w-5 h-5 text-accent-400" />
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-surface-400 text-sm mb-3">No resume uploaded</p>
                                <Button variant="outline" size="sm" onClick={() => window.location.href = '/resume'}>
                                    Upload Resume
                                </Button>
                            </div>
                        )}
                    </Card>

                    {/* Generate Button */}
                    <Button
                        onClick={handleGenerate}
                        size="lg"
                        className="w-full group"
                        isLoading={isGenerating}
                        disabled={!selectedJobId}
                    >
                        <Sparkles className="w-5 h-5 mr-2" />
                        {isGenerating ? 'Generating...' : `Generate ${documentType === 'resume' ? 'Resume' : 'Cover Letter'}`}
                    </Button>
                </div>

                {/* Preview Panel */}
                <div className="lg:col-span-2 space-y-4">
                    {/* ATS Score */}
                    {atsScore !== null && (
                        <Card className="border-primary-500/20">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center shadow-glow">
                                        <Target className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-display text-lg font-semibold text-white">ATS Compatibility Score</h3>
                                        <p className="text-surface-400 text-sm">How well your document matches the job requirements</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-display text-4xl font-bold gradient-text">{atsScore}%</div>
                                    <div className="text-sm text-accent-400">Excellent</div>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                {/* Matched Keywords */}
                                <div className="p-4 rounded-xl bg-accent-500/10 border border-accent-500/20">
                                    <div className="flex items-center gap-2 mb-3">
                                        <CheckCircle className="w-5 h-5 text-accent-400" />
                                        <h4 className="font-medium text-accent-400">Matched Keywords ({matchedKeywords.length})</h4>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {matchedKeywords.map((keyword) => (
                                            <span key={keyword} className="px-2 py-1 rounded-lg bg-accent-500/20 text-accent-300 text-xs">
                                                {keyword}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Missing Keywords */}
                                <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                                    <div className="flex items-center gap-2 mb-3">
                                        <AlertTriangle className="w-5 h-5 text-yellow-400" />
                                        <h4 className="font-medium text-yellow-400">Consider Adding ({missingKeywords.length})</h4>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {missingKeywords.map((keyword) => (
                                            <span key={keyword} className="px-2 py-1 rounded-lg bg-yellow-500/20 text-yellow-300 text-xs">
                                                {keyword}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Generated Content */}
                    <Card>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-display text-lg font-semibold text-white">
                                {generatedContent ? 'Generated ' : 'Preview '}
                                {documentType === 'resume' ? 'Resume' : 'Cover Letter'}
                            </h3>
                            {generatedContent && (
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="sm" onClick={handleGenerate}>
                                        <RefreshCcw className="w-4 h-4 mr-1" />
                                        Regenerate
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={handleCopy}>
                                        {copied ? (
                                            <>
                                                <CheckCircle className="w-4 h-4 mr-1 text-accent-400" />
                                                Copied!
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-4 h-4 mr-1" />
                                                Copy
                                            </>
                                        )}
                                    </Button>
                                    <Button variant="secondary" size="sm" onClick={handleDownload}>
                                        <Download className="w-4 h-4 mr-1" />
                                        Download
                                    </Button>
                                </div>
                            )}
                        </div>

                        {isGenerating ? (
                            <div className="text-center py-16">
                                <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-4 animate-pulse">
                                    <Sparkles className="w-8 h-8 text-white" />
                                </div>
                                <h4 className="font-display text-xl font-semibold text-white mb-2">
                                    AI is working its magic...
                                </h4>
                                <p className="text-surface-400 max-w-md mx-auto">
                                    Analyzing job requirements, extracting key skills, and crafting a perfectly
                                    tailored {documentType === 'resume' ? 'resume' : 'cover letter'} for you.
                                </p>
                                <div className="flex justify-center gap-1 mt-6">
                                    {[0, 1, 2].map((i) => (
                                        <div
                                            key={i}
                                            className="w-2 h-2 rounded-full bg-primary-500 animate-bounce"
                                            style={{ animationDelay: `${i * 0.2}s` }}
                                        />
                                    ))}
                                </div>
                            </div>
                        ) : generatedContent ? (
                            <div className="bg-surface-900 rounded-xl p-6 font-mono text-sm text-surface-300 whitespace-pre-wrap max-h-[600px] overflow-y-auto">
                                {generatedContent}
                            </div>
                        ) : (
                            <div className="text-center py-16 border-2 border-dashed border-surface-700 rounded-xl">
                                <div className="w-16 h-16 rounded-2xl bg-surface-800 flex items-center justify-center mx-auto mb-4">
                                    {documentType === 'resume' ? (
                                        <FileText className="w-8 h-8 text-surface-500" />
                                    ) : (
                                        <Mail className="w-8 h-8 text-surface-500" />
                                    )}
                                </div>
                                <h4 className="font-display text-lg font-semibold text-surface-300 mb-2">
                                    No {documentType === 'resume' ? 'Resume' : 'Cover Letter'} Generated Yet
                                </h4>
                                <p className="text-surface-500 max-w-sm mx-auto">
                                    Select a target job and click "Generate" to create an ATS-optimized
                                    {documentType === 'resume' ? ' resume' : ' cover letter'} tailored to the position.
                                </p>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    )
}

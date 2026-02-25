import { useState, useRef, useEffect } from 'react'
import {
    FileText,
    Upload,
    CheckCircle2,
    AlertCircle,
    Trash2,
    FileUp,
    Briefcase,
    GraduationCap,
    Code,
    Sparkles
} from 'lucide-react'
import { Button, Card } from '../components/ui'
import { useResumeStore, useUserStore } from '../stores'
import { useCareerStore } from '../stores/career'
import { supabase } from '../lib/supabase'
import { analysisService } from '../services/analysis'
import type { ParsedResume } from '../types'
import { showToast } from '../utils/toast'
import { useNavigate } from 'react-router-dom'

export default function ResumeManager() {
    const { resumes, addResume, setResumes, primaryResume, setPrimaryResume } = useResumeStore()
    const { fetchItems: fetchCareerItems, addAnalysis } = useCareerStore()
    const { profile } = useUserStore()
    const navigate = useNavigate()

    // Upload State
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [dragActive, setDragActive] = useState(false)
    const [uploadError, setUploadError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Analysis State
    const [isAnalyzing, setIsAnalyzing] = useState(false)

    const handleAnalyzeCareer = async () => {
        if (!currentResume || !profile) return

        setIsAnalyzing(true)

        try {
            const resumeTextRep = JSON.stringify(currentResume.parsed_data)

            const result = await analysisService.analyzeResume(
                resumeTextRep,
                currentResume.work_experience?.[0]?.title || 'Job Seeker'
            )

            await addAnalysis({
                user_id: profile.id,
                resume_id: currentResume.id,
                analysis_data: result,
                created_at: new Date().toISOString()
            })

            showToast.success("Career analyzed! Redirecting to tracker...")
            navigate('/tracker?tab=analysis')
        } catch (error: any) {
            console.error('Analysis failed:', error)
            showToast.error("Career analysis failed. Please try again.")
        } finally {
            setIsAnalyzing(false)
        }
    }

    const currentResume = primaryResume || resumes[0]

    useEffect(() => {
        if (profile) {
            fetchCareerItems(profile.id)
        }
    }, [profile])

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files[0])
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0])
        }
    }

    const handleFileUpload = async (file: File) => {
        if (!profile) return
        setIsUploading(true)
        setUploadError(null)
        setUploadProgress(10)

        try {
            // 1. Upload to Supabase Storage
            const fileExt = file.name.split('.').pop()?.toLowerCase()
            const fileName = `${profile.id}/${Date.now()}.${fileExt}`
            const filePath = `${fileName}`

            setUploadProgress(20)
            const { error: uploadError } = await supabase.storage
                .from('resumes')
                .upload(filePath, file)

            if (uploadError) throw uploadError
            setUploadProgress(40)

            // 2. Extract text from file
            let fileText = ""

            if (fileExt === 'pdf') {
                try {
                    // Import pdfjs from CDN dynamically
                    const script = document.createElement('script')
                    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
                    document.head.appendChild(script)

                    await new Promise((resolve) => { script.onload = resolve })

                    // @ts-ignore - pdfjsLib comes from the global script
                    const pdfjsLib = window['pdfjsLib']
                    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'

                    const arrayBuffer = await file.arrayBuffer()
                    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
                    let fullText = ""

                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i)
                        const content = await page.getTextContent()
                        const strings = content.items.map((item: any) => item.str)
                        fullText += strings.join(' ') + '\n'
                        setUploadProgress(40 + Math.round((i / pdf.numPages) * 20))
                    }
                    fileText = fullText
                } catch (pdfErr) {
                    console.error('PDF extraction failed:', pdfErr)
                    throw new Error('Could not read text from PDF. Ensure it is not a scanned image.')
                }
            } else {
                fileText = await file.text()
                // Simple cleanup for DOCX if it looks like XML
                if (fileText.includes('<?xml')) {
                    fileText = fileText.replace(/<[^>]*>/g, ' ')
                }
            }

            if (!fileText || fileText.trim().length < 20) {
                throw new Error('Could not extract enough text from the file. Try a plain text or different PDF file.')
            }

            setUploadProgress(70)

            // 3. Call AI parsing Edge Function
            const { data: parsedData, error: parseError } = await supabase.functions.invoke('parse-resume', {
                body: { resumeText: fileText }
            })

            if (parseError || (parsedData && parsedData.error)) {
                console.error('AI parsing failed:', parseError || parsedData.error)
                throw new Error(parsedData?.error || 'Failed to analyze resume content. Please try again.')
            }

            const mockParsedData: Partial<ParsedResume> = {
                user_id: profile.id,
                original_filename: file.name,
                storage_path: filePath,
                summary: parsedData.summary || 'Summary not available',
                extracted_skills: parsedData.extracted_skills || [],
                work_experience: parsedData.work_experience || [],
                education: parsedData.education || [],
                certifications: parsedData.certifications || [],
                parsed_data: parsedData,
                is_primary: resumes.length === 0,
            }

            setUploadProgress(90)
            // 4. Save metadata to database
            const { data, error: dbError } = await supabase
                .from('resumes')
                .insert([mockParsedData])
                .select()
                .maybeSingle()

            if (dbError) throw dbError

            if (data) {
                addResume(data)
            }
            setUploadProgress(100)
        } catch (error: any) {
            console.error('Upload failed:', error)
            setUploadError(error.message || 'Failed to upload resume.')
        } finally {
            setTimeout(() => {
                setIsUploading(false)
                setUploadProgress(0)
            }, 500)
        }
    }

    const handleDeleteResume = async (resumeId: string, storagePath: string) => {
        if (!confirm('Are you sure you want to delete this resume?')) return

        try {
            await supabase.storage.from('resumes').remove([storagePath])
            const { error } = await supabase.from('resumes').delete().eq('id', resumeId)
            if (!error) {
                setResumes(resumes.filter(r => r.id !== resumeId))
            }
        } catch (error: any) {
            showToast.error(error.message || 'Failed to delete resume.')
        }
    }

    const handleSetPrimary = async (resumeId: string) => {
        try {
            await supabase.from('resumes').update({ is_primary: false }).eq('user_id', profile!.id)
            await supabase.from('resumes').update({ is_primary: true }).eq('id', resumeId)
            setPrimaryResume(resumeId)
        } catch (error: any) {
            showToast.error(error.message || 'Failed to update primary resume.')
        }
    }

    const formatDate = (dateStr: string | undefined) => {
        if (!dateStr) return ''
        const date = new Date(dateStr)
        if (isNaN(date.getTime())) return dateStr
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    }



    return (
        <div className="animate-fade-in relative font-['General_Sans',_sans-serif]">
            {/* Analysis Modal Removed - Redirecting to Tracker instead */}

            <div className="mb-6 text-center lg:text-left flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="font-medium text-3xl text-white mb-2 tracking-tight">Resume Manager</h1>
                    <p className="text-white/60">
                        Upload and manage your resumes. We'll extract skills and experience for better matching.
                    </p>
                </div>
                {/* Analyze Button */}
                {currentResume && (
                    <Button
                        onClick={handleAnalyzeCareer}
                        disabled={isAnalyzing}
                        className="bg-white text-black hover:bg-white/90 border-none shadow-lg shadow-white/10 disabled:opacity-70 disabled:cursor-not-allowed group rounded-full"
                    >
                        {isAnalyzing ? (
                            <>
                                <div className="w-5 h-5 mr-2 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5 mr-2 text-black/60 group-hover:text-black" />
                                Analyze Career Path
                            </>
                        )}
                    </Button>
                )}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column: Upload & List */}
                <div className="lg:col-span-1 space-y-4">
                    <Card className="p-6 border border-white/10 bg-white/5">
                        <h3 className="font-medium text-lg text-white mb-4">Upload New</h3>
                        <div
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`
                relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
                ${dragActive ? 'border-white bg-white/10' : 'border-white/10 hover:border-white/20 bg-white/5'}
              `}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept=".pdf,.docx"
                                onChange={handleFileSelect}
                            />
                            {isUploading ? (
                                <div className="space-y-3">
                                    <div className="w-12 h-12 rounded-full border-2 border-white/50 border-t-transparent animate-spin mx-auto" />
                                    <p className="text-white text-sm font-medium">Processing... {uploadProgress}%</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Upload className="w-10 h-10 text-white/40 mx-auto" />
                                    <p className="text-white font-medium">Drop Resume or Click</p>
                                    <p className="text-white/40 text-xs text-nowrap">PDF or DOCX allowed</p>
                                </div>
                            )}
                        </div>
                        {uploadError && (
                            <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2 text-red-500 text-sm">
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                <span>{uploadError}</span>
                            </div>
                        )}
                    </Card>

                    <Card className="p-6 border border-white/10 bg-white/5">
                        <h3 className="font-medium text-lg text-white mb-4">Your Resumes</h3>
                        <div className="space-y-2">
                            {resumes.length === 0 ? (
                                <p className="text-white/40 text-sm text-center py-4 italic">No resumes uploaded yet</p>
                            ) : (
                                resumes.map(resume => (
                                    <div
                                        key={resume.id}
                                        className={`
                      group p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer
                      ${resume.is_primary ? 'bg-white text-black border-transparent' : 'bg-white/5 border-transparent hover:bg-white/10 text-white'}
                    `}
                                        onClick={() => handleSetPrimary(resume.id)}
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <FileText className={`w-5 h-5 shrink-0 ${resume.is_primary ? 'text-black' : 'text-white/40'}`} />
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium truncate">{resume.original_filename}</p>
                                                <p className={`text-[10px] ${resume.is_primary ? 'text-black/60' : 'text-white/40'}`}>Uploaded {new Date(resume.created_at || '').toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleDeleteResume(resume.id, resume.storage_path)
                                                }}
                                                className={`p-1.5 rounded-lg transition-colors ${resume.is_primary ? 'hover:bg-red-500/10 text-black/40 hover:text-red-600' : 'hover:bg-red-500/20 text-white/40 hover:text-red-400'}`}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>

                {/* Right Column: Details Rendering */}
                <div className="lg:col-span-2 space-y-6">
                    {currentResume ? (
                        <>
                            {/* Summary Card */}
                            <Card className="p-6 border border-white/10 bg-white/5">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/5">
                                        <Sparkles className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium text-white mb-2">AI Insight Summary</h3>
                                        <p className="text-white/60 text-sm leading-relaxed">{currentResume.summary}</p>
                                    </div>
                                </div>
                            </Card>

                            {/* Skills Card */}
                            <Card className="p-6 border border-white/10 bg-white/5">
                                <div className="flex items-center gap-2 mb-6">
                                    <Code className="w-5 h-5 text-white/60" />
                                    <h3 className="font-medium text-lg text-white">Core Skills Identified</h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {currentResume.extracted_skills?.map(skill => (
                                        <span key={skill} className="px-3 py-1.5 rounded-full bg-white/5 text-white/80 text-sm border border-white/10 select-none">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </Card>

                            {/* Experience Card */}
                            <Card className="p-6 border border-white/10 bg-white/5">
                                <div className="flex items-center gap-2 mb-6">
                                    <Briefcase className="w-5 h-5 text-white/60" />
                                    <h3 className="font-medium text-lg text-white">Work Experience</h3>
                                </div>
                                <div className="space-y-8">
                                    {currentResume.work_experience?.map((exp, i) => (
                                        <div key={i} className="relative pl-6 border-l border-white/10 last:border-transparent">
                                            <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-white/20 ring-4 ring-black" />
                                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-3">
                                                <div>
                                                    <h4 className="font-medium text-white text-lg leading-tight">{exp.title}</h4>
                                                    <p className="text-white/60 font-medium">{exp.company}</p>
                                                </div>
                                                <div className="text-white/40 text-sm whitespace-nowrap">
                                                    {formatDate(exp.start_date)} — {exp.is_current ? 'Present' : formatDate(exp.end_date)}
                                                </div>
                                            </div>
                                            <p className="text-white/50 text-sm mb-4 leading-relaxed">{exp.description}</p>
                                            {exp.achievements && exp.achievements.length > 0 && (
                                                <ul className="space-y-2">
                                                    {exp.achievements.map((achievement, idx) => (
                                                        <li key={idx} className="flex items-start gap-3 text-sm text-white/60">
                                                            <CheckCircle2 className="w-4 h-4 text-white/40 shrink-0 mt-0.5" />
                                                            <span>{achievement}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            {/* Education Card */}
                            <Card className="p-6 border border-white/10 bg-white/5">
                                <div className="flex items-center gap-2 mb-6">
                                    <GraduationCap className="w-5 h-5 text-white/60" />
                                    <h3 className="font-medium text-lg text-white">Education</h3>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {currentResume.education?.map((edu, i) => (
                                        <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10">
                                            <h4 className="font-medium text-white leading-tight">{edu.degree}</h4>
                                            <p className="text-white/60 text-sm mt-1">{edu.institution}</p>
                                            <p className="text-xs text-white/40 mt-2">{formatDate(edu.start_date)} — {formatDate(edu.end_date)}</p>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </>
                    ) : (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-3xl p-12 text-center opacity-70 bg-white/5">
                            <FileUp className="w-16 h-16 text-white/20 mb-4" />
                            <h3 className="text-xl font-medium text-white mb-2">No Resume Selected</h3>
                            <p className="text-white/50 max-w-sm">
                                Upload a resume to see your parsed profile information and start tailoring your applications.
                            </p>
                            <Button variant="outline" className="mt-6 rounded-full border-white/20 hover:border-white text-white hover:bg-white/10" onClick={() => fileInputRef.current?.click()}>
                                Upload First Resume
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

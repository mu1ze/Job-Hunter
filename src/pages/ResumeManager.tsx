import { useState, useRef } from 'react'
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
import { supabase } from '../lib/supabase'
import type { ParsedResume } from '../types'

export default function ResumeManager() {
    const { resumes, addResume, setResumes, primaryResume, setPrimaryResume } = useResumeStore()
    const { profile } = useUserStore()
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [dragActive, setDragActive] = useState(false)
    const [uploadError, setUploadError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const currentResume = primaryResume || resumes[0]

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
            const fileExt = file.name.split('.').pop()
            const fileName = `${profile.id}/${Date.now()}.${fileExt}`
            const filePath = `${fileName}`

            setUploadProgress(30)
            const { error: uploadError } = await supabase.storage
                .from('resumes')
                .upload(filePath, file)

            if (uploadError) throw uploadError
            setUploadProgress(60)

            // 2. Extract text from file
            const fileText = await file.text()

            // 3. Call AI parsing Edge Function
            const { data: parsedData, error: parseError } = await supabase.functions.invoke('parse-resume', {
                body: { resumeText: fileText }
            })

            if (parseError) {
                console.warn('AI parsing failed:', parseError)
                throw new Error('Failed to parse resume')
            }

            const mockParsedData: Partial<ParsedResume> = {
                user_id: profile.id,
                original_filename: file.name,
                storage_path: filePath,
                summary: parsedData.summary,
                extracted_skills: parsedData.extracted_skills,
                work_experience: parsedData.work_experience,
                education: parsedData.education,
                certifications: parsedData.certifications,
                parsed_data: parsedData,
                is_primary: resumes.length === 0,
            }

            setUploadProgress(80)
            // 3. Save metadata to database
            const { data, error: dbError } = await supabase
                .from('resumes')
                .insert([mockParsedData])
                .select()
                .single()

            if (dbError) throw dbError

            if (data) {
                addResume(data)
            }
            setUploadProgress(100)
        } catch (error: any) {
            console.error('Upload failed:', error)
            setUploadError(error.message || 'Failed to upload resume. Ensure the "resumes" bucket exists.')
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
            alert(error.message)
        }
    }

    const handleSetPrimary = async (resumeId: string) => {
        try {
            await supabase.from('resumes').update({ is_primary: false }).eq('user_id', profile!.id)
            await supabase.from('resumes').update({ is_primary: true }).eq('id', resumeId)
            setPrimaryResume(resumeId)
        } catch (error: any) {
            alert(error.message)
        }
    }

    const formatDate = (dateStr: string | undefined) => {
        if (!dateStr) return ''
        const date = new Date(dateStr)
        if (isNaN(date.getTime())) return dateStr
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    }

    return (
        <div className="animate-fade-in">
            <div className="mb-6 text-center lg:text-left">
                <h1 className="font-display text-3xl font-bold text-white mb-2">Resume Manager</h1>
                <p className="text-surface-400">
                    Upload and manage your resumes. We'll extract skills and experience for better matching.
                </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column: Upload & List */}
                <div className="lg:col-span-1 space-y-4">
                    <Card className="p-6">
                        <h3 className="font-display text-lg font-semibold text-white mb-4">Upload New</h3>
                        <div
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`
                relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
                ${dragActive ? 'border-primary-500 bg-primary-500/10' : 'border-surface-700 hover:border-surface-600 bg-surface-800/30'}
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
                                    <div className="w-12 h-12 rounded-full border-2 border-primary-500 border-t-transparent animate-spin mx-auto" />
                                    <p className="text-white text-sm font-medium">Processing... {uploadProgress}%</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Upload className="w-10 h-10 text-surface-500 mx-auto" />
                                    <p className="text-white font-medium">Drop Resume or Click</p>
                                    <p className="text-surface-500 text-xs text-nowrap">PDF or DOCX allowed</p>
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

                    <Card className="p-6">
                        <h3 className="font-display text-lg font-semibold text-white mb-4">Your Resumes</h3>
                        <div className="space-y-2">
                            {resumes.length === 0 ? (
                                <p className="text-surface-500 text-sm text-center py-4 italic">No resumes uploaded yet</p>
                            ) : (
                                resumes.map(resume => (
                                    <div
                                        key={resume.id}
                                        className={`
                      group p-3 rounded-xl border transition-all flex items-center justify-between
                      ${resume.is_primary ? 'bg-primary-500/10 border-primary-500/30' : 'bg-surface-800/50 border-transparent hover:border-surface-700'}
                    `}
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={() => handleSetPrimary(resume.id)}>
                                            <FileText className={`w-5 h-5 shrink-0 ${resume.is_primary ? 'text-primary-400' : 'text-surface-500'}`} />
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-white truncate">{resume.original_filename}</p>
                                                <p className="text-[10px] text-surface-500">Uploaded {new Date(resume.created_at || '').toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleDeleteResume(resume.id, resume.storage_path)}
                                                className="p-1.5 rounded-lg hover:bg-red-500/20 text-surface-500 hover:text-red-400 transition-colors"
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
                            <Card className="p-6 border-l-4 border-l-primary-500">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center shrink-0">
                                        <Sparkles className="w-6 h-6 text-primary-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-2 underline decoration-primary-500/30">AI Insight Summary</h3>
                                        <p className="text-surface-400 text-sm leading-relaxed">{currentResume.summary}</p>
                                    </div>
                                </div>
                            </Card>

                            {/* Skills Card */}
                            <Card className="p-6">
                                <div className="flex items-center gap-2 mb-6">
                                    <Code className="w-5 h-5 text-accent-400" />
                                    <h3 className="font-display text-lg font-semibold text-white">Core Skills Identified</h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {currentResume.extracted_skills?.map(skill => (
                                        <span key={skill} className="px-3 py-1.5 rounded-lg bg-surface-800 text-surface-200 text-sm font-medium border border-surface-700 select-none">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </Card>

                            {/* Experience Card */}
                            <Card className="p-6">
                                <div className="flex items-center gap-2 mb-6">
                                    <Briefcase className="w-5 h-5 text-blue-400" />
                                    <h3 className="font-display text-lg font-semibold text-white">Work Experience</h3>
                                </div>
                                <div className="space-y-8">
                                    {currentResume.work_experience?.map((exp, i) => (
                                        <div key={i} className="relative pl-6 border-l-2 border-surface-800 last:border-transparent">
                                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-surface-700 group-hover:bg-blue-500 transition-colors" />
                                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-3">
                                                <div>
                                                    <h4 className="font-bold text-white text-lg leading-tight">{exp.title}</h4>
                                                    <p className="text-primary-400 font-medium">{exp.company}</p>
                                                </div>
                                                <div className="text-surface-500 text-sm whitespace-nowrap">
                                                    {formatDate(exp.start_date)} — {exp.is_current ? 'Present' : formatDate(exp.end_date)}
                                                </div>
                                            </div>
                                            <p className="text-surface-400 text-sm mb-4 leading-relaxed">{exp.description}</p>
                                            {exp.achievements && exp.achievements.length > 0 && (
                                                <ul className="space-y-2">
                                                    {exp.achievements.map((achievement, idx) => (
                                                        <li key={idx} className="flex items-start gap-2 text-sm text-surface-300">
                                                            <CheckCircle2 className="w-4 h-4 text-green-500/70 shrink-0 mt-0.5" />
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
                            <Card className="p-6">
                                <div className="flex items-center gap-2 mb-6">
                                    <GraduationCap className="w-5 h-5 text-purple-400" />
                                    <h3 className="font-display text-lg font-semibold text-white">Education</h3>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {currentResume.education?.map((edu, i) => (
                                        <div key={i} className="p-4 rounded-xl bg-surface-800/30 border border-surface-700/50">
                                            <h4 className="font-bold text-white leading-tight">{edu.degree}</h4>
                                            <p className="text-surface-400 text-sm mt-1">{edu.institution}</p>
                                            <p className="text-xs text-surface-500 mt-2">{formatDate(edu.start_date)} — {formatDate(edu.end_date)}</p>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </>
                    ) : (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-surface-800 rounded-3xl p-12 text-center opacity-70">
                            <FileUp className="w-16 h-16 text-surface-600 mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">No Resume Selected</h3>
                            <p className="text-surface-500 max-w-sm">
                                Upload a resume to see your parsed profile information and start tailoring your applications.
                            </p>
                            <Button variant="outline" className="mt-6" onClick={() => fileInputRef.current?.click()}>
                                Upload First Resume
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

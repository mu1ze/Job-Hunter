import React, { useEffect, useCallback, useState } from 'react'
import { X, Download, FileText, Edit3, Save, RotateCcw } from 'lucide-react'
import { showToast } from '../utils/toast'
import type { GeneratedDocument } from '../types'
import GeneratedResumePreview from './GeneratedResumePreview'
import CoverLetterPreview from './CoverLetterPreview'
import { useNavigate } from 'react-router-dom'

export interface DocumentPreviewModalProps {
    /** The generated document to display */
    document: GeneratedDocument | null
    /** Whether the modal is visible */
    isOpen: boolean
    /** Callback to close the modal */
    onClose: () => void
    /** Job title for naming the downloaded file */
    jobTitle: string
    /** Company name for naming the downloaded file */
    companyName: string
    /** The job ID for generating a new version */
    jobId: string
    /** Callback when document is updated */
    onUpdate?: (content: string) => Promise<void>
}

/**
 * A responsive, mobile-optimized modal for previewing/editing resumes and cover letters.
 * Follows the 'Jobs' dashboard design system with premium dark aesthetics.
 */
export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
    document: doc,
    isOpen,
    onClose,
    jobTitle,
    companyName,
    jobId,
    onUpdate
}) => {
    const navigate = useNavigate()
    const [isEditing, setIsEditing] = useState(false)
    const [editContent, setEditContent] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    // Sync edit content when document changes or modal opens
    useEffect(() => {
        if (doc) {
            setEditContent(doc.content)
        }
    }, [doc, isOpen])

    // Reset editing state when closing
    useEffect(() => {
        if (!isOpen) {
            setIsEditing(false)
        }
    }, [isOpen])

    // Handle body scroll locking
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    // Handle Escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (isEditing) setIsEditing(false)
                else onClose()
            }
        }
        window.addEventListener('keydown', handleEsc)
        return () => window.removeEventListener('keydown', handleEsc)
    }, [onClose, isEditing])

    const handleDownload = useCallback(() => {
        if (!doc) return
        const blob = new Blob([doc.content], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = window.document.createElement('a')
        a.href = url
        const filename = `${doc.document_type}_${jobTitle.replace(/\s+/g, '_')}_${companyName.replace(/\s+/g, '_')}.txt`
        a.download = filename
        a.click()
        URL.revokeObjectURL(url)
        showToast.success('Document downloaded')
    }, [doc, jobTitle, companyName])

    const handleCopy = useCallback(() => {
        if (!doc) return
        navigator.clipboard.writeText(doc.content)
        showToast.success('Content copied to clipboard')
    }, [doc])

    const handleSaveEdit = async () => {
        if (!onUpdate) return
        setIsSaving(true)
        try {
            await onUpdate(editContent)
            setIsEditing(false)
            showToast.success('Document updated')
        } catch (error) {
            console.error('Error saving document:', error)
            showToast.error('Failed to save changes')
        } finally {
            setIsSaving(false)
        }
    }

    const handleRemix = useCallback(() => {
        onClose()
        navigate('/generate', { state: { jobId } })
    }, [onClose, navigate, jobId])

    if (!isOpen || !doc) return null

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            {/* Click outside to close */}
            <div className="absolute inset-0" onClick={isEditing ? () => setIsEditing(false) : onClose} />

            <div className="relative bg-[#0A0A0A] border border-white/10 rounded-t-3xl sm:rounded-2xl w-full max-w-5xl h-[92dvh] sm:h-auto sm:max-h-[90vh] flex flex-col shadow-2xl overflow-hidden m-0 sm:m-4 animate-in slide-in-from-bottom duration-300">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 sm:px-8 sm:py-6 border-b border-white/5 flex-shrink-0">
                    <div className="min-w-0 flex-1 pr-4">
                        <h3 id="modal-title" className="text-lg sm:text-xl font-semibold text-white truncate capitalize tracking-tight flex items-center gap-2">
                            {isEditing && <Edit3 className="w-4 h-4 text-purple-400" />}
                            {isEditing ? `Editing ${doc.document_type}` : doc.document_type.replace('_', ' ')}
                        </h3>
                        {!isEditing && doc.ats_score && (
                            <div className="flex items-center gap-2 mt-0.5">
                                <div className={`h-1.5 w-1.5 rounded-full ${doc.ats_score >= 80 ? 'bg-green-400' : 'bg-yellow-400'}`} />
                                <span className="text-[10px] font-medium text-white/40 uppercase tracking-widest">
                                    {doc.ats_score}% ATS Optimized
                                </span>
                            </div>
                        )}
                        {isEditing && (
                            <span className="text-[10px] font-medium text-white/30 uppercase tracking-widest mt-0.5 block">
                                Markdown supported
                            </span>
                        )}
                    </div>

                    <button
                        onClick={isEditing ? () => setIsEditing(false) : onClose}
                        className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-all active:scale-90"
                        aria-label="Close modal"
                    >
                        <X className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                </div>

                {/* Actions Toolbar */}
                <div className="p-2 sm:p-4 border-b border-white/5 bg-black/40 backdrop-blur-xl flex-shrink-0">
                    <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-4xl mx-auto">
                        {!isEditing ? (
                            <>
                                <button
                                    onClick={handleDownload}
                                    className="flex flex-col items-center justify-center gap-1 p-2 sm:py-3.5 rounded-xl bg-white text-black hover:bg-white/90 transition-all font-semibold text-[10px] sm:text-sm active:scale-95 group shadow-lg shadow-white/5"
                                >
                                    <Download className="w-4 h-4" />
                                    <span className="truncate w-full text-center px-1">Download</span>
                                </button>

                                <button
                                    onClick={handleCopy}
                                    className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-white/10 transition-all text-[10px] sm:text-sm active:scale-95"
                                >
                                    <FileText className="w-4 h-4" />
                                    <span className="truncate w-full text-center px-1">Copy</span>
                                </button>

                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 transition-all text-[10px] sm:text-sm active:scale-95"
                                >
                                    <Edit3 className="w-4 h-4" />
                                    <span className="truncate w-full text-center px-1">Edit</span>
                                </button>

                                <button
                                    onClick={handleRemix}
                                    className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all text-[10px] sm:text-sm active:scale-95"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    <span className="truncate w-full text-center px-1">Remix</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="hidden sm:block" /> {/* Column spacer */}
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="col-span-2 sm:col-span-1 flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all text-[10px] sm:text-sm active:scale-95"
                                >
                                    <X className="w-4 h-4" />
                                    <span>Cancel</span>
                                </button>

                                <button
                                    onClick={handleSaveEdit}
                                    disabled={isSaving}
                                    className="col-span-2 sm:col-span-1 flex flex-col items-center justify-center gap-1 p-2 sm:py-3.5 rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition-all font-semibold text-[10px] sm:text-sm active:scale-95 group shadow-lg disabled:opacity-50"
                                >
                                    {isSaving ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <Save className="w-4 h-4" />
                                    )}
                                    <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                                </button>
                                <div className="hidden sm:block" /> {/* Column spacer */}
                            </>
                        )}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden bg-[#0A0A0A] relative scrollbar-thin scrollbar-thumb-white/10">
                    <div className="min-h-full w-full max-w-4xl mx-auto flex flex-col">
                        {isEditing ? (
                            <div className="flex-1 p-4 sm:p-8 flex flex-col">
                                <textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="flex-1 w-full min-h-[50vh] bg-zinc-900/50 border border-white/10 rounded-2xl p-4 sm:p-6 text-white font-mono text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-purple-500/40 resize-none leading-relaxed transition-all"
                                    placeholder="Edit your document here..."
                                    spellCheck={false}
                                />
                            </div>
                        ) : (
                            <div className="p-4 sm:p-8" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                                {doc.document_type === 'resume' ? (
                                    <GeneratedResumePreview document={doc} variant="preview" />
                                ) : (
                                    <CoverLetterPreview document={doc} variant="preview" />
                                )}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    )
}

export default DocumentPreviewModal

import React, { useEffect, useCallback } from 'react'
import { X, Download, FileText, Edit2 } from 'lucide-react'
import { Button } from './ui'
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
}

/**
 * A responsive, mobile-optimized modal for previewing resumes and cover letters.
 * Follows the 'Jobs' dashboard design system with premium dark aesthetics.
 */
export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
    document: doc,
    isOpen,
    onClose,
    jobTitle,
    companyName,
    jobId
}) => {
    const navigate = useNavigate()

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
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', handleEsc)
        return () => window.removeEventListener('keydown', handleEsc)
    }, [onClose])

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

    const handleNewVersion = useCallback(() => {
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
            <div className="absolute inset-0" onClick={onClose} />

            <div className="relative bg-[#0A0A0A] border border-white/10 rounded-t-3xl sm:rounded-2xl w-full max-w-5xl h-[92dvh] sm:h-auto sm:max-h-[90vh] flex flex-col shadow-2xl overflow-hidden m-2 mb-20 sm:m-4 animate-in slide-in-from-bottom duration-300">
                {/* Header - Compact on mobile */}
                <div className="flex items-center justify-between px-5 py-2 sm:px-8 sm:py-6 border-b border-white/5 flex-shrink-0">
                    <div className="min-w-0 flex-1 pr-4">
                        <h3 id="modal-title" className="text-lg sm:text-xl font-semibold text-white truncate capitalize tracking-tight">
                            {doc.document_type.replace('_', ' ')}
                        </h3>
                        {doc.ats_score && (
                            <div className="flex items-center gap-2 mt-1">
                                <div className={`h-1.5 w-1.5 rounded-full ${doc.ats_score >= 80 ? 'bg-green-400' : 'bg-yellow-400'}`} />
                                <span className="text-[11px] font-medium text-white/40 uppercase tracking-widest">
                                    {doc.ats_score}% ATS Optimized
                                </span>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={onClose}
                        className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-all active:scale-90"
                        aria-label="Close modal"
                    >
                        <X className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                </div>

                {/* Actions - Now at the top to avoid bottom bar obstruction */}
                <div className="p-3 sm:p-5 border-b border-white/5 bg-black/40 backdrop-blur-xl flex-shrink-0">
                    <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-3xl mx-auto">
                        <button
                            onClick={handleDownload}
                            className="flex flex-col sm:flex-row items-center justify-center gap-1.5 px-1 py-3 sm:py-3.5 rounded-xl bg-white text-black hover:bg-white/90 transition-all font-semibold text-[10px] sm:text-sm active:scale-95 group shadow-lg shadow-white/5"
                        >
                            <Download className="w-4 h-4" />
                            <span>Download</span>
                        </button>

                        <button
                            onClick={handleCopy}
                            className="flex flex-col sm:flex-row items-center justify-center gap-1.5 px-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-white/10 transition-all text-[10px] sm:text-sm active:scale-95"
                        >
                            <FileText className="w-4 h-4" />
                            <span>Copy</span>
                        </button>

                        <button
                            onClick={handleNewVersion}
                            className="flex flex-col sm:flex-row items-center justify-center gap-1.5 px-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-white/10 transition-all text-[10px] sm:text-sm active:scale-95"
                        >
                            <Edit2 className="w-4 h-4" />
                            <span>Remix</span>
                        </button>

                        <button
                            onClick={onClose}
                            className="flex flex-col sm:flex-row items-center justify-center gap-1.5 px-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all text-[10px] sm:text-sm active:scale-95"
                        >
                            <X className="w-4 h-4" />
                            <span>Cancel</span>
                        </button>
                    </div>
                </div>

                {/* Scrollable Document Area */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden bg-[#0A0A0A] relative scrollbar-thin scrollbar-thumb-white/10">
                    <div className="min-h-full p-4 sm:p-8 w-full max-w-4xl mx-auto" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                        {doc.document_type === 'resume' ? (
                            <GeneratedResumePreview document={doc} variant="preview" />
                        ) : (
                            <CoverLetterPreview document={doc} variant="preview" />
                        )}
                    </div>
                </div>

            </div>
        </div>
    )
}

export default DocumentPreviewModal

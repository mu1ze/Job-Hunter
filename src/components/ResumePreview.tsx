import { useRef } from 'react'
import { Download, Mail, Phone, MapPin, Linkedin } from 'lucide-react'
import { Button } from './ui'
import { showToast } from '../utils/toast'
import type { ParsedResume } from '../types'

interface ResumePreviewProps {
    resume: ParsedResume
    variant?: 'preview' | 'print'
}

export default function ResumePreview({ resume, variant = 'preview' }: ResumePreviewProps) {
    const printRef = useRef<HTMLDivElement>(null)

    const formatDate = (dateStr: string | undefined) => {
        if (!dateStr) return ''
        const date = new Date(dateStr)
        if (isNaN(date.getTime())) return dateStr
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    }

    const handlePrint = () => {
        const printContent = printRef.current
        if (!printContent) return

        const printWindow = window.open('', '_blank')
        if (!printWindow) {
            showToast.error('Please allow popups to print/download resume')
            return
        }

        const summaryText = typeof resume.summary === 'string' ? resume.summary : ''
        const titleWord = summaryText.split(' ').slice(0, 3).join(' ') || 'Resume'

        const styles = `
            <style>
                @import url('https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap');
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                    font-family: 'General Sans', system-ui, sans-serif; 
                    line-height: 1.6; 
                    color: #1a1a1a;
                    background: #fff;
                    padding: 40px;
                    max-width: 850px;
                    margin: 0 auto;
                }
                .header { 
                    text-align: center; 
                    margin-bottom: 30px; 
                    padding-bottom: 20px;
                    border-bottom: 2px solid #2563eb;
                }
                .name { 
                    font-size: 28px; 
                    font-weight: 700; 
                    color: #1e293b; 
                    margin-bottom: 8px;
                    letter-spacing: -0.5px;
                }
                .contact-info { 
                    display: flex; 
                    justify-content: center; 
                    flex-wrap: wrap; 
                    gap: 15px; 
                    font-size: 13px; 
                    color: #64748b;
                    margin-top: 10px;
                }
                .contact-item { 
                    display: flex; 
                    align-items: center; 
                    gap: 5px; 
                }
                .section { 
                    margin-bottom: 25px; 
                }
                .section-title { 
                    font-size: 16px; 
                    font-weight: 600; 
                    color: #2563eb; 
                    text-transform: uppercase; 
                    letter-spacing: 1px;
                    margin-bottom: 12px;
                    padding-bottom: 5px;
                    border-bottom: 1px solid #e2e8f0;
                }
                .summary { 
                    color: #334155; 
                    font-size: 14px;
                    text-align: justify;
                }
                .experience-item { 
                    margin-bottom: 20px; 
                }
                .job-header { 
                    display: flex; 
                    justify-content: space-between; 
                    align-items: baseline;
                    margin-bottom: 5px;
                }
                .job-title { 
                    font-size: 15px; 
                    font-weight: 600; 
                    color: #1e293b;
                }
                .company { 
                    font-size: 14px; 
                    color: #475569; 
                    font-weight: 500;
                }
                .date { 
                    font-size: 13px; 
                    color: #64748b;
                    white-space: nowrap;
                }
                .description { 
                    font-size: 14px; 
                    color: #334155; 
                    margin-bottom: 8px;
                    text-align: justify;
                }
                .achievements { 
                    list-style: none; 
                    padding-left: 0;
                }
                .achievements li { 
                    position: relative; 
                    padding-left: 18px; 
                    font-size: 14px; 
                    color: #475569;
                    margin-bottom: 4px;
                }
                .achievements li::before {
                    content: '•';
                    position: absolute;
                    left: 0;
                    color: #2563eb;
                    font-weight: bold;
                }
                .skills-container { 
                    display: flex; 
                    flex-wrap: wrap; 
                    gap: 8px; 
                }
                .skill-tag { 
                    background: #eff6ff; 
                    color: #1e40af; 
                    padding: 5px 12px; 
                    border-radius: 12px; 
                    font-size: 13px;
                    font-weight: 500;
                    border: 1px solid #dbeafe;
                }
                .education-item { 
                    margin-bottom: 15px; 
                }
                .degree { 
                    font-size: 15px; 
                    font-weight: 600; 
                    color: #1e293b;
                }
                .institution { 
                    font-size: 14px; 
                    color: #475569;
                }
                .edu-date { 
                    font-size: 13px; 
                    color: #64748b;
                }
                @media print {
                    body { padding: 20px; }
                    .no-print { display: none; }
                }
            </style>
        `

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>${titleWord} - ${resume.original_filename}</title>
                    ${styles}
                </head>
                <body>
                    <div class="print-content">
                        ${printContent.innerHTML}
                    </div>
                    <script>
                        window.onload = function() {
                            window.print();
                        }
                    </script>
                </body>
            </html>
        `)
        printWindow.document.close()
    }

    const isPrint = variant === 'print'

    if (isPrint) {
        return (
            <div className="hidden">
                <div ref={printRef} className="bg-white text-gray-900 p-8 max-w-[850px] mx-auto">
                    <ResumeContent resume={resume} formatDate={formatDate} />
                </div>
                <Button
                    onClick={handlePrint}
                    className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white shadow-xl z-50 no-print"
                >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end gap-2">
                <Button
                    onClick={handlePrint}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20"
                    size="sm"
                >
                    <Download className="w-4 h-4 mr-2" />
                    Download Professional PDF
                </Button>
            </div>

            <div ref={printRef} className="bg-white text-gray-900 rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-8 md:p-12 max-w-[850px] mx-auto">
                    <ResumeContent resume={resume} formatDate={formatDate} />
                </div>
            </div>
        </div>
    )
}

function ResumeContent({ resume, formatDate }: { resume: ParsedResume; formatDate: (dateStr: string | undefined) => string }) {
    const parsedData = resume.parsed_data as Record<string, string>
    const firstJobTitle = resume.work_experience?.[0]?.title || 'Professional'
    const displayName = firstJobTitle.split(' ').slice(0, 2).join(' ')

    return (
        <>
            {/* Header Section */}
            <div className="header text-center mb-8 pb-6 border-b-2 border-blue-600">
                <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
                    {displayName}
                </h1>
                {resume.extracted_skills && resume.extracted_skills.length > 0 && (
                    <p className="text-blue-600 font-medium text-sm">
                        {resume.extracted_skills.slice(0, 3).join(' • ')}
                    </p>
                )}
                <div className="contact-info flex justify-center flex-wrap gap-4 mt-3 text-xs text-gray-600">
                    {parsedData?.email && (
                        <div className="contact-item flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            <span>{String(parsedData.email)}</span>
                        </div>
                    )}
                    {parsedData?.phone && (
                        <div className="contact-item flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            <span>{String(parsedData.phone)}</span>
                        </div>
                    )}
                    {parsedData?.location && (
                        <div className="contact-item flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>{String(parsedData.location)}</span>
                        </div>
                    )}
                    {parsedData?.linkedin && (
                        <div className="contact-item flex items-center gap-1">
                            <Linkedin className="w-3 h-3" />
                            <span>{String(parsedData.linkedin)}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Summary Section */}
            {resume.summary && (
                <div className="section mb-6">
                    <h2 className="section-title text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3 pb-1 border-b border-gray-200">
                        Professional Summary
                    </h2>
                    <p className="summary text-gray-700 text-sm leading-relaxed text-justify">
                        {resume.summary}
                    </p>
                </div>
            )}

            {/* Skills Section */}
            {resume.extracted_skills && resume.extracted_skills.length > 0 && (
                <div className="section mb-6">
                    <h2 className="section-title text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3 pb-1 border-b border-gray-200">
                        Core Skills
                    </h2>
                    <div className="skills-container flex flex-wrap gap-2">
                        {resume.extracted_skills.map((skill: string, index: number) => (
                            <span
                                key={index}
                                className="skill-tag bg-blue-50 text-blue-800 px-3 py-1.5 rounded-full text-xs font-medium border border-blue-100"
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Experience Section */}
            {resume.work_experience && resume.work_experience.length > 0 && (
                <div className="section mb-6">
                    <h2 className="section-title text-sm font-semibold text-blue-600 uppercase tracking-wider mb-4 pb-1 border-b border-gray-200">
                        Professional Experience
                    </h2>
                    <div className="space-y-5">
                        {resume.work_experience.map((exp: any, index: number) => (
                            <div key={index} className="experience-item">
                                <div className="job-header flex justify-between items-baseline mb-1">
                                    <div>
                                        <h3 className="job-title text-base font-semibold text-gray-900">
                                            {exp.title}
                                        </h3>
                                        <p className="company text-sm text-gray-600 font-medium">
                                            {exp.company}
                                        </p>
                                    </div>
                                    <span className="date text-xs text-gray-500 whitespace-nowrap">
                                        {formatDate(exp.start_date)} — {exp.is_current ? 'Present' : formatDate(exp.end_date)}
                                    </span>
                                </div>
                                {exp.description && (
                                    <p className="description text-sm text-gray-700 mt-2 leading-relaxed">
                                        {exp.description}
                                    </p>
                                )}
                                {exp.achievements && exp.achievements.length > 0 && (
                                    <ul className="achievements list-none pl-0 mt-2">
                                        {exp.achievements.map((achievement: string, idx: number) => (
                                            <li
                                                key={idx}
                                                className="relative pl-4 text-sm text-gray-600 mb-1 before:content-['•'] before:absolute before:left-0 before:text-blue-600 before:font-bold"
                                            >
                                                {achievement}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Education Section */}
            {resume.education && resume.education.length > 0 && (
                <div className="section mb-6">
                    <h2 className="section-title text-sm font-semibold text-blue-600 uppercase tracking-wider mb-4 pb-1 border-b border-gray-200">
                        Education
                    </h2>
                    <div className="space-y-4">
                        {resume.education.map((edu: any, index: number) => (
                            <div key={index} className="education-item">
                                <h3 className="degree text-sm font-semibold text-gray-900">
                                    {edu.degree}
                                </h3>
                                <p className="institution text-sm text-gray-600">
                                    {edu.institution}
                                </p>
                                <p className="edu-date text-xs text-gray-500 mt-1">
                                    {formatDate(edu.start_date)} — {formatDate(edu.end_date)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Certifications Section */}
            {resume.certifications && resume.certifications.length > 0 && (
                <div className="section mb-6">
                    <h2 className="section-title text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3 pb-1 border-b border-gray-200">
                        Certifications
                    </h2>
                    <ul className="list-disc pl-5 space-y-1">
                        {resume.certifications.map((cert: string, index: number) => (
                            <li key={index} className="text-sm text-gray-700">
                                {typeof cert === 'string' ? cert : 'Certification'}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </>
    )
}

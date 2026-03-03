import { useRef } from 'react'
import { Download } from 'lucide-react'
import { Button } from './ui'
import { showToast } from '../utils/toast'
import type { GeneratedDocument } from '../types'

interface GeneratedResumePreviewProps {
    document: GeneratedDocument
    variant?: 'preview' | 'print'
}

export default function GeneratedResumePreview({ document, variant = 'preview' }: GeneratedResumePreviewProps) {
    const printRef = useRef<HTMLDivElement>(null)

    const handlePrint = () => {
        const printContent = printRef.current
        if (!printContent) return

        const printWindow = window.open('', '_blank')
        if (!printWindow) {
            showToast.error('Please allow popups to print/download resume')
            return
        }

        const styles = `
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');
                
                * { 
                    margin: 0; 
                    padding: 0; 
                    box-sizing: border-box; 
                }
                
                body { 
                    font-family: 'Inter', 'Segoe UI', system-ui, sans-serif; 
                    font-size: 11pt;
                    line-height: 1.5; 
                    color: #1a1a1a;
                    background: #fff;
                    padding: 0;
                    margin: 0;
                    width: 8.5in;
                    min-height: 11in;
                }
                
                .resume-container {
                    width: 8.5in;
                    min-height: 11in;
                    margin: 0 auto;
                    padding: 0.75in 0.9in;
                    position: relative;
                    background: #fff;
                }
                
                .resume-header { 
                    text-align: left; 
                    margin-bottom: 0.3in;
                    padding-bottom: 0.15in;
                    border-bottom: 2pt solid #1e3a8a;
                }
                
                .resume-name { 
                    font-family: 'Crimson Pro', Georgia, serif;
                    font-size: 24pt; 
                    font-weight: 700; 
                    color: #1e3a8a;
                    margin-bottom: 0.06in;
                    letter-spacing: 0;
                }
                
                .resume-contact { 
                    font-size: 9.5pt; 
                    color: #4b5563;
                    line-height: 1.6;
                }
                
                .resume-contact-divider {
                    color: #9ca3af;
                    margin: 0 0.12in;
                }
                
                .resume-section { 
                    margin-bottom: 0.25in; 
                }
                
                .resume-section-title { 
                    font-family: 'Crimson Pro', Georgia, serif;
                    font-size: 11pt; 
                    font-weight: 700; 
                    color: #1e3a8a; 
                    text-transform: uppercase; 
                    letter-spacing: 1.5pt;
                    margin-bottom: 0.1in;
                    padding-bottom: 0.04in;
                    border-bottom: 1pt solid #d1d5db;
                }
                
                .resume-summary { 
                    font-size: 10pt;
                    color: #374151;
                    line-height: 1.55;
                    text-align: left;
                }
                
                .resume-entry {
                    margin-bottom: 0.2in;
                }
                
                .resume-entry:last-child {
                    margin-bottom: 0;
                }
                
                .resume-entry-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: baseline;
                    margin-bottom: 0.03in;
                }
                
                .resume-entry-title {
                    font-family: 'Inter', sans-serif;
                    font-size: 10.5pt;
                    font-weight: 700;
                    color: #111827;
                    margin: 0;
                }
                
                .resume-entry-subtitle {
                    font-size: 10pt;
                    color: #374151;
                    font-weight: 500;
                    margin: 0;
                }
                
                .resume-entry-date {
                    font-size: 9pt;
                    color: #6b7280;
                    font-weight: 400;
                    text-align: right;
                    white-space: nowrap;
                    font-style: italic;
                }
                
                .resume-bullets {
                    margin: 0.04in 0 0 0;
                    padding-left: 0.2in;
                    list-style-type: disc;
                }
                
                .resume-bullet {
                    margin-bottom: 0.03in;
                    font-size: 10pt;
                    color: #374151;
                    line-height: 1.45;
                    text-align: left;
                }
                
                .resume-skill-line {
                    font-size: 10pt;
                    color: #374151;
                    line-height: 1.55;
                    margin-bottom: 0.04in;
                }
                
                .resume-skill-label {
                    font-weight: 600;
                    color: #1f2937;
                }
                
                .resume-edu-entry {
                    margin-bottom: 0.12in;
                }
                
                .resume-cert-entry {
                    font-size: 10pt;
                    color: #374151;
                    margin-bottom: 0.04in;
                    line-height: 1.45;
                }
                
                @media print {
                    @page {
                        size: letter;
                        margin: 0.75in 0.9in;
                    }
                    body { 
                        width: 8.5in;
                        min-height: 11in;
                        padding: 0;
                        margin: 0;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .resume-container {
                        padding: 0;
                        box-shadow: none;
                        width: 100%;
                    }
                    .no-print { display: none !important; }
                    .resume-section { page-break-inside: avoid; }
                    .resume-entry { page-break-inside: avoid; }
                }
            </style>
        `

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Professional Resume</title>
                    ${styles}
                </head>
                <body>
                    <div class="resume-container">
                        ${printContent.innerHTML}
                    </div>
                    <script>
                        window.onload = function() {
                            setTimeout(() => window.print(), 100);
                        }
                    </script>
                </body>
            </html>
        `)
        printWindow.document.close()
    }

    const parseResumeContent = (content: string) => {
        // Strip markdown bold markers from content
        const cleanContent = content.replace(/\*\*/g, '')
        const lines = cleanContent.split('\n')

        const sections: Array<{
            type: 'header' | 'summary' | 'experience' | 'education' | 'skills' | 'certifications' | 'other'
            title: string
            content: string[]
        }> = []

        let currentSection: typeof sections[0] | null = null
        let headerLines: string[] = []
        let foundFirstSection = false

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim()
            if (!line) continue

            // Detect section headers - check for common resume section names
            const sectionMatch = line.match(/^(SUMMARY|PROFESSIONAL SUMMARY|PROFILE|OBJECTIVE|CAREER OBJECTIVE|EXPERIENCE|WORK EXPERIENCE|PROFESSIONAL EXPERIENCE|EMPLOYMENT HISTORY|EDUCATION|ACADEMIC BACKGROUND|SKILLS|TECHNICAL SKILLS|CORE COMPETENCIES|KEY SKILLS|CERTIFICATIONS|CERTIFICATES|PROJECTS|AWARDS|VOLUNTEER|REFERENCES|INTERESTS|LANGUAGES|PUBLICATIONS)$/i)

            if (sectionMatch) {
                if (currentSection) sections.push(currentSection)
                foundFirstSection = true

                let type: typeof sections[0]['type'] = 'other'
                const sectionName = sectionMatch[1].toUpperCase()
                if (/SUMMARY|PROFILE|OBJECTIVE/.test(sectionName)) type = 'summary'
                else if (/EXPERIENCE|WORK|EMPLOYMENT/.test(sectionName)) type = 'experience'
                else if (/EDUCATION|ACADEMIC/.test(sectionName)) type = 'education'
                else if (/SKILLS|COMPETENCIES/.test(sectionName)) type = 'skills'
                else if (/CERTIFICATIONS|CERTIFICATES/.test(sectionName)) type = 'certifications'

                currentSection = { type, title: line, content: [] }
            } else if (!foundFirstSection) {
                // Before first section heading = header/contact info
                headerLines.push(line)
            } else if (currentSection) {
                currentSection.content.push(line)
            }
        }

        if (currentSection) sections.push(currentSection)

        // Build header section from collected header lines
        if (headerLines.length > 0) {
            sections.unshift({ type: 'header', title: 'Contact Information', content: headerLines })
        }

        return sections
    }

    const sections = parseResumeContent(document.content)
    const isPrint = variant === 'print'

    if (isPrint) {
        return (
            <div className="hidden">
                <div ref={printRef} className="resume-container">
                    <ResumeContent sections={sections} />
                </div>
                <Button
                    onClick={handlePrint}
                    className="fixed bottom-6 right-6 bg-blue-700 hover:bg-blue-800 text-white shadow-xl z-50 no-print"
                >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                </Button>
            </div>
        )
    }

    return (
        <div className="w-full max-w-full space-y-4">
            <div className="flex justify-end gap-2 no-print">
                <Button
                    onClick={handlePrint}
                    className="bg-blue-700 hover:bg-blue-800 text-white shadow-lg"
                    size="sm"
                >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                </Button>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                <div ref={printRef} className="resume-preview-container bg-white" style={{
                    maxWidth: '8.5in',
                    width: '100%',
                    minHeight: 'auto',
                    padding: 'clamp(1rem, 4vw, 0.75in) clamp(1rem, 5vw, 0.9in)',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 'clamp(9pt, 1.5vw, 11pt)',
                    lineHeight: 1.5,
                    color: '#1a1a1a',
                    margin: '0 auto',
                }}>
                    <ResumeContent sections={sections} />
                </div>
            </div>
        </div>
    )
}

function ResumeContent({ sections }: { sections: Array<{ type: string; title: string; content: string[] }> }) {
    const headerSection = sections.find(s => s.type === 'header')
    const otherSections = sections.filter(s => s.type !== 'header')

    // Parse header: first line or pipe-separated line is the name, rest is contact info
    const parseHeader = () => {
        if (!headerSection || headerSection.content.length === 0) return { name: '', contactItems: [] as string[] }

        const allContent = headerSection.content.join(' | ')
        const items = allContent.split('|').map(s => s.trim()).filter(s => s)

        // First item that looks like a name (not an email, phone, or URL)
        let name = ''
        const contactItems: string[] = []

        for (const item of items) {
            if (!name && !item.includes('@') && !item.includes('.com') && !item.match(/^\d/) && !item.includes('http') && !item.includes('linkedin')) {
                name = item
            } else {
                contactItems.push(item)
            }
        }

        return { name, contactItems }
    }

    const { name, contactItems } = parseHeader()

    return (
        <>
            {/* Header Section */}
            {headerSection && headerSection.content.length > 0 && (
                <div style={{
                    textAlign: 'left',
                    marginBottom: '0.3in',
                    paddingBottom: '0.15in',
                    borderBottom: '2pt solid #1e3a8a'
                }}>
                    {name && (
                        <h1 style={{
                            fontFamily: "'Crimson Pro', Georgia, serif",
                            fontSize: 'clamp(18pt, 3.5vw, 24pt)',
                            fontWeight: 700,
                            color: '#1e3a8a',
                            margin: '0 0 0.06in 0',
                            letterSpacing: 0,
                            lineHeight: 1.2,
                            wordBreak: 'break-word' as const,
                        }}>
                            {name}
                        </h1>
                    )}

                    {contactItems.length > 0 && (
                        <div style={{
                            fontSize: 'clamp(8pt, 1.3vw, 9.5pt)',
                            color: '#4b5563',
                            lineHeight: 1.6,
                            display: 'flex',
                            flexWrap: 'wrap' as const,
                            gap: '0.04in 0',
                            alignItems: 'center',
                        }}>
                            {contactItems.map((item, i) => (
                                <span key={i} style={{ display: 'inline', whiteSpace: 'nowrap' as const }}>
                                    {item}
                                    {i < contactItems.length - 1 && (
                                        <span style={{ color: '#9ca3af', margin: '0 0.12in' }}>|</span>
                                    )}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Other Sections */}
            {otherSections.map((section, idx) => (
                <div key={idx} style={{ marginBottom: '0.25in' }}>
                    <h2 style={{
                        fontFamily: "'Crimson Pro', Georgia, serif",
                        fontSize: 'clamp(10pt, 1.4vw, 11pt)',
                        fontWeight: 700,
                        color: '#1e3a8a',
                        textTransform: 'uppercase' as const,
                        letterSpacing: '1.5pt',
                        margin: '0 0 0.1in 0',
                        paddingBottom: '0.04in',
                        borderBottom: '1pt solid #d1d5db'
                    }}>
                        {section.title}
                    </h2>

                    <div style={{
                        color: '#1f2937',
                        fontSize: 'clamp(9pt, 1.3vw, 10pt)',
                        lineHeight: 1.5,
                        textAlign: 'left' as const
                    }}>
                        {renderSectionContent(section)}
                    </div>
                </div>
            ))}
        </>
    )
}

function renderSectionContent(section: { type: string; title: string; content: string[] }) {
    const lines = section.content

    switch (section.type) {
        case 'summary':
            return (
                <p style={{
                    fontSize: 'clamp(9pt, 1.3vw, 10pt)',
                    color: '#374151',
                    lineHeight: 1.55,
                    textAlign: 'left' as const,
                    margin: 0
                }}>
                    {lines.join(' ')}
                </p>
            )

        case 'experience': {
            // Parse experience entries: look for lines that seem like job titles + company + dates
            const entries: Array<{
                title: string
                company: string
                date: string
                location: string
                bullets: string[]
            }> = []
            let currentEntry: typeof entries[0] | null = null

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i]

                // Check if this line has pipe separators (title | company | date pattern)
                const pipeCount = (line.match(/\|/g) || []).length

                if (pipeCount >= 1 && !line.startsWith('-') && !line.startsWith('•')) {
                    // This is likely a job entry header line
                    if (currentEntry) entries.push(currentEntry)

                    const parts = line.split('|').map(s => s.trim())
                    currentEntry = {
                        title: parts[0] || '',
                        company: parts[1] || '',
                        date: parts.slice(2).join(' | ') || '',
                        location: '',
                        bullets: []
                    }
                } else if (line.match(/\d{4}/) && (line.includes('–') || line.includes('-') || line.includes('to') || line.includes('Present') || line.includes('Current'))) {
                    // Date line or title with date
                    if (currentEntry && !currentEntry.date) {
                        currentEntry.date = line
                    } else {
                        if (currentEntry) entries.push(currentEntry)
                        currentEntry = { title: line, company: '', date: '', location: '', bullets: [] }
                    }
                } else if (line.startsWith('•') || line.startsWith('-') || line.startsWith('–')) {
                    const bullet = line.replace(/^[•\-–]\s*/, '').trim()
                    if (currentEntry) {
                        currentEntry.bullets.push(bullet)
                    }
                } else if (currentEntry) {
                    // Non-bullet, non-header content — could be a description or sub-info
                    if (currentEntry.bullets.length === 0 && !currentEntry.company) {
                        currentEntry.company = line
                    } else {
                        currentEntry.bullets.push(line)
                    }
                } else {
                    // No current entry yet — start one
                    currentEntry = { title: line, company: '', date: '', location: '', bullets: [] }
                }
            }

            if (currentEntry) entries.push(currentEntry)

            return entries.map((entry, i) => (
                <div key={i} style={{ marginBottom: '0.2in' }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                        marginBottom: '0.03in',
                        flexWrap: 'wrap' as const,
                        gap: '0 0.15in',
                    }}>
                        <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                            {entry.title && (
                                <h3 style={{
                                    fontFamily: "'Inter', sans-serif",
                                    fontSize: 'clamp(9.5pt, 1.4vw, 10.5pt)',
                                    fontWeight: 700,
                                    color: '#111827',
                                    margin: 0,
                                    wordBreak: 'break-word' as const,
                                }}>
                                    {entry.title}
                                </h3>
                            )}
                            {entry.company && (
                                <p style={{
                                    fontSize: 'clamp(9pt, 1.3vw, 10pt)',
                                    color: '#374151',
                                    fontWeight: 500,
                                    margin: '0.02in 0 0 0'
                                }}>
                                    {entry.company}
                                </p>
                            )}
                        </div>
                        {entry.date && (
                            <span style={{
                                fontSize: 'clamp(8pt, 1.2vw, 9pt)',
                                color: '#6b7280',
                                fontStyle: 'italic' as const,
                                whiteSpace: 'nowrap' as const,
                                flexShrink: 0,
                            }}>
                                {entry.date}
                            </span>
                        )}
                    </div>

                    {entry.bullets.length > 0 && (
                        <ul style={{
                            margin: '0.04in 0 0 0',
                            paddingLeft: '0.2in',
                            listStyleType: 'disc'
                        }}>
                            {entry.bullets.map((bullet, j) => (
                                <li key={j} style={{
                                    marginBottom: '0.03in',
                                    fontSize: 'clamp(9pt, 1.3vw, 10pt)',
                                    color: '#374151',
                                    lineHeight: 1.45,
                                    textAlign: 'left' as const
                                }}>
                                    {bullet}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            ))
        }

        case 'education':
            return lines.map((line, i) => {
                // Check for pipe-separated education entries
                if (line.includes('|')) {
                    const parts = line.split('|').map(s => s.trim())
                    return (
                        <div key={i} style={{ marginBottom: '0.12in' }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'baseline',
                                flexWrap: 'wrap' as const,
                                gap: '0 0.15in',
                            }}>
                                <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                                    <h3 style={{
                                        fontFamily: "'Inter', sans-serif",
                                        fontSize: 'clamp(9.5pt, 1.4vw, 10.5pt)',
                                        fontWeight: 700,
                                        color: '#111827',
                                        margin: '0 0 0.02in 0',
                                        wordBreak: 'break-word' as const,
                                    }}>
                                        {parts[0]}
                                    </h3>
                                    {parts[1] && (
                                        <p style={{
                                            fontSize: 'clamp(9pt, 1.3vw, 10pt)',
                                            color: '#374151',
                                            fontWeight: 500,
                                            margin: 0,
                                        }}>
                                            {parts[1]}
                                        </p>
                                    )}
                                </div>
                                {parts[2] && (
                                    <span style={{
                                        fontSize: 'clamp(8pt, 1.2vw, 9pt)',
                                        color: '#6b7280',
                                        fontStyle: 'italic' as const,
                                        whiteSpace: 'nowrap' as const,
                                        flexShrink: 0,
                                    }}>
                                        {parts[2]}
                                    </span>
                                )}
                            </div>
                        </div>
                    )
                }

                // Bullet point
                if (line.startsWith('•') || line.startsWith('-')) {
                    return (
                        <p key={i} style={{
                            margin: '0 0 0.04in 0.2in',
                            fontSize: 'clamp(9pt, 1.3vw, 10pt)',
                            color: '#374151',
                            lineHeight: 1.45,
                            textAlign: 'left' as const,
                            textIndent: '-0.15in',
                            paddingLeft: '0.15in',
                        }}>
                            • {line.replace(/^[•\-–]\s*/, '').trim()}
                        </p>
                    )
                }

                return (
                    <p key={i} style={{
                        fontSize: 'clamp(9pt, 1.3vw, 10pt)',
                        color: '#374151',
                        fontWeight: 500,
                        margin: '0.02in 0 0.08in 0'
                    }}>
                        {line}
                    </p>
                )
            })

        case 'skills': {
            // Check if skills are listed with categories (e.g., "Languages: Java, Python")
            const hasCategories = lines.some(l => l.includes(':'))

            if (hasCategories) {
                return lines.map((line, i) => {
                    // Remove bullet prefix if present
                    const cleanLine = line.replace(/^[•\-–]\s*/, '').trim()
                    const colonIdx = cleanLine.indexOf(':')

                    if (colonIdx > 0) {
                        const label = cleanLine.substring(0, colonIdx)
                        const value = cleanLine.substring(colonIdx + 1).trim()
                        return (
                            <p key={i} style={{
                                fontSize: 'clamp(9pt, 1.3vw, 10pt)',
                                color: '#374151',
                                lineHeight: 1.55,
                                marginBottom: '0.04in',
                            }}>
                                <strong style={{ fontWeight: 600, color: '#1f2937' }}>{label}:</strong> {value}
                            </p>
                        )
                    }

                    return (
                        <p key={i} style={{
                            fontSize: 'clamp(9pt, 1.3vw, 10pt)',
                            color: '#374151',
                            lineHeight: 1.55,
                            marginBottom: '0.04in',
                        }}>
                            {cleanLine}
                        </p>
                    )
                })
            }

            // Simple list style
            const allSkills = lines.join(', ').split(/[,;]/).map(s => s.replace(/^[•\-–]\s*/, '').trim()).filter(s => s)
            return (
                <div style={{
                    fontSize: 'clamp(9pt, 1.3vw, 10pt)',
                    color: '#374151',
                    lineHeight: 1.6
                }}>
                    {allSkills.join(' • ')}
                </div>
            )
        }

        case 'certifications':
            return lines.map((line, i) => {
                const cleanLine = line.replace(/^[•\-–]\s*/, '').trim()

                // Check if it's pipe-separated
                if (cleanLine.includes('|')) {
                    const parts = cleanLine.split('|').map(s => s.trim())
                    return (
                        <div key={i} style={{ marginBottom: '0.06in' }}>
                            <span style={{
                                fontSize: 'clamp(9pt, 1.3vw, 10pt)',
                                color: '#374151',
                                fontWeight: 600,
                            }}>
                                {parts[0]}
                            </span>
                            {parts.slice(1).map((part, j) => (
                                <span key={j} style={{ color: '#6b7280', fontSize: 'clamp(8.5pt, 1.2vw, 9.5pt)' }}>
                                    {' '} — {part}
                                </span>
                            ))}
                        </div>
                    )
                }

                return (
                    <p key={i} style={{
                        margin: '0 0 0.04in 0',
                        fontSize: 'clamp(9pt, 1.3vw, 10pt)',
                        color: '#374151',
                        lineHeight: 1.45,
                    }}>
                        • {cleanLine}
                    </p>
                )
            })

        default:
            return lines.map((line, i) => {
                if (line.startsWith('•') || line.startsWith('-')) {
                    return (
                        <p key={i} style={{
                            margin: '0 0 0.04in 0.2in',
                            fontSize: 'clamp(9pt, 1.3vw, 10pt)',
                            color: '#374151',
                            lineHeight: 1.45,
                            textAlign: 'left' as const,
                            textIndent: '-0.15in',
                            paddingLeft: '0.15in',
                        }}>
                            • {line.replace(/^[•\-–]\s*/, '').trim()}
                        </p>
                    )
                }
                return (
                    <p key={i} style={{
                        margin: '0 0 0.08in 0',
                        fontSize: 'clamp(9pt, 1.3vw, 10pt)',
                        color: '#374151',
                        lineHeight: 1.5,
                        textAlign: 'left' as const
                    }}>
                        {line}
                    </p>
                )
            })
    }
}
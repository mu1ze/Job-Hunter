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
                @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@700&family=Inter:wght@400;500;600;700&display=swap');
                
                * { 
                    margin: 0; 
                    padding: 0; 
                    box-sizing: border-box; 
                }
                
                body { 
                    font-family: 'Inter', -apple-system, system-ui, sans-serif; 
                    font-size: 10pt;
                    line-height: 1.4; 
                    color: #000;
                    background: #fff;
                    -webkit-print-color-adjust: exact;
                }
                
                .resume-container {
                    width: 8.5in;
                    min-height: 11in;
                    margin: 0 auto;
                    padding: 0.4in 0.6in;
                    background: #fff;
                }
                
                .resume-header { 
                    text-align: center; 
                    margin-bottom: 0.2in;
                }
                
                .resume-name { 
                    font-family: 'Libre Baskerville', serif;
                    font-size: 24pt; 
                    font-weight: 700; 
                    color: #000;
                    margin-bottom: 0.05in;
                    letter-spacing: -0.5pt;
                    line-height: 1.1;
                }
                
                .resume-contact { 
                    font-size: 9pt; 
                    color: #333;
                    line-height: 1.4;
                    font-weight: 400;
                    display: flex;
                    justify-content: center;
                    flex-wrap: wrap;
                    gap: 8pt;
                }
                
                .resume-contact-item {
                    display: flex;
                    align-items: center;
                }
                
                .resume-section { 
                    margin-bottom: 0.18in; 
                }
                
                .resume-section-title { 
                    font-size: 10.5pt; 
                    font-weight: 700; 
                    color: #000; 
                    text-transform: uppercase; 
                    letter-spacing: 1.5pt;
                    margin-bottom: 0.06in;
                    padding-bottom: 1.5pt;
                    border-bottom: 1pt solid #000;
                    font-family: 'Inter', sans-serif;
                }
                
                .resume-summary { 
                    font-size: 10pt;
                    color: #000;
                    line-height: 1.45;
                    margin-bottom: 0.08in;
                    text-align: justify;
                }
                
                .resume-entry {
                    margin-bottom: 0.12in;
                }
                
                .resume-entry:last-child {
                    margin-bottom: 0;
                }
                
                .resume-entry-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: baseline;
                    margin-bottom: 1.5pt;
                }
                
                .resume-entry-title {
                    font-size: 10.5pt;
                    font-weight: 700;
                    color: #000;
                }
                
                .resume-entry-subtitle {
                    font-size: 10pt;
                    color: #000;
                    font-weight: 600;
                }
                
                .resume-entry-date {
                    font-size: 9.5pt;
                    color: #222;
                    font-weight: 500;
                    white-space: nowrap;
                }
                
                .resume-bullets {
                    margin-top: 1.5pt;
                    padding-left: 14pt;
                    list-style-type: disc;
                }
                
                .resume-bullet {
                    margin-bottom: 2pt;
                    font-size: 9.5pt;
                    color: #111;
                    line-height: 1.4;
                }
                
                .resume-skill-line {
                    font-size: 9.5pt;
                    color: #111;
                    line-height: 1.4;
                    margin-bottom: 3pt;
                    display: flex;
                }
                
                .resume-skill-label {
                    font-weight: 700;
                    color: #000;
                    min-width: 1.2in;
                    flex-shrink: 0;
                }
                
                @media print {
                    @page {
                        size: letter;
                        margin: 0;
                    }
                    body { 
                        width: 8.5in;
                        height: 11in;
                        padding: 0;
                        margin: 0;
                    }
                    .no-print { display: none !important; }
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
        // Aggressively strip markdown artifacts and common symbols the AI hallucinated
        const cleanContent = content
            .replace(/\*\*/g, '')
            .replace(/^#+\s+/gm, '')
            .replace(/\s+\|$/gm, '')
            .replace(/^\|\s+/gm, '')
            .replace(/•/g, '-')
            .trim()

        const lines = cleanContent.split('\n')

        const sections: Array<{
            type: 'header' | 'summary' | 'experience' | 'education' | 'skills' | 'certifications' | 'other'
            title: string
            content: string[]
        }> = []

        let currentSection: typeof sections[0] | null = null
        let headerLines: string[] = []
        let foundFirstSection = false

        const SECTION_HEADERS = [
            'SUMMARY', 'PROFESSIONAL SUMMARY', 'PROFILE', 'OBJECTIVE', 'CAREER OBJECTIVE',
            'EXPERIENCE', 'WORK EXPERIENCE', 'PROFESSIONAL EXPERIENCE', 'EMPLOYMENT HISTORY',
            'EDUCATION', 'ACADEMIC BACKGROUND', 'SKILLS', 'TECHNICAL SKILLS', 'CORE COMPETENCIES',
            'KEY SKILLS', 'CERTIFICATIONS', 'CERTIFICATES', 'PROJECTS', 'AWARDS', 'VOLUNTEER',
            'REFERENCES'
        ]

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim()
            if (!line) continue

            const cleanLineForCheck = line.toUpperCase().replace(/^#+\s+/, '').replace(/:$/, '').trim()
            const isHeader = SECTION_HEADERS.some(h => cleanLineForCheck === h || cleanLineForCheck.startsWith(h))

            if (isHeader) {
                if (currentSection) sections.push(currentSection)
                foundFirstSection = true

                let type: typeof sections[0]['type'] = 'other'
                if (/SUMMARY|PROFILE|OBJECTIVE/.test(cleanLineForCheck)) type = 'summary'
                else if (/EXPERIENCE|WORK|EMPLOYMENT/.test(cleanLineForCheck)) type = 'experience'
                else if (/EDUCATION|ACADEMIC/.test(cleanLineForCheck)) type = 'education'
                else if (/SKILLS|COMPETENCIES/.test(cleanLineForCheck)) type = 'skills'
                else if (/CERTIFICATIONS|CERTIFICATES/.test(cleanLineForCheck)) type = 'certifications'

                currentSection = { type, title: line.replace(/:$/, '').trim(), content: [] }
            } else if (!foundFirstSection) {
                headerLines.push(line)
            } else if (currentSection) {
                currentSection.content.push(line)
            }
        }

        if (currentSection) sections.push(currentSection)

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
                    className="bg-zinc-900 hover:bg-zinc-800 text-white border border-white/10 shadow-lg"
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
                    padding: '0.5in 0.65in',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '10.5pt',
                    lineHeight: 1.4,
                    color: '#111',
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

    const parseHeader = () => {
        if (!headerSection || headerSection.content.length === 0) return { name: '', contactItems: [] as string[] }

        const allContent = headerSection.content.join(' | ')
        const items = allContent.split('|').map(s => s.trim()).filter(s => s)

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
        <div style={{ padding: '0' }}>
            {/* Header Section */}
            {headerSection && headerSection.content.length > 0 && (
                <div style={{
                    textAlign: 'center',
                    marginBottom: '0.25in',
                }}>
                    {name && (
                        <h1 style={{
                            fontFamily: "'Libre Baskerville', serif",
                            fontSize: '26pt',
                            fontWeight: 700,
                            color: '#000',
                            margin: '0 0 0.08in 0',
                            letterSpacing: '-0.5pt',
                            lineHeight: 1.1,
                        }}>
                            {name}
                        </h1>
                    )}

                    {contactItems.length > 0 && (
                        <div style={{
                            fontSize: '9pt',
                            color: '#444',
                            lineHeight: 1.4,
                            display: 'flex',
                            flexWrap: 'wrap',
                            justifyContent: 'center',
                            alignItems: 'center',
                            fontWeight: 400,
                        }}>
                            {contactItems.map((item, i) => (
                                <span key={i} style={{ display: 'inline', whiteSpace: 'nowrap' }}>
                                    {item}
                                    {i < contactItems.length - 1 && (
                                        <span style={{ color: '#999', margin: '0 0.08in' }}>|</span>
                                    )}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Other Sections */}
            {otherSections.map((section, idx) => (
                <div key={idx} style={{ marginBottom: '0.2in' }}>
                    <h2 style={{
                        fontSize: '11pt',
                        fontWeight: 700,
                        color: '#000',
                        textTransform: 'uppercase',
                        letterSpacing: '1.2pt',
                        margin: '0 0 0.08in 0',
                        paddingBottom: '2pt',
                        borderBottom: '1.5pt solid #333',
                        fontFamily: "'Inter', sans-serif",
                        textAlign: 'left',
                    }}>
                        {section.title}
                    </h2>

                    <div style={{
                        color: '#111',
                        fontSize: '10pt',
                        lineHeight: 1.45,
                        textAlign: 'left',
                        fontFamily: "'Inter', sans-serif",
                    }}>
                        {renderSectionContent(section)}
                    </div>
                </div>
            ))}
        </div>
    )
}

function renderSectionContent(section: { type: string; title: string; content: string[] }) {
    const lines = section.content

    switch (section.type) {
        case 'summary':
            return (
                <p style={{
                    fontSize: '10pt',
                    color: '#222',
                    lineHeight: '1.5',
                    textAlign: 'justify' as const,
                    margin: 0,
                    padding: 0,
                }}>
                    {lines.map(l => l.replace(/Summary\s*\|\s*/i, '')).join(' ')}
                </p>
            )

        case 'experience': {
            const entries: Array<{
                title: string
                company: string
                date: string
                location: string
                bullets: string[]
            }> = []

            let i = 0
            while (i < lines.length) {
                const line = lines[i].trim()
                if (!line) { i++; continue }

                const isBullet = line.startsWith('-') || line.startsWith('•') || line.startsWith('–')

                if (!isBullet) {
                    // Start of a new job entry
                    const parts = line.split('|').map(s => s.trim())
                    let title = parts[0]
                    let company = parts[1] || ''
                    let date = parts.find(p => p.match(/\d{4}|Present|Current/i)) || ''
                    let location = parts.length > 3 ? parts[parts.length - 1] : ''

                    // Improved date extraction for headers without pipes
                    if (parts.length === 1) {
                        const dateMatch = line.match(/(.*)(\b\d{4}.*|Present.*|Current.*)/i)
                        if (dateMatch) {
                            title = dateMatch[1].trim().replace(/,$/, '')
                            date = dateMatch[2].trim()
                        }
                    }

                    const entry = { title, company, date, location, bullets: [] as string[] }
                    i++

                    // Consume everything until the next line that looks like a NEW header
                    // A new header is a line that:
                    // 1. Is not a bullet
                    // 2. Is not empty
                    // 3. Usually followed by bullets OR contains a date/pipe
                    while (i < lines.length) {
                        const nextLine = lines[i].trim()
                        if (!nextLine) { i++; continue }

                        const isBulletLine = nextLine.startsWith('-') || nextLine.startsWith('•') || nextLine.startsWith('–')
                        // If it's not a bullet, it might be a new header
                        if (!isBulletLine) {
                            // HEURISTIC: If it has a date, pipe, or the previous line was a bullet, it's a new header
                            const hasHeaderMarkers = nextLine.includes('|') || nextLine.match(/\b\d{4}|Present|Current/i)
                            const prevLineWasBullet = i > 0 && (lines[i - 1].trim().startsWith('-') || lines[i - 1].trim().startsWith('•'))

                            if (hasHeaderMarkers || prevLineWasBullet || nextLine.length < 60) {
                                break // It's a next header
                            }
                        }

                        entry.bullets.push(nextLine.replace(/^[-•–]\s*/, ''))
                        i++
                    }
                    entries.push(entry)
                } else {
                    // Bullet without a header - prepend a generic header or group with previous
                    if (entries.length > 0) {
                        entries[entries.length - 1].bullets.push(line.replace(/^[-•–]\s*/, ''))
                    } else {
                        entries.push({
                            title: 'Professional Highlights',
                            company: '',
                            date: '',
                            location: '',
                            bullets: [line.replace(/^[-•–]\s*/, '')]
                        })
                    }
                    i++
                }
            }

            return entries.map((entry, idx) => (
                <div key={idx} style={{ marginBottom: idx === entries.length - 1 ? 0 : '0.15in', padding: 0 }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                        marginBottom: '2pt',
                        padding: 0,
                    }}>
                        <div style={{ flex: 1, padding: 0 }}>
                            <span style={{ fontWeight: 700, fontSize: '10.5pt', color: '#000' }}>{entry.title}</span>
                            {entry.company && <span style={{ fontWeight: 600, color: '#333' }}> | {entry.company}</span>}
                            {entry.location && <span style={{ fontWeight: 600, color: '#444' }}> — {entry.location}</span>}
                        </div>
                        <div style={{ fontWeight: 600, fontSize: '9.5pt', color: '#444', textAlign: 'right' }}>
                            {entry.date}
                        </div>
                    </div>
                    {entry.bullets.length > 0 && (
                        <ul style={{ margin: '1pt 0 0 0', paddingLeft: '0.15in', listStyleType: 'disc' }}>
                            {entry.bullets.map((bullet, j) => (
                                <li key={j} style={{ marginBottom: '2pt', fontSize: '10pt', color: '#333', lineHeight: '1.4', textAlign: 'left' }}>
                                    {bullet}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            ))
        }

        case 'education': {
            return lines.map((line, i) => {
                const parts = line.split('|').map(s => s.trim())
                if (parts.length >= 2) {
                    return (
                        <div key={i} style={{ marginBottom: '0.1in', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '10.5pt' }}>{parts[0]}</div>
                                {parts[1] && <div style={{ fontWeight: 500, color: '#444' }}>{parts[1]}</div>}
                            </div>
                            <div style={{ fontWeight: 600, fontSize: '9.5pt', color: '#444' }}>{parts[2] || ''}</div>
                        </div>
                    )
                }
                const bulletClean = line.replace(/^[-•–]\s*/, '')
                return <div key={i} style={{ marginBottom: '2pt', paddingLeft: line.startsWith('-') ? '0.15in' : 0 }}>
                    {line.startsWith('-') ? `• ${bulletClean}` : line}
                </div>
            })
        }

        case 'skills': {
            return lines.map((line, i) => {
                const cleanLine = line.replace(/^[-•–]\s*/, '').trim()
                const colonIdx = cleanLine.indexOf(':')

                if (colonIdx > 0) {
                    const label = cleanLine.substring(0, colonIdx)
                    const value = cleanLine.substring(colonIdx + 1).trim()
                    return (
                        <div key={i} style={{ marginBottom: '4pt', display: 'flex', alignItems: 'flex-start', padding: 0 }}>
                            <span style={{ fontWeight: 700, color: '#000', marginRight: '8pt', minWidth: '1.4in', display: 'inline-block' }}>{label}:</span>
                            <span style={{ color: '#222', flex: 1 }}>{value}</span>
                        </div>
                    )
                }
                return <div key={i} style={{ marginBottom: '2pt', padding: 0 }}>{cleanLine}</div>
            })
        }

        default:
            return lines.map((line, i) => (
                <div key={i} style={{ marginBottom: '4px', padding: 0 }}>
                    {line.startsWith('-') || line.startsWith('•') ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <span>•</span>
                            <span>{line.replace(/^[-•]\s*/, '')}</span>
                        </div>
                    ) : line}
                </div>
            ))
    }
}
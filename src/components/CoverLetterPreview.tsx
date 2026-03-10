import { useRef } from 'react'
import { Download } from 'lucide-react'
import { Button } from './ui'
import { showToast } from '../utils/toast'
import type { GeneratedDocument } from '../types'

interface CoverLetterPreviewProps {
    document: GeneratedDocument
    variant?: 'preview' | 'print'
    contactInfo?: {
        full_name?: string
        email?: string
        phone?: string
        location?: string
        linkedin_url?: string
        portfolio_url?: string
    }
}

export default function CoverLetterPreview({ document, variant = 'preview', contactInfo }: CoverLetterPreviewProps) {
    const printRef = useRef<HTMLDivElement>(null)

    const handlePrint = () => {
        const printContent = printRef.current
        if (!printContent) return

        const printWindow = window.open('', '_blank')
        if (!printWindow) {
            showToast.error('Please allow popups to print/download cover letter')
            return
        }

        const styles = `
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@400;500;600&display=swap');
                
                * { 
                    margin: 0; 
                    padding: 0; 
                    box-sizing: border-box; 
                }
                
                body { 
                    font-family: 'Crimson Pro', Georgia, 'Times New Roman', serif;
                    font-size: 11.5pt;
                    line-height: 1.5; 
                    color: #000;
                    background: #fff;
                    -webkit-print-color-adjust: exact;
                }
                
                .cover-letter-container {
                    width: 8.5in;
                    min-height: 11in;
                    margin: 0 auto;
                    padding: 0.5in 0.8in;
                    background: #fff;
                }
                
                .sender-info {
                    margin-bottom: 0.3in;
                    font-family: 'Inter', sans-serif;
                }
                
                .sender-name {
                    font-size: 14pt;
                    font-weight: 600;
                    margin-bottom: 2pt;
                }
                
                .sender-line {
                    font-size: 9pt;
                    color: #333;
                }
                
                .date-line {
                    margin: 0.2in 0;
                    font-size: 11pt;
                }
                
                .recipient-info {
                    margin-bottom: 0.25in;
                    font-size: 11pt;
                }
                
                .salutation {
                    margin-bottom: 0.15in;
                    font-weight: 500;
                }
                
                .letter-body {
                    text-align: justify;
                }
                
                .letter-paragraph {
                    margin-bottom: 0.12in;
                    text-indent: 0;
                }
                
                .closing-block {
                    margin-top: 0.3in;
                }
                
                .signature {
                    font-weight: 600;
                    margin-top: 5pt;
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

        const contactName = contactInfo?.full_name || document.content.split('\n')[0] || 'Your Name'

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Cover Letter - ${contactName}</title>
                    ${styles}
                </head>
                <body>
                    <div class="cover-letter-container">
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

    const parseCoverLetter = () => {
        // Strip markdown bold markers
        const cleanedContent = document.content.replace(/\*\*/g, '')
        const lines = cleanedContent.split('\n')

        // Initialize sections
        const sender: string[] = []
        let date = ''
        const recipient: string[] = []
        let salutation = ''
        const body: string[] = []
        let closing = ''
        let signature = ''

        let currentSection: 'sender' | 'date' | 'recipient' | 'salutation' | 'body' | 'closing' | 'signature' = 'sender'

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim()
            if (!line) {
                // Empty line might indicate section change
                if (currentSection === 'sender' && sender.length > 0) {
                    currentSection = 'date'
                } else if (currentSection === 'date' && date) {
                    currentSection = 'recipient'
                } else if (currentSection === 'recipient' && recipient.length > 0) {
                    currentSection = 'salutation'
                }
                continue
            }

            // Check for salutation
            if (line.match(/^(Dear|Hello|Hi|To|Attention|Hiring Manager)/i)) {
                salutation = line
                currentSection = 'body'
                continue
            }

            // Check for closing
            if (line.match(/^(Sincerely|Best regards|Kind regards|Regards|Thank you|Yours truly|Yours sincerely|Cordially|Respectfully|Warm regards|With best regards)/i)) {
                closing = line
                currentSection = 'signature'
                continue
            }

            // Check for date (various formats)
            if (currentSection === 'sender' || currentSection === 'date') {
                const dateMatch = line.match(/^(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}|(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4})$/i)
                if (dateMatch) {
                    date = line
                    currentSection = 'recipient'
                    continue
                }
            }

            // Add to appropriate section
            switch (currentSection) {
                case 'sender':
                    sender.push(line)
                    break
                case 'date':
                    if (!date) date = line
                    else {
                        date = line
                        currentSection = 'recipient'
                    }
                    break
                case 'recipient':
                    recipient.push(line)
                    break
                case 'body':
                    body.push(line)
                    break
                case 'signature':
                    if (!signature) signature = line
                    else signature += ' ' + line
                    break
            }
        }

        return { sender, date, recipient, salutation, body, closing, signature }
    }

    const letterData = parseCoverLetter()

    if (isPrint) {
        return (
            <div className="hidden">
                <div ref={printRef} className="cover-letter-container">
                    <CoverLetterContent letterData={letterData} contactInfo={contactInfo} />
                </div>
                <Button
                    onClick={handlePrint}
                    className="fixed bottom-6 right-6 bg-purple-600 hover:bg-purple-700 text-white shadow-xl z-50 no-print"
                >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                </Button>
            </div>
        )
    }

    return (
        <div className="w-full max-w-full space-y-4">
            <div className="flex justify-end gap-2">
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
                <div ref={printRef} style={{
                    maxWidth: '8.5in',
                    width: '100%',
                    minHeight: 'auto',
                    padding: 'clamp(1rem, 4vw, 0.75in) clamp(1rem, 5vw, 1in)',
                    fontFamily: "'Crimson Pro', Georgia, 'Times New Roman', serif",
                    fontSize: 'clamp(10pt, 1.5vw, 11.5pt)',
                    lineHeight: 1.6,
                    color: '#1a1a1a',
                    backgroundColor: '#fff',
                    margin: '0 auto',
                }}>
                    <CoverLetterContent letterData={letterData} contactInfo={contactInfo} />
                </div>
            </div>
        </div>
    )
}

// Inline styles for all cover letter elements
const styles = {
    senderInfo: {
        marginBottom: '0.25in',
        textAlign: 'left' as const,
    },
    senderName: {
        fontSize: 'clamp(12pt, 2.5vw, 15pt)',
        fontWeight: 600,
        color: '#1e293b',
        marginBottom: '0.05in',
        letterSpacing: '0.3pt',
    },
    senderLine: {
        fontSize: 'clamp(10pt, 1.4vw, 11pt)',
        color: '#374151',
        lineHeight: 1.4,
        marginBottom: '0.02in',
    },
    date: {
        fontSize: 'clamp(10pt, 1.5vw, 12pt)',
        color: '#1e293b',
        margin: '0.25in 0',
    },
    recipientInfo: {
        marginBottom: '0.25in',
        fontSize: 'clamp(10pt, 1.5vw, 12pt)',
        color: '#1e293b',
        lineHeight: 1.4,
    },
    recipientLine: {
        marginBottom: '0.02in',
    },
    salutation: {
        fontSize: 'clamp(11pt, 1.5vw, 12pt)',
        color: '#1e293b',
        marginBottom: '0.2in',
        fontWeight: 500,
    },
    body: {
        fontSize: 'clamp(11pt, 1.5vw, 12.5pt)',
        lineHeight: 1.6,
        color: '#1e293b',
        textAlign: 'left' as const,
    },
    paragraph: {
        marginBottom: '0.15in',
        textAlign: 'left' as const,
    },
    closingBlock: {
        marginTop: '0.3in',
    },
    closing: {
        fontSize: 'clamp(10.5pt, 1.4vw, 12pt)',
        color: '#1e293b',
        marginBottom: '0.4in',
    },
    signature: {
        fontSize: 'clamp(10.5pt, 1.4vw, 12pt)',
        color: '#1e293b',
        fontWeight: 600,
        marginTop: '0.1in',
    },
}

function CoverLetterContent({
    letterData,
    contactInfo
}: {
    letterData: {
        sender: string[]
        date: string
        recipient: string[]
        salutation: string
        body: string[]
        closing: string
        signature: string
    }
    contactInfo?: CoverLetterPreviewProps['contactInfo']
}) {
    const displayContact = contactInfo || {}
    const hasCustomContact = Object.values(displayContact).some(v => v && v.trim())

    // Build sender info
    let senderLines: string[] = []
    if (hasCustomContact) {
        if (displayContact.full_name) senderLines.push(displayContact.full_name)
        if (displayContact.location) senderLines.push(displayContact.location)
        if (displayContact.phone) senderLines.push(displayContact.phone)
        if (displayContact.email) senderLines.push(displayContact.email)
        if (displayContact.linkedin_url) senderLines.push(displayContact.linkedin_url)
        if (displayContact.portfolio_url) senderLines.push(displayContact.portfolio_url)
    } else {
        senderLines = letterData.sender
    }

    // Group body lines into paragraphs
    const bodyParagraphs: string[] = []
    let currentParagraph = ''

    for (const line of letterData.body) {
        if (line.trim() === '') {
            if (currentParagraph.trim()) {
                bodyParagraphs.push(currentParagraph.trim())
                currentParagraph = ''
            }
        } else {
            if (currentParagraph) currentParagraph += ' '
            currentParagraph += line
        }
    }
    if (currentParagraph.trim()) {
        bodyParagraphs.push(currentParagraph.trim())
    }

    // Check if we actually have content — if not, display the raw content as body text
    const hasStructuredContent = senderLines.length > 0 || letterData.salutation || bodyParagraphs.length > 0

    if (!hasStructuredContent) {
        // Fallback: show the raw content as paragraphs
        const rawLines = letterData.sender.concat(letterData.body)
        if (rawLines.length === 0) {
            // Try to reparse the document content directly
            const directContent = (contactInfo as any)?.__rawContent || ''
            if (directContent) {
                return (
                    <div style={styles.body}>
                        <p style={styles.paragraph}>{directContent}</p>
                    </div>
                )
            }
            return (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                    <p>No content available for this cover letter.</p>
                </div>
            )
        }
    }

    return (
        <>
            {/* Sender Information */}
            {senderLines.length > 0 && (
                <div style={styles.senderInfo}>
                    {senderLines.map((line, i) => {
                        // First line is the name (styled differently)
                        if (i === 0) {
                            return (
                                <div key={i} style={styles.senderName}>
                                    {line.split('|').map((part, j) => (
                                        <span key={j}>
                                            {j > 0 && <span style={{ color: '#9ca3af', margin: '0 0.1in' }}>|</span>}
                                            {part.trim()}
                                        </span>
                                    ))}
                                </div>
                            )
                        }
                        return (
                            <div key={i} style={styles.senderLine}>
                                {line.split('|').map((part, j) => (
                                    <span key={j}>
                                        {j > 0 && <span style={{ color: '#9ca3af', margin: '0 0.1in' }}>|</span>}
                                        {part.trim()}
                                    </span>
                                ))}
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Date */}
            {letterData.date && (
                <div style={styles.date}>{letterData.date}</div>
            )}

            {/* Recipient */}
            {letterData.recipient.length > 0 && (
                <div style={styles.recipientInfo}>
                    {letterData.recipient.map((line, i) => (
                        <div key={i} style={styles.recipientLine}>
                            {line}
                        </div>
                    ))}
                </div>
            )}

            {/* Salutation */}
            {letterData.salutation && (
                <div style={styles.salutation}>{letterData.salutation},</div>
            )}

            {/* Body */}
            {bodyParagraphs.length > 0 && (
                <div style={styles.body}>
                    {bodyParagraphs.map((paragraph, i) => (
                        <p key={i} style={{
                            ...styles.paragraph,
                            textIndent: i > 0 ? '0.3in' : '0',
                        }}>
                            {paragraph}
                        </p>
                    ))}
                </div>
            )}

            {/* Closing */}
            {(letterData.closing || letterData.signature || (hasCustomContact && displayContact.full_name)) && (
                <div style={styles.closingBlock}>
                    {letterData.closing && (
                        <div style={styles.closing}>{letterData.closing},</div>
                    )}
                    {(letterData.signature || (hasCustomContact && displayContact.full_name)) && (
                        <div style={styles.signature}>
                            {letterData.signature || displayContact.full_name}
                        </div>
                    )}
                </div>
            )}
        </>
    )
}

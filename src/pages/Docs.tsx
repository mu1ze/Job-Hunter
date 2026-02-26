import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
    BookOpen,
    UserPlus,
    LayoutDashboard,
    Search,
    Kanban,
    FileText,
    Sparkles,
    Bell,
    BarChart3,
    User,
    ArrowRight,
    Menu,
    X,
    ChevronLeft,
    ChevronRight,
    ArrowUpRight
} from 'lucide-react'

const docFiles: Record<string, { title: string; description: string; icon: React.ElementType }> = {
    'how-it-works': { title: 'How It Works', description: 'Overview of what JobHunter can do for you', icon: BookOpen },
    'account-setup': { title: 'Account Setup', description: 'Create your account and verify email', icon: UserPlus },
    'dashboard': { title: 'Dashboard', description: 'Your home base for job searching', icon: LayoutDashboard },
    'finding-jobs': { title: 'Finding Jobs', description: 'Search, Deep Match, and save opportunities', icon: Search },
    'application-tracker': { title: 'Application Tracker', description: 'Track your pipeline with Kanban boards', icon: Kanban },
    'resume-manager': { title: 'Resume Manager', description: 'Upload and analyze your resume', icon: FileText },
    'document-generator': { title: 'Document Generator', description: 'Create tailored resumes and cover letters', icon: Sparkles },
    'alerts': { title: 'Alerts', description: 'Get notified about new opportunities', icon: Bell },
    'analytics': { title: 'Analytics', description: 'Insights into your job search performance', icon: BarChart3 },
    'profile': { title: 'Profile', description: 'Manage your account settings', icon: User },
    'quick-start': { title: 'Quick Start', description: 'Get started in your first week', icon: ArrowRight },
}

const docContent: Record<string, string> = {
    'how-it-works': `# Welcome to JobHunter

JobHunter is your personal job search assistant. We help you find the right jobs, create tailored applications, and track your progress — all in one place.

## What You Can Do

Here's what JobHunter can help you with:

**Find Better Jobs**
Browse thousands of listings or let our AI find roles that match your skills.

**Create Professional Applications**
Generate tailored resumes and cover letters optimized for each job.

**Track Everything**
See all your opportunities in one place, from "Saved" to "Offer."

**Stay Informed**
Get notified when new jobs match your criteria.

**Measure Your Progress**
See what's working and what to improve.`,
    
    'account-setup': `# Setting Up Your Account

Getting started with JobHunter takes just a few minutes.

## Create Your Account

1. Click **Sign Up** on the homepage.
2. Enter your name, email, and create a password.
3. Click **Create Account**.

## Verify Your Email

1. Check your inbox for a verification email.
2. Enter the 6-digit code on the screen.
3. If you don't see it, check your spam folder or click **Resend Code**.

## Complete Your Profile

After verification, you'll set up your preferences:

- **Location** — Where you want to work.
- **Target Roles** — Job titles you're interested in.
- **Industries** — Sectors you prefer.
- **Work Style** — Remote, hybrid, or onsite.
- **Salary Range** — Your minimum and ideal pay.

These help JobHunter show you relevant opportunities.`,
    
    'dashboard': `# Your Dashboard

The dashboard is your home base. Here's what you'll find:

## Quick Stats

- **Saved Jobs** — Opportunities you've bookmarked.
- **Applied** — Applications you've submitted.
- **Interviews** — Jobs where you're in the interview process.
- **Skills Matched** — How many skills from your resume match job requirements.

## Recent Activity

See your latest:
- New alerts.
- Generated documents.
- Application updates.

## Quick Actions

Jump straight to:
- Search for new jobs.
- Upload or manage your resume.
- Generate a tailored application.

**Tip:** Start here at the beginning of each session to decide what to work on.`,
    
    'finding-jobs': `# Finding Jobs

Discover and evaluate job opportunities that match what you're looking for.

## Basic Search

Use filters to find jobs:

- **Keywords** — Job title, skills, or company.
- **Location** — City, state, or "Remote."
- **Distance** — How far from your location.
- **Salary** — Minimum pay you accept.
- **Sort By** — Relevance, newest, or highest pay.

Click **Search** to see results. Each card shows title, company, location, salary, and posting date.

## AI Deep Match

Our AI finds jobs that match your resume:

1. Upload a resume and set it as **Primary**.
2. Click **AI Deep Match**.
3. See a **Match %** score on each job card.

Higher match scores mean better fit. Use Deep Match for quality leads, regular search for breadth.

## Saving Jobs

- Click the **bookmark icon** to save any job.
- Saved jobs appear in your Application Tracker.
- You can save up to 100 jobs.

## Research Companies

Click **Research Company with AI** on any job to learn about:
- Company culture.
- Recent news.
- Interview process.
- Potential red flags.

## Applying

Click **Apply** to open the job in a new tab. Consider using our Document Generator first to create a tailored application.`,
    
    'application-tracker': `# Application Tracker

Track your entire job search in one visual pipeline.

## Pipeline Stages

Move jobs through these stages:

- **Saved** — Interesting jobs you haven't applied to yet.
- **Applied** — Applications you've submitted.
- **Interviewing** — Jobs with scheduled or completed interviews.
- **Offer** — Jobs where you received an offer.
- **Rejected** — Opportunities that didn't work out.

## Moving Jobs

Drag and drop job cards between columns to update status. Dates are automatically tracked for each stage.

## Stats Overview

At the top, you'll see:
- Total saved jobs.
- Count in each stage.
- Your response rate (interviews + offers ÷ applications).

## Career Development

Track long-term goals:
- Roles you want to grow into.
- Certifications you're pursuing.
- Learning resources.

## Analysis History

When you analyze your resume, insights appear here:
- Readiness score.
- Skill gaps.
- Recommended next steps.`,
    
    'resume-manager': `# Resume Manager

Your resume powers JobHunter's AI features. Here's how to use it.

## Uploading Your Resume

1. Go to Resume Manager.
2. Drag and drop a PDF or DOCX file.
3. We'll extract your skills, experience, and education.

## Managing Resumes

- Upload multiple versions.
- Click **Set as Primary** for the one you want to use.
- Delete old versions you no longer need.

## What You'll See

After upload, you get:

- **AI Summary** — Overview of your background.
- **Skills** — Extracted skills as chips.
- **Experience** — Work history with dates and achievements.
- **Education** — Degrees and certifications.

## Analyze Your Career

Click **Analyze Career Path** to get:
- Roles matching your background.
- Skills gaps to address.
- Readiness score.
- Certification suggestions.`,
    
    'document-generator': `# Document Generator

Create job-specific applications in minutes.

## What You Need

- A **primary resume** uploaded in Resume Manager.
- A **saved job** from Job Search (or paste a job description).

## Creating a Document

1. **Choose Type** — Resume or Cover Letter.
2. **Select Job** — Pick from saved jobs or paste description.
3. **Generate** — AI creates a tailored document.
4. **Review** — Check the ATS score and suggestions.
5. **Export** — Copy, download, or save to the job.

## Understanding ATS Scores

ATS (Applicant Tracking System) scores show how well your document passes employer software:

- **70%+** — Good, likely to pass.
- **80%+** — Great, strong chance of being seen.
- **90%+** — Excellent, highly optimized.

## Improvement Suggestions

If your score could be higher, we'll tell you:
- Keywords missing.
- Certifications to consider.
- Experience gaps.

**Tip:** Always review and lightly edit AI-generated documents before submitting.`,
    
    'alerts': `# Alerts

Let JobHunter find new opportunities for you.

## Setting Up Alerts

1. Go to Alerts Manager.
2. Define what to watch for:
   - Keywords (e.g., "Product Manager").
   - Location.
   - Salary range.
3. Choose notification frequency (daily or weekly).
4. Turn the alert **On**.

We'll email you when new jobs match your criteria.

## Managing Alerts

- **Pause** alerts you're not currently using.
- **Edit** criteria as your search evolves.
- **Delete** alerts you no longer need.

**Tip:** Start with 2-3 focused alerts for your top roles. Too many can be overwhelming.`,
    
    'analytics': `# Analytics

See the bigger picture of your job search.

## What You'll Learn

- **Application Volume** — How many jobs you've applied to over time.
- **Conversion Rates** — How often applications become interviews or offers.
- **Top Performers** — Which roles, locations, or sources lead to success.

## Using This Data

Ask yourself:
- Am I applying to enough jobs?
- Which roles are getting traction?
- Should I adjust my focus?

Check Analytics weekly to refine your strategy.`,
    
    'profile': `# Profile

Keep your information up to date.

## What to Update

- Name and email.
- Location.
- Phone number (optional).
- LinkedIn profile.
- Personal website.

## Why It Matters

This information:
- Pre-fills forms in generated documents.
- Helps us personalize job recommendations.
- Makes applying easier.

Keep it current as your situation changes.`,
    
    'quick-start': `# Quick Start Guide

Here's a suggested path to get the most out of JobHunter.

## Day 1: Create Your Account

1. Sign up and verify your email.
2. Complete your profile setup.

## Day 2: Upload Your Resume

1. Go to Resume Manager.
2. Upload your resume.
3. Set it as **Primary**.

## Day 3-4: Find Jobs

1. Use Job Search to find 10-15 interesting jobs.
2. Save the ones you like.
3. Try **AI Deep Match** for better leads.

## Day 5: Create Applications

1. Use Document Generator for your top 3-5 jobs.
2. Review and edit each one.
3. Start applying.

## Week 2: Set Up Monitoring

1. Create 2-3 focused alerts.
2. Start tracking applications in the tracker.
3. Move jobs through stages as you progress.

## Ongoing

- Check your dashboard weekly.
- Review analytics to adjust strategy.
- Keep your resume and profile updated.

Good luck with your job search!`,
}

const docOrder = Object.keys(docFiles)

export default function Docs() {
    const [searchParams, setSearchParams] = useSearchParams()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    
    const currentPage = searchParams.get('page') || 'how-it-works'
    const currentIndex = docOrder.indexOf(currentPage)
    const currentDoc = docFiles[currentPage]
    const content = docContent[currentPage] || '# Page not found'
    
    const prevPage = currentIndex > 0 ? docOrder[currentIndex - 1] : null
    const nextPage = currentIndex < docOrder.length - 1 ? docOrder[currentIndex + 1] : null

    const navigateTo = (page: string) => {
        setSearchParams({ page })
        setMobileMenuOpen(false)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return (
        <div className="min-h-screen bg-black font-['General_Sans',_sans-serif]">
            {/* Top Navigation Bar */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                                <BookOpen className="w-4 h-4 text-black" />
                            </div>
                            <span className="text-white font-semibold">JobHunter</span>
                            <span className="text-white/30 text-sm ml-2">Docs</span>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <Link to="/dashboard" className="text-white/50 hover:text-white text-sm transition-colors flex items-center gap-1.5">
                                Go to App
                                <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="lg:hidden p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                            >
                                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-16 flex">
                {/* Sidebar Navigation */}
                <aside className={`
                    fixed lg:sticky top-16 left-0 z-40
                    w-72 h-[calc(100vh-4rem)] overflow-y-auto
                    bg-black border-r border-white/5
                    transform transition-transform duration-300 ease-out
                    ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    p-4
                `}>
                    <div className="mb-6">
                        <p className="text-white/30 text-xs font-medium uppercase tracking-wider px-3 mb-3">Guide</p>
                        <nav className="space-y-1">
                            {docOrder.map((slug) => {
                                const doc = docFiles[slug]
                                const Icon = doc.icon
                                const isActive = currentPage === slug
                                
                                return (
                                    <button
                                        key={slug}
                                        onClick={() => navigateTo(slug)}
                                        className={`
                                            w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 text-left
                                            ${isActive 
                                                ? 'bg-white text-black font-medium' 
                                                : 'text-white/50 hover:text-white hover:bg-white/5'
                                            }
                                        `}
                                    >
                                        <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-white/40'}`} />
                                        <span>{doc.title}</span>
                                    </button>
                                )
                            })}
                        </nav>
                    </div>
                    
                    {/* Quick Links */}
                    <div className="pt-4 border-t border-white/5">
                        <p className="text-white/30 text-xs font-medium uppercase tracking-wider px-3 mb-3">Quick Links</p>
                        <div className="space-y-1">
                            <Link to="/jobs" className="flex items-center gap-2 px-3 py-2 text-sm text-white/50 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                                <Search className="w-4 h-4" />
                                Search Jobs
                            </Link>
                            <Link to="/resume" className="flex items-center gap-2 px-3 py-2 text-sm text-white/50 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                                <FileText className="w-4 h-4" />
                                Upload Resume
                            </Link>
                            <Link to="/generate" className="flex items-center gap-2 px-3 py-2 text-sm text-white/50 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                                <Sparkles className="w-4 h-4" />
                                Generate Docs
                            </Link>
                        </div>
                    </div>
                </aside>

                {/* Mobile Overlay */}
                {mobileMenuOpen && (
                    <div 
                        className="fixed inset-0 bg-black/80 z-30 lg:hidden"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                )}

                {/* Main Content */}
                <main className="flex-1 min-w-0 pb-24">
                    <div className="max-w-3xl mx-auto px-6 py-12">
                        {/* Breadcrumb */}
                        <nav className="flex items-center gap-2 text-sm text-white/40 mb-8">
                            <span>Docs</span>
                            <span>/</span>
                            <span className="text-white">{currentDoc?.title}</span>
                        </nav>

                        {/* Content */}
                        <article className="prose prose-invert max-w-none">
                            <div 
                                className="
                                    text-white/70 text-lg leading-relaxed space-y-6
                                    [&>h1]:text-4xl [&>h1]:font-semibold [&>h1]:text-white [&>h1]:mb-8 [&>h1]:tracking-tight
                                    [&>h2]:text-2xl [&>h2]:font-semibold [&>h2]:text-white [&>h2]:mt-12 [&>h2]:mb-6
                                    [&>p]:leading-8 [&>p]:mb-6
                                    [&>ul]:space-y-3 [&>ul]:mb-6 [&>ul]:pl-4
                                    [&>ol]:space-y-3 [&>ol]:mb-6 [&>ol]:pl-4
                                    [&>li]:leading-7
                                    [&>strong]:text-white [&>strong]:font-medium
                                "
                                dangerouslySetInnerHTML={{
                                    __html: content
                                        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
                                        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
                                        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                                        .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
                                        .replace(/^\- (.+)$/gm, '<li>$1</li>')
                                        .split('\n\n').map(p => {
                                            if (p.startsWith('<')) return p;
                                            return `<p>${p}</p>`;
                                        }).join('')
                                }}
                            />
                        </article>

                        {/* Page Navigation */}
                        <nav className="mt-16 pt-8 border-t border-white/10 flex items-center justify-between">
                            {prevPage ? (
                                <button
                                    onClick={() => navigateTo(prevPage)}
                                    className="group flex items-center gap-3 px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all"
                                >
                                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                    <div className="text-left">
                                        <p className="text-xs text-white/40">Previous</p>
                                        <p className="font-medium">{docFiles[prevPage].title}</p>
                                    </div>
                                </button>
                            ) : (
                                <div />
                            )}
                            
                            {nextPage ? (
                                <button
                                    onClick={() => navigateTo(nextPage)}
                                    className="group flex items-center gap-3 px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all"
                                >
                                    <div className="text-right">
                                        <p className="text-xs text-white/40">Next</p>
                                        <p className="font-medium">{docFiles[nextPage].title}</p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            ) : (
                                <div />
                            )}
                        </nav>
                    </div>
                </main>
            </div>
        </div>
    )
}

import { Link, useLocation } from 'react-router-dom'
import {
    Search,
    FileText,
    Sparkles,
    LayoutDashboard,
    Menu,
    X,
    LogOut,
    Kanban,
    BarChart3,
    Bell,
    User,
    Info
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useUserStore } from '../../stores'

const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/jobs', label: 'Jobs', icon: Search },
    { path: '/tracker', label: 'Tracker', icon: Kanban },
    { path: '/analytics', label: 'Stats', icon: BarChart3 },
    { path: '/alerts', label: 'Alerts', icon: Bell },
    { path: '/resume', label: 'Resume', icon: FileText },
    { path: '/generate', label: 'AI', icon: Sparkles },
]

export default function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isExpanded, setIsExpanded] = useState(false)
    const [showInfo, setShowInfo] = useState(false)
    const location = useLocation()
    const { profile, logout } = useUserStore()
    const navRef = useRef<HTMLDivElement>(null)

    const handleLogout = () => {
        logout()
        window.location.href = '/'
    }

    const getInfoMessage = () => {
        const path = location.pathname

        if (path === '/' || path === '/auth') {
            return 'Get started by creating an account or signing in. JobHunter helps you track applications, search smarter, and generate tailored documents.'
        }
        if (path.startsWith('/dashboard')) {
            return 'Your dashboard gives you a quick overview of your pipeline, recent applications, and shortcuts to key tools in JobHunter.'
        }
        if (path.startsWith('/jobs')) {
            return 'Use Jobs to search roles, apply Deep Match, and save positions you care about so they flow into your tracker.'
        }
        if (path.startsWith('/tracker')) {
            return 'The Tracker lets you organize applications by stage, keep notes, and never lose track of where you are in each process.'
        }
        if (path.startsWith('/analytics')) {
            return 'Analytics surfaces trends in your job search so you can see what is working, where you get interviews, and where to adjust.'
        }
        if (path.startsWith('/alerts')) {
            return 'Alerts keep you notified about new roles that match your preferences so you can apply early and stay ahead.'
        }
        if (path.startsWith('/resume')) {
            return 'The Resume area is where you upload, parse, and manage resumes that power Deep Match and tailored document generation.'
        }
        if (path.startsWith('/generate')) {
            return 'AI generates tailored resumes and cover letters using your profile, resumes, and the specific job description you provide.'
        }
        if (path.startsWith('/onboarding')) {
            return 'Onboarding collects your goals, location, and preferences so JobHunter can personalize search, alerts, and recommendations.'
        }
        if (path.startsWith('/profile')) {
            return 'Your profile stores your core details and preferences that power smarter recommendations across the app.'
        }

        return 'Navigate with the tabs to explore JobHunter—search jobs, track applications, analyze your pipeline, and generate tailored documents.'
    }

    // Stable hover: detect if mouse is within a slightly larger hit area or the pill itself
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (window.innerWidth < 1024) return // Disable hover logic on mobile

            if (navRef.current) {
                const rect = navRef.current.getBoundingClientRect()
                // Add a small buffer around the pill for stability
                const buffer = 20
                const isWithin =
                    e.clientX >= rect.left - buffer &&
                    e.clientX <= rect.right + buffer &&
                    e.clientY >= rect.top - buffer &&
                    e.clientY <= rect.bottom + buffer + 20 // Extra bottom buffer

                if (isWithin && !isExpanded) {
                    setIsExpanded(true)
                } else if (!isWithin && isExpanded) {
                    setIsExpanded(false)
                }
            }
        }

        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [isExpanded])

    // Close info panel when route changes or mobile menu toggles
    useEffect(() => {
        setShowInfo(false)
    }, [location.pathname, isMobileMenuOpen])

    return (
        <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
            <nav
                ref={navRef}
                className={`
                    pointer-events-auto
                    relative flex items-center gap-2 p-1.5 rounded-full
                    bg-black/40 backdrop-blur-2xl border border-white/10
                    transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
                    shadow-[0_8px_32px_rgba(0,0,0,0.5)]
                    w-auto max-w-[95vw] px-2
                `}
            >
                {/* Logo Section */}
                <Link
                    to="/dashboard"
                    className="flex items-center gap-2 group p-2 rounded-full hover:bg-white/5 transition-colors shrink-0"
                >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 border border-white/10 group-hover:scale-110 transition-transform duration-300">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <span className={`
                        font-medium text-white tracking-tight overflow-hidden transition-all duration-500
                        ${isExpanded ? 'w-20 opacity-100 ml-1' : 'w-0 opacity-0'}
                    `}>
                        JobHunter
                    </span>
                </Link>

                <div className="h-6 w-px bg-white/10 mx-1" />

                {/* Desktop Nav Items */}
                <div className="hidden lg:flex items-center gap-1">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path
                        const Icon = item.icon
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`
                                    flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-300 group
                                    ${isActive
                                        ? 'bg-white text-black shadow-lg shadow-white/10'
                                        : 'text-white/60 hover:text-white hover:bg-white/5'
                                    }
                                `}
                            >
                                <Icon className={`w-4 h-4 transition-transform duration-300 group-hover:scale-110 ${isActive ? '' : 'text-white/70'}`} />
                                <span className={`
                                    overflow-hidden transition-all duration-500 whitespace-nowrap
                                    ${isActive
                                        ? 'max-w-[100px] opacity-100'
                                        : 'max-w-0 opacity-0 group-hover:max-w-[100px] group-hover:opacity-100'
                                    }
                                `}>
                                    {item.label}
                                </span>
                            </Link>
                        )
                    })}
                </div>

                {/* Mobile Icons (Visible when not expanded) */}
                <div className="flex lg:hidden items-center gap-1">
                    {navItems.slice(0, 3).map((item) => {
                        const isActive = location.pathname === item.path
                        const Icon = item.icon
                        return (
                            <Link key={item.path} to={item.path} className={`p-2 rounded-full ${isActive ? 'bg-white text-black' : 'text-white/60'}`}>
                                <Icon className="w-4 h-4" />
                            </Link>
                        )
                    })}
                </div>

                {/* Divider & User Menu */}
                {profile && (
                    <>
                        <div className="h-6 w-px bg-white/10 mx-1 lg:block hidden" />
                        <div className="flex items-center gap-1">
                            <Link
                                to="/profile"
                                className={`
                                    flex items-center gap-2 p-1.5 rounded-full hover:bg-white/10 transition-all border border-transparent hover:border-white/10 group
                                    ${location.pathname === '/profile' ? 'bg-white/10 pr-4' : ''}
                                `}
                            >
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10 group-hover:bg-white/20 transition-colors">
                                    <User className="w-4 h-4 text-white" />
                                </div>
                                <div className={`
                                    overflow-hidden transition-all duration-500
                                    ${location.pathname === '/profile'
                                        ? 'max-w-[120px] opacity-100 ml-1'
                                        : 'max-w-0 opacity-0 group-hover:max-w-[120px] group-hover:opacity-100'
                                    }
                                `}>
                                    <p className="text-[10px] font-medium text-white/40 uppercase tracking-wider leading-none mb-0.5">Account</p>
                                    <p className="text-xs font-medium text-white truncate">{profile.full_name?.split(' ')[0]}</p>
                                </div>
                            </Link>

                            <button
                                onClick={handleLogout}
                                className={`
                                    p-2 rounded-full text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all duration-500
                                    ${isExpanded ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0 pointer-events-none absolute'}
                                `}
                                title="Logout"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    </>
                )}

                {/* Info & Mobile Menu Toggle */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setShowInfo((prev) => !prev)}
                        className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                        title="What is this page?"
                    >
                        <Info className="w-4 h-4" />
                    </button>

                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="lg:hidden p-2 rounded-full text-white hover:bg-white/10 transition-colors shrink-0"
                    >
                        {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </nav>

            {/* Contextual Info Panel */}
            {showInfo && (
                <div className="fixed top-[88px] inset-x-0 z-40 flex justify-center px-4 pointer-events-none">
                    <div className="max-w-xl w-full pointer-events-auto">
                        <div className="bg-black/95 border border-white/15 rounded-3xl px-5 py-4 shadow-2xl backdrop-blur-2xl text-sm text-white/80 animate-fade-in">
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5">
                                    <Info className="w-4 h-4 text-white/60" />
                                </div>
                                <p className="leading-relaxed">
                                    {getInfoMessage()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Menu Backdrop */}
            {isMobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 top-[88px] z-40 p-4 animate-fade-in pointer-events-auto">
                    <div className="bg-black/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl h-fit max-h-[80vh] overflow-y-auto custom-scrollbar">
                        <div className="grid gap-2">
                            {navItems.map((item) => {
                                const isActive = location.pathname === item.path
                                const Icon = item.icon
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`
                                            flex items-center gap-4 px-4 py-4 rounded-2xl text-base font-medium transition-all duration-200
                                            ${isActive
                                                ? 'bg-white text-black'
                                                : 'text-white/60 hover:text-white hover:bg-white/5'
                                            }
                                        `}
                                    >
                                        <Icon className="w-5 h-5" />
                                        {item.label}
                                    </Link>
                                )
                            })}
                            <div className="pt-4 mt-4 border-t border-white/10">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-base font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                                >
                                    <LogOut className="w-5 h-5" />
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

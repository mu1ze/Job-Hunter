import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
    Search,
    LayoutDashboard,
    Kanban,
    BarChart3,
    Sparkles,
    FileText,
    Bell,
    User,
    MoreHorizontal,
    X,
    LogOut
} from 'lucide-react'
import { useUserStore } from '../../stores'

const mainNavItems = [
    { path: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { path: '/jobs', label: 'Jobs', icon: Search },
    { path: '/tracker', label: 'Track', icon: Kanban },
    { path: '/analytics', label: 'Stats', icon: BarChart3 },
    { path: '/generate', label: 'AI', icon: Sparkles },
]

const moreNavItems = [
    { path: '/resume', label: 'Resume', icon: FileText },
    { path: '/alerts', label: 'Alerts', icon: Bell },
    { path: '/profile', label: 'Profile', icon: User },
]

export default function BottomNav() {
    const location = useLocation()
    const [showMoreMenu, setShowMoreMenu] = useState(false)
    const { logout } = useUserStore()
    
    const isActive = (path: string) => {
        if (path === '/dashboard' && location.pathname === '/dashboard') return true
        if (path === '/jobs' && location.pathname.startsWith('/jobs')) return true
        if (path === '/tracker' && location.pathname.startsWith('/tracker')) return true
        if (path === '/analytics' && location.pathname.startsWith('/analytics')) return true
        if (path === '/generate' && location.pathname.startsWith('/generate')) return true
        return location.pathname === path
    }

    const handleLogout = () => {
        logout()
        window.location.href = '/'
    }

    return (
        <>
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-2xl border-t border-white/10 safe-area-pb">
                <div className="flex items-center justify-between px-1 py-1.5">
                    <div className="flex items-center">
                        {mainNavItems.map((item) => {
                            const active = isActive(item.path)
                            const Icon = item.icon
                            
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`
                                        flex flex-col items-center justify-center gap-0 py-1.5 px-2 rounded-xl transition-all duration-200 min-w-[56px] max-w-[64px]
                                        ${active
                                            ? 'text-white'
                                            : 'text-white/40 hover:text-white/70'
                                        }
                                    `}
                                >
                                    <div className={`
                                        p-1 rounded-lg transition-all duration-200
                                        ${active
                                            ? 'bg-white/10'
                                            : ''
                                        }
                                    `}>
                                        <Icon className={`w-4 h-4 ${active ? '' : 'text-inherit'}`} />
                                    </div>
                                    <span className={`text-[9px] font-medium truncate w-full text-center ${active ? 'text-white' : 'text-inherit'}`}>
                                        {item.label}
                                    </span>
                                </Link>
                            )
                        })}
                    </div>

                    {/* More Menu Button */}
                    <div className="relative pr-1">
                        <button
                            onClick={() => setShowMoreMenu(!showMoreMenu)}
                            className={`
                                flex flex-col items-center justify-center gap-0 py-1.5 px-2 rounded-xl transition-all duration-200 min-w-[48px]
                                ${showMoreMenu
                                    ? 'text-white'
                                    : 'text-white/40 hover:text-white/70'
                                }
                            `}
                        >
                            <div className={`p-1 rounded-lg ${showMoreMenu ? 'bg-white/10' : ''}`}>
                                {showMoreMenu ? <X className="w-4 h-4" /> : <MoreHorizontal className="w-4 h-4" />}
                            </div>
                            <span className="text-[9px] font-medium">More</span>
                        </button>

                        {/* Dropdown Menu */}
                        {showMoreMenu && (
                            <div className="absolute bottom-full right-0 mb-2 w-48 bg-black/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 shadow-xl">
                                {/* AI Generate */}
                                <Link
                                    to="/generate"
                                    onClick={() => setShowMoreMenu(false)}
                                    className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${
                                        location.pathname === '/generate' 
                                            ? 'bg-white/10 text-white' 
                                            : 'text-white/60 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    <Sparkles className="w-5 h-5" />
                                    <span className="text-sm font-medium">AI Generate</span>
                                </Link>

                                <div className="h-px bg-white/10 my-1" />

                                {/* Other Pages */}
                                {moreNavItems.map((item) => {
                                    const active = location.pathname === item.path
                                    const Icon = item.icon
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            onClick={() => setShowMoreMenu(false)}
                                            className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${
                                                active 
                                                    ? 'bg-white/10 text-white' 
                                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                                            }`}
                                        >
                                            <Icon className="w-5 h-5" />
                                            <span className="text-sm font-medium">{item.label}</span>
                                        </Link>
                                    )
                                })}

                                <div className="h-px bg-white/10 my-1" />

                                {/* Logout */}
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
                                >
                                    <LogOut className="w-5 h-5" />
                                    <span className="text-sm font-medium">Logout</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* Click outside to close */}
            {showMoreMenu && (
                <div 
                    className="lg:hidden fixed inset-0 z-40" 
                    onClick={() => setShowMoreMenu(false)}
                />
            )}
        </>
    )
}

export function FloatingActionButton() {
    // Disabled - all main actions now in bottom nav
    return null
}

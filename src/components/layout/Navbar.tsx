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
    User
} from 'lucide-react'
import { useState } from 'react'
import { useUserStore } from '../../stores'

const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/jobs', label: 'Job Search', icon: Search },
    { path: '/tracker', label: 'Tracker', icon: Kanban },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/alerts', label: 'Alerts', icon: Bell },
    { path: '/resume', label: 'Resume', icon: FileText },
    { path: '/generate', label: 'AI Generator', icon: Sparkles },
]

export default function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const location = useLocation()
    const { profile, logout } = useUserStore()

    const handleLogout = () => {
        logout()
        window.location.href = '/'
    }

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-white/10 bg-black/50 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link to="/dashboard" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/10 group-hover:bg-white/20 transition-colors">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-medium text-lg text-white tracking-wide hidden sm:block">
                            JobHunter
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden lg:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/10 backdrop-blur-md">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path
                            const Icon = item.icon
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`
                    flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
                    ${isActive
                                            ? 'bg-white text-black shadow-lg shadow-white/10'
                                            : 'text-white/60 hover:text-white hover:bg-white/10'
                                        }
                  `}
                                >
                                    <Icon className="w-4 h-4" />
                                    {item.label}
                                </Link>
                            )
                        })}
                    </div>

                    {/* User Menu */}
                    <div className="flex items-center gap-4">
                        {profile && (
                            <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-white/10">
                                <Link
                                    to="/profile"
                                    className="flex items-center gap-3 px-3 py-1.5 rounded-full hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
                                >
                                    <div className="text-right hidden md:block">
                                        <p className="text-xs font-medium text-white/50 uppercase tracking-wider leading-none mb-1">
                                            Account
                                        </p>
                                        <p className="text-sm font-medium text-white">
                                            {profile.full_name?.split(' ')[0] || 'User'}
                                        </p>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                                        <User className="w-4 h-4 text-white" />
                                    </div>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors border border-transparent hover:border-white/10 ml-1"
                                    title="Logout"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="lg:hidden bg-black/95 backdrop-blur-xl border-t border-white/10 min-h-screen fixed inset-0 top-20 z-40 p-4">
                    <div className="space-y-2">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path
                            const Icon = item.icon
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`
                    flex items-center gap-3 px-4 py-4 rounded-xl text-base font-medium transition-all duration-200
                    ${isActive
                                            ? 'bg-white text-black'
                                            : 'text-white/60 hover:text-white hover:bg-white/10'
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
                                className="w-full flex items-center gap-3 px-4 py-4 rounded-xl text-base font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                                <LogOut className="w-5 h-5" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    )
}

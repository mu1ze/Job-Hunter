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
    Bell
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
        <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-surface-700/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/dashboard" className="flex items-center gap-2 group">
                        <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:shadow-primary-500/40 transition-shadow">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-display font-bold text-xl text-white hidden sm:block">
                            Job<span className="gradient-text">Hunter</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path
                            const Icon = item.icon
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive
                                            ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                                            : 'text-surface-400 hover:text-surface-100 hover:bg-surface-800/50'
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
                    <div className="flex items-center gap-3">
                        {profile && (
                            <div className="hidden sm:flex items-center gap-3">
                                <div className="text-right">
                                    <p className="text-sm font-medium text-surface-200">
                                        {profile.full_name || 'User'}
                                    </p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 rounded-lg text-surface-400 hover:text-surface-100 hover:bg-surface-800/50 transition-colors"
                                    title="Logout"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg text-surface-400 hover:text-surface-100 hover:bg-surface-800/50 transition-colors"
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden glass border-t border-surface-700/50">
                    <div className="px-4 py-3 space-y-1">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path
                            const Icon = item.icon
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                    ${isActive
                                            ? 'bg-primary-500/20 text-primary-400'
                                            : 'text-surface-400 hover:text-surface-100 hover:bg-surface-800/50'
                                        }
                  `}
                                >
                                    <Icon className="w-5 h-5" />
                                    {item.label}
                                </Link>
                            )
                        })}
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </nav>
    )
}

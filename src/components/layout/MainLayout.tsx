import { Outlet, Link } from 'react-router-dom'
import Navbar from './Navbar'

export default function MainLayout() {
    return (
        <div className="min-h-screen bg-black text-white font-['General_Sans',_sans-serif]">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-white/5 via-transparent to-transparent rounded-full blur-3xl animate-pulse-slow" />
                <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-white/5 via-transparent to-transparent rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
            </div>

            <Navbar />

            <div className="relative z-10 flex flex-col min-h-screen pt-24">
                <main className="flex-1 pb-12 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>

                <footer className="border-t border-white/10 px-4 sm:px-6 lg:px-8 py-4 text-xs text-white/40">
                    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
                        <span>© {new Date().getFullYear()} JobHunter. All rights reserved.</span>
                        <div className="flex items-center gap-4">
                            <Link
                                to="/docs"
                                className="hover:text-white transition-colors underline underline-offset-4 decoration-white/30 hover:decoration-white"
                            >
                                Product walkthrough & docs
                            </Link>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    )
}

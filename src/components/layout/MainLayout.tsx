import { Outlet } from 'react-router-dom'
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

            <main className="relative z-10 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}

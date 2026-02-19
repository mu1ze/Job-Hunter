import { Link } from 'react-router-dom'
import {
    Search,
    FileText,
    Sparkles,
    Target,
    TrendingUp,
    Shield,
    ArrowRight,
    CheckCircle,
    Zap,
    Users,
    ChevronDown
} from 'lucide-react'

const features = [
    {
        icon: Search,
        title: 'Smart Job Discovery',
        description: 'Aggregate jobs from multiple boards with AI-powered matching to find your perfect role.',
        gradient: 'from-blue-500 to-cyan-500',
    },
    {
        icon: FileText,
        title: 'Resume Parsing',
        description: 'Upload your resume and we extract skills, experience, and achievements automatically.',
        gradient: 'from-purple-500 to-pink-500',
    },
    {
        icon: Sparkles,
        title: 'AI Tailoring',
        description: 'Generate custom resumes and cover letters optimized for each job application.',
        gradient: 'from-orange-500 to-red-500',
    },
    {
        icon: Target,
        title: 'ATS Optimization',
        description: 'Score your resume against job requirements and ensure you pass ATS screening.',
        gradient: 'from-green-500 to-emerald-500',
    },
]

const stats = [
    { value: '85%', label: 'Higher Response Rate' },
    { value: '3x', label: 'Faster Applications' },
    { value: '10K+', label: 'Jobs Indexed Daily' },
    { value: '95%', label: 'ATS Pass Rate' },
]

const benefits = [
    'Semantic keyword matching for modern ATS systems',
    'Impact-focused bullet points with quantifiable achievements',
    'Industry-specific formatting and language',
    'Skills-based organization aligned with job requirements',
    'Professional summary tailored to each role',
    'Cover letters that tell your story',
]

export default function Landing() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-white/20 overflow-x-hidden font-['General_Sans',_sans-serif]">
            {/* Background Video & Overlay */}
            <div className="fixed inset-0 z-0">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                    poster="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop"
                >
                    <source src="https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-blue-particles-4788-large.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-black/50" /> {/* 50% black overlay as requested */}
            </div>

            {/* Navbar */}
            <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-6 py-6 md:px-[120px] md:py-[20px]">
                    <div className="flex items-center justify-between">
                        {/* Left: Logo */}
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/10">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-medium text-lg text-white tracking-wide">
                                JobHunter
                            </span>
                        </div>

                        {/* Center: Nav Links (Desktop) */}
                        <nav className="hidden md:flex items-center gap-8">
                            {['Features', 'Benefits', 'Stats', 'Resources'].map((item) => (
                                <a
                                    key={item}
                                    href={`#${item.toLowerCase()}`}
                                    className="text-white text-sm font-medium hover:text-white/80 transition-colors flex items-center gap-[14px] group"
                                >
                                    {item}
                                    <ChevronDown className="w-3 h-3 text-white/50 group-hover:text-white transition-colors" />
                                </a>
                            ))}
                        </nav>

                        {/* Right: CTA */}
                        <div className="flex items-center gap-6">
                            <Link to="/auth" className="hidden md:block text-sm font-medium text-white hover:text-white/80 transition-colors">
                                Sign In
                            </Link>
                            <Link to="/auth" className="relative group">
                                <div className="absolute inset-0 bg-white/20 blur opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full" />
                                <div className="relative px-7 py-[11px] bg-black border border-white/30 rounded-full flex items-center gap-2 overflow-hidden hover:border-white/60 transition-colors">
                                    <div className="hero-glow-streak" />
                                    <span className="text-sm font-medium text-white relative z-10">Get Started</span>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <main className="relative z-10">
                {/* Hero Section */}
                <section className="pt-[200px] pb-[102px] px-4 text-center md:pt-[280px]">
                    <div className="max-w-4xl mx-auto flex flex-col items-center">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm mb-10 animate-fade-in hover:bg-white/20 transition-colors cursor-default">
                            <div className="w-1 h-1 rounded-full bg-white" />
                            <span className="text-[13px] font-medium text-white/60">
                                Powered by AI <span className="text-white mx-1">•</span> ATS Optimized
                            </span>
                        </div>

                        {/* Heading */}
                        <h1 className="font-medium text-4xl md:text-[56px] leading-[1.28] text-white mb-10 tracking-tight max-w-[613px] mx-auto animate-slide-up">
                            Land Your Dream Job with{' '}
                            <span className="gradient-text-hero">
                                AI-Powered Resumes
                            </span>
                        </h1>

                        {/* Subtitle */}
                        <p className="text-[15px] text-white/70 max-w-[680px] mx-auto mb-10 leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
                            Search thousands of jobs, upload your resume, and let AI craft the perfect
                            tailored application that passes ATS systems and impresses recruiters.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                            <Link to="/auth" className="relative group">
                                <div className="absolute inset-0 bg-white/40 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full" />
                                <button className="relative px-8 py-3 bg-white text-black rounded-full text-sm font-medium border border-white/60 hover:bg-white/90 transition-all flex items-center gap-2">
                                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-50" />
                                    Start Free
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </Link>

                            <Link to="/auth">
                                <button className="px-8 py-3 text-white text-sm font-medium hover:text-white/80 transition-colors">
                                    See How It Works
                                </button>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section id="stats" className="py-20 px-4 border-y border-white/10 bg-black/40 backdrop-blur-sm">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                            {stats.map((stat, index) => (
                                <div
                                    key={stat.label}
                                    className="text-center"
                                >
                                    <div className="font-medium text-4xl md:text-5xl text-white mb-2 tracking-tight">
                                        {stat.value}
                                    </div>
                                    <div className="text-white/50 text-sm uppercase tracking-wider">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-32 px-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-20">
                            <h2 className="text-3xl md:text-4xl font-medium text-white mb-6">
                                Everything You Need
                            </h2>
                            <p className="text-white/60 text-lg max-w-2xl mx-auto">
                                From job discovery to application submission, we've got you covered with cutting-edge AI tools.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {features.map((feature, index) => (
                                <div
                                    key={feature.title}
                                    className="glass p-8 rounded-3xl hover:bg-white/5 transition-all duration-300 group border border-white/10"
                                >
                                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform opacity-80`}>
                                        <feature.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-lg font-medium text-white mb-3">
                                        {feature.title}
                                    </h3>
                                    <p className="text-white/50 text-sm leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Benefits Section */}
                <section id="benefits" className="py-32 px-4 bg-white/5 border-t border-white/5">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid lg:grid-cols-2 gap-20 items-center">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 bg-white/5 mb-8">
                                    <Shield className="w-4 h-4 text-white" />
                                    <span className="text-sm text-white/80">ATS Ready for 2026</span>
                                </div>

                                <h2 className="text-3xl md:text-4xl font-medium text-white mb-8 leading-tight">
                                    Built for Modern Hiring Systems
                                </h2>

                                <p className="text-white/60 text-lg mb-10 leading-relaxed">
                                    Our AI understands how modern ATS systems work with semantic parsing,
                                    NLP-based matching, and skills-based filtering. Your resume will always
                                    make it to human eyes.
                                </p>

                                <ul className="space-y-6">
                                    {benefits.map((benefit, index) => (
                                        <li
                                            key={benefit}
                                            className="flex items-start gap-4"
                                        >
                                            <div className="mt-1 w-5 h-5 rounded-full border border-white/30 flex items-center justify-center flex-shrink-0">
                                                <CheckCircle className="w-3 h-3 text-white" />
                                            </div>
                                            <span className="text-white/70">{benefit}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="relative">
                                <div className="glass p-10 rounded-[40px] border border-white/10 relative z-10 bg-black/40 backdrop-blur-xl">
                                    <div className="flex items-center gap-6 mb-10">
                                        <div className="w-20 h-20 rounded-3xl bg-white/10 flex items-center justify-center border border-white/10">
                                            <TrendingUp className="w-8 h-8 text-white" />
                                        </div>
                                        <div>
                                            <div className="text-4xl font-medium text-white mb-1">92%</div>
                                            <div className="text-white/50 text-sm">ATS Compatibility Score</div>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        {[
                                            { label: 'Keywords Matched', score: '18/20', width: '90%', color: 'bg-white' },
                                            { label: 'Skills Match', score: '15/16', width: '94%', color: 'bg-white/80' },
                                            { label: 'Format Score', score: '100%', width: '100%', color: 'bg-white/60' }
                                        ].map((item, i) => (
                                            <div key={i}>
                                                <div className="flex justify-between text-sm mb-3">
                                                    <span className="text-white/60">{item.label}</span>
                                                    <span className="text-white font-medium">{item.score}</span>
                                                </div>
                                                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                                    <div className={`h-full ${item.color} rounded-full`} style={{ width: item.width }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Glow Effects */}
                                <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary-500/20 rounded-full blur-[100px]" />
                                <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-accent-500/20 rounded-full blur-[100px]" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer CTA */}
                <section className="py-32 px-4 text-center">
                    <div className="max-w-3xl mx-auto">
                        <Users className="w-12 h-12 text-white/50 mx-auto mb-8" />
                        <h2 className="text-3xl md:text-5xl font-medium text-white mb-6 animate-slide-up">
                            Ready to Land Your Dream Job?
                        </h2>
                        <p className="text-white/60 text-lg mb-10 leading-relaxed max-w-xl mx-auto">
                            Join thousands of job seekers who've transformed their applications
                            with AI-powered optimization.
                        </p>
                        <Link to="/auth" className="inline-block relative group">
                            <div className="absolute inset-0 bg-white/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full" />
                            <button className="relative px-10 py-4 bg-white text-black rounded-full text-base font-medium hover:scale-105 transition-all duration-300">
                                Get Started Free
                            </button>
                        </Link>
                    </div>
                </section>

                {/* Footer */}
                <footer className="py-12 px-6 border-t border-white/5">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-white/50" />
                            <span className="font-medium text-white/80">JobHunter</span>
                        </div>
                        <p className="text-white/30 text-sm">
                            © 2026 JobHunter. All rights reserved.
                        </p>
                    </div>
                </footer>
            </main>
        </div>
    )
}

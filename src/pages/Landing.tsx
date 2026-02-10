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
    Users
} from 'lucide-react'
import { Button } from '../components/ui'

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
        <div className="min-h-screen bg-surface-950 overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-pulse-slow" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-primary-500/5 to-transparent rounded-full blur-3xl" />
            </div>

            {/* Header */}
            <header className="relative z-10 glass border-b border-surface-700/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-primary-500/20">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-display font-bold text-xl text-white">
                                Job<span className="gradient-text">Hunter</span>
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link to="/auth">
                                <Button variant="ghost">Sign In</Button>
                            </Link>
                            <Link to="/auth">
                                <Button>Get Started</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative z-10 pt-20 pb-32 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary-500/30 mb-8 animate-fade-in">
                        <Zap className="w-4 h-4 text-primary-400" />
                        <span className="text-sm text-primary-300">Powered by AI • ATS Optimized • 2026 Ready</span>
                    </div>

                    <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 animate-slide-up">
                        Land Your Dream Job with
                        <br />
                        <span className="gradient-text text-glow">AI-Powered Resumes</span>
                    </h1>

                    <p className="text-xl text-surface-400 max-w-3xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        Search thousands of jobs, upload your resume, and let AI craft the perfect
                        tailored application that passes ATS systems and impresses recruiters.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <Link to="/auth">
                            <Button size="lg" className="group">
                                Start Free
                                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                        <Link to="/auth">
                            <Button variant="outline" size="lg">
                                See How It Works
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 border-y border-surface-800">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div
                                key={stat.label}
                                className="text-center animate-slide-up"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="font-display text-4xl md:text-5xl font-bold gradient-text mb-2">
                                    {stat.value}
                                </div>
                                <div className="text-surface-400 text-sm">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
                            Everything You Need to Land Interviews
                        </h2>
                        <p className="text-surface-400 text-lg max-w-2xl mx-auto">
                            From job discovery to application submission, we've got you covered with cutting-edge AI tools.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => (
                            <div
                                key={feature.title}
                                className="glass rounded-2xl p-6 hover:bg-surface-800/80 hover:border-primary-500/30 transition-all duration-300 group animate-slide-up"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                                    <feature.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="font-display text-lg font-semibold text-white mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-surface-400 text-sm leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 bg-surface-900/50">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-500/20 border border-accent-500/30 mb-6">
                                <Shield className="w-4 h-4 text-accent-400" />
                                <span className="text-sm text-accent-300">ATS Ready for 2026</span>
                            </div>

                            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-6">
                                Built for Modern Hiring Systems
                            </h2>

                            <p className="text-surface-400 text-lg mb-8">
                                Our AI understands how modern ATS systems work with semantic parsing,
                                NLP-based matching, and skills-based filtering. Your resume will always
                                make it to human eyes.
                            </p>

                            <ul className="space-y-4">
                                {benefits.map((benefit, index) => (
                                    <li
                                        key={benefit}
                                        className="flex items-start gap-3 animate-slide-up"
                                        style={{ animationDelay: `${index * 0.1}s` }}
                                    >
                                        <CheckCircle className="w-5 h-5 text-accent-400 flex-shrink-0 mt-0.5" />
                                        <span className="text-surface-300">{benefit}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="relative">
                            <div className="glass rounded-2xl p-8 border-primary-500/20">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center shadow-glow">
                                        <TrendingUp className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold text-white">92%</div>
                                        <div className="text-surface-400">ATS Compatibility Score</div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-surface-300">Keywords Matched</span>
                                            <span className="text-accent-400">18/20</span>
                                        </div>
                                        <div className="h-2 bg-surface-700 rounded-full overflow-hidden">
                                            <div className="h-full w-[90%] bg-gradient-to-r from-accent-500 to-accent-400 rounded-full" />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-surface-300">Skills Match</span>
                                            <span className="text-primary-400">15/16</span>
                                        </div>
                                        <div className="h-2 bg-surface-700 rounded-full overflow-hidden">
                                            <div className="h-full w-[94%] bg-gradient-to-r from-primary-500 to-primary-400 rounded-full" />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-surface-300">Format Score</span>
                                            <span className="text-green-400">100%</span>
                                        </div>
                                        <div className="h-2 bg-surface-700 rounded-full overflow-hidden">
                                            <div className="h-full w-full bg-gradient-to-r from-green-500 to-green-400 rounded-full" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Decorative elements */}
                            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary-500/20 rounded-full blur-2xl" />
                            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-accent-500/20 rounded-full blur-2xl" />
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="glass rounded-3xl p-12 border-primary-500/20 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-accent-500/10" />

                        <div className="relative">
                            <Users className="w-12 h-12 text-primary-400 mx-auto mb-6" />
                            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
                                Ready to Land Your Dream Job?
                            </h2>
                            <p className="text-surface-400 text-lg mb-8 max-w-2xl mx-auto">
                                Join thousands of job seekers who've transformed their applications
                                with AI-powered optimization. Start for free today.
                            </p>
                            <Link to="/auth">
                                <Button size="lg" className="group">
                                    Get Started Free
                                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 border-t border-surface-800 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-display font-semibold text-white">JobHunter</span>
                    </div>
                    <p className="text-surface-500 text-sm">
                        © 2026 JobHunter. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    )
}

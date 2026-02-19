import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { Button, Input } from '../components/ui'
import { useUserStore } from '../stores'
import { supabase } from '../lib/supabase'

type AuthMode = 'signin' | 'signup'

export default function Auth() {
    const [mode, setMode] = useState<AuthMode>('signup')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    })
    const navigate = useNavigate()
    const { setProfile, setAuthenticated } = useUserStore()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            if (mode === 'signup') {
                const { data: authData, error } = await supabase.auth.signUp({
                    email: formData.email,
                    password: formData.password,
                    options: {
                        data: {
                            full_name: formData.name,
                        },
                    },
                })

                if (error) throw error

                if (authData.user) {
                    // Profile creation is now handled by a database trigger
                    // We just need to update the local state to allow access

                    // Small delay to ensure trigger has fired (optional but safe)
                    await new Promise(resolve => setTimeout(resolve, 1000))

                    setProfile({
                        id: authData.user.id,
                        full_name: formData.name,
                        email: formData.email,
                        phone: null,
                        location: null,
                        linkedin_url: null,
                        portfolio_url: null,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    })
                    setAuthenticated(true)
                    navigate('/onboarding')
                }
            } else {
                const { data: authData, error } = await supabase.auth.signInWithPassword({
                    email: formData.email,
                    password: formData.password,
                })

                if (error) throw error

                if (authData.user) {
                    // Fetch existing profile
                    const { data: profileData } = await supabase
                        .from('user_profiles')
                        .select('*')
                        .eq('id', authData.user.id)
                        .maybeSingle()

                    if (profileData) {
                        setProfile(profileData)
                    } else {
                        // Fallback if profile doesn't exist for some reason
                        setProfile({
                            id: authData.user.id,
                            full_name: authData.user.user_metadata.full_name || '',
                            email: formData.email,
                            phone: null,
                            location: null,
                            linkedin_url: null,
                            portfolio_url: null,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                        })
                    }

                    setAuthenticated(true)
                    navigate('/dashboard')
                }
            }
        } catch (error: any) {
            alert(error.message || 'An error occurred during authentication')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 font-['General_Sans',_sans-serif]">
            {/* Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse-slow" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center shadow-lg shadow-white/5">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <h1 className="font-medium text-3xl text-white mb-2 tracking-tight">
                        {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
                    </h1>
                    <p className="text-white/60">
                        {mode === 'signin'
                            ? 'Sign in to continue your job search'
                            : 'Start your journey to landing your dream job'
                        }
                    </p>
                </div>

                {/* Auth Card */}
                <div className="glass rounded-3xl p-8 border border-white/10 bg-black/40 backdrop-blur-xl">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {mode === 'signup' && (
                            <Input
                                label="Full Name"
                                placeholder="John Doe"
                                icon={<User className="w-5 h-5" />}
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        )}

                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="you@example.com"
                            icon={<Mail className="w-5 h-5" />}
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />

                        <div className="relative">
                            <Input
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                icon={<Lock className="w-5 h-5" />}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-[42px] text-white/40 hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>

                        {mode === 'signin' && (
                            <div className="text-right">
                                <button type="button" className="text-sm text-white/60 hover:text-white transition-colors">
                                    Forgot password?
                                </button>
                            </div>
                        )}

                        <Button type="submit" size="lg" className="w-full group rounded-full" isLoading={isLoading}>
                            {mode === 'signin' ? 'Sign In' : 'Create Account'}
                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-8">
                        <div className="flex-1 h-px bg-white/10" />
                        <span className="text-white/40 text-sm">or continue with</span>
                        <div className="flex-1 h-px bg-white/10" />
                    </div>

                    {/* Social Login */}
                    <div className="grid grid-cols-2 gap-3">
                        <Button variant="secondary" className="w-full text-white/80 hover:text-white">
                            <svg className="w-5 h-5 mr-2 opacity-80" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="currentColor" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor" />
                            </svg>
                            Google
                        </Button>
                        <Button variant="secondary" className="w-full text-white/80 hover:text-white">
                            <svg className="w-5 h-5 mr-2 opacity-80" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                            </svg>
                            LinkedIn
                        </Button>
                    </div>
                </div>

                {/* Toggle Mode */}
                <p className="text-center text-white/40 mt-8">
                    {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                    <button
                        type="button"
                        onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                        className="text-white hover:text-white/80 font-medium transition-colors border-b border-white/20 hover:border-white"
                    >
                        {mode === 'signin' ? 'Sign Up' : 'Sign In'}
                    </button>
                </p>
            </div>
        </div>
    )
}

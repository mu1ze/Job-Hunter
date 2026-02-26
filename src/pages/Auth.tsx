import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { Button, Input } from '../components/ui'
import { useUserStore } from '../stores'
import { supabase } from '../lib/supabase'
import { showToast, toastMessages } from '../utils/toast'

type AuthMode = 'signin' | 'signup'

export default function Auth() {
    const [mode, setMode] = useState<AuthMode>('signup')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isVerifyingEmail, setIsVerifyingEmail] = useState(false)
    const [verificationCode, setVerificationCode] = useState('')
    const [pendingEmail, setPendingEmail] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    })
    const navigate = useNavigate()
    const { setProfile, setAuthenticated } = useUserStore()

    const handleResendCode = async () => {
        if (!pendingEmail) {
            showToast.error('We could not find the email to resend the code. Please start signup again.')
            return
        }

        try {
            setIsLoading(true)
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: pendingEmail,
            })
            if (error) throw error
            showToast.success('We\'ve sent a new verification code to your email.')
        } catch (error: any) {
            showToast.error(error.message || 'Failed to resend verification code')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            if (isVerifyingEmail) {
                if (!pendingEmail) {
                    throw new Error('No email found for verification. Please sign up again.')
                }

                const { data, error } = await supabase.auth.verifyOtp({
                    email: pendingEmail,
                    token: verificationCode,
                    type: 'signup',
                })

                if (error) throw error

                if (data.user) {
                    await handlePostLogin(data.user.id)
                    setIsVerifyingEmail(false)
                    setVerificationCode('')
                    setPendingEmail(null)
                }
            } else if (mode === 'signup') {
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
                    // Check if email confirmation is required (implied if identities exists and updated_at matches created_at roughly, or session is null)
                    if (!authData.session) {
                        setPendingEmail(formData.email)
                        setIsVerifyingEmail(true)
                        setVerificationCode('')
                        showToast.success("We've emailed you a verification code. Enter it below to verify your account.");
                    } else {
                        // User verified immediately (unlikely in prod without auto-confirm) or auto-confirm is on
                        await handlePostLogin(authData.user.id);
                    }
                }
            } else {
                const { data: authData, error } = await supabase.auth.signInWithPassword({
                    email: formData.email,
                    password: formData.password,
                })

                if (error) {
                    if (error.message.includes("Email not confirmed")) {
                        throw new Error("Please verify your email address before signing in. Check your inbox and spam folder.");
                    }
                    throw error;
                }

                if (authData.user) {
                    await handlePostLogin(authData.user.id);
                }
            }
        } catch (error: any) {
            showToast.error(error.message || toastMessages.error.generic)
        } finally {
            setIsLoading(false)
        }
    }

    const handlePostLogin = async (userId: string) => {
        // Fetch existing profile
        const { data: profileData } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle()

        if (profileData) {
            setProfile(profileData)
            setAuthenticated(true)

            // Check job preferences to see if onboarding was done
            const { data: prefData } = await supabase
                .from('job_preferences')
                .select('target_roles')
                .eq('user_id', userId)
                .maybeSingle()

            // If no target roles in preferences, they haven't finished onboarding
            if (!prefData?.target_roles || prefData.target_roles.length === 0) {
                navigate('/onboarding');
            } else {
                navigate('/dashboard');
            }

        } else {
            // Profile doesn't exist yet (maybe trigger failed or first login after signup without trigger)
            // We can create a basic one or let onboarding handle it.
            // For now, let's redirect to onboarding which should handle profile creation/updating
            setProfile({
                id: userId,
                full_name: formData.name || '',
                email: formData.email,
                phone: null,
                location: null,
                linkedin_url: null,
                portfolio_url: null,
                avatar_url: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            setAuthenticated(true)
            navigate('/onboarding')
        }
    }

    const handleGoogleSignIn = async () => {
        try {
            setIsLoading(true)
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            })
            if (error) throw error
        } catch (error: any) {
            showToast.error(error.message || 'Failed to sign in with Google')
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
                        {isVerifyingEmail ? 'Verify your email' : mode === 'signin' ? 'Welcome Back' : 'Create Account'}
                    </h1>
                    <p className="text-white/60">
                        {isVerifyingEmail
                            ? 'Enter the verification code we sent to your email.'
                            : mode === 'signin'
                                ? 'Sign in to continue your job search'
                                : 'Start your journey to landing your dream job'
                        }
                    </p>
                </div>

                {/* Auth Card */}
                <div className="glass rounded-3xl p-8 border border-white/10 bg-black/40 backdrop-blur-xl">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {isVerifyingEmail ? (
                            <>
                                <p className="text-white/70 text-sm">
                                    We've sent a verification code to {pendingEmail}. Enter it below to activate your account.
                                </p>
                                <Input
                                    label="Verification Code"
                                    placeholder="123456"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    required
                                />
                                <div className="flex items-center justify-between text-xs text-white/50 mt-1">
                                    <span>Codes expire after a short time for security.</span>
                                    <button
                                        type="button"
                                        onClick={handleResendCode}
                                        disabled={isLoading}
                                        className="text-white/80 hover:text-white underline underline-offset-2 disabled:opacity-50"
                                    >
                                        Resend code
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
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
                            </>
                        )}

                        <Button type="submit" size="lg" className="w-full group rounded-full" isLoading={isLoading}>
                            {isVerifyingEmail ? 'Verify Email' : mode === 'signin' ? 'Sign In' : 'Create Account'}
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
                    <Button 
                        variant="secondary" 
                        className="w-full text-white/80 hover:text-white"
                        onClick={handleGoogleSignIn}
                        isLoading={isLoading}
                    >
                        <svg className="w-5 h-5 mr-2 opacity-80" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="currentColor" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor" />
                        </svg>
                        Google
                    </Button>
                </div>

                {/* Toggle Mode */}
                <p className="text-center text-white/40 mt-8">
                    {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                    <button
                        type="button"
                        onClick={() => {
                            setMode(mode === 'signin' ? 'signup' : 'signin')
                            setIsVerifyingEmail(false)
                            setVerificationCode('')
                            setPendingEmail(null)
                        }}
                        className="text-white hover:text-white/80 font-medium transition-colors border-b border-white/20 hover:border-white"
                    >
                        {mode === 'signin' ? 'Sign Up' : 'Sign In'}
                    </button>
                </p>
            </div>
        </div>
    )
}

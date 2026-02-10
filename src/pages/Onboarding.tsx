import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    User,
    MapPin,
    Briefcase,
    DollarSign,
    ArrowRight,
    ArrowLeft,
    Building2,
    Home,
    Monitor
} from 'lucide-react'
import { Button, Input, Card } from '../components/ui'
import { useUserStore } from '../stores'
import { supabase } from '../lib/supabase'
import type { OnboardingData } from '../types'

const steps = [
    { id: 1, title: 'Basic Info', icon: User },
    { id: 2, title: 'Job Preferences', icon: Briefcase },
    { id: 3, title: 'Salary Range', icon: DollarSign },
]

const popularRoles = [
    'Software Engineer',
    'Product Manager',
    'Data Scientist',
    'UX Designer',
    'Marketing Manager',
    'Sales Representative',
    'Project Manager',
    'Business Analyst',
    'DevOps Engineer',
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
]

const industries = [
    'Technology',
    'Healthcare',
    'Finance',
    'E-commerce',
    'Education',
    'Manufacturing',
    'Media',
    'Consulting',
]

const workPreferences = [
    { value: 'remote', label: 'Remote Only', icon: Home, description: 'Work from anywhere' },
    { value: 'hybrid', label: 'Hybrid', icon: Building2, description: 'Mix of office & remote' },
    { value: 'onsite', label: 'On-site', icon: Monitor, description: 'Full-time in office' },
    { value: 'any', label: 'Any', icon: Briefcase, description: 'Open to all options' },
]

export default function Onboarding() {
    const [currentStep, setCurrentStep] = useState(1)
    const [isLoading, setIsLoading] = useState(false)
    const [data, setData] = useState<OnboardingData>({
        full_name: '',
        location: '',
        target_roles: [],
        target_industries: [],
        remote_preference: 'any',
        salary_min: undefined,
        salary_max: undefined,
    })

    const navigate = useNavigate()
    const { setProfile, setPreferences, profile } = useUserStore()

    const toggleRole = (role: string) => {
        setData(prev => ({
            ...prev,
            target_roles: prev.target_roles.includes(role)
                ? prev.target_roles.filter(r => r !== role)
                : [...prev.target_roles, role]
        }))
    }

    const toggleIndustry = (industry: string) => {
        setData(prev => ({
            ...prev,
            target_industries: prev.target_industries.includes(industry)
                ? prev.target_industries.filter(i => i !== industry)
                : [...prev.target_industries, industry]
        }))
    }

    const handleNext = () => {
        if (currentStep < 3) {
            setCurrentStep(currentStep + 1)
        } else {
            handleComplete()
        }
    }

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
        }
    }

    const handleComplete = async () => {
        setIsLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            const userId = user?.id
            if (!userId) throw new Error('User not authenticated')

            // Update profile
            const { error: profileError } = await supabase
                .from('user_profiles')
                .update({
                    full_name: data.full_name || profile.full_name,
                    location: data.location,
                })
                .eq('id', userId)

            if (profileError) throw profileError

            // Update preferences
            const { data: prefData, error: prefError } = await supabase
                .from('job_preferences')
                .upsert({
                    user_id: userId,
                    target_roles: data.target_roles,
                    target_industries: data.target_industries,
                    location: data.location,
                    remote_preference: data.remote_preference,
                    salary_min: data.salary_min || null,
                    salary_max: data.salary_max || null,
                }, { onConflict: 'user_id' })
                .select()
                .maybeSingle()

            if (prefError) throw prefError

            // Update local state
            setProfile({
                ...profile,
                full_name: data.full_name || profile.full_name,
                location: data.location,
            })

            if (prefData) {
                setPreferences(prefData)
            }

            navigate('/dashboard')
        } catch (error: any) {
            alert(error.message || 'Failed to save preferences')
        } finally {
            setIsLoading(false)
        }
    }

    const canProceed = () => {
        switch (currentStep) {
            case 1:
                return data.full_name.trim() !== '' && data.location.trim() !== ''
            case 2:
                return data.target_roles.length > 0
            case 3:
                return true
            default:
                return false
        }
    }

    return (
        <div className="min-h-screen bg-surface-950 py-12 px-4 sm:px-6">
            {/* Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/3 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-pulse-slow" />
                <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
            </div>

            <div className="max-w-2xl mx-auto relative z-10">
                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-4 mb-12">
                    {steps.map((step, index) => {
                        const StepIcon = step.icon
                        const isActive = currentStep === step.id
                        const isComplete = currentStep > step.id

                        return (
                            <div key={step.id} className="flex items-center">
                                <div className="flex flex-col items-center">
                                    <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300
                    ${isActive ? 'gradient-bg shadow-glow' : isComplete ? 'bg-accent-500' : 'bg-surface-800 border border-surface-700'}
                  `}>
                                        <StepIcon className={`w-5 h-5 ${isActive || isComplete ? 'text-white' : 'text-surface-400'}`} />
                                    </div>
                                    <span className={`mt-2 text-xs font-medium ${isActive ? 'text-primary-400' : 'text-surface-500'}`}>
                                        {step.title}
                                    </span>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={`w-16 h-0.5 mx-2 ${isComplete ? 'bg-accent-500' : 'bg-surface-700'}`} />
                                )}
                            </div>
                        )
                    })}
                </div>

                {/* Step Content */}
                <Card className="animate-fade-in">
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <div className="text-center mb-8">
                                <h2 className="font-display text-2xl font-bold text-white mb-2">
                                    Let's get to know you
                                </h2>
                                <p className="text-surface-400">
                                    Tell us a bit about yourself to personalize your experience
                                </p>
                            </div>

                            <Input
                                label="Your Full Name"
                                placeholder="John Doe"
                                icon={<User className="w-5 h-5" />}
                                value={data.full_name}
                                onChange={(e) => setData({ ...data, full_name: e.target.value })}
                            />

                            <Input
                                label="Your Location"
                                placeholder="San Francisco, CA"
                                icon={<MapPin className="w-5 h-5" />}
                                value={data.location}
                                onChange={(e) => setData({ ...data, location: e.target.value })}
                            />
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <div className="text-center mb-8">
                                <h2 className="font-display text-2xl font-bold text-white mb-2">
                                    What roles are you looking for?
                                </h2>
                                <p className="text-surface-400">
                                    Select all that apply - we'll find jobs matching these titles
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-surface-300 mb-3">
                                    Target Roles
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {popularRoles.map((role) => (
                                        <button
                                            key={role}
                                            onClick={() => toggleRole(role)}
                                            className={`
                        px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                        ${data.target_roles.includes(role)
                                                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                                                    : 'bg-surface-800 text-surface-400 hover:bg-surface-700 hover:text-surface-200 border border-surface-700'
                                                }
                      `}
                                        >
                                            {role}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-surface-300 mb-3">
                                    Preferred Industries (Optional)
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {industries.map((industry) => (
                                        <button
                                            key={industry}
                                            onClick={() => toggleIndustry(industry)}
                                            className={`
                        px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                        ${data.target_industries.includes(industry)
                                                    ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/25'
                                                    : 'bg-surface-800 text-surface-400 hover:bg-surface-700 hover:text-surface-200 border border-surface-700'
                                                }
                      `}
                                        >
                                            {industry}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-surface-300 mb-3">
                                    Work Preference
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {workPreferences.map((pref) => {
                                        const Icon = pref.icon
                                        const isSelected = data.remote_preference === pref.value
                                        return (
                                            <button
                                                key={pref.value}
                                                onClick={() => setData({ ...data, remote_preference: pref.value as OnboardingData['remote_preference'] })}
                                                className={`
                          p-4 rounded-xl text-left transition-all duration-200 border
                          ${isSelected
                                                        ? 'bg-primary-500/20 border-primary-500 text-white'
                                                        : 'bg-surface-800/50 border-surface-700 text-surface-400 hover:border-surface-600'
                                                    }
                        `}
                                            >
                                                <Icon className={`w-5 h-5 mb-2 ${isSelected ? 'text-primary-400' : 'text-surface-500'}`} />
                                                <div className="font-medium text-sm">{pref.label}</div>
                                                <div className="text-xs opacity-70">{pref.description}</div>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <div className="text-center mb-8">
                                <h2 className="font-display text-2xl font-bold text-white mb-2">
                                    What's your salary range?
                                </h2>
                                <p className="text-surface-400">
                                    This helps us filter jobs within your expectations (optional)
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Minimum Salary"
                                    type="number"
                                    placeholder="50,000"
                                    icon={<DollarSign className="w-5 h-5" />}
                                    value={data.salary_min || ''}
                                    onChange={(e) => setData({ ...data, salary_min: parseInt(e.target.value) || undefined })}
                                />
                                <Input
                                    label="Maximum Salary"
                                    type="number"
                                    placeholder="150,000"
                                    icon={<DollarSign className="w-5 h-5" />}
                                    value={data.salary_max || ''}
                                    onChange={(e) => setData({ ...data, salary_max: parseInt(e.target.value) || undefined })}
                                />
                            </div>

                            <div className="glass-light rounded-xl p-4 mt-6">
                                <h4 className="text-sm font-medium text-surface-200 mb-2">Your Preferences Summary</h4>
                                <div className="space-y-1 text-sm text-surface-400">
                                    <p><span className="text-surface-300">Name:</span> {data.full_name}</p>
                                    <p><span className="text-surface-300">Location:</span> {data.location}</p>
                                    <p><span className="text-surface-300">Roles:</span> {data.target_roles.join(', ') || 'Not specified'}</p>
                                    <p><span className="text-surface-300">Work Type:</span> {workPreferences.find(p => p.value === data.remote_preference)?.label}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-surface-700">
                        <Button
                            variant="ghost"
                            onClick={handleBack}
                            disabled={currentStep === 1}
                            className={currentStep === 1 ? 'invisible' : ''}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>

                        <Button
                            onClick={handleNext}
                            disabled={!canProceed()}
                            isLoading={isLoading}
                            className="group"
                        >
                            {currentStep === 3 ? 'Complete Setup' : 'Continue'}
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    )
}

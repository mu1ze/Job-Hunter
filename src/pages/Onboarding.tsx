import { useState, useEffect } from 'react'
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
    Monitor,
    Check
} from 'lucide-react'
import { Button, Input, Card } from '../components/ui'
import { useUserStore } from '../stores'
import { supabase } from '../lib/supabase'
import { showToast, toastMessages } from '../utils/toast'
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
    const { updateProfile, updatePreferences } = useUserStore()

    // Load existing data if available
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                const [profileRes, prefRes] = await Promise.all([
                    supabase.from('user_profiles').select('*').eq('id', user.id).maybeSingle(),
                    supabase.from('job_preferences').select('*').eq('user_id', user.id).maybeSingle()
                ])

                if (profileRes.data) {
                    setData(prev => ({
                        ...prev,
                        full_name: profileRes.data.full_name || '',
                        location: profileRes.data.location || '',
                    }))
                }

                if (prefRes.data) {
                    setData(prev => ({
                        ...prev,
                        target_roles: prefRes.data.target_roles || [],
                        target_industries: prefRes.data.target_industries || [],
                        remote_preference: prefRes.data.remote_preference || 'any',
                        salary_min: prefRes.data.salary_min || undefined,
                        salary_max: prefRes.data.salary_max || undefined,
                        location: prefRes.data.location || profileRes.data?.location || ''
                    }))
                }
            } catch (error) {
                console.error('Error loading onboarding data:', error)
            }
        }

        loadInitialData()
    }, [])

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
            await updateProfile({
                full_name: data.full_name,
                location: data.location,
            })

            await updatePreferences({
                target_roles: data.target_roles,
                target_industries: data.target_industries,
                location: data.location,
                remote_preference: data.remote_preference,
                salary_min: data.salary_min || null,
                salary_max: data.salary_max || null,
            })

            navigate('/dashboard')
        } catch (error: any) {
            showToast.error(error.message || toastMessages.general.updateFailed)
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
        <div className="min-h-screen bg-black py-12 px-4 sm:px-6 font-['General_Sans',_sans-serif]">
            {/* Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/3 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse-slow" />
                <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
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
                    w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
                    ${isActive ? 'bg-white text-black shadow-lg shadow-white/20' : isComplete ? 'bg-white/10 text-white' : 'bg-white/5 text-white/40 border border-white/5'}
                  `}>
                                        {isComplete ? <Check className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                                    </div>
                                    <span className={`mt-2 text-xs font-medium ${isActive ? 'text-white' : 'text-white/40'}`}>
                                        {step.title}
                                    </span>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={`w-16 h-0.5 mx-2 ${isComplete ? 'bg-white/20' : 'bg-white/5'}`} />
                                )}
                            </div>
                        )
                    })}
                </div>

                {/* Step Content */}
                <Card className="animate-fade-in border border-white/10 bg-black/40 backdrop-blur-xl">
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <div className="text-center mb-8">
                                <h2 className="font-medium text-2xl text-white mb-2 tracking-tight">
                                    Let's get to know you
                                </h2>
                                <p className="text-white/60">
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
                                <h2 className="font-medium text-2xl text-white mb-2 tracking-tight">
                                    What roles are you looking for?
                                </h2>
                                <p className="text-white/60">
                                    Select all that apply - we'll find jobs matching these titles
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white/60 mb-3">
                                    Target Roles
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {popularRoles.map((role) => (
                                        <button
                                            key={role}
                                            onClick={() => toggleRole(role)}
                                            className={`
                        px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border
                        ${data.target_roles.includes(role)
                                                    ? 'bg-white text-black border-transparent shadow-lg shadow-white/10'
                                                    : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border-white/5'
                                                }
                      `}
                                        >
                                            {role}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white/60 mb-3">
                                    Preferred Industries (Optional)
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {industries.map((industry) => (
                                        <button
                                            key={industry}
                                            onClick={() => toggleIndustry(industry)}
                                            className={`
                        px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border
                        ${data.target_industries.includes(industry)
                                                    ? 'bg-white/20 text-white border-transparent'
                                                    : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border-white/5'
                                                }
                      `}
                                        >
                                            {industry}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white/60 mb-3">
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
                          p-4 rounded-2xl text-left transition-all duration-200 border
                          ${isSelected
                                                        ? 'bg-white text-black border-transparent shadow-lg shadow-white/10'
                                                        : 'bg-white/5 border-white/5 text-white/60 hover:text-white hover:bg-white/10'
                                                    }
                        `}
                                            >
                                                <Icon className={`w-5 h-5 mb-2 ${isSelected ? 'text-black' : 'text-white/40'}`} />
                                                <div className="font-medium text-sm">{pref.label}</div>
                                                <div className={`text-xs ${isSelected ? 'text-black/60' : 'text-white/40'}`}>{pref.description}</div>
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
                                <h2 className="font-medium text-2xl text-white mb-2 tracking-tight">
                                    What's your salary range?
                                </h2>
                                <p className="text-white/60">
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

                            <div className="bg-white/5 border border-white/5 rounded-2xl p-6 mt-6">
                                <h4 className="text-sm font-medium text-white mb-4">Your Preferences Summary</h4>
                                <div className="space-y-2 text-sm text-white/60">
                                    <div className="flex justify-between border-b border-white/5 pb-2">
                                        <span>Name</span>
                                        <span className="text-white">{data.full_name}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-white/5 pb-2">
                                        <span>Location</span>
                                        <span className="text-white">{data.location}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-white/5 pb-2">
                                        <span>Roles</span>
                                        <span className="text-white text-right max-w-[50%] truncate">{data.target_roles.join(', ') || 'Not specified'}</span>
                                    </div>
                                    <div className="flex justify-between pt-1">
                                        <span>Work Type</span>
                                        <span className="text-white">{workPreferences.find(p => p.value === data.remote_preference)?.label}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
                        <Button
                            variant="ghost"
                            onClick={handleBack}
                            disabled={currentStep === 1}
                            className={`${currentStep === 1 ? 'invisible' : ''} text-white/50 hover:text-white`}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>

                        <Button
                            onClick={handleNext}
                            disabled={!canProceed()}
                            isLoading={isLoading}
                            className="group rounded-full bg-white text-black hover:bg-white/90 shadow-lg shadow-white/10"
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

import { useState } from 'react'
import { User, Mail, Phone, MapPin, Linkedin, Link as LinkIcon, Briefcase, DollarSign, Settings, Save } from 'lucide-react'
import { useUserStore } from '../stores'
import { Button, Input, Card } from '../components/ui'
import { toast } from 'react-hot-toast'

export default function Profile() {
    const { profile, preferences, updateProfile, updatePreferences } = useUserStore()
    const [isSaving, setIsSaving] = useState(false)

    const [profileData, setProfileData] = useState({
        full_name: profile?.full_name || '',
        email: profile?.email || '',
        phone: profile?.phone || '',
        location: profile?.location || '',
        linkedin_url: profile?.linkedin_url || '',
        portfolio_url: profile?.portfolio_url || '',
    })

    const [prefData, setPrefData] = useState({
        salary_min: preferences?.salary_min || undefined,
        salary_max: preferences?.salary_max || undefined,
        remote_preference: preferences?.remote_preference || 'any',
        use_global_filters: preferences?.use_global_filters || false,
    })

    const handleSave = async () => {
        setIsSaving(true)
        try {
            await Promise.all([
                updateProfile(profileData),
                updatePreferences(prefData)
            ])
            toast.success('Profile and settings updated successfully')
        } catch (error: any) {
            console.error('Error updating profile:', error)
            toast.error(error.message || 'Failed to update profile')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in font-['General_Sans',_sans-serif]">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
                <div>
                    <h1 className="font-medium text-3xl text-white mb-2 tracking-tight">Your Profile</h1>
                    <p className="text-white/60 text-lg">Manage your personal info and default job filters</p>
                </div>
                <Button
                    onClick={handleSave}
                    isLoading={isSaving}
                    className="bg-white text-black hover:bg-white/90 rounded-full px-8 h-12"
                >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Left Column - Personal Info */}
                <div className="md:col-span-2 space-y-6">
                    <Card className="border border-white/10 bg-white/5">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                <User className="w-5 h-5 text-white" />
                            </div>
                            <h2 className="font-medium text-xl text-white">Personal Information</h2>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <Input
                                label="Full Name"
                                placeholder="John Doe"
                                icon={<User className="w-5 h-5" />}
                                value={profileData.full_name}
                                onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                            />
                            <Input
                                label="Email Address"
                                type="email"
                                placeholder="john@example.com"
                                icon={<Mail className="w-5 h-5" />}
                                value={profileData.email}
                                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                disabled
                            />
                            <Input
                                label="Phone Number"
                                placeholder="+1 (555) 000-0000"
                                icon={<Phone className="w-5 h-5" />}
                                value={profileData.phone}
                                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                            />
                            <Input
                                label="Location"
                                placeholder="City, Country"
                                icon={<MapPin className="w-5 h-5" />}
                                value={profileData.location}
                                onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                            />
                            <Input
                                label="LinkedIn URL"
                                placeholder="linkedin.com/in/username"
                                icon={<Linkedin className="w-5 h-5" />}
                                value={profileData.linkedin_url}
                                onChange={(e) => setProfileData({ ...profileData, linkedin_url: e.target.value })}
                            />
                            <Input
                                label="Portfolio URL"
                                placeholder="yourwebsite.com"
                                icon={<LinkIcon className="w-5 h-5" />}
                                value={profileData.portfolio_url}
                                onChange={(e) => setProfileData({ ...profileData, portfolio_url: e.target.value })}
                            />
                        </div>
                    </Card>

                    <Card className="border border-white/10 bg-white/5">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                <Briefcase className="w-5 h-5 text-white" />
                            </div>
                            <h2 className="font-medium text-xl text-white">Default Job Filters</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <Input
                                    label="Minimum Salary (Annual)"
                                    type="number"
                                    placeholder="e.g. 50000"
                                    icon={<DollarSign className="w-5 h-5" />}
                                    value={prefData.salary_min || ''}
                                    onChange={(e) => setPrefData({ ...prefData, salary_min: parseInt(e.target.value) || undefined })}
                                />
                                <Input
                                    label="Maximum Salary (Annual)"
                                    type="number"
                                    placeholder="e.g. 150000"
                                    icon={<DollarSign className="w-5 h-5" />}
                                    value={prefData.salary_max || ''}
                                    onChange={(e) => setPrefData({ ...prefData, salary_max: parseInt(e.target.value) || undefined })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-3">Work Preference</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {['any', 'remote', 'hybrid', 'onsite'].map((p) => (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setPrefData({ ...prefData, remote_preference: p as any })}
                                            className={`
                                                px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300 border
                                                ${prefData.remote_preference === p
                                                    ? 'bg-white text-black border-transparent shadow-lg shadow-white/5'
                                                    : 'bg-white/5 text-white/60 border-white/10 hover:border-white/20'}
                                            `}
                                        >
                                            <span className="capitalize">{p}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column - Secondary Settings */}
                <div className="space-y-6">
                    <Card className="border border-white/10 bg-white/5 overflow-hidden">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                <Settings className="w-5 h-5 text-white" />
                            </div>
                            <h2 className="font-medium text-xl text-white">Search Logic</h2>
                        </div>

                        <div className="space-y-6">
                            <div
                                className={`
                                    p-4 rounded-2xl border transition-all duration-500 cursor-pointer
                                    ${prefData.use_global_filters
                                        ? 'bg-white/10 border-white/20'
                                        : 'bg-white/5 border-white/5 opacity-60'}
                                `}
                                onClick={() => setPrefData({ ...prefData, use_global_filters: !prefData.use_global_filters })}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <span className="font-medium text-white">Use Global Filters</span>
                                    <div className={`
                                        w-12 h-6 rounded-full p-1 transition-colors duration-300
                                        ${prefData.use_global_filters ? 'bg-white' : 'bg-white/10'}
                                    `}>
                                        <div className={`
                                            w-4 h-4 rounded-full bg-black transition-transform duration-300 transform
                                            ${prefData.use_global_filters ? 'translate-x-6' : 'translate-x-0'}
                                        `} />
                                    </div>
                                </div>
                                <p className="text-xs text-white/50 leading-relaxed">
                                    When enabled, your default filters (Salary, Work Preference) will be automatically applied to all new job searches.
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-gradient-to-br from-white/10 to-transparent border border-white/10">
                        <h3 className="font-medium text-white mb-2 text-sm uppercase tracking-wider">Pro Tip</h3>
                        <p className="text-white/50 text-sm leading-relaxed">
                            Keeping your location and contact info updated ensures AI-generated cover letters are always ready for submission.
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    )
}

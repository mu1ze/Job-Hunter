import { useState, useRef, useEffect } from 'react'
import { User, Mail, Phone, MapPin, Linkedin, Link as LinkIcon, Briefcase, DollarSign, Settings, Save, Camera, Loader2, AlertTriangle, Key } from 'lucide-react'
import { useUserStore } from '../stores'
import { Button, Input, Card } from '../components/ui'
import { supabase } from '../lib/supabase'
import { toast } from 'react-hot-toast'

export default function Profile() {
    const { profile, preferences, updateProfile, updatePreferences } = useUserStore()
    const [isSaving, setIsSaving] = useState(false)
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
    const avatarInputRef = useRef<HTMLInputElement>(null)

    // Delete Account Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [deletePassword, setDeletePassword] = useState('')
    const [deleteConfirmationText, setDeleteConfirmationText] = useState('')
    const [expectedConfirmationText, setExpectedConfirmationText] = useState('DELETE MY ACCOUNT')
    const [isDeleting, setIsDeleting] = useState(false)

    useEffect(() => {
        if (isDeleteModalOpen) {
            // Generate a random 4-digit code to append for extra safety
            const code = Math.floor(1000 + Math.random() * 9000)
            setExpectedConfirmationText(`DELETE-${code}`)
            setDeletePassword('')
            setDeleteConfirmationText('')
        }
    }, [isDeleteModalOpen])

    const [profileData, setProfileData] = useState({
        full_name: profile?.full_name || '',
        email: profile?.email || '',
        phone: profile?.phone || '',
        location: profile?.location || '',
        linkedin_url: profile?.linkedin_url || '',
        portfolio_url: profile?.portfolio_url || '',
        avatar_url: profile?.avatar_url || '',
    })

    const [prefData, setPrefData] = useState({
        salary_min: preferences?.salary_min || undefined,
        salary_max: preferences?.salary_max || undefined,
        remote_preference: preferences?.remote_preference || 'any',
        use_global_filters: preferences?.use_global_filters || false,
    })

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file')
            return
        }

        if (file.size > 2 * 1024 * 1024) {
            toast.error('Image must be less than 2MB')
            return
        }

        setIsUploadingAvatar(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const fileExt = file.name.split('.').pop()
            const fileName = `${user.id}-${Date.now()}.${fileExt}`
            const filePath = `avatars/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('user-content')
                .upload(filePath, file, { upsert: true })

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('user-content')
                .getPublicUrl(filePath)

            setProfileData(prev => ({ ...prev, avatar_url: publicUrl }))
            toast.success('Profile picture updated')
        } catch (error: any) {
            console.error('Avatar upload error:', error)
            toast.error(error.message || 'Failed to upload image')
        } finally {
            setIsUploadingAvatar(false)
        }
    }

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

    const handleDeleteAccount = async () => {
        if (deleteConfirmationText !== expectedConfirmationText || !deletePassword) return
        
        setIsDeleting(true)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) throw new Error('Not authenticated')

            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-account`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ password: deletePassword })
            })

            const result = await response.json()
            if (!response.ok) throw new Error(result.error || 'Failed to delete account')

            toast.success('Account deleted successfully')
            // Sign out to clear local state
            await supabase.auth.signOut()
            window.location.href = '/'
            
        } catch (error: any) {
            console.error('Delete account error:', error)
            toast.error(error.message || 'Failed to delete account')
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in font-['General_Sans',_sans-serif] relative">
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

                        {/* Avatar Upload */}
                        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-white/10">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full bg-white/10 border-2 border-white/20 overflow-hidden flex items-center justify-center">
                                    {profileData.avatar_url ? (
                                        <img 
                                            src={profileData.avatar_url} 
                                            alt="Profile" 
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <User className="w-10 h-10 text-white/30" />
                                    )}
                                </div>
                                <button
                                    onClick={() => avatarInputRef.current?.click()}
                                    disabled={isUploadingAvatar}
                                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:bg-white/90 transition-colors shadow-lg"
                                >
                                    {isUploadingAvatar ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Camera className="w-4 h-4" />
                                    )}
                                </button>
                                <input
                                    ref={avatarInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarUpload}
                                    className="hidden"
                                />
                            </div>
                            <div>
                                <h3 className="font-medium text-white">Profile Photo</h3>
                                <p className="text-sm text-white/50">Click the camera icon to upload</p>
                            </div>
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

                    <Card className="border border-red-500/30 bg-red-500/5 overflow-hidden">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-red-500" />
                            </div>
                            <h2 className="font-medium text-xl text-white">Danger Zone</h2>
                        </div>
                        <p className="text-sm text-white/50 mb-6 leading-relaxed">
                            Permanently delete your account and personal data. This action cannot be undone.
                        </p>
                        <Button 
                            className="w-full bg-red-500 hover:bg-red-600 text-white rounded-full h-12"
                            onClick={() => setIsDeleteModalOpen(true)}
                        >
                            Delete Account
                        </Button>
                    </Card>

                    <Card className="bg-gradient-to-br from-white/10 to-transparent border border-white/10">
                        <h3 className="font-medium text-white mb-2 text-sm uppercase tracking-wider">Pro Tip</h3>
                        <p className="text-white/50 text-sm leading-relaxed">
                            Keeping your location and contact info updated ensures AI-generated cover letters are always ready for submission.
                        </p>
                    </Card>
                </div>
            </div>

            {/* Delete Account Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#121212] border border-red-500/30 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl animate-fade-in relative">
                        <div className="flex items-center gap-3 mb-6 text-red-500">
                            <AlertTriangle className="w-8 h-8" />
                            <h2 className="text-2xl font-bold text-white">Delete Account</h2>
                        </div>
                        
                        <div className="space-y-4 mb-6">
                            <p className="text-white/80">
                                This action is permanent. Please review what happens:
                            </p>
                            <ul className="text-sm space-y-2 text-white/60 bg-white/5 p-4 rounded-xl border border-white/5">
                                <li className="flex items-start gap-2">
                                    <span className="text-red-400 font-bold">Deleted:</span> 
                                    Personal data, resumes, email, name, and job history.
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-400 font-bold">Retained:</span> 
                                    Anonymized usage analytics and crash reports (GDPR compliant).
                                </li>
                            </ul>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">
                                    Enter your password
                                </label>
                                <Input 
                                    type="password" 
                                    placeholder="Your password" 
                                    icon={<Key className="w-5 h-5" />}
                                    value={deletePassword}
                                    onChange={(e) => setDeletePassword(e.target.value)}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">
                                    Type <strong className="text-white bg-white/10 px-2 py-0.5 rounded tracking-widest">{expectedConfirmationText}</strong> to confirm
                                </label>
                                <Input 
                                    type="text" 
                                    placeholder={expectedConfirmationText}
                                    value={deleteConfirmationText}
                                    onChange={(e) => setDeleteConfirmationText(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 mt-8">
                            <Button 
                                className="flex-1 bg-white/10 hover:bg-white/20 text-white rounded-xl h-12"
                                onClick={() => setIsDeleteModalOpen(false)}
                                disabled={isDeleting}
                            >
                                Cancel
                            </Button>
                            <Button 
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl h-12 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={handleDeleteAccount}
                                isLoading={isDeleting}
                                disabled={!deletePassword || deleteConfirmationText !== expectedConfirmationText}
                            >
                                Delete Everything
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Trash2, Edit2, Bell, BellOff, Mail, Clock, Sparkles, ArrowRight } from 'lucide-react'
import { Card, Button, Input } from '../components/ui'
import { supabase } from '../lib/supabase'
import { useUserStore } from '../stores'
import { showToast } from '../utils/toast'

function ComingSoon() {
    return (
        <div className="animate-fade-in">
            {/* Coming Soon Banner */}
            <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-yellow-500/10 border border-amber-500/20">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                        <Clock className="w-6 h-6 text-amber-400" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-semibold text-white mb-2">Coming Soon</h2>
                        <p className="text-white/60 mb-4">
                            Job alerts are being rebuilt with smarter notifications and better integration. We'll notify you when it's ready!
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Link to="/jobs">
                                <Button size="sm" className="rounded-full bg-white text-black hover:bg-white/90">
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Find Jobs Now
                                </Button>
                            </Link>
                            <Link to="/generate">
                                <Button size="sm" variant="outline" className="rounded-full border-amber-500/30 text-amber-400 hover:bg-amber-500/10">
                                    Generate Applications
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Preview of What's Coming */}
            <Card className="border border-white/10 bg-white/5 p-8">
                <h3 className="text-lg font-medium text-white mb-6">What We're Building</h3>
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                            <Bell className="w-5 h-5 text-white/70" />
                        </div>
                        <h4 className="font-medium text-white">Smart Notifications</h4>
                        <p className="text-sm text-white/50">Get notified via email when new jobs match your preferences, with AI-powered relevance scoring.</p>
                    </div>
                    <div className="space-y-3">
                        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-white/70" />
                        </div>
                        <h4 className="font-medium text-white">AI-Powered Matching</h4>
                        <p className="text-sm text-white/50">Our AI will learn from your preferences and surface the most relevant opportunities automatically.</p>
                    </div>
                    <div className="space-y-3">
                        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                            <Mail className="w-5 h-5 text-white/70" />
                        </div>
                        <h4 className="font-medium text-white">Weekly Digests</h4>
                        <p className="text-sm text-white/50">Receive a curated summary of the best new opportunities tailored to your career goals.</p>
                    </div>
                </div>
            </Card>
        </div>
    )
}

interface JobAlert {
    id: string
    title: string
    keywords: string[]
    location?: string
    min_salary?: number
    remote_only: boolean
    notification_frequency: 'daily' | 'weekly'
    is_active: boolean
    last_sent_at?: string
}

export default function AlertsManager() {
    const { profile } = useUserStore()
    const [alerts, setAlerts] = useState<JobAlert[]>([])
    const [isCreating, setIsCreating] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [showComingSoon] = useState(false) // Toggle to enable/disable Coming Soon

    // Show Coming Soon for now
    if (showComingSoon) {
        return (
            <div className="animate-fade-in font-['General_Sans',_sans-serif]">
                <div className="mb-6">
                    <h1 className="font-medium text-3xl text-white mb-2 tracking-tight">Job Alerts</h1>
                    <p className="text-white/60">
                        Get notified when new jobs match your criteria
                    </p>
                </div>
                <ComingSoon />
            </div>
        )
    }

    useEffect(() => {
        if (profile) {
            fetchAlerts()
        }
    }, [profile])

    const fetchAlerts = async () => {
        if (!profile) return

        const { data, error } = await supabase
            .from('job_alerts')
            .select('*')
            .eq('user_id', profile.id)
            .order('created_at', { ascending: false })

        if (!error && data) {
            setAlerts(data)
        }
        setLoading(false)
    }

    const handleToggleActive = async (alertId: string, currentStatus: boolean) => {
        const { error } = await supabase
            .from('job_alerts')
            .update({ is_active: !currentStatus })
            .eq('id', alertId)

        if (error) {
            showToast.error('Failed to update alert')
        } else {
            showToast.success(currentStatus ? 'Alert paused' : 'Alert activated')
            fetchAlerts()
        }
    }

    const handleDelete = async (alertId: string) => {
        if (!confirm('Are you sure you want to delete this alert?')) return

        const { error } = await supabase
            .from('job_alerts')
            .delete()
            .eq('id', alertId)

        if (error) {
            showToast.error('Failed to delete alert')
        } else {
            showToast.success('Alert deleted')
            fetchAlerts()
        }
    }

    return (
        <div className="animate-fade-in font-['General_Sans',_sans-serif]">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="font-medium text-3xl text-white mb-2 tracking-tight">Job Alerts</h1>
                    <p className="text-white/60">
                        Get notified when new jobs match your criteria
                    </p>
                </div>
                <Button onClick={() => setIsCreating(true)} className="rounded-full">
                    <Plus className="w-4 h-4 mr-2" />
                    New Alert
                </Button>
            </div>

            {/* Alert Form */}
            {(isCreating || editingId) && (
                <AlertForm
                    alertId={editingId}
                    initialData={alerts.find(a => a.id === editingId)}
                    onClose={() => {
                        setIsCreating(false)
                        setEditingId(null)
                    }}
                    onSave={() => {
                        setIsCreating(false)
                        setEditingId(null)
                        fetchAlerts()
                    }}
                />
            )}

            {/* Alerts List */}
            {loading ? (
                <div className="text-center py-20 text-white/40">Loading alerts...</div>
            ) : alerts.length === 0 && !isCreating ? (
                <Card className="text-center py-20 border border-white/10 bg-white/5">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/5">
                        <Mail className="w-8 h-8 text-white/40" />
                    </div>
                    <h3 className="text-xl font-medium text-white mb-2">No alerts yet</h3>
                    <p className="text-white/50 mb-6">
                        Create your first job alert to get notified about new opportunities
                    </p>
                    <Button onClick={() => setIsCreating(true)} className="rounded-full shadow-lg shadow-white/10">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Alert
                    </Button>
                </Card>
            ) : (
                <div className="space-y-4">
                    {alerts.map(alert => (
                        <Card key={alert.id} hover className="border border-white/10 bg-white/5">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-medium text-white text-lg">{alert.title}</h3>
                                        {alert.is_active ? (
                                            <span className="px-2 py-1 rounded-lg bg-green-500/10 text-green-300 text-xs font-medium border border-green-500/20">
                                                Active
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 rounded-lg bg-white/5 text-white/40 text-xs font-medium border border-white/5">
                                                Paused
                                            </span>
                                        )}
                                    </div>

                                    <div className="space-y-1 text-sm text-white/60">
                                        {alert.keywords.length > 0 && (
                                            <p>
                                                <span className="text-white/40">Keywords:</span>{' '}
                                                {alert.keywords.join(', ')}
                                            </p>
                                        )}
                                        {alert.location && (
                                            <p>
                                                <span className="text-white/40">Location:</span>{' '}
                                                {alert.location}
                                            </p>
                                        )}
                                        {alert.min_salary && (
                                            <p>
                                                <span className="text-white/40">Min Salary:</span>{' '}
                                                ${(alert.min_salary / 1000).toFixed(0)}k
                                            </p>
                                        )}
                                        <p>
                                            <span className="text-white/40">Frequency:</span>{' '}
                                            {alert.notification_frequency.charAt(0).toUpperCase() + alert.notification_frequency.slice(1)}
                                        </p>
                                        {alert.last_sent_at && (
                                            <p>
                                                <span className="text-white/40">Last sent:</span>{' '}
                                                {new Date(alert.last_sent_at).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleToggleActive(alert.id, alert.is_active)}
                                        className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                                        title={alert.is_active ? 'Pause alert' : 'Activate alert'}
                                    >
                                        {alert.is_active ? <BellOff className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                                    </button>
                                    <button
                                        onClick={() => setEditingId(alert.id)}
                                        className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                                        title="Edit alert"
                                    >
                                        <Edit2 className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(alert.id)}
                                        className="p-2 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors"
                                        title="Delete alert"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}

function AlertForm({ alertId, initialData, onClose, onSave }: {
    alertId: string | null
    initialData?: JobAlert
    onClose: () => void
    onSave: () => void
}) {
    const { profile } = useUserStore()
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        keywords: initialData?.keywords?.join(', ') || '',
        location: initialData?.location || '',
        min_salary: initialData?.min_salary ? (initialData.min_salary / 1000).toString() : '',
        remote_only: initialData?.remote_only || false,
        notification_frequency: initialData?.notification_frequency || 'daily'
    })
    const [saving, setSaving] = useState(false)

    // Update form if initialData changes (though typical React patterns might handle this via key prop on parent)
    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title,
                keywords: initialData.keywords?.join(', ') || '',
                location: initialData.location || '',
                min_salary: initialData.min_salary ? (initialData.min_salary / 1000).toString() : '',
                remote_only: initialData.remote_only,
                notification_frequency: initialData.notification_frequency
            })
        }
    }, [initialData])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!profile) return

        setSaving(true)

        const alertData = {
            user_id: profile.id,
            title: formData.title,
            keywords: formData.keywords.split(',').map(k => k.trim()).filter(Boolean),
            location: formData.location || null,
            min_salary: formData.min_salary ? parseInt(formData.min_salary) * 1000 : null,
            remote_only: formData.remote_only,
            notification_frequency: formData.notification_frequency,
            is_active: true
        }

        let error
        if (alertId) {
            ({ error } = await supabase
                .from('job_alerts')
                .update(alertData)
                .eq('id', alertId))
        } else {
            ({ error } = await supabase
                .from('job_alerts')
                .insert([alertData]))
        }

        setSaving(false)

        if (error) {
            showToast.error('Failed to save alert')
        } else {
            showToast.success(alertId ? 'Alert updated!' : 'Alert created!')
            onSave()
        }
    }

    return (
        <Card className="mb-6 border border-white/10 bg-white/5">
            <h3 className="font-medium text-white text-lg mb-4">
                {alertId ? 'Edit Alert' : 'Create New Alert'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Alert Name *"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Senior React Jobs in SF"
                    required
                />

                <Input
                    label="Keywords (comma-separated)"
                    value={formData.keywords}
                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                    placeholder="e.g., React, TypeScript, Frontend"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="e.g., San Francisco, CA"
                    />

                    <Input
                        label="Min Salary (in thousands)"
                        type="number"
                        value={formData.min_salary}
                        onChange={(e) => setFormData({ ...formData, min_salary: e.target.value })}
                        placeholder="e.g., 100"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">
                        Notification Frequency
                    </label>
                    <select
                        value={formData.notification_frequency}
                        onChange={(e) => setFormData({ ...formData, notification_frequency: e.target.value as 'daily' | 'weekly' })}
                        className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-white/30"
                    >
                        <option value="daily" className="bg-black">Daily</option>
                        <option value="weekly" className="bg-black">Weekly</option>
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="remote_only"
                        checked={formData.remote_only}
                        onChange={(e) => setFormData({ ...formData, remote_only: e.target.checked })}
                        className="w-4 h-4 rounded border-white/10 bg-white/5 text-white focus:ring-white/20"
                    />
                    <label htmlFor="remote_only" className="text-sm text-white/60">
                        Remote only
                    </label>
                </div>

                <div className="flex gap-3 pt-4">
                    <Button type="submit" disabled={saving} className="rounded-full shadow-lg shadow-white/10">
                        {saving ? 'Saving...' : (alertId ? 'Update Alert' : 'Create Alert')}
                    </Button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-full border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </Card>
    )
}

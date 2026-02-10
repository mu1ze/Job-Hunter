import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, Bell, BellOff, Mail } from 'lucide-react'
import { Card, Button } from '../components/ui'
import { supabase } from '../lib/supabase'
import { useUserStore } from '../stores'
import { showToast } from '../utils/toast'

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
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="font-display text-3xl font-bold text-white mb-2">Job Alerts</h1>
                    <p className="text-surface-400">
                        Get notified when new jobs match your criteria
                    </p>
                </div>
                <Button onClick={() => setIsCreating(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Alert
                </Button>
            </div>

            {/* Alert Form */}
            {(isCreating || editingId) && (
                <AlertForm
                    alertId={editingId}
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
                <div className="text-center py-20 text-surface-400">Loading alerts...</div>
            ) : alerts.length === 0 && !isCreating ? (
                <Card className="text-center py-20">
                    <Mail className="w-16 h-16 text-surface-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No alerts yet</h3>
                    <p className="text-surface-400 mb-6">
                        Create your first job alert to get notified about new opportunities
                    </p>
                    <Button onClick={() => setIsCreating(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Alert
                    </Button>
                </Card>
            ) : (
                <div className="space-y-4">
                    {alerts.map(alert => (
                        <Card key={alert.id} hover>
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-semibold text-white text-lg">{alert.title}</h3>
                                        {alert.is_active ? (
                                            <span className="px-2 py-1 rounded-lg bg-green-500/20 text-green-400 text-xs font-medium">
                                                Active
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 rounded-lg bg-surface-700 text-surface-400 text-xs font-medium">
                                                Paused
                                            </span>
                                        )}
                                    </div>

                                    <div className="space-y-1 text-sm text-surface-400">
                                        {alert.keywords.length > 0 && (
                                            <p>
                                                <span className="font-medium text-surface-300">Keywords:</span>{' '}
                                                {alert.keywords.join(', ')}
                                            </p>
                                        )}
                                        {alert.location && (
                                            <p>
                                                <span className="font-medium text-surface-300">Location:</span>{' '}
                                                {alert.location}
                                            </p>
                                        )}
                                        {alert.min_salary && (
                                            <p>
                                                <span className="font-medium text-surface-300">Min Salary:</span>{' '}
                                                ${(alert.min_salary / 1000).toFixed(0)}k
                                            </p>
                                        )}
                                        <p>
                                            <span className="font-medium text-surface-300">Frequency:</span>{' '}
                                            {alert.notification_frequency.charAt(0).toUpperCase() + alert.notification_frequency.slice(1)}
                                        </p>
                                        {alert.last_sent_at && (
                                            <p>
                                                <span className="font-medium text-surface-300">Last sent:</span>{' '}
                                                {new Date(alert.last_sent_at).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleToggleActive(alert.id, alert.is_active)}
                                        className="p-2 rounded-lg hover:bg-surface-800 text-surface-400 hover:text-surface-100 transition-colors"
                                        title={alert.is_active ? 'Pause alert' : 'Activate alert'}
                                    >
                                        {alert.is_active ? <BellOff className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                                    </button>
                                    <button
                                        onClick={() => setEditingId(alert.id)}
                                        className="p-2 rounded-lg hover:bg-surface-800 text-surface-400 hover:text-surface-100 transition-colors"
                                        title="Edit alert"
                                    >
                                        <Edit2 className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(alert.id)}
                                        className="p-2 rounded-lg hover:bg-surface-800 text-surface-400 hover:text-red-400 transition-colors"
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

function AlertForm({ alertId, onClose, onSave }: {
    alertId: string | null
    onClose: () => void
    onSave: () => void
}) {
    const { profile } = useUserStore()
    const [formData, setFormData] = useState({
        title: '',
        keywords: '',
        location: '',
        min_salary: '',
        remote_only: false,
        notification_frequency: 'daily' as 'daily' | 'weekly'
    })
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (alertId) {
            loadAlert()
        }
    }, [alertId])

    const loadAlert = async () => {
        if (!alertId) return

        const { data } = await supabase
            .from('job_alerts')
            .select('*')
            .eq('id', alertId)
            .single()

        if (data) {
            setFormData({
                title: data.title,
                keywords: data.keywords?.join(', ') || '',
                location: data.location || '',
                min_salary: data.min_salary ? (data.min_salary / 1000).toString() : '',
                remote_only: data.remote_only,
                notification_frequency: data.notification_frequency
            })
        }
    }

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
        <Card className="mb-6">
            <h3 className="font-semibold text-white text-lg mb-4">
                {alertId ? 'Edit Alert' : 'Create New Alert'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-surface-300 mb-2">
                        Alert Name *
                    </label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                        placeholder="e.g., Senior React Jobs in SF"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-surface-300 mb-2">
                        Keywords (comma-separated)
                    </label>
                    <input
                        type="text"
                        value={formData.keywords}
                        onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                        className="w-full px-4 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                        placeholder="e.g., React, TypeScript, Frontend"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-surface-300 mb-2">
                            Location
                        </label>
                        <input
                            type="text"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="w-full px-4 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                            placeholder="e.g., San Francisco, CA"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-surface-300 mb-2">
                            Min Salary (in thousands)
                        </label>
                        <input
                            type="number"
                            value={formData.min_salary}
                            onChange={(e) => setFormData({ ...formData, min_salary: e.target.value })}
                            className="w-full px-4 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                            placeholder="e.g., 100"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-surface-300 mb-2">
                        Notification Frequency
                    </label>
                    <select
                        value={formData.notification_frequency}
                        onChange={(e) => setFormData({ ...formData, notification_frequency: e.target.value as 'daily' | 'weekly' })}
                        className="w-full px-4 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                    >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="remote_only"
                        checked={formData.remote_only}
                        onChange={(e) => setFormData({ ...formData, remote_only: e.target.checked })}
                        className="w-4 h-4 rounded border-surface-700 bg-surface-800 text-primary-500 focus:ring-primary-500"
                    />
                    <label htmlFor="remote_only" className="text-sm text-surface-300">
                        Remote only
                    </label>
                </div>

                <div className="flex gap-3 pt-4">
                    <Button type="submit" disabled={saving}>
                        {saving ? 'Saving...' : (alertId ? 'Update Alert' : 'Create Alert')}
                    </Button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg border border-surface-700 text-surface-300 hover:bg-surface-800 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </Card>
    )
}

import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { useUserStore } from './stores'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import JobSearch from './pages/JobSearch'
import JobDetails from './pages/JobDetails'
import ResumeManager from './pages/ResumeManager'
import DocumentGenerator from './pages/DocumentGenerator'
import Auth from './pages/Auth'
import Onboarding from './pages/Onboarding'
import ApplicationTracker from './pages/ApplicationTracker'
import Analytics from './pages/Analytics'
import AlertsManager from './pages/AlertsManager'
import Profile from './pages/Profile'
import MainLayout from './components/layout/MainLayout'
import { Toaster } from 'react-hot-toast'
import Docs from './pages/Docs'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, profile } = useUserStore()
    const location = useLocation()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session?.user) {
                useUserStore.getState().setAuthenticated(true)
                await useUserStore.getState().fetchUserData(session.user.id)
            }
            setLoading(false)
        }
        checkAuth()
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
        )
    }

    if (!isAuthenticated || !profile) {
        return <Navigate to="/auth" state={{ from: location }} replace />
    }

    return <>{children}</>
}

function OnboardingRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, profile } = useUserStore()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session?.user) {
                useUserStore.getState().setAuthenticated(true)
                await useUserStore.getState().fetchUserData(session.user.id)
            }
            setLoading(false)
        }
        checkAuth()
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
        )
    }

    // If not authenticated, redirect to auth
    if (!isAuthenticated || !profile) {
        return <Navigate to="/auth" replace />
    }

    return <>{children}</>
}

function App() {
    const { setAuthenticated, fetchUserData } = useUserStore()

    useEffect(() => {
        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setAuthenticated(true)
                fetchUserData(session.user.id)
            } else {
                setAuthenticated(false)
            }
        })

        return () => subscription.unsubscribe()
    }, [setAuthenticated, fetchUserData])

    return (
        <BrowserRouter>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#1E293B',
                        color: '#F8FAFC',
                        border: '1px solid #334155',
                        borderRadius: '0.75rem',
                        padding: '1rem',
                    },
                    success: {
                        iconTheme: {
                            primary: '#10B981',
                            secondary: '#F8FAFC',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#EF4444',
                            secondary: '#F8FAFC',
                        },
                    },
                }}
            />
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/docs" element={<Docs />} />

                {/* Onboarding - requires auth */}
                <Route path="/onboarding" element={
                    <OnboardingRoute>
                        <Onboarding />
                    </OnboardingRoute>
                } />

                {/* Protected Routes with Layout */}
                <Route element={<MainLayout />}>
                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/jobs" element={<ProtectedRoute><JobSearch /></ProtectedRoute>} />
                    <Route path="/jobs/:id" element={<ProtectedRoute><JobDetails /></ProtectedRoute>} />
                    <Route path="/resume" element={<ProtectedRoute><ResumeManager /></ProtectedRoute>} />
                    <Route path="/generate" element={<ProtectedRoute><DocumentGenerator /></ProtectedRoute>} />
                    <Route path="/tracker" element={<ProtectedRoute><ApplicationTracker /></ProtectedRoute>} />
                    <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                    <Route path="/alerts" element={<ProtectedRoute><AlertsManager /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

export default App

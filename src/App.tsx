import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { useUserStore } from './stores'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import JobSearch from './pages/JobSearch'
import ResumeManager from './pages/ResumeManager'
import DocumentGenerator from './pages/DocumentGenerator'
import Auth from './pages/Auth'
import Onboarding from './pages/Onboarding'
import ApplicationTracker from './pages/ApplicationTracker'
import Analytics from './pages/Analytics'
import AlertsManager from './pages/AlertsManager'
import MainLayout from './components/layout/MainLayout'
import { Toaster } from 'react-hot-toast'

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

                {/* Onboarding */}
                <Route path="/onboarding" element={<Onboarding />} />

                {/* Protected Routes with Layout */}
                <Route element={<MainLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/jobs" element={<JobSearch />} />
                    <Route path="/resume" element={<ResumeManager />} />
                    <Route path="/generate" element={<DocumentGenerator />} />
                    <Route path="/tracker" element={<ApplicationTracker />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/alerts" element={<AlertsManager />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

export default App

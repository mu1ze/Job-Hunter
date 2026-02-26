import { useEffect} from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AuthCallback() {
    const navigate = useNavigate()

    useEffect(() => {
        const handleOAuthCallback = async () => {
            const { error } = await supabase.auth.getSession()
            
            if (error) {
                console.error('Auth callback error:', error)
                navigate('/auth')
                return
            }

            // Get the current session
            const { data: { session } } = await supabase.auth.getSession()
            
            if (session?.user) {
                // Check if profile exists
                const { data: profile } = await supabase
                    .from('user_profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single()

                if (profile) {
                    // Check if onboarding was done
                    const { data: prefData } = await supabase
                        .from('job_preferences')
                        .select('target_roles')
                        .eq('user_id', session.user.id)
                        .maybeSingle()

                    if (!prefData?.target_roles || prefData.target_roles.length === 0) {
                        navigate('/onboarding')
                    } else {
                        navigate('/dashboard')
                    }
                } else {
                    navigate('/onboarding')
                }
            } else {
                navigate('/auth')
            }
        }

        handleOAuthCallback()
    }, [navigate])

    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="text-center">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
                <p className="text-white/60">Completing sign in...</p>
            </div>
        </div>
    )
}

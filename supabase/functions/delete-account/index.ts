import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
        
        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error('Missing Supabase environment variables')
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        })

        // Verify the user making the request
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
                status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error: userError } = await supabase.auth.getUser(token)

        if (userError || !user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        // Parse request body
        const { password } = await req.json()
        if (!password) {
            return new Response(JSON.stringify({ error: 'Password is required' }), {
                status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        // Verify the password by attempting to sign in
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email!,
            password: password
        })

        if (signInError) {
            // Log failed deletion attempt without PII
            await supabase.from('deletion_logs').insert({
                deleted_user_id: user.id,
                reason: 'Invalid password',
                success: false
            })

            return new Response(JSON.stringify({ error: 'Invalid password' }), {
                status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        // Step 1: Delete all personal files (resumes/documents)
        // Note: we can list objects in 'user-content' and 'resumes' and delete them, 
        // but for safety we will assume storage paths are stored in the DB.
        
        // Fetch resumes
        const { data: resumes } = await supabase.from('resumes').select('storage_path').eq('user_id', user.id)
        if (resumes && resumes.length > 0) {
            const paths = resumes.map(r => r.storage_path).filter(Boolean)
            if (paths.length > 0) {
                await supabase.storage.from('resumes').remove(paths) // Assuming bucket 'resumes'
            }
        }

        // Fetch documents
        const { data: docs } = await supabase.from('generated_documents').select('storage_path').eq('user_id', user.id)
        if (docs && docs.length > 0) {
            const paths = docs.map(d => d.storage_path).filter(Boolean)
            if (paths.length > 0) {
                await supabase.storage.from('documents').remove(paths) // Assuming bucket 'documents'
            }
        }
        
        // Step 2: Delete PII from the database
        // Delete job applications/history (saved_jobs), resumes, preferences
        await supabase.from('saved_jobs').delete().eq('user_id', user.id)
        await supabase.from('resumes').delete().eq('user_id', user.id)
        await supabase.from('generated_documents').delete().eq('user_id', user.id)
        await supabase.from('job_preferences').delete().eq('user_id', user.id)
        
        // Soft delete user_profiles (keep ID, anonymize fields)
        await supabase.from('user_profiles').update({
            full_name: 'Deleted User',
            email: `deleted-${user.id}@deleted.local`,
            phone: null,
            location: null,
            linkedin_url: null,
            portfolio_url: null,
            avatar_url: null,
            deleted_at: new Date().toISOString()
        }).eq('id', user.id)

        // Step 3: Soft delete auth user to revoke access
        await supabase.auth.admin.deleteUser(user.id, true)

        // Log successful deletion
        await supabase.from('deletion_logs').insert({
            deleted_user_id: user.id,
            reason: 'User requested',
            success: true
        })

        return new Response(JSON.stringify({ message: 'Account deleted successfully' }), {
            status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
})

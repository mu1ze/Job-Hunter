import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface JobAlert {
  id: string
  user_id: string
  title: string
  keywords?: string[]
  location?: string
  min_salary?: number
  remote_only?: boolean
  notification_frequency: string
  last_sent_at?: string
}

interface UserProfile {
  id: string
  email: string
  full_name?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    const ADZUNA_APP_ID = Deno.env.get('ADZUNA_APP_ID')
    const ADZUNA_API_KEY = Deno.env.get('ADZUNA_API_KEY')
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    if (!RESEND_API_KEY || !ADZUNA_APP_ID || !ADZUNA_API_KEY) {
      throw new Error('Missing required API keys')
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Get all active alerts that need to be sent
    const { data: alerts, error: alertsError } = await supabase
      .from('job_alerts')
      .select('*')
      .eq('is_active', true)

    if (alertsError) throw alertsError

    if (!alerts || alerts.length === 0) {
      return new Response(JSON.stringify({ message: 'No active alerts' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    let emailsSent = 0

    // Process each alert
    for (const alert of alerts as JobAlert[]) {
      // Check if alert should be sent based on frequency
      const now = new Date()
      const lastSent = alert.last_sent_at ? new Date(alert.last_sent_at) : null
      
      let shouldSend = false
      if (alert.notification_frequency === 'daily') {
        shouldSend = !lastSent || (now.getTime() - lastSent.getTime()) >= 24 * 60 * 60 * 1000
      } else if (alert.notification_frequency === 'weekly') {
        shouldSend = !lastSent || (now.getTime() - lastSent.getTime()) >= 7 * 24 * 60 * 60 * 1000
      }

      if (!shouldSend) continue

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', alert.user_id)
        .single()

      if (!profile || !profile.email) continue

      // Search for matching jobs using Adzuna
      const searchParams = new URLSearchParams({
        app_id: ADZUNA_APP_ID,
        app_key: ADZUNA_API_KEY,
        results_per_page: '10',
        what: alert.keywords?.join(' ') || '',
        where: alert.location || '',
        content_type: 'application/json'
      })

      if (alert.min_salary) {
        searchParams.set('salary_min', alert.min_salary.toString())
      }
      if (alert.remote_only) {
        searchParams.set('is_remote', '1')
      }

      const adzunaUrl = `https://api.adzuna.com/v1/api/jobs/us/search/1?${searchParams.toString()}`
      const jobsResponse = await fetch(adzunaUrl)
      const jobsData = await jobsResponse.json()

      if (!jobsData.results || jobsData.results.length === 0) continue

      // Build email HTML
      const emailHtml = generateEmailHtml(profile.full_name || 'there', alert.title, jobsData.results)

      // Send email via Resend
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Job Hunter <alerts@jobhunter.com>',
          to: profile.email,
          subject: `🎯 ${jobsData.results.length} New Jobs: ${alert.title}`,
          html: emailHtml
        })
      })

      if (emailResponse.ok) {
        // Update last_sent_at
        await supabase
          .from('job_alerts')
          .update({ last_sent_at: now.toISOString() })
          .eq('id', alert.id)

        emailsSent++
      }
    }

    return new Response(JSON.stringify({ 
      message: 'Job alerts sent successfully',
      emailsSent 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})

function generateEmailHtml(userName: string, alertTitle: string, jobs: any[]): string {
  const jobCards = jobs.map(job => `
    <div style="background: #f8f9fa; padding: 20px; margin: 15px 0; border-radius: 12px; border-left: 4px solid #3b82f6;">
      <h3 style="margin: 0 0 8px 0; font-size: 18px; color: #1a1a1a;">${job.title}</h3>
      <p style="margin: 4px 0; color: #666; font-size: 14px;">${job.company.display_name}</p>
      <p style="margin: 4px 0; color: #10b981; font-weight: bold; font-size: 14px;">
        ${job.salary_min && job.salary_max ? `$${Math.round(job.salary_min/1000)}k - $${Math.round(job.salary_max/1000)}k` : 'Salary not disclosed'}
      </p>
      <p style="margin: 12px 0; color: #444; font-size: 14px; line-height: 1.5;">
        ${job.description.replace(/<\/?[^>]+(>|$)/g, "").slice(0, 200)}...
      </p>
      <a href="${job.redirect_url}" style="display: inline-block; background: #3b82f6; color: white; padding: 10px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">Apply Now</a>
    </div>
  `).join('')

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #3b82f6; margin: 0; font-size: 28px;">🎯 New Job Matches</h1>
  </div>
  
  <p style="font-size: 16px; color: #444;">Hi ${userName},</p>
  
  <p style="font-size: 16px; color: #444;">
    We found <strong>${jobs.length} new jobs</strong> matching your alert "<strong>${alertTitle}</strong>":
  </p>
  
  ${jobCards}
  
  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #666; font-size: 14px;">
    <p>
      <a href="https://your-app-url.com/alerts" style="color: #3b82f6; text-decoration: none;">Manage your alerts</a> |
      <a href="https://your-app-url.com/tracker" style="color: #3b82f6; text-decoration: none;">View tracker</a>
    </p>
    <p style="margin-top: 10px; color: #999; font-size: 12px;">
      You're receiving this because you set up a job alert. To stop receiving these emails, you can deactivate this alert in your settings.
    </p>
  </div>
</body>
</html>
  `
}

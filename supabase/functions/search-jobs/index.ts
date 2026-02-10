import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    const ADZUNA_APP_ID = Deno.env.get('ADZUNA_APP_ID')
    const ADZUNA_API_KEY = Deno.env.get('ADZUNA_API_KEY')

    if (!ADZUNA_APP_ID || !ADZUNA_API_KEY) {
      throw new Error('Adzuna credentials not configured in Edge Function secrets')
    }

    const { query, location, radius, salary_min, salary_max, remote_only } = await req.json()

    const baseUrl = 'https://api.adzuna.com/v1/api/jobs/us/search/1'
    const url = new URL(baseUrl)
    url.searchParams.set('app_id', ADZUNA_APP_ID)
    url.searchParams.set('app_key', ADZUNA_API_KEY)
    url.searchParams.set('results_per_page', '20')
    url.searchParams.set('content_type', 'application/json')
    
    if (query) url.searchParams.set('what', query)
    if (location) url.searchParams.set('where', location)
    if (radius) url.searchParams.set('distance', radius.toString())
    if (salary_min) url.searchParams.set('salary_min', salary_min.toString())
    if (salary_max) url.searchParams.set('salary_max', salary_max.toString())
    if (remote_only) url.searchParams.set('is_remote', '1')

    const response = await fetch(url.toString())
    const data = await response.json()

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: response.status,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY')
    if (!GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY not configured')
    }

    const { resumeData, jobDescription } = await req.json()

    if (!resumeData || !jobDescription) {
      throw new Error('Resume data and job description are required')
    }

    // Call Groq API to analyze ATS compatibility
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are an ATS (Applicant Tracking System) analyzer. Analyze how well a resume matches a job description.

Return valid JSON with this exact structure:
{
  "ats_score": 85,
  "matched_keywords": ["keyword1", "keyword2", ...],
  "missing_keywords": ["keyword1", "keyword2", ...],
  "recommendations": [
    "Specific actionable recommendation 1",
    "Specific actionable recommendation 2",
    ...
  ]
}

The ATS score should be 0-100 based on:
- Keyword match rate (40%)
- Skills alignment (30%)
- Experience relevance (20%)
- Education/certifications match (10%)

Be thorough and provide actionable insights.`
          },
          {
            role: 'user',
            content: `Job Description:
${jobDescription}

Resume Data:
Summary: ${resumeData.summary || 'Not provided'}
Skills: ${resumeData.extracted_skills?.join(', ') || 'Not provided'}
Work Experience: ${JSON.stringify(resumeData.work_experience || [])}
Education: ${JSON.stringify(resumeData.education || [])}
Certifications: ${resumeData.certifications?.join(', ') || 'None'}

Analyze the ATS compatibility and provide a score with recommendations.`
          }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      })
    })

    if (!groqResponse.ok) {
      const error = await groqResponse.text()
      throw new Error(`Groq API error: ${error}`)
    }

    const groqData = await groqResponse.json()
    const analysis = JSON.parse(groqData.choices[0].message.content)

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error calculating ATS score:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

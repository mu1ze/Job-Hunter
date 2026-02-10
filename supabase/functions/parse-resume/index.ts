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

    const { resumeText } = await req.json()

    if (!resumeText) {
      throw new Error('Resume text is required')
    }

    // Call Groq API to parse resume
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
            content: `You are an expert resume parser. Extract structured information from resumes and return it as valid JSON.
            
Return the following structure:
{
  "summary": "Brief professional summary (2-3 sentences)",
  "extracted_skills": ["skill1", "skill2", ...],
  "work_experience": [
    {
      "company": "Company Name",
      "title": "Job Title",
      "location": "City, State",
      "start_date": "YYYY-MM",
      "end_date": "YYYY-MM" or null if current,
      "is_current": boolean,
      "description": "Brief role description",
      "achievements": ["achievement1", "achievement2", ...]
    }
  ],
  "education": [
    {
      "institution": "School Name",
      "degree": "Degree Type",
      "field_of_study": "Major/Field",
      "start_date": "YYYY-MM",
      "end_date": "YYYY-MM",
      "gpa": "3.8" or null
    }
  ],
  "certifications": ["cert1", "cert2", ...]
}

Be thorough and accurate. Extract all relevant information.`
          },
          {
            role: 'user',
            content: `Parse this resume and extract all information:\n\n${resumeText}`
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
    const parsedData = JSON.parse(groqData.choices[0].message.content)

    return new Response(JSON.stringify(parsedData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error parsing resume:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

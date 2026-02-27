import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        Authorization: authHeader,
        apikey: supabaseKey,
      },
    });

    if (!userResponse.ok) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        },
      );
    }

    const user = await userResponse.json();

    const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY')
    if (!GROQ_API_KEY) {
      return new Response(JSON.stringify({ error: 'GROQ_API_KEY not configured' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    const { resumeText } = await req.json()

    if (!resumeText || resumeText.length < 5) {
      return new Response(JSON.stringify({ error: 'No resume text provided or text too short.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // Sanitize input: Remove non-printable characters and junk that breaks prompts
    const cleanText = resumeText.replace(/[^\x20-\x7E\n\r\t]/g, ' ').substring(0, 10000)

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are a resume parser. Extract information and return it as a structured JSON object. 
            
Important: Return ONLY the JSON object. Do not include markdown formatting or backticks.
Schema:
{
  "summary": "string",
  "extracted_skills": ["string"],
  "work_experience": [{"company": "string", "title": "string", "location": "string", "start_date": "string", "end_date": "string", "is_current": boolean, "description": "string", "achievements": ["string"]}],
  "education": [{"institution": "string", "degree": "string", "field_of_study": "string", "start_date": "string", "end_date": "string", "gpa": "string"}],
  "certifications": ["string"]
}`
          },
          {
            role: 'user',
            content: `Parse this resume text:\n\n${cleanText}`
          }
        ],
        temperature: 0,
        // Disabling explicit json_object mode to prevent 400 errors from the API itself
        // We will parse the response text manually.
      })
    })

    const responseText = await groqResponse.text()

    if (!groqResponse.ok) {
        return new Response(JSON.stringify({ error: `Groq API error: ${responseText}` }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })
    }

    const groqData = JSON.parse(responseText)
    let content = groqData.choices[0].message.content.trim()

    // Robust cleaning for markdown backticks
    if (content.includes('```')) {
      // Find the first { and the last }
      const start = content.indexOf('{')
      const end = content.lastIndexOf('}')
      if (start !== -1 && end !== -1) {
        content = content.substring(start, end + 1)
      }
    }

    try {
      const parsedData = JSON.parse(content)
      return new Response(JSON.stringify(parsedData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    } catch (e) {
      console.error('Failed to parse content as JSON:', content)
      return new Response(JSON.stringify({ 
        error: 'AI returned invalid JSON format. Please try again.',
        debug: content.substring(0, 100) 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  }
})

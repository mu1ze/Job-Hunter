import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
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

    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY not configured");
    }

    const { resumeData, jobDescription, documentType, focusKeywords } =
      await req.json();

    if (!resumeData || !jobDescription || !documentType) {
      throw new Error(
        "Resume data, job description, and document type are required",
      );
    }

    let systemPrompt = "";
    let userPrompt = "";

    const focusInstruction = focusKeywords && focusKeywords.length > 0
      ? `\n\nCRITICAL: You MUST specifically incorporate and highlight these missing keywords to improve ATS score: ${
        focusKeywords.join(", ")
      }. Aim for a compatibility score of at least 92% by ensuring these terms are used naturally and strategically in the context of the candidate's experience.`
      : "";

    if (documentType === "resume") {
      systemPrompt =
        `You are an expert ATS resume optimizer. Create a tailored resume that matches the job description while showcasing the candidate's relevant experience and skills.
      
Guidelines:
- Highlight skills and experience that match the job requirements
- Use keywords from the job description naturally
- Quantify achievements where possible
- Keep it concise and ATS-friendly
- Maintain professional tone
- Format in clean, structured sections${focusInstruction}

Return ONLY the resume content as plain text, properly formatted with sections.`;

      userPrompt = `Job Description:
${jobDescription}

Candidate's Information:
Summary: ${resumeData.summary || "Not provided"}
Skills: ${resumeData.extracted_skills?.join(", ") || "Not provided"}
Work Experience: ${JSON.stringify(resumeData.work_experience || [])}
Education: ${JSON.stringify(resumeData.education || [])}
Certifications: ${resumeData.certifications?.join(", ") || "None"}

Create an optimized resume tailored to this job.`;
    } else if (documentType === "cover_letter") {
      systemPrompt =
        `You are an expert cover letter writer. Create a compelling, personalized cover letter that connects the candidate's experience to the job requirements.

Guidelines:
- Open with enthusiasm for the specific role and company
- Highlight 2-3 relevant achievements that match the job
- Show cultural fit and genuine interest
- Keep it concise (3-4 paragraphs)
- Professional yet personable tone
- Include a strong call to action${focusInstruction}

Return ONLY the cover letter content as plain text.`;

      userPrompt = `Job Description:
${jobDescription}

Candidate's Information:
Summary: ${resumeData.summary || "Not provided"}
Skills: ${resumeData.extracted_skills?.join(", ") || "Not provided"}
Recent Experience: ${JSON.stringify(resumeData.work_experience?.[0] || {})}
Education: ${JSON.stringify(resumeData.education?.[0] || {})}

Create a personalized cover letter for this job.`;
    }

    // Call Groq API
    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: userPrompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      },
    );

    if (!groqResponse.ok) {
      const error = await groqResponse.text();
      throw new Error(`Groq API error: ${error}`);
    }

    const groqData = await groqResponse.json();
    const generatedContent = groqData.choices[0].message.content;

    return new Response(JSON.stringify({ content: generatedContent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error generating document:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});

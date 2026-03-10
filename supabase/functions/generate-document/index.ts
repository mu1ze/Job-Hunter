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
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        Authorization: authHeader,
        apikey: supabaseAnonKey,
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
        `You are an expert ATS resume optimizer specializing in Northern Ontario professional standards. Create a tailored, high-fidelity resume that follows these specific regional guidelines:
      
Guidelines:
- **FORMAT**: Use a strict reverse-chronological format.
- **HEADER**: Create a clear, modern contact header.
- **STYLE**: Maintain a clean, professional, and sophisticated layout.
- **ALIGNMENT**: Ensure perfect left-alignment for all bullet points and text blocks.
- **KEYWORDS**: Strategically use industry-specific keywords from the job description (Mining, Forestry, Health, Education, or Tech) to pass through modern ATS.
- **BILINGUALism**: If the candidate mentions French proficiency, highlight it as a key asset.
- **TONE**: Use an achievement-oriented, professional tone.
- **SECTIONS**: Use standard professional sections: Summary, Skills, Work Experience, Education, and Certifications.${focusInstruction}

Return ONLY the resume content as plain text, formatted with clear section headers.`;

      userPrompt = `Job Description:
${jobDescription}

Candidate's Information:
Summary: ${resumeData.summary || "Not provided"}
Skills: ${resumeData.extracted_skills?.join(", ") || "Not provided"}
Work Experience: ${JSON.stringify(resumeData.work_experience || [])}
Education: ${JSON.stringify(resumeData.education || [])}
Certifications: ${resumeData.certifications?.join(", ") || "None"}

Create an optimized, Northern Ontario standard resume tailored to this job.`;
    } else if (documentType === "cover_letter") {
      systemPrompt =
        `You are an expert cover letter writer specializing in the Northern Ontario job market. Create a compelling, professional cover letter that follows these regional standards:

Guidelines:
- **FIRST PARAGRAPH**: Open with genuine enthusiasm for the role and specific mention of the company. State exactly which position you are applying for.
- **BODY**: Highlight 2-3 specific achievements related to northern industry values like reliability, safety, innovation, or community impact.
- **LOCAL CONNECTION**: If applicable, frame the candidate as someone committed to contributing to Northern Ontario's economy.
- **TONE**: Direct, humble yet confident, and highly professional.
- **LENGTH**: Keep it strictly to 3-4 concise paragraphs.
- **CALL TO ACTION**: End with a confident request for an interview and a professional sign-off.${focusInstruction}

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

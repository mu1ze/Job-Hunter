import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY not configured");
    }

    const { resumeData, jobDescription, rawText } = await req.json();

    if ((!resumeData && !rawText) || !jobDescription) {
      throw new Error(
        "Resume data (or raw text) and job description are required",
      );
    }

    // Call Groq API to analyze ATS compatibility
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
              content:
                `You are an ATS (Applicant Tracking System) analyzer. Analyze how well a document (resume or cover letter) matches a job description.

Return valid JSON with this exact structure:
{
  "ats_score": 85,
  "breakdown": {
    "keywords": 90,
    "skills": 85,
    "experience": 70,
    "education": 100
  },
  "matched_keywords": ["keyword1", "keyword2", ...],
  "missing_keywords": ["keyword1", "keyword2", ...],
  "recommendations": [
    "Specific actionable recommendation 1",
    "Specific actionable recommendation 2",
    ...
  ],
  "improvement_plan": {
    "certificates": [
      { "name": "AWS Certified Solutions Architect", "description": "Crucial for this cloud-heavy role", "priority": "High" }
    ],
    "stepping_stone_roles": [
      { "title": "Cloud Support Associate", "reason": "Builds the foundational infrastructure knowledge required" }
    ]
  }
}

The ATS score should be a weighted average of:
- Keywords (40%): Presence of exact and related terms from JD.
- Skills (30%): Alignment of hard and soft skills.
- Experience (20%): Relevance of roles, years of experience, and achievements.
- Education (10%): Match with required degrees and certifications.

For the improvement_plan:
- Certificates: Suggest 2-3 most relevant, industry-recognized certifications that would bridge the current skill gap for this specific role.
- Stepping stone roles: If the candidate is under-qualified, suggest 2-3 entry-level or junior roles that lead to this target position.
To achieve a 99% score, the document must be nearly identical in keyword density and skill profile to the ideal candidate description. Be extremely rigorous in your scoring. If experience doesn't match the level (e.g. asking for Senior, having Junior), penalize the experience score heavily.`,
            },
            {
              role: "user",
              content: rawText
                ? `Job Description:
${jobDescription}

Document Content:
${rawText}

Analyze the ATS compatibility of this document and provide a score with recommendations.`
                : `Job Description:
${jobDescription}

Resume Data:
Summary: ${resumeData.summary || "Not provided"}
Skills: ${resumeData.extracted_skills?.join(", ") || "Not provided"}
Work Experience: ${JSON.stringify(resumeData.work_experience || [])}
Education: ${JSON.stringify(resumeData.education || [])}
Certifications: ${resumeData.certifications?.join(", ") || "None"}

Analyze the ATS compatibility and provide a score with recommendations.`,
            },
          ],
          temperature: 0.3,
          response_format: { type: "json_object" },
        }),
      },
    );

    if (!groqResponse.ok) {
      const error = await groqResponse.text();
      throw new Error(`Groq API error: ${error}`);
    }

    const groqData = await groqResponse.json();
    const analysis = JSON.parse(groqData.choices[0].message.content);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error calculating ATS score:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});

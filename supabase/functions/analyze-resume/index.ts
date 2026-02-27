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
        const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");

        if (!GROQ_API_KEY || !PERPLEXITY_API_KEY) {
            return new Response(
                JSON.stringify({
                    error:
                        "API keys not configured. Ensure GROQ_API_KEY and PERPLEXITY_API_KEY are set.",
                }),
                {
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                    status: 200,
                },
            );
        }

        const { resumeText, currentRole } = await req.json();

        if (!resumeText) {
            return new Response(
                JSON.stringify({ error: "Resume text is required" }),
                {
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                    status: 400,
                },
            );
        }

        // --- Parallel Execution ---

        // 1. Groq: Strategic Analysis (Internal logic)
        const groqPromise = fetch(
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
                                `You are a senior career coach. Analyze the user's resume text and provide strategic advice.
            Return a JSON object with this schema:
            {
              "recommended_roles": ["Role Title 1", "Role Title 2", "Role Title 3"],
              "skill_gaps": ["Skill 1", "Skill 2"],
              "strengths": ["Strength 1", "Strength 2"],
              "readiness_score": 0-100
            }
            Do not include markdown formatting.`,
                        },
                        {
                            role: "user",
                            content: `Resume: ${resumeText.substring(0, 6000)}`,
                        },
                    ],
                    temperature: 0.1,
                    response_format: { type: "json_object" },
                }),
            },
        ).then((res) => res.json());

        // 2. Perplexity: External Market Data (Live search)
        // We need a query based on the current role or resume
        const perplexityQuery =
            `Best certifications and interview trends for a ${
                currentRole || "software engineer"
            } in 2024. Include links to top 3 certifications.`;

        const perplexityPromise = fetch(
            "https://api.perplexity.ai/chat/completions",
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${PERPLEXITY_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "sonar-pro",
                    messages: [
                        {
                            role: "system",
                            content: "You are a helpful career researcher.",
                        },
                        { role: "user", content: perplexityQuery },
                    ],
                    temperature: 0.2,
                }),
            },
        ).then((res) => res.json());

        // Wait for both
        const [groqData, perplexityData] = await Promise.all([
            groqPromise,
            perplexityPromise,
        ]);

        // Parse Groq JSON
        let analysis = {};
        try {
            let content = groqData.choices[0].message.content;
            // Clean markdown code blocks if present
            if (content.includes("```")) {
                const start = content.indexOf("{");
                const end = content.lastIndexOf("}");
                if (start !== -1 && end !== -1) {
                    content = content.substring(start, end + 1);
                }
            }
            analysis = JSON.parse(content);
        } catch (e) {
            console.error("Groq JSON parse error", e);
            console.error(
                "Raw content:",
                groqData.choices?.[0]?.message?.content,
            );
            analysis = {
                error: "Failed to parse analysis",
                raw: groqData.choices?.[0]?.message?.content,
            };
        }

        // Extract Perplexity Content
        const marketInsights = perplexityData.choices?.[0]?.message?.content ||
            "No market insights available.";

        return new Response(
            JSON.stringify({
                analysis,
                marketInsights,
            }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            },
        );
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
        });
    }
});

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

        const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");

        if (!PERPLEXITY_API_KEY) {
            return new Response(
                JSON.stringify({
                    error: "Perplexity API key not configured",
                    content: "",
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

        const { companyName, context } = await req.json();

        if (!companyName) {
            return new Response(
                JSON.stringify({ error: "Company name is required" }),
                {
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                    status: 400,
                },
            );
        }

        const prompt = `
    Analyze the company "${companyName}" ${
            context ? `(Context: ${context})` : ""
        } for a potential job applicant. 
    Provide a detailed report in Markdown format covering:
    1. **Company Overview**: Brief history and mission.
    2. **Work Culture**: What employees say about work-life balance, management, and values.
    3. **Recent News**: Any major recent events, funding, or layoffs.
    4. **Interview Process**: Common questions and what to expect.
    5. **Red Flags**: Any potential concerns for applicants.
    
    Keep it concise but informative. Use bullet points.
    `;

        const response = await fetch(
            "https://api.perplexity.ai/chat/completions",
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${PERPLEXITY_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "sonar-pro", // Using users Pro account model
                    messages: [
                        {
                            role: "system",
                            content:
                                "You are a helpful career advisor and company analyst.",
                        },
                        { role: "user", content: prompt },
                    ],
                    temperature: 0.2,
                }),
            },
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("Perplexity API Error:", data);
            throw new Error(
                data.error?.message || "Failed to fetch from Perplexity",
            );
        }

        return new Response(
            JSON.stringify({
                content: data.choices[0].message.content,
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

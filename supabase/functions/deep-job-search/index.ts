import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
};

interface JobListing {
    id: string;
    title: string;
    company: { display_name: string };
    location: { display_name: string; area: string[] };
    description: string;
    contract_time?: string;
    contract_type?: string;
    redirect_url: string;
    salary_min?: number;
    salary_max?: number;
    created: string;
    __match_score?: number;
    __match_reason?: string;
}

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const ADZUNA_APP_ID = Deno.env.get("ADZUNA_APP_ID");
        const ADZUNA_API_KEY = Deno.env.get("ADZUNA_API_KEY");
        const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");

        if (!ADZUNA_APP_ID || !ADZUNA_API_KEY || !GROQ_API_KEY) {
            return new Response(
                JSON.stringify({
                    error: "Missing API credentials (ADZUNA or GROQ)",
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

        const {
            resumeText,
            preferences,
            filters,
        } = await req.json();

        if (!resumeText) {
            return new Response(
                JSON.stringify({ error: "Resume text required" }),
                {
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                    status: 200,
                },
            );
        }

        // --- Step 1: Generate Smart Queries with LLM ---
        const queryGenSystemPrompt = `You are a professional recruiter. 
    Analyze the candidate's resume summary and preferences to generate 3 DISTINCT, targeted search queries for finding relevant jobs.
    
    The queries should cover:
    1. A direct role match
    2. A technical skill-based match
    3. An industry/creative role variation
    
    Return ONLY a JSON array of strings, e.g., ["Senior React Developer", "Frontend Engineer Typescript", "UI Engineer FinTech"].`;

        const queryGenUserPrompt = `
    Resume Summary/Skills: ${resumeText.substring(0, 500)}...
    Preferences: ${JSON.stringify(preferences)}
    Base Query: ${filters.query || "Not specified"}
    Location: ${filters.location || "Not specified"}
    `;

        const groqQueryResponse = await fetch(
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
                        { role: "system", content: queryGenSystemPrompt },
                        { role: "user", content: queryGenUserPrompt },
                    ],
                    temperature: 0.3,
                }),
            },
        );

        const queryData = await groqQueryResponse.json();
        let generatedQueries: string[] = [];
        try {
            const content = queryData.choices[0].message.content;
            const cleanContent = content.substring(
                content.indexOf("["),
                content.lastIndexOf("]") + 1,
            );
            generatedQueries = JSON.parse(cleanContent);
        } catch (e) {
            console.error("Failed to parse generated queries", e);
            generatedQueries = [
                filters.query || "Software Engineer",
                "Developer",
            ];
        }

        console.log("Generated Deep Search Queries:", generatedQueries);

        // --- Step 2: Parallel Adzuna Search ---
        const country = filters.country || "us";
        const adzunaBaseUrl =
            `https://api.adzuna.com/v1/api/jobs/${country}/search/1`;

        const fetchJobsForQuery = async (query: string) => {
            const url = new URL(adzunaBaseUrl);
            url.searchParams.set("app_id", ADZUNA_APP_ID);
            url.searchParams.set("app_key", ADZUNA_API_KEY);
            url.searchParams.set("results_per_page", "10"); // Fetch fewer per query to keep it fast
            url.searchParams.set("content-type", "application/json");
            url.searchParams.set("what", query);
            if (filters.location) {
                url.searchParams.set("where", filters.location);
            }
            if (filters.remote_only) {
                url.searchParams.set("what", `${query} remote`);
            }
            if (filters.salary_min) {
                url.searchParams.set("salary_min", String(filters.salary_min));
            }

            try {
                const res = await fetch(url.toString());
                const data = await res.json();
                return (data.results || []) as JobListing[];
            } catch (e) {
                console.error(`Search failed for query "${query}":`, e);
                return [];
            }
        };

        const searchPromises = generatedQueries.map((q) =>
            fetchJobsForQuery(q)
        );
        const searchResults = await Promise.all(searchPromises);

        // Flatten and Deduplicate
        const allJobs = searchResults.flat();
        const seenIds = new Set();
        const uniqueJobs: JobListing[] = [];

        for (const job of allJobs) {
            if (!seenIds.has(job.id)) {
                seenIds.add(job.id);
                uniqueJobs.push(job);
            }
        }

        // Limit to top 15 for ranking to save tokens/time
        const topJobs = uniqueJobs.slice(0, 15);

        // --- Step 3: LLM Ranking (Rescoring) ---
        // We'll send a simplified list to the LLM
        const jobsForRanking = topJobs.map((j) => ({
            id: j.id,
            title: j.title,
            company: j.company.display_name,
            description_snippet: j.description.substring(0, 300),
        }));

        const rankingSystemPrompt =
            `You are a career coach. Rank these jobs for the candidate based on semantic fit.
    Return a JSON object where keys are job IDs and values are objects with "score" (0-100) and "reason" (short string).
    
    Example:
    {
      "123": { "score": 95, "reason": "Perfect skill match for React/Node" },
      "456": { "score": 60, "reason": "Requires Python which is missing" }
    }`;

        const rankingUserPrompt = `
    Candidate Resume: ${resumeText.substring(0, 1000)}...
    
    Jobs to Rank:
    ${JSON.stringify(jobsForRanking)}
    `;

        const groqRankingResponse = await fetch(
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
                        { role: "system", content: rankingSystemPrompt },
                        { role: "user", content: rankingUserPrompt },
                    ],
                    temperature: 0.2,
                }),
            },
        );

        const rankingData = await groqRankingResponse.json();
        let rankings: Record<string, { score: number; reason: string }> = {};

        try {
            const content = rankingData.choices[0].message.content;
            const cleanContent = content.substring(
                content.indexOf("{"),
                content.lastIndexOf("}") + 1,
            );
            rankings = JSON.parse(cleanContent);
        } catch (e) {
            console.error("Failed to parse rankings", e);
        }

        // Apply rankings
        const rankedJobs = topJobs.map((job) => ({
            ...job,
            __match_score: rankings[job.id]?.score || 0,
            __match_reason: rankings[job.id]?.reason || "Analysis unavailable",
        })).sort((a, b) => (b.__match_score || 0) - (a.__match_score || 0));

        return new Response(
            JSON.stringify({
                results: rankedJobs,
                count: rankedJobs.length,
                queries_used: generatedQueries,
            }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            },
        );
    } catch (error) {
        console.error("Deep Search Error:", error);
        return new Response(
            JSON.stringify({
                error: error.message || "Internal Server Error",
            }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            },
        );
    }
});

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
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

    const ADZUNA_APP_ID = Deno.env.get("ADZUNA_APP_ID");
    const ADZUNA_API_KEY = Deno.env.get("ADZUNA_API_KEY");

    if (!ADZUNA_APP_ID || !ADZUNA_API_KEY) {
      console.error(
        "Missing credentials - ADZUNA_APP_ID:",
        !!ADZUNA_APP_ID,
        "ADZUNA_API_KEY:",
        !!ADZUNA_API_KEY,
      );
      return new Response(
        JSON.stringify({
          error:
            "Adzuna credentials not configured. Please set ADZUNA_APP_ID and ADZUNA_API_KEY as Edge Function secrets.",
          results: [],
          count: 0,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200, // Return 200 so the client can read the error message
        },
      );
    }

    const body = await req.json();
    const {
      query,
      location,
      radius,
      salary_min,
      salary_max,
      remote_only,
      country = "us",
    } = body;

    console.log(
      "Search request:",
      JSON.stringify({ query, location, radius, remote_only, country }),
    );

    const baseUrl = `https://api.adzuna.com/v1/api/jobs/${country}/search/1`;
    const url = new URL(baseUrl);
    url.searchParams.set("app_id", ADZUNA_APP_ID);
    url.searchParams.set("app_key", ADZUNA_API_KEY);
    url.searchParams.set("results_per_page", "20");
    url.searchParams.set("content-type", "application/json");

    if (query) url.searchParams.set("what", query);
    if (location) url.searchParams.set("where", location);
    if (radius) url.searchParams.set("distance", radius.toString());
    if (salary_min) url.searchParams.set("salary_min", salary_min.toString());
    if (salary_max) url.searchParams.set("salary_max", salary_max.toString());
    if (remote_only) {
      url.searchParams.set("what", query ? `${query} remote` : "remote");
    }

    // Debug: log URL with masked credentials
    const logUrl = new URL(url.toString());
    logUrl.searchParams.set("app_id", `MASKED(len:${ADZUNA_APP_ID.length})`);
    logUrl.searchParams.set("app_key", `MASKED(len:${ADZUNA_API_KEY.length})`);
    console.log("Adzuna request URL:", logUrl.toString());

    const response = await fetch(url.toString());
    const responseText = await response.text();

    if (!response.ok) {
      console.error(
        "Adzuna API error:",
        response.status,
        responseText.substring(0, 500),
      );

      // Return a helpful error but with 200 status so client can read it
      return new Response(
        JSON.stringify({
          error:
            `Adzuna API error (${response.status}). This usually means invalid API credentials. Please verify your ADZUNA_APP_ID and ADZUNA_API_KEY secrets.`,
          details: responseText.substring(0, 200),
          results: [],
          count: 0,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      );
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (_e) {
      console.error(
        "Failed to parse Adzuna response:",
        responseText.substring(0, 500),
      );
      return new Response(
        JSON.stringify({
          error: "Invalid response from Adzuna API",
          results: [],
          count: 0,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      );
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Edge function error:", error.message);
    return new Response(
      JSON.stringify({
        error: error.message,
        results: [],
        count: 0,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200, // Return 200 so client can read error
      },
    );
  }
});

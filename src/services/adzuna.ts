import { supabase } from "../lib/supabase";
import type { JobListing, JobSearchFilters } from "../types";

export const adzunaService = {
    async searchJobs(
        filters: JobSearchFilters,
    ): Promise<{ results: JobListing[]; count: number }> {
        try {
            const { data, error } = await supabase.functions.invoke(
                "search-jobs",
                {
                    body: { ...filters, country: filters.country || "us" },
                },
            );

            if (error) {
                console.error("Supabase function invoke error:", error);
                throw new Error(
                    error.message || "Failed to call search function",
                );
            }

            // Check if the edge function returned an error in the body
            if (data?.error) {
                console.error("Search API error:", data.error);
                throw new Error(data.error);
            }

            // Validate response has results
            if (!data?.results || !Array.isArray(data.results)) {
                console.warn("Unexpected API response format:", data);
                return { results: [], count: 0 };
            }

            const results: JobListing[] = data.results.map((job: any) => ({
                id: String(job.id),
                external_job_id: `adzuna-${job.id}`,
                title: (job.title || "").replace(/<\/?[^>]+(>|$)/g, ""),
                company: job.company?.display_name || "Unknown Company",
                location: job.location?.display_name ||
                    "Location not specified",
                salary_min: job.salary_min,
                salary_max: job.salary_max,
                salary_range: job.salary_min && job.salary_max
                    ? `$${Math.round(job.salary_min / 1000)}k - $${
                        Math.round(job.salary_max / 1000)
                    }k`
                    : job.salary_min
                    ? `$${Math.round(job.salary_min / 1000)}k+`
                    : "Salary not disclosed",
                job_url: job.redirect_url,
                description: (job.description || "").replace(
                    /<\/?[^>]+(>|$)/g,
                    "",
                ),
                requirements: [],
                skills_required: [],
                posted_at: job.created,
                source: "adzuna",
                remote: !!(job.location?.area || []).find((a: string) =>
                    a.toLowerCase().includes("remote")
                ),
                job_type: job.contract_time === "full_time"
                    ? "full-time"
                    : "part-time",
            }));

            return {
                results,
                count: data.count || results.length,
            };
        } catch (error: any) {
            console.error("Error fetching jobs from Edge Function:", error);
            throw error;
        }
    },

    async deepSearchJobs(
        filters: JobSearchFilters,
        resumeText: string,
        preferences: any,
    ): Promise<
        { results: JobListing[]; count: number; queries_used?: string[] }
    > {
        try {
            const { data, error } = await supabase.functions.invoke(
                "deep-job-search",
                {
                    body: {
                        filters: {
                            ...filters,
                            country: filters.country || "us",
                        },
                        resumeText,
                        preferences,
                    },
                },
            );

            if (error) {
                console.error("Supabase function invoke error:", error);
                throw new Error(
                    error.message || "Failed to call deep search function",
                );
            }

            if (data?.error) {
                console.error("Deep Search API error:", data.error);
                throw new Error(data.error);
            }

            // Map results similar to searchJobs, but preserve match data
            const results: JobListing[] = (data.results || []).map((
                job: any,
            ) => ({
                id: String(job.id),
                external_job_id: `adzuna-${job.id}`,
                title: (job.title || "").replace(/<\/?[^>]+(>|$)/g, ""),
                company: job.company?.display_name || "Unknown Company",
                location: job.location?.display_name ||
                    "Location not specified",
                salary_min: job.salary_min,
                salary_max: job.salary_max,
                salary_range: job.salary_min && job.salary_max
                    ? `$${Math.round(job.salary_min / 1000)}k - $${
                        Math.round(job.salary_max / 1000)
                    }k`
                    : job.salary_min
                    ? `$${Math.round(job.salary_min / 1000)}k+`
                    : "Salary not disclosed",
                job_url: job.redirect_url,
                description: (job.description || "").replace(
                    /<\/?[^>]+(>|$)/g,
                    "",
                ),
                requirements: [],
                skills_required: [],
                posted_at: job.created,
                source: "adzuna",
                remote: !!(job.location?.area || []).find((a: string) =>
                    a.toLowerCase().includes("remote")
                ),
                job_type: job.contract_time === "full_time"
                    ? "full-time"
                    : "part-time",
                __match_score: job.__match_score,
                __match_reason: job.__match_reason,
            }));

            return {
                results,
                count: data.count || results.length,
                queries_used: data.queries_used,
            };
        } catch (error: any) {
            console.error("Error performing deep search:", error);
            throw error;
        }
    },
};

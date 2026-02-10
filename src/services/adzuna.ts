import { supabase } from '../lib/supabase'
import type { JobListing, JobSearchFilters } from '../types'

export const adzunaService = {
    async searchJobs(filters: JobSearchFilters): Promise<{ results: JobListing[], count: number }> {
        try {
            const { data, error } = await supabase.functions.invoke('search-jobs', {
                body: filters
            })

            if (error) throw error

            const results: JobListing[] = data.results.map((job: any) => ({
                id: job.id,
                external_job_id: `adzuna-${job.id}`,
                title: job.title.replace(/<\/?[^>]+(>|$)/g, ""), // Strip HTML tags
                company: job.company.display_name,
                location: job.location.display_name,
                salary_min: job.salary_min,
                salary_max: job.salary_max,
                salary_range: job.salary_min && job.salary_max 
                    ? `$${Math.round(job.salary_min/1000)}k - $${Math.round(job.salary_max/1000)}k`
                    : job.salary_min ? `$${Math.round(job.salary_min/1000)}k+` : 'Salary not disclosed',
                job_url: job.redirect_url,
                description: job.description.replace(/<\/?[^>]+(>|$)/g, ""),
                requirements: [], 
                skills_required: [], 
                posted_at: job.created,
                source: 'adzuna',
                remote: !!job.location.area.find((a: string) => a.toLowerCase().includes('remote')),
                job_type: job.contract_time === 'full_time' ? 'full-time' : 'part-time',
            }))

            return {
                results,
                count: data.count
            }
        } catch (error) {
            console.error('Error fetching jobs from Edge Function:', error)
            throw error
        }
    }
}

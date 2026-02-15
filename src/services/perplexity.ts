import { supabase } from "../lib/supabase";

export const perplexityService = {
    async researchCompany(
        companyName: string,
        context?: string,
    ): Promise<{ content: string }> {
        try {
            const { data, error } = await supabase.functions.invoke(
                "research-company",
                {
                    body: { companyName, context },
                },
            );

            if (error) throw error;
            if (data.error) throw new Error(data.error);

            return data;
        } catch (error: any) {
            console.error("Deep research failed:", error);
            throw error;
        }
    },
};

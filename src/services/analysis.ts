import { supabase } from "../lib/supabase";

export interface AnalysisResult {
    analysis: {
        recommended_roles: string[];
        skill_gaps: string[];
        strengths: string[];
        readiness_score: number;
    };
    marketInsights: string;
}

export const analysisService = {
    async analyzeResume(
        resumeText: string,
        currentRole?: string,
    ): Promise<AnalysisResult> {
        try {
            const { data, error } = await supabase.functions.invoke(
                "analyze-resume",
                {
                    body: { resumeText, currentRole },
                },
            );

            if (error) throw error;
            if (data.error) throw new Error(data.error);

            return data;
        } catch (error: any) {
            console.error("Resume Analysis failed:", error);
            throw error;
        }
    },
};

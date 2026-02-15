import { create } from "zustand";
import { supabase } from "../lib/supabase";
import type { CareerItem, ResumeAnalysis } from "../types";

interface CareerState {
    items: CareerItem[];
    isLoading: boolean;

    // Actions
    setItems: (items: CareerItem[]) => void;
    fetchItems: (userId: string) => Promise<void>;
    addItem: (
        item: Omit<CareerItem, "id" | "created_at" | "updated_at">,
    ) => Promise<CareerItem | null>;
    updateItemStatus: (
        id: string,
        status: CareerItem["status"],
    ) => Promise<void>;
    deleteItem: (id: string) => Promise<void>;

    // Analysis State
    analyses: ResumeAnalysis[];
    fetchAnalyses: (userId: string) => Promise<void>;
    addAnalysis: (
        analysis: Omit<ResumeAnalysis, "id"> & { id?: string },
    ) => Promise<void>;
}

export const useCareerStore = create<CareerState>((set, get) => ({
    items: [],
    isLoading: false,

    setItems: (items) => set({ items }),
    // ... (skipped lines are handled by view/context but replace needs exact context or care. I'll just target the specific blocks)

    fetchItems: async (userId) => {
        set({ isLoading: true });
        try {
            const { data, error } = await supabase
                .from("career_items")
                .select("*")
                .eq("user_id", userId)
                .order("created_at", { ascending: false });

            if (error) throw error;
            if (data) set({ items: data as CareerItem[] });
        } catch (error) {
            console.error("Error fetching career items:", error);
        } finally {
            set({ isLoading: false });
        }
    },

    addItem: async (item) => {
        try {
            const { data, error } = await supabase
                .from("career_items")
                .insert([item])
                .select()
                .single();

            if (error) throw error;
            if (data) {
                const newItem = data as CareerItem;
                set((state) => ({ items: [newItem, ...state.items] }));
                return newItem;
            }
        } catch (error) {
            console.error("Error adding career item:", error);
        }
        return null;
    },

    updateItemStatus: async (id, status) => {
        try {
            // Optimistic update
            set((state) => ({
                items: state.items.map((i) =>
                    i.id === id ? { ...i, status } : i
                ),
            }));

            const { error } = await supabase
                .from("career_items")
                .update({ status })
                .eq("id", id);

            if (error) throw error;
        } catch (error) {
            console.error("Error updating status:", error);
            // Rollback could be implemented here if needed
        }
    },

    deleteItem: async (id) => {
        try {
            // Optimistic update
            set((state) => ({
                items: state.items.filter((i) => i.id !== id),
            }));

            const { error } = await supabase
                .from("career_items")
                .delete()
                .eq("id", id);

            if (error) throw error;
        } catch (error) {
            console.error("Error deleting item:", error);
            // Rollback if needed
        }
    },

    // Analysis Actions
    analyses: [],

    fetchAnalyses: async (userId) => {
        try {
            const { data, error } = await supabase
                .from("resume_analyses")
                .select("*")
                .eq("user_id", userId)
                .order("created_at", { ascending: false })
                .limit(5);

            if (error) throw error;
            if (data) set({ analyses: data as ResumeAnalysis[] });
        } catch (error) {
            console.error("Error fetching analyses:", error);
        }
    },

    addAnalysis: async (analysis) => {
        try {
            // Remove ID if it's a temp/placeholder, let DB generate it
            const { id, ...analysisData } = analysis;

            const { data, error } = await supabase
                .from("resume_analyses")
                .insert([analysisData])
                .select()
                .single();

            if (error) throw error;

            if (data) {
                set((state) => ({
                    analyses: [data as ResumeAnalysis, ...state.analyses],
                }));
            }
        } catch (error) {
            console.error("Error saving analysis:", error);
            // Fallback to local state update if DB fails
            const fallbackAnalysis = {
                ...analysis,
                id: analysis.id || crypto.randomUUID(),
            } as ResumeAnalysis;
            set((state) => ({
                analyses: [fallbackAnalysis, ...state.analyses],
            }));
        }
    },
}));

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserProfile, JobPreferences, SavedJob, ParsedResume } from '../types'
import { supabase } from '../lib/supabase'

interface UserState {
    // User data
    profile: UserProfile | null
    preferences: JobPreferences | null
    isAuthenticated: boolean
    isLoading: boolean

    // Actions
    setProfile: (profile: UserProfile | null) => void
    setPreferences: (preferences: JobPreferences | null) => void
    setAuthenticated: (status: boolean) => void
    setLoading: (status: boolean) => void
    fetchUserData: (userId: string) => Promise<void>
    updateProfile: (profile: Partial<UserProfile>) => Promise<void>
    updatePreferences: (preferences: Partial<JobPreferences>) => Promise<void>
    logout: () => void
}

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            profile: null,
            preferences: null,
            isAuthenticated: false,
            isLoading: false,

            setProfile: (profile) => set({ profile }),
            setPreferences: (preferences) => set({ preferences }),
            setAuthenticated: (status) => set({ isAuthenticated: status }),
            setLoading: (status) => set({ isLoading: status }),

            fetchUserData: async (userId) => {
                set({ isLoading: true })
                try {
                    const [profileRes, prefRes] = await Promise.all([
                        supabase.from('user_profiles').select('*').eq('id', userId).maybeSingle(),
                        supabase.from('job_preferences').select('*').eq('user_id', userId).maybeSingle()
                    ])

                    if (profileRes.data) set({ profile: profileRes.data })
                    if (prefRes.data) set({ preferences: prefRes.data })
                } catch (error) {
                    console.error('Error fetching user data:', error)
                } finally {
                    set({ isLoading: false })
                }
            },

            updateProfile: async (updatedFields) => {
                const { profile } = useUserStore.getState()
                if (!profile) return

                const { data, error } = await supabase
                    .from('user_profiles')
                    .update(updatedFields)
                    .eq('id', profile.id)
                    .select()
                    .single()

                if (error) throw error
                if (data) set({ profile: data })
            },

            updatePreferences: async (updatedFields) => {
                const { profile, preferences } = useUserStore.getState()
                if (!profile) return

                const { data, error } = await supabase
                    .from('job_preferences')
                    .upsert({
                        ...preferences,
                        ...updatedFields,
                        user_id: profile.id
                    }, { onConflict: 'user_id' })
                    .select()
                    .single()

                if (error) throw error
                if (data) set({ preferences: data })
            },

            logout: async () => {
                await supabase.auth.signOut()
                set({ profile: null, preferences: null, isAuthenticated: false })
                localStorage.removeItem('job-hunter-user')
            },
        }),
        {
            name: 'job-hunter-user',
            partialize: (state) => ({
                profile: state.profile,
                preferences: state.preferences,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
)

interface JobsState {
    // Job data
    savedJobs: SavedJob[]
    searchResults: SavedJob[]
    isSearching: boolean

    // Actions
    setSavedJobs: (jobs: SavedJob[]) => void
    addSavedJob: (job: SavedJob) => void
    removeSavedJob: (jobId: string) => void
    updateJobStatus: (jobId: string, status: SavedJob['status']) => void
    updateJob: (job: SavedJob) => void
    setSearchResults: (jobs: SavedJob[]) => void
    setSearching: (status: boolean) => void
}

export const useJobsStore = create<JobsState>()(
    persist(
        (set) => ({
            savedJobs: [],
            searchResults: [],
            isSearching: false,

            setSavedJobs: (jobs) => set({ savedJobs: jobs }),
            addSavedJob: (job) => set((state) => ({
                savedJobs: [...state.savedJobs, job]
            })),
            removeSavedJob: (jobId) => set((state) => ({
                savedJobs: state.savedJobs.filter((j) => j.id !== jobId)
            })),
            updateJobStatus: (jobId, status) => set((state) => ({
                savedJobs: state.savedJobs.map((j) =>
                    j.id === jobId ? { ...j, status } : j
                )
            })),
            updateJob: (job) => set((state) => ({
                savedJobs: state.savedJobs.map((j) =>
                    j.id === job.id ? job : j
                )
            })),
            setSearchResults: (jobs) => set({ searchResults: jobs }),
            setSearching: (status) => set({ isSearching: status }),
        }),
        { name: 'job-hunter-jobs' }
    )
)

interface ResumeState {
    // Resume data
    resumes: ParsedResume[]
    primaryResume: ParsedResume | null
    isUploading: boolean

    // Actions
    setResumes: (resumes: ParsedResume[]) => void
    addResume: (resume: ParsedResume) => void
    setPrimaryResume: (resumeId: string) => void
    setUploading: (status: boolean) => void
}

export const useResumeStore = create<ResumeState>()(
    persist(
        (set) => ({
            resumes: [],
            primaryResume: null,
            isUploading: false,

            setResumes: (resumes) => set({
                resumes,
                primaryResume: resumes.find((r) => r.is_primary) || resumes[0] || null
            }),
            addResume: (resume) => set((state) => ({
                resumes: [...state.resumes, resume],
                primaryResume: resume.is_primary ? resume : state.primaryResume
            })),
            setPrimaryResume: (resumeId) => set((state) => ({
                resumes: state.resumes.map((r) => ({
                    ...r,
                    is_primary: r.id === resumeId
                })),
                primaryResume: state.resumes.find((r) => r.id === resumeId) || state.primaryResume
            })),
            setUploading: (status) => set({ isUploading: status }),
        }),
        { name: 'job-hunter-resumes' }
    )
)

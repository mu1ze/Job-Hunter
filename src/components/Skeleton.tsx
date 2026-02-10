import { Card } from './ui'

/**
 * Skeleton loading component for job cards
 */
export function JobCardSkeleton() {
    return (
        <Card className="animate-pulse">
            <div className="flex items-start gap-4">
                {/* Company Logo Skeleton */}
                <div className="w-12 h-12 rounded-xl bg-surface-700/50" />

                <div className="flex-1 space-y-3">
                    {/* Title and Company */}
                    <div className="space-y-2">
                        <div className="h-6 bg-surface-700/50 rounded w-3/4" />
                        <div className="h-4 bg-surface-700/50 rounded w-1/2" />
                    </div>

                    {/* Meta Info */}
                    <div className="flex gap-3">
                        <div className="h-4 bg-surface-700/50 rounded w-24" />
                        <div className="h-4 bg-surface-700/50 rounded w-20" />
                        <div className="h-4 bg-surface-700/50 rounded w-16" />
                    </div>

                    {/* Skills */}
                    <div className="flex gap-2">
                        <div className="h-6 bg-surface-700/50 rounded w-16" />
                        <div className="h-6 bg-surface-700/50 rounded w-20" />
                        <div className="h-6 bg-surface-700/50 rounded w-14" />
                        <div className="h-6 bg-surface-700/50 rounded w-18" />
                    </div>
                </div>

                {/* Bookmark Button Skeleton */}
                <div className="w-10 h-10 rounded-lg bg-surface-700/50" />
            </div>
        </Card>
    )
}

/**
 * Skeleton loading for job detail panel
 */
export function JobDetailSkeleton() {
    return (
        <Card className="animate-pulse">
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                        <div className="h-7 bg-surface-700/50 rounded w-3/4" />
                        <div className="h-5 bg-surface-700/50 rounded w-1/2" />
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-surface-700/50" />
                </div>

                {/* Meta Info */}
                <div className="space-y-2">
                    <div className="h-4 bg-surface-700/50 rounded w-full" />
                    <div className="h-4 bg-surface-700/50 rounded w-2/3" />
                </div>

                {/* Divider */}
                <div className="h-px bg-surface-700/50" />

                {/* Description */}
                <div className="space-y-2">
                    <div className="h-4 bg-surface-700/50 rounded w-full" />
                    <div className="h-4 bg-surface-700/50 rounded w-full" />
                    <div className="h-4 bg-surface-700/50 rounded w-5/6" />
                    <div className="h-4 bg-surface-700/50 rounded w-full" />
                    <div className="h-4 bg-surface-700/50 rounded w-4/5" />
                </div>

                {/* Buttons */}
                <div className="flex gap-2 mt-6">
                    <div className="h-10 bg-surface-700/50 rounded-xl flex-1" />
                    <div className="h-10 bg-surface-700/50 rounded-xl flex-1" />
                </div>
            </div>
        </Card>
    )
}

/**
 * Skeleton for resume cards
 */
export function ResumeCardSkeleton() {
    return (
        <Card className="animate-pulse">
            <div className="flex items-center gap-4">
                {/* Icon */}
                <div className="w-12 h-12 rounded-lg bg-surface-700/50" />

                <div className="flex-1 space-y-2">
                    <div className="h-5 bg-surface-700/50 rounded w-3/4" />
                    <div className="h-4 bg-surface-700/50 rounded w-1/2" />
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-lg bg-surface-700/50" />
                    <div className="w-8 h-8 rounded-lg bg-surface-700/50" />
                </div>
            </div>
        </Card>
    )
}

/**
 * Multi-skeleton loader for lists
 */
export function SkeletonList({ count = 3, type = 'job' }: { count?: number; type?: 'job' | 'resume' | 'detail' }) {
    const SkeletonComponent = type === 'job' ? JobCardSkeleton : type === 'resume' ? ResumeCardSkeleton : JobDetailSkeleton

    return (
        <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonComponent key={i} />
            ))}
        </div>
    )
}

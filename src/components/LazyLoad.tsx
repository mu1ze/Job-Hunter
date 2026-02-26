import { lazy, Suspense } from 'react'

export function lazyWithLoading<T extends React.ComponentType<any>>(
    importFn: () => Promise<{ default: T }>,
    fallback?: React.ReactNode
) {
    const LazyComponent = lazy(importFn)
    
    return (props: any) => (
        <Suspense fallback={fallback || <LoadingSkeleton />}>
            <LazyComponent {...props} />
        </Suspense>
    )
}

function LoadingSkeleton() {
    return (
        <div className="animate-pulse space-y-4 p-4">
            <div className="h-4 bg-white/10 rounded w-3/4" />
            <div className="h-4 bg-white/10 rounded w-1/2" />
            <div className="h-4 bg-white/10 rounded w-5/6" />
        </div>
    )
}

export default LoadingSkeleton

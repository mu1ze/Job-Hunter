import { Link } from 'react-router-dom'
import Button from './Button'

interface EmptyStateProps {
    icon?: React.ReactNode
    title: string
    description: string
    action?: {
        label: string
        onClick?: () => void
        href?: string
    }
    secondaryAction?: {
        label: string
        onClick?: () => void
        href?: string
    }
}

export function EmptyState({ icon, title, description, action, secondaryAction }: EmptyStateProps) {
    const content = (
        <div className="flex flex-col items-center justify-center text-center py-12 px-4">
            {icon && (
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 border border-white/10">
                    {icon}
                </div>
            )}
            <h3 className="text-xl font-medium text-white mb-3">{title}</h3>
            <p className="text-white/50 max-w-sm mb-6 leading-relaxed">{description}</p>
            
            <div className="flex flex-col sm:flex-row gap-3">
                {action && (
                    action.href ? (
                        <Link to={action.href}>
                            <Button className="rounded-full w-full sm:w-auto">
                                {action.label}
                            </Button>
                        </Link>
                    ) : (
                        <Button onClick={action.onClick} className="rounded-full w-full sm:w-auto">
                            {action.label}
                        </Button>
                    )
                )}
                {secondaryAction && (
                    secondaryAction.href ? (
                        <Link to={secondaryAction.href}>
                            <Button variant="outline" className="rounded-full w-full sm:w-auto">
                                {secondaryAction.label}
                            </Button>
                        </Link>
                    ) : (
                        <Button variant="outline" onClick={secondaryAction.onClick} className="rounded-full w-full sm:w-auto">
                            {secondaryAction.label}
                        </Button>
                    )
                )}
            </div>
        </div>
    )

    return content
}

interface EmptyColumnProps {
    title: string
    description?: string
    icon?: React.ReactNode
}

export function EmptyColumn({ title, description, icon }: EmptyColumnProps) {
    return (
        <div className="flex-1 min-h-[200px] flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-white/10 bg-white/5">
            {icon && (
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4 text-white/30">
                    {icon}
                </div>
            )}
            <h4 className="text-white/60 font-medium mb-1">{title}</h4>
            {description && (
                <p className="text-white/40 text-sm">{description}</p>
            )}
        </div>
    )
}

interface NoResultsProps {
    title?: string
    description?: string
    onClearFilters?: () => void
}

export function NoResults({ 
    title = "No jobs found", 
    description = "Try adjusting your search filters or expanding your search criteria.",
    onClearFilters 
}: NoResultsProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-6 border border-white/10">
                <svg className="w-10 h-10 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>
            <h3 className="text-xl font-medium text-white mb-2">{title}</h3>
            <p className="text-white/50 max-w-md text-center mb-6">{description}</p>
            {onClearFilters && (
                <Button variant="outline" onClick={onClearFilters} className="rounded-full">
                    Clear Filters
                </Button>
            )}
        </div>
    )
}

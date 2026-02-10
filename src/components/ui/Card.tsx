interface CardProps {
    children: React.ReactNode
    className?: string
    hover?: boolean
    glow?: boolean
    onClick?: () => void
}

export default function Card({ children, className = '', hover = false, glow = false, onClick }: CardProps) {
    return (
        <div
            onClick={onClick}
            className={`
        glass rounded-2xl p-6
        ${hover ? 'hover:bg-surface-800/80 hover:border-primary-500/30 transition-all duration-300 cursor-pointer' : ''}
        ${glow ? 'animate-glow' : ''}
        ${className}
      `}
        >
            {children}
        </div>
    )
}

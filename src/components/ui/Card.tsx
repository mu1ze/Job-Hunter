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
        glass rounded-3xl p-6
        ${hover ? 'hover:bg-white/10 hover:border-white/20 hover:scale-[1.01] hover:shadow-lg hover:shadow-white/5 transition-all duration-300 cursor-pointer' : ''}
        ${glow ? 'animate-glow' : ''}
        ${className}
      `}
        >
            {children}
        </div>
    )
}

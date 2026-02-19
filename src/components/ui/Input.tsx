import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    icon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className = '', label, error, icon, id, ...props }, ref) => {
        const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-white/70 mb-2"
                    >
                        {label}
                    </label>
                )}
                <div className="relative">
                    {icon && (
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/50">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        id={inputId}
                        className={`
              w-full px-4 py-3 rounded-2xl
              bg-white/5 border border-white/10
              text-white placeholder-white/30
              focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30
              transition-all duration-300
              ${icon ? 'pl-11' : ''}
              ${error ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/50 bg-red-500/5' : ''}
              ${className}
            `}
                        {...props}
                    />
                </div>
                {error && (
                    <p className="mt-1.5 text-sm text-red-400">{error}</p>
                )}
            </div>
        )
    }
)

Input.displayName = 'Input'

export default Input

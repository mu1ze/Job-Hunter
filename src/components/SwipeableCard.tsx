import { useState, useRef } from 'react'
import { Bookmark, X, ChevronRight } from 'lucide-react'

interface SwipeableCardProps {
    children: React.ReactNode
    onSwipeLeft?: () => void
    onSwipeRight?: () => void
    leftLabel?: string
    rightLabel?: string
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
    enabled?: boolean
}

export default function SwipeableCard({
    children,
    onSwipeLeft,
    onSwipeRight,
    leftLabel = 'Dismiss',
    rightLabel = 'Save',
    leftIcon,
    rightIcon,
    enabled = true
}: SwipeableCardProps) {
    const [isDragging, setIsDragging] = useState(false)
    const [startX, setStartX] = useState(0)
    const [translateX, setTranslateX] = useState(0)
    const cardRef = useRef<HTMLDivElement>(null)

    if (!enabled) {
        return <>{children}</>
    }

    const handleTouchStart = (e: React.TouchEvent) => {
        setIsDragging(true)
        setStartX(e.touches[0].clientX)
    }

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return
        const currentX = e.touches[0].clientX
        const diff = currentX - startX
        setTranslateX(diff)
    }

    const handleTouchEnd = () => {
        if (!isDragging) return
        setIsDragging(false)

        const threshold = 100

        if (translateX > threshold && onSwipeRight) {
            onSwipeRight()
        } else if (translateX < -threshold && onSwipeLeft) {
            onSwipeLeft()
        }

        setTranslateX(0)
    }

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true)
        setStartX(e.clientX)
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return
        const diff = e.clientX - startX
        setTranslateX(diff)
    }

    const handleMouseUp = () => {
        if (!isDragging) return
        setIsDragging(false)

        const threshold = 100

        if (translateX > threshold && onSwipeRight) {
            onSwipeRight()
        } else if (translateX < -threshold && onSwipeLeft) {
            onSwipeLeft()
        }

        setTranslateX(0)
    }

    const handleMouseLeave = () => {
        if (isDragging) {
            setIsDragging(false)
            setTranslateX(0)
        }
    }

    const opacity = Math.min(Math.abs(translateX) / 150, 1)
    const showLeftAction = translateX < 0
    const showRightAction = translateX > 0

    return (
        <div className="relative group overflow-hidden">
            {/* Left Action (Save) */}
            <div
                className={`
                    absolute inset-y-0 left-0 flex items-center pl-4 pr-8 transition-all duration-200
                    ${showRightAction ? 'opacity-100' : 'opacity-0'}
                `}
                style={{ opacity: showRightAction ? opacity : 0 }}
            >
                <div className="bg-green-500/20 text-green-400 rounded-xl p-3 flex flex-col items-center gap-1">
                    {rightIcon || <Bookmark className="w-5 h-5" />}
                    <span className="text-xs font-medium">{rightLabel}</span>
                </div>
            </div>

            {/* Right Action (Dismiss) */}
            <div
                className={`
                    absolute inset-y-0 right-0 flex items-center pr-4 pl-8 transition-all duration-200
                    ${showLeftAction ? 'opacity-100' : 'opacity-0'}
                `}
                style={{ opacity: showLeftAction ? opacity : 0 }}
            >
                <div className="bg-red-500/20 text-red-400 rounded-xl p-3 flex flex-col items-center gap-1">
                    {leftIcon || <X className="w-5 h-5" />}
                    <span className="text-xs font-medium">{leftLabel}</span>
                </div>
            </div>

            {/* Card */}
            <div
                ref={cardRef}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                className="touch-pan-y cursor-grab active:cursor-grabbing"
                style={{
                    transform: `translateX(${translateX}px)`,
                    transition: isDragging ? 'none' : 'transform 0.2s ease-out'
                }}
            >
                {children}
            </div>
        </div>
    )
}

export function SwipeHint() {
    const [dismissed, setDismissed] = useState(false)

    if (dismissed) return null

    return (
        <div className="lg:hidden flex items-center justify-center gap-2 py-3 px-4 mb-4 rounded-xl bg-white/5 border border-white/10 text-white/50 text-sm">
            <ChevronRight className="w-4 h-4" />
            <span>Swipe right to save, left to dismiss</span>
            <button
                onClick={() => setDismissed(true)}
                className="ml-2 p-1 hover:bg-white/10 rounded"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    )
}

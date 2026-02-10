import { useEffect } from 'react'

/**
 * Keyboard shortcuts hook for power users
 */

export interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  shiftKey?: boolean
  metaKey?: boolean
  callback: () => void
  description: string
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled = true) {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase()
        const ctrlMatches = shortcut.ctrlKey ? event.ctrlKey : true
        const shiftMatches = shortcut.shiftKey ? event.shiftKey : true
        const metaMatches = shortcut.metaKey ? event.metaKey : true

        if (keyMatches && ctrlMatches && shiftMatches && metaMatches) {
          // Prevent conflicts with browser shortcuts
          if (shortcut.ctrlKey || shortcut.metaKey) {
            event.preventDefault()
          }
          shortcut.callback()
          break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts, enabled])
}

/**
 * Pre-configured keyboard shortcuts for common actions
 */
export const commonShortcuts = {
  search: (callback: () => void): KeyboardShortcut => ({
    key: 'k',
    metaKey: true,
    callback,
    description: 'Quick search (⌘K or Ctrl+K)',
  }),
  
  save: (callback: () => void): KeyboardShortcut => ({
    key: 's',
    metaKey: true,
    callback,
    description: 'Save current item (⌘S or Ctrl+S)',
  }),
  
  escape: (callback: () => void): KeyboardShortcut => ({
    key: 'Escape',
    callback,
    description: 'Close modal/panel (Esc)',
  }),
  
  refresh: (callback: () => void): KeyboardShortcut => ({
    key: 'r',
    metaKey: true,
    callback,
    description: 'Refresh data (⌘R or Ctrl+R)',
  }),
}

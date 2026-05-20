import { useEffect, useCallback } from 'react'

type ModifierKey = 'ctrl' | 'meta' | 'shift' | 'alt'

interface ShortcutOptions {
  key: string
  modifiers?: ModifierKey[]
  /** Skip if focus is inside an input/textarea/select */
  ignoreWhenEditing?: boolean
  enabled?: boolean
}

export function useKeyboardShortcut(
  options: ShortcutOptions,
  handler: (e: KeyboardEvent) => void,
) {
  const { key, modifiers = [], ignoreWhenEditing = true, enabled = true } = options

  const stableHandler = useCallback(handler, [handler])

  useEffect(() => {
    if (!enabled) return

    const listener = (e: KeyboardEvent) => {
      if (ignoreWhenEditing) {
        const tag = (e.target as HTMLElement).tagName
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return
        if ((e.target as HTMLElement).isContentEditable) return
      }

      const keyMatch = e.key.toLowerCase() === key.toLowerCase()
      const ctrlMatch = modifiers.includes('ctrl') ? e.ctrlKey : !e.ctrlKey
      const metaMatch = modifiers.includes('meta') ? e.metaKey : !e.metaKey
      const shiftMatch = modifiers.includes('shift') ? e.shiftKey : !e.shiftKey
      const altMatch = modifiers.includes('alt') ? e.altKey : !e.altKey

      if (keyMatch && ctrlMatch && metaMatch && shiftMatch && altMatch) {
        e.preventDefault()
        stableHandler(e)
      }
    }

    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [key, modifiers, ignoreWhenEditing, enabled, stableHandler])
}

/** Register multiple shortcuts at once using a key→handler map */
export function useKeyboardShortcuts(
  shortcuts: Array<ShortcutOptions & { handler: (e: KeyboardEvent) => void }>,
) {
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      for (const s of shortcuts) {
        if (s.enabled === false) continue
        if (s.ignoreWhenEditing !== false) {
          const tag = (e.target as HTMLElement).tagName
          if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) continue
          if ((e.target as HTMLElement).isContentEditable) continue
        }

        const keyMatch = e.key.toLowerCase() === s.key.toLowerCase()
        const mods = s.modifiers ?? []
        const ctrlMatch = mods.includes('ctrl') ? e.ctrlKey : !e.ctrlKey
        const metaMatch = mods.includes('meta') ? e.metaKey : !e.metaKey
        const shiftMatch = mods.includes('shift') ? e.shiftKey : !e.shiftKey
        const altMatch = mods.includes('alt') ? e.altKey : !e.altKey

        if (keyMatch && ctrlMatch && metaMatch && shiftMatch && altMatch) {
          e.preventDefault()
          s.handler(e)
          break
        }
      }
    }

    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [shortcuts])
}

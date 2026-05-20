import { useCallback } from 'react'
import type { ChangeEvent } from 'react'

/**
 * Returns an onChange handler that auto-formats US phone numbers as the user
 * types: (555) 867-5309
 */
export function usePhoneFormat(onChange: (value: string) => void) {
  return useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const digits = e.target.value.replace(/\D/g, '').slice(0, 10)
      let formatted = digits
      if (digits.length > 6) {
        formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
      } else if (digits.length > 3) {
        formatted = `(${digits.slice(0, 3)}) ${digits.slice(3)}`
      } else if (digits.length > 0) {
        formatted = `(${digits}`
      }
      onChange(formatted)
    },
    [onChange],
  )
}

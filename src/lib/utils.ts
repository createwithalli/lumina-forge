/**
 * Lightweight className utility for LuminaForge.
 * Pure implementation so the design system works even if optional deps are missing.
 */
export function cn(...inputs: (string | undefined | null | false | 0 | Record<string, boolean>)[]): string {
  const classes: string[] = []
  for (const input of inputs) {
    if (!input) continue
    if (typeof input === 'string') {
      classes.push(input)
    } else if (typeof input === 'object') {
      for (const [key, value] of Object.entries(input)) {
        if (value) classes.push(key)
      }
    }
  }
  return classes.join(' ').replace(/\s+/g, ' ').trim()
}

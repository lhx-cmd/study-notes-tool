export function isHttpUrl(input: string | undefined | null): boolean {
  if (!input) {
    return false
  }

  const value = input.trim()
  if (!value) {
    return false
  }

  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function toNavigableUrl(input: string): string {
  return input.trim()
}
